import { RateLimitAttempt } from '../entities/rate-limit-attempt.entity';

export interface RateLimitRepository {
  save(attempt: RateLimitAttempt): Promise<RateLimitAttempt>;
  findByUserAndAction(userId: string, action: string, hours: number): Promise<RateLimitAttempt[]>;
  findByIpAndAction(ipAddress: string, action: string, hours: number): Promise<RateLimitAttempt[]>;
  countByUserAndAction(userId: string, action: string, hours: number): Promise<number>;
  countByIpAndAction(ipAddress: string, action: string, hours: number): Promise<number>;
} 