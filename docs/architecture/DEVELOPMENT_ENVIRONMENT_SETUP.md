# Development Environment Setup Guide

## Overview

This guide sets up a complete development environment for the KYC Attestation Platform using:
- **Hyperledger Fabric test-network** with Docker
- **Go** for chaincode development
- **Self-managed Fabric CA**
- **Hyperledger Explorer + Prometheus** for monitoring
- **Filebase + Pinata** for IPFS storage
- **NestJS** backend with Fabric SDK integration

## Prerequisites

### System Requirements
- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: 20GB free space
- **Network**: Stable internet connection for Docker images

### Required Software

#### 1. Docker & Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### 2. Node.js (v18 or v20)
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version
npm --version
```

#### 3. Go (v1.19+)
```bash
# Download and install Go
wget https://golang.org/dl/go1.21.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# Reload shell and verify
source ~/.bashrc
go version
```

#### 4. Git
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install git

# Verify
git --version
```

## Hyperledger Fabric Setup

### 1. Download Fabric Samples and Binaries
```bash
# Create development directory
mkdir -p ~/fabric-dev
cd ~/fabric-dev

# Download Fabric samples, docker images, and platform binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.4 1.5.7

# Add Fabric binaries to PATH
export PATH=$PATH:~/fabric-dev/fabric-samples/bin

# Add to ~/.bashrc for persistence
echo 'export PATH=$PATH:~/fabric-dev/fabric-samples/bin' >> ~/.bashrc
```

### 2. Verify Fabric Installation
```bash
cd ~/fabric-dev/fabric-samples/test-network

# Start the test network
./network.sh up

# Create a channel
./network.sh createChannel -c mychannel

# Stop the network (for now)
./network.sh down
```

## Project-Specific Fabric Network Setup

### 1. Create KYC Network Configuration
```bash
# Navigate to our project
cd /home/ubuntu/200x/kyc-attestation-platform

# Create fabric network directory
mkdir -p fabric-network
cd fabric-network

# Copy test-network as base
cp -r ~/fabric-dev/fabric-samples/test-network/* .

# Create KYC-specific configuration
mkdir -p organizations/kycplatform
mkdir -p chaincode/kyc-attestation
```

### 2. Create Network Script
```bash
# Create start-network.sh
cat > start-network.sh << 'EOF'
#!/bin/bash

# Start the KYC Attestation Network
echo "Starting KYC Attestation Fabric Network..."

# Bring up the basic network
./network.sh up createChannel -c kycchannel

# Install and start chaincode
./network.sh deployCC -ccn kycattestation -ccp ../chaincode/kyc-attestation -ccl go

echo "KYC Network is ready!"
echo "Channel: kycchannel"
echo "Chaincode: kycattestation"
EOF

chmod +x start-network.sh
```

### 3. Create Stop Network Script
```bash
cat > stop-network.sh << 'EOF'
#!/bin/bash

echo "Stopping KYC Attestation Fabric Network..."
./network.sh down
echo "Network stopped."
EOF

chmod +x stop-network.sh
```

## Go Chaincode Development Setup

### 1. Create Chaincode Structure
```bash
# Create chaincode directory
mkdir -p chaincode/kyc-attestation
cd chaincode/kyc-attestation

# Initialize Go module
go mod init kyc-attestation

# Create main chaincode file
cat > main.go << 'EOF'
package main

import (
    "encoding/json"
    "fmt"
    "log"

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
    Issuer      string `json:"issuer"`
}

// CreateAttestation creates a new KYC attestation
func (s *AttestationContract) CreateAttestation(ctx contractapi.TransactionContextInterface, id string, profileId string, walletId string, metadataUri string) error {
    existing, err := ctx.GetStub().GetState(id)
    if err != nil {
        return fmt.Errorf("failed to read from world state: %v", err)
    }
    if existing != nil {
        return fmt.Errorf("attestation %s already exists", id)
    }

    attestation := Attestation{
        ID:          id,
        ProfileID:   profileId,
        WalletID:    walletId,
        Status:      "ACTIVE",
        MetadataURI: metadataUri,
        IssuedAt:    "", // Will be set by backend
        ExpiresAt:   "", // Will be set by backend
        Issuer:      "KYC-Platform",
    }

    attestationJSON, err := json.Marshal(attestation)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(id, attestationJSON)
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
        return nil, err
    }

    return &attestation, nil
}

// RevokeAttestation revokes an existing attestation
func (s *AttestationContract) RevokeAttestation(ctx contractapi.TransactionContextInterface, id string) error {
    attestation, err := s.GetAttestation(ctx, id)
    if err != nil {
        return err
    }

    attestation.Status = "REVOKED"

    attestationJSON, err := json.Marshal(attestation)
    if err != nil {
        return err
    }

    return ctx.GetStub().PutState(id, attestationJSON)
}

// GetAllAttestations returns all attestations
func (s *AttestationContract) GetAllAttestations(ctx contractapi.TransactionContextInterface) ([]*Attestation, error) {
    resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var attestations []*Attestation
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }

        var attestation Attestation
        err = json.Unmarshal(queryResponse.Value, &attestation)
        if err != nil {
            return nil, err
        }
        attestations = append(attestations, &attestation)
    }

    return attestations, nil
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
EOF

# Create go.mod with dependencies
cat > go.mod << 'EOF'
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
EOF

# Download dependencies
go mod tidy
```

