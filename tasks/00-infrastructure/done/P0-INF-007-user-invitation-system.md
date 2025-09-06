# Task: User Invitation System

## Meta Information
- **Task ID**: P0-INF-007
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P0 (Critical - needed for user onboarding)
- **Estimate**: M (1-2 weeks)
- **Sprint**: Sprint 2
- **Assignee**: AI Developer

## Dependencies
- [x] P0-INF-001: Authentication & Authorization System (needs user management)
- [ ] P0-INF-005: Email Infrastructure with SendGrid Integration (needs invitation emails)
- [ ] P0-INF-006: Frontend React Application (needs invitation UI)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Existing Files**: User model exists in Prisma schema, basic auth module structure

**Related Files**: 
- Reference: `/apps/backend/src/modules/auth/` (existing auth module)
- Database: `/apps/backend/prisma/schema.prisma` (User and Client models)
- Pattern: `/apps/backend/src/modules/auth/` (service patterns)

## Objective
Implement a comprehensive user invitation system that allows client administrators to invite users to their organization, with proper token management, expiration handling, and integration with the email system.

## 🎯 **TASK BREAKDOWN INTO MANAGEABLE CHUNKS**

### **Phase 1: Database & Core Models (Week 1)**
**Goal**: Set up invitation data models and database structure

#### **Chunk 1.1: Database Schema Updates**
- [ ] Add `UserInvitation` model to Prisma schema
- [ ] Add invitation-related fields to existing models
- [ ] Create database migrations
- [ ] Update Prisma client

#### **Chunk 1.2: Invitation Models & DTOs**
- [ ] Create invitation entity models
- [ ] Create invitation DTOs for API
- [ ] Add validation schemas
- [ ] Create invitation status enums

#### **Chunk 1.3: Repository Layer**
- [ ] Create invitation repository
- [ ] Implement CRUD operations
- [ ] Add invitation query methods
- [ ] Implement invitation cleanup

### **Phase 2: Invitation Service & Business Logic (Week 1)**
**Goal**: Implement core invitation business logic

#### **Chunk 2.1: Invitation Service**
- [ ] Create `InvitationService` class
- [ ] Implement invitation creation logic
- [ ] Add invitation validation
- [ ] Implement invitation expiration handling

#### **Chunk 2.2: Token Management**
- [ ] Implement secure invitation token generation
- [ ] Add token expiration logic
- [ ] Create token validation methods
- [ ] Implement token revocation

#### **Chunk 2.3: Role & Permission Assignment**
- [ ] Implement role assignment logic
- [ ] Add permission inheritance
- [ ] Create client-scoped role management
- [ ] Add role validation

### **Phase 3: API Endpoints & Controllers (Week 1-2)**
**Goal**: Create REST API for invitation management

#### **Chunk 3.1: Invitation Controllers**
- [ ] Create invitation CRUD endpoints
- [ ] Implement invitation acceptance endpoint
- [ ] Add bulk invitation endpoints
- [ ] Create invitation status endpoints

#### **Chunk 3.2: Validation & Security**
- [ ] Add invitation validation middleware
- [ ] Implement rate limiting for invitations
- [ ] Add invitation security checks
- [ ] Create invitation audit logging

#### **Chunk 3.3: Integration Endpoints**
- [ ] Create user onboarding endpoints
- [ ] Add invitation status checking
- [ ] Implement invitation resend functionality
- [ ] Create invitation analytics endpoints

### **Phase 4: Email Integration & Frontend (Week 2)**
**Goal**: Integrate with email system and create frontend components

#### **Chunk 4.1: Email Integration**
- [ ] Integrate with SendGrid email service
- [ ] Create invitation email templates
- [ ] Add email tracking and analytics
- [ ] Implement email fallback handling

#### **Chunk 4.2: Frontend Components**
- [ ] Create invitation management UI
- [ ] Implement invitation acceptance flow
- [ ] Add invitation status display
- [ ] Create bulk invitation interface

