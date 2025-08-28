# 🤖 **AI Agent Task Automation Guide**
*Complete Workflow and Automation Overview for KYC Attestation Platform*

## 📋 **Overview**
This comprehensive guide explains how AI agents should use the task management automation scripts for the KYC Attestation Platform. The system provides standardized workflows for starting, working on, and completing tasks with enterprise-grade automation.

---

## 🛠️ **Task Management Scripts**

### **Main Entry Point: `./task-utils.sh`**
This is the primary script agents should use for task management.

### **Available Commands:**
```bash
./task-utils.sh <action> [task-id]

Actions:
  next                 - Show next priority tasks to work on
  status              - Show current task and git status  
  start <task-id>     - Start working on a task (e.g., P0-INF-001)
  validate <task-id>  - Validate task completion
  commit <task-id>    - Commit progress on current task
  complete <task-id>  - Complete task and create PR
  list [status]       - List tasks by status (todo/in-progress/review/done)
```

---

## 🚀 **Proper Agent Workflow (MANDATORY)**

### **STEP 1: Check Current Status (CRITICAL)**
**ALWAYS start every session by checking status:**
```bash
./task-utils.sh status
```
This shows:
- Current git branch and commit
- Number of tasks in each status
- Tasks currently in progress

### **STEP 2: Check Tasks in Review (HIGHEST PRIORITY)**
**BEFORE starting ANY new task:**
```bash
./task-utils.sh next
```
This will show:
- ⚠️ **Tasks in review** (COMPLETE THESE FIRST!)
- P0 critical path tasks
- P1 high priority tasks
- Currently in progress tasks

**🚨 RULE: Never start a new task if there are tasks in review unless explicitly instructed!**

### **STEP 3: Start a Task**
Once you've confirmed no review tasks need attention:
```bash
./task-utils.sh start P0-INF-XXX
```
This automatically:
- Creates a feature branch `task/P0-INF-XXX`
- Moves task file from `todo/` → `in-progress/`
- Makes initial commit
- Adds start timestamp to task file

### **STEP 4: Work on the Task**
Follow the implementation instructions in the task file. During work:
- Commit progress regularly using `./task-utils.sh commit P0-INF-XXX`
- Check validation periodically using `./task-utils.sh validate P0-INF-XXX`

### **STEP 5: Complete the Task**
When implementation is finished:
```bash
./task-utils.sh complete P0-INF-XXX
```
This automatically performs all completion steps (detailed below).

---

## 🎯 **What the `complete` Command Does**

### **Automated Actions:**
1. **🔍 Validation**: Runs `./tasks/automation/task-completion-validator.sh`
   - Checks code compilation (`npm run build`)
   - Runs all tests (`npm test`)
   - Validates linting
   - Checks TypeScript errors
   - Validates task-specific acceptance criteria

2. **💾 Final Commit**: Creates standardized completion commit
3. **📂 Task Movement**: Moves task file from `in-progress/` → `review/`
4. **🚀 Branch Push**: Pushes feature branch to origin
5. **📋 PR Creation**: Creates PR with comprehensive template (if GitHub CLI available)

### **PR Template Features:**
The system uses `.github/PULL_REQUEST_TEMPLATE.md` which includes:
- Task ID and description
- Implementation details checklist
- Testing requirements
- Security considerations
- Performance impact assessment
- Documentation requirements
- Reviewer guidelines

---

## 📊 **Automation Scripts Deep Dive**

### **1. Pre-Task Validation**
**File**: `tasks/automation/pre-task-validation.sh`
**Purpose**: Validates environment and dependencies before starting any task

**Checks**:
- ✅ Node.js, npm, Git, Docker versions
- ✅ Project structure integrity  
- ✅ Task dependencies completion
- ✅ Environment configuration
- ✅ Task-specific requirements

### **2. Task Completion Validator**
**File**: `tasks/automation/task-completion-validator.sh`
**Purpose**: Automatically validates acceptance criteria and code quality

**Validates**:
- ✅ Code compiles without errors
- ✅ All tests pass
- ✅ Linting and type checking
- ✅ Task-specific deliverables
- ✅ Acceptance criteria fulfillment

### **3. Git Workflow Automation**
**File**: `tasks/automation/git-workflow.sh`
**Purpose**: Standardizes git workflow for task development

**Features**:
- ✅ Automatic branch creation (`task/TASK-ID`)
- ✅ Task file movement between workflow states
- ✅ Standardized commit messages
- ✅ Automated PR creation
- ✅ Rollback capability

### **4. Environment Setup**
**File**: `tasks/automation/environment-setup.sh`
**Purpose**: Automated development environment configuration

