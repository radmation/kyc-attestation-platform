package main

import (
    "encoding/json"
    "fmt"
    "strings"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// PermissionLevel represents different levels of permission scope
type PermissionLevel string

const (
    PermissionLevelGlobal    PermissionLevel = "global"
    PermissionLevelClient    PermissionLevel = "client"
    PermissionLevelWallet    PermissionLevel = "wallet"
)

// GatekeeperPermission represents a specific permission for gatekeeper operations
type GatekeeperPermission string

const (
    // Platform-level permissions
    PermissionPauseGlobal   GatekeeperPermission = "gatekeeper:pause_global"
    PermissionUnpauseGlobal GatekeeperPermission = "gatekeeper:unpause_global"

    // Regulatory-level permissions  
    PermissionPauseClient         GatekeeperPermission = "gatekeeper:pause_client"
    PermissionUnpauseClient       GatekeeperPermission = "gatekeeper:unpause_client"
    PermissionPauseWalletDirect   GatekeeperPermission = "gatekeeper:pause_wallet_direct"
    PermissionUnpauseWalletDirect GatekeeperPermission = "gatekeeper:unpause_wallet_direct"

    // Client-scoped permissions
    PermissionPauseWalletScoped   GatekeeperPermission = "gatekeeper:pause_wallet_scoped"
    PermissionUnpauseWalletScoped GatekeeperPermission = "gatekeeper:unpause_wallet_scoped"

    // Read permissions
    PermissionViewPauseState       GatekeeperPermission = "gatekeeper:view_pause_state"
    PermissionViewComplianceGlobal GatekeeperPermission = "gatekeeper:view_compliance_global"
    PermissionViewComplianceClient GatekeeperPermission = "gatekeeper:view_compliance_client"

    // Administrative permissions
    PermissionManagePermissions GatekeeperPermission = "gatekeeper:manage_permissions"
)

// AuthorizationContext contains user and client information for authorization checks
type AuthorizationContext struct {
    UserID      string
    ClientID    string
    Permissions []string
    Roles       []string
}

// getAuthorizationContext extracts user permissions and roles from client identity
func getAuthorizationContext(ctx contractapi.TransactionContextInterface) (*AuthorizationContext, error) {
    clientIdentity := ctx.GetClientIdentity()

    // Get user ID
    userID, err := clientIdentity.GetID()
    if err != nil {
        return nil, fmt.Errorf("failed to get user ID: %v", err)
    }

    // Get client ID (organization)
    clientID, found, err := clientIdentity.GetAttributeValue("clientId")
    if err != nil {
        return nil, fmt.Errorf("failed to get client ID: %v", err)
    }
    if !found {
        clientID = "" // Global user (platform admin)
    }

    // Get permissions from identity attributes
    permissionsAttr, found, err := clientIdentity.GetAttributeValue("permissions")
    if err != nil {
        return nil, fmt.Errorf("failed to get permissions: %v", err)
    }
    
    var permissions []string
    if found && permissionsAttr != "" {
        permissions = strings.Split(permissionsAttr, ",")
        // Clean up permission strings
        for i, perm := range permissions {
            permissions[i] = strings.TrimSpace(perm)
        }
    }

    // Get roles from identity attributes  
    rolesAttr, found, err := clientIdentity.GetAttributeValue("roles")
    if err != nil {
        return nil, fmt.Errorf("failed to get roles: %v", err)
    }
    
    var roles []string
    if found && rolesAttr != "" {
        roles = strings.Split(rolesAttr, ",")
        // Clean up role strings
        for i, role := range roles {
            roles[i] = strings.TrimSpace(role)
        }
    }

    return &AuthorizationContext{
        UserID:      userID,
        ClientID:    clientID,
        Permissions: permissions,
        Roles:       roles,
    }, nil
}

// hasPermission checks if the user has a specific permission
func (ac *AuthorizationContext) hasPermission(permission GatekeeperPermission) bool {
    permissionStr := string(permission)
    
    for _, userPerm := range ac.Permissions {
        if userPerm == permissionStr {
            return true
        }
        // Check for wildcard permissions (e.g., "gatekeeper:*")
        if strings.HasSuffix(userPerm, ":*") {
            prefix := strings.TrimSuffix(userPerm, "*")
            if strings.HasPrefix(permissionStr, prefix) {
                return true
            }
        }
    }
    return false
}

// hasRole checks if the user has a specific role
func (ac *AuthorizationContext) hasRole(role string) bool {
    for _, userRole := range ac.Roles {
        if userRole == role {
            return true
        }
    }
    return false
}

// isGlobalAdmin checks if user has global administrative privileges
func (ac *AuthorizationContext) isGlobalAdmin() bool {
    return ac.hasRole("PLATFORM_ADMIN") || ac.hasRole("SUPER_ADMIN")
}

// isRegulatoryAdmin checks if user has regulatory enforcement privileges
func (ac *AuthorizationContext) isRegulatoryAdmin() bool {
    return ac.hasRole("REGULATORY_ADMIN") || ac.hasRole("TREASURY_AGENT") || 
           ac.hasRole("COURT_ORDER_EXECUTOR") || ac.isGlobalAdmin()
}

// checkPermission validates that the user has the required permission
func (s *GatekeeperContract) checkPermission(ctx contractapi.TransactionContextInterface, 
    required GatekeeperPermission, additionalChecks ...func(*AuthorizationContext) error) error {
    
    authCtx, err := getAuthorizationContext(ctx)
    if err != nil {
        return fmt.Errorf("authorization failed: %v", err)
    }

    // Check if user has the required permission
    if !authCtx.hasPermission(required) {
        return fmt.Errorf("access denied: %s permission required (user: %s)", 
            string(required), authCtx.UserID)
    }

    // Run additional authorization checks
    for _, check := range additionalChecks {
        if err := check(authCtx); err != nil {
            return err
        }
    }

    return nil
}

// validateClientScope ensures user can only act on their own client's resources
func validateClientScope(targetClientID string) func(*AuthorizationContext) error {
    return func(authCtx *AuthorizationContext) error {
        // Global admins can act on any client
        if authCtx.isGlobalAdmin() || authCtx.isRegulatoryAdmin() {
            return nil
        }

        // Regular users can only act on their own client
        if authCtx.ClientID == "" {
            return fmt.Errorf("client scope required but user has no client association")
        }

        if authCtx.ClientID != targetClientID {
            return fmt.Errorf("access denied: can only act on own client resources (user client: %s, target client: %s)", 
                authCtx.ClientID, targetClientID)
        }

        return nil
    }
}

// validateWalletOwnership ensures wallet belongs to the user's client before allowing scoped operations
func (s *GatekeeperContract) validateWalletOwnership(ctx contractapi.TransactionContextInterface, 
    walletAddress string, authCtx *AuthorizationContext) error {
    
    // Global admins and regulatory authorities bypass ownership checks
    if authCtx.isGlobalAdmin() || authCtx.isRegulatoryAdmin() {
        return nil
    }

    // For client-scoped operations, verify wallet belongs to user's client
    if authCtx.ClientID == "" {
        return fmt.Errorf("client association required for wallet ownership validation")
    }

    // Query KYC attestation chaincode to verify wallet ownership
    response := ctx.GetStub().InvokeChaincode("kycattestation", [][]byte{
        []byte("GetAttestationsByWallet"),
        []byte(walletAddress),
    }, "kycchannel")

    if response.Status != 200 {
        return fmt.Errorf("failed to verify wallet ownership: %s", response.Message)
    }

    // Parse attestations to check client ownership
    var attestations []*Attestation
    if len(response.Payload) > 0 {
        err := json.Unmarshal(response.Payload, &attestations)
        if err != nil {
            return fmt.Errorf("failed to parse attestations: %v", err)
        }
    }

    // Check if any attestation belongs to user's client
    for _, attestation := range attestations {
        // Note: We'd need to add clientId field to attestations or query profile->client relationship
        // For now, this is a placeholder for the ownership validation logic
        if s.attestationBelongsToClient(attestation, authCtx.ClientID) {
            return nil
        }
    }

    return fmt.Errorf("wallet %s does not belong to client %s", walletAddress, authCtx.ClientID)
}

// attestationBelongsToClient checks if an attestation belongs to a specific client
// This is a placeholder - actual implementation would need to query the profile->client relationship
func (s *GatekeeperContract) attestationBelongsToClient(attestation *Attestation, clientID string) bool {
    // TODO: Implement actual client ownership check
    // This would typically involve:
    // 1. Query the profile using attestation.ProfileID
    // 2. Check if profile.ClientID matches the target clientID
    // For now, return false to be safe
    return false
}

// logAuthorizationEvent logs authorization decisions for audit purposes
func (s *GatekeeperContract) logAuthorizationEvent(ctx contractapi.TransactionContextInterface, 
    action string, permission GatekeeperPermission, allowed bool, reason string) error {
    
    authCtx, _ := getAuthorizationContext(ctx)
    
    eventData := map[string]interface{}{
        "action":     action,
        "permission": string(permission),
        "allowed":    allowed,
        "reason":     reason,
        "userID":     authCtx.UserID,
        "clientID":   authCtx.ClientID,
        "timestamp":  time.Now().Format(time.RFC3339),
    }

    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal authorization event: %v", err)
    }

    return ctx.GetStub().SetEvent("AuthorizationEvent", eventPayload)
} 