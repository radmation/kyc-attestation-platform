# Task: [Task Title]

## Meta Information
- **Task ID**: [PRIORITY]-[MODULE]-[SEQUENCE]
- **Epic**: [Epic Name]
- **Priority**: [P0/P1/P2/P3]
- **Estimate**: [XS/S/M/L/XL] ([X] days)
- **Sprint**: [Sprint Number]
- **Assignee**: [Team Member or AI]

## Dependencies
- [ ] [TASK-ID]: [Dependency description]
- [ ] [TASK-ID]: [Dependency description]

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Blockchain**: Hyperledger Fabric with Go chaincode at `/chaincode/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Frontend**: Angular at `/apps/frontend/src/` (if applicable)

**Related Files**: 
- Reference: `/path/to/existing/file.ts`
- Pattern: `/path/to/similar/implementation.ts`
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md`

## Objective
[Clear, specific description of what needs to be accomplished]

## Detailed Implementation Instructions

### Step 1: [Action Title]
**File**: `/exact/path/to/file.ts`
**Action**: [Create/Modify/Update] this file with the following:

```typescript
// Exact code example or pattern to follow
interface ExampleInterface {
  property: string;
}
```

**Explanation**: [Why this step is needed and how it fits into the system]

### Step 2: [Action Title]
**File**: `/exact/path/to/another/file.ts`
**Action**: [Create/Modify/Update] this file to:
- Add specific functionality
- Import required dependencies
- Follow existing patterns in the codebase

```typescript
// Code example with imports and implementation
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
  // Implementation details
}
```

### Step 3: [Integration/Testing]
**Files to Update**:
- `/apps/backend/src/app.module.ts` - Add module import
- `/apps/backend/src/main.ts` - Register service if needed

**Testing**: Create or update test files:
- `/apps/backend/src/[module]/[service].spec.ts`

## Acceptance Criteria
- [ ] **Functional**: [Specific feature works as expected]
- [ ] **Technical**: [Code follows patterns in existing codebase]
- [ ] **Integration**: [New code integrates with existing modules]
- [ ] **Testing**: [Unit tests pass and cover new functionality]
- [ ] **Documentation**: [Code includes JSDoc comments and README updates]

## Verification Steps
1. **Run Tests**: `npm run test` passes without errors
2. **Type Check**: `npm run build` completes successfully
3. **Integration**: [Specific functionality test]
4. **Code Quality**: ESLint and Prettier checks pass

## Expected Deliverables
- [ ] [Specific file 1] with [specific functionality]
- [ ] [Specific file 2] with [specific functionality]
- [ ] Unit tests for new functionality
- [ ] Updated documentation if required

## Error Handling Requirements
- Use NestJS exception filters pattern
- Include proper TypeScript error types
- Add logging for debugging
- Follow existing error handling patterns in codebase

## References
- **Architecture**: `/docs/TECHNICAL_SPECIFICATIONS.md`
- **API Patterns**: `/apps/backend/src/modules/auth/` (example implementation)
- **Database Schema**: `/apps/backend/prisma/schema.prisma`
- **Cursor Rules**: `/.cursorrules` (development guidelines)

## Notes for AI
- Always use exact file paths from project root
- Follow TypeScript strict mode requirements
- Use existing imports and patterns from similar files
- Include proper error handling and logging
- Add JSDoc comments for public methods
- Follow NestJS decorators and dependency injection patterns

## Progress Log
- **Created**: [Date]
- **Started**: [Date]
- **Last Update**: [Date] - [Progress notes]
- **Completed**: [Date]

## Status History
- [Date] - Created in todo/
- [Date] - Moved to in-progress/
- [Date] - Moved to review/
- [Date] - Moved to done/ 