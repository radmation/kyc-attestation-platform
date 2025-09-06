# 🤖 **AI Agent Documentation Hub**

## 📋 **Essential Reading for All AI Agents**

This directory contains all documentation specifically designed for AI agents working on the KYC Attestation Platform.

---

## 🎯 **Start Here - Mandatory Reading**

### **1. Task Automation Guide** ⭐ **MOST IMPORTANT**
**File**: `../../tasks/AUTOMATION_OVERVIEW.md`
**Purpose**: Complete workflow guide for task management
**Required**: Read before starting ANY work

**Contains**:
- ✅ Complete workflow steps (status → next → start → complete)
- ✅ Task automation scripts usage
- ✅ PR template generation process
- ✅ Critical rules and best practices
- ✅ Troubleshooting guide
- ✅ Quick command reference

---

## 📚 **Core Documentation by Category**

### **🛠️ Development & Architecture**
- **🚨 Development Commands**: `DEVELOPMENT_COMMANDS.md` - **CRITICAL: How to run backend/frontend**
- **Technical Specifications**: `../architecture/TECHNICAL_SPECIFICATIONS.md`
- **Project Overview**: `../architecture/PROJECT_OVERVIEW.md`
- **Development Environment Setup**: `../architecture/DEVELOPMENT_ENVIRONMENT_SETUP.md`
- **Knowledge Base**: `../../tasks/automation/knowledge-base.md`

### **📋 Project Management**
- **Product Requirements (PRD)**: `../PRD.md`
- **Task Organization**: `../TASK_ORGANIZATION.md`
- **Branch Strategy**: `../../.github/BRANCH_STRATEGY.md`
- **Pull Request Template**: `../../.github/PULL_REQUEST_TEMPLATE.md`
- **Review Workflow**: `../../.github/REVIEW_WORKFLOW.md`

### **🔧 Specialized Integration Guides**
- **iDenfy Integration Guide**: `../IDENFY_INTEGRATION_GUIDE.md`
- **iDenfy Webhook Payloads**: `../IDENFY_WEBHOOK_PAYLOADS.md`
- **Blockchain Infrastructure Decision**: `../BLOCKCHAIN_INFRASTRUCTURE_DECISION.md`

### **👥 Human Developer Resources**
- **Developer Checklist**: `../../developer_checklist.md` (manual setup tasks)
- **Development Setup**: `../../DEVELOPMENT_SETUP.md`

---

## 🚨 **Critical Workflow Rules**

### **Every Session Must Start With:**
```bash
# MANDATORY first commands
./task-utils.sh status
./task-utils.sh next
git status && git branch -a
```

### **Never Do These:**
- ❌ Start new tasks without checking review queue
- ❌ Manually move task files between folders
- ❌ Skip automation scripts
- ❌ Work on develop branch directly

### **Always Do These:**
- ✅ Use `./task-utils.sh` for all task operations
- ✅ Complete review tasks before starting new work
- ✅ Follow the complete validation protocol
- ✅ Use automated PR generation

---

## 🎯 **Quick Reference**

### **Daily Commands:**
```bash
./task-utils.sh next      # What should I work on?
./task-utils.sh start P0-XXX-XXX  # Start a task
./task-utils.sh commit P0-XXX-XXX # Save progress
./task-utils.sh complete P0-XXX-XXX # Finish task
```

### **Emergency Commands:**
```bash
./task-utils.sh status    # Where am I?
./tasks/automation/git-workflow.sh rollback [task-file]  # Undo everything
```

---

## 📖 **Documentation Quality Standards**

All agent-facing documentation in this repository follows these principles:
- ✅ **Action-Oriented**: Clear commands and workflows
- ✅ **Complete**: No missing steps or assumptions
- ✅ **Validated**: All commands tested and working
- ✅ **Consistent**: Standardized formatting and terminology
- ✅ **Error-Resistant**: Prevents common mistakes

---

**🎯 Remember**: When in doubt, refer to `../../tasks/AUTOMATION_OVERVIEW.md` - it contains everything you need to successfully work on this platform! 