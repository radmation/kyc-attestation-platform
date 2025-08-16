#!/bin/bash
# Pre-Task Validation Script
# Run this before starting any task to ensure dependencies are met

set -e

TASK_FILE="$1"
if [[ -z "$TASK_FILE" ]]; then
    echo "Usage: $0 <task-file-path>"
    echo "Example: $0 tasks/00-infrastructure/todo/P0-INF-001-authentication-authorization-system.md"
    exit 1
fi

if [[ ! -f "$TASK_FILE" ]]; then
    echo "❌ Task file not found: $TASK_FILE"
    exit 1
fi

echo "🔍 Pre-Task Validation for: $(basename "$TASK_FILE")"
echo "=============================================="

# Extract task metadata
TASK_ID=$(grep "Task ID" "$TASK_FILE" | sed 's/.*: //')
DEPENDENCIES=$(grep -A 10 "## Dependencies" "$TASK_FILE" | grep "- \[ \]" | sed 's/- \[ \] //')

echo "📋 Task ID: $TASK_ID"
echo "📋 Dependencies: $DEPENDENCIES"

# Check basic environment
echo ""
echo "🔧 Environment Checks"
echo "----------------------"

# Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
    exit 1
fi

# npm/package.json
if [[ -f "package.json" ]]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json not found"
    exit 1
fi

# Git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git repository initialized"
else
    echo "❌ Not a git repository"
    exit 1
fi

# Clean working directory
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  Working directory has uncommitted changes"
    echo "   Consider committing before starting task"
else
    echo "✅ Clean git working directory"
fi

# Database connection (if backend task)
if [[ "$TASK_ID" == *"INF"* ]] || [[ "$TASK_ID" == *"ATT"* ]]; then
    if [[ -f ".env" ]] && grep -q "DATABASE_URL" .env; then
        echo "✅ Database configuration found"
    else
        echo "⚠️  Database configuration not found in .env"
    fi
fi

# Docker (if infrastructure task)
if [[ "$TASK_ID" == *"INF"* ]]; then
    if command -v docker &> /dev/null; then
        echo "✅ Docker available"
    else
        echo "❌ Docker not installed (required for infrastructure tasks)"
        exit 1
    fi
    
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose available"
    else
        echo "❌ Docker Compose not installed"
        exit 1
    fi
fi

# Check task dependencies
echo ""
echo "🔗 Dependency Checks"
echo "--------------------"

if [[ -n "$DEPENDENCIES" ]]; then
    while IFS= read -r dep; do
        if [[ -n "$dep" ]]; then
            DEP_ID=$(echo "$dep" | cut -d: -f1)
            DEP_DESC=$(echo "$dep" | cut -d: -f2- | sed 's/^ *//')
            
            # Check if dependency task is in done folder
            DEP_DONE=$(find tasks/ -path "*/done/*" -name "*$DEP_ID*" | head -1)
            
            if [[ -n "$DEP_DONE" ]]; then
                echo "✅ $DEP_ID: $DEP_DESC (completed)"
            else
                echo "❌ $DEP_ID: $DEP_DESC (not completed)"
                echo "   Task file should be in done/ folder before proceeding"
                exit 1
            fi
        fi
    done <<< "$DEPENDENCIES"
else
    echo "✅ No dependencies required"
fi

# Specific validations based on task type
echo ""
echo "🎯 Task-Specific Checks"
echo "-----------------------"

case "$TASK_ID" in
    *"INF-001"*)
        echo "🔐 Authentication Task Checks:"
        # Check if JWT dependencies can be installed
        if npm list @nestjs/jwt &> /dev/null || npm list --depth=0 | grep -q @nestjs/jwt; then
            echo "✅ JWT dependencies available"
        else
            echo "ℹ️  Will need to install JWT dependencies"
        fi
        ;;
    *"INF-002"*)
        echo "🌐 API Gateway Task Checks:"
        if npm list helmet &> /dev/null || npm list --depth=0 | grep -q helmet; then
            echo "✅ Security middleware dependencies available"
        else
            echo "ℹ️  Will need to install security middleware dependencies"
        fi
        ;;
    *"INF-003"*)
        echo "⛓️  Fabric Task Checks:"
        if [[ -d "fabric-network" ]]; then
            echo "✅ Fabric network directory exists"
        else
            echo "ℹ️  Will create fabric-network directory"
        fi
        
        if command -v go &> /dev/null; then
            echo "✅ Go compiler available for chaincode"
        else
            echo "❌ Go not installed (required for chaincode development)"
            exit 1
        fi
        ;;
    *"ATT-001"*)
        echo "👤 KYC Integration Task Checks:"
        if [[ -d "apps/backend/src/modules/kyc" ]]; then
            echo "✅ KYC module directory exists"
        else
            echo "ℹ️  Will create KYC module structure"
        fi
        ;;
esac

# Final validation
echo ""
echo "✅ Pre-task validation completed successfully!"
echo "🚀 Ready to start task: $TASK_ID"
echo ""
echo "Next steps:"
echo "1. Move task to in-progress: mv '$TASK_FILE' '$(dirname "$(dirname "$TASK_FILE")")/in-progress/'"
echo "2. Create feature branch: git checkout -b 'task/$TASK_ID'"
echo "3. Begin implementation following task instructions" 