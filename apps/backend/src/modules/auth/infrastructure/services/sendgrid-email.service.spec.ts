import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SendGridEmailService } from './sendgrid-email.service';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

import sgMail from '@sendgrid/mail';
const mockSgMail = sgMail as jest.Mocked<typeof sgMail>;

describe('SendGridEmailService', () => {
  let service: SendGridEmailService;
  let configService: ConfigService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendGridEmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              switch (key) {
                case 'SENDGRID_API_KEY':
                  return 'test-api-key';
                case 'SENDGRID_DOMAIN':
                  return 'test.identhor.com';
                case 'SENDGRID_REGION':
                  return 'US';
                case 'PLATFORM_DOMAIN':
                  return 'https://test.identhor.com';
                default:
                  return defaultValue;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SendGridEmailService>(SendGridEmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with proper configuration', () => {
      expect(mockSgMail.setApiKey).toHaveBeenCalledWith('test-api-key');
    });

    it('should throw error if SENDGRID_API_KEY is not configured', async () => {
      const testModule = await Test.createTestingModule({
        providers: [
          SendGridEmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile();

      expect(() => {
        testModule.get<SendGridEmailService>(SendGridEmailService);
      }).toThrow('SENDGRID_API_KEY is required but not configured');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      const testEmail = 'test@example.com';
      const testToken = 'test-token';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendVerificationEmail(testEmail, testToken);

      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          from: {
            email: 'noreply@test.identhor.com',
            name: 'KYC Attestation Platform',
          },
          subject: 'Verify Your Email Address',
          html: expect.stringContaining('https://test.identhor.com/auth/verify-email?token=test-token'),
          text: expect.stringContaining('https://test.identhor.com/auth/verify-email?token=test-token'),
        })
      );
    });

    it('should handle SendGrid API errors', async () => {
      const testEmail = 'test@example.com';
      const testToken = 'test-token';
      const apiError = new Error('SendGrid API Error');
      
      mockSgMail.send.mockRejectedValueOnce(apiError);

      await expect(service.sendVerificationEmail(testEmail, testToken))
        .rejects.toThrow('Failed to send verification email: SendGrid API Error');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      const testEmail = 'test@example.com';
      const testToken = 'reset-token';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendPasswordResetEmail(testEmail, testToken);

      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          from: {
            email: 'noreply@test.identhor.com',
            name: 'KYC Attestation Platform',
          },
          subject: 'Reset Your Password',
          html: expect.stringContaining('https://test.identhor.com/auth/reset-password?token=reset-token'),
          text: expect.stringContaining('https://test.identhor.com/auth/reset-password?token=reset-token'),
        })
      );
    });

    it('should handle SendGrid API errors', async () => {
      const testEmail = 'test@example.com';
      const testToken = 'reset-token';
      const apiError = new Error('Network timeout');
      
      mockSgMail.send.mockRejectedValueOnce(apiError);

      await expect(service.sendPasswordResetEmail(testEmail, testToken))
        .rejects.toThrow('Failed to send password reset email: Network timeout');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with first name', async () => {
      const testEmail = 'test@example.com';
      const firstName = 'John';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendWelcomeEmail(testEmail, firstName);

      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          from: {
            email: 'noreply@test.identhor.com',
            name: 'KYC Attestation Platform',
          },
          subject: 'Welcome to KYC Attestation Platform',
          html: expect.stringContaining('Hi John'),
          text: expect.stringContaining('Welcome to KYC Attestation Platform, John!'),
        })
      );
    });

    it('should send welcome email without first name', async () => {
      const testEmail = 'test@example.com';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendWelcomeEmail(testEmail);

      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          html: expect.stringContaining('Welcome'),
          text: expect.stringContaining('Welcome to KYC Attestation Platform!'),
        })
      );
    });

    it('should handle SendGrid API errors', async () => {
      const testEmail = 'test@example.com';
      const apiError = new Error('Invalid API key');
      
      mockSgMail.send.mockRejectedValueOnce(apiError);

      await expect(service.sendWelcomeEmail(testEmail))
        .rejects.toThrow('Failed to send welcome email: Invalid API key');
    });
  });

  describe('sendAccountSuspendedEmail', () => {
    it('should send account suspended email successfully', async () => {
      const testEmail = 'test@example.com';
      const reason = 'Suspicious activity detected';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendAccountSuspendedEmail(testEmail, reason);

      expect(mockSgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: testEmail,
          from: {
            email: 'noreply@test.identhor.com',
            name: 'KYC Attestation Platform',
          },
          subject: 'Account Suspended - Action Required',
          html: expect.stringContaining('Suspicious activity detected'),
          text: expect.stringContaining('Suspicious activity detected'),
        })
      );
    });

    it('should handle SendGrid API errors', async () => {
      const testEmail = 'test@example.com';
      const reason = 'Test reason';
      const apiError = new Error('Rate limit exceeded');
      
      mockSgMail.send.mockRejectedValueOnce(apiError);

      await expect(service.sendAccountSuspendedEmail(testEmail, reason))
        .rejects.toThrow('Failed to send account suspended email: Rate limit exceeded');
    });
  });

  describe('email templates', () => {
    it('should generate proper HTML templates', async () => {
      const testEmail = 'test@example.com';
      const testToken = 'test-token';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendVerificationEmail(testEmail, testToken);

      const sentEmail = mockSgMail.send.mock.calls[0]?.[0] as any;
      expect(sentEmail.html).toContain('<!DOCTYPE html>');
      expect(sentEmail.html).toContain('KYC Attestation Platform');
      expect(sentEmail.html).toContain('Verify Your Email Address');
      expect(sentEmail.html).toContain('https://test.identhor.com/auth/verify-email?token=test-token');
    });

    it('should include both HTML and text versions', async () => {
      const testEmail = 'test@example.com';
      const testToken = 'test-token';
      
      mockSgMail.send.mockResolvedValueOnce([{} as any, {}]);

      await service.sendVerificationEmail(testEmail, testToken);

      const sentEmail = mockSgMail.send.mock.calls[0]?.[0] as any;
      expect(sentEmail.html).toBeDefined();
      expect(sentEmail.text).toBeDefined();
      expect(sentEmail.text).toContain('https://test.identhor.com/auth/verify-email?token=test-token');
    });
  });
}); 