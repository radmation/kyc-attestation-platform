# 🏛️ **KYC Attestation Platform**

A blockchain-based Know Your Customer (KYC) attestation platform that creates on-chain identity attestations for regulatory compliance, featuring automated smart contract integration and multi-tenant white-labeling support.

---

## 🚀 **Quick Start**

### **🤖 AI Agents**
**Start Here**: [`docs/agent-guides/README.md`](docs/agent-guides/README.md) - Complete documentation hub  
**Primary Workflow**: [`tasks/AUTOMATION_OVERVIEW.md`](tasks/AUTOMATION_OVERVIEW.md) - Task automation guide

### **👥 Human Developers**
**Setup Guide**: [`docs/human-setup/DEVELOPMENT_SETUP.md`](docs/human-setup/DEVELOPMENT_SETUP.md) - Environment setup  
**Configuration**: [`docs/human-setup/developer_checklist.md`](docs/human-setup/developer_checklist.md) - Manual setup tasks

---

## 📚 **Documentation Navigation**

- **📖 [Complete Documentation Hub](docs/README.md)** - Organized index of all documentation
- **🏗️ [Architecture & Technical](docs/architecture/)** - System design and technical specifications
- **🔗 [Integration Guides](docs/integration-guides/)** - iDenfy API and external service integration
- **📋 [Project Management](docs/project-management/)** - Requirements, task organization, and workflows
- **🤖 [AI Agent Resources](docs/agent-guides/)** - Specialized documentation for AI agents

---

## ⚡ **Technology Stack**

- **Backend**: NestJS with TypeScript, PostgreSQL with Prisma ORM
- **Blockchain**: Multi-blockchain support with Hyperledger Fabric, Ethereum, and EVM-compatible networks
- **Frontend**: React.js with TypeScript and shadcn/ui components
- **KYC Integration**: iDenfy API with webhook processing
- **Storage**: IPFS with Filebase for attestation metadata
- **Monitoring**: Prometheus metrics, Grafana dashboards, health check endpoints
- **Infrastructure**: Docker containerization with AWS deployment

---

## 🎯 **Core Features**

- ✅ **Identity Verification**: Integration with iDenfy for comprehensive KYC processing
- ✅ **Multi-Blockchain Support**: Abstraction layer supporting Fabric, Ethereum, Polygon, and more
- ✅ **Blockchain Attestations**: On-chain identity attestations with provider flexibility
- ✅ **Smart Contract Integration**: Automated compliance enforcement for DeFi protocols
- ✅ **Multi-tenant Support**: White-labeled solution for token issuers and compliance providers
- ✅ **Regulatory Compliance**: GENIUS Act compliance and comprehensive audit trails

---

## 🛠️ **Development**

### **🚨 CRITICAL: Monorepo Commands**

**📖 Complete Guide**: [`docs/agent-guides/DEVELOPMENT_COMMANDS.md`](docs/agent-guides/DEVELOPMENT_COMMANDS.md)

**⚡ Quick Commands:**
```bash
# Full Development (Both Frontend & Backend - RECOMMENDED)
npm run dev                # Start both servers simultaneously

# Individual Services
npm run start:dev          # Backend only (port 3000)
npm run start:frontend     # Frontend only (port 5173)

# Database Operations (from apps/backend)
cd apps/backend
npx prisma migrate dev --name migration-name
npx prisma generate
```

### **Prerequisites**
- Docker & Docker Compose
- Node.js 18+ & npm 8+
- PostgreSQL database
- Git

### **⚠️ Common Issues**
- **JSX Errors**: Run backend from project root, not `apps/backend`
- **404 Routes**: Check module imports and restart server cleanly
- **Port Conflicts**: Use separate terminals for backend/frontend

### **AI Agent Development**
```bash
# Check current status
./task-utils.sh status

# See next tasks
./task-utils.sh next

# Start a task
./task-utils.sh start P0-XXX-XXX
```

---

## 📊 **Monitoring & Observability**

### **🔍 Health Checks**
The platform includes comprehensive health monitoring endpoints:

```bash
# Check overall system health
curl http://localhost:3000/api/v1/health

# Database connectivity
curl http://localhost:3000/api/v1/health/database  

# Blockchain provider status
curl http://localhost:3000/api/v1/health/blockchain

# Prometheus metrics
curl http://localhost:3000/api/v1/health/metrics
```

### **📈 Monitoring Stack**
Complete observability with Prometheus, Grafana, and blockchain monitoring:

```bash
# Quick setup (automated)
cd monitoring
chmod +x setup.sh
./setup.sh

# Manual setup
cd monitoring  
docker-compose up -d
```

**🌐 Access Points:**
- **Prometheus**: http://localhost:9090 - Metrics collection and alerts
- **Grafana**: http://localhost:3001 - Dashboards (admin/admin123) 
- **Hyperledger Explorer**: http://localhost:8080 - Blockchain monitoring
- **System Metrics**: http://localhost:9100 - Node resources
- **Container Metrics**: http://localhost:8081 - Docker stats

### **🚨 Monitoring Features**
- ✅ **Real-time Dashboards**: KYC platform overview with system status
- ✅ **Alert Rules**: Automated alerts for service failures and performance issues
- ✅ **Metrics Collection**: Backend, database, blockchain, and infrastructure metrics
- ✅ **Health Endpoints**: Kubernetes-ready liveness and readiness probes
- ✅ **Multi-blockchain Monitoring**: Support for Fabric, Ethereum, and EVM chains

### **🔧 For Developers**
```bash
# View monitoring configuration
ls -la monitoring/

# Check health endpoints during development
npm run start:dev  # Backend on port 3000
curl http://localhost:3000/api/v1/health

# Start monitoring alongside development
cd monitoring && docker-compose up -d
# Continue development with full observability
```

**📚 Documentation**: Complete monitoring setup details in [`tasks/00-infrastructure/in-progress/P1-INF-004-monitoring-stack-setup.md`](tasks/00-infrastructure/in-progress/P1-INF-004-monitoring-stack-setup.md)

---

## 📋 **Project Status**

- **Current Phase**: Infrastructure Foundation & Identity Verification
- **Active Development**: P0 critical path tasks (authentication, KYC integration, email infrastructure)
- **Next Milestone**: Smart contract integration and attestation generation

---

## 🤝 **Contributing**

- **AI Agents**: Follow the complete workflow in [`tasks/AUTOMATION_OVERVIEW.md`](tasks/AUTOMATION_OVERVIEW.md)
- **Human Developers**: Review [`docs/human-setup/developer_checklist.md`](docs/human-setup/developer_checklist.md)
- **Architecture Changes**: Consult [`docs/architecture/TECHNICAL_SPECIFICATIONS.md`](docs/architecture/TECHNICAL_SPECIFICATIONS.md)

---

## 📄 **License**

[Insert License Information]

---

**🎯 For complete project information, visit the [Documentation Hub](docs/README.md)**
