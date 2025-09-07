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
    paused bool
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

// Admin role for pause/unpause operations
const AdminRole = "admin"

// CheckCompliance verifies that both sender and receiver have valid KYC attestations
func (s *GatekeeperContract) CheckCompliance(ctx contractapi.TransactionContextInterface, senderAddress string, receiverAddress string) (*ComplianceResult, error) {
    // Check if contract is paused
    if s.paused {
        result := &ComplianceResult{
            Sender:      senderAddress,
            Receiver:    receiverAddress,
            IsCompliant: false,
            Reason:      "Contract is currently paused",
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
    err := s.emitComplianceCheckEvent(ctx, result)
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

// Pause pauses the contract (only callable by admin)
func (s *GatekeeperContract) Pause(ctx contractapi.TransactionContextInterface) error {
    // Check admin authorization
    err := s.checkAdminRole(ctx)
    if err != nil {
        return err
    }

    if s.paused {
        return fmt.Errorf("contract is already paused")
    }

    s.paused = true

    // Store pause state in world state for persistence
    err = ctx.GetStub().PutState("paused", []byte("true"))
    if err != nil {
        return fmt.Errorf("failed to store pause state: %v", err)
    }

    // Emit pause event
    timestamp := time.Now().Format(time.RFC3339)
    eventData := map[string]interface{}{
        "action":    "paused",
        "timestamp": timestamp,
        "admin":     s.getClientID(ctx),
    }
    
    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal pause event: %v", err)
    }

    err = ctx.GetStub().SetEvent("ContractPaused", eventPayload)
    if err != nil {
        return fmt.Errorf("failed to emit pause event: %v", err)
    }

    return nil
}

// Unpause unpauses the contract (only callable by admin)
func (s *GatekeeperContract) Unpause(ctx contractapi.TransactionContextInterface) error {
    // Check admin authorization
    err := s.checkAdminRole(ctx)
    if err != nil {
        return err
    }

    if !s.paused {
        return fmt.Errorf("contract is not paused")
    }

    s.paused = false

    // Store pause state in world state for persistence
    err = ctx.GetStub().PutState("paused", []byte("false"))
    if err != nil {
        return fmt.Errorf("failed to store pause state: %v", err)
    }

    // Emit unpause event
    timestamp := time.Now().Format(time.RFC3339)
    eventData := map[string]interface{}{
        "action":    "unpaused",
        "timestamp": timestamp,
        "admin":     s.getClientID(ctx),
    }
    
    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal unpause event: %v", err)
    }

    err = ctx.GetStub().SetEvent("ContractUnpaused", eventPayload)
    if err != nil {
        return fmt.Errorf("failed to emit unpause event: %v", err)
    }

    return nil
}

// GetPauseState returns the current pause state
func (s *GatekeeperContract) GetPauseState(ctx contractapi.TransactionContextInterface) (bool, error) {
    pausedBytes, err := ctx.GetStub().GetState("paused")
    if err != nil {
        return false, fmt.Errorf("failed to get pause state: %v", err)
    }

    if pausedBytes == nil {
        return false, nil // Default to not paused
    }

    paused := string(pausedBytes) == "true"
    s.paused = paused // Update internal state
    return paused, nil
}

// checkAdminRole verifies that the caller has admin privileges
func (s *GatekeeperContract) checkAdminRole(ctx contractapi.TransactionContextInterface) error {
    // In a production environment, this should check against a proper RBAC system
    // For now, we'll check if the client has admin role attribute
    clientID, err := ctx.GetClientIdentity().GetID()
    if err != nil {
        return fmt.Errorf("failed to get client identity: %v", err)
    }

    // Check for admin attribute (this would be set during enrollment)
    adminAttr, found, err := ctx.GetClientIdentity().GetAttributeValue("role")
    if err != nil {
        return fmt.Errorf("failed to get role attribute: %v", err)
    }

    if !found || adminAttr != AdminRole {
        return fmt.Errorf("access denied: admin role required (client: %s)", clientID)
    }

    return nil
}

// getClientID is a helper to get client ID
func (s *GatekeeperContract) getClientID(ctx contractapi.TransactionContextInterface) string {
    clientID, err := ctx.GetClientIdentity().GetID()
    if err != nil {
        return "unknown"
    }
    return clientID
}

// InitLedger initializes the chaincode
func (s *GatekeeperContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    // Initialize pause state to false
    err := ctx.GetStub().PutState("paused", []byte("false"))
    if err != nil {
        return fmt.Errorf("failed to initialize pause state: %v", err)
    }

    s.paused = false

    // Emit initialization event
    timestamp := time.Now().Format(time.RFC3339)
    eventData := map[string]interface{}{
        "action":    "initialized",
        "timestamp": timestamp,
        "version":   "1.0.0",
    }
    
    eventPayload, err := json.Marshal(eventData)
    if err != nil {
        return fmt.Errorf("failed to marshal initialization event: %v", err)
    }

    err = ctx.GetStub().SetEvent("ContractInitialized", eventPayload)
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