package main

import (
    "encoding/json"
    "fmt"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ========================================
// WALLET PAUSE FUNCTIONS (Direct - Regulatory)
// ========================================

// PauseWalletDirect directly pauses any wallet address (regulatory/court orders)
func (s *GatekeeperContract) PauseWalletDirect(ctx contractapi.TransactionContextInterface, walletAddress string) error {
    // Check permission
    err := s.checkPermission(ctx, PermissionPauseWalletDirect)
    if err != nil {
        s.logAuthorizationEvent(ctx, "PauseWalletDirect", PermissionPauseWalletDirect, false, err.Error())
        return err
    }

    // Check if wallet is already paused
    isPaused, err := s.isWalletDirectlyPaused(ctx, walletAddress)
    if err != nil {
        return fmt.Errorf("failed to check wallet pause state: %v", err)
    }
    if isPaused {
        return fmt.Errorf("wallet %s is already directly paused", walletAddress)
    }

    // Set wallet pause state
    err = ctx.GetStub().PutState(WalletPauseKey+"direct_"+walletAddress, []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to set wallet pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "PauseWalletDirect", PermissionPauseWalletDirect, true, 
        fmt.Sprintf("Wallet %s paused by regulatory/court order", walletAddress))

    // Emit pause event
    return s.emitPauseEvent(ctx, "wallet_direct", walletAddress, "Wallet frozen by regulatory authority")
}

// UnpauseWalletDirect directly unpauses any wallet address
func (s *GatekeeperContract) UnpauseWalletDirect(ctx contractapi.TransactionContextInterface, walletAddress string) error {
    // Check permission
    err := s.checkPermission(ctx, PermissionUnpauseWalletDirect)
    if err != nil {
        s.logAuthorizationEvent(ctx, "UnpauseWalletDirect", PermissionUnpauseWalletDirect, false, err.Error())
        return err
    }

    // Check if wallet is actually paused
    isPaused, err := s.isWalletDirectlyPaused(ctx, walletAddress)
    if err != nil {
        return fmt.Errorf("failed to check wallet pause state: %v", err)
    }
    if !isPaused {
        return fmt.Errorf("wallet %s is not directly paused", walletAddress)
    }

    // Remove wallet pause state
    err = ctx.GetStub().DelState(WalletPauseKey + "direct_" + walletAddress)
    if err != nil {
        return fmt.Errorf("failed to remove wallet pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "UnpauseWalletDirect", PermissionUnpauseWalletDirect, true, 
        fmt.Sprintf("Wallet %s unpaused - direct freeze removed", walletAddress))

    // Emit unpause event
    return s.emitPauseEvent(ctx, "wallet_direct", walletAddress, "Wallet unfrozen by regulatory authority")
}

// ========================================
// WALLET PAUSE FUNCTIONS (Scoped - Client Business)
// ========================================

// PauseWalletScoped pauses a wallet address (client admin only, own wallets)
func (s *GatekeeperContract) PauseWalletScoped(ctx contractapi.TransactionContextInterface, walletAddress string, clientId string) error {
    // Check permission and client scope
    err := s.checkPermission(ctx, PermissionPauseWalletScoped, validateClientScope(clientId))
    if err != nil {
        s.logAuthorizationEvent(ctx, "PauseWalletScoped", PermissionPauseWalletScoped, false, err.Error())
        return err
    }

    // Validate wallet ownership
    authCtx, _ := getAuthorizationContext(ctx)
    err = s.validateWalletOwnership(ctx, walletAddress, authCtx)
    if err != nil {
        s.logAuthorizationEvent(ctx, "PauseWalletScoped", PermissionPauseWalletScoped, false, 
            fmt.Sprintf("Wallet ownership validation failed: %s", err.Error()))
        return err
    }

    // Check if wallet is already paused by this client
    isPaused, err := s.isWalletScopedPaused(ctx, walletAddress, clientId)
    if err != nil {
        return fmt.Errorf("failed to check wallet pause state: %v", err)
    }
    if isPaused {
        return fmt.Errorf("wallet %s is already paused by client %s", walletAddress, clientId)
    }

    // Set wallet pause state for this client
    err = ctx.GetStub().PutState(WalletPauseKey+"scoped_"+clientId+"_"+walletAddress, []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to set wallet pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "PauseWalletScoped", PermissionPauseWalletScoped, true, 
        fmt.Sprintf("Wallet %s paused by client %s for business reasons", walletAddress, clientId))

    // Emit pause event
    return s.emitPauseEvent(ctx, "wallet_scoped", walletAddress, fmt.Sprintf("Account frozen by %s", clientId))
}

// UnpauseWalletScoped unpauses a wallet address (client admin only, own wallets)
func (s *GatekeeperContract) UnpauseWalletScoped(ctx contractapi.TransactionContextInterface, walletAddress string, clientId string) error {
    // Check permission and client scope
    err := s.checkPermission(ctx, PermissionUnpauseWalletScoped, validateClientScope(clientId))
    if err != nil {
        s.logAuthorizationEvent(ctx, "UnpauseWalletScoped", PermissionUnpauseWalletScoped, false, err.Error())
        return err
    }

    // Validate wallet ownership
    authCtx, _ := getAuthorizationContext(ctx)
    err = s.validateWalletOwnership(ctx, walletAddress, authCtx)
    if err != nil {
        s.logAuthorizationEvent(ctx, "UnpauseWalletScoped", PermissionUnpauseWalletScoped, false, 
            fmt.Sprintf("Wallet ownership validation failed: %s", err.Error()))
        return err
    }

    // Check if wallet is actually paused by this client
    isPaused, err := s.isWalletScopedPaused(ctx, walletAddress, clientId)
    if err != nil {
        return fmt.Errorf("failed to check wallet pause state: %v", err)
    }
    if !isPaused {
        return fmt.Errorf("wallet %s is not paused by client %s", walletAddress, clientId)
    }

    // Remove wallet pause state for this client
    err = ctx.GetStub().DelState(WalletPauseKey + "scoped_" + clientId + "_" + walletAddress)
    if err != nil {
        return fmt.Errorf("failed to remove wallet pause state: %v", err)
    }

    // Log successful authorization
    s.logAuthorizationEvent(ctx, "UnpauseWalletScoped", PermissionUnpauseWalletScoped, true, 
        fmt.Sprintf("Wallet %s unpaused by client %s", walletAddress, clientId))

    // Emit unpause event
    return s.emitPauseEvent(ctx, "wallet_scoped", walletAddress, fmt.Sprintf("Account unfrozen by %s", clientId))
}

// ========================================
// PAUSE STATE CHECKING FUNCTIONS
// ========================================

// checkPauseState checks hierarchical pause states for compliance checking
func (s *GatekeeperContract) checkPauseState(ctx contractapi.TransactionContextInterface, senderAddress string, receiverAddress string) (bool, string) {
    // 1. Check global pause (highest priority)
    if paused, err := s.isGloballyPaused(ctx); err == nil && paused {
        return true, "System maintenance in progress - all operations paused"
    }

    // 2. Check if either address is directly paused (regulatory)
    if paused, err := s.isWalletDirectlyPaused(ctx, senderAddress); err == nil && paused {
        return true, "Sender wallet is frozen by regulatory authority"
    }
    if paused, err := s.isWalletDirectlyPaused(ctx, receiverAddress); err == nil && paused {
        return true, "Receiver wallet is frozen by regulatory authority"
    }

    // 3. Get client IDs for both addresses (if available)
    senderClientId := s.getWalletClientId(ctx, senderAddress)
    receiverClientId := s.getWalletClientId(ctx, receiverAddress)

    // 4. Check client-level pauses
    if senderClientId != "" {
        if paused, err := s.isClientPaused(ctx, senderClientId); err == nil && paused {
            return true, fmt.Sprintf("Sender's organization (%s) operations are paused", senderClientId)
        }
    }
    if receiverClientId != "" {
        if paused, err := s.isClientPaused(ctx, receiverClientId); err == nil && paused {
            return true, fmt.Sprintf("Receiver's organization (%s) operations are paused", receiverClientId)
        }
    }

    // 5. Check wallet-scoped pauses
    if senderClientId != "" {
        if paused, err := s.isWalletScopedPaused(ctx, senderAddress, senderClientId); err == nil && paused {
            return true, "Sender account is frozen by organization"
        }
    }
    if receiverClientId != "" {
        if paused, err := s.isWalletScopedPaused(ctx, receiverAddress, receiverClientId); err == nil && paused {
            return true, "Receiver account is frozen by organization"
        }
    }

    return false, ""
}

// Helper functions for checking specific pause states

func (s *GatekeeperContract) isGloballyPaused(ctx contractapi.TransactionContextInterface) (bool, error) {
    pausedBytes, err := ctx.GetStub().GetState(GlobalPauseKey)
    if err != nil {
        return false, err
    }
    return len(pausedBytes) > 0 && string(pausedBytes) == "true", nil
}

func (s *GatekeeperContract) isClientPaused(ctx contractapi.TransactionContextInterface, clientId string) (bool, error) {
    pausedBytes, err := ctx.GetStub().GetState(ClientPauseKey + clientId)
    if err != nil {
        return false, err
    }
    return len(pausedBytes) > 0 && string(pausedBytes) == "true", nil
}

func (s *GatekeeperContract) isWalletDirectlyPaused(ctx contractapi.TransactionContextInterface, walletAddress string) (bool, error) {
    pausedBytes, err := ctx.GetStub().GetState(WalletPauseKey + "direct_" + walletAddress)
    if err != nil {
        return false, err
    }
    return len(pausedBytes) > 0 && string(pausedBytes) == "true", nil
}

func (s *GatekeeperContract) isWalletScopedPaused(ctx contractapi.TransactionContextInterface, walletAddress string, clientId string) (bool, error) {
    pausedBytes, err := ctx.GetStub().GetState(WalletPauseKey + "scoped_" + clientId + "_" + walletAddress)
    if err != nil {
        return false, err
    }
    return len(pausedBytes) > 0 && string(pausedBytes) == "true", nil
}

// getWalletClientId attempts to determine which client owns a wallet address
func (s *GatekeeperContract) getWalletClientId(ctx contractapi.TransactionContextInterface, walletAddress string) string {
    // Query KYC attestation chaincode to get wallet's client association
    response := ctx.GetStub().InvokeChaincode("kycattestation", [][]byte{
        []byte("GetAttestationsByWallet"),
        []byte(walletAddress),
    }, "kycchannel")

    if response.Status != 200 || len(response.Payload) == 0 {
        return ""
    }

    // Parse attestations to extract client ID
    var attestations []*Attestation
    err := json.Unmarshal(response.Payload, &attestations)
    if err != nil || len(attestations) == 0 {
        return ""
    }

    // Extract client ID from first valid attestation
    // Note: This assumes ProfileID contains client information
    // In practice, this would need to query the profile->client relationship
    for _, attestation := range attestations {
        if attestation.ProfileID != "" {
            // TODO: Implement actual client ID extraction from profile
            // For now, return empty to be safe
            return ""
        }
    }

    return ""
}

// ========================================
// EVENT EMISSION HELPERS
// ========================================

// emitPauseEvent emits a standardized pause/unpause event
func (s *GatekeeperContract) emitPauseEvent(ctx contractapi.TransactionContextInterface, level string, target string, reason string) error {
    authCtx, _ := getAuthorizationContext(ctx)
    
    eventData := map[string]interface{}{
        "level":     level,
        "target":    target,
        "reason":    reason,
        "userID":    authCtx.UserID,
        "clientID":  authCtx.ClientID,
        "timestamp": time.Now().Format(time.RFC3339),
    }

    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal pause event: %v", err)
    }

    return ctx.GetStub().SetEvent("GatekeeperPauseEvent", eventPayload)
} 