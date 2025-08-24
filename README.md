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
- **Blockchain**: Hyperledger Fabric private permissioned network
- **Frontend**: React.js with TypeScript and shadcn/ui components
- **KYC Integration**: iDenfy API with webhook processing
- **Storage**: IPFS with Filebase for attestation metadata
- **Infrastructure**: Docker containerization with AWS deployment

---

## 🎯 **Core Features**

- ✅ **Identity Verification**: Integration with iDenfy for comprehensive KYC processing
- ✅ **Blockchain Attestations**: On-chain identity attestations using Hyperledger Fabric
- ✅ **Smart Contract Integration**: Automated compliance enforcement for DeFi protocols
- ✅ **Multi-tenant Support**: White-labeled solution for token issuers and compliance providers
- ✅ **Regulatory Compliance**: GENIUS Act compliance and comprehensive audit trails

---

## 🛠️ **Development**

### **Prerequisites**
- Docker & Docker Compose
- Node.js 18+ & npm 8+
- Git

### **Quick Setup**
```bash
# Clone repository
git clone [repository-url]
cd kyc-attestation-platform

# Follow setup guide
open docs/human-setup/DEVELOPMENT_SETUP.md
```

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
