# 🚀 KYC Attestation Platform - Development Setup

## 📋 **Overview**
This guide will help you set up the KYC Attestation Platform development environment with Docker, ngrok for webhook exposure, and all necessary services.

## 🎯 **What You'll Get**
- ✅ **Backend API** running on `http://localhost:3000/api/v1`
- ✅ **PostgreSQL Database** on `localhost:5432`
- ✅ **Redis Cache** on `localhost:6379`
- ✅ **ngrok Tunnel** for external webhook access
- ✅ **Mailhog** for email testing on `http://localhost:8025`
- ✅ **API Documentation** on `http://localhost:3000/api/docs`

---

## 🐳 **Prerequisites**

### **Required Software**
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v8+)

### **Optional but Recommended**
- [ngrok](https://ngrok.com/download) (for webhook testing)
- [Postman](https://www.postman.com/) (for API testing)
- [DBeaver](https://dbeaver.io/) (for database management)

---

## ⚡ **Quick Start (Recommended)**

### **1. Clone and Setup**
```bash
# Clone the repository
git clone <your-repo-url>
cd kyc-attestation-platform

# Install dependencies
npm install

# Run the development setup script
./scripts/dev-setup.sh
```

### **2. What the Script Does**
The `dev-setup.sh` script will:
- ✅ Check Docker and Docker Compose availability
- ✅ Create environment configuration files
- ✅ Start all development services
- ✅ Configure ngrok for webhook exposure
- ✅ Display all development URLs and next steps

---

## 🔧 **Manual Setup (Alternative)**

### **1. Environment Configuration**
```bash
# Copy environment template
cp apps/backend/env.example apps/backend/.env

# Edit with your configuration
nano apps/backend/.env
```

**Required Environment Variables:**
```env
# Platform Configuration
PLATFORM_DOMAIN="https://identhor.com"
API_VERSION="v1"
PORT=3000
NODE_ENV="development"

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"

# iDenfy Configuration
IDENFY_API_ACCESS_KEY="your_actual_key"
IDENFY_API_SECRET_KEY="your_actual_secret"
IDENFY_WEBHOOK_SECRET="your_webhook_secret"
IDENFY_ENVIRONMENT="sandbox"
IDENFY_BASE_URL="https://ivs.idenfy.com"

# Ngrok Configuration (for development)
ENABLE_NGROK="true"
NGROK_AUTH_TOKEN="your_ngrok_auth_token"
NGROK_REGION="us"
```

### **2. Start Services**
```bash
# Start core services
docker-compose up -d backend db redis

# Start development services (ngrok, mailhog)
docker-compose --profile development up -d
```

---

## 🌐 **ngrok Setup for Webhook Testing**

### **Why ngrok?**
- **External Access**: Expose local backend to the internet
- **Webhook Testing**: Test iDenfy webhooks during development
- **HTTPS Support**: Secure tunnel for webhook endpoints
- **Real-time Inspection**: Monitor webhook requests/responses

### **1. Get ngrok Auth Token**
1. Sign up at [ngrok.com](https://ngrok.com)
2. Go to [Auth Token](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Copy your auth token

### **2. Configure ngrok**
```bash
# Add to your .env file
NGROK_AUTH_TOKEN="your_actual_token_here"
ENABLE_NGROK="true"

# Or configure manually
ngrok config add-authtoken YOUR_TOKEN
```

### **3. Start ngrok Service**
```bash
# Via Docker Compose (recommended)
docker-compose --profile development up -d ngrok

# Or manually
ngrok http 3000
```

### **4. Get Your Public URL**
```bash
# Check ngrok status
curl http://localhost:4040/api/tunnels

# Or visit the web interface
open http://localhost:4040
```

### **5. Update iDenfy Webhooks**
Use your ngrok URL for webhook endpoints:
```
https://your-ngrok-url.ngrok.io/api/v1/kyc/webhook/idenfy
https://your-ngrok-url.ngrok.io/api/v1/aml/webhook/idenfy
https://your-ngrok-url.ngrok.io/api/v1/documents/webhook/idenfy
```

---

## 🗄️ **Database Setup**

### **1. Database Connection**
The backend will automatically connect to the PostgreSQL database running in Docker.

**Connection Details:**
- **Host**: `localhost` (or `db` from within Docker)
- **Port**: `5432`
- **Database**: `mydatabase`
- **Username**: `user`
- **Password**: `password`

### **2. Database Management**
```bash
# Connect to database
docker-compose exec db psql -U user -d mydatabase

# Run Prisma migrations
npm run migration:deploy

# Seed database (if available)
npm run db:seed
```

---

## 📧 **Email Testing with Mailhog**

### **What is Mailhog?**
Mailhog is a development SMTP server that captures all emails sent by your application.

### **Access Mailhog**
- **Web Interface**: http://localhost:8025
- **SMTP Server**: localhost:1025

### **Test Email Sending**
```bash
# Send test email via SMTP
echo "Subject: Test Email" | sendmail -f "test@identhor.com" "dev@example.com"
```

---

## 🔍 **API Testing**

### **1. Swagger Documentation**
- **URL**: http://localhost:3000/api/docs
- **Features**: Interactive API testing, request/response examples

### **2. Health Check**
```bash
# Check API health
curl http://localhost:3000/api/v1/health

# Check individual services
curl http://localhost:3000/api/v1/health/database
curl http://localhost:3000/api/v1/health/redis
```

### **3. Test Endpoints**
```bash
# Test KYC endpoint
curl -X POST http://localhost:3000/api/v1/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

---

## 🚀 **Development Workflow**

### **1. Start Development Environment**
```bash
# Start all services
./scripts/dev-setup.sh start

# Or manually
docker-compose --profile development up -d
```

### **2. View Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ngrok
```

### **3. Stop Services**
```bash
# Stop all services
./scripts/dev-setup.sh stop

# Or manually
docker-compose down
```

### **4. Restart Services**
```bash
# Restart specific service
docker-compose restart backend

# Restart all services
docker-compose down && docker-compose --profile development up -d
```

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Port Already in Use**
```bash
# Check what's using the port
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

#### **2. Database Connection Failed**
```bash
# Check if database is running
docker-compose ps db

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### **3. ngrok Not Working**
```bash
# Check ngrok status
curl http://localhost:4040/api/tunnels

# Check ngrok logs
docker-compose logs ngrok

# Verify auth token
docker-compose exec ngrok ngrok config check
```

#### **4. Webhook Not Received**
```bash
# Check ngrok tunnel status
curl http://localhost:4040/api/tunnels

# Verify webhook URL in iDenfy dashboard
# Ensure ngrok URL is accessible from internet

# Check backend logs for webhook attempts
docker-compose logs -f backend
```

### **Reset Everything**
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
./scripts/dev-setup.sh
```

---

## 📚 **Additional Resources**

### **Documentation**
- [API Documentation](http://localhost:3000/api/docs)
- [Developer Checklist](../developer_checklist.md)
- [iDenfy Integration Guide](../docs/IDENFY_INTEGRATION_GUIDE.md)
- [Project Overview](../docs/PROJECT_OVERVIEW.md)

### **Configuration Files**
- [Docker Compose](../docker-compose.yml)
- [ngrok Configuration](../ngrok.yml)
- [Environment Template](../apps/backend/env.example)

### **Scripts**
- [Development Setup](../scripts/dev-setup.sh)
- [Task Utilities](../task-utils.sh)

---

## 🎉 **You're Ready!**

Your development environment is now set up with:
- ✅ **Backend API** running and accessible
- ✅ **Database** connected and ready
- ✅ **ngrok** exposing your local backend to the internet
- ✅ **Webhook endpoints** ready for iDenfy integration
- ✅ **Email testing** environment configured

**Next Steps:**
1. **Configure iDenfy webhooks** using your ngrok URL
2. **Test the API** using the Swagger documentation
3. **Start developing** your KYC integration features
4. **Monitor webhooks** using ngrok's web interface

Happy coding! 🚀 