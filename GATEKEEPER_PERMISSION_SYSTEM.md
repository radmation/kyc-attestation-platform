# 🔐 Gatekeeper Permission-Based Authorization System

## 📋 Overview

The Gatekeeper smart contract has been enhanced with a sophisticated **permission-based authorization system** that provides granular control over compliance enforcement operations across multiple organizational levels.

---

## 🏗️ **Permission Architecture**

### **Three-Tier Authorization Model:**

1. **🌐 Platform Level** - System administrators and maintenance
2. **🏛️ Regulatory Level** - Enforcement authorities and compliance officers  
3. **🏢 Client Level** - Organization business operations

---

## 📊 **Permission Matrix**

| Permission | Platform Admin | Regulatory Admin | Treasury Agent | Court Executor | Client Admin | Purpose |
|------------|----------------|------------------|----------------|----------------|--------------|---------|
| `gatekeeper:pause_global` | ✅ | ❌ | ❌ | ❌ | ❌ | Emergency system shutdown |
| `gatekeeper:pause_client` | ✅ | ✅ | ❌ | ❌ | ❌ | Regulatory compliance enforcement |
| `gatekeeper:pause_wallet_direct` | ✅ | ✅ | ✅ | ✅ | ❌ | Sanctions/court orders |
| `gatekeeper:pause_wallet_scoped` | ✅ | ✅ | ❌ | ❌ | ✅ | Client business operations |
| `gatekeeper:view_compliance_global` | ✅ | ✅ | ✅ | ❌ | ❌ | Cross-client monitoring |
| `gatekeeper:view_compliance_client` | ✅ | ✅ | ❌ | ❌ | ✅ | Own client monitoring |

---

## 🎯 **Authorization Functions**

### **🌐 Platform-Level Functions**

```go
// Emergency system maintenance
func PauseGlobal(ctx) error                    // Pause entire system
func UnpauseGlobal(ctx) error                  // Resume entire system  
```

**Usage Scenarios:**
- Critical security patches
- Network upgrades  
- Emergency shutdowns
- System maintenance windows

---

### **🏛️ Regulatory-Level Functions**

```go
// Client organization control
func PauseClient(ctx, clientId) error          // Pause specific client
func UnpauseClient(ctx, clientId) error        // Unpause specific client

// Direct wallet enforcement  
func PauseWalletDirect(ctx, walletAddress) error    // Freeze any wallet
func UnpauseWalletDirect(ctx, walletAddress) error  // Unfreeze any wallet
```

**Usage Scenarios:**
- **Client Pause**: Compliance violations, audit failures, sanctions
- **Direct Wallet**: Court orders, treasury sanctions, law enforcement

---

### **🏢 Client-Level Functions**

```go
// Client business operations (with ownership validation)
func PauseWalletScoped(ctx, walletAddress, clientId) error    // Freeze own user
func UnpauseWalletScoped(ctx, walletAddress, clientId) error  // Unfreeze own user
```

**Usage Scenarios:**
- Suspicious user activity
- Account disputes
- Fraud prevention
- Policy violations

**🔒 Security**: Automatically validates wallet ownership before allowing action.

---

## 🔍 **Hierarchical Compliance Checking**

The `CheckCompliance` function now checks pause states in **priority order**:

1. **🚨 Global Pause** → "System maintenance in progress"
2. **🏛️ Direct Wallet Pause** → "Wallet frozen by regulatory authority" 
3. **🏢 Client Pause** → "Organization operations paused"
4. **👤 Scoped Wallet Pause** → "Account frozen by organization"
5. **✅ KYC Validation** → Standard attestation checking

---

## 👥 **Role Definitions**

### **Platform Roles (Global):**

#### **PLATFORM_ADMIN**
- **Full system control** - Can pause anything, anywhere
- **Emergency authority** - Global shutdown capabilities
- **User management** - Assign roles and permissions

#### **REGULATORY_ADMIN** 
- **Multi-client enforcement** - Can pause any client or wallet
- **Compliance monitoring** - View all compliance data
- **Investigation tools** - Cross-organization visibility

#### **TREASURY_AGENT**
- **Sanctions enforcement** - Direct wallet freeze authority  
- **Financial compliance** - Treasury-specific operations
- **Limited scope** - Wallet-level enforcement only

#### **COURT_ORDER_EXECUTOR**
- **Legal enforcement** - Direct wallet freeze for court orders
- **Judicial authority** - Execute legal mandates
- **Specific purpose** - Court order execution only

#### **COMPLIANCE_AUDITOR**
- **Read-only access** - View compliance states and history
- **Audit support** - Generate compliance reports  
- **Oversight role** - Monitor but not enforce

### **Client Roles (Organization-Scoped):**

#### **CLIENT_ADMIN_ENHANCED**
- **Business operations** - Pause/unpause own users' wallets
- **Account management** - Handle user disputes and issues
- **Compliance monitoring** - View own organization's compliance

