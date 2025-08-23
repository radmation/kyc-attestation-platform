# iDenfy Integration Guide

## Overview
This guide provides comprehensive information for integrating iDenfy's KYC verification services into the KYC Attestation Platform. iDenfy offers multiple integration options including API-based verification, iframe embedding, and webhook notifications.

**Official Documentation References:**
- [KYC Overview](https://documentation.idenfy.com/KYC/KYCLanding)
- [Iframe Integration](https://documentation.idenfy.com/KYC/ClientRedirectToWebUiIframe)
- [Token Generation](https://documentation.idenfy.com/KYC/GeneratingIdentificationToken)
- [Additional Steps](https://documentation.idenfy.com/KYC/AdditionalSteps)
- [Dummy Results](https://documentation.idenfy.com/KYC/KYCDummyResults)
- [AML Features](https://documentation.idenfy.com/aml/amlLanding)
- [AML Single Request](https://documentation.idenfy.com/aml/amlSingle/amlSingleRequest)
- [AML Monitoring](https://documentation.idenfy.com/aml/amlMonitoring/amlMonitoringCreate)
- [AML Dummy Results](https://documentation.idenfy.com/aml/amlDummy)

## 🔑 API Authentication

### Environment Variables
```env
# iDenfy Configuration
IDENFY_API_KEY=your_idenfy_api_key_here
IDENFY_API_SECRET=your_idenfy_api_secret_here
IDENFY_ENVIRONMENT=sandbox  # or 'production'
IDENFY_WEBHOOK_SECRET=your_webhook_secret_here
IDENFY_CLIENT_ID=your_client_id_from_idenfy
IDENFY_BASE_URL=https://ivs.idenfy.com
```

### API Client Setup
```typescript
import { IdenfyClient } from 'idenfy-node-client';

const client = new IdenfyClient({
  apiKey: process.env.IDENFY_API_KEY,
  apiSecret: process.env.IDENFY_API_SECRET,
  environment: process.env.IDENFY_ENVIRONMENT || 'sandbox'
});
```

## 🔄 Integration Methods

### Method 1: Iframe Integration (Recommended for MVP)

#### 1. Generate Identification Token
```typescript
// Generate token for iframe integration
async function generateIdentificationToken(clientId: string): Promise<string> {
  try {
    const response = await fetch('https://ivs.idenfy.com/api/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.IDENFY_API_KEY}:${process.env.IDENFY_API_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({ clientId })
    });

    if (!response.ok) {
      throw new Error(`Token generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.authToken;
  } catch (error) {
    throw new Error(`Failed to generate iDenfy token: ${error.message}`);
  }
}
```

#### 2. Create Iframe Session
```typescript
// Create iframe session with token
async function createIframeSession(authToken: string, options: IframeOptions): Promise<IframeSession> {
  const session = await client.createSession({
    authToken,
    country: options.country || 'US',
    language: options.language || 'en',
    redirectUrl: options.redirectUrl,
    callbackUrl: options.callbackUrl,
    referenceId: options.referenceId,
    iframe: true,  // Enable iframe mode
    // Additional features
    proofOfAddress: options.proofOfAddress || false,
    amlCheck: options.amlCheck || false,
    faceAuthentication: options.faceAuthentication || true,
    kycRiskAssessment: options.kycRiskAssessment || false,
    ageVerification: options.ageVerification || true,
    addressVerification: options.addressVerification || false,
    threeDLiveness: options.threeDLiveness || true,
    adverseMediaCheck: options.adverseMediaCheck || false,
    proxyCheck: options.proxyCheck || true,
    nfc: options.nfc || false
  });

  return session;
}

interface IframeOptions {
  country: string;
  language?: string;
  redirectUrl: string;
  callbackUrl: string;
  referenceId: string;
  proofOfAddress?: boolean;
  amlCheck?: boolean;
  faceAuthentication?: boolean;
  kycRiskAssessment?: boolean;
  ageVerification?: boolean;
  addressVerification?: boolean;
  threeDLiveness?: boolean;
  adverseMediaCheck?: boolean;
  proxyCheck?: boolean;
  nfc?: boolean;
}
```

#### 3. Embed Iframe in Frontend
```typescript
// React component for iDenfy iframe
const IdenfyIframe: React.FC<{ sessionUrl: string; onComplete?: (result: any) => void }> = ({ 
  sessionUrl, 
  onComplete 
}) => {
  const handleMessage = (event: MessageEvent) => {
    // Handle messages from iDenfy iframe
    if (event.origin === 'https://ivs.idenfy.com') {
      const { type, data } = event.data;
      
      switch (type) {
        case 'verification_completed':
          onComplete?.(data);
          break;
        case 'verification_failed':
          console.error('Verification failed:', data);
          break;
        case 'verification_abandoned':
          console.log('Verification abandoned by user');
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="idenfy-container">
      <iframe
        src={sessionUrl}
        width="100%"
        height="600px"
        frameBorder="0"
        allow="camera; microphone; geolocation"
        title="iDenfy Verification"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
};
```

### Method 2: API-Based Verification (Alternative)

#### 1. Create Verification Session
```typescript
// Create a new verification session
const session = await client.createSession({
  country: 'US',  // Required: ISO country code
  language: 'en',  // Optional: ISO language code
  redirectUrl: 'https://yourapp.com/kyc/callback',  // Required: Where to redirect after verification
  callbackUrl: 'https://yourapp.com/api/kyc/webhook/idenfy',  // Required: Webhook endpoint
  referenceId: 'user-123-kyc',  // Optional: Your internal reference
  data: {
    // Optional: Pre-fill user data
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  }
});

// Response structure
{
  id: 'session_id_here',
  url: 'https://ivs.idenfy.com/session/session_id_here',
  status: 'created',
  referenceId: 'user-123-kyc'
}
```

## 📊 KYC Features & Additional Steps

### Core KYC Features
```typescript
interface KycFeatures {
  // Basic Identity Verification
  proofOfAddress: boolean;        // Second ID verification step
  faceAuthentication: boolean;     // Face matching authentication
  threeDLiveness: boolean;        // 3D active liveness detection
  ageVerification: boolean;       // Age limit checking
  addressVerification: boolean;   // Address verification from documents
  
  // Advanced Features
  amlCheck: boolean;              // PEPs and sanctions scanning
  amlMonitoring: boolean;         // Daily monitoring of approved verifications
  kycRiskAssessment: boolean;     // Custom risk rules evaluation
  adverseMediaCheck: boolean;     // Public sources scanning
  adverseMediaMonitoring: boolean; // Daily monitoring of extra data
  
  // Security Features
  documentFaceDuplicates: boolean; // Check for multiple account usage
  faceDuplicates: boolean;        // Selfie photo duplicate checking
  documentFaceBlacklist: boolean; // Cross-check against blacklists
  faceBlacklist: boolean;         // Face image blacklist checking
  personalDataBlacklist: boolean; // Personal data blacklist checking
  proxyCheck: boolean;            // Proxy IP detection
  
  // Technical Features
  nfc: boolean;                   // NFC chip reading
  registryCenterCheck: boolean;   // LT/HU registry verification
  lid: boolean;                   // Lost/stolen document check (LT only)
}
```

### Additional Steps Support
```typescript
// Support for additional verification steps
interface AdditionalSteps {
  questionnaire?: {
    enabled: boolean;
    questions: Question[];
    riskLocations: string[];
  };
  
  customFields?: {
    enabled: boolean;
    fields: CustomField[];
  };
  
  manualReview?: {
    enabled: boolean;
    reviewCriteria: ReviewCriteria[];
  };
}

// Implementation for future use
async function configureAdditionalSteps(sessionId: string, steps: AdditionalSteps) {
  if (steps.questionnaire?.enabled) {
    await client.addQuestionnaire(sessionId, steps.questionnaire);
  }
  
  if (steps.customFields?.enabled) {
    await client.addCustomFields(sessionId, steps.customFields);
  }
  
  if (steps.manualReview?.enabled) {
    await client.enableManualReview(sessionId, steps.manualReview);
  }
}
```

## 🚨 AML Integration

### AML Single Request
```typescript
// Perform AML check for a single verification
async function performAmlCheck(verificationId: string): Promise<AmlResult> {
  const amlResult = await client.amlSingleRequest({
    verificationId,
    includePep: true,
    includeSanctions: true,
    includeAdverseMedia: true,
    riskScoring: true
  });
  
  return amlResult;
}

interface AmlResult {
  verificationId: string;
  pep: {
    found: boolean;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    details?: PepDetails;
  };
  sanctions: {
    found: boolean;
    lists: string[];
    details?: SanctionDetails;
  };
  adverseMedia: {
    found: boolean;
    sources: string[];
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  riskScore: number;
  timestamp: string;
}
```

### AML Monitoring
```typescript
// Set up continuous AML monitoring
async function setupAmlMonitoring(verificationId: string): Promise<MonitoringSubscription> {
  const monitoring = await client.amlMonitoringCreate({
    verificationId,
    frequency: 'DAILY', // or 'WEEKLY', 'MONTHLY'
    includePep: true,
    includeSanctions: true,
    includeAdverseMedia: true,
    notificationUrl: 'https://yourapp.com/api/aml/webhook',
    riskThreshold: 0.7 // Alert when risk score exceeds 0.7
  });
  
  return monitoring;
}

// Generate AML reports
async function generateAmlReport(monitoringId: string, format: 'PDF' | 'JSON'): Promise<Report> {
  const report = await client.amlMonitoringReport(monitoringId, format);
  return report;
}
```

## 🔄 Webhook Processing

### Webhook Payload Structure
```typescript
// Webhook payload structure
interface IdenfyWebhookPayload {
  id: string;           // Session ID
  status: string;       // 'approved', 'rejected', 'review', 'abandoned'
  referenceId: string;  // Your reference ID
  country: string;      // Country code
  language: string;     // Language code
  createdAt: string;    // ISO timestamp
  completedAt?: string; // ISO timestamp when completed
  
  // User data
  data?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    nationality?: string;
  };
  
  // Document verification results
  documents?: {
    documentType: string;
    documentNumber: string;
    country: string;
    expiryDate?: string;
    verificationStatus: string;
  };
  
  // Face verification results
  face?: {
    similarity: number;  // Face match percentage
    liveness: number;    // Liveness detection score
    threeDLiveness: number; // 3D liveness score
  };
  
  // AML results (if enabled)
  aml?: {
    pep: boolean;
    sanctions: boolean;
    adverseMedia: boolean;
    riskScore: number;
  };
  
  // Additional features results
  proofOfAddress?: {
    verified: boolean;
    address: string;
    documentType: string;
  };
  
  ageVerification?: {
    verified: boolean;
    age: number;
    meetsRequirement: boolean;
  };
}

// Webhook signature validation
function validateWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.IDENFY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## 📊 Status Tracking

### Session Statuses
- **created**: Session created, user hasn't started
- **pending**: User started but not completed
- **in_progress**: User is actively verifying
- **approved**: Verification successful
- **rejected**: Verification failed
- **review**: Manual review required
- **abandoned**: User left without completing

### Status Mapping
```typescript
enum KycStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ABANDONED = 'ABANDONED'
}

function mapIdenfyStatusToKycStatus(idenfyStatus: string): KycStatus {
  switch (idenfyStatus.toLowerCase()) {
    case 'created':
    case 'pending':
      return KycStatus.PENDING;
    case 'in_progress':
      return KycStatus.IN_PROGRESS;
    case 'approved':
      return KycStatus.APPROVED;
    case 'rejected':
      return KycStatus.REJECTED;
    case 'review':
      return KycStatus.UNDER_REVIEW;
    case 'abandoned':
      return KycStatus.ABANDONED;
    default:
      return KycStatus.PENDING;
  }
}
```

## 🧪 Testing & Dummy Results

### Dummy Results for Testing
```typescript
// Enable dummy results for sandbox testing
async function enableDummyResults(sessionId: string): Promise<void> {
  await client.enableDummyResults(sessionId, {
    // Predefined test scenarios
    scenario: 'APPROVED', // or 'REJECTED', 'REVIEW', 'ABANDONED'
    
    // Custom test data
    customData: {
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      documentType: 'PASSPORT',
      documentNumber: 'TEST123456'
    },
    
    // Test AML results
    amlResults: {
      pep: false,
      sanctions: false,
      adverseMedia: false,
      riskScore: 0.1
    }
  });
}

// AML dummy results
async function enableAmlDummyResults(monitoringId: string): Promise<void> {
  await client.amlDummy(monitoringId, {
    scenario: 'CLEAN', // or 'PEP_FOUND', 'SANCTIONS_FOUND', 'HIGH_RISK'
    customResults: {
      pep: false,
      sanctions: false,
      adverseMedia: false,
      riskScore: 0.1
    }
  });
}
```

## 🔒 Security Considerations

### Webhook Security
1. **Always validate webhook signatures**
2. **Use HTTPS endpoints only**
3. **Implement rate limiting**
4. **Log all webhook events for audit**

### Data Privacy
1. **Never store sensitive document images**
2. **Only store verification results and metadata**
3. **Implement data retention policies**
4. **Use encryption for stored data**

## 📋 Implementation Checklist

### Backend Implementation
- [ ] Install iDenfy SDK
- [ ] Configure environment variables
- [ ] Create IdenfyService class
- [ ] Implement token generation
- [ ] Implement iframe session creation
- [ ] Set up webhook endpoint
- [ ] Add webhook signature validation
- [ ] Implement status mapping
- [ ] Add AML integration
- [ ] Add additional steps support (future)
- [ ] Create error handling
- [ ] Add logging and monitoring
- [ ] Implement raw request/response logging

### Frontend Implementation
- [ ] Create KYC initiation component
- [ ] Implement iframe embedding
- [ ] Add message handling from iframe
- [ ] Create status display component
- [ ] Add error handling and retry logic
- [ ] Implement AML results display

### Testing
- [ ] Test token generation
- [ ] Test iframe session creation
- [ ] Verify webhook processing
- [ ] Test all status transitions
- [ ] Validate error scenarios
- [ ] Test AML integration
- [ ] Test dummy results
- [ ] Verify data persistence

## 🚨 Error Handling

### Common Errors
```typescript
// API Errors
if (error.response?.status === 401) {
  throw new UnauthorizedException('Invalid iDenfy credentials');
}

if (error.response?.status === 400) {
  throw new BadRequestException('Invalid session parameters');
}

if (error.response?.status >= 500) {
  throw new ServiceUnavailableException('iDenfy service unavailable');
}

// Webhook Errors
if (!validateWebhookSignature(payload, signature)) {
  throw new UnauthorizedException('Invalid webhook signature');
}
```

### Retry Logic
```typescript
async function createSessionWithRetry(params: CreateSessionParams, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.createSession(params);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

## 📚 Additional Resources

- [iDenfy API Documentation](https://documentation.idenfy.com/)
- [KYC Overview](https://documentation.idenfy.com/KYC/KYCLanding)
- [Iframe Integration](https://documentation.idenfy.com/KYC/ClientRedirectToWebUiIframe)
- [Token Generation](https://documentation.idenfy.com/KYC/GeneratingIdentificationToken)
- [Additional Steps](https://documentation.idenfy.com/KYC/AdditionalSteps)
- [Dummy Results](https://documentation.idenfy.com/KYC/KYCDummyResults)
- [AML Features](https://documentation.idenfy.com/aml/amlLanding)

## 🔄 Migration from Persona

If migrating from Persona, note these key differences:
1. **API Structure**: Different endpoint structure and response format
2. **Webhook Payload**: Different webhook event structure
3. **Status Mapping**: Different status values and meanings
4. **Session Management**: Different session lifecycle
5. **Error Handling**: Different error codes and messages
6. **Iframe Integration**: iDenfy provides more robust iframe support
7. **AML Integration**: Built-in AML features with monitoring capabilities

## 🔍 Raw Request/Response Logging

### Implementation for Debugging
```typescript
// Log all raw requests and responses
class IdenfyServiceWithLogging extends IdenfyService {
  private async logRequest(endpoint: string, payload: any, headers: any) {
    await this.prismaService.rawRequestLog.create({
      data: {
        provider: 'IDENFY',
        endpoint,
        requestPayload: JSON.stringify(payload),
        requestHeaders: JSON.stringify(headers),
        timestamp: new Date(),
        type: 'REQUEST'
      }
    });
  }

  private async logResponse(endpoint: string, response: any, status: number) {
    await this.prismaService.rawResponseLog.create({
      data: {
        provider: 'IDENFY',
        endpoint,
        responsePayload: JSON.stringify(response),
        responseStatus: status,
        timestamp: new Date(),
        type: 'RESPONSE'
      }
    });
  }

  // Override methods to add logging
  async createSession(params: CreateSessionParams) {
    await this.logRequest('/api/v2/session', params, {});
    
    try {
      const response = await super.createSession(params);
      await this.logResponse('/api/v2/session', response, 200);
      return response;
    } catch (error) {
      await this.logResponse('/api/v2/session', error, error.status || 500);
      throw error;
    }
  }
}
```

This guide should provide the AI agent with all the necessary information to successfully implement iDenfy integration, including iframe support, AML features, and comprehensive testing capabilities. 