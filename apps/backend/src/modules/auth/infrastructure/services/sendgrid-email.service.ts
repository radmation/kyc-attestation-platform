import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import type { EmailService } from '../../domain/services/email.service';

interface SendGridConfig {
  apiKey: string;
  domain: string;
  region: string;
}

@Injectable()
export class SendGridEmailService implements EmailService {
  private readonly logger = new Logger(SendGridEmailService.name);
  private readonly config: SendGridConfig;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('SENDGRID_API_KEY'),
      domain: this.configService.get<string>(
        'SENDGRID_DOMAIN',
        'mail.identhor.com',
      ),
      region: this.configService.get<string>('SENDGRID_REGION', 'US'),
    };

    if (!this.config.apiKey) {
      throw new Error('SENDGRID_API_KEY is required but not configured');
    }

    this.fromEmail = `noreply@${this.config.domain}`;

    // Initialize SendGrid
    sgMail.setApiKey(this.config.apiKey);

    this.logger.log(
      `SendGrid email service initialized with domain: ${this.config.domain}`,
    );
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${this.configService.get('PLATFORM_DOMAIN', 'https://identhor.com')}/auth/verify-email?token=${token}`;

      const msg = {
        to: email,
        from: {
          email: this.fromEmail,
          name: 'KYC Attestation Platform',
        },
        subject: 'Verify Your Email Address',
        html: this.getVerificationEmailTemplate(verificationUrl),
        text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
      };

      await sgMail.send(msg);
      this.logger.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${this.configService.get('PLATFORM_DOMAIN', 'https://identhor.com')}/auth/reset-password?token=${token}`;

      const msg = {
        to: email,
        from: {
          email: this.fromEmail,
          name: 'KYC Attestation Platform',
        },
        subject: 'Reset Your Password',
        html: this.getPasswordResetEmailTemplate(resetUrl),
        text: `Reset your password by clicking the following link: ${resetUrl}`,
      };

      await sgMail.send(msg);
      this.logger.log(`Password reset email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    try {
      const dashboardUrl = `${this.configService.get('PLATFORM_DOMAIN', 'https://identhor.com')}/dashboard`;

      const msg = {
        to: email,
        from: {
          email: this.fromEmail,
          name: 'KYC Attestation Platform',
        },
        subject: 'Welcome to KYC Attestation Platform',
        html: this.getWelcomeEmailTemplate(firstName, dashboardUrl),
        text: `Welcome to KYC Attestation Platform${firstName ? `, ${firstName}` : ''}! Visit your dashboard at: ${dashboardUrl}`,
      };

      await sgMail.send(msg);
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendAccountSuspendedEmail(
    email: string,
    reason: string,
  ): Promise<void> {
    try {
      const supportUrl = `${this.configService.get('PLATFORM_DOMAIN', 'https://identhor.com')}/support`;

      const msg = {
        to: email,
        from: {
          email: this.fromEmail,
          name: 'KYC Attestation Platform',
        },
        subject: 'Account Suspended - Action Required',
        html: this.getAccountSuspendedEmailTemplate(reason, supportUrl),
        text: `Your account has been suspended. Reason: ${reason}. Please contact support at: ${supportUrl}`,
      };

      await sgMail.send(msg);
      this.logger.log(`Account suspended email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send account suspended email to ${email}:`,
        error,
      );
      throw new Error(
        `Failed to send account suspended email: ${error.message}`,
      );
    }
  }

  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>KYC Attestation Platform</h1>
    </div>
    <div class="content">
        <h2>Verify Your Email Address</h2>
        <p>Thank you for registering with KYC Attestation Platform. To complete your account setup, please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" class="button">Verify Email Address</a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
    </div>
    <div class="footer">
        <p>© 2024 KYC Attestation Platform. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Password Reset Request</h1>
    </div>
    <div class="content">
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password for your KYC Attestation Platform account.</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #dc2626;">${resetUrl}</p>
        <p>This password reset link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
        <p>© 2024 KYC Attestation Platform. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getWelcomeEmailTemplate(
    firstName: string | undefined,
    dashboardUrl: string,
  ): string {
    const greeting = firstName ? `Hi ${firstName}` : 'Welcome';
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to KYC Attestation Platform</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #059669; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to KYC Attestation Platform!</h1>
    </div>
    <div class="content">
        <h2>${greeting}!</h2>
        <p>Thank you for joining KYC Attestation Platform. Your account has been successfully created and verified.</p>
        <p>Our platform provides secure, blockchain-based identity attestations for regulatory compliance. You can now:</p>
        <ul>
            <li>Complete your KYC verification process</li>
            <li>Generate on-chain identity attestations</li>
            <li>Integrate with smart contracts for automated compliance</li>
            <li>Monitor your compliance status in real-time</li>
        </ul>
        <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
    </div>
    <div class="footer">
        <p>© 2024 KYC Attestation Platform. All rights reserved.</p>
    </div>
</body>
</html>`;
  }

  private getAccountSuspendedEmailTemplate(
    reason: string,
    supportUrl: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Suspended</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Account Suspended</h1>
    </div>
    <div class="content">
        <div class="warning">
            <h2>Your account has been suspended</h2>
            <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>We have temporarily suspended your KYC Attestation Platform account due to the reason specified above.</p>
        <p>To resolve this issue and restore access to your account, please contact our support team immediately.</p>
        <a href="${supportUrl}" class="button">Contact Support</a>
        <p>Our support team will review your case and work with you to resolve any issues that led to this suspension.</p>
        <p>We take account security and regulatory compliance seriously and appreciate your understanding.</p>
    </div>
    <div class="footer">
        <p>© 2024 KYC Attestation Platform. All rights reserved.</p>
    </div>
</body>
</html>`;
  }
}
