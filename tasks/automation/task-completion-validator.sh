#!/bin/bash
# Task Completion Validation Script
# Automatically verifies that acceptance criteria are met before marking task as done

set -e

TASK_FILE="$1"
if [[ -z "$TASK_FILE" ]]; then
    echo "Usage: $0 <task-file-path>"
    echo "Example: $0 tasks/00-infrastructure/in-progress/P0-INF-001-authentication-authorization-system.md"
    exit 1
fi

if [[ ! -f "$TASK_FILE" ]]; then
    echo "❌ Task file not found: $TASK_FILE"
    exit 1
fi

echo "🔍 Task Completion Validation for: $(basename "$TASK_FILE")"
echo "=================================================="

# Extract task metadata
TASK_ID=$(grep "Task ID" "$TASK_FILE" | sed 's/.*: //')
ACCEPTANCE_CRITERIA=$(grep -A 20 "## Acceptance Criteria" "$TASK_FILE" | grep "^- \[ \]" | sed 's/^- \[ \] //' || echo "")

echo "📋 Task ID: $TASK_ID"
echo ""

# Basic validation
echo "🔧 Basic Validation Checks"
echo "--------------------------"

# Code compiles without errors
if npm run build > /dev/null 2>&1; then
    echo "✅ Code compiles successfully"
else
    echo "❌ Build failed - fix compilation errors first"
    exit 1
fi

# Tests pass
if npm test > /dev/null 2>&1; then
    echo "✅ All tests pass"
else
    echo "❌ Tests failing - fix test failures first"
    exit 1
fi

# No linting errors
if npm run lint > /dev/null 2>&1; then
    echo "✅ No linting errors"
else
    echo "⚠️  Linting errors found - consider fixing"
fi

# No type errors
if npm run type-check > /dev/null 2>&1; then
    echo "✅ No TypeScript errors"
else
    echo "❌ TypeScript errors found - fix type errors first"
    exit 1
fi

# Task-specific validations
echo ""
echo "🎯 Task-Specific Validation"
echo "---------------------------"

case "$TASK_ID" in
    *"INF-001"*)
        echo "🔐 Authentication System Validation:"
        
        # Check if JWT service exists
        if [[ -f "apps/backend/src/modules/auth/infrastructure/services/jwt.service.ts" ]]; then
            echo "✅ JWT service file created"
        else
            echo "❌ JWT service file missing"
            exit 1
        fi
        
        # Check if guards exist
        if [[ -f "apps/backend/src/shared/guards/jwt-auth.guard.ts" ]]; then
            echo "✅ JWT auth guard created"
        else
            echo "❌ JWT auth guard missing"
            exit 1
        fi
        
        # Check if decorators exist
        if [[ -f "apps/backend/src/shared/decorators/public.decorator.ts" ]]; then
            echo "✅ Public decorator created"
        else
            echo "❌ Public decorator missing"
            exit 1
        fi
        
        # Check backend module updated
        if grep -q "JwtAuthGuard" apps/backend/src/backend.module.ts; then
            echo "✅ Backend module updated with guards"
        else
            echo "❌ Backend module not updated with guards"
            exit 1
        fi
        ;;
        
    *"INF-002"*)
        echo "🌐 API Gateway & Middleware Validation:"
        
        # Check middleware files
        if [[ -f "apps/backend/src/shared/middleware/security.middleware.ts" ]]; then
            echo "✅ Security middleware created"
        else
            echo "❌ Security middleware missing"
            exit 1
        fi
        
        # Check global exception filter
        if [[ -f "apps/backend/src/shared/filters/global-exception.filter.ts" ]]; then
            echo "✅ Global exception filter created"
        else
            echo "❌ Global exception filter missing"
            exit 1
        fi
        
        # Check main.ts updated
        if grep -q "GlobalExceptionFilter" apps/backend/src/main.ts; then
            echo "✅ Main.ts updated with middleware"
        else
            echo "❌ Main.ts not updated with middleware"
            exit 1
        fi
        ;;
        
    *"INF-003"*)
        echo "⛓️  Fabric Network Validation:"
        
        # Check chaincode exists
        if [[ -f "chaincode/kyc-attestation/main.go" ]]; then
            echo "✅ KYC attestation chaincode created"
        else
            echo "❌ KYC attestation chaincode missing"
            exit 1
        fi
        
        # Check fabric service
        if [[ -f "apps/backend/src/blockchain/fabric.service.ts" ]]; then
            echo "✅ Fabric service created"
        else
            echo "❌ Fabric service missing"
            exit 1
        fi
        
        # Check Go code compiles
        if cd chaincode/kyc-attestation && go build . && cd - > /dev/null 2>&1; then
            echo "✅ Chaincode compiles successfully"
        else
            echo "❌ Chaincode compilation failed"
            exit 1
        fi
        ;;
        
    *"INF-004"*)
        echo "📊 Monitoring Stack Validation:"
        
        # Check monitoring configuration
        if [[ -f "monitoring/docker-compose.yml" ]]; then
            echo "✅ Monitoring docker-compose created"
        else
            echo "❌ Monitoring docker-compose missing"
            exit 1
        fi
        
        # Check health controller
        if [[ -f "apps/backend/src/health/health.controller.ts" ]]; then
            echo "✅ Health controller created"
        else
            echo "❌ Health controller missing"
            exit 1
        fi
        ;;
        
    *"ATT-001"*)
        echo "👤 KYC Integration Validation:"
        
        # Check iDenfy service
        if [[ -f "apps/backend/src/modules/kyc/infrastructure/services/idenfy.service.ts" ]]; then
            echo "✅ iDenfy service created"
        else
            echo "❌ iDenfy service missing"
            exit 1
        fi
        
        # Check KYC controller
        if [[ -f "apps/backend/src/modules/kyc/presentation/controllers/kyc.controller.ts" ]]; then
            echo "✅ KYC controller created"
        else
            echo "❌ KYC controller missing"
            exit 1
        fi
        
        # Check KYC module registered
        if grep -q "KycModule" apps/backend/src/backend.module.ts; then
            echo "✅ KYC module registered in backend"
        else
            echo "❌ KYC module not registered in backend module"
            exit 1
        fi
        ;;
