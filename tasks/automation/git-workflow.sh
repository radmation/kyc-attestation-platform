#!/bin/bash
# Git Workflow Automation Script
# Standardizes the git workflow for task development

set -e

ACTION="$1"
TASK_FILE="$2"

if [[ -z "$ACTION" ]]; then
    echo "Usage: $0 <action> [task-file]"
    echo ""
    echo "Actions:"
    echo "  start <task-file>     - Start working on a task (create branch, move to in-progress)"
    echo "  commit <task-file>    - Commit current work with standard message"
    echo "  complete <task-file>  - Complete task (validate, commit, move to review, create PR)"
    echo "  rollback <task-file>  - Rollback changes and return task to todo"
    echo "  status               - Show current git and task status"
    echo ""
    echo "Examples:"
    echo "  $0 start tasks/00-infrastructure/todo/P0-INF-001-authentication-authorization-system.md"
    echo "  $0 commit tasks/00-infrastructure/in-progress/P0-INF-001-authentication-authorization-system.md"
    echo "  $0 complete tasks/00-infrastructure/in-progress/P0-INF-001-authentication-authorization-system.md"
    exit 1
fi

# Utility functions
get_task_id() {
    local task_file="$1"
    if [[ -f "$task_file" ]]; then
        grep "Task ID" "$task_file" | sed 's/.*: //' | head -1
    else
        echo "unknown"
    fi
}

get_task_title() {
    local task_file="$1"
    if [[ -f "$task_file" ]]; then
        basename "$task_file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//'
    else
        echo "unknown-task"
    fi
}

case "$ACTION" in
    "start")
        if [[ -z "$TASK_FILE" ]] || [[ ! -f "$TASK_FILE" ]]; then
            echo "❌ Task file required and must exist"
            exit 1
        fi
        
        TASK_ID=$(get_task_id "$TASK_FILE")
        TASK_TITLE=$(get_task_title "$TASK_FILE")
        
        echo "🚀 Starting work on task: $TASK_ID"
        echo "====================================="
        
        # Check if working directory is clean
        if [[ -n $(git status --porcelain) ]]; then
            echo "⚠️  Working directory has uncommitted changes"
            read -p "Commit current changes first? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git add .
                git commit -m "WIP: Save current work before starting $TASK_ID"
            else
                echo "❌ Please commit or stash changes before starting new task"
                exit 1
            fi
        fi
        
        # Create and switch to feature branch
        BRANCH_NAME="task/$TASK_ID"
        if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
            echo "🔄 Switching to existing branch: $BRANCH_NAME"
            git checkout "$BRANCH_NAME"
        else
            echo "🌟 Creating new branch: $BRANCH_NAME"
            git checkout -b "$BRANCH_NAME"
        fi
        
        # Move task to in-progress
        IN_PROGRESS_DIR="$(dirname "$(dirname "$TASK_FILE")")/in-progress"
        if [[ ! -d "$IN_PROGRESS_DIR" ]]; then
            mkdir -p "$IN_PROGRESS_DIR"
        fi
        
        NEW_PATH="$IN_PROGRESS_DIR/$(basename "$TASK_FILE")"
        mv "$TASK_FILE" "$NEW_PATH"
        
        # Update task file with start time
        echo "- **Started**: $(date)" >> "$NEW_PATH"
        echo "- **Last Update**: $(date) - Started implementation" >> "$NEW_PATH"
        
        # Initial commit
        git add .
        git commit -m "Start $TASK_ID: $TASK_TITLE

