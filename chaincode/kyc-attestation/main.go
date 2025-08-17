package main

import (
    "encoding/json"
    "fmt"
    "log"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// AttestationContract provides functions for managing KYC attestations
type AttestationContract struct {
    contractapi.Contract
}

// Attestation represents a KYC attestation on the blockchain
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

// CreateAttestation creates a new KYC attestation
func (s *AttestationContract) CreateAttestation(ctx contractapi.TransactionContextInterface, id string, profileId string, walletId string, metadataUri string) error {
    // Check if attestation already exists
    existing, err := ctx.GetStub().GetState(id)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if existing != nil {
        return fmt.Errorf("attestation %s already exists", id)
    }

    // Get transaction timestamp
    timestamp, err := ctx.GetStub().GetTxTimestamp()
    if err != nil {
        return fmt.Errorf("failed to get transaction timestamp: %v", err)
    }

    // Get client identity
    clientID, err := ctx.GetClientIdentity().GetID()
    if err != nil {
        return fmt.Errorf("failed to get client identity: %v", err)
    }

    // Create attestation
    attestation := Attestation{
        ID:          id,
        ProfileID:   profileId,
        WalletID:    walletId,
        Status:      string(StatusActive),
        MetadataURI: metadataUri,
        IssuedAt:    time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).Format(time.RFC3339),
        ExpiresAt:   time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).AddDate(1, 0, 0).Format(time.RFC3339), // 1 year expiry
        Issuer:      "KYC-Platform",
        CreatedBy:   clientID,
        UpdatedAt:   time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).Format(time.RFC3339),
    }

    attestationJSON, err := json.Marshal(attestation)
    if err != nil {
        return fmt.Errorf("failed to marshal attestation: %v", err)
    }

    // Store attestation
    err = ctx.GetStub().PutState(id, attestationJSON)
    if err != nil {
        return fmt.Errorf("failed to put attestation in world state: %v", err)
    }

    // Emit event
    err = ctx.GetStub().SetEvent("AttestationCreated", attestationJSON)
    if err != nil {
        return fmt.Errorf("failed to emit event: %v", err)
    }

    return nil
}

// GetAttestation retrieves an attestation by ID
func (s *AttestationContract) GetAttestation(ctx contractapi.TransactionContextInterface, id string) (*Attestation, error) {
    attestationJSON, err := ctx.GetStub().GetState(id)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state: %v", err)
    }
    if attestationJSON == nil {
        return nil, fmt.Errorf("attestation %s does not exist", id)
    }

    var attestation Attestation
    err = json.Unmarshal(attestationJSON, &attestation)
    if err != nil {
        return nil, fmt.Errorf("failed to unmarshal attestation: %v", err)
    }

    return &attestation, nil
}

// UpdateAttestationStatus updates the status of an existing attestation
func (s *AttestationContract) UpdateAttestationStatus(ctx contractapi.TransactionContextInterface, id string, status string) error {
    attestation, err := s.GetAttestation(ctx, id)
    if err != nil {
        return err
    }

    // Get transaction timestamp
    timestamp, err := ctx.GetStub().GetTxTimestamp()
    if err != nil {
        return fmt.Errorf("failed to get transaction timestamp: %v", err)
    }

    // Update status and timestamp
    attestation.Status = status
    attestation.UpdatedAt = time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).Format(time.RFC3339)

    // If revoking, set revoked timestamp
    if status == string(StatusRevoked) {
        attestation.RevokedAt = attestation.UpdatedAt
    }

    attestationJSON, err := json.Marshal(attestation)
    if err != nil {
        return fmt.Errorf("failed to marshal attestation: %v", err)
    }

    // Update state
    err = ctx.GetStub().PutState(id, attestationJSON)
    if err != nil {
        return fmt.Errorf("failed to update attestation: %v", err)
    }

    // Emit event
    err = ctx.GetStub().SetEvent("AttestationUpdated", attestationJSON)
    if err != nil {
        return fmt.Errorf("failed to emit event: %v", err)
    }

    return nil
}

// RevokeAttestation revokes an existing attestation
func (s *AttestationContract) RevokeAttestation(ctx contractapi.TransactionContextInterface, id string) error {
    return s.UpdateAttestationStatus(ctx, id, string(StatusRevoked))
}

// GetAttestationsByWallet retrieves all attestations for a specific wallet
func (s *AttestationContract) GetAttestationsByWallet(ctx contractapi.TransactionContextInterface, walletId string) ([]*Attestation, error) {
    queryString := fmt.Sprintf(`{"selector":{"walletId":"%s"}}`, walletId)
    return s.getQueryResultForQueryString(ctx, queryString)
}

// GetAttestationsByProfile retrieves all attestations for a specific profile
func (s *AttestationContract) GetAttestationsByProfile(ctx contractapi.TransactionContextInterface, profileId string) ([]*Attestation, error) {
    queryString := fmt.Sprintf(`{"selector":{"profileId":"%s"}}`, profileId)
    return s.getQueryResultForQueryString(ctx, queryString)
}

// GetAllAttestations returns all attestations
func (s *AttestationContract) GetAllAttestations(ctx contractapi.TransactionContextInterface) ([]*Attestation, error) {
    queryString := `{"selector":{}}`
    return s.getQueryResultForQueryString(ctx, queryString)
}

// Helper function to execute rich queries
func (s *AttestationContract) getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*Attestation, error) {
    resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
    if err != nil {
        return nil, fmt.Errorf("failed to execute query: %v", err)
    }
    defer resultsIterator.Close()

    var attestations []*Attestation
    for resultsIterator.HasNext() {
        queryResult, err := resultsIterator.Next()
        if err != nil {
            return nil, fmt.Errorf("failed to iterate query results: %v", err)
        }

        var attestation Attestation
        err = json.Unmarshal(queryResult.Value, &attestation)
        if err != nil {
            return nil, fmt.Errorf("failed to unmarshal attestation: %v", err)
        }
        attestations = append(attestations, &attestation)
    }

    return attestations, nil
}

// GetAttestationHistory returns the history of changes for an attestation
func (s *AttestationContract) GetAttestationHistory(ctx contractapi.TransactionContextInterface, id string) ([]map[string]interface{}, error) {
    historyIterator, err := ctx.GetStub().GetHistoryForKey(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get history for attestation %s: %v", id, err)
    }
    defer historyIterator.Close()

    var history []map[string]interface{}
    for historyIterator.HasNext() {
        historyData, err := historyIterator.Next()
        if err != nil {
            return nil, fmt.Errorf("failed to iterate history: %v", err)
        }

        var attestation Attestation
        if len(historyData.Value) > 0 {
            err = json.Unmarshal(historyData.Value, &attestation)
            if err != nil {
                return nil, fmt.Errorf("failed to unmarshal historical attestation: %v", err)
            }
        }

        historyRecord := map[string]interface{}{
            "txId":      historyData.TxId,
            "timestamp": time.Unix(historyData.Timestamp.Seconds, int64(historyData.Timestamp.Nanos)),
            "isDelete":  historyData.IsDelete,
            "value":     attestation,
        }
        history = append(history, historyRecord)
    }

    return history, nil
}

func main() {
    attestationChaincode, err := contractapi.NewChaincode(&AttestationContract{})
    if err != nil {
        log.Panicf("Error creating KYC attestation chaincode: %v", err)
    }

    if err := attestationChaincode.Start(); err != nil {
        log.Panicf("Error starting KYC attestation chaincode: %v", err)
    }
} 