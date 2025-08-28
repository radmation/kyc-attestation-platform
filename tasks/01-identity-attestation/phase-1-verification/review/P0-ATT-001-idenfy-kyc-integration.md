# Task: iDenfy KYC Integration Service

## Meta Information
- **Task ID**: P0-ATT-001
- **Epic**: On-Chain Identity & Attestation
- **Priority**: P0 (Critical)
- **Estimate**: L (2-3 weeks)
- **Sprint**: Sprint 2
- **Assignee**: AI Developer

## Dependencies
- [ ] P0-INF-001: Authentication & Authorization System (needs JWT authentication)
- [ ] P0-INF-002: API Gateway & Security Middleware (needs API infrastructure)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Existing Modules**: Auth module at `/apps/backend/src/modules/auth/`
- **KYC Module**: Basic structure at `/apps/backend/src/modules/kyc/`

**Related Files**: 
- Reference: `/apps/backend/src/modules/kyc/` (existing module structure)
- Pattern: `/apps/backend/src/modules/auth/` (similar service patterns)
- Database: `/apps/backend/prisma/schema.prisma` (KycVerification model)
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md` section 7 (Event Streaming)
- **iDenfy Integration Guide**: `/docs/IDENFY_INTEGRATION_GUIDE.md` - Complete integration reference
- **Environment Configuration**: `/apps/backend/.env` - iDenfy API key already configured

## Objective
Implement complete iDenfy KYC integration including iframe embedding, webhook processing, status tracking, AML integration, and real-time updates for identity verification within the KYC attestation platform.

## 🎯 **TASK BREAKDOWN INTO MANAGEABLE CHUNKS**

### **Phase 1: Core Infrastructure & Token Generation (Week 1)**
**Goal**: Set up basic iDenfy integration infrastructure

#### **Chunk 1.1: Environment & Dependencies Setup**
- [ ] Install iDenfy SDK: `npm install idenfy-node-client`
- [ ] Configure environment variables in `.env` (✅ IDENFY_API_KEY already configured)
- [ ] Create basic iDenfy configuration service
- [ ] Set up API client with authentication

#### **Chunk 1.2: Token Generation Service**
- [ ] Implement `generateIdentificationToken()` function
- [ ] Add proper error handling and retry logic
- [ ] Create unit tests for token generation
- [ ] Add logging for debugging

#### **Chunk 1.3: Basic Session Management**
- [ ] Create `IdenfyService` class structure
- [ ] Implement basic session creation
- [ ] Add session status tracking
- [ ] Create database models for session storage

### **Phase 2: Iframe Integration & Frontend (Week 2)**
**Goal**: Implement iframe-based KYC verification

#### **Chunk 2.1: Iframe Session Creation**
- [ ] Implement `createIframeSession()` with all KYC features
- [ ] Add support for configurable KYC features (face auth, 3D liveness, etc.)
- [ ] Create iframe session validation
- [ ] Add iframe-specific error handling

#### **Chunk 2.2: Frontend Iframe Component**
- [ ] Create React `IdenfyIframe` component
- [ ] Implement message handling from iframe
- [ ] Add proper iframe security attributes
- [ ] Create status display and error handling

#### **Chunk 2.3: Iframe Communication**
- [ ] Implement postMessage handling for iframe events
- [ ] Add verification completion callbacks
- [ ] Handle verification abandonment and failures
- [ ] Create iframe event logging

### **Phase 3: Webhook Processing & Status Management (Week 2-3)**
**Goal**: Implement robust webhook handling and status synchronization

#### **Chunk 3.1: Webhook Endpoint**
- [ ] Create `/api/v1/kyc/webhook/idenfy` endpoint
- [ ] Implement webhook signature validation
- [ ] Add webhook payload parsing and validation
- [ ] Create webhook event logging

#### **Chunk 3.2: Status Mapping & Updates**
- [ ] Implement iDenfy status to internal status mapping
- [ ] Create status update service
- [ ] Add real-time status synchronization
- [ ] Implement status change notifications

#### **Chunk 3.3: Data Persistence**
- [ ] Update database schema for iDenfy data
- [ ] Implement verification result storage
- [ ] Add audit trail for all verification events
- [ ] Create data retention policies

### **Phase 4: AML Integration & Advanced Features (Week 3)**
**Goal**: Add AML checking and monitoring capabilities

#### **Chunk 4.1: AML Single Request**
- [ ] Implement `performAmlCheck()` function
- [ ] Add PEP, sanctions, and adverse media checking
- [ ] Create AML result storage and retrieval
- [ ] Add AML risk scoring

#### **Chunk 4.2: AML Monitoring**
- [ ] Implement `setupAmlMonitoring()` for continuous checking
- [ ] Add AML monitoring subscription management
- [ ] Create AML alert system
- [ ] Implement AML report generation

#### **Chunk 4.3: Advanced KYC Features**
- [ ] Add proof of address verification
- [ ] Implement age verification
- [ ] Add address verification from documents
- [ ] Create 3D liveness detection support

### **Phase 5: Testing & Quality Assurance (Week 3)**
**Goal**: Ensure robust and reliable integration

#### **Chunk 5.1: Testing Infrastructure**
- [ ] Set up sandbox environment testing
- [ ] Implement dummy results for testing
- [ ] Create test data scenarios
- [ ] Add integration test suite

#### **Chunk 5.2: Error Handling & Resilience**
- [ ] Implement comprehensive error handling
- [ ] Add retry logic with exponential backoff
- [ ] Create fallback mechanisms
- [ ] Add circuit breaker patterns

#### **Chunk 5.3: Monitoring & Logging**
- [ ] Implement raw request/response logging
- [ ] Add performance monitoring
- [ ] Create health check endpoints
- [ ] Add comprehensive audit logging

## 🔧 **IMPLEMENTATION APPROACH**

### **1. Start with Core Infrastructure**
Begin with Phase 1 to establish the foundation:
- Set up environment and dependencies
- Implement token generation
- Create basic service structure

### **2. Focus on Iframe Integration**
Prioritize Phase 2 for MVP delivery:
- Iframe session creation
- Frontend component development
- Communication handling

### **3. Build Robust Backend**
Complete Phase 3 for production readiness:
- Webhook processing
- Status management
- Data persistence

### **4. Add Advanced Features**
Implement Phase 4 for enhanced capabilities:
- AML integration
- Advanced KYC features
- Monitoring capabilities

### **5. Ensure Quality**
Finish with Phase 5 for reliability:
- Comprehensive testing
- Error handling
- Monitoring and logging

## 📋 **DELIVERABLES BY PHASE**

### **Phase 1 Deliverables**
- ✅ iDenfy SDK installed and configured
- ✅ Environment variables configured
- ✅ Token generation service implemented
- ✅ Basic session management working
- ✅ Unit tests passing

### **Phase 2 Deliverables**
- ✅ Iframe session creation working
- ✅ Frontend iframe component functional
- ✅ Iframe communication established
- ✅ KYC verification flow working end-to-end

### **Phase 3 Deliverables**
- ✅ Webhook endpoint processing correctly
- ✅ Status synchronization working
- ✅ Data persistence implemented
- ✅ Audit trail functional

### **Phase 4 Deliverables**
- ✅ AML checking functional
- ✅ AML monitoring working
- ✅ Advanced KYC features enabled
- ✅ Risk assessment operational

### **Phase 5 Deliverables**
- ✅ Comprehensive testing completed
- ✅ Error handling robust
- ✅ Monitoring and logging operational
- ✅ Production-ready integration

## 🚨 **CRITICAL SUCCESS FACTORS**

### **1. Iframe Integration Priority**
- **Must work**: Iframe embedding and communication
- **Must handle**: All verification scenarios
- **Must support**: Mobile and desktop devices

### **2. Webhook Reliability**
- **Must validate**: All webhook signatures
- **Must handle**: Webhook failures gracefully
- **Must log**: All webhook events for audit

### **3. Status Synchronization**
- **Must track**: All verification states
- **Must update**: Real-time status changes
- **Must persist**: All verification results

### **4. AML Integration**
- **Must perform**: Real-time AML checks
- **Must monitor**: Continuous risk assessment
- **Must alert**: High-risk verifications

### **5. Error Handling**
- **Must recover**: From service failures
- **Must retry**: Failed operations
- **Must log**: All errors for debugging

## 🔍 **TESTING STRATEGY**

### **Unit Testing**
- Token generation service
- Status mapping logic
- Webhook validation
- Error handling

### **Integration Testing**
- Iframe session creation
- Webhook processing
- Status updates
- AML integration

### **End-to-End Testing**
- Complete KYC flow
- Error scenarios
- Performance under load
- Security validation

## 📚 **RESOURCES & REFERENCES**

### **Primary Documentation**
- **iDenfy Integration Guide**: `/docs/IDENFY_INTEGRATION_GUIDE.md`
- **Official iDenfy Docs**: [KYC Overview](https://documentation.idenfy.com/KYC/KYCLanding)
- **Iframe Integration**: [Iframe Guide](https://documentation.idenfy.com/KYC/ClientRedirectToWebUiIframe)

### **Implementation Patterns**
- **Service Layer**: Reference `/apps/backend/src/modules/auth/` patterns
- **Database**: Use Prisma patterns from existing modules
- **Error Handling**: Follow NestJS exception patterns
- **Testing**: Use Jest patterns from existing tests

### **Key Integration Points**
- **Token Generation**: `https://ivs.idenfy.com/api/v2/token`
- **Iframe URL**: `https://ivs.idenfy.com/api/v2/redirect`
- **Webhook Endpoint**: `/api/v1/kyc/webhook/idenfy`
- **Status Updates**: Real-time via webhooks