#### **Chunk 4.3: User Onboarding Flow**
- [ ] Create invitation acceptance page
- [ ] Implement profile completion wizard
- [ ] Add role assignment interface
- [ ] Create onboarding progress tracking

## 🔧 **IMPLEMENTATION APPROACH**

### **1. Database Schema Updates**
```prisma
// Add to schema.prisma
enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
  DECLINED
}

model UserInvitation {
  id          String           @id @unique @default(uuid())
  email       String
  firstName   String?
  lastName    String?
  role        UserRole
  clientId    String
  client      Client           @relation(fields: [clientId], references: [id])
  
  // Invitation details
  token       String           @unique
  status      InvitationStatus @default(PENDING)
  expiresAt   DateTime
  acceptedAt  DateTime?
  revokedAt   DateTime?
  
  // Inviter information
  invitedBy   String
  inviter     User             @relation("Inviter", fields: [invitedBy], references: [id])
  
  // Email tracking
  emailSentAt DateTime?
  emailSentCount Int           @default(0)
  lastEmailSentAt DateTime?
  
  // Metadata
  message     String?          // Custom invitation message
  permissions String[]          // Specific permissions to grant
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@map("user_invitations")
  @@index([token])
  @@index([email])
  @@index([clientId])
  @@index([status])
  @@index([expiresAt])
}

// Update User model
model User {
  // ... existing fields ...
  
  // Add invitation relationship
  invitationsSent UserInvitation[] @relation("Inviter")
  
  // ... rest of existing fields ...
}
```

### **2. Invitation Service Implementation**
```typescript
@Injectable()
export class InvitationService {
  constructor(
    private prismaService: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async createInvitation(createInvitationDto: CreateInvitationDto): Promise<UserInvitation> {
    const { email, role, clientId, invitedBy, message, permissions } = createInvitationDto;
    
    // Validate client exists and user has permission to invite
    await this.validateInvitationPermissions(invitedBy, clientId);
    
    // Check if user already exists
    const existingUser = await this.prismaService.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    // Generate secure invitation token
    const token = this.generateInvitationToken();
    const expiresAt = this.calculateExpirationDate();
    
    // Create invitation
    const invitation = await this.prismaService.userInvitation.create({
      data: {
        email,
        role,
        clientId,
        invitedBy,
        token,
        expiresAt,
        message,
        permissions,
      }
    });
    
    // Send invitation email
    await this.sendInvitationEmail(invitation);
    
    return invitation;
  }

  async acceptInvitation(token: string, acceptInvitationDto: AcceptInvitationDto): Promise<User> {
    const invitation = await this.validateInvitationToken(token);
    
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation is not pending');
    }
    
    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }
    
    // Create user account
    const user = await this.prismaService.user.create({
      data: {
        email: invitation.email,
        firstName: acceptInvitationDto.firstName,
        lastName: acceptInvitationDto.lastName,
        password: await this.hashPassword(acceptInvitationDto.password),
        role: invitation.role,
        clientId: invitation.clientId,
        accountStatus: AccountStatus.ACTIVE,
        emailVerified: true,
      }
    });
    
    // Update invitation status
    await this.prismaService.userInvitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      }
    });
    
    // Assign permissions if specified
    if (invitation.permissions.length > 0) {
      await this.assignUserPermissions(user.id, invitation.permissions);
    }
    
    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);
    
    return user;
  }

  async resendInvitation(invitationId: string, invitedBy: string): Promise<void> {
    const invitation = await this.prismaService.userInvitation.findUnique({
      where: { id: invitationId }
    });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only resend pending invitations');
    }
    
    // Check rate limiting
    await this.checkResendRateLimit(invitation);
    
    // Update invitation
    await this.prismaService.userInvitation.update({
      where: { id: invitationId },
      data: {
        emailSentCount: { increment: 1 },
        lastEmailSentAt: new Date(),
      }
    });
    
    // Resend email
    await this.sendInvitationEmail(invitation);
  }

  async revokeInvitation(invitationId: string, revokedBy: string): Promise<void> {
    const invitation = await this.prismaService.userInvitation.findUnique({
      where: { id: invitationId }
    });
    
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Can only revoke pending invitations');
    }
    
    // Update invitation
    await this.prismaService.userInvitation.update({
      where: { id: invitationId },
      data: {
        status: InvitationStatus.REVOKED,
        revokedAt: new Date(),
      }
    });
    
    // Send revocation notification
    await this.emailService.sendInvitationRevokedEmail(invitation.email);
  }

  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private calculateExpirationDate(): Date {
    const expirationDays = this.configService.get('INVITATION_EXPIRATION_DAYS', 7);
    return new Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000));
  }

  private async validateInvitationToken(token: string): Promise<UserInvitation> {
    const invitation = await this.prismaService.userInvitation.findUnique({
      where: { token }
    });
    
    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }
    
    return invitation;
  }
}
```

