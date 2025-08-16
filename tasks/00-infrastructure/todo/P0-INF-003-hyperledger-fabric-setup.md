# Task: Hyperledger Fabric Network Setup

## Meta Information
- **Task ID**: P0-INF-003
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P0 (Critical)
- **Estimate**: L (2-3 weeks)
- **Sprint**: Sprint 1-2
- **Assignee**: AI Developer

## Dependencies
- None (foundational blockchain infrastructure)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Blockchain**: Hyperledger Fabric network at `/fabric-network/`
- **Chaincode**: Go smart contracts at `/chaincode/kyc-attestation/`
- **Development Env**: Documented at `/docs/DEVELOPMENT_ENVIRONMENT_SETUP.md`

**Related Files**: 
- Reference: `/docs/DEVELOPMENT_ENVIRONMENT_SETUP.md` (Fabric setup guide)
- Pattern: Based on Fabric test-network with KYC customizations
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md` section 1 (Blockchain Infrastructure)

## Objective
Set up a complete Hyperledger Fabric development network with KYC-specific channel, Go chaincode for attestations, and integration with the NestJS backend for blockchain operations.

## Detailed Implementation Instructions

### Step 1: Create Fabric Network Directory Structure
**Action**: Create the fabric network directory structure

```bash
mkdir -p fabric-network/{organizations,chaincode,scripts,config}
mkdir -p fabric-network/organizations/{ordererOrganizations,peerOrganizations,kycplatform}
mkdir -p chaincode/kyc-attestation
```

### Step 2: Copy and Customize Test Network
**File**: `/fabric-network/network.sh`
**Action**: Create customized network script based on Fabric test-network

```bash
#!/bin/bash
# Based on Hyperledger Fabric test-network but customized for KYC platform

# Set environment variables
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

# Channel configuration
CHANNEL_NAME="kycchannel"
CHAINCODE_NAME="kycattestation"
CHAINCODE_PATH="../chaincode/kyc-attestation"
CHAINCODE_LANGUAGE="go"
CC_VERSION="1.0"
CC_SEQUENCE="1"

function createChannel() {
    echo "Creating KYC channel..."
    
    # Generate channel configuration
    configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/$CHANNEL_NAME.tx -channelID $CHANNEL_NAME
    
    # Create channel
    peer channel create -o localhost:7050 -c $CHANNEL_NAME --ordererTLSHostnameOverride orderer.example.com -f ./channel-artifacts/$CHANNEL_NAME.tx --outputBlock ./channel-artifacts/$CHANNEL_NAME.block --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    # Join channel
    peer channel join -b ./channel-artifacts/$CHANNEL_NAME.block
    
    echo "KYC channel created successfully"
}

function deployChaincode() {
    echo "Deploying KYC attestation chaincode..."
    
    # Package chaincode
    peer lifecycle chaincode package $CHAINCODE_NAME.tar.gz --path $CHAINCODE_PATH --lang $CHAINCODE_LANGUAGE --label ${CHAINCODE_NAME}_${CC_VERSION}
    
    # Install chaincode on peer
    peer lifecycle chaincode install $CHAINCODE_NAME.tar.gz
    
    # Get package ID
    peer lifecycle chaincode queryinstalled >&log.txt
    PACKAGE_ID=$(sed -n "/${CHAINCODE_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    
    # Approve chaincode definition
    peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CC_VERSION --package-id $PACKAGE_ID --sequence $CC_SEQUENCE --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    
    # Commit chaincode definition
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID $CHANNEL_NAME --name $CHAINCODE_NAME --version $CC_VERSION --sequence $CC_SEQUENCE --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
    
    echo "KYC attestation chaincode deployed successfully"
}

# Main execution
case $1 in
    up)
        echo "Starting KYC Fabric network..."
        ./network.sh up createChannel
        createChannel
        ;;
    deployCC)
        deployChaincode
        ;;
    down)
        echo "Stopping KYC Fabric network..."
        ./network.sh down
        ;;
    *)
        echo "Usage: $0 {up|deployCC|down}"
        exit 1
        ;;
esac
```

### Step 3: Create Go Chaincode for KYC Attestations
**File**: `/chaincode/kyc-attestation/main.go`
**Action**: Create the main KYC attestation chaincode

```go
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
```

### Step 4: Create Go Module for Chaincode
**File**: `/chaincode/kyc-attestation/go.mod`
**Action**: Create Go module definition

```go
module kyc-attestation

go 1.21

require github.com/hyperledger/fabric-contract-api-go v1.2.1

