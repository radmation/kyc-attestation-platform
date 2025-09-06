# KYC Attestation Platform - Development Setup Guide

## Prerequisites

- **Node.js**: Version 18+ (LTS recommended)
- **npm**: Version 9+ or **yarn**: Version 1.22+
- **Docker**: Version 20+ with Docker Compose
- **PostgreSQL**: Version 14+ (or use Docker)
- **Git**: Latest version

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kyc-attestation-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=4000
NODE_ENV=development

# Email Configuration (for future use)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Blockchain Provider Configuration
PRIMARY_BLOCKCHAIN_PROVIDER="HYPERLEDGER_FABRIC"
PRIMARY_BLOCKCHAIN_NETWORK="kycchannel"
BLOCKCHAIN_CONNECTION_TIMEOUT=30000
BLOCKCHAIN_REQUEST_TIMEOUT=10000
BLOCKCHAIN_MAX_RETRIES=3

# Hyperledger Fabric Configuration
FABRIC_CONNECTION_PROFILE_PATH="./fabric-network/connection-profile.json"
FABRIC_WALLET_PATH="./wallet"
FABRIC_IDENTITY_NAME="appUser"
FABRIC_CHANNEL_NAME="kycchannel"
FABRIC_CHAINCODE_NAME="kycattestation"
FABRIC_MSP_ID="Org1MSP"
FABRIC_ENABLE_DISCOVERY="true"
FABRIC_AS_LOCALHOST="true"

# Ethereum Configuration (Future Implementation)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
ETHEREUM_PRIVATE_KEY=your-private-key
```

### 4. Database Setup

#### Option A: Using Docker (Recommended for Development)

```bash
# Start PostgreSQL container
docker run --name kyc-postgres \
  -e POSTGRES_DB=mydatabase \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:14

# Or use docker-compose if available
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE mydatabase;
CREATE USER username WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO username;
\q
```

### 5. Database Migration

```bash
# Navigate to backend directory
cd apps/backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database (optional)
npm run db:seed
```

## Development Workflow

### Starting the Development Server

```bash
# From the root directory
port=4000 npm run start:dev

# Or from the backend directory
cd apps/backend
port=4000 npm run start:dev
```

The server will start on `http://localhost:4000` with hot reload enabled.

### API Documentation

Once the server is running, access the interactive API documentation at:
- **Swagger UI**: `http://localhost:4000/api/docs`
- **OpenAPI JSON**: `http://localhost:4000/api-json`

### Database Management

```bash
# View database in browser
npx prisma studio

# Reset database (⚠️ Destructive)
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name description_of_changes

# Deploy migrations to production
npx prisma migrate deploy

# Push schema changes without migration
npx prisma db push
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run specific test file
npm test -- --testPathPattern=email-verification
```

## Project Structure

```
apps/backend/
├── src/
│   ├── email-verification/          # Email verification module
│   │   ├── dto/                     # Data transfer objects
│   │   ├── email-verification.controller.ts
│   │   ├── email-verification.service.ts
│   │   ├── email-verification.module.ts
│   │   └── email.service.ts
│   ├── prisma/                      # Database layer
│   │   ├── prisma.service.ts
│   │   └── seed.ts
│   ├── backend.module.ts            # Main application module
│   ├── backend.controller.ts        # Health check endpoint
│   └── main.ts                      # Application entry point
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding
├── test/                           # Test configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json                    # Dependencies and scripts
```

## Code Quality Tools

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Run Prettier
npm run format
```

### Type Checking

```bash
# Check TypeScript compilation
npm run build

# Type check without building
npx tsc --noEmit
```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@nestjs/cli/bin/nest.js",
      "args": ["start", "--debug", "--watch"],
      "env": {
        "port": "4000"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### Logging

The application uses NestJS built-in logging. To enable debug logging:

```bash
DEBUG=* port=4000 npm run start:dev
```

## Common Issues and Solutions

### Port Already in Use

```bash
# Find process using port 4000
lsof -ti:4000

# Kill the process
kill -9 $(lsof -ti:4000)
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U username -d mydatabase
```

### Prisma Issues

```bash
# Reset Prisma
npx prisma generate
npx prisma migrate reset --force

# Check database connection
npx prisma db pull
```

### TypeScript Compilation Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Environment-Specific Configurations

### Development

- Hot reload enabled
- Detailed error messages
- Database logging enabled
- CORS enabled for local development

### Production

- Hot reload disabled
- Minimal error messages
- Database logging disabled
- CORS restricted to specific domains

## Contributing

### Code Style

- Follow NestJS conventions
- Use TypeScript strict mode
- Implement proper error handling
- Add comprehensive tests
- Document all public APIs

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/email-verification

# Make changes and commit
git add .
git commit -m "feat: implement email verification service"

# Push and create pull request
git push origin feature/email-verification
```

### Testing Requirements

- Unit tests for all services
- Integration tests for controllers
- E2E tests for critical flows
- Minimum 80% code coverage

## Performance Considerations

### Development

- Use `npm run start:dev` for development
- Enable source maps for debugging
- Use watch mode for automatic reloading

### Production

- Use `npm run build` to compile
- Use `npm run start:prod` to run
- Enable compression and caching
- Use PM2 or similar for process management

## Security Best Practices

### Development

- Never commit `.env` files
- Use strong JWT secrets
- Validate all input data
- Implement rate limiting

### Production

- Use environment variables for secrets
- Enable HTTPS
- Implement proper CORS policies
- Regular security audits

## Monitoring and Logging

### Application Logs

```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

### Database Monitoring

```bash
# Check database performance
npx prisma studio

# Monitor slow queries
# (Configure in PostgreSQL)
```

## Troubleshooting

### Common Error Messages

1. **"Cannot find module"**: Run `npm install`
2. **"Port already in use"**: Kill existing process or change port
3. **"Database connection failed"**: Check PostgreSQL status and credentials
4. **"Prisma schema validation failed"**: Check schema.prisma syntax

### Getting Help

1. Check the logs for detailed error messages
2. Review the API documentation at `/api/docs`
3. Check the Prisma documentation
4. Review NestJS documentation and examples
5. Create an issue with detailed error information 