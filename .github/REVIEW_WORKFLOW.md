# Manual Review Workflow

## Overview
This document defines the manual review process for the KYC Attestation Platform development. While much of the workflow is automated, human review ensures quality, security, and compliance requirements are met.

## Review Stages

### **Stage 1: Automated Pre-Review**
**Trigger**: When task moves to `review/` folder
**Automated Checks**:
- ✅ Code compiles without errors
- ✅ All tests pass (unit + integration)
- ✅ Linting and type checking pass
- ✅ Security scan (no high/critical vulnerabilities)
- ✅ Task acceptance criteria validation

**Tools**:
```bash
# Validate task completion automatically
./task-utils.sh validate P0-INF-XXX

# Run comprehensive validation
./tasks/automation/task-completion-validator.sh [task-file]
```

### **Stage 2: Manual Code Review**
**Required for**: All P0 and P1 tasks
**Reviewers**: Senior developer or technical lead
**Focus Areas**:

#### **Code Quality**
- [ ] Code follows project conventions and patterns
- [ ] Proper error handling and logging
- [ ] Security best practices implemented
- [ ] Performance considerations addressed
- [ ] Documentation is complete and accurate

#### **Architecture Compliance**
- [ ] Follows NestJS module structure
- [ ] Database schema follows conventions
- [ ] API endpoints follow RESTful patterns
- [ ] Blockchain integration follows security patterns
- [ ] Compliance requirements addressed

#### **Business Logic**
- [ ] KYC verification flow is secure
- [ ] Attestation logic is correct
- [ ] User permissions properly enforced
- [ ] Multi-tenant isolation maintained

### **Stage 3: Security Review**
**Required for**: All P0 tasks and security-related features
**Reviewers**: Security-focused team member
**Checklist**:

#### **Authentication & Authorization**
- [ ] JWT tokens properly secured
- [ ] Refresh token rotation implemented
- [ ] Role-based access control enforced
- [ ] Session management secure

#### **Data Protection**
- [ ] PII data properly handled
- [ ] Encryption at rest and in transit
- [ ] Input validation and sanitization
- [ ] No sensitive data in logs

#### **Blockchain Security**
- [ ] Private keys never exposed
- [ ] Smart contract interactions secure
- [ ] Transaction validation proper
- [ ] Attestation data integrity

#### **API Security**
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Input validation on all endpoints

### **Stage 4: Compliance Review**
**Required for**: All tasks affecting KYC/compliance
**Reviewers**: Compliance or legal team member
**Focus Areas**:

#### **Regulatory Compliance**
- [ ] GENIUS Act requirements met
- [ ] GDPR privacy compliance
- [ ] AML/KYC regulations followed
- [ ] Audit trail completeness

#### **Data Handling**
- [ ] Data retention policies followed
- [ ] User consent mechanisms proper
- [ ] Data portability supported
- [ ] Right to deletion implemented

## Review Process

### **1. Task Completion Trigger**
```bash
# Developer completes task
./tasks/automation/git-workflow.sh complete [task-file]

# Automated validation runs
# Task moves to review/ folder
# PR created to develop branch
```

### **2. Review Assignment**
**Automatic Assignment Rules**:
- P0 tasks → Senior developer + Security reviewer
- P1 tasks → Senior developer
- P2/P3 tasks → Any available reviewer
- Security features → Security reviewer required
- Compliance features → Compliance reviewer required

### **3. Review Execution**
**Reviewer Workflow**:
```bash
# 1. Check out the task branch
git checkout task/P0-INF-XXX

# 2. Run local validation
./task-utils.sh validate P0-INF-XXX

# 3. Review code changes
git diff develop...task/P0-INF-XXX

# 4. Test functionality manually
npm run dev
# Test relevant features

# 5. Complete review checklist
# Use .github/REVIEW_CHECKLIST.md

# 6. Approve or request changes
# Update PR with review comments
```

### **4. Review Outcomes**

#### **Approved ✅**
- [ ] All automated checks pass
- [ ] Manual review checklist complete
- [ ] Security concerns addressed
- [ ] Compliance requirements met
- **Action**: Merge to develop branch

#### **Approved with Minor Changes 🔧**
- [ ] Minor issues identified
- [ ] Changes don't affect core functionality
- [ ] Security/compliance not impacted
- **Action**: Create follow-up task, merge to develop

#### **Changes Requested ❌**
- [ ] Code quality issues found
- [ ] Security vulnerabilities identified
- [ ] Compliance gaps discovered
- [ ] Functionality incomplete
- **Action**: Return to developer, move task back to in-progress

#### **Rejected 🚫**
- [ ] Fundamental design flaws
- [ ] Security risks too high
- [ ] Does not meet requirements
- **Action**: Close task, create new approach task

## Review Tools & Templates

### **Review Checklist Template**
**File**: `.github/REVIEW_CHECKLIST.md`
```markdown
# Review Checklist - P0-INF-XXX

## Automated Validation
- [ ] All tests pass
- [ ] Linting/type checking pass
- [ ] Security scan clear
- [ ] Task acceptance criteria met

## Code Quality Review
- [ ] Follows project patterns
- [ ] Error handling proper
- [ ] Documentation complete
- [ ] Performance acceptable

## Security Review (if applicable)
- [ ] Authentication secure
- [ ] Input validation proper
- [ ] No sensitive data exposure
- [ ] Blockchain interactions secure

## Compliance Review (if applicable)
- [ ] Regulatory requirements met
- [ ] Data handling compliant
- [ ] Audit trail complete
- [ ] Privacy controls proper

## Final Approval
- [ ] Ready for merge to develop
- [ ] Any follow-up tasks created
- [ ] Documentation updated

**Reviewer**: [Name]
**Date**: [Date]
**Decision**: [Approved/Changes Requested/Rejected]
```

### **Security Review Tools**
```bash
# Run security scan
npm audit --audit-level=moderate

# Check for secrets in code
git secrets --scan

# Validate Dockerfile security
docker run --rm -v $(pwd):/src aquasec/trivy fs .

# Test authentication endpoints
npm run test:security
```

### **Performance Review Tools**
```bash
# Run performance tests
npm run test:performance

# Check bundle size
npm run build:analyze

# Database query analysis
npm run db:analyze
```

## Review Metrics & SLAs

### **Response Time SLAs**
- **P0 tasks**: 24 hours
- **P1 tasks**: 48 hours
- **P2/P3 tasks**: 72 hours
- **Security reviews**: 48 hours
- **Compliance reviews**: 72 hours

### **Quality Metrics**
- **Review coverage**: 100% for P0/P1 tasks
- **Defect escape rate**: <2% to production
- **Review turnaround**: 80% within SLA
- **Security findings**: <1 high/critical per month

### **Review Quality Indicators**
- Changes requested rate: 15-25% (healthy)
- Review comments per task: 3-8 (engaged)
- Post-merge issues: <5% (effective)
- Review participation: All team members

## Escalation Process

### **Review Conflicts**
1. **Developer disagrees with review** → Team lead arbitration
2. **Security vs. feature trade-offs** → Security team + Product owner
3. **Compliance interpretation** → Legal team consultation
4. **Technical architecture disputes** → Architecture review board

### **SLA Breaches**
1. **First reminder**: 50% of SLA elapsed
2. **Manager notification**: 100% of SLA elapsed
3. **Auto-escalation**: 125% of SLA elapsed
4. **Emergency review**: P0 tasks only, 4-hour response

---

**This review workflow ensures high code quality, security, and compliance while maintaining development velocity.** 