import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';
import { KycStatus } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface IdenfyVerification {
  id: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  reviewedAt?: string;
  profileId?: string;
  accountId: string;
}

export interface IdenfyWebhookEvent {
  type: string;
  id: string;
  data: {
    type: string;
    id: string;
    attributes: Record<string, any>;
  };
}

export interface CreateVerificationRequest {
  userId: string;
  redirectUri?: string;
  referenceId?: string;
}

export interface VerificationResult {
  verificationId: string;
  sessionToken: string;
  url: string;
  status: string;
}

@Injectable()
export class IdenfyService {
  private readonly logger = new Logger(IdenfyService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly appBaseUrl: string;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('IDENFY_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('IDENFY_API_SECRET') || '';
    const environment = this.configService.get<string>('IDENFY_ENVIRONMENT') || 'sandbox';
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('IDENFY_API_KEY and IDENFY_API_SECRET are required');
    }

    // Set base URL based on environment
    this.baseUrl = environment === 'production' 
      ? 'https://ivs.idenfy.com/api/v2'
      : 'https://ivs.test.idenfy.com/api/v2';

    this.appBaseUrl = this.configService.get<string>('APP_BASE_URL') || 'http://localhost:3000';

    // Create HTTP client with authentication
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      auth: {
        username: this.apiKey,
        password: this.apiSecret,
      },
    });

    // Add request/response interceptors for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error(`Request error: ${error.message}`);
        return Promise.reject(error);
      }
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Response received: ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        this.logger.error(`Response error: ${error.response?.status} - ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new KYC verification for a user
   */
  async createVerification(request: CreateVerificationRequest): Promise<VerificationResult> {
    try {
      this.logger.log(`Creating Idenfy verification for user: ${request.userId}`);

      // First find the user's profile
      const user = await this.prismaService.user.findUnique({
        where: { id: request.userId },
        include: { profiles: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // For now, use the first profile or create one if none exists
      let profile = user.profiles[0];
      if (!profile) {
        // Create a profile for the user if none exists
        profile = await this.prismaService.profile.create({
          data: {
            id: crypto.randomUUID(),
            clientId: user.clientId,
            userId: user.id,
          },
        });
      }

      // Check if profile already has an active verification
      const existingKyc = await this.prismaService.kycVerification.findFirst({
        where: {
          profileId: profile.id,
          status: {
            in: [KycStatus.PENDING, KycStatus.IN_PROGRESS],
          },
        },
      });

      if (existingKyc) {
        throw new BadRequestException('User already has an active KYC verification in progress');
      }

      // Create verification token request payload
      const tokenPayload = {
        clientId: request.referenceId || request.userId,
        successUrl: request.redirectUri || `${this.appBaseUrl}/kyc/complete?status=success`,
        errorUrl: request.redirectUri || `${this.appBaseUrl}/kyc/complete?status=error`,
        unverifiedUrl: request.redirectUri || `${this.appBaseUrl}/kyc/complete?status=unverified`,
        locale: 'en',
        tokenType: 'TEMPORARY',
        durationHours: 1, // Token valid for 1 hour
      };

      // Create verification session with Idenfy
      const response = await this.httpClient.post('/token', tokenPayload);
      
      const verificationData = response.data;

      // Store verification in database
      const kycRecord = await this.prismaService.kycVerification.create({
        data: {
          id: crypto.randomUUID(),
          providerId: verificationData.scanRef || verificationData.authToken,
          externalId: verificationData.scanRef,
          provider: 'idenfy',
          status: KycStatus.PENDING,
          lastCheckedAt: new Date(),
          webhookReceived: false,
          profileId: profile.id,
        },
      });

      this.logger.log(`Created Idenfy verification: ${verificationData.scanRef} for user: ${request.userId}`);

      return {
        verificationId: verificationData.scanRef || verificationData.authToken,
        sessionToken: verificationData.authToken,
        url: verificationData.clientRedirectUrl || `${this.baseUrl.replace('/api/v2', '')}/api/v2/redirect?token=${verificationData.authToken}`,
        status: 'created',
      };
    } catch (error) {
      this.logger.error(`Failed to create Idenfy verification: ${error.message}`, error.stack);
      
      if (error.response?.status === 400) {
        throw new BadRequestException(`Invalid request: ${error.response.data?.message || error.message}`);
      }
      
      throw new InternalServerErrorException('Failed to create KYC verification');
    }
  }

  /**
   * Retrieve verification status from Idenfy
   */
  async getVerificationStatus(verificationId: string): Promise<IdenfyVerification> {
    try {
      const response = await this.httpClient.get(`/status/${verificationId}`);
      
      const data = response.data;
      
      return {
        id: data.scanRef || verificationId,
        status: data.overall || data.status,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
        reviewedAt: data.reviewedAt,
        profileId: data.clientId,
        accountId: data.accountId || this.apiKey,
      };
    } catch (error) {
      this.logger.error(`Failed to retrieve Idenfy verification: ${error.message}`);
      
      if (error.response?.status === 404) {
        throw new BadRequestException('Verification not found');
      }
      
      throw new InternalServerErrorException('Failed to retrieve verification status');
    }
  }

  /**
   * Process Idenfy webhook events
   */
  async processWebhookEvent(event: IdenfyWebhookEvent): Promise<void> {
    try {
      this.logger.log(`Processing Idenfy webhook event: ${event.type} for ${event.data.id}`);

      switch (event.type) {
        case 'verification.started':
        case 'VERIFICATION_STARTED':
          await this.handleVerificationStarted(event);
          break;
        case 'verification.completed':
        case 'VERIFICATION_COMPLETED':
          await this.handleVerificationCompleted(event);
          break;
        case 'verification.approved':
        case 'VERIFICATION_APPROVED':
          await this.handleVerificationApproved(event);
          break;
        case 'verification.declined':
        case 'VERIFICATION_DECLINED':
          await this.handleVerificationDeclined(event);
          break;
        case 'verification.requires_review':
        case 'VERIFICATION_REQUIRES_REVIEW':
          await this.handleVerificationRequiresReview(event);
          break;
        default:
          this.logger.warn(`Unhandled Idenfy webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process Idenfy webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handleVerificationStarted(event: IdenfyWebhookEvent): Promise<void> {
    const verificationId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: verificationId },
      data: {
        status: KycStatus.IN_PROGRESS,
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Updated verification ${verificationId} status to IN_PROGRESS`);
  }

  private async handleVerificationCompleted(event: IdenfyWebhookEvent): Promise<void> {
    const verificationId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: verificationId },
      data: {
        status: KycStatus.UNDER_REVIEW,
        inquiryData: event.data,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Updated verification ${verificationId} status to UNDER_REVIEW`);
  }

  private async handleVerificationApproved(event: IdenfyWebhookEvent): Promise<void> {
    const verificationId = event.data.id;
    
    // Update KYC record
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: verificationId },
      data: {
        status: KycStatus.APPROVED,
        verifiedAt: new Date(),
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    // TODO: Trigger attestation creation workflow
    // This will be implemented in a later task (P0-ATT-005)
    
    this.logger.log(`KYC approved for verification ${verificationId}`);
  }

  private async handleVerificationDeclined(event: IdenfyWebhookEvent): Promise<void> {
    const verificationId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: verificationId },
      data: {
        status: KycStatus.REJECTED,
        rejectedAt: new Date(),
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`KYC declined for verification ${verificationId}`);
  }

  private async handleVerificationRequiresReview(event: IdenfyWebhookEvent): Promise<void> {
    const verificationId = event.data.id;
    
    await this.prismaService.kycVerification.updateMany({
      where: { externalId: verificationId },
      data: {
        status: KycStatus.MANUAL_REVIEW,
        inquiryData: event.data,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`KYC requires manual review for verification ${verificationId}`);
  }

  /**
   * Get KYC verification status for a user
   */
  async getUserKycStatus(userId: string) {
    // First find the user's profile
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { 
        profiles: {
          include: {
            kycChecks: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!user || !user.profiles.length) {
      return null;
    }

    const kycRecord = user.profiles[0]?.kycChecks[0];
    if (!kycRecord) {
      return null;
    }

    // Sync with Idenfy if status is still pending/in-progress
    const syncableStatuses: KycStatus[] = [KycStatus.PENDING, KycStatus.IN_PROGRESS, KycStatus.UNDER_REVIEW, KycStatus.MANUAL_REVIEW];
    if (syncableStatuses.includes(kycRecord.status)) {
      try {
        const idenfyStatus = await this.getVerificationStatus(kycRecord.externalId);
        
        // Update local status if it differs
        const mappedStatus = this.mapIdenfyStatusToKycStatus(idenfyStatus.status);
        if (mappedStatus !== kycRecord.status) {
          await this.syncVerificationStatus(kycRecord.externalId);
          
          // Refetch the updated record
          const updatedUser = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { 
              profiles: {
                include: {
                  kycChecks: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          });
          return updatedUser?.profiles[0]?.kycChecks[0] || null;
        }
      } catch (error) {
        this.logger.warn(`Failed to sync KYC status for user ${userId}: ${error.message}`);
      }
    }

    return kycRecord;
  }

  private async syncVerificationStatus(verificationId: string): Promise<void> {
    try {
      const idenfyVerification = await this.getVerificationStatus(verificationId);
      const kycStatus = this.mapIdenfyStatusToKycStatus(idenfyVerification.status);

      await this.prismaService.kycVerification.updateMany({
        where: { externalId: verificationId },
        data: {
          status: kycStatus,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Synced verification ${verificationId} status to ${kycStatus}`);
    } catch (error) {
      this.logger.error(`Failed to sync verification status: ${error.message}`);
      throw error;
    }
  }

  private mapIdenfyStatusToKycStatus(idenfyStatus: string): KycStatus {
    const status = idenfyStatus?.toLowerCase();
    
    switch (status) {
      case 'created':
      case 'pending':
        return KycStatus.PENDING;
      case 'started':
      case 'in_progress':
      case 'waiting':
        return KycStatus.IN_PROGRESS;
      case 'completed':
      case 'reviewing':
        return KycStatus.UNDER_REVIEW;
      case 'approved':
      case 'passed':
        return KycStatus.APPROVED;
      case 'declined':
      case 'failed':
      case 'rejected':
        return KycStatus.REJECTED;
      case 'requires_review':
      case 'suspected':
        return KycStatus.MANUAL_REVIEW;
      default:
        this.logger.warn(`Unknown Idenfy status: ${idenfyStatus}, defaulting to PENDING`);
        return KycStatus.PENDING;
    }
  }

  /**
   * Validate webhook signature for security
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>('IDENFY_WEBHOOK_SECRET');
      if (!webhookSecret) {
        this.logger.warn('IDENFY_WEBHOOK_SECRET not configured, skipping validation');
        return true; // In development, allow without validation
      }

      // Implement HMAC signature validation
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      this.logger.error(`Webhook signature validation failed: ${error.message}`);
      return false;
    }
  }
} 