### **3. API Endpoints**
```typescript
@Controller('api/v1/invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req: any
  ): Promise<UserInvitation> {
    return this.invitationService.createInvitation({
      ...createInvitationDto,
      invitedBy: req.user.id,
    });
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async createBulkInvitations(
    @Body() bulkInvitationDto: BulkInvitationDto,
    @Request() req: any
  ): Promise<BulkInvitationResult> {
    return this.invitationService.createBulkInvitations({
      ...bulkInvitationDto,
      invitedBy: req.user.id,
    });
  }

  @Post(':token/accept')
  async acceptInvitation(
    @Param('token') token: string,
    @Body() acceptInvitationDto: AcceptInvitationDto
  ): Promise<User> {
    return this.invitationService.acceptInvitation(token, acceptInvitationDto);
  }

  @Post(':id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async resendInvitation(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return this.invitationService.resendInvitation(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async revokeInvitation(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return this.invitationService.revokeInvitation(id, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async getInvitations(
    @Query() query: GetInvitationsQueryDto,
    @Request() req: any
  ): Promise<PaginatedInvitationsResult> {
    return this.invitationService.getInvitations(query, req.user.clientId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async getInvitation(@Param('id') id: string): Promise<UserInvitation> {
    return this.invitationService.getInvitation(id);
  }
}
```

### **4. Email Templates**
```handlebars
<!-- invitation-email.hbs -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .header { background-color: {{client.primaryColor}}; }
    .footer { background-color: {{client.secondaryColor}}; }
  </style>
</head>
<body>
  <div class="header">
    {{#if client.logoUrl}}
      <img src="{{client.logoUrl}}" alt="{{client.client.name}}" />
    {{else}}
      <h1>{{client.client.name}}</h1>
    {{/if}}
  </div>
  
  <div class="content">
    <h2>You're Invited to Join {{client.client.name}}</h2>
    <p>Hello {{invitation.firstName}},</p>
    <p>You've been invited to join {{client.client.name}} on the Identhor platform.</p>
    
    {{#if invitation.message}}
      <div class="message">
        <p><strong>Message from inviter:</strong></p>
        <p>{{invitation.message}}</p>
      </div>
    {{/if}}
    
    <p>Click the button below to accept your invitation:</p>
    <a href="{{acceptUrl}}" class="button">Accept Invitation</a>
    
    <p><strong>This invitation expires on:</strong> {{formatDate invitation.expiresAt}}</p>
  </div>
  
  <div class="footer">
    <p>Powered by Identhor</p>
  </div>
</body>
</html>
```

## 📋 **DELIVERABLES BY PHASE**

### **Phase 1 Deliverables**
- ✅ Database schema updated with invitation models
- ✅ Prisma migrations created and applied
- ✅ Invitation entities and DTOs created
- ✅ Repository layer implemented

### **Phase 2 Deliverables**
- ✅ Invitation service with business logic
- ✅ Secure token generation and validation
- ✅ Role and permission assignment working
- ✅ Invitation expiration handling

