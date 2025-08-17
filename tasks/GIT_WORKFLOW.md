# Git Workflow for KYC Attestation Platform

## 🚨 CRITICAL: Always Follow This Workflow

This document outlines the **mandatory git workflow** for all development on the KYC Attestation Platform. Following this workflow is **not optional** - it ensures code quality, proper task tracking, and successful project delivery.

## Task Lifecycle

Every task in the system follows this lifecycle:

```
todo/ → in-progress/ → review/ → done/
```

## 🔄 Complete Workflow Steps

### Step 1: Check Current Status
**ALWAYS start here** to see what tasks are in review or in progress:

```bash
./task-utils.sh status
```

### Step 2: Prioritize Tasks in Review
If there are tasks in review, **prioritize completing these first**:
- Check the PR status
- Address review comments
- Help get the PR merged

### Step 3: Find the Next Task
Only after handling review tasks, check what to work on next:

```bash
./task-utils.sh next
```

### Step 4: Start a Task Properly
**NEVER manually start a task**. Always use:

```bash
./task-utils.sh start P0-XXX-XXX
```

This command:
- Creates a feature branch (`task/P0-XXX-XXX`)
- Moves the task file to `in-progress/`
- Updates task metadata
- Makes initial commit

### Step 5: Commit Progress
Use the standardized commit process:

```bash
./tasks/automation/git-workflow.sh commit tasks/00-infrastructure/in-progress/P0-XXX-XXX.md
```

### Step 6: Complete the Task
When finished, validate and complete:

```bash
# Validate completion
./tasks/automation/task-completion-validator.sh tasks/00-infrastructure/in-progress/P0-XXX-XXX.md

# Complete task
./tasks/automation/git-workflow.sh complete tasks/00-infrastructure/in-progress/P0-XXX-XXX.md
```

This:
- Runs final validation
- Moves task to `review/`
- Creates a PR

## ⚠️ Common Mistakes to Avoid

1. **NEVER start work without creating a task branch**
2. **NEVER work directly on main/develop branches**
3. **NEVER manually move task files between directories**
4. **NEVER skip tasks in review**
5. **NEVER start a new task when another is in progress**

## 🔄 Handling Multiple Tasks

If you need to switch between tasks:
1. Commit your current work
2. Use `git checkout` to switch branches
3. Continue work on the other task

## 🆘 Troubleshooting

If something goes wrong:

```bash
# Check current status
./tasks/automation/git-workflow.sh status

# Rollback if needed
./tasks/automation/git-workflow.sh rollback [task-file-path]
```

## 📋 Final Checklist Before Starting Any Task

- [ ] Checked for tasks in review
- [ ] Ran `./task-utils.sh status` to see current state
- [ ] Ran `./task-utils.sh next` to identify priority tasks
- [ ] Started task with `./task-utils.sh start TASK-ID`
- [ ] Confirmed working on the correct branch (`git branch`)

**Remember**: Following this workflow is mandatory for all development work on this project. 