**Sets Up**:
- ✅ Dependencies installation
- ✅ Git hooks (pre-commit validation)
- ✅ IDE configuration (VS Code)
- ✅ Development scripts
- ✅ Environment validation

---

## 📝 **PR Template Generation**

### **Automatic PR Creation:**
If GitHub CLI (`gh`) is installed, `complete` automatically creates a PR with:
```markdown
## Task Completion
✅ **Task ID**: P0-INF-XXX
✅ **Status**: Ready for manual review
✅ **Validation**: All automated checks passed

## Changes
[Detailed implementation description]

### Manual Review Required ⚠️
- [ ] Code review completed
- [ ] Architecture review
- [ ] Security review  
- [ ] Integration testing completed

### Automated Checks ✅
- [x] Unit tests pass
- [x] TypeScript compilation successful
- [x] Linting passes
- [x] Task-specific validation completed
```

### **Manual PR Creation:**
If GitHub CLI is not available, the script provides:
- Branch name: `task/P0-INF-XXX`
- Suggested title: `P0-INF-XXX: [Task Title]`
- Instructions to create PR manually

---

## ⚠️ **Critical Rules for Agents**

### **1. ALWAYS Follow the Validation Protocol**
```bash
# MANDATORY first steps for ANY task assessment:
git status && git branch -a
./task-utils.sh status
git checkout develop  # Check merged work
```

### **2. Prioritize Review Tasks**
- Tasks in `review/` folder MUST be completed before starting new tasks
- Help get PRs merged before new development
- Use `./task-utils.sh next` to see review priorities

### **3. Use the Automation Scripts**
- ✅ **DO**: Use `./task-utils.sh start/complete/commit`
- ❌ **DON'T**: Manually move task files between folders
- ❌ **DON'T**: Create branches manually
- ❌ **DON'T**: Skip validation steps

### **4. Task Lifecycle States**
```
todo/ → in-progress/ → review/ → done/
```
- Tasks MUST move through these states using automation scripts
- Never manually move files between directories

---

## 🔧 **Manual Operations (When Needed)**

### **Moving Task to Done (Post-Merge):**
After a PR is merged to develop:
```bash
# Manual move (no automation command for this)
mv tasks/XX-category/review/P0-INF-XXX-task.md tasks/XX-category/done/
git add .
git commit -m "task: Move P0-INF-XXX to done - merged to develop"
```

### **Emergency Rollback:**
If a task needs to be abandoned:
```bash
./task-utils.sh rollback tasks/XX-category/in-progress/P0-INF-XXX-task.md
```

---

## 🔍 **Automated Quality Gates**

### **Pre-commit Hooks** (Auto-configured)
Runs automatically on `git commit`:
- ✅ ESLint validation
- ✅ TypeScript type checking
- ✅ Unit tests execution
- ✅ Task branch validation

### **Build Validation**
Every code change validated for:
- ✅ TypeScript compilation
- ✅ Import resolution
- ✅ Dependency integrity
- ✅ Configuration validity

---

## 🔄 **Continuous Integration**

### **GitHub Actions Pipeline**
**File**: `tasks/automation/ci-setup.yml`
**Purpose**: Automated testing and validation in CI/CD

**Pipeline Jobs**:
- ✅ **Task Validation**: Verifies task branch structure
- ✅ **Code Quality**: ESLint, TypeScript, tests
- ✅ **Infrastructure Tests**: Database, Docker, Go compilation
- ✅ **Security Scan**: Secrets detection, dependency audit
- ✅ **Integration Tests**: KYC feature testing
- ✅ **Performance Tests**: Load and response time validation
- ✅ **Auto-merge**: Approved tasks automatically merged
- ✅ **Deployment**: Staging deployment on main branch

---

## 📚 **Knowledge Base & Resources**

### **AI Developer Reference**
**File**: `tasks/automation/knowledge-base.md`
**Contains**:
- ✅ NestJS service and controller patterns
- ✅ Database integration best practices
- ✅ Hyperledger Fabric integration patterns
- ✅ iDenfy API error handling
- ✅ IPFS storage patterns
- ✅ Common issues and solutions
- ✅ Testing patterns
- ✅ Security guidelines
- ✅ Performance optimization