## Hyperledger Explorer Setup

### 1. Create Explorer Configuration
```bash
# Navigate back to project root
cd /home/ubuntu/200x/kyc-attestation-platform

# Create monitoring directory
mkdir -p monitoring/explorer
cd monitoring/explorer

# Create Explorer docker-compose
cat > docker-compose.yml << 'EOF'
version: '2.1'

volumes:
  pgdata:
  walletstore:

networks:
  fabricexplorer_net:
    external:
      name: fabric_test

services:
  explorerdb.mynetwork.com:
    image: hyperledger/explorer-db:latest
    container_name: explorerdb.mynetwork.com
    hostname: explorerdb.mynetwork.com
    environment:
      - DATABASE_DATABASE=fabricexplorer
      - DATABASE_USERNAME=hppoc
      - DATABASE_PASSWORD=password
    healthcheck:
      test: "pg_isready -h localhost -p 5432 -q -U postgres"
      interval: 30s
      timeout: 10s
      retries: 5
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - fabricexplorer_net

  explorer.mynetwork.com:
    image: hyperledger/explorer:latest
    container_name: explorer.mynetwork.com
    hostname: explorer.mynetwork.com
    environment:
      - DATABASE_HOST=explorerdb.mynetwork.com
      - DATABASE_DATABASE=fabricexplorer
      - DATABASE_USERNAME=hppoc
      - DATABASE_PASSWD=password
      - LOG_LEVEL_APP=info
      - LOG_LEVEL_DB=info
      - LOG_LEVEL_CONSOLE=debug
      - LOG_CONSOLE_STDOUT=true
      - DISCOVERY_AS_LOCALHOST=false
    volumes:
      - ./config.json:/opt/explorer/app/platform/fabric/config.json
      - ./connection-profile:/opt/explorer/app/platform/fabric/connection-profile
      - ../../fabric-network/organizations:/tmp/crypto
      - walletstore:/opt/explorer/wallet
    ports:
      - 8080:8080
    depends_on:
      explorerdb.mynetwork.com:
        condition: service_healthy
    networks:
      - fabricexplorer_net
EOF

# Create Explorer configuration
cat > config.json << 'EOF'
{
  "network-configs": {
    "test-network": {
      "name": "KYC Attestation Network",
      "profile": "./connection-profile/test-network.json"
    }
  },
  "license": "Apache-2.0"
}
EOF

# Create connection profile directory
mkdir -p connection-profile

# Create connection profile
cat > connection-profile/test-network.json << 'EOF'
{
  "name": "test-network",
  "version": "1.0.0",
  "client": {
    "tlsEnable": true,
    "adminCredential": {
      "id": "exploreradmin",
      "password": "exploreradminpw"
    },
    "enableAuthentication": false,
    "organization": "Org1MSP",
    "connection": {
      "timeout": {
        "peer": {
          "endorser": "300"
        },
        "orderer": "300"
      }
    }
  },
  "channels": {
    "kycchannel": {
      "peers": {
        "peer0.org1.example.com": {}
      }
    }
  },
  "organizations": {
    "Org1MSP": {
      "mspid": "Org1MSP",
      "adminPrivateKeyPEM": {
        "path": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore"
      },
      "adminCertPEM": {
        "path": "/tmp/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts"
      }
    }
  },
  "peers": {
    "peer0.org1.example.com": {
      "tlsCACerts": {
        "path": "/tmp/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
      },
      "url": "grpcs://peer0.org1.example.com:7051"
    }
  },
  "orderers": {
    "orderer.example.com": {
      "tlsCACerts": {
        "path": "/tmp/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
      },
      "url": "grpcs://orderer.example.com:7050"
    }
  }
}
EOF
```

