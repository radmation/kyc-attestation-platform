# Task Import Templates for Project Management Tools

This document provides ready-to-import task structures for popular project management tools. Copy the relevant sections based on your tool of choice.

## Jira Import (CSV Format)

### Epic Structure
```csv
Issue Type,Summary,Description,Priority,Story Points,Epic Name,Component
Epic,On-Chain Identity and Attestation,Core identity verification and blockchain attestation functionality,Highest,,Module 1: Identity & Attestation,Backend
Epic,Smart Contract Integration,Automated compliance enforcement through smart contracts,High,,Module 2: Compliance Contracts,Blockchain
Epic,Targeted Airdrop Campaigns,Sybil-resistant token distribution system,Medium,,Module 3: Campaign Management,Frontend
Epic,Monitoring & Reporting,Continuous compliance monitoring and regulatory reporting,Medium,,Module 4: Monitoring & Reporting,Backend
```

### Priority 1 Tasks (CSV)
```csv
Issue Type,Summary,Description,Priority,Story Points,Epic Link,Component,Labels
Story,Idenfy Integration Setup,Integrate with Idenfy API for KYC verification including webhooks and polling fallback,Highest,8,Module 1: Identity & Attestation,Backend,integration
Story,KYC Verification Workflow,Create end-to-end KYC verification workflow with status tracking,Highest,8,Module 1: Identity & Attestation,Backend,workflow
Story,Profile Management System,Manage user profiles and verification data with wallet linking,High,5,Module 1: Identity & Attestation,Backend,profiles
Story,Smart Contract Development,Develop ERC-721 based attestation NFT smart contracts,Highest,8,Module 1: Identity & Attestation,Blockchain,contracts
Story,IPFS Metadata Management,Store attestation metadata on IPFS using Filebase integration,High,5,Module 1: Identity & Attestation,Backend,storage
Story,Attestation Lifecycle Management,Manage full attestation lifecycle including creation and revocation,High,8,Module 1: Identity & Attestation,Backend,lifecycle
Story,End-to-End Integration,Integrate all components for complete KYC to attestation workflow,Highest,5,Module 1: Identity & Attestation,Backend,integration
Story,Frontend Dashboard,Create user-facing dashboard for KYC status and attestation management,High,5,Module 1: Identity & Attestation,Frontend,dashboard
```

## Linear Import (Markdown Format)

### Team Structure
```markdown
# KYC Attestation Platform

## Milestones
- [ ] MVP Launch (Module 1 Complete)
- [ ] Compliance Features (Module 2 Complete)  
- [ ] Business Value Features (Module 3 Complete)
- [ ] Enterprise Features (Module 4 Complete)

## Projects
### Module 1: On-Chain Identity and Attestation
**Priority**: P0 (Highest)
**Timeline**: 12 weeks
**Owner**: Backend Team

### Module 2: Smart Contract Integration
**Priority**: P1 (High)  
**Timeline**: 6 weeks
**Owner**: Blockchain Team

### Module 3: Targeted Airdrop Campaigns
**Priority**: P2 (Medium)
**Timeline**: 6 weeks  
**Owner**: Frontend Team

### Module 4: Monitoring & Reporting
**Priority**: P2 (Medium)
**Timeline**: 8 weeks
**Owner**: Backend Team
```

### Issues Template (Linear Format)
```markdown
## Epic: Identity Verification Infrastructure

### Issue: Idenfy Integration Setup
**Priority**: P0
**Estimate**: 2 weeks
**Labels**: backend, integration, kyc
**Project**: Module 1: On-Chain Identity and Attestation

**Description**:
Integrate with Idenfy API for KYC verification including webhook endpoints and polling fallback mechanism.

**Acceptance Criteria**:
- [ ] Idenfy SDK integrated into backend
- [ ] Webhook endpoint configured for status updates  
- [ ] Polling fallback mechanism implemented
- [ ] Error handling for API failures
- [ ] Test environment configured

**Deliverables**:
- IdenfyService class with full API integration
- Webhook controller for status updates
- Configuration for Idenfy credentials
- Unit tests with mocked Idenfy responses

---

### Issue: KYC Verification Workflow  
**Priority**: P0
**Estimate**: 2 weeks
**Labels**: backend, workflow, kyc
**Project**: Module 1: On-Chain Identity and Attestation
**Depends on**: Idenfy Integration Setup

**Description**:
Create end-to-end KYC verification workflow with comprehensive status tracking.

**Acceptance Criteria**:
- [ ] User can initiate KYC verification process
- [ ] System tracks verification status
- [ ] Webhook updates processed correctly
- [ ] Fallback polling mechanism works
- [ ] Email notifications for status changes

**Deliverables**:
- KYC verification API endpoints
- Database models for verification tracking
- Email notification service  
- Frontend workflow components
```

