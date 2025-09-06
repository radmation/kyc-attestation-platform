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
var IdenfyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdenfyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../../database/prisma.service");
const client_1 = require("@prisma/client");
const axios_1 = require("axios");
const crypto = require("crypto");
let IdenfyService = IdenfyService_1 = class IdenfyService {
    constructor(configService, prismaService) {
        this.configService = configService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(IdenfyService_1.name);
        this.apiKey = this.configService.get('IDENFY_API_KEY') || '';
        this.apiSecret = this.configService.get('IDENFY_API_SECRET') || '';
        const environment = this.configService.get('IDENFY_ENVIRONMENT') || 'sandbox';
        if (!this.apiKey || !this.apiSecret) {
            throw new Error('IDENFY_API_KEY and IDENFY_API_SECRET are required');
        }
        this.baseUrl =
            environment === 'production'
                ? 'https://ivs.idenfy.com/api/v2'
                : 'https://ivs.test.idenfy.com/api/v2';
        this.appBaseUrl =
            this.configService.get('APP_BASE_URL') || 'http://localhost:3000';
        this.httpClient = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            auth: {
                username: this.apiKey,
                password: this.apiSecret,
            },
        });
        this.httpClient.interceptors.request.use((config) => {
            this.logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            this.logger.error(`Request error: ${error.message}`);
            return Promise.reject(error);
        });
        this.httpClient.interceptors.response.use((response) => {
            this.logger.debug(`Response received: ${response.status} from ${response.config.url}`);
            return response;
        }, (error) => {
            this.logger.error(`Response error: ${error.response?.status} - ${error.message}`);
            return Promise.reject(error);
        });
    }
    async createVerification(request) {
        try {
            this.logger.log(`Creating Idenfy verification for user: ${request.userId}`);
            const user = await this.prismaService.user.findUnique({
                where: { id: request.userId },
                include: { profiles: true },
            });
            if (!user) {
                throw new common_1.BadRequestException('User not found');
            }
            let profile = user.profiles[0];
            if (!profile) {
                profile = await this.prismaService.profile.create({
                    data: {
                        id: crypto.randomUUID(),
                        clientId: user.clientId,
                        userId: user.id,
                    },
                });
            }
            const existingKyc = await this.prismaService.kycVerification.findFirst({
                where: {
                    profileId: profile.id,
                    status: {
                        in: [client_1.KycStatus.PENDING, client_1.KycStatus.IN_PROGRESS],
                    },
                },
            });
            if (existingKyc) {
                throw new common_1.BadRequestException('User already has an active KYC verification in progress');
            }
            const tokenPayload = {
                clientId: request.referenceId || request.userId,
                successUrl: request.redirectUri ||
                    `${this.appBaseUrl}/kyc/complete?status=success`,
                errorUrl: request.redirectUri || `${this.appBaseUrl}/kyc/complete?status=error`,
                unverifiedUrl: request.redirectUri ||
                    `${this.appBaseUrl}/kyc/complete?status=unverified`,
                locale: 'en',
                tokenType: 'TEMPORARY',
                durationHours: 1,
            };
            const response = await this.httpClient.post('/token', tokenPayload);
            const verificationData = response.data;
            const kycRecord = await this.prismaService.kycVerification.create({
                data: {
                    id: crypto.randomUUID(),
                    providerId: verificationData.scanRef || verificationData.authToken,
                    externalId: verificationData.scanRef,
                    provider: 'idenfy',
                    status: client_1.KycStatus.PENDING,
                    lastCheckedAt: new Date(),
                    webhookReceived: false,
                    profileId: profile.id,
                },
            });
            this.logger.log(`Created Idenfy verification: ${verificationData.scanRef} for user: ${request.userId}`);
            return {
                verificationId: verificationData.scanRef || verificationData.authToken,
                sessionToken: verificationData.authToken,
                url: verificationData.clientRedirectUrl ||
                    `${this.baseUrl.replace('/api/v2', '')}/api/v2/redirect?token=${verificationData.authToken}`,
                status: 'created',
            };
        }
        catch (error) {
            this.logger.error(`Failed to create Idenfy verification: ${error.message}`, error.stack);
            if (error.response?.status === 400) {
                throw new common_1.BadRequestException(`Invalid request: ${error.response.data?.message || error.message}`);
            }
            throw new common_1.InternalServerErrorException('Failed to create KYC verification');
        }
    }
    async getVerificationStatus(verificationId) {
        try {
            const response = await this.httpClient.get(`/status/${verificationId}`);
            const data = response.data;
            return {
                id: data.scanRef || verificationId,
                status: data.overall || data.status,
                createdAt: data.createdAt,
                completedAt: data.completedAt,
                reviewedAt: data.reviewedAt,
                profileId: data.clientId,
                accountId: data.accountId || this.apiKey,
            };
        }
        catch (error) {
            this.logger.error(`Failed to retrieve Idenfy verification: ${error.message}`);
            if (error.response?.status === 404) {
                throw new common_1.BadRequestException('Verification not found');
            }
            throw new common_1.InternalServerErrorException('Failed to retrieve verification status');
        }
    }
    async processWebhookEvent(event) {
        try {
            this.logger.log(`Processing Idenfy webhook event: ${event.type} for ${event.data.id}`);
            switch (event.type) {
                case 'verification.started':
                case 'VERIFICATION_STARTED':
                    await this.handleVerificationStarted(event);
                    break;
                case 'verification.completed':
                case 'VERIFICATION_COMPLETED':
                    await this.handleVerificationCompleted(event);
                    break;
                case 'verification.approved':
                case 'VERIFICATION_APPROVED':
                    await this.handleVerificationApproved(event);
                    break;
                case 'verification.declined':
                case 'VERIFICATION_DECLINED':
                    await this.handleVerificationDeclined(event);
                    break;
                case 'verification.requires_review':
                case 'VERIFICATION_REQUIRES_REVIEW':
                    await this.handleVerificationRequiresReview(event);
                    break;
                default:
                    this.logger.warn(`Unhandled Idenfy webhook event type: ${event.type}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process Idenfy webhook: ${error.message}`, error.stack);
            throw error;
        }
    }
    async handleVerificationStarted(event) {
        const verificationId = event.data.id;
        await this.prismaService.kycVerification.updateMany({
            where: { externalId: verificationId },
            data: {
                status: client_1.KycStatus.IN_PROGRESS,
                inquiryData: event.data,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`Updated verification ${verificationId} status to IN_PROGRESS`);
    }
    async handleVerificationCompleted(event) {
        const verificationId = event.data.id;
        await this.prismaService.kycVerification.updateMany({
            where: { externalId: verificationId },
            data: {
                status: client_1.KycStatus.UNDER_REVIEW,
                inquiryData: event.data,
                completedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        this.logger.log(`Updated verification ${verificationId} status to UNDER_REVIEW`);
    }
    async handleVerificationApproved(event) {
        const verificationId = event.data.id;
        await this.prismaService.kycVerification.updateMany({
            where: { externalId: verificationId },
            data: {
                status: client_1.KycStatus.APPROVED,
                verifiedAt: new Date(),
                inquiryData: event.data,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`KYC approved for verification ${verificationId}`);
    }
    async handleVerificationDeclined(event) {
        const verificationId = event.data.id;
        await this.prismaService.kycVerification.updateMany({
            where: { externalId: verificationId },
            data: {
                status: client_1.KycStatus.REJECTED,
                rejectedAt: new Date(),
                inquiryData: event.data,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`KYC declined for verification ${verificationId}`);
    }
    async handleVerificationRequiresReview(event) {
        const verificationId = event.data.id;
        await this.prismaService.kycVerification.updateMany({
            where: { externalId: verificationId },
            data: {
                status: client_1.KycStatus.MANUAL_REVIEW,
                inquiryData: event.data,
                updatedAt: new Date(),
            },
        });
        this.logger.log(`KYC requires manual review for verification ${verificationId}`);
    }
    async getUserKycStatus(userId) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: {
                profiles: {
                    include: {
                        kycChecks: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
        });
        if (!user || !user.profiles.length) {
            return null;
        }
        const kycRecord = user.profiles[0]?.kycChecks[0];
        if (!kycRecord) {
            return null;
        }
        const syncableStatuses = [
            client_1.KycStatus.PENDING,
            client_1.KycStatus.IN_PROGRESS,
            client_1.KycStatus.UNDER_REVIEW,
            client_1.KycStatus.MANUAL_REVIEW,
        ];
        if (syncableStatuses.includes(kycRecord.status)) {
            try {
                const idenfyStatus = await this.getVerificationStatus(kycRecord.externalId);
                const mappedStatus = this.mapIdenfyStatusToKycStatus(idenfyStatus.status);
                if (mappedStatus !== kycRecord.status) {
                    await this.syncVerificationStatus(kycRecord.externalId);
                    const updatedUser = await this.prismaService.user.findUnique({
                        where: { id: userId },
                        include: {
                            profiles: {
                                include: {
                                    kycChecks: {
                                        orderBy: { createdAt: 'desc' },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    });
                    return updatedUser?.profiles[0]?.kycChecks[0] || null;
                }
            }
            catch (error) {
                this.logger.warn(`Failed to sync KYC status for user ${userId}: ${error.message}`);
            }
        }
        return kycRecord;
    }
    async syncVerificationStatus(verificationId) {
        try {
            const idenfyVerification = await this.getVerificationStatus(verificationId);
            const kycStatus = this.mapIdenfyStatusToKycStatus(idenfyVerification.status);
            await this.prismaService.kycVerification.updateMany({
                where: { externalId: verificationId },
                data: {
                    status: kycStatus,
                    updatedAt: new Date(),
                },
            });
            this.logger.log(`Synced verification ${verificationId} status to ${kycStatus}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync verification status: ${error.message}`);
            throw error;
        }
    }
    mapIdenfyStatusToKycStatus(idenfyStatus) {
        const status = idenfyStatus?.toLowerCase();
        switch (status) {
            case 'created':
            case 'pending':
                return client_1.KycStatus.PENDING;
            case 'started':
            case 'in_progress':
            case 'waiting':
                return client_1.KycStatus.IN_PROGRESS;
            case 'completed':
            case 'reviewing':
                return client_1.KycStatus.UNDER_REVIEW;
            case 'approved':
            case 'passed':
                return client_1.KycStatus.APPROVED;
            case 'declined':
            case 'failed':
            case 'rejected':
                return client_1.KycStatus.REJECTED;
            case 'requires_review':
            case 'suspected':
                return client_1.KycStatus.MANUAL_REVIEW;
            default:
                this.logger.warn(`Unknown Idenfy status: ${idenfyStatus}, defaulting to PENDING`);
                return client_1.KycStatus.PENDING;
        }
    }
    validateWebhookSignature(payload, signature) {
        try {
            const webhookSecret = this.configService.get('IDENFY_WEBHOOK_SECRET');
            if (!webhookSecret) {
                this.logger.warn('IDENFY_WEBHOOK_SECRET not configured, skipping validation');
                return true;
            }
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(payload)
                .digest('hex');
            const providedSignature = signature.replace('sha256=', '');
            return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'hex'), Buffer.from(providedSignature, 'hex'));
        }
        catch (error) {
            this.logger.error(`Webhook signature validation failed: ${error.message}`);
            return false;
        }
    }
};
exports.IdenfyService = IdenfyService;
exports.IdenfyService = IdenfyService = IdenfyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], IdenfyService);
//# sourceMappingURL=idenfy.service.js.map