## 🎯 **SUCCESS METRICS**

### **Functional Requirements**
- ✅ Iframe KYC verification working
- ✅ Webhook processing reliable
- ✅ Status synchronization accurate
- ✅ AML integration functional
- ✅ Error handling robust

### **Performance Requirements**
- ✅ Token generation < 2 seconds
- ✅ Iframe loading < 3 seconds
- ✅ Webhook processing < 1 second
- ✅ Status updates < 500ms

### **Quality Requirements**
- ✅ 100% webhook signature validation
- ✅ 99.9% uptime for critical paths
- ✅ Comprehensive error logging
- ✅ Full audit trail maintenance

## 🔑 **CURRENT ENVIRONMENT CONFIGURATION**

### **iDenfy Configuration Status**
- ✅ **API Access Key**: `EbjnE31hXkY` (configured in `/apps/backend/.env`)
- ✅ **API Secret Key**: `yYxHUSev1Khkgfue9n09` (configured in `/apps/backend/.env`)
- ✅ **Webhook Secret**: `719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2` (configured in `/apps/backend/.env`)
- ✅ **Environment**: `sandbox` (configured in `/apps/backend/.env`)
- ✅ **Base URL**: `https://ivs.idenfy.com` (configured in `/apps/backend/.env`)

### **Environment Configuration Complete** ✅
All required iDenfy environment variables are now configured in `/apps/backend/.env`:

```env
IDENFY_API_ACCESS_KEY="EbjnE31hXkY"
IDENFY_API_SECRET_KEY="yYxHUSev1Khkgfue9n09"
IDENFY_WEBHOOK_SECRET="719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2"
IDENFY_ENVIRONMENT="sandbox"
IDENFY_BASE_URL="https://ivs.idenfy.com"
```

### **Environment Setup Complete** ✅
All iDenfy environment variables are configured and ready for development:

1. ✅ **API Access Key**: Configured
2. ✅ **API Secret Key**: Configured  
3. ✅ **Webhook Secret**: Generated and configured
4. ✅ **Environment**: Set to 'sandbox' for testing
5. ✅ **Base URL**: Configured

**Next**: Configure webhooks in iDenfy dashboard using the webhook secret above.

## 🚀 **NEXT STEPS FOR AI AGENT**

1. **Start with Phase 1, Chunk 1.1**: Set up remaining environment variables
2. **Follow the chunk-by-chunk approach**: Complete each chunk before moving to the next
3. **Reference the integration guide**: Use `/docs/IDENFY_INTEGRATION_GUIDE.md` for implementation details
4. **Test incrementally**: Verify each chunk works before proceeding
5. **Log everything**: Implement raw request/response logging from the start
6. **Focus on iframe integration**: This is the MVP priority
7. **Build robust error handling**: Don't skip error scenarios
8. **Validate webhook security**: Ensure proper signature validation

This task breakdown ensures the AI agent can work incrementally and successfully complete the iDenfy integration with clear milestones and deliverables. 