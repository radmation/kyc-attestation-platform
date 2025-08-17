#!/bin/bash
# Task Management Utility
# Provides convenient commands for working with tasks

set -e

ACTION="$1"
TASK_ID="$2"

if [[ -z "$ACTION" ]]; then
    echo "🚀 KYC Platform Task Management"
    echo "==============================="
    echo ""
    echo "Usage: $0 <action> [task-id]"
    echo ""
    echo "Actions:"
    echo "  next                 - Show next priority tasks to work on"
    echo "  status              - Show current task and git status"
    echo "  start <task-id>     - Start working on a task (e.g., P0-INF-001)"
    echo "  validate <task-id>  - Validate task completion"
    echo "  commit <task-id>    - Commit progress on current task"
    echo "  complete <task-id>  - Complete task and create PR"
    echo "  list [status]       - List tasks by status (todo/in-progress/review/done)"
    echo ""
    echo "Examples:"
    echo "  $0 next                    # See what to work on next"
    echo "  $0 start P0-INF-001      # Start authentication task"
    echo "  $0 status                 # Check current status"
    echo "  $0 validate P0-INF-001   # Check if task is ready for completion"
    echo "  $0 complete P0-INF-001   # Complete and create PR"
    echo ""
    echo "💡 Tip: Start with './task-utils.sh next' to see highest priority tasks"
    exit 1
fi

# Helper functions
find_task_file() {
    local task_id="$1"
    local status="$2"
    
    if [[ -n "$status" ]]; then
        find tasks/ -path "*/$status/*" -name "*$task_id*" | head -1
    else
        find tasks/ -name "*$task_id*" | head -1
    fi
}

