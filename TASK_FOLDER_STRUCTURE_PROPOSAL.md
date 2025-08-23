# Task Management Folder Structure Proposal

## Overview
This folder structure provides a Jira-like task management system using the filesystem, organized by epics with clear dependency tracking and workflow status.

## Proposed Structure

```
tasks/
├── README.md                           # Workflow guide and conventions
├── templates/                          # Task and epic templates
│   ├── task-template.md
│   ├── epic-template.md
│   └── retrospective-template.md
├── 00-infrastructure/                  # Cross-cutting infrastructure tasks
│   ├── epic-info.md
│   ├── todo/
│   ├── in-progress/
│   ├── review/
│   ├── done/
│   └── blocked/
├── 01-identity-attestation/            # Module 1: On-Chain Identity & Attestation
│   ├── epic-info.md
│   ├── phase-1-verification/           # Epic 1.1: Identity Verification
│   │   ├── todo/
│   │   ├── in-progress/
│   │   ├── review/
│   │   ├── done/
│   │   └── blocked/
│   ├── phase-2-blockchain/             # Epic 1.2: Blockchain Attestation
│   │   ├── todo/
│   │   ├── in-progress/
│   │   ├── review/
│   │   ├── done/
│   │   └── blocked/
│   └── phase-3-integration/            # Epic 1.3: Integration & Testing
│       ├── todo/
│       ├── in-progress/
│       ├── review/
│       ├── done/
│       └── blocked/
├── 02-smart-contracts/                 # Module 2: Smart Contract Integration
│   ├── epic-info.md
│   ├── phase-1-templates/              # Epic 2.1: Compliance Templates
│   │   ├── todo/
│   │   ├── in-progress/
│   │   ├── review/
│   │   ├── done/
│   │   └── blocked/
│   └── phase-2-sdk/                    # Epic 2.2: Integration SDK
│       ├── todo/
│       ├── in-progress/
│       ├── review/
│       ├── done/
│       └── blocked/
├── 03-airdrop-campaigns/               # Module 3: Targeted Airdrop Campaigns
│   ├── epic-info.md
│   ├── phase-1-management/             # Epic 3.1: Campaign Management
│   │   ├── todo/
│   │   ├── in-progress/
│   │   ├── review/
│   │   ├── done/
│   │   └── blocked/
│   └── phase-2-analytics/              # Epic 3.2: Analytics & Optimization
│       ├── todo/
│       ├── in-progress/
│       ├── review/
│       ├── done/
│       └── blocked/
├── 04-monitoring-reporting/            # Module 4: Monitoring & Reporting
│   ├── epic-info.md
│   ├── phase-1-monitoring/             # Epic 4.1: Transaction Monitoring
│   │   ├── todo/
│   │   ├── in-progress/
│   │   ├── review/
│   │   ├── done/
│   │   └── blocked/
│   └── phase-2-reporting/              # Epic 4.2: Regulatory Reporting
│       ├── todo/
│       ├── in-progress/
│       ├── review/
│       ├── done/
│       └── blocked/
└── archive/                            # Completed epics and historical tasks
    ├── sprints/
    │   ├── sprint-01/
    │   ├── sprint-02/
    │   └── ...
    └── retrospectives/
        ├── month-01.md
        ├── month-02.md
        └── ...
```

## Workflow Conventions

### Status Folders
- **`todo/`**: Tasks ready to be started (dependencies met)
- **`in-progress/`**: Currently being worked on
- **`review/`**: Waiting for code review, testing, or approval
- **`done/`**: Completed tasks
- **`blocked/`**: Tasks that cannot proceed due to dependencies or issues

### Task File Naming
```
[PRIORITY]-[TASK-ID]-[TITLE].md

Examples:
P0-INF-001-fabric-network-setup.md
P1-ATT-005-ipfs-metadata-storage.md
P2-AUR-012-campaign-analytics-dashboard.md
```

### Priority Levels
- **P0**: Critical (blocks other work)
- **P1**: High (important for sprint)
- **P2**: Medium (nice to have)
- **P3**: Low (future consideration)

