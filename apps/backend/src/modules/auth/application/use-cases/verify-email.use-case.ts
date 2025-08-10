import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository.interface';

export interface VerifyEmailCommand {
  token: string;
}

export interface VerifyEmailResult {
  success: boolean;
  message: string;
  error?: string;
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    try {
      // Find user by verification token
      const user = await this.userRepository.findByVerificationToken(command.token);
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid verification token',
          error: 'Invalid verification token'
        };
      }

      // Check if token is expired
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return {
          success: false,
          message: 'Verification token has expired',
          error: 'Token expired'
        };
      }

      // Mark email as verified
      user.verifyEmail();
      
      // Update user in repository
      await this.userRepository.update(user);

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 