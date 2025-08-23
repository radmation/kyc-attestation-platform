# 🚀 KYC Attestation Platform - Developer Setup Checklist

## 🎯 **Overview**
This checklist guides developers through setting up all external services, accounts, and configurations needed for the KYC Attestation Platform. This is for **manual setup tasks** that cannot be automated by AI agents.

---

## 🔑 **Prerequisites & Account Setup**

### **1. GitHub Account & Repository Access**
- [ ] **GitHub Account**: Ensure you have access to the repository
- [ ] **Repository Access**: Verify you can clone, push, and create PRs
- [ ] **SSH Keys**: Set up SSH keys for repository access
- [ ] **Branch Protection**: Ensure `develop` and `main` branches are protected

### **2. Development Environment**
- [ ] **Docker**: Install Docker Desktop (v20.10+)
- [ ] **Docker Compose**: Install Docker Compose (v2.0+)
- [ ] **Node.js**: Install Node.js (v18+)
- [ ] **npm**: Install npm (v8+)
- [ ] **Git**: Install Git (v2.30+)
- [ ] **Code Editor**: Install VS Code, Cursor, or preferred editor

---

## 🌐 **ngrok Setup for Development Webhooks**

### **3. ngrok Account & Configuration**
- [ ] **Sign Up**: Create account at [ngrok.com](https://ngrok.com)
- [ ] **Get Auth Token**: Navigate to [Auth Token](https://dashboard.ngrok.com/get-started/your-authtoken)
- [ ] **Copy Auth Token**: Save your auth token securely
- [ ] **Choose Plan**: Free plan works for basic development (paid plans for custom domains)

#### **ngrok Configuration Steps**
- [ ] **Add to Environment**: Update `apps/backend/.env` with:
  ```env
  ENABLE_NGROK="true"
  NGROK_AUTH_TOKEN="your_actual_auth_token_here"
  NGROK_REGION="us"  # or eu, au, ap, sa, jp, in
  ```
- [ ] **Test ngrok**: Run `./scripts/dev-setup.sh` to verify ngrok works
- [ ] **Get Public URL**: Check `http://localhost:4040` for your ngrok URL
- [ ] **Verify HTTPS**: Ensure ngrok tunnel is accessible from internet

#### **ngrok Security Considerations**
- [ ] **Basic Auth**: Consider enabling basic auth for development (configured in `ngrok.yml`)
- [ ] **Rate Limiting**: Free plan has 100 requests/minute limit
- [ ] **Tunnel Inspection**: Monitor webhook traffic at ngrok dashboard

---

## 📧 **Mailgun Setup for Production Email**

### **4. Mailgun Account & Domain Configuration**
- [ ] **Sign Up**: Create account at [mailgun.com](https://mailgun.com)
- [ ] **Verify Email**: Confirm your email address
- [ ] **Add Payment Method**: Required for production use
- [ ] **Choose Region**: US or EU (affects data residency)

#### **Domain Setup**
- [ ] **Add Domain**: Add `mail.identhor.com` as your sending domain
- [ ] **Verify Domain**: Complete domain verification process
- [ ] **Get API Key**: Copy your Mailgun API key from dashboard
- [ ] **Get Domain Info**: Note your domain region (US/EU)

#### **DNS Configuration for identhor.com**
- [ ] **SPF Record**: Add to DNS:
  ```
  mail.identhor.com. IN TXT "v=spf1 include:_spf.mailgun.org ~all"
  ```
- [ ] **DKIM Record**: Add the DKIM record provided by Mailgun
- [ ] **DMARC Record**: Add to DNS:
  ```
  _dmarc.mail.identhor.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@identhor.com"
  ```
- [ ] **MX Record**: Add Mailgun MX record if required
- [ ] **Verify DNS**: Use Mailgun's DNS verification tool

#### **Mailgun Environment Configuration**
- [ ] **Add to Environment**: Update `apps/backend/.env` with:
  ```env
  MAILGUN_API_KEY="your_mailgun_api_key_here"
  MAILGUN_DOMAIN="mail.identhor.com"
  MAILGUN_REGION="US"  # or EU
  MAILGUN_WEBHOOK_SECRET="your_generated_webhook_secret_here"
  ```
- [ ] **Generate Webhook Secret**: Create secure webhook secret for Mailgun
- [ ] **Test Email Sending**: Verify emails can be sent via Mailgun

---

## 🔐 **iDenfy Setup for KYC Verification**

### **5. iDenfy Account & API Configuration**
- [ ] **Sign Up**: Create account at [idenfy.com](https://idenfy.com)
- [ ] **Verify Account**: Complete account verification process
- [ ] **Get API Credentials**: Obtain API access key and secret
- [ ] **Choose Plan**: Select appropriate plan for your needs

#### **iDenfy API Configuration**
- [ ] **API Access Key**: Copy from iDenfy dashboard
- [ ] **API Secret Key**: Copy from iDenfy dashboard
- [ ] **Environment**: Confirm sandbox vs production settings
- [ ] **Base URL**: Verify `https://ivs.idenfy.com` is correct

#### **iDenfy Environment Setup**
- [ ] **Update Environment**: Ensure `apps/backend/.env` has:
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
- [ ] **Configure KYC Webhook**:
  - **URL**: `https://your-ngrok-url.ngrok.io/api/v1/kyc/webhook/idenfy` (development)
  - **URL**: `https://identhor.com/api/v1/kyc/webhook/idenfy` (production)
  - **Signing Key**: `719d19af4f57508df8e0eaab21bf4a5f5cb61e0bf50282cec5514bf36501c4e2`
  - **HTTP Method**: POST
  - **OAuth**: ❌ Disable (use webhook signatures instead)

- [ ] **Configure AML Webhook**:
  - **URL**: `https://your-ngrok-url.ngrok.io/api/v1/aml/webhook/idenfy` (development)
  - **URL**: `https://identhor.com/api/v1/aml/webhook/idenfy` (production)
  - **Signing Key**: Same as above
  - **HTTP Method**: POST
  - **OAuth**: ❌ Disable

- [ ] **Configure Document Webhook**:
  - **URL**: `https://your-ngrok-url.ngrok.io/api/v1/documents/webhook/idenfy` (development)
  - **URL**: `https://identhor.com/api/v1/documents/webhook/idenfy` (production)
  - **Signing Key**: Same as above
  - **HTTP Method**: POST
  - **OAuth**: ❌ Disable

#### **Webhook Testing**
- [ ] **Test Webhook Delivery**: Send test webhook from iDenfy dashboard
- [ ] **Verify Signature Validation**: Check backend logs for successful validation
- [ ] **Monitor ngrok Traffic**: View webhook requests at `http://localhost:4040`
- [ ] **Check Backend Logs**: Verify webhook processing in application logs

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
- [ ] **Email Service**: Verify Mailgun is configured and tested
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
- [ ] **Email Not Sending**: Verify Mailgun configuration and DNS settings

### **Support Resources**
- [ ] **ngrok Documentation**: [docs.ngrok.com](https://docs.ngrok.com)
- [ ] **Mailgun Documentation**: [documentation.mailgun.com](https://documentation.mailgun.com)
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