## Asana Import (CSV Format)

### Project Structure
```csv
Name,Project,Section,Assignee,Due Date,Priority,Notes,Tags
Module 1: On-Chain Identity and Attestation,KYC Platform,Epics,Team Lead,2024-06-01,High,Core identity verification functionality,module1;backend
Module 2: Smart Contract Integration,KYC Platform,Epics,Team Lead,2024-08-01,High,Automated compliance enforcement,module2;blockchain  
Module 3: Targeted Airdrop Campaigns,KYC Platform,Epics,Team Lead,2024-10-01,Medium,Sybil-resistant distributions,module3;frontend
Module 4: Monitoring & Reporting,KYC Platform,Epics,Team Lead,2024-12-01,Medium,Compliance monitoring and reporting,module4;backend
```

### Task Breakdown
```csv
Name,Project,Section,Assignee,Due Date,Priority,Notes,Tags,Parent Task
Idenfy Integration Setup,KYC Platform,Sprint 1,Backend Dev,2024-03-15,High,Integrate Idenfy API with webhooks,integration;kyc,Module 1: On-Chain Identity and Attestation
KYC Verification Workflow,KYC Platform,Sprint 2,Backend Dev,2024-03-29,High,End-to-end verification workflow,workflow;kyc,Module 1: On-Chain Identity and Attestation
Profile Management System,KYC Platform,Sprint 2,Backend Dev,2024-04-05,Medium,User profile and wallet management,profiles;backend,Module 1: On-Chain Identity and Attestation
Smart Contract Development,KYC Platform,Sprint 3,Blockchain Dev,2024-04-19,High,ERC-721 attestation contracts,contracts;solidity,Module 1: On-Chain Identity and Attestation
IPFS Metadata Management,KYC Platform,Sprint 3,Backend Dev,2024-04-12,Medium,Filebase integration for metadata,storage;ipfs,Module 1: On-Chain Identity and Attestation
Attestation Lifecycle Management,KYC Platform,Sprint 4,Backend Dev,2024-05-03,High,Full attestation lifecycle,lifecycle;backend,Module 1: On-Chain Identity and Attestation
End-to-End Integration,KYC Platform,Sprint 4,Full Stack Dev,2024-05-10,High,Complete workflow integration,integration;testing,Module 1: On-Chain Identity and Attestation
Frontend Dashboard,KYC Platform,Sprint 4,Frontend Dev,2024-05-17,Medium,User dashboard interface,dashboard;angular,Module 1: On-Chain Identity and Attestation
```

## GitHub Issues Template

### Epic Template
```markdown
---
name: Epic Template
about: Template for creating new epics
title: "[EPIC] Epic Name"
labels: epic
assignees: ''
---

## Epic Overview
**Module**: [Module Number and Name]
**Priority**: [P0/P1/P2]
**Total Estimate**: [X weeks]
**Dependencies**: [List dependencies]

## Epic Goal
[Clear statement of what this epic achieves]

## Success Metrics
- [ ] Metric 1 with target
- [ ] Metric 2 with target
- [ ] Metric 3 with target

## User Stories
**As a** [user type]  
**I want** [functionality]  
**So that** [benefit]

## Technical Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Definition of Done
- [ ] All user stories completed
- [ ] Code reviewed and merged
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Security review completed

## Tasks
- [ ] #[issue-number] Task 1 Name
- [ ] #[issue-number] Task 2 Name
- [ ] #[issue-number] Task 3 Name
```

