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
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const prisma_service_1 = require("../../prisma/prisma.service");
var BillingStatus;
(function (BillingStatus) {
    BillingStatus["TRIAL"] = "TRIAL";
    BillingStatus["ACTIVE"] = "ACTIVE";
    BillingStatus["PAST_DUE"] = "PAST_DUE";
    BillingStatus["CANCELED"] = "CANCELED";
    BillingStatus["SUSPENDED"] = "SUSPENDED";
})(BillingStatus || (BillingStatus = {}));
let StripeService = StripeService_1 = class StripeService {
    constructor(configService, prismaService) {
        this.configService = configService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(StripeService_1.name);
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        if (!stripeSecretKey) {
            throw new Error('STRIPE_SECRET_KEY is required');
        }
        this.stripe = new stripe_1.default(stripeSecretKey, {
            apiVersion: '2025-08-27.basil',
        });
    }
    async createCheckoutSession(dto) {
        try {
            const client = await this.prismaService.client.findUnique({
                where: { id: dto.clientId },
            });
            if (!client) {
                throw new common_1.BadRequestException('Client not found');
            }
            let customerId = client.stripeCustomerId;
            if (!customerId) {
                const customer = await this.stripe.customers.create({
                    name: client.name,
                    email: client.domain,
                    metadata: {
                        clientId: client.id,
                    },
                });
                customerId = customer.id;
                await this.prismaService.client.update({
                    where: { id: dto.clientId },
                    data: { stripeCustomerId: customerId },
                });
            }
            const session = await this.stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: dto.priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: dto.successUrl,
                cancel_url: dto.cancelUrl,
                metadata: {
                    clientId: dto.clientId,
                },
            });
            this.logger.log(`Created checkout session ${session.id} for client ${dto.clientId}`);
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async handleCheckoutSessionCompleted(session) {
        try {
            const clientId = session.metadata?.clientId;
            if (!clientId) {
                this.logger.warn('No clientId in checkout session metadata');
                return;
            }
            const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
            await this.prismaService.client.update({
                where: { id: clientId },
                data: {
                    subscriptionId: subscription.id,
                    billingStatus: BillingStatus.ACTIVE,
                    stripeCustomerId: session.customer,
                    gracePeriodEndsAt: null,
                    lastPaymentFailedAt: null,
                },
            });
            this.logger.log(`Provisioned account for client ${clientId} with subscription ${subscription.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle checkout session completed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async handleInvoicePaymentSucceeded(invoice) {
        try {
            const customerId = invoice.customer;
            const client = await this.prismaService.client.findUnique({
                where: { stripeCustomerId: customerId },
            });
            if (!client) {
                this.logger.warn(`No client found for Stripe customer ${customerId}`);
                return;
            }
            await this.prismaService.client.update({
                where: { id: client.id },
                data: {
                    billingStatus: BillingStatus.ACTIVE,
                    gracePeriodEndsAt: null,
                    lastPaymentFailedAt: null,
                },
            });
            this.logger.log(`Payment succeeded for client ${client.id}, updated status to ACTIVE`);
        }
        catch (error) {
            this.logger.error(`Failed to handle invoice payment succeeded: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async handleInvoicePaymentFailed(invoice) {
        try {
            const customerId = invoice.customer;
            const client = await this.prismaService.client.findUnique({
                where: { stripeCustomerId: customerId },
            });
            if (!client) {
                this.logger.warn(`No client found for Stripe customer ${customerId}`);
                return;
            }
            const gracePeriodEndsAt = new Date();
            gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 21);
            await this.prismaService.client.update({
                where: { id: client.id },
                data: {
                    billingStatus: BillingStatus.PAST_DUE,
                    gracePeriodEndsAt,
                    lastPaymentFailedAt: new Date(),
                },
            });
            this.logger.log(`Payment failed for client ${client.id}, set grace period until ${gracePeriodEndsAt}`);
            await this.sendPaymentFailedEmail(client.id, gracePeriodEndsAt);
        }
        catch (error) {
            this.logger.error(`Failed to handle invoice payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async handleSubscriptionDeleted(subscription) {
        try {
            const customerId = subscription.customer;
            const client = await this.prismaService.client.findUnique({
                where: { stripeCustomerId: customerId },
            });
            if (!client) {
                this.logger.warn(`No client found for Stripe customer ${customerId}`);
                return;
            }
            await this.prismaService.client.update({
                where: { id: client.id },
                data: {
                    billingStatus: BillingStatus.CANCELED,
                    subscriptionId: null,
                },
            });
            this.logger.log(`Subscription canceled for client ${client.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to handle subscription deleted: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async createCustomerPortalSession(clientId, returnUrl) {
        try {
            const client = await this.prismaService.client.findUnique({
                where: { id: clientId },
            });
            if (!client || !client.stripeCustomerId) {
                throw new common_1.BadRequestException('Client not found or no Stripe customer');
            }
            const session = await this.stripe.billingPortal.sessions.create({
                customer: client.stripeCustomerId,
                return_url: returnUrl,
            });
            return session;
        }
        catch (error) {
            this.logger.error(`Failed to create customer portal session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    verifyWebhookSignature(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is required');
        }
        try {
            return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (error) {
            this.logger.error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
    async sendPaymentFailedEmail(clientId, gracePeriodEndsAt) {
        this.logger.log(`Would send payment failed email to client ${clientId}, grace period ends ${gracePeriodEndsAt}`);
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map