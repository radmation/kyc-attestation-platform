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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendVerificationEmailUseCase = void 0;
const common_1 = require("@nestjs/common");
const rate_limit_attempt_entity_1 = require("../../domain/entities/rate-limit-attempt.entity");
let SendVerificationEmailUseCase = class SendVerificationEmailUseCase {
    constructor(userRepository, rateLimitRepository, emailService) {
        this.userRepository = userRepository;
        this.rateLimitRepository = rateLimitRepository;
        this.emailService = emailService;
    }
    async execute(command) {
        try {
            const user = await this.userRepository.findByEmail(command.email);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    error: 'User not found',
                };
            }
            if (user.emailVerified) {
                return {
                    success: false,
                    message: 'Email already verified',
                    error: 'Email already verified',
                };
            }
            if (command.ipAddress) {
                const ipAttempts = await this.rateLimitRepository.countByIpAndAction(command.ipAddress, rate_limit_attempt_entity_1.RateLimitAction.EMAIL_VERIFICATION_RESEND, 1);
                if (ipAttempts >= 5) {
                    const blockedAttempt = rate_limit_attempt_entity_1.RateLimitAttempt.create({
                        action: rate_limit_attempt_entity_1.RateLimitAction.EMAIL_VERIFICATION_RESEND,
                        ipAddress: command.ipAddress || undefined,
                        userAgent: command.userAgent || undefined,
                        wasBlocked: true,
                        reason: 'hourly_ip_limit_exceeded',
                    });
                    await this.rateLimitRepository.save(blockedAttempt);
                    return {
                        success: false,
                        message: 'Too many verification email requests from this IP address. Please try again later.',
                        error: 'Rate limit exceeded',
                    };
                }
            }
            const userAttempts = await this.rateLimitRepository.countByUserAndAction(user.id, rate_limit_attempt_entity_1.RateLimitAction.EMAIL_VERIFICATION_RESEND, 24);
            if (userAttempts >= 3) {
                const blockedAttempt = rate_limit_attempt_entity_1.RateLimitAttempt.create({
                    userId: user.id,
                    action: rate_limit_attempt_entity_1.RateLimitAction.EMAIL_VERIFICATION_RESEND,
                    ipAddress: command.ipAddress,
                    userAgent: command.userAgent,
                    wasBlocked: true,
                    reason: 'daily_user_limit_exceeded',
                });
                await this.rateLimitRepository.save(blockedAttempt);
                return {
                    success: false,
                    message: 'Too many verification email requests. Please try again tomorrow.',
                    error: 'Rate limit exceeded',
                };
            }
            const verificationToken = crypto.randomUUID();
            user.setVerificationToken(verificationToken, 24);
            user.incrementVerificationEmailCount();
            await this.userRepository.update(user);
            await this.emailService.sendVerificationEmail(user.email, verificationToken);
            const successfulAttempt = rate_limit_attempt_entity_1.RateLimitAttempt.create({
                userId: user.id,
                action: rate_limit_attempt_entity_1.RateLimitAction.EMAIL_VERIFICATION_RESEND,
                ipAddress: command.ipAddress,
                userAgent: command.userAgent,
                wasBlocked: false,
            });
            await this.rateLimitRepository.save(successfulAttempt);
            return {
                success: true,
                message: 'Verification email sent successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to send verification email',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.SendVerificationEmailUseCase = SendVerificationEmailUseCase;
exports.SendVerificationEmailUseCase = SendVerificationEmailUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __param(1, (0, common_1.Inject)('RateLimitRepository')),
    __param(2, (0, common_1.Inject)('EmailService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], SendVerificationEmailUseCase);
//# sourceMappingURL=send-verification-email.use-case.js.map