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
var EmailVerificationController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const send_verification_email_use_case_1 = require("../../application/use-cases/send-verification-email.use-case");
const verify_email_use_case_1 = require("../../application/use-cases/verify-email.use-case");
const send_verification_email_dto_1 = require("../../application/dto/send-verification-email.dto");
let EmailVerificationController = EmailVerificationController_1 = class EmailVerificationController {
    constructor(sendVerificationEmailUseCase, verifyEmailUseCase) {
        this.sendVerificationEmailUseCase = sendVerificationEmailUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.logger = new common_1.Logger(EmailVerificationController_1.name);
    }
    async sendVerificationEmail(body, request) {
        const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
        const userAgent = request.get('User-Agent') || 'unknown';
        this.logger.log(`Verification email request from ${ipAddress} for ${body.email}`);
        return this.sendVerificationEmailUseCase.execute({
            email: body.email,
            ipAddress,
            userAgent,
        });
    }
    async verifyEmail(token) {
        this.logger.log(`Email verification attempt with token: ${token}`);
        return this.verifyEmailUseCase.execute({ token });
    }
};
exports.EmailVerificationController = EmailVerificationController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Send verification email to user' }),
    (0, swagger_1.ApiBody)({ type: send_verification_email_dto_1.SendVerificationEmailDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verification email sent successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - User not found or validation failed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 429,
        description: 'Too many requests - Rate limit exceeded',
    }),
    (0, common_1.Post)('send-verification-email'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_verification_email_dto_1.SendVerificationEmailDto, Object]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "sendVerificationEmail", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify email with token' }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        description: 'Email verification token',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid or expired token',
    }),
    (0, common_1.Get)('verify-email'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailVerificationController.prototype, "verifyEmail", null);
exports.EmailVerificationController = EmailVerificationController = EmailVerificationController_1 = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [send_verification_email_use_case_1.SendVerificationEmailUseCase,
        verify_email_use_case_1.VerifyEmailUseCase])
], EmailVerificationController);
//# sourceMappingURL=email-verification.controller.js.map