"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRateLimitRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const rate_limit_attempt_entity_1 = require("../../domain/entities/rate-limit-attempt.entity");
let PrismaRateLimitRepository = class PrismaRateLimitRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(attempt) {
        const attemptData = {
            id: attempt.id,
            userId: attempt.userId || null,
            action: attempt.action,
            ipAddress: attempt.ipAddress || null,
            userAgent: attempt.userAgent || null,
            wasBlocked: attempt.wasBlocked,
            reason: attempt.reason || null,
            createdAt: attempt.createdAt,
        };
        const savedAttemptData = await this.prisma.rateLimitAttempt.create({
            data: attemptData,
        });
        return rate_limit_attempt_entity_1.RateLimitAttempt.reconstruct({
            ...savedAttemptData,
            userId: savedAttemptData.userId || undefined,
            ipAddress: savedAttemptData.ipAddress || undefined,
            userAgent: savedAttemptData.userAgent || undefined,
            reason: savedAttemptData.reason || undefined,
        });
    }
    async findByUserAndAction(userId, action, hours) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        const attemptsData = await this.prisma.rateLimitAttempt.findMany({
            where: {
                userId,
                action,
                createdAt: { gte: cutoffTime },
            },
        });
        return attemptsData.map((attemptData) => rate_limit_attempt_entity_1.RateLimitAttempt.reconstruct({
            ...attemptData,
            userId: attemptData.userId || undefined,
            ipAddress: attemptData.ipAddress || undefined,
            userAgent: attemptData.userAgent || undefined,
            reason: attemptData.reason || undefined,
        }));
    }
    async findByIpAndAction(ipAddress, action, hours) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        const attemptsData = await this.prisma.rateLimitAttempt.findMany({
            where: {
                ipAddress,
                action,
                createdAt: { gte: cutoffTime },
            },
        });
        return attemptsData.map((attemptData) => rate_limit_attempt_entity_1.RateLimitAttempt.reconstruct({
            ...attemptData,
            userId: attemptData.userId || undefined,
            ipAddress: attemptData.ipAddress || undefined,
            userAgent: attemptData.userAgent || undefined,
            reason: attemptData.reason || undefined,
        }));
    }
    async countByUserAndAction(userId, action, hours) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return await this.prisma.rateLimitAttempt.count({
            where: {
                userId,
                action,
                createdAt: { gte: cutoffTime },
            },
        });
    }
    async countByIpAndAction(ipAddress, action, hours) {
        const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
        return await this.prisma.rateLimitAttempt.count({
            where: {
                ipAddress,
                action,
                createdAt: { gte: cutoffTime },
            },
        });
    }
};
exports.PrismaRateLimitRepository = PrismaRateLimitRepository;
exports.PrismaRateLimitRepository = PrismaRateLimitRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRateLimitRepository);
//# sourceMappingURL=prisma-rate-limit.repository.js.map