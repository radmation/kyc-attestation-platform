#!/bin/bash
# Environment Setup Script
# Automatically sets up the development environment for the KYC platform

set -e

echo "🔧 KYC Attestation Platform - Environment Setup"
echo "==============================================="
echo ""

# Check if running in correct directory
if [[ ! -f "package.json" ]] || [[ ! -d "tasks" ]]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Log file for setup process
SETUP_LOG="logs/environment-setup-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$SETUP_LOG")
exec 2>&1

echo "📝 Setup log: $SETUP_LOG"
echo ""

# Check system requirements
echo "🔍 Checking System Requirements"
echo "-------------------------------"

# Node.js version check
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
    
    # Check if version is >= 18
    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
    if [[ "$NODE_MAJOR" -lt 18 ]]; then
        echo "⚠️  Node.js 18+ recommended, current: $NODE_VERSION"
    fi
else
    echo "❌ Node.js not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# npm version
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not available"
    exit 1
fi

# Git check
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✅ Git: $GIT_VERSION"
else
    echo "❌ Git not installed"
    exit 1
fi

# Docker check (for infrastructure tasks)
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        echo "✅ Docker daemon running"
    else
        echo "⚠️  Docker daemon not running"
        echo "   Please start Docker before working on infrastructure tasks"
    fi
else
    echo "⚠️  Docker not installed"
    echo "   Required for infrastructure tasks"
fi

# Docker Compose check
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose: $COMPOSE_VERSION"
else
    echo "⚠️  Docker Compose not installed"
fi

# Go check (for chaincode development)
if command -v go &> /dev/null; then
    GO_VERSION=$(go version)
    echo "✅ Go: $GO_VERSION"
else
    echo "⚠️  Go not installed"
    echo "   Required for Hyperledger Fabric chaincode development"
    echo "   Install from https://golang.org/dl/"
fi

echo ""

# Install dependencies
echo "📦 Installing Dependencies"
echo "--------------------------"

# Clean install
if [[ -d "node_modules" ]]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules package-lock.json
fi

echo "⬇️  Installing npm dependencies..."
npm ci --silent

echo "✅ Dependencies installed"
echo ""

# Set up Git hooks
echo "🪝 Setting Up Git Hooks"
echo "-----------------------"

# Create git hooks directory if it doesn't exist
mkdir -p .git/hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for KYC platform

echo "🔍 Running pre-commit checks..."