### **Phase 3 Deliverables**
- ✅ Complete invitation API endpoints
- ✅ Validation and security implemented
- ✅ Integration endpoints functional
- ✅ Audit logging operational

### **Phase 4 Deliverables**
- ✅ Email integration complete
- ✅ Frontend invitation components working
- ✅ User onboarding flow functional
- ✅ End-to-end invitation process working

## 🚨 **CRITICAL SUCCESS FACTORS**

### **1. Security**
- **Must validate**: Invitation permissions
- **Must secure**: Invitation tokens
- **Must handle**: Token expiration properly
- **Must audit**: All invitation actions

### **2. User Experience**
- **Must provide**: Clear invitation process
- **Must support**: Bulk invitations
- **Must handle**: Invitation resending
- **Must track**: Onboarding progress

### **3. Integration**
- **Must integrate**: With email system
- **Must support**: Role assignment
- **Must handle**: Client scoping
- **Must validate**: User permissions

### **4. Performance**
- **Must handle**: High invitation volumes
- **Must support**: Bulk operations
- **Must optimize**: Database queries
- **Must cache**: Frequently accessed data

## 🔍 **TESTING STRATEGY**

### **Unit Testing**
- Invitation service methods
- Token generation and validation
- Role assignment logic
- Email template rendering

### **Integration Testing**
- API endpoint functionality
- Database operations
- Email sending
- Permission validation

### **End-to-End Testing**
- Complete invitation flow
- User onboarding process
- Bulk invitation operations
- Invitation management

## 📚 **RESOURCES & REFERENCES**

### **Primary Documentation**
- **NestJS Documentation**: [NestJS Official Docs](https://nestjs.com/)
- **Prisma Documentation**: [Prisma Docs](https://www.prisma.io/docs/)
- **Email Templates**: Create in `/apps/backend/src/modules/auth/infrastructure/email/templates/`

### **Implementation Patterns**
- **Service Layer**: Follow existing service patterns in auth module
- **Repository Pattern**: Use Prisma for data access
- **Validation**: Use class-validator and class-transformer
- **Error Handling**: Follow NestJS exception patterns

### **Key Integration Points**
- **Email Service**: Integrate with SendGrid email service
- **User Management**: Connect with existing user system
- **Role Management**: Integrate with RBAC system
- **Client Management**: Connect with multi-tenant architecture

## 🎯 **SUCCESS METRICS**

### **Functional Requirements**
- ✅ Invitation creation and management working
- ✅ Token generation and validation secure
- ✅ Email delivery functional
- ✅ User onboarding complete

### **Performance Requirements**
- ✅ Invitation creation < 1 second
- ✅ Token validation < 100ms
- ✅ Bulk operations < 5 seconds
- ✅ Email sending < 2 seconds

### **Quality Requirements**
- ✅ Secure token generation
- ✅ Proper permission validation
- ✅ Comprehensive audit logging
- ✅ Rate limiting implemented

## 🚀 **NEXT STEPS FOR AI AGENT**

1. **Start with Phase 1, Chunk 1.1**: Update database schema
2. **Focus on security**: Implement secure token generation
3. **Build service layer**: Create robust invitation business logic
4. **Implement API endpoints**: Create RESTful invitation management
5. **Integrate with email**: Connect with SendGrid email service
6. **Add frontend components**: Create invitation management UI
7. **Test user flows**: Validate complete invitation process
8. **Document everything**: Create API and integration guides

This task creates a comprehensive user invitation system that supports multi-tenant organizations, secure token management, and seamless user onboarding integration with the KYC attestation platform. - **Started**: Sun Aug 31 08:45:53 PDT 2025
- **Last Update**: Sat Sep  6 07:29:56 PDT 2025 - Completed and moved to review
- **Completed**: Sat Sep  6 07:29:56 PDT 2025
- [Date] - Moved to review/