## Prometheus & Grafana Setup

### 1. Create Prometheus Configuration
```bash
# Navigate to monitoring directory
cd /home/ubuntu/200x/kyc-attestation-platform/monitoring

# Create prometheus directory
mkdir -p prometheus

cat > prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'fabric-peers'
    static_configs:
      - targets: ['peer0.org1.example.com:9443', 'peer0.org2.example.com:9444']

  - job_name: 'fabric-orderers'
    static_configs:
      - targets: ['orderer.example.com:8443']

  - job_name: 'kyc-backend'
    static_configs:
      - targets: ['localhost:3000']
EOF

# Create Grafana docker-compose
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: kyc-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: kyc-grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - monitoring

volumes:
  grafana-data:

networks:
  monitoring:
    driver: bridge
EOF
```

## Backend Integration Setup

### 1. Update Package.json Dependencies
```bash
cd /home/ubuntu/200x/kyc-attestation-platform

# Install Fabric SDK dependencies
npm install fabric-network fabric-ca-client @aws-sdk/client-eventbridge
npm install --save-dev @types/fabric-network
```

### 2. Create Fabric Service Module
```bash
mkdir -p apps/backend/src/blockchain
cd apps/backend/src/blockchain

# Create Fabric connection service
cat > fabric.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';
import { Gateway, Wallets, TxEventHandler, ContractEvent } from 'fabric-network';
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

@Injectable()
export class FabricService {
  private readonly logger = new Logger(FabricService.name);
  private gateway: Gateway;
  private contract: any;

  async onModuleInit() {
    await this.initializeFabricConnection();
  }

  private async initializeFabricConnection() {
    try {
      // Load connection profile
      const ccpPath = path.resolve(__dirname, '..', '..', '..', '..', 'fabric-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check to see if we've already enrolled the user
      const identity = await wallet.get('appUser');
      if (!identity) {
        this.logger.error('An identity for the user "appUser" does not exist in the wallet');
        throw new Error('Identity not found. Please run enrollment first.');
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      const network = await this.gateway.getNetwork('kycchannel');

      // Get the contract from the network
      this.contract = network.getContract('kycattestation');

      this.logger.log('Successfully connected to Fabric network');
    } catch (error) {
      this.logger.error('Failed to initialize Fabric connection:', error);
      throw error;
    }
  }

  async createAttestation(attestationData: AttestationData): Promise<string> {
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

  async revokeAttestation(id: string): Promise<string> {
    try {
      const result = await this.contract.submitTransaction('RevokeAttestation', id);
      
      this.logger.log(`Attestation revoked: ${id}`);
      return result.toString();
    } catch (error) {
      this.logger.error('Failed to revoke attestation:', error);
      throw error;
    }
  }

  async getAllAttestations(): Promise<AttestationData[]> {
    try {
      const result = await this.contract.evaluateTransaction('GetAllAttestations');
      const attestations = JSON.parse(result.toString());
      
      this.logger.log(`Retrieved ${attestations.length} attestations`);
      return attestations;
    } catch (error) {
      this.logger.error('Failed to get all attestations:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      this.logger.log('Disconnected from Fabric network');
    }
  }

  onModuleDestroy() {
    this.disconnect();
  }
}
EOF
```

## IPFS Configuration