# Check if it's a task branch
BRANCH=$(git branch --show-current)
if [[ "$BRANCH" == task/* ]]; then
    echo "📋 Task branch detected: $BRANCH"
    
    # Find the task file that should be in-progress
    TASK_ID=$(echo "$BRANCH" | sed 's/task\///')
    TASK_FILE=$(find tasks/ -path "*/in-progress/*" -name "*$TASK_ID*" | head -1)
    
    if [[ -n "$TASK_FILE" ]]; then
        echo "📂 Task file: $TASK_FILE"
    else
        echo "⚠️  Task file not found in in-progress"
    fi
fi

# Run linting
echo "🔍 Running ESLint..."
if ! npm run lint; then
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
fi

# Run type checking
echo "🔍 Running TypeScript check..."
if ! npm run type-check; then
    echo "❌ TypeScript errors found. Please fix before committing."
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if ! npm test; then
    echo "❌ Tests failed. Please fix before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit

echo "✅ Git hooks configured"
echo ""

# Create environment file if it doesn't exist
echo "⚙️  Setting Up Environment Configuration"
echo "---------------------------------------"

if [[ ! -f ".env" ]]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    echo "⚠️  Please update .env with your actual configuration values:"
    echo "   - IDENFY_API_KEY"
    echo "   - DATABASE_URL"
    echo "   - JWT_SECRET"
    echo "   - Other service credentials"
else
    echo "✅ .env file already exists"
fi

# Check database configuration
if grep -q "your_database_url_here" .env 2>/dev/null; then
    echo "⚠️  Database URL needs configuration in .env"
else
    echo "✅ Database configuration found"
fi

echo ""

# Set up development scripts
echo "🛠️  Setting Up Development Scripts"
echo "----------------------------------"

# Create task utilities script
cat > task-utils.sh << 'EOF'
#!/bin/bash
# Quick task management utilities

case "$1" in
    "next")
        echo "📋 Next Priority Tasks:"
        find tasks/ -path "*/todo/*" -name "P0-*.md" | head -3 | while read -r file; do
            if [[ -n "$file" ]]; then
                TASK_ID=$(grep "Task ID" "$file" | sed 's/.*: //')
                echo "  - $TASK_ID: $(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')"
            fi
        done
        ;;
    "status")
        ./tasks/automation/git-workflow.sh status
        ;;
    "start")
        if [[ -z "$2" ]]; then
            echo "Usage: $0 start <task-id>"
            echo "Example: $0 start P0-INF-001"
        else
            TASK_FILE=$(find tasks/ -path "*/todo/*" -name "*$2*" | head -1)
            if [[ -n "$TASK_FILE" ]]; then
                ./tasks/automation/git-workflow.sh start "$TASK_FILE"
            else
                echo "❌ Task not found: $2"
            fi
        fi
        ;;
    "validate")
        if [[ -z "$2" ]]; then
            echo "Usage: $0 validate <task-id>"
        else
            TASK_FILE=$(find tasks/ -path "*/in-progress/*" -name "*$2*" | head -1)
            if [[ -n "$TASK_FILE" ]]; then
                ./tasks/automation/task-completion-validator.sh "$TASK_FILE"
            else
                echo "❌ Task not found in progress: $2"
            fi
        fi
        ;;
    *)
        echo "Task Management Utilities"
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  next      - Show next priority tasks"
        echo "  status    - Show current status"
        echo "  start     - Start a task by ID"
        echo "  validate  - Validate task completion"
        ;;
esac
EOF

chmod +x task-utils.sh

echo "✅ Development scripts created"
echo ""

# Set up IDE configuration
echo "💻 Setting Up IDE Configuration"
echo "-------------------------------"

# VS Code settings
if [[ ! -d ".vscode" ]]; then
    mkdir -p .vscode
    
    # Settings
    cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript", "javascript"],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/logs": true
  },
  "editor.rulers": [100],
  "editor.tabSize": 2,
  "files.eol": "\n"
}
EOF

    # Extensions recommendations
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-docker"
  ]
}
EOF

    echo "✅ VS Code configuration created"
else
    echo "✅ VS Code configuration already exists"
fi

echo ""

# Verify setup
echo "🔍 Verifying Setup"
echo "------------------"

# Test build
echo "🔨 Testing build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "⚠️  Build failed - may need configuration"
fi

# Test linting
echo "🔍 Testing linting..."
if npm run lint > /dev/null 2>&1; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting issues found"
fi

# Test type checking
echo "🔍 Testing TypeScript..."
if npm run type-check > /dev/null 2>&1; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️  TypeScript issues found"
fi

echo ""

# Final summary
echo "🎉 Environment Setup Complete!"
echo "=============================="
echo ""
echo "✅ Dependencies installed"
echo "✅ Git hooks configured"
echo "✅ Development scripts created"
echo "✅ IDE configuration set up"
echo ""
echo "📋 Next Steps:"
echo "1. Review and update .env file with your configuration"
echo "2. Start with infrastructure tasks: ./task-utils.sh next"
echo "3. Begin first task: ./task-utils.sh start P0-INF-001"
echo ""
echo "🔧 Quick Commands:"
echo "  ./task-utils.sh next     - Show next priority tasks"
echo "  ./task-utils.sh status   - Show current status"
echo "  ./task-utils.sh start ID - Start a task"
echo ""
echo "📚 Documentation:"
echo "  README: ./tasks/README.md"
echo "  Quick Start: ./tasks/QUICK_START.md"
echo "  Setup Log: $SETUP_LOG" 