case "$ACTION" in
    "next")
        echo "🎯 Next Priority Tasks"
        echo "====================="
        echo ""
        
        # Check for tasks in review FIRST
        echo "🔄 **Tasks In Review - PRIORITIZE THESE:**"
        REVIEW_TASKS=$(find tasks/ -path "*/review/*" -name "*.md")
        if [[ -n "$REVIEW_TASKS" ]]; then
            echo "$REVIEW_TASKS" | while read -r file; do
                if [[ -n "$file" ]]; then
                    task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                    task_id=$(basename "$file" .md | sed 's/-.*$//')
                    echo "   $task_id: $task_name (⚠️ IN REVIEW - COMPLETE FIRST!)"
                fi
            done
            echo ""
            echo "⚠️ IMPORTANT: Tasks in review should be completed before starting new tasks!"
            echo "   Check PRs and help get them merged."
            echo ""
        else
            echo "   None - Great! You can start a new task."
            echo ""
        fi
        
        echo "🔥 **Critical Path (P0) - Start Here:**"
        find tasks/ -path "*/todo/*" -name "P0-*" | sort | while read -r file; do
            if [[ -n "$file" ]]; then
                task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                task_id=$(basename "$file" .md | sed 's/-.*$//')
                echo "   $task_id: $task_name"
            fi
        done
        
        echo ""
        echo "⚡ **High Priority (P1) - After P0:**"
        find tasks/ -path "*/todo/*" -name "P1-*" | sort | while read -r file; do
            if [[ -n "$file" ]]; then
                task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                task_id=$(basename "$file" .md | sed 's/-.*$//')
                echo "   $task_id: $task_name"
            fi
        done
        
        echo ""
        echo "📋 **Currently In Progress:**"
        find tasks/ -path "*/in-progress/*" -name "*.md" | while read -r file; do
            if [[ -n "$file" ]]; then
                task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                task_id=$(basename "$file" .md | sed 's/-.*$//')
                echo "   $task_id: $task_name (in progress)"
            fi
        done
        
        echo ""
        if [[ -n "$REVIEW_TASKS" ]]; then
            echo "💡 **Recommended:** Complete review tasks first!"
        else
            echo "💡 **Recommended:** Start with the highest priority P0 task"
            echo "   ./task-utils.sh start P0-XXX-XXX"
        fi
        ;;
        
    "status")
        echo "📊 Current Status"
        echo "================="
        ./tasks/automation/git-workflow.sh status
        ;;
        
    "start")
        if [[ -z "$TASK_ID" ]]; then
            echo "❌ Task ID required (e.g., P0-INF-001)"
            exit 1
        fi
        
        # Check for tasks in review before starting a new one
        REVIEW_TASKS=$(find tasks/ -path "*/review/*" -name "*.md")
        if [[ -n "$REVIEW_TASKS" ]]; then
            echo "⚠️ WARNING: There are tasks in review that should be completed first!"
            echo "The following tasks are in review:"
            echo "$REVIEW_TASKS"
            echo ""
            echo "❗ RECOMMENDED ACTION: Help complete these review tasks before starting a new one."
            read -p "Do you want to continue anyway? (y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Exiting. Please help complete review tasks first."
                exit 1
            fi
        fi
        
        TASK_FILE=$(find_task_file "$TASK_ID" "todo")
        if [[ -z "$TASK_FILE" ]]; then
            echo "❌ Task $TASK_ID not found in todo/"
            echo "💡 Use './task-utils.sh list todo' to see available tasks"
            exit 1
        fi
        
        echo "🚀 Starting task: $TASK_ID"
        echo "📄 Task file: $TASK_FILE"
        echo ""
        
        # Run pre-validation
        echo "🔍 Running pre-task validation..."
        if ./tasks/automation/pre-task-validation.sh "$TASK_FILE"; then
            echo "✅ Pre-validation passed"
            echo ""
            ./tasks/automation/git-workflow.sh start "$TASK_FILE"
        else
            echo "❌ Pre-validation failed"
            echo "💡 Fix environment issues before starting task"
            exit 1
        fi
        ;;
        
    "validate")
        if [[ -z "$TASK_ID" ]]; then
            echo "❌ Task ID required"
            exit 1
        fi
        
        TASK_FILE=$(find_task_file "$TASK_ID" "in-progress")
        if [[ -z "$TASK_FILE" ]]; then
            echo "❌ Task $TASK_ID not found in in-progress/"
            exit 1
        fi
        
        echo "🔍 Validating task completion: $TASK_ID"
        ./tasks/automation/task-completion-validator.sh "$TASK_FILE"
        ;;
        
    "commit")
        if [[ -z "$TASK_ID" ]]; then
            echo "❌ Task ID required"
            exit 1
        fi
        
        TASK_FILE=$(find_task_file "$TASK_ID" "in-progress")
        if [[ -z "$TASK_FILE" ]]; then
            echo "❌ Task $TASK_ID not found in in-progress/"
            exit 1
        fi
        
        ./tasks/automation/git-workflow.sh commit "$TASK_FILE"
        ;;
        
    "complete")
        if [[ -z "$TASK_ID" ]]; then
            echo "❌ Task ID required"
            exit 1
        fi
        
        TASK_FILE=$(find_task_file "$TASK_ID" "in-progress")
        if [[ -z "$TASK_FILE" ]]; then
            echo "❌ Task $TASK_ID not found in in-progress/"
            exit 1
        fi
        
        echo "🎯 Completing task: $TASK_ID"
        ./tasks/automation/git-workflow.sh complete "$TASK_FILE"
        ;;
        
    "list")
        STATUS="${TASK_ID:-all}"
        
        echo "📋 Task List"
        echo "============"
        echo ""
        
        if [[ "$STATUS" == "all" || "$STATUS" == "todo" ]]; then
            echo "📝 **TODO** ($(find tasks/ -path "*/todo/*" -name "*.md" | wc -l) tasks):"
            find tasks/ -path "*/todo/*" -name "*.md" | sort | while read -r file; do
                if [[ -n "$file" ]]; then
                    task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                    task_id=$(basename "$file" .md | sed 's/-.*$//')
                    priority=$(echo "$task_id" | sed 's/-.*//')
                    echo "   $task_id [$priority]: $task_name"
                fi
            done
            echo ""
        fi
        
        if [[ "$STATUS" == "all" || "$STATUS" == "in-progress" ]]; then
            echo "🔄 **IN PROGRESS** ($(find tasks/ -path "*/in-progress/*" -name "*.md" | wc -l) tasks):"
            find tasks/ -path "*/in-progress/*" -name "*.md" | sort | while read -r file; do
                if [[ -n "$file" ]]; then
                    task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                    task_id=$(basename "$file" .md | sed 's/-.*$//')
                    echo "   $task_id: $task_name"
                fi
            done
            echo ""
        fi
        
        if [[ "$STATUS" == "all" || "$STATUS" == "review" ]]; then
            echo "👀 **REVIEW** ($(find tasks/ -path "*/review/*" -name "*.md" | wc -l) tasks):"
            find tasks/ -path "*/review/*" -name "*.md" | sort | while read -r file; do
                if [[ -n "$file" ]]; then
                    task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                    task_id=$(basename "$file" .md | sed 's/-.*$//')
                    echo "   $task_id: $task_name"
                fi
            done
            echo ""
        fi
        
        if [[ "$STATUS" == "all" || "$STATUS" == "done" ]]; then
            echo "✅ **DONE** ($(find tasks/ -path "*/done/*" -name "*.md" | wc -l) tasks):"
            find tasks/ -path "*/done/*" -name "*.md" | sort | while read -r file; do
                if [[ -n "$file" ]]; then
                    task_name=$(basename "$file" .md | sed 's/^[^-]*-[^-]*-[^-]*-//')
                    task_id=$(basename "$file" .md | sed 's/-.*$//')
                    echo "   $task_id: $task_name"
                fi
            done
        fi
        ;;
        
    *)
        echo "❌ Unknown action: $ACTION"
        echo "Run with no arguments to see usage"
        exit 1
        ;;
esac 