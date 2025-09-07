package main

import (
    "testing"
    "time"
    
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
    "github.com/hyperledger/fabric-chaincode-go/shimtest"
)

// TestComplianceResultStructure tests the basic result structure
func TestComplianceResultStructure(t *testing.T) {
    contract := &GatekeeperContract{}
    ctx := &contractapi.TransactionContext{}
    ctx.SetStub(shimtest.NewMockStub("test", nil))
    
    // This will fail chaincode invocation but we can test the structure
    result, err := contract.CheckCompliance(ctx, "sender123", "receiver456")
    
    if err != nil {
        t.Fatalf("Expected no error, got: %v", err)
    }
    
    // Basic structure validation
    if result.Sender != "sender123" {
        t.Errorf("Expected sender to be 'sender123', got: %s", result.Sender)
    }
    
    if result.Receiver != "receiver456" {
        t.Errorf("Expected receiver to be 'receiver456', got: %s", result.Receiver)
    }
    
    if result.CheckedAt == "" {
        t.Error("Expected CheckedAt timestamp to be set")
    }
    
    // Parse timestamp to ensure it's valid
    _, err = time.Parse(time.RFC3339, result.CheckedAt)
    if err != nil {
        t.Errorf("Expected valid RFC3339 timestamp, got: %s", result.CheckedAt)
    }
}

// TestContractInitialization tests the basic contract setup
func TestContractInitialization(t *testing.T) {
    contract := &GatekeeperContract{}
    ctx := &contractapi.TransactionContext{}
    ctx.SetStub(shimtest.NewMockStub("test", nil))
    
    // Test initialization
    err := contract.InitLedger(ctx)
    if err != nil {
        t.Fatalf("Expected no error during initialization, got: %v", err)
    }
}

// TestAttestationStatusConstants tests the status constants
func TestAttestationStatusConstants(t *testing.T) {
    if StatusPending != "PENDING" {
        t.Errorf("Expected PENDING status, got: %s", StatusPending)
    }
    
    if StatusActive != "ACTIVE" {
        t.Errorf("Expected ACTIVE status, got: %s", StatusActive)
    }
    
    if StatusExpired != "EXPIRED" {
        t.Errorf("Expected EXPIRED status, got: %s", StatusExpired)
    }
    
    if StatusRevoked != "REVOKED" {
        t.Errorf("Expected REVOKED status, got: %s", StatusRevoked)
    }
}

// TestStateKeyConstants tests the state key constants
func TestStateKeyConstants(t *testing.T) {
    if GlobalPauseKey != "global_paused" {
        t.Errorf("Expected global pause key to be 'global_paused', got: %s", GlobalPauseKey)
    }
    
    if ClientPauseKey != "client_paused_" {
        t.Errorf("Expected client pause key to be 'client_paused_', got: %s", ClientPauseKey)
    }
    
    if WalletPauseKey != "wallet_paused_" {
        t.Errorf("Expected wallet pause key to be 'wallet_paused_', got: %s", WalletPauseKey)
    }
    
    if FrozenAddressKey != "frozen_address_" {
        t.Errorf("Expected frozen address key to be 'frozen_address_', got: %s", FrozenAddressKey)
    }
} 