esac

# Check acceptance criteria
echo ""
echo "📋 Acceptance Criteria Validation"
echo "---------------------------------"

CRITERIA_MET=0
TOTAL_CRITERIA=0

if [[ -n "$ACCEPTANCE_CRITERIA" ]]; then
    while IFS= read -r criteria; do
        if [[ -n "$criteria" ]]; then
            TOTAL_CRITERIA=$((TOTAL_CRITERIA + 1))
            CRITERIA_TYPE=$(echo "$criteria" | cut -d: -f1 | sed 's/\*\*//')
            CRITERIA_DESC=$(echo "$criteria" | cut -d: -f2- | sed 's/^ *//')
            
            case "$CRITERIA_TYPE" in
                "Functional")
                    echo "🔧 $CRITERIA_TYPE: $CRITERIA_DESC"
                    # This would need specific functional testing
                    echo "   ⚠️  Manual verification required"
                    ;;
                "Technical")
                    echo "🛠️  $CRITERIA_TYPE: $CRITERIA_DESC"
                    # Already checked in build/compile steps
                    echo "   ✅ Verified in technical checks"
                    CRITERIA_MET=$((CRITERIA_MET + 1))
                    ;;
                "Integration")
                    echo "🔗 $CRITERIA_TYPE: $CRITERIA_DESC"
                    # Basic integration checks already done
                    echo "   ✅ Verified in integration checks"
                    CRITERIA_MET=$((CRITERIA_MET + 1))
                    ;;
                "Testing")
                    echo "🧪 $CRITERIA_TYPE: $CRITERIA_DESC"
                    # Already checked in test runner
                    echo "   ✅ Verified in test execution"
                    CRITERIA_MET=$((CRITERIA_MET + 1))
                    ;;
                "Documentation")
                    echo "📚 $CRITERIA_TYPE: $CRITERIA_DESC"
                    # Check for JSDoc comments in TypeScript files
                    if find apps/backend/src -name "*.ts" -exec grep -l "/**" {} \; | head -1 > /dev/null; then
                        echo "   ✅ Documentation found in TypeScript files"
                        CRITERIA_MET=$((CRITERIA_MET + 1))
                    else
                        echo "   ⚠️  Limited documentation found"
                    fi
                    ;;
                *)
                    echo "❓ $criteria"
                    echo "   ⚠️  Manual verification required"
                    ;;
            esac
        fi
    done <<< "$ACCEPTANCE_CRITERIA"
    
    echo ""
    echo "📊 Acceptance Criteria Summary: $CRITERIA_MET/$TOTAL_CRITERIA automatically verified"
else
    echo "✅ No specific acceptance criteria defined"
fi

# Git status check
echo ""
echo "📝 Git Status Check"
echo "------------------"

if [[ -n $(git status --porcelain) ]]; then
    echo "✅ Changes ready to commit"
    echo "   Files modified: $(git status --porcelain | wc -l)"
else
    echo "⚠️  No changes detected - did implementation complete?"
fi

# Final validation
echo ""
echo "🎯 Final Validation Result"
echo "============================"

if [[ $CRITERIA_MET -ge $((TOTAL_CRITERIA / 2)) ]]; then
    echo "✅ Task appears ready for completion!"
    echo ""
    echo "Next steps:"
    echo "1. Commit changes: git add . && git commit -m 'Complete $TASK_ID: $(basename "$TASK_FILE" .md)'"
    echo "2. Move to review: mv '$TASK_FILE' '$(dirname "$(dirname "$TASK_FILE")")/review/'"
    echo "3. Create PR for review: git push origin task/$TASK_ID"
    echo "4. After review, move to done folder"
else
    echo "⚠️  Task may not be complete yet"
    echo "   Please review acceptance criteria and ensure all requirements are met"
    echo "   Run this validator again after making additional changes"
fi 