- Move task to in-progress
- Create feature branch
- Begin implementation"
        
        echo "✅ Task started successfully!"
        echo "📂 Task file moved to: $NEW_PATH"
        echo "🌿 Branch: $BRANCH_NAME"
        echo ""
        echo "Next steps:"
        echo "1. Follow the implementation instructions in the task file"
        echo "2. Commit progress regularly: ./tasks/automation/git-workflow.sh commit '$NEW_PATH'"
        echo "3. Complete task: ./tasks/automation/git-workflow.sh complete '$NEW_PATH'"
        ;;
        
    "commit")
        if [[ -z "$TASK_FILE" ]] || [[ ! -f "$TASK_FILE" ]]; then
            echo "❌ Task file required and must exist"
            exit 1
        fi
        
        TASK_ID=$(get_task_id "$TASK_FILE")
        TASK_TITLE=$(get_task_title "$TASK_FILE")
        
        echo "💾 Committing progress for task: $TASK_ID"
        echo "========================================"
        
        # Check if there are changes to commit
        if [[ -z $(git status --porcelain) ]]; then
            echo "⚠️  No changes to commit"
            exit 0
        fi
        
        # Show current changes
        echo "📝 Changes to commit:"
        git status --short
        echo ""
        
        # Get commit message
        read -p "Enter progress description (optional): " -r PROGRESS_DESC
        
        # Update task file with progress
        sed -i "s/- \*\*Last Update\*\*:.*/- **Last Update**: $(date) - ${PROGRESS_DESC:-Work in progress}/" "$TASK_FILE"
        
        # Commit changes
        COMMIT_MSG="Progress on $TASK_ID: $TASK_TITLE"
        if [[ -n "$PROGRESS_DESC" ]]; then
            COMMIT_MSG="$COMMIT_MSG

$PROGRESS_DESC"
        fi
        
        git add .
        git commit -m "$COMMIT_MSG"
        
        echo "✅ Progress committed successfully!"
        ;;
        
    "complete")
        if [[ -z "$TASK_FILE" ]] || [[ ! -f "$TASK_FILE" ]]; then
            echo "❌ Task file required and must exist"
            exit 1
        fi
        
        TASK_ID=$(get_task_id "$TASK_FILE")
        TASK_TITLE=$(get_task_title "$TASK_FILE")
        
        echo "🎯 Completing task: $TASK_ID"
        echo "============================"
        
        # Run task completion validation
        echo "🔍 Running completion validation..."
        if ! ./tasks/automation/task-completion-validator.sh "$TASK_FILE"; then
            echo "❌ Task validation failed. Please fix issues before completing."
            exit 1
        fi
        
        # Final commit
        if [[ -n $(git status --porcelain) ]]; then
            echo "💾 Making final commit..."
            git add .
            git commit -m "Complete $TASK_ID: $TASK_TITLE

- All acceptance criteria met
- Code compiles and tests pass
- Ready for review"
        fi
        
        # Move to review
        REVIEW_DIR="$(dirname "$(dirname "$TASK_FILE")")/review"
        if [[ ! -d "$REVIEW_DIR" ]]; then
            mkdir -p "$REVIEW_DIR"
        fi
        
        NEW_PATH="$REVIEW_DIR/$(basename "$TASK_FILE")"
        mv "$TASK_FILE" "$NEW_PATH"
        
        # Update task file with completion time
        sed -i "s/- \*\*Last Update\*\*:.*/- **Last Update**: $(date) - Completed and moved to review/" "$NEW_PATH"
        echo "- **Completed**: $(date)" >> "$NEW_PATH"
        echo "- [Date] - Moved to review/" >> "$NEW_PATH"
        
        # Commit the task move
        git add .
        git commit -m "Move $TASK_ID to review

Task completed and ready for review"
        
        # Push branch
        echo "🚀 Pushing branch for review..."
        git push origin "task/$TASK_ID"
        
        # Create PR (if GitHub CLI is available)
        if command -v gh &> /dev/null; then
            echo "📝 Creating pull request..."
            gh pr create --title "$TASK_ID: $TASK_TITLE" --body "
## Task Completion

✅ **Task ID**: $TASK_ID
✅ **Status**: Ready for review
✅ **Validation**: All automated checks passed

## Changes

This PR implements $TASK_TITLE as specified in the task requirements.

### Acceptance Criteria
- [ ] Code review completed
- [ ] All automated tests pass
- [ ] Integration testing completed
- [ ] Documentation reviewed

### Files Changed
$(git diff --name-only main..HEAD | sed 's/^/- /')

