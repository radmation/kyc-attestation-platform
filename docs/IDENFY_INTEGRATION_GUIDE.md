# iDenfy Integration Guide

## Overview
This guide provides comprehensive information for integrating iDenfy's KYC verification services into the KYC Attestation Platform. iDenfy offers multiple integration options including API-based verification, iframe embedding, and webhook notifications.

## 🔑 API Authentication

### Environment Variables
```env
# iDenfy Configuration
IDENFY_API_KEY=your_idenfy_api_key_here
IDENFY_API_SECRET=your_idenfy_api_secret_here
IDENFY_ENVIRONMENT=sandbox  # or 'production'
IDENFY_WEBHOOK_SECRET=your_webhook_secret_here
IDENFY_BASE_URL=https://ivs.idenfy.com  # Production
IDENFY_BASE_URL=https://ivs.idenfy.com  # Sandbox (same URL)
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

### Method 1: API-Based Verification (Recommended)

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

#### 2. Webhook Processing
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
  data?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    // Additional user data if provided
  };
  documents?: {
    documentType: string;
    documentNumber: string;
    country: string;
    // Document verification results
  };
  face?: {
    similarity: number;  // Face match percentage
    liveness: number;    // Liveness detection score
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

#### 3. Status Mapping
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

### Method 2: Iframe Embedding

#### 1. Create Session for Iframe
```typescript
const session = await client.createSession({
  country: 'US',
  language: 'en',
  redirectUrl: 'https://yourapp.com/kyc/callback',
  callbackUrl: 'https://yourapp.com/api/kyc/webhook/idenfy',
  referenceId: 'user-123-kyc',
  iframe: true  // Enable iframe mode
});
```

#### 2. Embed Iframe in Frontend
```typescript
// React component example
const IdenfyIframe: React.FC<{ sessionUrl: string }> = ({ sessionUrl }) => {
  return (
    <div className="idenfy-container">
      <iframe
        src={sessionUrl}
        width="100%"
        height="600px"
        frameBorder="0"
        allow="camera; microphone"
        title="iDenfy Verification"
      />
    </div>
  );
};
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

### Polling for Status Updates
```typescript
async function pollSessionStatus(sessionId: string): Promise<IdenfySession> {
  const session = await client.getSession(sessionId);
  return session;
}

// Polling implementation
async function startStatusPolling(sessionId: string, userId: string) {
  const pollInterval = setInterval(async () => {
    try {
      const session = await pollSessionStatus(sessionId);
      
      if (['approved', 'rejected', 'review', 'abandoned'].includes(session.status)) {
        clearInterval(pollInterval);
        await updateKycStatus(userId, mapIdenfyStatusToKycStatus(session.status));
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000); // Poll every 5 seconds
  
  // Stop polling after 30 minutes
  setTimeout(() => clearInterval(pollInterval), 30 * 60 * 1000);
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

## 🧪 Testing

### Sandbox Environment
- Use `environment: 'sandbox'` for testing
- Test with sample documents provided by iDenfy
- Verify webhook handling with test events
- Test all status transitions

### Test Data
```typescript
// Sample test session data
const testSession = {
  country: 'US',
  language: 'en',
  redirectUrl: 'http://localhost:3000/kyc/callback',
  callbackUrl: 'http://localhost:3000/api/kyc/webhook/idenfy',
  referenceId: 'test-user-123',
  data: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  }
};
```

## 📋 Implementation Checklist

### Backend Implementation
- [ ] Install iDenfy SDK
- [ ] Configure environment variables
- [ ] Create IdenfyService class
- [ ] Implement session creation
- [ ] Set up webhook endpoint
- [ ] Add webhook signature validation
- [ ] Implement status mapping
- [ ] Add polling fallback mechanism
- [ ] Create error handling
- [ ] Add logging and monitoring

### Frontend Implementation
- [ ] Create KYC initiation component
- [ ] Implement iframe embedding (if using)
- [ ] Add redirect handling
- [ ] Create status display component
- [ ] Add error handling and retry logic

### Testing
- [ ] Test session creation
- [ ] Verify webhook processing
- [ ] Test all status transitions
- [ ] Validate error scenarios
- [ ] Test polling mechanism
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

- [iDenfy API Documentation](https://docs.idenfy.com/)
- [iDenfy Webhook Guide](https://docs.idenfy.com/webhooks)
- [iDenfy SDK Documentation](https://docs.idenfy.com/sdk)
- [iDenfy Testing Guide](https://docs.idenfy.com/testing)

## 🔄 Migration from Persona

If migrating from Persona, note these key differences:
1. **API Structure**: Different endpoint structure and response format
2. **Webhook Payload**: Different webhook event structure
3. **Status Mapping**: Different status values and meanings
4. **Session Management**: Different session lifecycle
5. **Error Handling**: Different error codes and messages

This guide should provide the AI agent with all the necessary information to successfully implement iDenfy integration. 