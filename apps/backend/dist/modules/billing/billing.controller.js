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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../shared/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let BillingController = class BillingController {
    constructor(stripeService, prismaService) {
        this.stripeService = stripeService;
        this.prismaService = prismaService;
    }
    async createCheckoutSession(dto, req) {
        const user = req.user;
        const checkoutDto = {
            clientId: user.clientId,
            priceId: dto.priceId,
            successUrl: dto.successUrl,
            cancelUrl: dto.cancelUrl,
        };
        const session = await this.stripeService.createCheckoutSession(checkoutDto);
        return {
            sessionId: session.id,
            url: session.url,
        };
    }
    async createCustomerPortalSession(dto, req) {
        const user = req.user;
        const session = await this.stripeService.createCustomerPortalSession(user.clientId, dto.returnUrl);
        return {
            url: session.url,
        };
    }
    async getBillingStatus(req) {
        const user = req.user;
        const client = await this.prismaService.client.findUnique({
            where: { id: user.clientId },
            select: {
                billingStatus: true,
                gracePeriodEndsAt: true,
                lastPaymentFailedAt: true,
                subscriptionId: true,
            },
        });
        return client;
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('checkout-session'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CLIENT_ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Post)('customer-portal'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CLIENT_ADMIN, client_1.UserRole.SUPER_ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createCustomerPortalSession", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getBillingStatus", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('billing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stripe_service_1.StripeService,
        prisma_service_1.PrismaService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map