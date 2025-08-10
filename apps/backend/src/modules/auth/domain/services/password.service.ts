export interface PasswordService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  generateRandomPassword(length?: number): string;
  validatePassword(password: string): boolean;
} 