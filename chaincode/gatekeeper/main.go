package main

import (
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// GatekeeperContract provides functions for compliance checking
type GatekeeperContract struct {
    contractapi.Contract
}

// ComplianceResult represents the result of a compliance check
type ComplianceResult struct {
    Sender         string `json:"sender"`
    Receiver       string `json:"receiver"`
    IsCompliant    bool   `json:"isCompliant"`
    Reason         string `json:"reason,omitempty"`
    CheckedAt      string `json:"checkedAt"`
    SenderValid    bool   `json:"senderValid"`
    ReceiverValid  bool   `json:"receiverValid"`
}

// Attestation represents a KYC attestation (matching kyc-attestation chaincode structure)
type Attestation struct {
    ID          string `json:"id"`
    ProfileID   string `json:"profileId"`
    WalletID    string `json:"walletId"`
    Status      string `json:"status"`
    MetadataURI string `json:"metadataUri"`
    IssuedAt    string `json:"issuedAt"`
    ExpiresAt   string `json:"expiresAt"`
    RevokedAt   string `json:"revokedAt,omitempty"`
    Issuer      string `json:"issuer"`
    CreatedBy   string `json:"createdBy"`
    UpdatedAt   string `json:"updatedAt"`
}

// AttestationStatus represents the possible states of an attestation
type AttestationStatus string

const (
    StatusPending  AttestationStatus = "PENDING"
    StatusActive   AttestationStatus = "ACTIVE"
    StatusExpired  AttestationStatus = "EXPIRED"
    StatusRevoked  AttestationStatus = "REVOKED"
)

// State keys for different pause levels
const (
    GlobalPauseKey       = "global_paused"
    ClientPauseKey       = "client_paused_"       // client_paused_<clientId>
    WalletPauseKey       = "wallet_paused_"       // wallet_paused_<address>
    BlacklistGlobalKey   = "blacklist_global_"    // blacklist_global_<address>
    BlacklistClientKey   = "blacklist_client_"    // blacklist_client_<clientId>_<address>
)

// CheckCompliance verifies that both sender and receiver have valid KYC attestations
func (s *GatekeeperContract) CheckCompliance(ctx contractapi.TransactionContextInterface, senderAddress string, receiverAddress string) (*ComplianceResult, error) {
    // FIRST: Check if either address is blacklisted (critical security check)
    senderBlacklisted, err := s.IsAddressBlacklisted(ctx, senderAddress)
    if err != nil {
        return nil, fmt.Errorf("failed to check sender blacklist status: %v", err)
    }
    
    receiverBlacklisted, err := s.IsAddressBlacklisted(ctx, receiverAddress)
    if err != nil {
        return nil, fmt.Errorf("failed to check receiver blacklist status: %v", err)
    }
    
    // If either address is blacklisted, immediately fail compliance
    if senderBlacklisted || receiverBlacklisted {
        result := &ComplianceResult{
            Sender:        senderAddress,
            Receiver:      receiverAddress,
            IsCompliant:   false,
            Reason:        s.buildBlacklistReason(senderBlacklisted, receiverBlacklisted),
            CheckedAt:     time.Now().Format(time.RFC3339),
            SenderValid:   false,
            ReceiverValid: false,
        }
        
        // Emit compliance check event for blacklisted addresses
        s.emitComplianceCheckEvent(ctx, result)
        return result, nil
    }

    // Check hierarchical pause states
    if paused, reason := s.checkPauseState(ctx, senderAddress, receiverAddress); paused {
        result := &ComplianceResult{
            Sender:      senderAddress,
            Receiver:    receiverAddress,
            IsCompliant: false,
            Reason:      reason,
            CheckedAt:   time.Now().Format(time.RFC3339),
        }
        
        // Emit compliance check event
        s.emitComplianceCheckEvent(ctx, result)
        return result, nil
    }

    // Get current timestamp
    now := time.Now()
    
    // Create result object
    result := &ComplianceResult{
        Sender:    senderAddress,
        Receiver:  receiverAddress,
        CheckedAt: now.Format(time.RFC3339),
    }

    // Check sender attestation
    senderValid, senderReason := s.checkAddressAttestation(ctx, senderAddress)
    result.SenderValid = senderValid

    // Check receiver attestation
    receiverValid, receiverReason := s.checkAddressAttestation(ctx, receiverAddress)
    result.ReceiverValid = receiverValid

    // Determine overall compliance
    if senderValid && receiverValid {
        result.IsCompliant = true
        result.Reason = "Both addresses have valid KYC attestations"
    } else {
        result.IsCompliant = false
        reasons := []string{}
        if !senderValid {
            reasons = append(reasons, fmt.Sprintf("Sender: %s", senderReason))
        }
        if !receiverValid {
            reasons = append(reasons, fmt.Sprintf("Receiver: %s", receiverReason))
        }
        result.Reason = fmt.Sprintf("%v", reasons)
    }

    // Emit compliance check event
    err = s.emitComplianceCheckEvent(ctx, result)
    if err != nil {
        return result, fmt.Errorf("failed to emit compliance check event: %v", err)
    }

    return result, nil
}

// checkAddressAttestation checks if an address has a valid KYC attestation
func (s *GatekeeperContract) checkAddressAttestation(ctx contractapi.TransactionContextInterface, address string) (bool, string) {
    // Query the kyc-attestation chaincode for attestations by wallet
    response := ctx.GetStub().InvokeChaincode("kycattestation", [][]byte{
        []byte("GetAttestationsByWallet"),
        []byte(address),
    }, "mychannel")
    
    if response.Status != 200 {
        return false, fmt.Sprintf("Failed to query KYC attestation: %s", response.Message)
    }

    if len(response.Payload) == 0 {
        return false, "No KYC attestation found"
    }

    // Parse attestations
    var attestations []*Attestation
    err := json.Unmarshal(response.Payload, &attestations)
    if err != nil {
        return false, fmt.Sprintf("Failed to parse attestations: %v", err)
    }

    if len(attestations) == 0 {
        return false, "No KYC attestation found"
    }

    // Check for valid, non-expired, non-revoked attestation
    now := time.Now()
    for _, attestation := range attestations {
        if attestation.Status == string(StatusActive) {
            // Check expiration
            expiresAt, err := time.Parse(time.RFC3339, attestation.ExpiresAt)
            if err != nil {
                continue // Skip invalid date format
            }
            
            if now.Before(expiresAt) {
                return true, "Valid KYC attestation found"
            }
        }
    }

    return false, "No valid (active and non-expired) KYC attestation found"
}

// emitComplianceCheckEvent emits a ComplianceCheckResult event
func (s *GatekeeperContract) emitComplianceCheckEvent(ctx contractapi.TransactionContextInterface, result *ComplianceResult) error {
    eventPayload, err := json.Marshal(result)
    if err != nil {
        return fmt.Errorf("failed to marshal compliance result: %v", err)
    }

    return ctx.GetStub().SetEvent("ComplianceCheckResult", eventPayload)
}

// ========================================
// GLOBAL PAUSE FUNCTIONS (Platform-level)
// ========================================

// PauseGlobal pauses the entire gatekeeper system (platform admin only)
func (s *GatekeeperContract) PauseGlobal(ctx contractapi.TransactionContextInterface) error {
    // Check permission
    err := s.checkPermission(ctx, PermissionPauseGlobal)
    if err != nil {
        s.logAuthorizationEvent(ctx, "PauseGlobal", PermissionPauseGlobal, false, err.Error())
        return err
    }

    // Check if already paused
    isPaused, err := s.isGloballyPaused(ctx)
    if err != nil {
        return fmt.Errorf("failed to check global pause state: %v", err)
    }
    if isPaused {
        return fmt.Errorf("gatekeeper is already globally paused")
    }

    // Set global pause state
    err = ctx.GetStub().PutState(GlobalPauseKey, []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to set global pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "PauseGlobal", PermissionPauseGlobal, true, "Global pause activated")

    // Emit pause event
    return s.emitPauseEvent(ctx, "global", "", "System maintenance - all operations paused")
}

// UnpauseGlobal unpauses the entire gatekeeper system (platform admin only)
func (s *GatekeeperContract) UnpauseGlobal(ctx contractapi.TransactionContextInterface) error {
    // Check permission
    err := s.checkPermission(ctx, PermissionUnpauseGlobal)
    if err != nil {
        s.logAuthorizationEvent(ctx, "UnpauseGlobal", PermissionUnpauseGlobal, false, err.Error())
        return err
    }

    // Check if actually paused
    isPaused, err := s.isGloballyPaused(ctx)
    if err != nil {
        return fmt.Errorf("failed to check global pause state: %v", err)
    }
    if !isPaused {
        return fmt.Errorf("gatekeeper is not globally paused")
    }

    // Remove global pause state
    err = ctx.GetStub().DelState(GlobalPauseKey)
    if err != nil {
        return fmt.Errorf("failed to remove global pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "UnpauseGlobal", PermissionUnpauseGlobal, true, "Global pause deactivated")

    // Emit unpause event
    return s.emitPauseEvent(ctx, "global", "", "System maintenance complete - operations resumed")
}

// ========================================
// CLIENT PAUSE FUNCTIONS (Regulatory-level)
// ========================================

// PauseClient pauses all operations for a specific client organization
func (s *GatekeeperContract) PauseClient(ctx contractapi.TransactionContextInterface, clientId string) error {
    // Check permission
    err := s.checkPermission(ctx, PermissionPauseClient)
    if err != nil {
        s.logAuthorizationEvent(ctx, "PauseClient", PermissionPauseClient, false, err.Error())
        return err
    }

    // Check if client is already paused
    isPaused, err := s.isClientPaused(ctx, clientId)
    if err != nil {
        return fmt.Errorf("failed to check client pause state: %v", err)
    }
    if isPaused {
        return fmt.Errorf("client %s is already paused", clientId)
    }

    // Set client pause state
    err = ctx.GetStub().PutState(ClientPauseKey+clientId, []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to set client pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "PauseClient", PermissionPauseClient, true, 
        fmt.Sprintf("Client %s paused for regulatory compliance", clientId))

    // Emit pause event
    return s.emitPauseEvent(ctx, "client", clientId, "Client operations paused by regulatory authority")
}

// UnpauseClient unpauses operations for a specific client organization
func (s *GatekeeperContract) UnpauseClient(ctx contractapi.TransactionContextInterface, clientId string) error {
    // Check permission
    err := s.checkPermission(ctx, PermissionUnpauseClient)
    if err != nil {
        s.logAuthorizationEvent(ctx, "UnpauseClient", PermissionUnpauseClient, false, err.Error())
        return err
    }

    // Check if client is actually paused
    isPaused, err := s.isClientPaused(ctx, clientId)
    if err != nil {
        return fmt.Errorf("failed to check client pause state: %v", err)
    }
    if !isPaused {
        return fmt.Errorf("client %s is not paused", clientId)
    }

    // Remove client pause state
    err = ctx.GetStub().DelState(ClientPauseKey + clientId)
    if err != nil {
        return fmt.Errorf("failed to remove client pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "UnpauseClient", PermissionUnpauseClient, true, 
        fmt.Sprintf("Client %s unpaused - operations resumed", clientId))

    // Emit unpause event
    return s.emitPauseEvent(ctx, "client", clientId, "Client operations resumed")
}

// GetPauseState returns the current pause states at all levels
func (s *GatekeeperContract) GetPauseState(ctx contractapi.TransactionContextInterface) (map[string]interface{}, error) {
    // Check permission
    err := s.checkPermission(ctx, PermissionViewPauseState)
    if err != nil {
        return nil, err
    }

    // Get global pause state
    globalPaused, err := s.isGloballyPaused(ctx)
    if err != nil {
        globalPaused = false
    }

    // Prepare response
    pauseState := map[string]interface{}{
        "globalPaused":  globalPaused,
        "timestamp":     time.Now().Format(time.RFC3339),
        "queriedBy":     s.getClientID(ctx),
    }

    return pauseState, nil
}

// GetClientPauseState returns pause state for a specific client
func (s *GatekeeperContract) GetClientPauseState(ctx contractapi.TransactionContextInterface, clientId string) (map[string]interface{}, error) {
    // Check permission with client scope validation for non-admins
    authCtx, err := getAuthorizationContext(ctx)
    if err != nil {
        return nil, err
    }

    // Global admins can check any client, others need client scope validation
    if !authCtx.isGlobalAdmin() && !authCtx.isRegulatoryAdmin() {
        err = s.checkPermission(ctx, PermissionViewComplianceClient, validateClientScope(clientId))
        if err != nil {
            return nil, err
        }
    } else {
        err = s.checkPermission(ctx, PermissionViewComplianceGlobal)
        if err != nil {
            return nil, err
        }
    }

    // Get client pause state
    clientPaused, err := s.isClientPaused(ctx, clientId)
    if err != nil {
        clientPaused = false
    }

    // Prepare response
    pauseState := map[string]interface{}{
        "clientId":      clientId,
        "clientPaused":  clientPaused,
        "timestamp":     time.Now().Format(time.RFC3339),
        "queriedBy":     authCtx.UserID,
    }

    return pauseState, nil
}

// GetWalletPauseState returns pause state for a specific wallet
func (s *GatekeeperContract) GetWalletPauseState(ctx contractapi.TransactionContextInterface, walletAddress string) (map[string]interface{}, error) {
    // Check permission
    err := s.checkPermission(ctx, PermissionViewPauseState)
    if err != nil {
        return nil, err
    }

    // Get wallet pause states
    directPaused, _ := s.isWalletDirectlyPaused(ctx, walletAddress)
    
    // Check for scoped pauses (we'd need to iterate through clients)
    clientId := s.getWalletClientId(ctx, walletAddress)
    scopedPaused := false
    if clientId != "" {
        scopedPaused, _ = s.isWalletScopedPaused(ctx, walletAddress, clientId)
    }

    // Prepare response
    pauseState := map[string]interface{}{
        "walletAddress": walletAddress,
        "directPaused":  directPaused,
        "scopedPaused":  scopedPaused,
        "clientId":      clientId,
        "timestamp":     time.Now().Format(time.RFC3339),
        "queriedBy":     s.getClientID(ctx),
    }

    return pauseState, nil
}

// getClientID is a helper to get client ID
func (s *GatekeeperContract) getClientID(ctx contractapi.TransactionContextInterface) string {
    clientID, err := ctx.GetClientIdentity().GetID()
    if err != nil {
        return "unknown"
    }
    return clientID
}

// AddToBlacklist adds an address to the GLOBAL blacklist (Platform/Regulatory admins only)
func (s *GatekeeperContract) AddToBlacklist(ctx contractapi.TransactionContextInterface, addressToBlock string) error {
    // Check permission - only platform/regulatory administrators can globally blacklist addresses
    err := s.checkPermission(ctx, PermissionAddToBlacklistGlobal)
    if err != nil {
        s.logAuthorizationEvent(ctx, "AddToBlacklist", PermissionAddToBlacklistGlobal, false, err.Error())
        return err
    }
    
    if addressToBlock == "" {
        return fmt.Errorf("address cannot be empty")
    }
    
    // Check if address is already globally blacklisted
    isBlacklisted, err := s.isAddressGloballyBlacklisted(ctx, addressToBlock)
    if err != nil {
        return fmt.Errorf("failed to check current global blacklist status: %v", err)
    }
    if isBlacklisted {
        return fmt.Errorf("address %s is already globally blacklisted", addressToBlock)
    }
    
    // Create the global blacklist key for this address
    blacklistKey := BlacklistGlobalKey + addressToBlock
    
    // Set the address as globally blacklisted in the world state
    err = ctx.GetStub().PutState(blacklistKey, []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to globally blacklist address %s: %v", addressToBlock, err)
    }
    
    // Log successful authorization
    s.logAuthorizationEvent(ctx, "AddToBlacklist", PermissionAddToBlacklistGlobal, true, fmt.Sprintf("Address %s globally blacklisted", addressToBlock))
    
    // Emit blacklisting event
    err = s.emitAddressBlacklistedEvent(ctx, addressToBlock, "global", "")
    if err != nil {
        return fmt.Errorf("failed to emit global blacklisting event: %v", err)
    }
    
    return nil
}

// AddToBlacklistScoped adds an address to the CLIENT-SCOPED blacklist (Client admins for their company only)
func (s *GatekeeperContract) AddToBlacklistScoped(ctx contractapi.TransactionContextInterface, addressToBlock string) error {
    // Check permission - only client administrators can blacklist addresses within their scope
    err := s.checkPermission(ctx, PermissionAddToBlacklistScoped)
    if err != nil {
        s.logAuthorizationEvent(ctx, "AddToBlacklistScoped", PermissionAddToBlacklistScoped, false, err.Error())
        return err
    }
    
    if addressToBlock == "" {
        return fmt.Errorf("address cannot be empty")
    }
    
    // Get client ID from authorization context
    authCtx, err := getAuthorizationContext(ctx)
    if err != nil {
        return fmt.Errorf("failed to get authorization context: %v", err)
    }
    
    if authCtx.ClientID == "" {
        return fmt.Errorf("client ID is required for scoped blacklisting")
    }
    
    // TODO: Verify that the address belongs to this client's organization
    // This would typically involve checking the database to ensure the wallet address
    // is associated with a user/profile belonging to this client
    
    // Check if address is already blacklisted in this client's scope
    isBlacklisted, err := s.isAddressClientBlacklisted(ctx, addressToBlock, authCtx.ClientID)
    if err != nil {
        return fmt.Errorf("failed to check current client blacklist status: %v", err)
    }
    if isBlacklisted {
        return fmt.Errorf("address %s is already blacklisted in client %s scope", addressToBlock, authCtx.ClientID)
    }
    
    // Create the client-scoped blacklist key for this address
    blacklistKey := BlacklistClientKey + authCtx.ClientID + "_" + addressToBlock
    
    // Set the address as blacklisted in the client scope
    err = ctx.GetStub().PutState(blacklistKey, []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to blacklist address %s in client scope: %v", addressToBlock, err)
    }
    
    // Log successful authorization
    s.logAuthorizationEvent(ctx, "AddToBlacklistScoped", PermissionAddToBlacklistScoped, true, fmt.Sprintf("Address %s blacklisted in client %s scope", addressToBlock, authCtx.ClientID))
    
    // Emit blacklisting event
    err = s.emitAddressBlacklistedEvent(ctx, addressToBlock, "client-scoped", authCtx.ClientID)
    if err != nil {
        return fmt.Errorf("failed to emit client-scoped blacklisting event: %v", err)
    }
    
    return nil
}

// RemoveFromBlacklist removes an address from the GLOBAL blacklist (Platform/Regulatory admins only)
func (s *GatekeeperContract) RemoveFromBlacklist(ctx contractapi.TransactionContextInterface, addressToUnblock string) error {
    // Check permission - only platform/regulatory administrators can manage global blacklist
    err := s.checkPermission(ctx, PermissionRemoveFromBlacklistGlobal)
    if err != nil {
        s.logAuthorizationEvent(ctx, "RemoveFromBlacklist", PermissionRemoveFromBlacklistGlobal, false, err.Error())
        return err
    }
    
    if addressToUnblock == "" {
        return fmt.Errorf("address cannot be empty")
    }
    
    // Check if address is currently globally blacklisted
    isBlacklisted, err := s.isAddressGloballyBlacklisted(ctx, addressToUnblock)
    if err != nil {
        return fmt.Errorf("failed to check current global blacklist status: %v", err)
    }
    if !isBlacklisted {
        return fmt.Errorf("address %s is not currently globally blacklisted", addressToUnblock)
    }
    
    // Create the global blacklist key for this address
    blacklistKey := BlacklistGlobalKey + addressToUnblock
    
    // Remove the address from the global blacklist by deleting the state
    err = ctx.GetStub().DelState(blacklistKey)
    if err != nil {
        return fmt.Errorf("failed to remove address %s from global blacklist: %v", addressToUnblock, err)
    }
    
    // Log successful authorization
    s.logAuthorizationEvent(ctx, "RemoveFromBlacklist", PermissionRemoveFromBlacklistGlobal, true, fmt.Sprintf("Address %s removed from global blacklist", addressToUnblock))
    
    // Emit removal event
    err = s.emitAddressRemovedFromBlacklistEvent(ctx, addressToUnblock, "global", "")
    if err != nil {
        return fmt.Errorf("failed to emit global blacklist removal event: %v", err)
    }
    
    return nil
}

// RemoveFromBlacklistScoped removes an address from the CLIENT-SCOPED blacklist (Client admins for their company only)
func (s *GatekeeperContract) RemoveFromBlacklistScoped(ctx contractapi.TransactionContextInterface, addressToUnblock string) error {
    // Check permission - only client administrators can manage their scoped blacklist
    err := s.checkPermission(ctx, PermissionRemoveFromBlacklistScoped)
    if err != nil {
        s.logAuthorizationEvent(ctx, "RemoveFromBlacklistScoped", PermissionRemoveFromBlacklistScoped, false, err.Error())
        return err
    }
    
    if addressToUnblock == "" {
        return fmt.Errorf("address cannot be empty")
    }
    
    // Get client ID from authorization context
    authCtx, err := getAuthorizationContext(ctx)
    if err != nil {
        return fmt.Errorf("failed to get authorization context: %v", err)
    }
    
    if authCtx.ClientID == "" {
        return fmt.Errorf("client ID is required for scoped blacklist removal")
    }
    
    // Check if address is currently blacklisted in this client's scope
    isBlacklisted, err := s.isAddressClientBlacklisted(ctx, addressToUnblock, authCtx.ClientID)
    if err != nil {
        return fmt.Errorf("failed to check current client blacklist status: %v", err)
    }
    if !isBlacklisted {
        return fmt.Errorf("address %s is not currently blacklisted in client %s scope", addressToUnblock, authCtx.ClientID)
    }
    
    // Create the client-scoped blacklist key for this address
    blacklistKey := BlacklistClientKey + authCtx.ClientID + "_" + addressToUnblock
    
    // Remove the address from the client-scoped blacklist by deleting the state
    err = ctx.GetStub().DelState(blacklistKey)
    if err != nil {
        return fmt.Errorf("failed to remove address %s from client %s blacklist: %v", addressToUnblock, authCtx.ClientID, err)
    }
    
    // Log successful authorization
    s.logAuthorizationEvent(ctx, "RemoveFromBlacklistScoped", PermissionRemoveFromBlacklistScoped, true, fmt.Sprintf("Address %s removed from client %s blacklist", addressToUnblock, authCtx.ClientID))
    
    // Emit removal event
    err = s.emitAddressRemovedFromBlacklistEvent(ctx, addressToUnblock, "client-scoped", authCtx.ClientID)
    if err != nil {
        return fmt.Errorf("failed to emit client-scoped blacklist removal event: %v", err)
    }
    
    return nil
}

// IsAddressBlacklisted checks if an address is blacklisted (checks both global and client-scoped blacklists)
func (s *GatekeeperContract) IsAddressBlacklisted(ctx contractapi.TransactionContextInterface, addressToCheck string) (bool, error) {
    if addressToCheck == "" {
        return false, fmt.Errorf("address cannot be empty")
    }
    
    // First check global blacklist
    globallyBlacklisted, err := s.isAddressGloballyBlacklisted(ctx, addressToCheck)
    if err != nil {
        return false, fmt.Errorf("failed to check global blacklist status for address %s: %v", addressToCheck, err)
    }
    
    // If globally blacklisted, return immediately
    if globallyBlacklisted {
        return true, nil
    }
    
    // Get authorization context to check client-scoped blacklist
    authCtx, err := getAuthorizationContext(ctx)
    if err != nil {
        // If we can't get auth context, we can only check global blacklist
        return globallyBlacklisted, nil
    }
    
    if authCtx.ClientID == "" {
        // No client context, return global result only
        return globallyBlacklisted, nil
    }
    
    // Check client-scoped blacklist
    clientBlacklisted, err := s.isAddressClientBlacklisted(ctx, addressToCheck, authCtx.ClientID)
    if err != nil {
        return globallyBlacklisted, fmt.Errorf("failed to check client blacklist status for address %s: %v", addressToCheck, err)
    }
    
    // Return true if blacklisted in either global or client scope
    return globallyBlacklisted || clientBlacklisted, nil
}

// isAddressGloballyBlacklisted checks if an address is in the global blacklist
func (s *GatekeeperContract) isAddressGloballyBlacklisted(ctx contractapi.TransactionContextInterface, addressToCheck string) (bool, error) {
    if addressToCheck == "" {
        return false, fmt.Errorf("address cannot be empty")
    }
    
    // Create the global blacklist key for this address
    blacklistKey := BlacklistGlobalKey + addressToCheck
    
    // Check if the address exists in the global blacklist
    blacklistBytes, err := ctx.GetStub().GetState(blacklistKey)
    if err != nil {
        return false, fmt.Errorf("failed to check global blacklist status for address %s: %v", addressToCheck, err)
    }
    
    // If no entry exists, the address is not globally blacklisted
    if blacklistBytes == nil {
        return false, nil
    }
    
    // Return true if the address is globally blacklisted
    return string(blacklistBytes) == "true", nil
}

// isAddressClientBlacklisted checks if an address is in a specific client's blacklist
func (s *GatekeeperContract) isAddressClientBlacklisted(ctx contractapi.TransactionContextInterface, addressToCheck string, clientID string) (bool, error) {
    if addressToCheck == "" {
        return false, fmt.Errorf("address cannot be empty")
    }
    
    if clientID == "" {
        return false, fmt.Errorf("client ID cannot be empty")
    }
    
    // Create the client-scoped blacklist key for this address
    blacklistKey := BlacklistClientKey + clientID + "_" + addressToCheck
    
    // Check if the address exists in the client-scoped blacklist
    blacklistBytes, err := ctx.GetStub().GetState(blacklistKey)
    if err != nil {
        return false, fmt.Errorf("failed to check client blacklist status for address %s in client %s: %v", addressToCheck, clientID, err)
    }
    
    // If no entry exists, the address is not blacklisted in this client scope
    if blacklistBytes == nil {
        return false, nil
    }
    
    // Return true if the address is blacklisted in this client scope
    return string(blacklistBytes) == "true", nil
}

// buildBlacklistReason creates a descriptive reason for blacklisted addresses
func (s *GatekeeperContract) buildBlacklistReason(senderBlacklisted, receiverBlacklisted bool) string {
    if senderBlacklisted && receiverBlacklisted {
        return "Both sender and receiver addresses are blacklisted"
    } else if senderBlacklisted {
        return "Sender address is blacklisted"
    } else if receiverBlacklisted {
        return "Receiver address is blacklisted"
    }
    return "Address blacklisting check failed"
}

// emitAddressBlacklistedEvent emits an event when an address is blacklisted
func (s *GatekeeperContract) emitAddressBlacklistedEvent(ctx contractapi.TransactionContextInterface, address string, scope string, clientID string) error {
    eventData := map[string]interface{}{
        "action":    "address_blacklisted",
        "address":   address,
        "scope":     scope,
        "clientId":  clientID,
        "timestamp": time.Now().Format(time.RFC3339),
        "adminId":   s.getClientID(ctx),
    }
    
    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal blacklisting event: %v", err)
    }
    
    return ctx.GetStub().SetEvent("AddressBlacklisted", eventPayload)
}

// emitAddressRemovedFromBlacklistEvent emits an event when an address is removed from blacklist
func (s *GatekeeperContract) emitAddressRemovedFromBlacklistEvent(ctx contractapi.TransactionContextInterface, address string, scope string, clientID string) error {
    eventData := map[string]interface{}{
        "action":    "address_removed_from_blacklist",
        "address":   address,
        "scope":     scope,
        "clientId":  clientID,
        "timestamp": time.Now().Format(time.RFC3339),
        "adminId":   s.getClientID(ctx),
    }
    
    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal blacklist removal event: %v", err)
    }
    
    return ctx.GetStub().SetEvent("AddressRemovedFromBlacklist", eventPayload)
}

// InitLedger initializes the chaincode with permission-based authorization
func (s *GatekeeperContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    // Note: All pause states are now managed in world state
    // No need to initialize them explicitly as they default to false/not-paused

    // Emit initialization event
    timestamp := time.Now().Format(time.RFC3339)
    eventData := map[string]interface{}{
        "action":              "initialized",
        "timestamp":           timestamp,
        "version":            "2.1.0",
        "authorizationModel": "permission-based",
        "features": []string{
            "global-pause",
            "client-pause", 
            "wallet-pause-direct",
            "wallet-pause-scoped",
            "hierarchical-authorization",
            "audit-trail",
            "address-blacklisting",
        },
    }
    
    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal initialization event: %v", err)
    }

    err = ctx.GetStub().SetEvent("GatekeeperInitialized", eventPayload)
    if err != nil {
        return fmt.Errorf("failed to emit initialization event: %v", err)
    }

    return nil
}

func main() {
    gatekeeperChaincode, err := contractapi.NewChaincode(&GatekeeperContract{})
    if err != nil {
        log.Panicf("Error creating gatekeeper chaincode: %v", err)
    }

    if err := gatekeeperChaincode.Start(); err != nil {
        log.Panicf("Error starting gatekeeper chaincode: %v", err)
    }
} 