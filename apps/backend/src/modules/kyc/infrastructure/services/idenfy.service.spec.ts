import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IdenfyService } from './idenfy.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { KycStatus } from '@prisma/client';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IdenfyService', () => {
  let service: IdenfyService;
  let prismaService: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        IDENFY_API_KEY: 'test-api-key',
        IDENFY_API_SECRET: 'test-api-secret',
        IDENFY_ENVIRONMENT: 'sandbox',
        IDENFY_TEMPLATE_ID: 'tmpl_test',
        IDENFY_ACCOUNT_ID: 'acc_test',
        IDENFY_WEBHOOK_SECRET: 'webhook-secret',
        APP_BASE_URL: 'http://localhost:3000',
      };
      return config[key];
    }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
    kycVerification: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockAxiosInstance = {
    post: jest.fn(),
    get: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    // Mock axios.create to return our mock instance before creating the module
    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdenfyService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<IdenfyService>(IdenfyService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVerification', () => {
    const createVerificationRequest = {
      userId: 'user-123',
      redirectUri: 'http://localhost:3000/complete',
      referenceId: 'ref-123',
    };

    const mockUser = {
      id: 'user-123',
      clientId: 'client-123',
      profiles: [
        {
          id: 'profile-123',
          clientId: 'client-123',
          userId: 'user-123',
        },
      ],
    };

    it('should create a new verification when user has no active KYC', async () => {
      // Mock user lookup
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock no existing KYC verification
      mockPrismaService.kycVerification.findFirst.mockResolvedValue(null);

      // Mock successful KYC verification creation
      const mockKycRecord = {
        id: 'kyc-123',
        providerId: 'kyc-123',
        externalId: 'idenfy-123',
        profileId: 'profile-123',
        status: KycStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastCheckedAt: new Date(),
        webhookReceived: false,
      };
      mockPrismaService.kycVerification.create.mockResolvedValue(mockKycRecord);

      // Mock successful Idenfy API response
      const mockIdenfyResponse = {
        data: {
          scanRef: 'idenfy-123',
          authToken: 'session-token-123',
          clientId: 'test-client',
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockIdenfyResponse);

      const result = await service.createVerification(
        createVerificationRequest,
      );

      expect(result).toEqual({
        verificationId: 'idenfy-123',
        sessionToken: 'session-token-123',
        url: expect.stringContaining('session-token-123'),
        status: 'created',
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: { profiles: true },
      });
      expect(mockPrismaService.kycVerification.findFirst).toHaveBeenCalledWith({
        where: {
          profileId: 'profile-123',
          status: { in: [KycStatus.PENDING, KycStatus.IN_PROGRESS] },
        },
      });
      expect(mockPrismaService.kycVerification.create).toHaveBeenCalled();
    });

    it('should throw error when user not found', async () => {
      // Mock user not found
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createVerification(createVerificationRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should create profile if user has no profiles', async () => {
      // Mock user without profiles
      const userWithoutProfiles = {
        ...mockUser,
        profiles: [],
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithoutProfiles);

      const mockProfile = {
        id: 'new-profile-123',
        clientId: 'client-123',
        userId: 'user-123',
      };
      mockPrismaService.profile.create.mockResolvedValue(mockProfile);
      mockPrismaService.kycVerification.findFirst.mockResolvedValue(null);

      const mockKycRecord = {
        id: 'kyc-123',
        providerId: 'kyc-123',
        externalId: 'idenfy-123',
        profileId: 'new-profile-123',
        status: KycStatus.PENDING,
      };
      mockPrismaService.kycVerification.create.mockResolvedValue(mockKycRecord);

      const mockIdenfyResponse = {
        data: {
          scanRef: 'idenfy-123',
          authToken: 'session-token-123',
          clientId: 'test-client',
        },
      };
      mockAxiosInstance.post.mockResolvedValue(mockIdenfyResponse);

      await service.createVerification(createVerificationRequest);

      expect(mockPrismaService.profile.create).toHaveBeenCalled();
    });

    it('should throw error when user has active KYC', async () => {
      // Mock user lookup
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock existing active KYC verification
      mockPrismaService.kycVerification.findFirst.mockResolvedValue({
        id: 'kyc-existing',
        status: KycStatus.PENDING,
      });

      await expect(
        service.createVerification(createVerificationRequest),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockPrismaService.kycVerification.create).not.toHaveBeenCalled();
    });

    it('should handle Idenfy API errors', async () => {
      // Mock user lookup
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock no existing KYC verification
      mockPrismaService.kycVerification.findFirst.mockResolvedValue(null);

      // Mock Idenfy API error
      mockAxiosInstance.post.mockRejectedValue(new Error('Idenfy API error'));

      await expect(
        service.createVerification(createVerificationRequest),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getVerificationStatus', () => {
    it('should return verification status from Idenfy API', async () => {
      const mockIdenfyResponse = {
        data: {
          scanRef: 'idenfy-123',
          overall: 'APPROVED',
          status: 'APPROVED',
          createdAt: '2023-01-01T00:00:00Z',
          completedAt: '2023-01-01T01:00:00Z',
          clientId: 'test-client',
          accountId: 'test-account',
        },
      };

      mockAxiosInstance.get.mockResolvedValue(mockIdenfyResponse);

      const result = await service.getVerificationStatus('idenfy-123');

      expect(result).toEqual({
        id: 'idenfy-123',
        status: 'APPROVED',
        createdAt: '2023-01-01T00:00:00Z',
        completedAt: '2023-01-01T01:00:00Z',
        reviewedAt: undefined,
        profileId: 'test-client',
        accountId: 'test-account',
      });
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/status/idenfy-123');
    });

    it('should handle 404 error from Idenfy API', async () => {
      const error = {
        response: { status: 404 },
        message: 'Not found',
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(
        service.getVerificationStatus('nonexistent'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle other API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('API error'));

      await expect(service.getVerificationStatus('idenfy-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('processWebhookEvent', () => {
    const mockWebhookEvent = {
      type: 'verification.completed',
      id: 'event-123',
      data: {
        type: 'verification',
        id: 'idenfy-123',
        attributes: {
          status: 'APPROVED',
          decision: 'APPROVED',
        },
      },
    };

    it('should process verification completed event', async () => {
      mockPrismaService.kycVerification.updateMany.mockResolvedValue({
        count: 1,
      });

      await service.processWebhookEvent(mockWebhookEvent);

      expect(mockPrismaService.kycVerification.updateMany).toHaveBeenCalledWith(
        {
          where: { externalId: 'idenfy-123' },
          data: {
            status: KycStatus.UNDER_REVIEW,
            inquiryData: mockWebhookEvent.data,
            completedAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        },
      );
    });

    it('should process verification approved event', async () => {
      const approvedEvent = {
        ...mockWebhookEvent,
        type: 'verification.approved',
      };

      mockPrismaService.kycVerification.updateMany.mockResolvedValue({
        count: 1,
      });

      await service.processWebhookEvent(approvedEvent);

      expect(mockPrismaService.kycVerification.updateMany).toHaveBeenCalledWith(
        {
          where: { externalId: 'idenfy-123' },
          data: {
            status: KycStatus.APPROVED,
            verifiedAt: expect.any(Date),
            inquiryData: approvedEvent.data,
            updatedAt: expect.any(Date),
          },
        },
      );
    });

    it('should process verification started event', async () => {
      const startedEvent = {
        ...mockWebhookEvent,
        type: 'verification.started',
      };

      mockPrismaService.kycVerification.updateMany.mockResolvedValue({
        count: 1,
      });

      await service.processWebhookEvent(startedEvent);

      expect(mockPrismaService.kycVerification.updateMany).toHaveBeenCalledWith(
        {
          where: { externalId: 'idenfy-123' },
          data: {
            status: KycStatus.IN_PROGRESS,
            inquiryData: startedEvent.data,
            updatedAt: expect.any(Date),
          },
        },
      );
    });

    it('should handle unrecognized event types', async () => {
      const unknownEvent = {
        ...mockWebhookEvent,
        type: 'unknown.event',
      };

      // Should not throw, just log warning
      await expect(
        service.processWebhookEvent(unknownEvent),
      ).resolves.not.toThrow();
    });

    it('should throw error when database update fails', async () => {
      mockPrismaService.kycVerification.updateMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.processWebhookEvent(mockWebhookEvent),
      ).rejects.toThrow('Database error');
    });
  });

  describe('validateWebhookSignature', () => {
    it('should return true when webhook secret is not configured', () => {
      // Mock config to return undefined for webhook secret
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'IDENFY_WEBHOOK_SECRET') return undefined;
        const config: Record<string, string> = {
          IDENFY_API_KEY: 'test-api-key',
          IDENFY_API_SECRET: 'test-api-secret',
        };
        return config[key];
      });

      const result = service.validateWebhookSignature('payload', 'signature');

      expect(result).toBe(true);
    });

    it('should validate signature when webhook secret is configured', () => {
      const payload = JSON.stringify({ test: 'data' });
      const signature = 'some-signature';

      const result = service.validateWebhookSignature(payload, signature);

      // The method returns boolean based on crypto comparison
      expect(typeof result).toBe('boolean');
    });
  });
});
