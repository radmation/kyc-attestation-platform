"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const invitation_service_1 = require("./application/services/invitation.service");
const prisma_invitation_repository_1 = require("./infrastructure/repositories/prisma-invitation.repository");
const invitation_controller_1 = require("./interfaces/invitation.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
class MockUserService {
    async findByEmail(email) {
        return null;
    }
    async createUser(userData) {
        return {
            id: 'mock-user-id',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            clientId: userData.clientId,
            accountStatus: 'ACTIVE',
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }
    async findById(id) {
        return {
            id,
            email: 'mock@example.com',
            role: 'CLIENT_ADMIN',
            clientId: 'mock-client-id',
        };
    }
}
class MockEmailService {
    async sendInvitationEmail(invitation) {
        console.log(`Mock: Sending invitation email to ${invitation.email}`);
    }
    async sendWelcomeEmail(email, firstName) {
        console.log(`Mock: Sending welcome email to ${email} (${firstName})`);
    }
    async sendInvitationRevokedEmail(email) {
        console.log(`Mock: Sending revocation email to ${email}`);
    }
}
class MockClientService {
    async findById(id) {
        return {
            id,
            name: 'Mock Client',
            domain: 'mock-client.com',
            isActive: true,
        };
    }
    async validateUserPermissions(userId, clientId) {
        return true;
    }
}
let InvitationModule = class InvitationModule {
};
exports.InvitationModule = InvitationModule;
exports.InvitationModule = InvitationModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, prisma_module_1.PrismaModule],
        controllers: [invitation_controller_1.InvitationController],
        providers: [
            invitation_service_1.InvitationService,
            {
                provide: 'InvitationRepository',
                useClass: prisma_invitation_repository_1.PrismaInvitationRepository,
            },
            {
                provide: 'UserService',
                useClass: MockUserService,
            },
            {
                provide: 'EmailService',
                useClass: MockEmailService,
            },
            {
                provide: 'ClientService',
                useClass: MockClientService,
            },
        ],
        exports: [invitation_service_1.InvitationService, 'InvitationRepository'],
    })
], InvitationModule);
//# sourceMappingURL=invitation.module.js.map