# iDenfy Webhook Payload Documentation

## 🎯 **Overview**
This document provides comprehensive information about iDenfy webhook payloads for AI agents implementing webhook handling in the KYC Attestation Platform.

## ⚠️ **Important Notes**
- **Payload Structure**: These are example payloads based on iDenfy's webhook system
- **Real Implementation**: Actual payloads may vary - always test with real webhooks
- **Documentation Source**: Request official payload documentation from iDenfy support
- **Testing Required**: Use ngrok and test webhooks to capture actual payload structures

---

## 🔐 **Webhook Security**

### **Signature Validation**
All webhooks include a signature header for security validation:
```typescript
// Example signature validation
const signature = req.headers['x-idenfy-signature'];
const expectedSignature = crypto
  .createHmac('sha256', process.env.IDENFY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
);
```

---

## 📋 **Required Webhook Types (MVP)**

### **1. ID VERIFICATION AUTO FINISHED**
**Purpose**: Identity verification completed automatically by system

```json
{
  "type": "ID_VERIFICATION_AUTO_FINISHED",
  "timestamp": "2024-01-15T10:30:00Z",
  "verificationId": "ver_123456789",
  "userId": "user_987654321",
  "status": "APPROVED",
  "confidence": 0.95,
  "documents": [
    {
      "type": "PASSPORT",
      "country": "US",
      "number": "123456789",
      "expiryDate": "2030-12-31"
    }
  ],
  "verificationData": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "nationality": "US"
  }
}
```

### **2. ID VERIFICATION MANUAL FINISHED**
**Purpose**: Identity verification manually approved/denied by human reviewer

```json
{
  "type": "ID_VERIFICATION_MANUAL_FINISHED",
  "timestamp": "2024-01-15T10:30:00Z",
  "verificationId": "ver_123456789",
  "userId": "user_987654321",
  "status": "APPROVED",
  "reviewerId": "reviewer_456",
  "reviewNotes": "All documents verified successfully",
  "documents": [
    {
      "type": "DRIVERS_LICENSE",
      "country": "US",
      "state": "CA",
      "number": "DL123456789",
      "expiryDate": "2028-05-15"
    }
  ],
  "verificationData": {
    "firstName": "Jane",
    "lastName": "Smith",
    "dateOfBirth": "1985-06-15",
    "address": "123 Main St, Los Angeles, CA"
  }
}
```

### **3. ID VERIFICATION EXPIRED**
**Purpose**: Identity verification has expired

```json
{
  "type": "ID_VERIFICATION_EXPIRED",
  "timestamp": "2024-01-15T10:30:00Z",
  "verificationId": "ver_123456789",
  "userId": "user_987654321",
  "expiryDate": "2024-01-15T00:00:00Z",
  "reason": "VERIFICATION_EXPIRED",
  "documents": [
    {
      "type": "PASSPORT",
      "expiryDate": "2024-01-15"
    }
  ]
}
```

### **4. ID VERIFICATION CANCELED**
**Purpose**: Identity verification was cancelled

```json
{
  "type": "ID_VERIFICATION_CANCELED",
  "timestamp": "2024-01-15T10:30:00Z",
  "verificationId": "ver_123456789",
  "userId": "user_987654321",
  "cancelReason": "USER_REQUESTED",
  "canceledBy": "user",
  "cancelNotes": "User requested cancellation"
}
```

### **5. ID VERIFICATION RESUBMITTED**
**Purpose**: Client resubmitted verification after rejection

```json
{
  "type": "ID_VERIFICATION_RESUBMITTED",
  "timestamp": "2024-01-15T10:30:00Z",
  "verificationId": "ver_123456789",
  "userId": "user_987654321",
  "previousVerificationId": "ver_123456788",
  "resubmissionReason": "DOCUMENT_QUALITY_IMPROVED",
  "documents": [
    {
      "type": "PASSPORT",
      "country": "US",
      "number": "123456789",
      "expiryDate": "2030-12-31"
    }
  ]
}
```