### Task Dependencies
Tasks are organized in phases that represent dependency order:
- **Phase 1** tasks can start immediately
- **Phase 2** tasks depend on Phase 1 completion
- **Phase 3** tasks depend on Phase 2 completion

## Task File Template

Each task file should contain:

```markdown
# Task: [Task Title]

## Meta Information
- **Task ID**: [Unique ID]
- **Epic**: [Epic Name]
- **Priority**: [P0/P1/P2/P3]
- **Estimate**: [XS/S/M/L/XL]
- **Sprint**: [Sprint Number]
- **Assignee**: [Team Member]

## Dependencies
- [ ] Task ID: Description
- [ ] Task ID: Description

## Description
[Clear description of what needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2

## Notes
[Any additional notes, links, or context]

## Progress Log
- **Started**: [Date]
- **Last Update**: [Date]
- **Completed**: [Date]

## Status History
- [Date] - Moved to in-progress
- [Date] - Moved to review
- [Date] - Moved to done
```

## Workflow Commands

### Moving Tasks
```bash
# Move task to in-progress
mv tasks/01-identity-attestation/phase-1-verification/todo/P0-ATT-001-idenfy-integration.md \
   tasks/01-identity-attestation/phase-1-verification/in-progress/

# Move task to review
mv tasks/01-identity-attestation/phase-1-verification/in-progress/P0-ATT-001-idenfy-integration.md \
   tasks/01-identity-attestation/phase-1-verification/review/

# Move task to done
mv tasks/01-identity-attestation/phase-1-verification/review/P0-ATT-001-idenfy-integration.md \
   tasks/01-identity-attestation/phase-1-verification/done/
```

### Quick Status Checks
```bash
# See all in-progress tasks
find tasks/ -name "in-progress" -exec ls {} \;

# See all blocked tasks
find tasks/ -name "blocked" -exec ls {} \;

# Count tasks by status
find tasks/ -name "todo" -exec sh -c 'echo "Todo: $(ls "$1" | wc -l)"' _ {} \;
```

## Benefits of This Structure

### 1. **Clear Dependencies**
- Phase-based organization shows what can be worked on when
- Dependencies are explicit in task files
- Visual representation of workflow

### 2. **Status Tracking**
- Easy to see what's in progress across all epics
- Simple to move tasks through workflow states
- Clear visibility into bottlenecks

### 3. **Flexibility**
- Can reorganize tasks by moving files
- Easy to add new epics or phases
- Simple to archive completed work

### 4. **Version Control**
- All task changes are tracked in git
- Task history is preserved
- Collaborative editing through PRs

### 5. **Search & Filter**
- Use grep, find, and other CLI tools
- Search across all tasks for keywords
- Filter by priority, assignee, or status

### 6. **Integration**
- Can generate reports with scripts
- Easy to export to other tools if needed
- Works with any text editor or IDE

## Alternative Structures Considered

### Option A: Flat Structure
```
tasks/
├── todo/
├── in-progress/
├── review/
├── done/
└── blocked/
```
**Pros**: Simple
**Cons**: No epic organization, hard to track dependencies

### Option B: Status-First
```
tasks/
├── todo/
│   ├── infrastructure/
│   ├── identity-attestation/
│   └── smart-contracts/
├── in-progress/
│   ├── infrastructure/
│   └── identity-attestation/
└── done/
    └── infrastructure/
```
**Pros**: Status-focused
**Cons**: Duplicated folder structure, harder to see epic progress

### Option C: Sprint-Based
```
tasks/
├── sprint-01/
├── sprint-02/
├── backlog/
└── archive/
```
**Pros**: Sprint-focused
**Cons**: Doesn't show long-term epic progress, dependencies unclear

## Recommendation

I recommend the **Phase-Based Epic Structure** (main proposal) because:

1. **Aligns with your epic organization** from the task breakdown
2. **Shows dependencies clearly** through phase organization
3. **Supports workflow management** with status folders
4. **Scales well** as the project grows
5. **Provides flexibility** for different work styles

Would you like me to implement this structure and populate it with your initial tasks? 