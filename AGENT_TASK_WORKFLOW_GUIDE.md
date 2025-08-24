# 🤖 **AI Agent Task Workflow Guide**

## 📋 **Overview**
This guide explains how AI agents should properly use the task management automation scripts for the KYC Attestation Platform. The system provides standardized workflows for starting, working on, and completing tasks.

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

## 🚀 **Proper Agent Workflow**

### **STEP 1: Check Current Status (MANDATORY)**
**ALWAYS start every session by checking status:**
```bash
./task-utils.sh status
```
This shows:
- Current git branch and commit
- Number of tasks in each status
- Tasks currently in progress

### **STEP 2: Check Tasks in Review (CRITICAL)**
**BEFORE starting ANY new task:**
```bash
./task-utils.sh next
```
This will show:
- ⚠️ **Tasks in review** (HIGHEST PRIORITY - complete these first!)
- P0 critical path tasks
- P1 high priority tasks
- Currently in progress tasks

**RULE: Never start a new task if there are tasks in review unless explicitly instructed!**

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
This automatically:
- Runs task completion validation
- Makes final commit
- Moves task from `in-progress/` → `review/`
- Pushes branch to origin
- Creates a Pull Request (if GitHub CLI available)
- Uses the standardized PR template

## 🎯 **What the `complete` Command Does**

### **Automated Actions:**
1. **Validation**: Runs `./tasks/automation/task-completion-validator.sh`
   - Checks code compilation
   - Runs all tests
   - Validates linting
   - Checks TypeScript errors
   - Validates task-specific acceptance criteria

2. **Final Commit**: Creates standardized completion commit
3. **Task Movement**: Moves task file to `review/` folder
4. **Branch Push**: Pushes feature branch to origin
5. **PR Creation**: Creates PR with comprehensive template (if GitHub CLI available)

### **PR Template Features:**
The system uses `.github/PULL_REQUEST_TEMPLATE.md` which includes:
- Task ID and description
- Implementation details checklist
- Testing requirements
- Security considerations
- Performance impact assessment
- Documentation requirements
- Reviewer guidelines

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

## 📊 **Validation System**

### **Automated Checks:**
The `complete` command runs comprehensive validation:
- **Build**: `npm run build` must pass
- **Tests**: All unit tests must pass
- **Linting**: No linting errors
- **TypeScript**: No compilation errors
- **Task-Specific**: Custom validation per task type

### **Manual Verification:**
Agents should verify:
- All acceptance criteria met
- Implementation follows architecture patterns
- Documentation is complete
- No breaking changes introduced

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

## 🚨 **Common Mistakes to Avoid**

1. ❌ **Starting new tasks without checking review queue**
2. ❌ **Manually moving task files between folders**
3. ❌ **Skipping the validation steps**
4. ❌ **Not using the automation scripts**
5. ❌ **Working on wrong branch or not following git workflow**
6. ❌ **Creating PRs manually without using task-specific info**

## 🔍 **Troubleshooting**

### **Script Fails:**
```bash
# Check script permissions
chmod +x ./task-utils.sh
chmod +x ./tasks/automation/*.sh

# Check dependencies
git --version
npm --version
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
```

## 📚 **Reference Links**

- **Branch Strategy**: `.github/BRANCH_STRATEGY.md`
- **PR Template**: `.github/PULL_REQUEST_TEMPLATE.md`
- **Review Workflow**: `.github/REVIEW_WORKFLOW.md`
- **Task Automation**: `tasks/automation/` directory

---

**Remember**: The automation scripts are designed to ensure consistency, quality, and proper task tracking. Always use them rather than manual operations! 🎯 