### **6. AML MONITORING**
**Purpose**: AML monitoring check completed

```json
{
  "type": "AML_MONITORING",
  "timestamp": "2024-01-15T10:30:00Z",
  "monitoringId": "aml_123456789",
  "userId": "user_987654321",
  "status": "CLEAR",
  "riskScore": 0.15,
  "checks": [
    {
      "type": "PEP_CHECK",
      "status": "CLEAR",
      "details": "No PEP matches found"
    },
    {
      "type": "SANCTIONS_CHECK",
      "status": "CLEAR",
      "details": "No sanctions matches found"
    },
    {
      "type": "ADVERSE_MEDIA",
      "status": "CLEAR",
      "details": "No adverse media found"
    }
  ],
  "monitoringData": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "nationality": "US"
  }
}
```

### **7. AML MONITORING EXPIRATION**
**Purpose**: AML monitoring user is expiring or expired

```json
{
  "type": "AML_MONITORING_EXPIRATION",
  "timestamp": "2024-01-15T10:30:00Z",
  "monitoringId": "aml_123456789",
  "userId": "user_987654321",
  "expiryDate": "2024-02-15T00:00:00Z",
  "daysUntilExpiry": 30,
  "status": "EXPIRING_SOON",
  "actionRequired": "RENEW_MONITORING"
}
```

### **8. DOCUMENT EXPIRATION**
**Purpose**: Client's identity document is expiring or expired

```json
{
  "type": "DOCUMENT_EXPIRATION",
  "timestamp": "2024-01-15T10:30:00Z",
  "documentId": "doc_123456789",
  "userId": "user_987654321",
  "documentType": "PASSPORT",
  "expiryDate": "2024-03-15T00:00:00Z",
  "daysUntilExpiry": 60,
  "status": "EXPIRING_SOON",
  "actionRequired": "UPDATE_DOCUMENT"
}
```

### **9. FACIAL AUTHENTICATION**
**Purpose**: Facial authentication session ended

```json
{
  "type": "FACIAL_AUTHENTICATION",
  "timestamp": "2024-01-15T10:30:00Z",
  "sessionId": "face_123456789",
  "userId": "user_987654321",
  "status": "SUCCESS",
  "confidence": 0.92,
  "sessionDuration": 45,
  "authenticationMethod": "LIVENESS_CHECK",
  "verificationData": {
    "firstName": "John",
    "lastName": "Doe",
    "photoUrl": "https://example.com/photos/face_123456789.jpg"
  }
}
```

---

## 🔄 **Optional Webhook Types (Future Implementation)**

### **Company-Related Webhooks**
```json
{
  "type": "COMPANY_REVIEW",
  "companyId": "comp_123456789",
  "status": "APPROVED",
  "reviewerId": "reviewer_456",
  "reviewNotes": "Company verification completed successfully"
}
```

### **Bank Verification**
```json
{
  "type": "BANK_VERIFICATION",
  "verificationId": "bank_123456789",
  "userId": "user_987654321",
  "status": "VERIFIED",
  "bankName": "Example Bank",
  "accountType": "CHECKING"
}
```

---

## 🏗️ **Implementation Guidelines for AI Agents**

### **1. Webhook Handler Structure**
```typescript
@Controller('api/v1/webhooks/idenfy')
export class IdenfyWebhookController {
  
  @Post()
  async handleWebhook(@Body() payload: any, @Headers() headers: any) {
    // 1. Validate webhook signature
    if (!this.validateSignature(payload, headers)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    
    // 2. Route webhook by type
    switch (payload.type) {
      case 'ID_VERIFICATION_AUTO_FINISHED':
        return this.handleIdVerificationFinished(payload);
      case 'AML_MONITORING':
        return this.handleAmlMonitoring(payload);
      case 'DOCUMENT_EXPIRATION':
        return this.handleDocumentExpiration(payload);
      // ... handle other types
      default:
        this.logger.warn(`Unknown webhook type: ${payload.type}`);
        return { received: true };
    }
  }
}
```