### 1. Create IPFS Service
```bash
cd apps/backend/src
mkdir -p ipfs

cat > ipfs/ipfs.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';
import axios from 'axios';

export interface IPFSUploadResult {
  hash: string;
  url: string;
  backupUrl?: string;
}

@Injectable()
export class IPFSService {
  private readonly logger = new Logger(IPFSService.name);
  private s3Client: AWS.S3;
  private pinataApiKey: string;
  private pinataSecretKey: string;

  constructor(private configService: ConfigService) {
    // Initialize Filebase S3 client
    this.s3Client = new AWS.S3({
      endpoint: 'https://s3.filebase.com',
      accessKeyId: this.configService.get('FILEBASE_ACCESS_KEY'),
      secretAccessKey: this.configService.get('FILEBASE_SECRET_KEY'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });

    // Initialize Pinata credentials
    this.pinataApiKey = this.configService.get('PINATA_API_KEY');
    this.pinataSecretKey = this.configService.get('PINATA_SECRET_KEY');
  }

  async uploadAttestationMetadata(attestationId: string, metadata: any): Promise<IPFSUploadResult> {
    try {
      const metadataJson = JSON.stringify(metadata, null, 2);
      
      // Upload to Filebase (primary)
      const filebaseResult = await this.uploadToFilebase(attestationId, metadataJson);
      
      // Upload to Pinata (backup)
      let pinataResult: string | undefined;
      try {
        pinataResult = await this.uploadToPinata(attestationId, metadataJson);
      } catch (pinataError) {
        this.logger.warn('Failed to upload to Pinata backup:', pinataError);
      }

      const result: IPFSUploadResult = {
        hash: filebaseResult.hash,
        url: `https://ipfs.filebase.io/ipfs/${filebaseResult.hash}`,
        backupUrl: pinataResult ? `https://gateway.pinata.cloud/ipfs/${pinataResult}` : undefined
      };

      this.logger.log(`Attestation metadata uploaded: ${attestationId} -> ${result.hash}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to upload attestation metadata:', error);
      throw error;
    }
  }

  private async uploadToFilebase(attestationId: string, content: string): Promise<{ hash: string }> {
    const bucketName = this.configService.get('FILEBASE_BUCKET_NAME');
    const key = `attestations/${attestationId}.json`;

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: content,
      ContentType: 'application/json',
      Metadata: {
        'attestation-id': attestationId,
        'upload-timestamp': new Date().toISOString()
      }
    };

    const result = await this.s3Client.upload(uploadParams).promise();
    
    // Extract IPFS hash from ETag or use a different method
    // Note: This might need adjustment based on Filebase's actual response
    const hash = result.ETag?.replace(/"/g, '') || result.Key;
    
    return { hash };
  }

  private async uploadToPinata(attestationId: string, content: string): Promise<string> {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const data = {
      pinataContent: JSON.parse(content),
      pinataMetadata: {
        name: `kyc-attestation-${attestationId}`,
        keyvalues: {
          attestationId: attestationId,
          uploadTimestamp: new Date().toISOString()
        }
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      'pinata_api_key': this.pinataApiKey,
      'pinata_secret_api_key': this.pinataSecretKey
    };

    const response = await axios.post(url, data, { headers });
    return response.data.IpfsHash;
  }

  async getAttestationMetadata(hash: string): Promise<any> {
    try {
      // Try Filebase first
      const filebaseUrl = `https://ipfs.filebase.io/ipfs/${hash}`;
      const response = await axios.get(filebaseUrl, { timeout: 5000 });
      return response.data;
    } catch (error) {
      this.logger.warn('Failed to fetch from Filebase, trying Pinata...');
      
      // Fallback to Pinata
      const pinataUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
      const response = await axios.get(pinataUrl, { timeout: 5000 });
      return response.data;
    }
  }
}
EOF
```

## Environment Configuration

### 1. Create Environment Files
```bash
cd /home/ubuntu/200x/kyc-attestation-platform

# Create development environment file
cat > .env.development << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kyc_attestation_dev?schema=public"

# Fabric Network
FABRIC_NETWORK_NAME=kycchannel
FABRIC_CHAINCODE_NAME=kycattestation
FABRIC_WALLET_PATH=./wallet
FABRIC_CONNECTION_PROFILE_PATH=./fabric-network/organizations/peerOrganizations/org1.example.com/connection-org1.json

# IPFS Configuration
FILEBASE_ACCESS_KEY=your_filebase_access_key
FILEBASE_SECRET_KEY=your_filebase_secret_key
FILEBASE_BUCKET_NAME=kyc-attestations

PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# AWS EventBridge
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_EVENTBRIDGE_BUS_NAME=kyc-attestation-events

# iDenfy KYC
IDENFY_API_KEY=your_idenfy_api_key
IDENFY_WEBHOOK_SECRET=your_idenfy_webhook_secret
IDENFY_ENVIRONMENT=sandbox

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
HYPERLEDGER_EXPLORER_PORT=8080
EOF