require (
    github.com/gobuffalo/envy v1.10.2 // indirect
    github.com/gobuffalo/packd v1.0.2 // indirect
    github.com/gobuffalo/packr v1.30.1 // indirect
    github.com/hyperledger/fabric-chaincode-go v0.0.0-20230228194215-b84622ba6a7a // indirect
    github.com/hyperledger/fabric-lib-go v1.0.0 // indirect
    github.com/hyperledger/fabric-protos-go v0.3.0 // indirect
    github.com/joho/godotenv v1.4.0 // indirect
    github.com/rogpeppe/go-internal v1.9.0 // indirect
    github.com/xeipuuv/gojsonpointer v0.0.0-20190905194746-02993c407bfb // indirect
    github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
    github.com/xeipuuv/gojsonschema v1.2.0 // indirect
    google.golang.org/grpc v1.51.0 // indirect
    google.golang.org/protobuf v1.28.1 // indirect
)
```

### Step 5: Create NestJS Fabric Service Integration
**File**: `/apps/backend/src/blockchain/fabric.service.ts`
**Action**: Create Fabric blockchain service for NestJS integration

```typescript
import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Gateway, Wallets, Network, Contract } from 'fabric-network';
import * as FabricCAServices from 'fabric-ca-client';
import * as fs from 'fs';
import * as path from 'path';