#### **CLIENT_COMPLIANCE_OFFICER**
- **Monitoring only** - View compliance states and reports
- **Risk assessment** - Identify potential compliance issues
- **Reporting** - Generate compliance documentation

#### **CLIENT_SECURITY_MANAGER**
- **Security operations** - Freeze suspicious accounts
- **Incident response** - Handle security breaches
- **Fraud prevention** - Proactive account protection

---

## 🔐 **Security Features**

### **Client Scope Validation**
```go
// Ensures users can only act on their own client's resources
func validateClientScope(targetClientID string) error {
    if authCtx.ClientID != targetClientID {
        return fmt.Errorf("access denied: can only act on own client resources")
    }
}
```

### **Wallet Ownership Validation**  
```go
// Verifies wallet belongs to user's client before scoped operations
func validateWalletOwnership(ctx, walletAddress, authCtx) error {
    // Queries KYC attestation chaincode to verify ownership
    // Prevents clients from freezing other clients' users
}
```

### **Audit Trail**
```go
// Logs all authorization decisions for compliance
func logAuthorizationEvent(ctx, action, permission, allowed, reason) error {
    // Creates immutable audit trail of all access attempts
}
```

---

## 📚 **Usage Examples**

### **Regulatory Enforcement Scenario**

```bash
# Treasury agent freezes sanctioned wallet
peer chaincode invoke -C kycchannel -n gatekeeper \
  -c '{"function":"PauseWalletDirect","Args":["0xSanctionedWallet"]}'

# Result: Wallet immediately frozen, compliance checks return false
```

### **Client Business Operations**

```bash  
# Client admin freezes suspicious user account
peer chaincode invoke -C kycchannel -n gatekeeper \
  -c '{"function":"PauseWalletScoped","Args":["0xSuspiciousUser","tokencorp"]}'

# Security: Validates wallet belongs to tokencorp before allowing freeze
```

### **Emergency System Maintenance**

```bash
# Platform admin pauses entire system for maintenance
peer chaincode invoke -C kycchannel -n gatekeeper \
  -c '{"function":"PauseGlobal","Args":[]}'

# Result: ALL compliance checks return false until unpaused
```

---

## 🛠️ **Implementation Details**

### **Database Schema**
```sql
-- Permissions are stored in the permissions table
INSERT INTO permissions (name, action, resource) VALUES 
('gatekeeper:pause_global', 'pause', 'gatekeeper.global');

-- Roles connect to permissions via many-to-many relationship  
INSERT INTO roles (name, description, isGlobal) VALUES
('PLATFORM_ADMIN', 'System administrators', true);
```

### **Chaincode Storage Keys**
```go
const (
    GlobalPauseKey  = "global_paused"                    // System-wide pause
    ClientPauseKey  = "client_paused_"                   // client_paused_<clientId>  
    WalletPauseKey  = "wallet_paused_"                   // wallet_paused_<type>_<address>
)
```

### **Identity Attribute Format**
```json
{
  "permissions": "gatekeeper:pause_global,gatekeeper:view_compliance_global", 
  "roles": "PLATFORM_ADMIN,COMPLIANCE_AUDITOR",
  "clientId": "tokencorp"
}
```

---

## 🚀 **Deployment Commands**

### **Seed Permissions and Roles**
```bash
# Create all gatekeeper permissions and roles
npm run db:seed:gatekeeper
```

### **Deploy Updated Chaincode**
```bash  
# Deploy permission-based gatekeeper contract
cd fabric-network
./deploy-gatekeeper.sh
```

### **Test Permission System**
```bash
# Run comprehensive permission tests
./test-gatekeeper.sh
```

---

## ✅ **Benefits Achieved**

### **🔐 Enhanced Security**
- **Principle of least privilege** - Users get only necessary permissions
- **Multi-tenant isolation** - Clients cannot affect other clients
- **Regulatory compliance** - Proper separation of enforcement authorities

### **🏛️ Regulatory Flexibility** 
- **Specialized roles** - Treasury agents, court executors, auditors
- **Granular control** - Different enforcement levels for different authorities
- **Compliance reporting** - Full audit trails for regulatory requirements

### **🏢 Operational Efficiency**
- **Business autonomy** - Clients can manage their own users
- **Emergency controls** - Quick response to security incidents  
- **Hierarchical override** - Higher authorities can override lower-level controls

### **🔍 Audit & Compliance**
- **Immutable audit trail** - All authorization decisions logged on blockchain
- **Regulatory reporting** - Complete visibility for compliance officers
- **Permission tracking** - Who can do what, when, and why

---

## 🎯 **Next Steps**

1. **✅ Database Migration** - Run permission seeding script
2. **✅ Chaincode Deployment** - Deploy updated gatekeeper contract  
3. **🔄 Backend Integration** - Update NestJS service for new functions
4. **🧪 Integration Testing** - Test permission system end-to-end
5. **👥 User Management** - Assign appropriate roles to users
6. **📊 Monitoring Setup** - Monitor authorization events for compliance

---

**🚀 The Gatekeeper now provides enterprise-grade authorization with regulatory compliance built-in!** 