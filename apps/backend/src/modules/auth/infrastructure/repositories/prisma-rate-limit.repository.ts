import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { RateLimitRepository } from '../../domain/repositories/rate-limit.repository.interface';
import { RateLimitAttempt } from '../../domain/entities/rate-limit-attempt.entity';

@Injectable()
export class PrismaRateLimitRepository implements RateLimitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(attempt: RateLimitAttempt): Promise<RateLimitAttempt> {
    const attemptData = {
      id: attempt.id,
      userId: attempt.userId || null,
      action: attempt.action,
      ipAddress: attempt.ipAddress || null,
      userAgent: attempt.userAgent || null,
      wasBlocked: attempt.wasBlocked,
      reason: attempt.reason || null,
      createdAt: attempt.createdAt
    };

    const savedAttemptData = await this.prisma.rateLimitAttempt.create({
      data: attemptData
    });

    return RateLimitAttempt.reconstruct({
      ...savedAttemptData,
      userId: savedAttemptData.userId || undefined,
      ipAddress: savedAttemptData.ipAddress || undefined,
      userAgent: savedAttemptData.userAgent || undefined,
      reason: savedAttemptData.reason || undefined
    });
  }

  async findByUserAndAction(userId: string, action: string, hours: number): Promise<RateLimitAttempt[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const attemptsData = await this.prisma.rateLimitAttempt.findMany({
      where: {
        userId,
        action,
        createdAt: { gte: cutoffTime }
      }
    });

    return attemptsData.map(attemptData => RateLimitAttempt.reconstruct({
      ...attemptData,
      userId: attemptData.userId || undefined,
      ipAddress: attemptData.ipAddress || undefined,
      userAgent: attemptData.userAgent || undefined,
      reason: attemptData.reason || undefined
    }));
  }

  async findByIpAndAction(ipAddress: string, action: string, hours: number): Promise<RateLimitAttempt[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const attemptsData = await this.prisma.rateLimitAttempt.findMany({
      where: {
        ipAddress,
        action,
        createdAt: { gte: cutoffTime }
      }
    });

    return attemptsData.map(attemptData => RateLimitAttempt.reconstruct({
      ...attemptData,
      userId: attemptData.userId || undefined,
      ipAddress: attemptData.ipAddress || undefined,
      userAgent: attemptData.userAgent || undefined,
      reason: attemptData.reason || undefined
    }));
  }

  async countByUserAndAction(userId: string, action: string, hours: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await this.prisma.rateLimitAttempt.count({
      where: {
        userId,
        action,
        createdAt: { gte: cutoffTime }
      }
    });
  }

  async countByIpAndAction(ipAddress: string, action: string, hours: number): Promise<number> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await this.prisma.rateLimitAttempt.count({
      where: {
        ipAddress,
        action,
        createdAt: { gte: cutoffTime }
      }
    });
  }
} 