### **2. Webhook Type Mapping**
```typescript
enum WebhookType {
  ID_VERIFICATION_AUTO_FINISHED = 'ID_VERIFICATION_AUTO_FINISHED',
  ID_VERIFICATION_MANUAL_FINISHED = 'ID_VERIFICATION_MANUAL_FINISHED',
  ID_VERIFICATION_EXPIRED = 'ID_VERIFICATION_EXPIRED',
  ID_VERIFICATION_CANCELED = 'ID_VERIFICATION_CANCELED',
  ID_VERIFICATION_RESUBMITTED = 'ID_VERIFICATION_RESUBMITTED',
  AML_MONITORING = 'AML_MONITORING',
  AML_MONITORING_EXPIRATION = 'AML_MONITORING_EXPIRATION',
  DOCUMENT_EXPIRATION = 'DOCUMENT_EXPIRATION',
  FACIAL_AUTHENTICATION = 'FACIAL_AUTHENTICATION'
}
```

### **3. Payload Validation**
```typescript
class WebhookPayloadDto {
  @IsString()
  type: string;
  
  @IsDateString()
  timestamp: string;
  
  @IsString()
  verificationId?: string;
  
  @IsString()
  userId?: string;
  
  @IsString()
  status?: string;
}
```

### **4. Error Handling**
```typescript
try {
  await this.processWebhook(payload);
  return { success: true, processed: true };
} catch (error) {
  this.logger.error(`Webhook processing failed: ${error.message}`, {
    webhookType: payload.type,
    verificationId: payload.verificationId,
    error: error.stack
  });
  
  // Return 200 to acknowledge receipt, but log the error
  return { success: false, processed: false, error: error.message };
}
```

---

## 🧪 **Testing Webhook Payloads**

### **1. Test Webhook Generation**
```bash
# Use ngrok to capture real webhook payloads
curl -X POST http://localhost:4040/api/tunnels

# Monitor webhook traffic
open http://localhost:4040
```

### **2. Sample Payload Testing**
```typescript
// Test with sample payloads
const testPayload = {
  type: 'ID_VERIFICATION_AUTO_FINISHED',
  timestamp: new Date().toISOString(),
  verificationId: 'test_ver_123',
  userId: 'test_user_456',
  status: 'APPROVED'
};

// Send test webhook
await this.webhookService.processWebhook(testPayload);
```

---

## 📚 **Additional Resources**

### **iDenfy Documentation**
- [Webhook Setup Guide](https://documentation.idenfy.com/webhooks)
- [Webhook Security](https://documentation.idenfy.com/webhooks/security)
- [Webhook Testing](https://documentation.idenfy.com/webhooks/testing)

### **Platform Integration**
- [Webhook Controller](../apps/backend/src/modules/kyc/presentation/controllers/webhook.controller.ts)
- [Webhook Service](../apps/backend/src/modules/kyc/infrastructure/services/webhook.service.ts)
- [Webhook Validation](../apps/backend/src/modules/kyc/infrastructure/services/webhook-validation.service.ts)

---

## ⚠️ **Important Implementation Notes**

1. **Always validate webhook signatures** before processing
2. **Handle all webhook types gracefully** - log unknown types
3. **Process webhooks asynchronously** to avoid timeouts
4. **Implement proper error handling** and logging
5. **Test with real webhook payloads** from iDenfy
6. **Update this documentation** with actual payload structures
7. **Implement webhook retry logic** for failed processing
8. **Monitor webhook processing** for performance and errors

---

**Last Updated**: $(date)
**Documentation Version**: 1.0
**Status**: Draft - Requires real webhook payload validation
**Next Update**: After implementing and testing with real webhooks 