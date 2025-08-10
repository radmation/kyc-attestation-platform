import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository.interface';
import type { RateLimitRepository } from '../../domain/repositories/rate-limit.repository.interface';
import type { EmailService } from '../../domain/services/email.service';
import type { User } from '../../domain/entities/user.entity';
import { RateLimitAttempt, RateLimitAction } from '../../domain/entities/rate-limit-attempt.entity';

export interface SendVerificationEmailCommand {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SendVerificationEmailResult {
  success: boolean;
  message: string;
  error?: string;
}

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('RateLimitRepository')
    private readonly rateLimitRepository: RateLimitRepository,
    @Inject('EmailService')
    private readonly emailService: EmailService,
  ) {}

  async execute(command: SendVerificationEmailCommand): Promise<SendVerificationEmailResult> {
    try {
      // 1. Check if user exists
      const user = await this.userRepository.findByEmail(command.email);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'User not found'
        };
      }

      // 2. Check if email is already verified
      if (user.emailVerified) {
        return {
          success: false,
          message: 'Email already verified',
          error: 'Email already verified',
        };
      }

      // 3. Check rate limiting for IP address
      if (command.ipAddress) {
        const ipAttempts = await this.rateLimitRepository.countByIpAndAction(
          command.ipAddress,
          RateLimitAction.EMAIL_VERIFICATION_RESEND,
          1 // Last hour
        );

        if (ipAttempts >= 5) {
          // Log the blocked attempt
          const blockedAttempt = RateLimitAttempt.create({
            action: RateLimitAction.EMAIL_VERIFICATION_RESEND,
            ipAddress: command.ipAddress || undefined,
            userAgent: command.userAgent || undefined,
            wasBlocked: true,
            reason: 'hourly_ip_limit_exceeded',
          });
          await this.rateLimitRepository.save(blockedAttempt);

          return {
            success: false,
            message: 'Too many verification email requests from this IP address. Please try again later.',
            error: 'Rate limit exceeded'
          };
        }
      }

      // 4. Check rate limiting for user
      const userAttempts = await this.rateLimitRepository.countByUserAndAction(
        user.id,
        RateLimitAction.EMAIL_VERIFICATION_RESEND,
        24, // Last 24 hours
      );

      if (userAttempts >= 3) {
        // Log the blocked attempt
        const blockedAttempt = RateLimitAttempt.create({
          userId: user.id,
          action: RateLimitAction.EMAIL_VERIFICATION_RESEND,
          ipAddress: command.ipAddress,
          userAgent: command.userAgent,
          wasBlocked: true,
          reason: 'daily_user_limit_exceeded'
        });
        await this.rateLimitRepository.save(blockedAttempt);

        return {
          success: false,
          message: 'Too many verification email requests. Please try again tomorrow.',
          error: 'Rate limit exceeded'
        };
      }

      // 5. Generate new verification token
      const verificationToken = crypto.randomUUID();
      user.setVerificationToken(verificationToken, 24); // 24 hours expiry

      // 6. Increment verification email count
      user.incrementVerificationEmailCount();

      // 7. Save user with new token
      await this.userRepository.update(user);

      // 8. Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken);

      // 9. Log the successful attempt
      const successfulAttempt = RateLimitAttempt.create({
        userId: user.id,
        action: RateLimitAction.EMAIL_VERIFICATION_RESEND,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        wasBlocked: false
      });
      await this.rateLimitRepository.save(successfulAttempt);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
} 