# Task Management System - Quick Start

## 📋 Overview
Your filesystem-based task management system is now set up! This provides Jira-like functionality with simple file operations.

## 🗂️ Structure Created
```
tasks/
├── README.md                          # Complete workflow guide
├── templates/                         # Task and epic templates
├── 00-infrastructure/                 # Foundation tasks (CRITICAL PATH)
│   ├── epic-info.md
│   └── todo/
│       ├── P0-INF-001-authentication-authorization-system.md
│       ├── P0-INF-002-api-gateway-middleware.md
│       ├── P0-INF-003-hyperledger-fabric-setup.md
│       └── P1-INF-004-monitoring-stack-setup.md
├── 01-identity-attestation/           # Core KYC & blockchain features
│   ├── epic-info.md
│   └── phase-1-verification/todo/
│       └── P0-ATT-001-persona-kyc-integration.md
├── 02-smart-contracts/                # Compliance enforcement
├── 03-airdrop-campaigns/              # Business value features
├── 04-monitoring-reporting/           # Enterprise features
└── archive/                          # Completed work

Each epic has phases with workflow folders:
├── phase-X-name/
│   ├── todo/         ← Ready to start
│   ├── in-progress/  ← Currently working
│   ├── review/       ← Awaiting review
│   ├── done/         ← Completed
│   └── blocked/      ← Cannot proceed
```

## 🚀 How to Use

### 1. **View Available Tasks**
```bash
# See all todo tasks
find tasks/ -path "*/todo/*" -name "*.md"

# See tasks by priority
find tasks/ -name "P0-*.md"  # Critical
find tasks/ -name "P1-*.md"  # High priority
```

### 2. **Start Working on a Task**
```bash
# Move task to in-progress
mv tasks/00-infrastructure/todo/P0-INF-001-authentication-authorization-system.md \
   tasks/00-infrastructure/in-progress/

# Or use the full path method
mv "tasks/00-infrastructure/todo/P0-INF-001-authentication-authorization-system.md" \
   "tasks/00-infrastructure/in-progress/"
```

### 3. **Check Current Work**
```bash
# See what's in progress
find tasks/ -path "*/in-progress/*" -name "*.md"

# Count tasks by status
echo "Todo: $(find tasks/ -path "*/todo/*" -name "*.md" | wc -l)"
echo "In Progress: $(find tasks/ -path "*/in-progress/*" -name "*.md" | wc -l)"
echo "Done: $(find tasks/ -path "*/done/*" -name "*.md" | wc -l)"
```

### 4. **Complete a Task**
```bash
# Move completed task to done
mv tasks/00-infrastructure/in-progress/P0-INF-001-authentication-authorization-system.md \
   tasks/00-infrastructure/done/

# Update the task file with completion date
echo "- **Completed**: $(date)" >> tasks/00-infrastructure/done/P0-INF-001-authentication-authorization-system.md
```

### 5. **Find Tasks by Topic**
```bash
# Search for specific functionality
grep -r "authentication" tasks/*/todo/
grep -r "blockchain" tasks/*/todo/
grep -r "KYC" tasks/*/todo/
```

## 🎯 Getting Started (Recommended Order)

### Week 1-2: Infrastructure Foundation
**Start with these P0 (critical) tasks in order:**

1. **P0-INF-001**: Authentication & Authorization System
   - Location: `tasks/00-infrastructure/todo/`
   - Blocks: Everything else
   - AI-friendly: Complete step-by-step instructions with code examples

2. **P0-INF-002**: API Gateway & Security Middleware  
   - Depends on: P0-INF-001
   - Critical for: All API functionality

3. **P0-INF-003**: Hyperledger Fabric Network Setup
   - Can run parallel with above
   - Critical for: All blockchain functionality

### Week 3: KYC Integration
4. **P0-ATT-001**: Persona KYC Integration
   - Location: `tasks/01-identity-attestation/phase-1-verification/todo/`
   - Depends on: P0-INF-001, P0-INF-002
   - Core business logic

## 🔧 Task Management Commands

### Quick Status Check
```bash
#!/bin/bash
echo "=== KYC Platform Task Status ==="
echo "Todo:        $(find tasks/ -path "*/todo/*" -name "*.md" | wc -l)"
echo "In Progress: $(find tasks/ -path "*/in-progress/*" -name "*.md" | wc -l)"
echo "Review:      $(find tasks/ -path "*/review/*" -name "*.md" | wc -l)"
echo "Done:        $(find tasks/ -path "*/done/*" -name "*.md" | wc -l)"
echo "Blocked:     $(find tasks/ -path "*/blocked/*" -name "*.md" | wc -l)"

echo -e "\n=== Current Work ==="
find tasks/ -path "*/in-progress/*" -name "*.md" -exec basename {} \;
```

### Move Task Helper Function
```bash
#!/bin/bash
move_task() {
    local task_file="$1"
    local to_status="$2"
    
    if [[ ! -f "$task_file" ]]; then
        echo "Task file not found: $task_file"
        return 1
    fi
    
    local dir=$(dirname "$task_file")
    local filename=$(basename "$task_file")
    local base_dir=$(dirname "$dir")
    
    mv "$task_file" "$base_dir/$to_status/$filename"
    echo "Moved $filename to $to_status"
}

# Usage:
# move_task "tasks/00-infrastructure/todo/P0-INF-001-auth.md" "in-progress"
```

## 📝 Key Features

### ✅ **AI-Friendly Task Descriptions**
Each task includes:
- **Exact file paths** for all code changes
- **Complete code examples** to follow
- **Step-by-step instructions** for AI execution
- **Context about existing codebase**
- **Verification steps** to confirm completion

### ✅ **Clear Dependencies**
- Tasks organized by dependency order in phases
- Cross-epic dependencies noted in task files
- Critical path clearly marked (P0 infrastructure tasks)

### ✅ **Version Control Integration**
- All task changes tracked in git
- Task files can be edited collaboratively
- Progress history preserved

### ✅ **Simple Workflow**
```
todo → in-progress → review → done
                 ↓
               blocked
```

## 🎨 Customization

### Add New Tasks
1. Copy template: `cp tasks/templates/task-template.md tasks/epic/phase/todo/P1-ABC-123-new-task.md`
2. Fill in details using the template structure
3. Ensure AI-friendly instructions with exact file paths

### Add New Epics
1. Create epic directory: `mkdir -p tasks/05-new-epic/{phase-1,phase-2}/{todo,in-progress,review,done,blocked}`
2. Copy epic template: `cp tasks/templates/epic-template.md tasks/05-new-epic/epic-info.md`
3. Fill in epic details

## 💡 Tips

- **Focus on P0 tasks first** - they block everything else
- **One task in-progress at a time** - avoid context switching
- **Update task files** with progress notes and completion dates
- **Use git commits** to reference task IDs for change tracking
- **Review epic-info.md files** to understand the big picture

## 📞 Quick Reference

**View this guide**: `cat tasks/QUICK_START.md`  
**Full documentation**: `cat tasks/README.md`  
**Task template**: `cat tasks/templates/task-template.md`  
**Epic template**: `cat tasks/templates/epic-template.md`

Your task management system is ready! Start with the infrastructure tasks to build the foundation, then move to KYC integration for core business value. All tasks are written for AI execution with detailed instructions and exact file paths. 