import { Injectable, Logger } from '@nestjs/common';
import type { EmailService } from '../../domain/services/email.service';

@Injectable()
export class MockEmailService implements EmailService {
  private readonly logger = new Logger(MockEmailService.name);

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    this.logger.log(`[MOCK] Verification email sent to ${email} with token: ${token}`);
    this.logger.log(`[MOCK] In production, this would send a real email with verification link`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    this.logger.log(`[MOCK] Password reset email sent to ${email} with token: ${token}`);
    this.logger.log(`[MOCK] In production, this would send a real email with reset link`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    this.logger.log(`[MOCK] Welcome email sent to ${email}${firstName ? ` (${firstName})` : ''}`);
    this.logger.log(`[MOCK] In production, this would send a real welcome email`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async sendAccountSuspendedEmail(email: string, reason: string): Promise<void> {
    this.logger.log(`[MOCK] Account suspended email sent to ${email} with reason: ${reason}`);
    this.logger.log(`[MOCK] In production, this would send a real suspension notification`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }
} 