### Story Template
```markdown
---
name: Story Template  
about: Template for creating user stories
title: "[STORY] Story Title"
labels: story
assignees: ''
---

## Story Details
**Epic**: [Link to epic]
**Priority**: [P0/P1/P2/P3]
**Estimate**: [S/M/L/XL]
**Sprint**: [Sprint number]

## User Story
**As a** [user type]
**I want** [functionality]
**So that** [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements
- [ ] Technical requirement 1
- [ ] Technical requirement 2

## Deliverables
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] Deliverable 3

## Dependencies
- [ ] Dependency 1 (issue #)
- [ ] Dependency 2 (issue #)

## Definition of Done
- [ ] Code implemented and tested
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Acceptance criteria verified
```

## Notion Database Import

### Database Properties
```json
{
  "Task Name": {"type": "title"},
  "Status": {"type": "select", "options": ["Not Started", "In Progress", "Review", "Done"]},
  "Priority": {"type": "select", "options": ["P0", "P1", "P2", "P3"]},
  "Estimate": {"type": "select", "options": ["XS", "S", "M", "L", "XL"]},
  "Epic": {"type": "relation", "relation_id": "epics_database"},
  "Sprint": {"type": "number"},
  "Assignee": {"type": "people"},
  "Due Date": {"type": "date"},
  "Tags": {"type": "multi_select"},
  "Dependencies": {"type": "relation", "relation_id": "tasks_database"}
}
```

### Sample Task Entries
```csv
Task Name,Status,Priority,Estimate,Epic,Sprint,Tags,Description
Persona Integration Setup,Not Started,P0,M,Module 1: Identity & Attestation,1,backend;integration,Integrate with Persona API for KYC verification
KYC Verification Workflow,Not Started,P0,M,Module 1: Identity & Attestation,2,backend;workflow,Create end-to-end KYC verification workflow
Profile Management System,Not Started,P1,S,Module 1: Identity & Attestation,2,backend;profiles,Manage user profiles and verification data
Smart Contract Development,Not Started,P0,M,Module 1: Identity & Attestation,3,blockchain;contracts,Develop ERC-721 based attestation NFT contracts
```

## Monday.com Import Template

### Board Structure
```json
{
  "board_name": "KYC Attestation Platform",
  "columns": [
    {"title": "Task", "type": "name"},
    {"title": "Status", "type": "color"},
    {"title": "Priority", "type": "dropdown"},
    {"title": "Owner", "type": "people"},
    {"title": "Timeline", "type": "timeline"},
    {"title": "Epic", "type": "dropdown"},
    {"title": "Story Points", "type": "numbers"},
    {"title": "Dependencies", "type": "dependency"}
  ]
}
```

### Import Data
```csv
Task,Status,Priority,Owner,Timeline Start,Timeline End,Epic,Story Points,Notes
Persona Integration Setup,Not Started,High,Backend Team,2024-03-01,2024-03-15,Module 1,8,Integrate with Persona API for KYC verification
KYC Verification Workflow,Not Started,High,Backend Team,2024-03-15,2024-03-29,Module 1,8,Create end-to-end KYC verification workflow  
Profile Management System,Not Started,Medium,Backend Team,2024-03-29,2024-04-05,Module 1,5,Manage user profiles and verification data
Smart Contract Development,Not Started,High,Blockchain Team,2024-04-05,2024-04-19,Module 1,8,Develop ERC-721 based attestation NFT contracts
```

## Usage Instructions

### For Jira:
1. Create new project or use existing
2. Import epics first using CSV import
3. Import stories and link to appropriate epics
4. Set up custom fields for story points and components

### For Linear:
1. Create new team/project
2. Copy milestone and project structure
3. Create issues using the markdown templates
4. Set up labels and priorities as defined

### For Asana:
1. Create new project
2. Import CSV with project structure
3. Organize tasks into sections by sprint
4. Set up custom fields for tags and priorities

### For GitHub:
1. Enable Issues in repository settings
2. Create issue templates in `.github/ISSUE_TEMPLATE/`
3. Create epics as issues with epic label
4. Link stories to epics using GitHub's task lists

### For Notion:
1. Create databases for Epics and Tasks
2. Set up properties as specified
3. Import sample data and customize
4. Create views for different sprint/priority filters

Choose the format that matches your team's preferred project management tool and customize as needed for your specific workflow. 