"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MockEmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEmailService = void 0;
const common_1 = require("@nestjs/common");
let MockEmailService = MockEmailService_1 = class MockEmailService {
    constructor() {
        this.logger = new common_1.Logger(MockEmailService_1.name);
    }
    async sendVerificationEmail(email, token) {
        this.logger.log(`[MOCK] Verification email sent to ${email} with token: ${token}`);
        this.logger.log(`[MOCK] In production, this would send a real email with verification link`);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    async sendPasswordResetEmail(email, token) {
        this.logger.log(`[MOCK] Password reset email sent to ${email} with token: ${token}`);
        this.logger.log(`[MOCK] In production, this would send a real email with reset link`);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    async sendWelcomeEmail(email, firstName) {
        this.logger.log(`[MOCK] Welcome email sent to ${email}${firstName ? ` (${firstName})` : ''}`);
        this.logger.log(`[MOCK] In production, this would send a real welcome email`);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    async sendAccountSuspendedEmail(email, reason) {
        this.logger.log(`[MOCK] Account suspended email sent to ${email} with reason: ${reason}`);
        this.logger.log(`[MOCK] In production, this would send a real suspension notification`);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
};
exports.MockEmailService = MockEmailService;
exports.MockEmailService = MockEmailService = MockEmailService_1 = __decorate([
    (0, common_1.Injectable)()
], MockEmailService);
//# sourceMappingURL=mock-email.service.js.map