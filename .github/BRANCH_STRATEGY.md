# Git Branch Strategy & Workflow

## Branch Structure

### **Main Branches**
- **`main`** - Production-ready code, protected branch, releases only
- **`develop`** - Integration branch for features, staging deployments

### **Supporting Branches**
- **`task/P0-INF-XXX`** - Feature branches for individual tasks
- **`hotfix/fix-description`** - Critical production fixes
- **`release/v1.x.x`** - Release preparation branches

## Workflow Rules

### **Development Flow**
```bash
# 1. Start new task from develop
git checkout develop
git pull origin develop
git checkout -b task/P0-INF-XXX

# 2. Work on task following automation
./task-utils.sh start P0-INF-XXX

# 3. Commit progress regularly
./tasks/automation/git-workflow.sh commit [task-file]

# 4. Complete task (creates PR to develop)
./tasks/automation/git-workflow.sh complete [task-file]

# 5. After PR approval, merge to develop
git checkout develop
git merge task/P0-INF-XXX --no-ff
git push origin develop

# 6. Clean up feature branch
git branch -d task/P0-INF-XXX
git push origin --delete task/P0-INF-XXX
```

### **Release Flow**
```bash
# 1. Create release branch from develop
git checkout develop
git checkout -b release/v1.0.0

# 2. Final testing and bug fixes
# 3. Merge to main and tag
git checkout main
git merge release/v1.0.0 --no-ff
git tag v1.0.0
git push origin main --tags

# 4. Merge back to develop
git checkout develop
git merge release/v1.0.0 --no-ff
git push origin develop

# 5. Clean up release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

### **Hotfix Flow**
```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Fix and test
# 3. Merge to main and develop
git checkout main
git merge hotfix/critical-fix --no-ff
git tag v1.0.1
git checkout develop
git merge hotfix/critical-fix --no-ff
git push origin main develop --tags
```

## Branch Protection Rules

### **Main Branch Protection**
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks to pass
- ✅ Require up-to-date branches
- ✅ Include administrators
- ✅ Restrict pushes to matching branches

### **Develop Branch Protection**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks to pass
- ✅ Require up-to-date branches
- ✅ Allow bypass for task automation

## Commit Message Standards

### **Format**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding missing tests
- `chore`: Maintenance

### **Examples**
```bash
feat(auth): add JWT refresh token rotation
fix(kyc): handle Persona webhook timeout errors
docs(api): update authentication endpoint documentation
```

## Task Integration

### **Automated Task Workflow**
The task automation system automatically:
- ✅ Creates feature branches (`task/P0-INF-XXX`)
- ✅ Makes initial commits with standard messages
- ✅ Creates pull requests to develop
- ✅ Updates task status in filesystem

### **Manual Review Points**
- **Code Review**: All PRs require review before merge
- **Task Validation**: Use `./task-utils.sh validate P0-INF-XXX`
- **Integration Testing**: CI/CD runs full test suite
- **Acceptance Criteria**: Verify all criteria met before completion

## CI/CD Integration

### **Branch Triggers**
- **`task/*`**: Run tests, linting, security scan
- **`develop`**: Full test suite + staging deployment
- **`main`**: Production deployment with blue-green strategy

### **Status Checks Required**
- ✅ Unit tests pass
- ✅ Integration tests pass
- ✅ Linting and type checking
- ✅ Security vulnerability scan
- ✅ Task validation (acceptance criteria)

## Emergency Procedures

### **Broken Build on Develop**
```bash
# 1. Identify problematic commit
git log --oneline develop

# 2. Revert if needed
git revert <commit-hash>
git push origin develop

# 3. Notify team and fix forward
```

### **Critical Production Issue**
```bash
# 1. Create hotfix branch immediately
git checkout main
git checkout -b hotfix/emergency-fix

# 2. Implement minimal fix
# 3. Fast-track through testing
# 4. Deploy to production
# 5. Merge back to develop
```

## Quality Gates

### **Before Merge to Develop**
- [ ] All acceptance criteria met
- [ ] Code review approved
- [ ] Tests pass (unit + integration)
- [ ] No security vulnerabilities
- [ ] Documentation updated

### **Before Release to Main**
- [ ] Full regression testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Deployment runbook ready
- [ ] Rollback plan prepared

---

**This strategy ensures code quality, traceability, and reliable releases for the KYC attestation platform.** 