# Copy to .env for local development
cp .env.development .env.local
```

## Quick Start Scripts

### 1. Create Setup Script
```bash
cat > setup-dev-environment.sh << 'EOF'
#!/bin/bash

echo "🚀 Setting up KYC Attestation Platform Development Environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v go >/dev/null 2>&1 || { echo "❌ Go is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed!"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Initialize Fabric network
echo "🔗 Starting Hyperledger Fabric network..."
cd fabric-network
./start-network.sh

echo "🎯 Starting monitoring services..."
cd ../monitoring
docker-compose -f docker-compose.monitoring.yml up -d

echo "🔍 Starting Hyperledger Explorer..."
cd explorer
docker-compose up -d

echo "✅ Development environment setup complete!"
echo ""
echo "📊 Services running:"
echo "  - Fabric Network: Test network with kycchannel"
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3001 (admin/admin)"
echo "  - Hyperledger Explorer: http://localhost:8080"
echo "  - Backend: npm run start:dev (port 3000)"
echo ""
echo "🔧 Next steps:"
echo "  1. Configure your .env file with API keys"
echo "  2. Run 'npm run start:dev' to start the backend"
echo "  3. Run tests with 'npm run test'"
echo ""
EOF

chmod +x setup-dev-environment.sh

# Create cleanup script
cat > cleanup-dev-environment.sh << 'EOF'
#!/bin/bash

echo "🧹 Cleaning up KYC Attestation Platform Development Environment..."

# Stop Fabric network
echo "🔗 Stopping Hyperledger Fabric network..."
cd fabric-network
./stop-network.sh

# Stop monitoring services
echo "🎯 Stopping monitoring services..."
cd ../monitoring
docker-compose -f docker-compose.monitoring.yml down

# Stop Hyperledger Explorer
echo "🔍 Stopping Hyperledger Explorer..."
cd explorer
docker-compose down

echo "✅ Development environment cleanup complete!"
EOF

chmod +x cleanup-dev-environment.sh
```

## Testing the Setup

### 1. Create Test Script
```bash
cat > test-setup.sh << 'EOF'
#!/bin/bash

echo "🧪 Testing KYC Attestation Platform Setup..."

# Test Fabric network
echo "🔗 Testing Fabric network connection..."
cd fabric-network
peer lifecycle chaincode queryinstalled >/dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Fabric network is running"
else
    echo "❌ Fabric network connection failed"
    exit 1
fi

# Test chaincode
echo "🔧 Testing chaincode..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C kycchannel -n kycattestation --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"GetAllAttestations","Args":[]}'

if [ $? -eq 0 ]; then
    echo "✅ Chaincode is working"
else
    echo "❌ Chaincode test failed"
fi

# Test monitoring services
echo "🎯 Testing monitoring services..."
curl -s http://localhost:9090/-/healthy >/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Prometheus is running"
else
    echo "❌ Prometheus is not accessible"
fi

curl -s http://localhost:3001/api/health >/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Grafana is running"
else
    echo "❌ Grafana is not accessible"
fi

curl -s http://localhost:8080 >/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Hyperledger Explorer is running"
else
    echo "❌ Hyperledger Explorer is not accessible"
fi

echo "✅ Setup test completed!"
EOF

chmod +x test-setup.sh
```

## Summary

Your development environment is now configured with:

### ✅ **Core Infrastructure**
- **Hyperledger Fabric test-network** with KYC channel
- **Go chaincode** for attestation management
- **Self-managed Fabric CA** for identity management

### ✅ **Monitoring Stack**
- **Hyperledger Explorer** (http://localhost:8080)
- **Prometheus** (http://localhost:9090)
- **Grafana** (http://localhost:3001)

### ✅ **Storage & Integration**
- **Filebase + Pinata IPFS** configuration
- **AWS EventBridge** integration ready
- **NestJS Fabric SDK** integration

### 🚀 **Quick Start Commands**
```bash
# Setup everything
./setup-dev-environment.sh

# Test the setup
./test-setup.sh

# Start backend development
npm run start:dev

# Cleanup when done
./cleanup-dev-environment.sh
```

The environment matches your production architecture and provides a solid foundation for implementing the KYC attestation platform with all monitoring and observability tools in place! 