# Task: Persona KYC Integration Service

## Meta Information
- **Task ID**: P0-ATT-001
- **Epic**: On-Chain Identity & Attestation
- **Priority**: P0 (Critical)
- **Estimate**: M (1-2 weeks)
- **Sprint**: Sprint 2
- **Assignee**: AI Developer

## Dependencies
- [ ] P0-INF-001: Authentication & Authorization System (needs JWT authentication)
- [ ] P0-INF-002: API Gateway & Security Middleware (needs API infrastructure)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Existing Modules**: Auth module at `/apps/backend/src/modules/auth/`
- **KYC Module**: Basic structure at `/apps/backend/src/modules/kyc/`

**Related Files**: 
- Reference: `/apps/backend/src/modules/kyc/` (existing module structure)
- Pattern: `/apps/backend/src/modules/auth/` (similar service patterns)
- Database: `/apps/backend/prisma/schema.prisma` (KycVerification model)
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md` section 7 (Event Streaming)

## Objective
Implement complete Persona KYC integration including inquiry creation, webhook processing, status tracking, and real-time updates for identity verification within the KYC attestation platform.

## Detailed Implementation Instructions

### Step 1: Install Persona SDK and Dependencies
**Action**: Install required packages for Persona integration

```bash
npm install persona-node-client
npm install --save-dev @types/persona-node-client
```

### Step 2: Create Persona Service
**File**: `/apps/backend/src/modules/kyc/infrastructure/services/persona.service.ts`
**Action**: Create comprehensive Persona integration service

```typescript
import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as PersonaClient } from 'persona-node-client';
import { PrismaService } from '../../../../database/prisma.service';
import { KycStatus } from '@prisma/client';

export interface PersonaInquiry {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  reviewedAt?: string;
  profileId?: string;
  accountId: string;
}

export interface PersonaWebhookEvent {
  type: string;
  id: string;
  data: {
    type: string;
    id: string;
    attributes: Record<string, any>;
  };
}

export interface CreateInquiryRequest {
  userId: string;
  redirectUri?: string;
  referenceId?: string;
}

export interface InquiryResult {
  inquiryId: string;
  sessionToken: string;
  url: string;
  status: string;
}

@Injectable()
export class PersonaService {
  private readonly logger = new Logger(PersonaService.name);
  private readonly personaClient: PersonaClient;
  private readonly templateId: string;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('PERSONA_API_KEY');
    const environment = this.configService.get<string>('PERSONA_ENVIRONMENT') || 'sandbox';
    
    if (!apiKey) {
      throw new Error('PERSONA_API_KEY is required');
    }

    this.personaClient = new PersonaClient({
      apiKey,
      environment: environment as 'production' | 'sandbox',
    });

