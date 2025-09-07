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
var BillingSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
var BillingStatus;
(function (BillingStatus) {
    BillingStatus["TRIAL"] = "TRIAL";
    BillingStatus["ACTIVE"] = "ACTIVE";
    BillingStatus["PAST_DUE"] = "PAST_DUE";
    BillingStatus["CANCELED"] = "CANCELED";
    BillingStatus["SUSPENDED"] = "SUSPENDED";
})(BillingStatus || (BillingStatus = {}));
let BillingSchedulerService = BillingSchedulerService_1 = class BillingSchedulerService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(BillingSchedulerService_1.name);
    }
    async handleGracePeriodExpiration() {
        this.logger.log('Running grace period expiration check');
        try {
            const now = new Date();
            const expiredClients = await this.prismaService.client.findMany({
                where: {
                    billingStatus: BillingStatus.PAST_DUE,
                    gracePeriodEndsAt: {
                        lt: now,
                    },
                },
            });
            this.logger.log(`Found ${expiredClients.length} clients with expired grace periods`);
            for (const client of expiredClients) {
                await this.prismaService.client.update({
                    where: { id: client.id },
                    data: {
                        billingStatus: BillingStatus.SUSPENDED,
                    },
                });
                this.logger.log(`Suspended client ${client.id} - grace period expired`);
            }
        }
        catch (error) {
            this.logger.error(`Error processing grace period expiration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async sendReminderEmails() {
        this.logger.log('Running reminder email check');
        try {
            const now = new Date();
            const pastDueClients = await this.prismaService.client.findMany({
                where: {
                    billingStatus: BillingStatus.PAST_DUE,
                    gracePeriodEndsAt: {
                        gt: now,
                    },
                },
            });
            for (const client of pastDueClients) {
                if (!client.lastPaymentFailedAt || !client.gracePeriodEndsAt) {
                    continue;
                }
                const daysSinceFailure = Math.floor((now.getTime() - client.lastPaymentFailedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceFailure === 7 || daysSinceFailure === 14 || daysSinceFailure === 20) {
                    await this.sendReminderEmail(client.id, daysSinceFailure, client.gracePeriodEndsAt);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error sending reminder emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async sendReminderEmail(clientId, daysSinceFailure, gracePeriodEndsAt) {
        const daysRemaining = Math.ceil((gracePeriodEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        this.logger.log(`Would send day ${daysSinceFailure} reminder email to client ${clientId}. ` +
            `${daysRemaining} days remaining in grace period.`);
    }
};
exports.BillingSchedulerService = BillingSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingSchedulerService.prototype, "handleGracePeriodExpiration", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingSchedulerService.prototype, "sendReminderEmails", null);
exports.BillingSchedulerService = BillingSchedulerService = BillingSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingSchedulerService);
//# sourceMappingURL=billing-scheduler.service.js.map