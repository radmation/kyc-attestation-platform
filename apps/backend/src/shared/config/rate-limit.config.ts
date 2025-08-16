import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

export const createRateLimitConfig = (
  configService: ConfigService,
): ThrottlerModuleOptions => ({
  throttlers: [
    {
      name: 'short',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute per IP
    },
    {
      name: 'medium',
      ttl: 300000, // 5 minutes
      limit: 300, // 300 requests per 5 minutes per IP
    },
    {
      name: 'long',
      ttl: 900000, // 15 minutes
      limit: 500, // 500 requests per 15 minutes per IP
    },
  ],
});

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: any) => string;
}

export const rateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => `${req.ip}:${req.user?.id || 'anonymous'}`,
};
