# 🚀 KYC Attestation Platform - Developer Setup Checklist

## 🎯 **Overview**
This checklist guides developers through setting up all external services, accounts, and configurations needed for the KYC Attestation Platform. This is for **manual setup tasks** that cannot be automated by AI agents.

---

## 🔑 **Prerequisites & Account Setup**

### **1. GitHub Account & Repository Access**
- [x] **GitHub Account**: Ensure you have access to the repository
- [x] **Repository Access**: Verify you can clone, push, and create PRs
- [x] **SSH Keys**: Set up SSH keys for repository access
- [ ] **Branch Protection**: Ensure `develop` and `main` branches are protected

### **2. Development Environment**
- [x] **Docker**: Install Docker Desktop (v20.10+)
- [x] **Docker Compose**: Install Docker Compose (v2.0+)
- [x] **Node.js**: Install Node.js (v18+)
- [x] **npm**: Install npm (v8+)
- [x] **Git**: Install Git (v2.30+)
- [x] **Code Editor**: Install VS Code, Cursor, or preferred editor

---

## 🌐 **ngrok Setup for Development Webhooks**

### **3. ngrok Account & Configuration**
- [x] **Sign Up**: Create account at [ngrok.com](https://ngrok.com)
- [x] **Get Auth Token**: Navigate to [Auth Token](https://dashboard.ngrok.com/get-started/your-authtoken)
- [x] **Copy Auth Token**: Save your auth token securely
- [x] **Choose Plan**: Free plan works for basic development (paid plans for custom domains)

#### **ngrok Configuration Steps**
- [x] **Add to Environment**: Update `apps/backend/.env` with:
  ```env
  ENABLE_NGROK="true"
  NGROK_AUTH_TOKEN="your_actual_auth_token_here"
  NGROK_REGION="us"  # or eu, au, ap, sa, jp, in
  ```
- [x] **Test ngrok**: Run `./scripts/dev-setup.sh` to verify ngrok works
- [ ] **Get Public URL**: Check `http://localhost:4040` for your ngrok URL
- [x] **Verify HTTPS**: Ensure ngrok tunnel is accessible from internet
- [x] **Test Public Access**: Visit your ngrok URL from another device/network
- [x] **Check Backend Health**: Verify `https://your-ngrok-url.ngrok.io/api/health` works
- [ ] **Test Webhook Endpoint**: Ensure `https://your-ngrok-url.ngrok.io/api/v1/webhooks/idenfy` is accessible

#### **ngrok Security Considerations**
- [ ] **Basic Auth**: Consider enabling basic auth for development (configured in `ngrok.yml`)
- [ ] **Rate Limiting**: Free plan has 100 requests/minute limit
- [ ] **Tunnel Inspection**: Monitor webhook traffic at ngrok dashboard

#### **ngrok Testing & Validation**
- [x] **Start ngrok Service**: Run `./scripts/dev-setup.sh start` or `docker-compose up ngrok`
- [x] **Check ngrok Dashboard**: Open `http://localhost:4040` to see tunnel status
- [x] **Verify Public URL**: Note your public ngrok URL (e.g., `https://abc123.ngrok.io`)
- [x] **Test Public Access**: Visit your ngrok URL from another device/network
- [x] **Check Backend Health**: Test `https://your-ngrok-url.ngrok.io/api/health`
- [x] **Test Webhook Endpoint**: Verify `https://your-ngrok-url.ngrok.io/api/v1/webhooks/idenfy` is accessible
- [x] **Monitor Traffic**: Use ngrok dashboard to see incoming requests
- [x] **Test with curl**: Use `curl -X GET https://your-ngrok-url.ngrok.io/api/health`
- [x] **Run Comprehensive Test**: Execute `./scripts/test-ngrok.sh` for automated testing

---

## 📧 **SendGrid Setup for Production Email**

### **4. SendGrid Account & Domain Configuration**
- [ ] **Sign Up**: Create account at [sendgrid.com](https://sendgrid.com)
- [ ] **Verify Email**: Confirm your email address
- [ ] **Add Payment Method**: Required for production use
- [ ] **Choose Plan**: Free plan available (100 emails/day), paid plans for higher volume

#### **Domain Setup**
- [ ] **Add Domain**: Add `mail.identhor.com` as your sending domain
- [ ] **Verify Domain**: Complete domain verification process
- [ ] **Get API Key**: Copy your SendGrid API key from dashboard
- [ ] **Get Domain Info**: Note your domain region (US/EU)

#### **DNS Configuration for identhor.com**
- [ ] **SPF Record**: Add to DNS:
  ```
  mail.identhor.com. IN TXT "v=spf1 include:sendgrid.net ~all"
  ```
- [ ] **DKIM Record**: Add the DKIM record provided by SendGrid
- [ ] **DMARC Record**: Add to DNS:
  ```
  _dmarc.mail.identhor.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@identhor.com"
  ```
- [ ] **MX Record**: Add SendGrid MX record if required
- [ ] **Verify DNS**: Use SendGrid's DNS verification tool

#### **SendGrid Environment Configuration**
- [ ] **Add to Environment**: Update `apps/backend/.env` with:
  ```env
  SENDGRID_API_KEY="your_sendgrid_api_key_here"
  SENDGRID_DOMAIN="mail.identhor.com"
  SENDGRID_REGION="US"  # or EU
  ```
- [ ] **Test Email Sending**: Verify emails can be sent via SendGrid

---

## 🔐 **iDenfy Setup for KYC Verification**

### **5. iDenfy Account & API Configuration**
- [x] **Sign Up**: Create account at [idenfy.com](https://idenfy.com)
- [x] **Verify Account**: Complete account verification process
- [x] **Get API Credentials**: Obtain API access key and secret
- [x] **Choose Plan**: Select appropriate plan for your needs

#### **iDenfy API Configuration**
- [x] **API Access Key**: Copy from iDenfy dashboard
- [x] **API Secret Key**: Copy from iDenfy dashboard
- [x] **Environment**: Confirm sandbox vs production settings
- [ ] **Base URL**: Verify `https://ivs.idenfy.com` is correct

#### **iDenfy Environment Setup**
- [x] **Update Environment**: Ensure `apps/backend/.env` has:
  ```env
  IDENFY_API_ACCESS_KEY="your_actual_access_key"
  IDENFY_API_SECRET_KEY="your_actual_secret_key"
  IDENFY_WEBHOOK_SECRET="719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2"
  IDENFY_ENVIRONMENT="sandbox"  # or "production"
  IDENFY_BASE_URL="https://ivs.idenfy.com"
  ```

---

## 🌐 **Webhook Configuration**

### **6. iDenfy Webhook Setup**
- [ ] **Login to iDenfy Dashboard**: Access webhook configuration
- [ ] **Configure Single Webhook Endpoint**: Use one endpoint for all webhook types:
  - **Development URL**: `https://b16b595e873a.ngrok-free.app/api/v1/webhooks/idenfy`
  - **Production URL**: `https://identhor.com/api/v1/webhooks/idenfy`
  - **Signing Key**: `719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2`
  - **HTTP Method**: POST
  - **OAuth**: ❌ Disable (use webhook signatures instead)

#### **Required Webhook Types (Set These Up for MVP)**
- [ ] **ID VERIFICATION AUTO FINISHED**: When identity verification is completed automatically
- [ ] **ID VERIFICATION MANUAL FINISHED**: When identity verification is manually approved/denied
- [ ] **ID VERIFICATION EXPIRED**: When identity verification expires
- [ ] **ID VERIFICATION CANCELED**: When identity verification is cancelled
- [ ] **ID VERIFICATION RESUBMITTED**: When client resubmits verification
- [ ] **AML MONITORING**: When AML monitoring user is checked/accepted/declined
- [ ] **AML MONITORING EXPIRATION**: When AML monitoring user expires
- [ ] **DOCUMENT EXPIRATION**: When client's identity document expires
- [ ] **FACIAL AUTHENTICATION**: When facial authentication session ends

#### **Optional Webhook Types (Don't Set Up for MVP)**
- [ ] **ID VERIFICATION**: Legacy webhook (use specific ones above instead)
- [ ] **COMPANY REVIEW**: Company verification completion
- [ ] **COMPANY DELETE**: Company deletion
- [ ] **COMPANY AML REVIEW**: Company AML review status updates
- [ ] **COMPANY INFO REQUEST**: Additional company info requests
- [ ] **COMPANY EXPIRATION**: Company verification expiration
- [ ] **COMPANY SUBMIT**: Company information submission
- [ ] **ACCOUNT CHECK**: Social media account verification
- [ ] **BANK_VERIFICATION**: Bank verification completion
- [ ] **GOV ORDERED DOCUMENT**: Government document delivery
- [ ] **SOS_REPORT**: SOS filing report delivery

#### **Webhook Payload Documentation**
- [ ] **Get Sample Payloads**: Request sample JSON responses from iDenfy support
- [ ] **Test Webhook Delivery**: Send test webhooks to capture real payloads
- [ ] **Review Payload Documentation**: Check `docs/IDENFY_WEBHOOK_PAYLOADS.md` for AI agent reference
- [ ] **Validate Payload Handling**: Ensure backend can process all webhook types
- [ ] **Update Payload Examples**: Replace example payloads with real ones from testing

#### **Webhook Testing**
- [ ] **Test Webhook Delivery**: Send test webhook from iDenfy dashboard
- [ ] **Verify Signature Validation**: Check backend logs for successful validation
- [ ] **Monitor ngrok Traffic**: View webhook requests at `http://localhost:4040`
- [ ] **Check Backend Logs**: Verify webhook processing in application logs
- [ ] **Test All Webhook Types**: Verify each webhook type is processed correctly
- [ ] **Validate Payload Parsing**: Ensure different webhook types are handled properly

---

## 🗄️ **Database & Infrastructure**

### **7. PostgreSQL Database Setup**
- [ ] **Local Development**: Ensure PostgreSQL is running locally or via Docker
- [ ] **Connection String**: Verify `DATABASE_URL` in `.env` is correct
- [ ] **Database Creation**: Create database if it doesn't exist
- [ ] **Prisma Migration**: Run `npm run migration:deploy` to set up schema

### **8. Redis Cache Setup**
- [ ] **Local Redis**: Ensure Redis is running locally or via Docker
- [ ] **Connection Test**: Verify Redis connection from backend
- [ ] **Cache Testing**: Test basic cache operations

---

## 🔒 **Security & Authentication**

### **9. JWT Configuration**
- [ ] **Generate JWT Secret**: Create secure random string for JWT signing
- [ ] **Update Environment**: Add to `apps/backend/.env`:
  ```env
  JWT_SECRET="your_32_character_jwt_secret_here"
  JWT_EXPIRES_IN="15m"
  JWT_REFRESH_EXPIRES_IN="7d"
  ```

### **10. Encryption Keys**
- [ ] **Generate Encryption Key**: Create 32-character encryption key
- [ ] **Generate Session Secret**: Create secure session secret
- [ ] **Update Environment**: Add to `apps/backend/.env`:
  ```env
  ENCRYPTION_KEY="your_32_character_encryption_key_here"
  SESSION_SECRET="your_session_secret_here"
  ```

---

## 🧪 **Testing & Validation**

### **11. Development Environment Testing**
- [ ] **Start Services**: Run `./scripts/dev-setup.sh start`
- [ ] **Health Checks**: Verify all services are healthy
- [ ] **API Documentation**: Access Swagger docs at `http://localhost:3000/api/docs`
- [ ] **Database Connection**: Test database connectivity
- [ ] **Redis Connection**: Test Redis connectivity

### **12. Webhook Testing**
- [ ] **ngrok Tunnel**: Verify ngrok is exposing local backend
- [ ] **Webhook Endpoints**: Test webhook endpoints are accessible
- [ ] **Signature Validation**: Test webhook signature validation
- [ ] **Payload Processing**: Verify webhook payloads are processed correctly

### **13. Email Testing**
- [ ] **Mailhog Interface**: Access Mailhog at `http://localhost:8025`
- [ ] **SMTP Testing**: Test email sending via SMTP
- [ ] **SendGrid Testing**: Test email sending via SendGrid API
- [ ] **Email Templates**: Verify email templates render correctly

---

## 🚀 **Production Preparation**

### **14. Environment Configuration**
- [ ] **Production .env**: Create production environment file
- [ ] **Secrets Management**: Ensure all secrets are properly secured
- [ ] **Environment Variables**: Verify all required variables are set
- [ ] **API Keys**: Confirm all API keys are production-ready

### **15. Domain Configuration**
- [ ] **identhor.com DNS**: Verify all DNS records are configured
- [ ] **SSL Certificates**: Ensure HTTPS is properly configured
- [ ] **CORS Settings**: Update CORS origins for production
- [ ] **Rate Limiting**: Configure appropriate rate limits for production

---

## 📋 **Final Verification**

### **16. Pre-Launch Checklist**
- [ ] **All Services Running**: Verify backend, database, Redis are operational
- [ ] **Webhooks Configured**: Confirm iDenfy webhooks are working
- [ ] **Email Service**: Verify SendGrid is configured and tested
- [ ] **API Endpoints**: Test all API endpoints are accessible
- [ ] **Documentation**: Ensure all documentation is up to date
- [ ] **Environment Variables**: Confirm all environment variables are set
- [ ] **Security**: Verify all security measures are in place

### **17. Monitoring Setup**
- [ ] **Health Checks**: Implement health check endpoints
- [ ] **Logging**: Configure appropriate log levels
- [ ] **Error Tracking**: Set up error monitoring
- [ ] **Performance Monitoring**: Implement performance metrics

---

## 🆘 **Troubleshooting Resources**

### **Common Issues & Solutions**
- [ ] **ngrok Not Working**: Check auth token and tunnel status
- [ ] **Webhook Failures**: Verify signature validation and endpoint accessibility
- [ ] **Database Connection**: Check connection string and service status
- [ ] **Email Not Sending**: Verify SendGrid configuration and DNS settings

### **Support Resources**
- [ ] **ngrok Documentation**: [docs.ngrok.com](https://docs.ngrok.com)
- [ ] **SendGrid Documentation**: [docs.sendgrid.com](https://docs.sendgrid.com)
- [ ] **iDenfy Documentation**: [documentation.idenfy.com](https://documentation.idenfy.com)
- [ ] **Project Documentation**: Check `docs/` directory for platform-specific guides

---

## 📝 **Notes & Customizations**

### **Developer Notes**
- [ ] **Custom Configurations**: Document any custom settings
- [ ] **Local Modifications**: Note any local development changes
- [ ] **Performance Tuning**: Document performance optimizations
- [ ] **Security Considerations**: Note any security-specific configurations

---

**Last Updated**: $(date)
**Checklist Version**: 2.0
**Next Review**: After production deployment
**Maintained By**: Development Team 