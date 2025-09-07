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
var StripeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const common_1 = require("@nestjs/common");
const stripe_service_1 = require("./stripe.service");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
let StripeController = StripeController_1 = class StripeController {
    constructor(stripeService) {
        this.stripeService = stripeService;
        this.logger = new common_1.Logger(StripeController_1.name);
    }
    async handleWebhook(rawBody, signature) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing Stripe signature');
        }
        let event;
        try {
            event = this.stripeService.verifyWebhookSignature(rawBody.toString(), signature);
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new common_1.BadRequestException('Invalid signature');
        }
        this.logger.log(`Received Stripe webhook: ${event.type}`);
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.stripeService.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.stripeService.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.stripeService.handleInvoicePaymentFailed(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.stripeService.handleSubscriptionDeleted(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled webhook event type: ${event.type}`);
            }
            return { received: true };
        }
        catch (error) {
            this.logger.error(`Error processing webhook ${event.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
};
exports.StripeController = StripeController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Buffer, String]),
    __metadata("design:returntype", Promise)
], StripeController.prototype, "handleWebhook", null);
exports.StripeController = StripeController = StripeController_1 = __decorate([
    (0, common_1.Controller)('billing/stripe'),
    __metadata("design:paramtypes", [stripe_service_1.StripeService])
], StripeController);
//# sourceMappingURL=stripe.controller.js.map