### **Key Documentation Files**
- **Branch Strategy**: `.github/BRANCH_STRATEGY.md`
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md`
- **Review Workflow**: `.github/REVIEW_WORKFLOW.md`
- **Task Templates**: `tasks/templates/`

---

## 🎯 **Best Practices for Agents**

### **Session Start Checklist:**
1. ✅ Check git status and current branch
2. ✅ Run `./task-utils.sh status`
3. ✅ Check for review tasks with `./task-utils.sh next`
4. ✅ Complete any review tasks before starting new work
5. ✅ If starting new task, use `./task-utils.sh start P0-XXX`

### **During Development:**
1. ✅ Follow task implementation instructions
2. ✅ Commit progress regularly
3. ✅ Run validation periodically
4. ✅ Test thoroughly before completion

### **Task Completion:**
1. ✅ Use `./task-utils.sh complete P0-XXX`
2. ✅ Verify PR was created (or create manually)
3. ✅ Ensure all automated checks pass
4. ✅ Leave detailed comments about implementation

### **Post-Merge (User Action):**
1. ✅ User merges PR to develop
2. ✅ Agent switches to develop: `git checkout develop && git pull`
3. ✅ Agent moves task to done manually
4. ✅ Ready for next task

---

## 🚨 **Common Mistakes to Avoid**

1. ❌ **Starting new tasks without checking review queue**
2. ❌ **Manually moving task files between folders**
3. ❌ **Skipping the validation steps**
4. ❌ **Not using the automation scripts**
5. ❌ **Working on wrong branch or not following git workflow**
6. ❌ **Creating PRs manually without using task-specific info**

---

## ⚡ **Quick Commands Reference**

### **Daily Development**
```bash
# Check what's next
./task-utils.sh next

# Start highest priority task
./task-utils.sh start P0-INF-001

# Check current status
./task-utils.sh status

# Validate completion before finishing
./task-utils.sh validate P0-INF-001

# Complete task (full automation)
./task-utils.sh complete P0-INF-001
```

### **Troubleshooting**
```bash
# Re-run environment setup
./tasks/automation/environment-setup.sh

# Validate current task
./task-utils.sh validate P0-INF-001

# Check git and task status
./task-utils.sh status

# Manual validation
./tasks/automation/task-completion-validator.sh tasks/path/to/task.md
```

### **Emergency Operations**
```bash
# Rollback current task if something goes wrong
./tasks/automation/git-workflow.sh rollback tasks/XX-category/in-progress/P0-INF-XXX-task.md

# List all tasks by status
./task-utils.sh list
./task-utils.sh list todo
./task-utils.sh list review
```

---

## 🔍 **Troubleshooting**

### **Script Fails:**
```bash
# Check script permissions
chmod +x ./task-utils.sh
chmod +x ./tasks/automation/*.sh

# Check dependencies
git --version
npm --version
node --version
docker --version
```

### **Task Not Found:**
```bash
# List all tasks to find correct ID
./task-utils.sh list
./task-utils.sh list todo
```

### **Validation Fails:**
```bash
# Run validation manually to see details
./tasks/automation/task-completion-validator.sh tasks/path/to/task.md

# Check individual components
npm run build
npm test
npm run lint
```

---

## 📈 **Success Metrics**

### **Automation Effectiveness**
- **Task Completion Rate**: Target 95%+ success rate
- **Error Reduction**: 80%+ fewer integration issues
- **Setup Time**: <5 minutes from zero to ready
- **Validation Coverage**: 100% automated checking

### **Quality Assurance**
- **Code Quality**: Automated linting and type checking
- **Test Coverage**: Required tests for all new functionality
- **Security**: Automated secret scanning and dependency audits
- **Performance**: Response time and resource monitoring

---

## 🎉 **Benefits Achieved**

### **For AI Development**
- ✅ **Clear Instructions**: Every task has exact file paths and code examples
- ✅ **Error Prevention**: Pre-validation catches issues before they occur
- ✅ **Quality Assurance**: Automated testing ensures working code
- ✅ **Knowledge Base**: Patterns and solutions for complex integrations

### **For Project Success**
- ✅ **Reduced Risk**: Multiple validation layers prevent failures
- ✅ **Faster Development**: Automated setup and workflow
- ✅ **Consistent Quality**: Standardized processes and checks
- ✅ **Easy Recovery**: Rollback and troubleshooting tools

### **For Maintenance**
- ✅ **Version Control**: All automation scripts tracked in git
- ✅ **Documentation**: Comprehensive guides and references
- ✅ **Monitoring**: CI/CD pipeline tracks all changes
- ✅ **Scalability**: Easy to add new tasks and automation

---

## 🏁 **Ready to Start!**

Your KYC attestation platform now has enterprise-grade automation for AI-driven development. The system is designed to maximize success while minimizing the chance of errors or integration issues.

**Next Step**: Run the environment setup and start with your first task!

```bash
# Set up everything
./tasks/automation/environment-setup.sh

# Check what's prioritized
./task-utils.sh next

# Start with the highest priority task
./task-utils.sh start P0-XXX-XXX
```

---

**🤖 Remember**: The automation scripts are designed to ensure consistency, quality, and proper task tracking. Always use them rather than manual operations! This guide should be your primary reference for all task management activities.

🚀 **Your path to a successful KYC platform is now fully automated!** 