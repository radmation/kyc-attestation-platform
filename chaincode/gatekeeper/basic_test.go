package main

import (
    "testing"
    "time"
    
    "github.com/hyperledger/fabric-contract-api-go/contractapi"
    "github.com/hyperledger/fabric-chaincode-go/shimtest"
)

// TestPauseUnpauseLogic tests the pause/unpause functionality which doesn't require chaincode invocation
func TestPauseUnpauseLogic(t *testing.T) {
    contract := &GatekeeperContract{paused: false}
    
    // Test paused state check in CheckCompliance
    ctx := &contractapi.TransactionContext{}
    ctx.SetStub(shimtest.NewMockStub("test", nil))
    
    // Set contract to paused
    contract.paused = true
    
    result, err := contract.CheckCompliance(ctx, "0x123", "0x456")
    if err != nil {
        t.Fatalf("Expected no error, got: %v", err)
    }
    
    if result.IsCompliant {
        t.Error("Expected compliance to be false when contract is paused")
    }
    
    if result.Reason != "Contract is currently paused" {
        t.Errorf("Expected pause message, got: %s", result.Reason)
    }
    
    // Verify basic structure
    if result.Sender != "0x123" || result.Receiver != "0x456" {
        t.Error("Expected correct sender/receiver addresses")
    }
    
    if result.CheckedAt == "" {
        t.Error("Expected timestamp to be set")
    }
}

// TestComplianceResultStructure tests the basic result structure
func TestComplianceResultStructure(t *testing.T) {
    contract := &GatekeeperContract{paused: false}
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
    
    // Test default state
    if contract.paused {
        t.Error("Expected contract to be unpaused by default")
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

// TestAdminRole tests the admin role constant
func TestAdminRole(t *testing.T) {
    if AdminRole != "admin" {
        t.Errorf("Expected admin role to be 'admin', got: %s", AdminRole)
    }
} 