# Development Commands Guide for AI Agents

## 🚨 CRITICAL: Monorepo Structure Understanding

This is a **monorepo** with separate backend (NestJS) and frontend (React) applications. **NEVER** run both simultaneously from the same terminal or mix their commands.

## 📁 Project Structure
```
kyc-attestation-platform/
├── apps/
│   ├── backend/          # NestJS TypeScript backend
│   └── frontend/         # React TypeScript frontend
├── package.json          # Root package.json with monorepo scripts
├── tsconfig.json         # Root TypeScript config (excludes frontend)
└── nest-cli.json         # NestJS monorepo configuration
```

## 🔧 Backend Development Commands

### Starting the Backend Server

**✅ CORRECT WAYS:**

```bash
# From project root (RECOMMENDED)
npm run start:dev

# Alternative: Build and start
npm run build
npm run start

# Production mode
npm run start:prod
```

**❌ WRONG WAYS:**
```bash
# DON'T: Run from apps/backend directory
cd apps/backend && npm start    # Will fail - no package.json there

# DON'T: Try to start both backend and frontend together
npm run start:dev && cd apps/frontend && npm run dev    # Will conflict
```

### Backend Development Workflow

```bash
# 1. Start from project root
cd /path/to/kyc-attestation-platform

# 2. Install dependencies (if needed)
npm install

# 3. Database operations (from project root)
cd apps/backend
npx prisma migrate dev --name your-migration-name
npx prisma generate
npx prisma db seed    # If seed exists

# 4. Start backend server (return to root)
cd ../..
npm run start:dev

# 5. Backend will be available at http://localhost:3000
```

### Backend Build Commands

```bash
# Build backend only
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test
npm run test:watch
npm run test:cov
```

## 🎨 Frontend Development Commands

### Starting the Frontend

**✅ CORRECT WAYS:**

```bash
# From frontend directory
cd apps/frontend
npm run dev

# Alternative: From root using workspace (if configured)
npm run build:frontend
```

**❌ WRONG WAYS:**
```bash
# DON'T: Try to start frontend from root without proper script
npm run start    # This starts backend, not frontend

# DON'T: Mix backend and frontend commands
npm run start:dev && cd apps/frontend && npm run dev    # Will cause conflicts
```

### Frontend Development Workflow

```bash
# 1. Navigate to frontend directory
cd /path/to/kyc-attestation-platform/apps/frontend

# 2. Install frontend dependencies (if needed)
npm install

# 3. Start frontend development server
npm run dev

# 4. Frontend will be available at http://localhost:5173 (or similar)
```

## 🔄 Full Stack Development

### Running Both Backend and Frontend

**Use separate terminals:**

```bash
# Terminal 1 - Backend
cd /path/to/kyc-attestation-platform
npm run start:dev

# Terminal 2 - Frontend  
cd /path/to/kyc-attestation-platform/apps/frontend
npm run dev
```

### Environment Setup

```bash
# 1. Root dependencies
npm install

# 2. Backend setup
cd apps/backend
# Check .env file exists with DATABASE_URL
npx prisma generate
npx prisma migrate dev

# 3. Frontend setup
cd ../frontend
npm install

# 4. Return to root for backend development
cd ../..
```

## 🐛 Troubleshooting Common Issues

### "Cannot use JSX unless the '--jsx' flag is provided"

**Problem:** Running `npm run start:dev` tries to compile frontend React files
**Solution:** 
- Ensure you're running from project root
- Check `tsconfig.json` excludes `apps/frontend`
- Kill all node processes: `pkill -f node` then restart

### "Cannot GET /api/v1/..." (404 errors)

**Problem:** Backend server running but routes not found
**Causes:**
1. Module not properly imported in `backend.module.ts`
2. Controller not registered in module
3. Server compilation errors preventing route registration

**Solutions:**
```bash
# Check server is actually running
curl http://localhost:3000/

# Check for compilation errors
npm run build

# Restart server cleanly
pkill -f node
npm run start:dev
```

### Database Connection Issues

```bash
# Check database is running
cd apps/backend
npx prisma db pull    # Test connection

# Regenerate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate dev
```

## 📊 Port Usage

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Frontend Dev | 5173 | http://localhost:5173 |
| Database | 5432 | localhost:5432 |

## 🔍 Health Checks

### Backend Health Check
```bash
# Basic server response
curl http://localhost:3000/

# API endpoints (example)
curl http://localhost:3000/api/v1/branding/client/test-client

# Swagger docs (if available)
curl http://localhost:3000/api/docs
```

### Frontend Health Check
```bash
# Check if frontend dev server is running
curl http://localhost:5173/
```

## 📝 Key Files for AI Agents

### Backend Configuration
- `package.json` - Root scripts and dependencies
- `nest-cli.json` - NestJS monorepo configuration
- `tsconfig.json` - Root TypeScript config
- `apps/backend/tsconfig.app.json` - Backend-specific TypeScript config
- `apps/backend/.env` - Environment variables
- `apps/backend/prisma/schema.prisma` - Database schema

### Frontend Configuration
- `apps/frontend/package.json` - Frontend dependencies and scripts
- `apps/frontend/tsconfig.json` - Frontend TypeScript config
- `apps/frontend/vite.config.ts` - Vite configuration

## ⚡ Quick Reference Commands

```bash
# Start backend development server
npm run start:dev

# Start frontend development server
cd apps/frontend && npm run dev

# Build everything
npm run build:all

# Database migration
cd apps/backend && npx prisma migrate dev --name migration-name

# Kill all processes and restart
pkill -f node && npm run start:dev
```

## 🚨 Important Notes for AI Agents

1. **Always start from project root** for backend operations
2. **Use separate terminals** for backend and frontend
3. **Check tsconfig.json excludes** frontend from backend compilation
4. **Verify .env file exists** in apps/backend before running
5. **Use `pkill -f node`** to clean up processes before restarting
6. **Backend runs on port 3000**, frontend typically on 5173
7. **Database operations require** being in `apps/backend` directory
8. **Never mix backend and frontend npm scripts** in the same terminal session 