## Testing
- [x] Unit tests pass
- [x] TypeScript compilation successful
- [x] Linting passes
- [x] Task-specific validation completed

Please review and approve if all criteria are met.
" --head "task/$TASK_ID" --base main
        else
            echo "📝 GitHub CLI not available. Please create PR manually:"
            echo "   Branch: task/$TASK_ID"
            echo "   Title: $TASK_ID: $TASK_TITLE"
        fi
        
        echo "✅ Task completed successfully!"
        echo "📂 Task moved to: $NEW_PATH"
        echo "🔀 Pull request created for review"
        echo ""
        echo "Next steps:"
        echo "1. Wait for code review"
        echo "2. Address any feedback"
        echo "3. After approval, merge PR and move task to done/"
        ;;
        
    "rollback")
        if [[ -z "$TASK_FILE" ]] || [[ ! -f "$TASK_FILE" ]]; then
            echo "❌ Task file required and must exist"
            exit 1
        fi
        
        TASK_ID=$(get_task_id "$TASK_FILE")
        TASK_TITLE=$(get_task_title "$TASK_FILE")
        
        echo "⏪ Rolling back task: $TASK_ID"
        echo "=============================="
        
        read -p "Are you sure you want to rollback all changes for $TASK_ID? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Rollback cancelled"
            exit 0
        fi
        
        # Switch to main and delete feature branch
        git checkout main
        git branch -D "task/$TASK_ID" 2>/dev/null || true
        
        # Move task back to todo
        TODO_DIR="$(dirname "$(dirname "$TASK_FILE")")/todo"
        if [[ ! -d "$TODO_DIR" ]]; then
            mkdir -p "$TODO_DIR"
        fi
        
        NEW_PATH="$TODO_DIR/$(basename "$TASK_FILE")"
        mv "$TASK_FILE" "$NEW_PATH"
        
        # Clean up task file history
        sed -i '/- \*\*Started\*\*:/d' "$NEW_PATH"
        sed -i '/- \*\*Last Update\*\*:/d' "$NEW_PATH"
        sed -i '/- \*\*Completed\*\*:/d' "$NEW_PATH"
        
        echo "✅ Task rolled back successfully!"
        echo "📂 Task moved back to: $NEW_PATH"
        echo "🌿 Feature branch deleted"
        ;;
        
    "status")
        echo "📊 Git and Task Status"
        echo "======================"
        echo ""
        
        # Git status
        echo "🌿 Git Status:"
        echo "Branch: $(git branch --show-current)"
        echo "Commit: $(git rev-parse --short HEAD)"
        
        if [[ -n $(git status --porcelain) ]]; then
            echo "Changes: $(git status --porcelain | wc -l) modified files"
        else
            echo "Changes: Clean working directory"
        fi
        echo ""
        
        # Task status
        echo "📋 Task Status:"
        echo "Todo:        $(find tasks/ -path "*/todo/*" -name "*.md" | wc -l)"
        echo "In Progress: $(find tasks/ -path "*/in-progress/*" -name "*.md" | wc -l)"
        echo "Review:      $(find tasks/ -path "*/review/*" -name "*.md" | wc -l)"
        echo "Done:        $(find tasks/ -path "*/done/*" -name "*.md" | wc -l)"
        echo "Blocked:     $(find tasks/ -path "*/blocked/*" -name "*.md" | wc -l)"
        echo ""
        
        # Current work
        IN_PROGRESS=$(find tasks/ -path "*/in-progress/*" -name "*.md")
        if [[ -n "$IN_PROGRESS" ]]; then
            echo "🔄 Currently Working On:"
            echo "$IN_PROGRESS" | while read -r file; do
                if [[ -n "$file" ]]; then
                    TASK_ID=$(get_task_id "$file")
                    echo "  - $TASK_ID: $(basename "$file" .md)"
                fi
            done
        else
            echo "🔄 No tasks currently in progress"
        fi
        ;;
        
    *)
        echo "❌ Unknown action: $ACTION"
        echo "Run with no arguments to see usage"
        exit 1
        ;;
esac 