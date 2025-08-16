export interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendWelcomeEmail(email: string, firstName?: string): Promise<void>;
  sendAccountSuspendedEmail(email: string, reason: string): Promise<void>;
}