    this.templateId = this.configService.get<string>('PERSONA_TEMPLATE_ID') || 'tmpl_default';
    this.baseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';
  }

  /**
   * Create a new KYC inquiry for a user
   */
  async createInquiry(request: CreateInquiryRequest): Promise<InquiryResult> {
    try {
      this.logger.log(`Creating Persona inquiry for user: ${request.userId}`);

      // Check if user already has an active inquiry
      const existingKyc = await this.prismaService.kycVerification.findFirst({
        where: {
          userId: request.userId,
          status: {
            in: [KycStatus.PENDING, KycStatus.IN_PROGRESS],
          },
        },
      });

      if (existingKyc) {
        throw new BadRequestException('User already has an active KYC verification in progress');
      }

      // Create inquiry with Persona
      const inquiry = await this.personaClient.inquiries.create({
        data: {
          type: 'inquiry',
          attributes: {
            'inquiry-template-id': this.templateId,
            'reference-id': request.referenceId || request.userId,
            'redirect-uri': request.redirectUri || `${this.baseUrl}/kyc/complete`,
            'account-id': this.configService.get<string>('PERSONA_ACCOUNT_ID'),
          },
        },
      });

      // Store inquiry in database
      const kycRecord = await this.prismaService.kycVerification.create({
        data: {
          userId: request.userId,
          provider: 'PERSONA',
          externalId: inquiry.data.id,
          status: KycStatus.PENDING,
          inquiryData: inquiry.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Created Persona inquiry: ${inquiry.data.id} for user: ${request.userId}`);

      return {
        inquiryId: inquiry.data.id,
        sessionToken: inquiry.data.attributes['session-token'],
        url: inquiry.data.attributes.url,
        status: inquiry.data.attributes.status,
      };
    } catch (error) {
      this.logger.error(`Failed to create Persona inquiry: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create KYC inquiry');
    }
  }

  /**
   * Retrieve inquiry status from Persona
   */
  async getInquiryStatus(inquiryId: string): Promise<PersonaInquiry> {
    try {
      const inquiry = await this.personaClient.inquiries.retrieve(inquiryId);
      
      return {
        id: inquiry.data.id,
        type: inquiry.data.type,
        status: inquiry.data.attributes.status,
        createdAt: inquiry.data.attributes['created-at'],
        completedAt: inquiry.data.attributes['completed-at'],
        reviewedAt: inquiry.data.attributes['reviewed-at'],
        profileId: inquiry.data.relationships?.profile?.data?.id,
        accountId: inquiry.data.attributes['account-id'],
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve Persona inquiry: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve inquiry status');
    }
  }

  /**
   * Process Persona webhook events
   */
  async processWebhookEvent(event: PersonaWebhookEvent): Promise<void> {
    try {
      this.logger.log(`Processing Persona webhook event: ${event.type} for ${event.data.id}`);

      switch (event.type) {
        case 'inquiry.started':
          await this.handleInquiryStarted(event);
          break;
        case 'inquiry.completed':
          await this.handleInquiryCompleted(event);
          break;
        case 'inquiry.approved':
          await this.handleInquiryApproved(event);
          break;
        case 'inquiry.declined':
          await this.handleInquiryDeclined(event);
          break;
        case 'inquiry.requires_review':
          await this.handleInquiryRequiresReview(event);
          break;
        default:
          this.logger.warn(`Unhandled Persona webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process Persona webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleInquiryStarted(event: PersonaWebhookEvent): Promise<void> {
    const inquiryId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: inquiryId },
      data: {
        status: KycStatus.IN_PROGRESS,
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Updated inquiry ${inquiryId} status to IN_PROGRESS`);
  }

  private async handleInquiryCompleted(event: PersonaWebhookEvent): Promise<void> {
    const inquiryId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: inquiryId },
      data: {
        status: KycStatus.UNDER_REVIEW,
        inquiryData: event.data,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Updated inquiry ${inquiryId} status to UNDER_REVIEW`);
  }

  private async handleInquiryApproved(event: PersonaWebhookEvent): Promise<void> {
    const inquiryId = event.data.id;
    
    // Update KYC record
    const kycRecord = await this.prismaService.kycVerification.updateMany({
      where: { externalId: inquiryId },
      data: {
        status: KycStatus.APPROVED,
        verifiedAt: new Date(),
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    // TODO: Trigger attestation creation workflow
    // This will be implemented in a later task (P0-ATT-005)
    
    this.logger.log(`KYC approved for inquiry ${inquiryId}`);
  }

  private async handleInquiryDeclined(event: PersonaWebhookEvent): Promise<void> {
    const inquiryId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: inquiryId },
      data: {
        status: KycStatus.REJECTED,
        rejectedAt: new Date(),
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`KYC declined for inquiry ${inquiryId}`);
  }

  private async handleInquiryRequiresReview(event: PersonaWebhookEvent): Promise<void> {
    const inquiryId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: inquiryId },
      data: {
        status: KycStatus.MANUAL_REVIEW,
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`KYC requires manual review for inquiry ${inquiryId}`);
  }

  /**
   * Get KYC verification status for a user
   */
  async getUserKycStatus(userId: string) {
    const kycRecord = await this.prismaService.kycVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!kycRecord) {
      return null;
    }

    // Sync with Persona if status is still pending/in-progress
    if ([KycStatus.PENDING, KycStatus.IN_PROGRESS, KycStatus.UNDER_REVIEW].includes(kycRecord.status)) {
      try {
        const personaStatus = await this.getInquiryStatus(kycRecord.externalId);
        
        // Update local status if it differs
        if (this.mapPersonaStatusToKycStatus(personaStatus.status) !== kycRecord.status) {
          await this.syncInquiryStatus(kycRecord.externalId);
          
          // Refetch the updated record
          return await this.prismaService.kycVerification.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to sync KYC status for user ${userId}: ${error.message}`);
      }
    }

    return kycRecord;
  }

  private async syncInquiryStatus(inquiryId: string): Promise<void> {
    try {
      const personaInquiry = await this.getInquiryStatus(inquiryId);
      const kycStatus = this.mapPersonaStatusToKycStatus(personaInquiry.status);

      await this.prismaService.kycVerification.updateMany({
        where: { externalId: inquiryId },
        data: {
          status: kycStatus,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Synced inquiry ${inquiryId} status to ${kycStatus}`);
    } catch (error) {
      this.logger.error(`Failed to sync inquiry status: ${error.message}`);
      throw error;
    }
  }

  private mapPersonaStatusToKycStatus(personaStatus: string): KycStatus {
    switch (personaStatus) {
      case 'created':
      case 'pending':
        return KycStatus.PENDING;
      case 'started':
      case 'in_progress':
        return KycStatus.IN_PROGRESS;
      case 'completed':
        return KycStatus.UNDER_REVIEW;
      case 'approved':
        return KycStatus.APPROVED;
      case 'declined':
      case 'failed':
        return KycStatus.REJECTED;
      case 'requires_review':
        return KycStatus.MANUAL_REVIEW;
      default:
        return KycStatus.PENDING;
    }
  }

  /**
   * Validate webhook signature for security
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>('PERSONA_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.warn('PERSONA_WEBHOOK_SECRET not configured, skipping validation');
        return true; // In development, allow without validation
      }

      // Implement HMAC signature validation
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      this.logger.error(`Webhook signature validation failed: ${error.message}`);
      return false;
    }
  }
}
```

### Step 3: Create KYC Controller
**File**: `/apps/backend/src/modules/kyc/presentation/controllers/kyc.controller.ts`
**Action**: Create KYC API endpoints

```typescript
import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  Body, 
  Headers, 
  HttpCode, 
  HttpStatus,
  UnauthorizedException,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PersonaService, CreateInquiryRequest, PersonaWebhookEvent } from '../../infrastructure/services/persona.service';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

export class CreateInquiryDto {
  redirectUri?: string;
  referenceId?: string;
}

export class KycStatusResponse {
  id: string;
  status: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
}

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private readonly personaService: PersonaService) {}

  @Post('inquiry')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new KYC inquiry' })
  @ApiResponse({ status: 201, description: 'Inquiry created successfully' })
  async createInquiry(@Request() req: any, @Body() body: CreateInquiryDto) {
    const userId = req.user.id;
    
    const request: CreateInquiryRequest = {
      userId,
      redirectUri: body.redirectUri,
      referenceId: body.referenceId,
    };

    return await this.personaService.createInquiry(request);
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user KYC status' })
  @ApiResponse({ status: 200, description: 'KYC status retrieved successfully' })
  async getKycStatus(@Request() req: any): Promise<KycStatusResponse | null> {
    const userId = req.user.id;
    
    const kycRecord = await this.personaService.getUserKycStatus(userId);
    
    if (!kycRecord) {
      return null;
    }

    return {
      id: kycRecord.id,
      status: kycRecord.status,
      provider: kycRecord.provider,
      createdAt: kycRecord.createdAt,
      updatedAt: kycRecord.updatedAt,
      verifiedAt: kycRecord.verifiedAt,
      rejectedAt: kycRecord.rejectedAt,
    };
  }

  @Get('status/:userId')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.COMPLIANCE_OFFICER)
  @ApiOperation({ summary: 'Get KYC status for specific user (admin only)' })
  @ApiResponse({ status: 200, description: 'KYC status retrieved successfully' })
  async getUserKycStatus(@Param('userId') userId: string): Promise<KycStatusResponse | null> {
    const kycRecord = await this.personaService.getUserKycStatus(userId);
    
    if (!kycRecord) {
      return null;
    }

    return {
      id: kycRecord.id,
      status: kycRecord.status,
      provider: kycRecord.provider,
      createdAt: kycRecord.createdAt,
      updatedAt: kycRecord.updatedAt,
      verifiedAt: kycRecord.verifiedAt,
      rejectedAt: kycRecord.rejectedAt,
    };
  }

  @Post('webhook/persona')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Persona webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePersonaWebhook(
    @Body() event: PersonaWebhookEvent,
    @Headers('persona-signature') signature: string,
  ) {
    // Validate webhook signature
    const payload = JSON.stringify(event);
    const isValidSignature = this.personaService.validateWebhookSignature(payload, signature);
    
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    await this.personaService.processWebhookEvent(event);
    
    return { success: true };
  }
}
```

### Step 4: Create KYC DTOs
**File**: `/apps/backend/src/modules/kyc/presentation/dto/kyc.dto.ts`
**Action**: Create data transfer objects for KYC operations

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateInquiryDto {
  @ApiProperty({ 
    description: 'Redirect URI after KYC completion',
    example: 'https://app.example.com/kyc/complete',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  redirectUri?: string;

  @ApiProperty({ 
    description: 'Reference ID for tracking',
    example: 'user-123-kyc',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}

export class KycStatusDto {
  @ApiProperty({ description: 'KYC record ID' })
  id: string;

  @ApiProperty({ description: 'KYC verification status' })
  status: string;

  @ApiProperty({ description: 'KYC provider name' })
  provider: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Verification timestamp', required: false })
  verifiedAt?: Date;

  @ApiProperty({ description: 'Rejection timestamp', required: false })
  rejectedAt?: Date;
}

export class PersonaWebhookDto {
  @ApiProperty({ description: 'Event type' })
  type: string;

  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Event data' })
  data: {
    type: string;
    id: string;
    attributes: Record<string, any>;
  };
}
```

### Step 5: Update KYC Module
**File**: `/apps/backend/src/modules/kyc/kyc.module.ts`
**Action**: Configure KYC module with all services and controllers

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { PersonaService } from './infrastructure/services/persona.service';
import { KycController } from './presentation/controllers/kyc.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [KycController],
  providers: [PersonaService],
  exports: [PersonaService],
})
export class KycModule {}
```

### Step 6: Update Main Backend Module
**File**: `/apps/backend/src/backend.module.ts`
**Action**: Add KYC module to main application

```typescript
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { KycModule } from './modules/kyc/kyc.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { DatabaseModule } from './database/database.module';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { createRateLimitConfig } from './shared/config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createRateLimitConfig,
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    KycModule,
    BlockchainModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class BackendModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
```

### Step 7: Create Environment Configuration
**File**: `/.env.example`
**Action**: Add Persona configuration variables

```env
# Persona Configuration
PERSONA_API_KEY=your_persona_api_key_here
PERSONA_ENVIRONMENT=sandbox
PERSONA_TEMPLATE_ID=tmpl_your_template_id
PERSONA_ACCOUNT_ID=your_account_id
PERSONA_WEBHOOK_SECRET=your_webhook_secret

# Application
APP_BASE_URL=http://localhost:3000
```

### Step 8: Create KYC Service Unit Tests
**File**: `/apps/backend/src/modules/kyc/infrastructure/services/persona.service.spec.ts`
**Action**: Create comprehensive unit tests

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PersonaService } from './persona.service';
import { PrismaService } from '../../../../database/prisma.service';
import { KycStatus } from '@prisma/client';

describe('PersonaService', () => {
  let service: PersonaService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        PERSONA_API_KEY: 'test-api-key',
        PERSONA_ENVIRONMENT: 'sandbox',
        PERSONA_TEMPLATE_ID: 'tmpl_test',
        APP_BASE_URL: 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    kycVerification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonaService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PersonaService>(PersonaService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInquiry', () => {
    it('should create a new inquiry when user has no active KYC', async () => {
      mockPrismaService.kycVerification.findFirst.mockResolvedValue(null);
      mockPrismaService.kycVerification.create.mockResolvedValue({
        id: 'kyc-123',
        userId: 'user-123',
        status: KycStatus.PENDING,
      });

      // Mock Persona client response would go here
      // For now, test will need Persona client mocking

      const request = {
        userId: 'user-123',
        redirectUri: 'http://localhost:3000/complete',
      };

      // This test would need proper Persona client mocking
      // await expect(service.createInquiry(request)).resolves.toBeDefined();
    });

    it('should throw error when user has active KYC', async () => {
      mockPrismaService.kycVerification.findFirst.mockResolvedValue({
        id: 'kyc-123',
        status: KycStatus.PENDING,
      });

      const request = {
        userId: 'user-123',
      };

      await expect(service.createInquiry(request)).rejects.toThrow();
    });
  });
});
```

## Acceptance Criteria
- [ ] **Functional**: Can create Persona inquiries and receive session tokens
- [ ] **Technical**: Webhook processing updates KYC status correctly
- [ ] **Integration**: API endpoints work with authentication system
- [ ] **Testing**: Unit tests cover service logic and error cases
- [ ] **Documentation**: API endpoints documented with Swagger

## Verification Steps
1. **Run Tests**: `npm run test` passes for KYC module
2. **Type Check**: `npm run build` completes successfully
3. **API Testing**: Can create inquiry via POST `/api/v1/kyc/inquiry`
4. **Webhook Testing**: Persona webhooks update database correctly
5. **Status Sync**: KYC status syncs between Persona and local database
6. **Error Handling**: Invalid requests return appropriate error responses

## Expected Deliverables
- [ ] Complete Persona service with inquiry management
- [ ] KYC controller with secure API endpoints
- [ ] Webhook processing for real-time status updates
- [ ] Database integration with status tracking
- [ ] Unit tests with good coverage
- [ ] API documentation with Swagger

## Error Handling Requirements
- Use appropriate HTTP status codes for different error types
- Add comprehensive logging for debugging KYC issues
- Implement retry logic for Persona API failures
- Validate webhook signatures for security
- Handle rate limiting and API quota issues

## References
- **Architecture**: `/docs/TECHNICAL_SPECIFICATIONS.md` Section 7
- **Database Schema**: `/apps/backend/prisma/schema.prisma` (KycVerification model)
- **Persona API**: https://docs.withpersona.com/docs/api-reference
- **Cursor Rules**: `/.cursorrules` (NestJS patterns and KYC compliance)

## Notes for AI
- Use exact file paths from project root
- Follow NestJS service and controller patterns exactly
- Implement proper error handling for external API integration
- Add comprehensive logging for KYC operations
- Test webhook signature validation thoroughly
- Ensure no PII is logged in production

## Progress Log
- **Created**: 2024-01-15
- **Started**: 
- **Last Update**: 
- **Completed**: 

## Status History
- 2024-01-15 - Created in todo/ - **Started**: Sun Aug 17 12:49:07 PDT 2025
- **Last Update**: Sun Aug 17 12:49:07 PDT 2025 - Started implementation