export interface AttestationData {
  id: string;
  profileId: string;
  walletId: string;
  metadataUri: string;
  status?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface FabricEventData {
  eventName: string;
  chaincodeId: string;
  txId: string;
  payload: any;
}

@Injectable()
export class FabricService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FabricService.name);
  private gateway: Gateway;
  private network: Network;
  private contract: Contract;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      await this.initializeFabricConnection();
      await this.setupEventListeners();
    } catch (error) {
      this.logger.error('Failed to initialize Fabric connection:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async initializeFabricConnection() {
    try {
      // Load connection profile
      const ccpPath = this.configService.get<string>('FABRIC_CONNECTION_PROFILE_PATH') ||
        path.resolve(__dirname, '..', '..', '..', '..', 'fabric-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
      
      if (!fs.existsSync(ccpPath)) {
        throw new Error(`Connection profile not found at: ${ccpPath}`);
      }

      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities
      const walletPath = this.configService.get<string>('FABRIC_WALLET_PATH') ||
        path.join(process.cwd(), 'wallet');
      
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check to see if we've already enrolled the user
      const identity = await wallet.get('appUser');
      if (!identity) {
        throw new Error('An identity for the user "appUser" does not exist in the wallet. Please run enrollment first.');
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      const channelName = this.configService.get<string>('FABRIC_NETWORK_NAME') || 'kycchannel';
      this.network = await this.gateway.getNetwork(channelName);

      // Get the contract from the network
      const chaincodeName = this.configService.get<string>('FABRIC_CHAINCODE_NAME') || 'kycattestation';
      this.contract = this.network.getContract(chaincodeName);

      this.isConnected = true;
      this.logger.log('Successfully connected to Fabric network');
    } catch (error) {
      this.logger.error('Failed to initialize Fabric connection:', error);
      throw error;
    }
  }

  private async setupEventListeners() {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      // Listen for chaincode events
      const listener = await this.contract.addContractListener('AttestationEvent', (event) => {
        this.handleFabricEvent({
          eventName: event.eventName,
          chaincodeId: event.chaincodeId,
          txId: event.getTransactionEvent().transactionId,
          payload: event.payload ? JSON.parse(event.payload.toString()) : null,
        });
      });

      this.logger.log('Fabric event listeners configured');
    } catch (error) {
      this.logger.error('Failed to setup event listeners:', error);
    }
  }

  private handleFabricEvent(eventData: FabricEventData) {
    this.logger.log(`Received Fabric event: ${eventData.eventName}`, {
      txId: eventData.txId,
      payload: eventData.payload,
    });

    // Here you can add logic to handle different types of events
    // For example, update database, send notifications, etc.
  }

  async createAttestation(attestationData: AttestationData): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.submitTransaction(
        'CreateAttestation',
        attestationData.id,
        attestationData.profileId,
        attestationData.walletId,
        attestationData.metadataUri
      );

      this.logger.log(`Attestation created: ${attestationData.id}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to create attestation:', error);
      throw error;
    }
  }

  async getAttestation(id: string): Promise<AttestationData> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetAttestation', id);
      const attestation = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved attestation: ${id}`);
      return attestation;
    } catch (error) {
      this.logger.error('Failed to get attestation:', error);
      throw error;
    }
  }

  async updateAttestationStatus(id: string, status: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.submitTransaction('UpdateAttestationStatus', id, status);
      
      this.logger.log(`Attestation status updated: ${id} -> ${status}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to update attestation status:', error);
      throw error;
    }
  }

  async revokeAttestation(id: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.submitTransaction('RevokeAttestation', id);
      
      this.logger.log(`Attestation revoked: ${id}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to revoke attestation:', error);
      throw error;
    }
  }

  async getAttestationsByWallet(walletId: string): Promise<AttestationData[]> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetAttestationsByWallet', walletId);
      const attestations = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved ${attestations.length} attestations for wallet: ${walletId}`);
      return attestations;
    } catch (error) {
      this.logger.error('Failed to get attestations by wallet:', error);
      throw error;
    }
  }

  async getAttestationHistory(id: string): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Fabric connection not established');
    }

    try {
      const result = await this.contract.evaluateTransaction('GetAttestationHistory', id);
      const history = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved history for attestation: ${id}`);
      return history;
    } catch (error) {
      this.logger.error('Failed to get attestation history:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.isConnected = false;
      this.logger.log('Disconnected from Fabric network');
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}
```

### Step 6: Create Blockchain Module
**File**: `/apps/backend/src/blockchain/blockchain.module.ts`
**Action**: Create NestJS module for blockchain integration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FabricService } from './fabric.service';

@Module({
  imports: [ConfigModule],
  providers: [FabricService],
  exports: [FabricService],
})
export class BlockchainModule {}
```

### Step 7: Create Helper Scripts
**File**: `/fabric-network/scripts/deployCC.sh`
**Action**: Create chaincode deployment script

```bash
#!/bin/bash

# Environment setup
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

CHANNEL_NAME="kycchannel"
CHAINCODE_NAME="kycattestation"
CHAINCODE_PATH="../chaincode/kyc-attestation"
CC_VERSION="1.0"
CC_SEQUENCE="1"

echo "Deploying KYC Attestation Chaincode..."

# Package chaincode
echo "Packaging chaincode..."
peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz \
    --path ${CHAINCODE_PATH} \
    --lang golang \
    --label ${CHAINCODE_NAME}_${CC_VERSION}

# Install chaincode
echo "Installing chaincode on peers..."
peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz

# Get package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled --output json | jq -r ".installed_chaincodes[0].package_id")
echo "Package ID: $PACKAGE_ID"

# Approve chaincode definition for Org1
echo "Approving chaincode definition for Org1..."
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CC_VERSION \
    --package-id $PACKAGE_ID \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Check commit readiness
echo "Checking commit readiness..."
peer lifecycle chaincode checkcommitreadiness \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --output json

# Commit chaincode definition
echo "Committing chaincode definition..."
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.example.com \
    --channelID $CHANNEL_NAME \
    --name $CHAINCODE_NAME \
    --version $CC_VERSION \
    --sequence $CC_SEQUENCE \
    --tls \
    --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

echo "Chaincode deployment completed successfully!"
```

### Step 8: Update Backend Module to Include Blockchain
**File**: `/apps/backend/src/backend.module.ts`
**Action**: Add blockchain module to main application

```typescript
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { DatabaseModule } from './database/database.module';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { createRateLimitConfig } from './shared/config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createRateLimitConfig,
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    BlockchainModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class BackendModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
```

## Acceptance Criteria
- [ ] **Functional**: Fabric network starts and creates KYC channel successfully
- [ ] **Technical**: Go chaincode compiles, deploys, and executes correctly
- [ ] **Integration**: NestJS backend can connect to Fabric and execute transactions
- [ ] **Testing**: Chaincode functions work via peer CLI and backend service
- [ ] **Documentation**: Network setup is documented and reproducible

## Verification Steps
1. **Network Setup**: `./network.sh up` starts Fabric network successfully
2. **Channel Creation**: KYC channel is created and peers join
3. **Chaincode Deployment**: Go chaincode deploys without errors
4. **Transaction Testing**: Can create and query attestations via CLI
5. **Backend Integration**: NestJS service connects and executes transactions
6. **Event Listening**: Fabric events are received by backend service

## Expected Deliverables
- [ ] Complete Fabric network configuration
- [ ] Go chaincode for KYC attestations with full functionality
- [ ] NestJS Fabric service for blockchain integration
- [ ] Deployment scripts and helper utilities
- [ ] Blockchain module integrated with main application
- [ ] Event listening and error handling

## Error Handling Requirements
- Implement connection retry logic for Fabric gateway
- Add comprehensive error logging for blockchain operations
- Handle chaincode execution failures gracefully
- Include transaction timeout and retry mechanisms

## References
- **Architecture**: `/docs/TECHNICAL_SPECIFICATIONS.md` Section 1
- **Setup Guide**: `/docs/DEVELOPMENT_ENVIRONMENT_SETUP.md`
- **Fabric Documentation**: https://hyperledger-fabric.readthedocs.io/
- **Cursor Rules**: `/.cursorrules` (blockchain integration patterns)

## Notes for AI
- Use exact file paths from project root
- Follow Go naming conventions for chaincode
- Ensure proper error handling in all blockchain operations
- Add comprehensive logging for debugging
- Test both CLI and backend integration
- Follow Fabric best practices for chaincode development

## Progress Log
- **Created**: 2024-01-15
- **Started**: 
- **Last Update**: 
- **Completed**: 

## Status History
- 2024-01-15 - Created in todo/ 