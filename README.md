# KYC Attestation Platform

## 🚨 CRITICAL: Git Workflow & Task Management

**BEFORE STARTING ANY WORK, READ THIS SECTION CAREFULLY**

This project uses a strict git workflow and task management process that **MUST** be followed:

1. **ALWAYS check for tasks in review first** and prioritize completing those
2. **NEVER start a new task without creating a proper branch**
3. **ALWAYS use the task-utils.sh script** to manage tasks

```bash
# Required workflow - ALWAYS follow these steps
./task-utils.sh status  # Check current status
./task-utils.sh next    # See what task to work on next
./task-utils.sh start P0-XXX-XXX  # Start a task properly
```

**For complete details, read [tasks/GIT_WORKFLOW.md](tasks/GIT_WORKFLOW.md)**

---

## Overview

This is a Know Your Customer (KYC) Attestation Platform designed for token issuers to achieve compliance with the GENIUS Act and other regulatory requirements. The platform creates on-chain attestations for verified identities and provides smart contract integration for automated compliance enforcement.

## Project Overview

This project is a Know Your Customer (KYC) Attestation Platform designed to streamline and secure the process of identity verification and compliance. It features a NestJS backend integrated with Hyperledger Fabric blockchain for immutable attestations, along with PostgreSQL for operational data storage. The platform is designed with scalability, security, and regulatory compliance in mind.

## Key Features

* **Blockchain-Based Attestations**: Immutable record of KYC verifications
* **Smart Contract Automation**: Automated compliance enforcement
* **Secure Identity Management**: PKI-based identity system
* **Event-Driven Architecture**: Real-time updates and notifications
* **Audit Trail**: Complete history of all attestations
* **Privacy by Design**: No PII stored on-chain

## Project Structure

The project is structured as a monorepo containing all components:

```text
.
├── apps/
│   └── backend/             # NestJS backend application
│       ├── src/
│       │   ├── blockchain/  # Fabric integration
│       │   └── prisma/      # Database schema and migrations
│       └── .env.example     # Environment variables template
├── chaincode/
│   └── kyc-attestation/     # Go chaincode for attestations
├── fabric-network/          # Hyperledger Fabric network
│   ├── organizations/       # Network organizations and certificates
│   ├── scripts/            # Network management scripts
│   └── config/             # Network configuration
├── Dockerfile              # Backend Dockerfile
├── docker-compose.yml      # Service orchestration
└── README.md              # This documentation
```

## Technologies Used

* **Backend Framework:** NestJS (TypeScript)
* **Blockchain:** Hyperledger Fabric
* **Smart Contracts:** Go (Chaincode)
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Identity:** Fabric CA with X.509 certificates
* **Containerization:** Docker, Docker Compose

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

* Node.js (v20 or later)
* npm (v10 or later)
* Go (v1.21 or later)
* Docker and Docker Compose
* Hyperledger Fabric binaries (v2.5 or later)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd kyc-attestation-platform
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Fabric binaries and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0 1.5.5
```

### 3. Environment Configuration

Create `.env` files for both backend and Fabric network:

```bash
# apps/backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
FABRIC_NETWORK_NAME="kycchannel"
FABRIC_CHAINCODE_NAME="kycattestation"
FABRIC_CONNECTION_PROFILE_PATH="/path/to/connection/profile.json"
FABRIC_WALLET_PATH="/path/to/wallet"

# fabric-network/.env
COMPOSE_PROJECT_NAME=kyc-attestation
FABRIC_VERSION=2.5.0
```

### 4. Setup Hyperledger Fabric Network

```bash
# Navigate to fabric network directory
cd fabric-network

# Start the network
./network.sh up

# Create channel
./network.sh createChannel

# Deploy chaincode
./scripts/deployCC.sh
```

The network setup will:
- Start orderer and peer nodes
- Create the KYC channel
- Deploy the attestation chaincode
- Configure TLS certificates

### 5. Database Setup

```bash
cd apps/backend

# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev --name init
```

### 6. Running the Application

#### Option A: Local Development

```bash
# Terminal 1: Run Fabric network
cd fabric-network
./network.sh up

# Terminal 2: Run backend
cd apps/backend
npm run start:dev
```

#### Option B: Docker Compose (Recommended)

```bash
# Build and start all services
docker compose up -d

# Apply database migrations
docker compose exec backend npx prisma migrate dev
```

The following services will be available:
- Backend API: http://localhost:3000
- Fabric Orderer: localhost:7050
- Fabric Peer: localhost:7051
- PostgreSQL: localhost:5432

### 7. Testing the Setup

```bash
# Test chaincode
cd fabric-network
./network.sh testChaincode

# Test backend integration
curl http://localhost:3000/api/health
```

### Development Workflow

#### Working with Chaincode

```bash
# 1. Make changes to chaincode
cd chaincode/kyc-attestation

# 2. Update version in deployCC.sh
vim fabric-network/scripts/deployCC.sh

# 3. Redeploy chaincode
cd fabric-network
./scripts/deployCC.sh
```

#### Testing Chaincode

```bash
# Unit tests
cd chaincode/kyc-attestation
go test ./...

# Integration tests via CLI
peer chaincode invoke -C kycchannel -n kycattestation -c '{"Args":["CreateAttestation","id1","profile1","wallet1","ipfs://..."]}'
```

#### Working with NestJS Backend

```bash
# Run in development mode
npm run start:dev

# Run tests
npm run test
npm run test:e2e
```

### Troubleshooting

#### Fabric Network Issues

```bash
# Check network status
docker ps
docker logs peer0.org1.example.com

# Reset network
cd fabric-network
./network.sh down
./network.sh up -ca
```

#### Backend Issues

```bash
# Check logs
docker logs backend

# Reset backend container
docker compose restart backend
```

### Security Considerations

1. **Network Security**
   - TLS is enabled by default
   - All communications are encrypted
   - Access control via certificates

2. **Data Privacy**
   - No PII stored on blockchain
   - Only attestation proofs on-chain
   - Sensitive data in PostgreSQL

3. **Identity Management**
   - PKI-based identities
   - Certificate rotation
   - Role-based access control

### Monitoring and Maintenance

1. **Network Monitoring**
   - Fabric metrics via Prometheus
   - Node health checks
   - Transaction monitoring

2. **Backend Monitoring**
   - API metrics
   - Error tracking
   - Performance monitoring

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the Apache License, Version 2.0 - see the [LICENSE](LICENSE) file for details.

### Support

For support and questions, please:
1. Check the [documentation](docs/)
2. Review existing issues
3. Create a new issue if needed

### Acknowledgments

* Hyperledger Fabric Community
* NestJS Team
* All contributors to this project