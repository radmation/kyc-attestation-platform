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
exports.KycController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const idenfy_service_1 = require("../../infrastructure/services/idenfy.service");
const public_decorator_1 = require("../../../../shared/decorators/public.decorator");
const roles_decorator_1 = require("../../../../shared/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const kyc_dto_1 = require("../dto/kyc.dto");
let KycController = class KycController {
    constructor(idenfyService) {
        this.idenfyService = idenfyService;
    }
    async createVerification(req, body) {
        const userId = req.user.id;
        const request = {
            userId,
            ...(body.redirectUri && { redirectUri: body.redirectUri }),
            ...(body.referenceId && { referenceId: body.referenceId }),
        };
        return await this.idenfyService.createVerification(request);
    }
    async getKycStatus(req) {
        const userId = req.user.id;
        const kycRecord = await this.idenfyService.getUserKycStatus(userId);
        if (!kycRecord) {
            return null;
        }
        return {
            id: kycRecord.id,
            status: kycRecord.status,
            providerId: kycRecord.providerId,
            createdAt: kycRecord.createdAt,
            updatedAt: kycRecord.updatedAt,
            lastCheckedAt: kycRecord.lastCheckedAt,
            webhookReceived: kycRecord.webhookReceived,
        };
    }
    async getUserKycStatus(userId) {
        const kycRecord = await this.idenfyService.getUserKycStatus(userId);
        if (!kycRecord) {
            return null;
        }
        return {
            id: kycRecord.id,
            status: kycRecord.status,
            providerId: kycRecord.providerId,
            createdAt: kycRecord.createdAt,
            updatedAt: kycRecord.updatedAt,
            lastCheckedAt: kycRecord.lastCheckedAt,
            webhookReceived: kycRecord.webhookReceived,
        };
    }
    async handleIdenfyWebhook(req, event, signature, xSignature) {
        try {
            const rawBody = req.rawBody || JSON.stringify(event);
            const webhookSignature = signature || xSignature;
            if (webhookSignature) {
                const isValidSignature = this.idenfyService.validateWebhookSignature(rawBody.toString(), webhookSignature);
                if (!isValidSignature) {
                    throw new common_1.UnauthorizedException('Invalid webhook signature');
                }
            }
            await this.idenfyService.processWebhookEvent(event);
            return {
                success: true,
                message: 'Webhook processed successfully',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getVerificationStatus(verificationId) {
        return await this.idenfyService.getVerificationStatus(verificationId);
    }
};
exports.KycController = KycController;
__decorate([
    (0, common_1.Post)('verification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new KYC verification' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Verification created successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - User already has active verification',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, kyc_dto_1.CreateVerificationDto]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "createVerification", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user KYC status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'KYC status retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No KYC record found for user' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getKycStatus", null);
__decorate([
    (0, common_1.Get)('status/:userId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.CLIENT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get KYC status for specific user (admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'KYC status retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No KYC record found for user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getUserKycStatus", null);
__decorate([
    (0, common_1.Post)('webhook/idenfy'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle Idenfy webhook events' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid webhook signature',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Invalid webhook payload',
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('idenfy-signature')),
    __param(3, (0, common_1.Headers)('x-idenfy-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "handleIdenfyWebhook", null);
__decorate([
    (0, common_1.Get)('verification/:verificationId/status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.CLIENT_ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get verification status by ID (admin only)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Verification status retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Admin access required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Verification not found' }),
    __param(0, (0, common_1.Param)('verificationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycController.prototype, "getVerificationStatus", null);
exports.KycController = KycController = __decorate([
    (0, swagger_1.ApiTags)('kyc'),
    (0, common_1.Controller)('kyc'),
    __metadata("design:paramtypes", [idenfy_service_1.IdenfyService])
], KycController);
//# sourceMappingURL=kyc.controller.js.map