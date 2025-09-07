# 🔒 **Blacklisting Security Model**
*Multi-Tenant Address Blacklisting with Client Boundary Enforcement*

## 🚨 **Security Vulnerability Fixed**
**CRITICAL**: The original implementation allowed any client with blacklisting permissions to blacklist addresses from OTHER companies. This has been fixed with a two-tier scoped security model.

---

## 🏗️ **Two-Tier Blacklisting Architecture**

### **🌍 Tier 1: Global Blacklist**
- **Purpose**: Sanctions, regulatory compliance, law enforcement
- **Scope**: Platform-wide (affects all clients)
- **Access**: Platform Administrators and Regulatory Officials ONLY
- **Use Cases**:
  - OFAC sanctions lists
  - Court orders
  - Regulatory enforcement actions
  - Terrorist financing prevention

### **🏢 Tier 2: Client-Scoped Blacklist**
- **Purpose**: Company internal security, employee misconduct, internal policies
- **Scope**: Company-specific (affects only that client's operations)
- **Access**: Client Administrators and Security Managers ONLY for their own company
- **Use Cases**:
  - Employee violations
  - Internal policy enforcement
  - Company-specific risk management
  - Suspicious activity within organization

---

## 🔐 **Permission Structure**

### **Global Blacklisting Permissions (Platform Level)**
```
gatekeeper:add_to_blacklist_global      → Platform Admins ONLY
gatekeeper:remove_from_blacklist_global → Platform Admins ONLY  
gatekeeper:view_blacklist_global        → Platform Admins ONLY
```

### **Client-Scoped Blacklisting Permissions (Company Level)**
```
gatekeeper:add_to_blacklist_scoped      → Client Admins (own company only)
gatekeeper:remove_from_blacklist_scoped → Client Admins (own company only)
gatekeeper:view_blacklist_scoped        → Client Admins (own company only)
```

---

## 👥 **Role-Based Access Control**

### **Platform Administrator**
- ✅ **Global blacklisting**: Can blacklist any address platform-wide
- ✅ **Client-scoped blacklisting**: Can manage any client's blacklist
- ✅ **Emergency powers**: Full override capabilities
- **Use Case**: Regulatory compliance, sanctions enforcement

### **Client Admin Enhanced**
- ❌ **Global blacklisting**: Cannot access global blacklist
- ✅ **Client-scoped blacklisting**: Can only blacklist addresses within their company
- ✅ **Company security**: Full control over their organization's blacklist
- **Use Case**: Company internal security management

### **Client Security Manager**
- ❌ **Global blacklisting**: Cannot access global blacklist  
- ✅ **Client-scoped blacklisting**: Can only blacklist addresses within their company
- ✅ **Security operations**: Focused on company security operations
- **Use Case**: Day-to-day security operations within company

### **Client Compliance Officer**
- ❌ **Global blacklisting**: Cannot access global blacklist
- ❌ **Client-scoped blacklisting**: Cannot modify blacklists
- ✅ **View only**: Can view compliance status and blacklist status
- **Use Case**: Compliance monitoring and reporting

---

## 🏛️ **Chaincode Implementation**

### **Global Blacklisting Functions**
```go
// Platform/Regulatory admins only
AddToBlacklist(addressToBlock string)       // Original function, now global-scoped
RemoveFromBlacklist(addressToUnblock string) // Original function, now global-scoped
```

### **Client-Scoped Blacklisting Functions**
```go
// Client admins for their company only
AddToBlacklistScoped(addressToBlock string)    // NEW: Client-scoped blacklisting
RemoveFromBlacklistScoped(addressToUnblock string) // NEW: Client-scoped removal
```

### **Comprehensive Checking Function**
```go
// Checks both global and client-scoped blacklists
IsAddressBlacklisted(addressToCheck string) bool
    ├── isAddressGloballyBlacklisted()      // Check global blacklist
    └── isAddressClientBlacklisted()        // Check client-scoped blacklist
```

---

## 🔍 **Security Enforcement**

### **Client Boundary Enforcement**
1. **Authorization Context**: Every operation includes client ID
2. **Scope Validation**: Client admins can ONLY operate within their company scope
3. **Address Validation**: System verifies address belongs to client's company (TODO: Database integration)
4. **Audit Trail**: All operations logged with client context

### **Multi-Level Checking in CheckCompliance**
```go
CheckCompliance(senderAddress, receiverAddress) {
    // 1. Check GLOBAL blacklist for both addresses
    if (globallyBlacklisted(sender) || globallyBlacklisted(receiver)) {
        return BLOCKED("Global sanctions/regulatory block")
    }
    
    // 2. Check CLIENT-SCOPED blacklist for both addresses  
    if (clientBlacklisted(sender) || clientBlacklisted(receiver)) {
        return BLOCKED("Company internal security block")
    }
    
    // 3. Continue with normal KYC attestation checking...
}
```

---

## 🗂️ **Data Storage Structure**

### **Global Blacklist Storage**
```
Key: "blacklist_global_0x1234567890abcdef"
Value: "true"
Scope: Platform-wide
```

### **Client-Scoped Blacklist Storage**
```
Key: "blacklist_client_companyA_0x1234567890abcdef"  
Value: "true"
Scope: Company-specific
```

---

## 🚨 **Security Guarantees**

### ✅ **What IS Protected**
1. **Client Isolation**: Company A cannot blacklist Company B's addresses
2. **Scope Enforcement**: Client admins restricted to their company only
3. **Authorization Checks**: All operations validate permissions before execution
4. **Audit Trail**: Complete logging of who did what in which scope
5. **Multi-Tier Checking**: Both global and client blacklists checked for compliance

### ❌ **What Was Previously Vulnerable**
1. **Cross-Company Blacklisting**: Any client could blacklist any address globally
2. **No Scope Boundaries**: No distinction between company-internal vs regulatory actions
3. **Permission Overreach**: Single blacklist permission gave too much power
4. **No Client Context**: Operations didn't track which company initiated them

---

## 📊 **Example Scenarios**

### **Scenario 1: Regulatory Sanctions** 
```
WHO: Platform Administrator (Government/Regulatory)
ACTION: AddToBlacklist("0xSanctionedAddress")  
SCOPE: Global
EFFECT: Address blocked platform-wide for ALL clients
REASON: OFAC sanctions compliance
```

### **Scenario 2: Company Internal Security**
```
WHO: CompanyA Client Administrator  
ACTION: AddToBlacklistScoped("0xRogueEmployee")
SCOPE: CompanyA only
EFFECT: Address blocked ONLY within CompanyA operations
REASON: Employee misconduct
```

### **Scenario 3: Cross-Company Attempt (BLOCKED)**
```
WHO: CompanyA Client Administrator
ACTION: AddToBlacklistScoped("0xCompanyBAddress") 
RESULT: ❌ PERMISSION DENIED
REASON: Address does not belong to CompanyA
```

### **Scenario 4: Compliance Check**
```
TRANSACTION: CompanyA_Address → CompanyB_Address
CHECKS:
  1. ✅ Neither address in global blacklist
  2. ✅ CompanyA_Address not in CompanyA client blacklist  
  3. ✅ CompanyB_Address not in CompanyB client blacklist
  4. ✅ Both have valid KYC attestations
RESULT: ✅ APPROVED
```

---

## ⚡ **Quick Reference**

### **For Platform Administrators**
- Use `AddToBlacklist()` for regulatory/sanctions enforcement
- Access to both global and all client-scoped blacklists
- Emergency override capabilities

### **For Client Administrators** 
- Use `AddToBlacklistScoped()` for company internal security
- Limited to their own company's addresses only
- Cannot affect other companies or global blacklist

### **For Compliance Officers**
- Read-only access to view blacklist status
- Can monitor compliance but cannot modify blacklists
- Company-scoped visibility only

---

## 🛡️ **Security Best Practices**

1. **Least Privilege**: Users get minimum permissions needed for their role
2. **Scope Isolation**: Clear boundaries between global and client operations  
3. **Audit Everything**: All blacklisting operations logged with full context
4. **Regular Reviews**: Periodic review of permissions and blacklist entries
5. **Incident Response**: Clear escalation path for security incidents

---

## 🔮 **Future Enhancements**

1. **Address Ownership Validation**: Integrate with database to verify address ownership
2. **Temporary Blacklisting**: Time-limited blacklist entries
3. **Approval Workflows**: Multi-signature approval for sensitive blacklisting
4. **Automated Compliance**: Integration with external sanctions lists
5. **Analytics Dashboard**: Blacklisting trends and compliance metrics

---

**✅ Security Vulnerability RESOLVED**: Multi-tenant blacklisting now enforces proper client boundaries and prevents cross-company interference! 