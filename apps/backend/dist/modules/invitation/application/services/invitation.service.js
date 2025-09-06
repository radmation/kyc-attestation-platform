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
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_invitation_entity_1 = require("../../domain/entities/user-invitation.entity");
let InvitationService = class InvitationService {
    constructor(invitationRepository, userService, emailService, clientService, configService) {
        this.invitationRepository = invitationRepository;
        this.userService = userService;
        this.emailService = emailService;
        this.clientService = clientService;
        this.configService = configService;
    }
    async createInvitation(createInvitationDto) {
        const { email, role, clientId, invitedBy, firstName, lastName, message, permissions, } = createInvitationDto;
        await this.validateInvitationPermissions(invitedBy, clientId);
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const existingInvitation = await this.invitationRepository.existsByEmail(email, clientId);
        if (existingInvitation) {
            throw new common_1.BadRequestException('Pending invitation already exists for this email');
        }
        const invitation = user_invitation_entity_1.UserInvitation.create({
            email,
            role,
            clientId,
            invitedBy,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(message && { message }),
            ...(permissions && { permissions }),
            expirationDays: this.configService.get('INVITATION_EXPIRATION_DAYS', 7),
        });
        const savedInvitation = await this.invitationRepository.save(invitation);
        savedInvitation.markEmailSent();
        await this.invitationRepository.update(savedInvitation);
        await this.emailService.sendInvitationEmail(savedInvitation);
        return savedInvitation;
    }
    async createBulkInvitations(bulkInvitationDto) {
        const { invitations, commonMessage, invitedBy } = bulkInvitationDto;
        const results = {
            successCount: 0,
            failureCount: 0,
            successfulInvitations: [],
            failedInvitations: [],
        };
        for (const invitationDto of invitations) {
            try {
                const invitation = await this.createInvitation({
                    ...invitationDto,
                    ...(invitationDto.message || commonMessage
                        ? { message: invitationDto.message || commonMessage }
                        : {}),
                    invitedBy,
                });
                results.successCount++;
                results.successfulInvitations.push(invitation.id);
            }
            catch (error) {
                results.failureCount++;
                results.failedInvitations.push({
                    email: invitationDto.email,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        return results;
    }
    async acceptInvitation(token, acceptInvitationDto) {
        const invitation = await this.validateInvitationToken(token);
        if (!invitation.isPending()) {
            throw new common_1.BadRequestException('Invitation is not pending or has expired');
        }
        const hashedPassword = await this.hashPassword(acceptInvitationDto.password);
        const userData = {
            email: invitation.email,
            firstName: acceptInvitationDto.firstName || invitation.firstName,
            lastName: acceptInvitationDto.lastName || invitation.lastName,
            password: hashedPassword,
            role: invitation.role,
            clientId: invitation.clientId,
            accountStatus: 'ACTIVE',
            emailVerified: true,
        };
        const user = await this.userService.createUser(userData);
        invitation.accept();
        await this.invitationRepository.update(invitation);
        await this.emailService.sendWelcomeEmail(user.email, user.firstName);
        return user;
    }
    async resendInvitation(invitationId, requestedBy) {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        await this.validateInvitationPermissions(requestedBy, invitation.clientId);
        if (!invitation.canResend()) {
            throw new common_1.BadRequestException('Cannot resend this invitation (not pending, expired, or max resends reached)');
        }
        invitation.markEmailSent();
        await this.invitationRepository.update(invitation);
        await this.emailService.sendInvitationEmail(invitation);
    }
    async revokeInvitation(invitationId, requestedBy) {
        const invitation = await this.invitationRepository.findById(invitationId);
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        await this.validateInvitationPermissions(requestedBy, invitation.clientId);
        if (!invitation.isPending()) {
            throw new common_1.BadRequestException('Can only revoke pending invitations');
        }
        invitation.revoke();
        await this.invitationRepository.update(invitation);
        await this.emailService.sendInvitationRevokedEmail(invitation.email);
    }
    async getInvitations(query, clientId) {
        const result = await this.invitationRepository.findWithPagination({
            page: query.page ?? 1,
            limit: query.limit ?? 20,
            clientId,
            ...(query.status && { status: query.status }),
            ...(query.email && { email: query.email }),
            ...(query.invitedBy && { invitedBy: query.invitedBy }),
            ...(query.sortBy && { sortBy: query.sortBy }),
            ...(query.sortOrder && { sortOrder: query.sortOrder }),
        });
        return {
            invitations: result.invitations.map((inv) => inv.toPersistence()),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNextPage: result.page < result.totalPages,
            hasPrevPage: result.page > 1,
        };
    }
    async getInvitation(id, requestedBy) {
        const invitation = await this.invitationRepository.findById(id);
        if (!invitation) {
            return null;
        }
        if (requestedBy) {
            await this.validateInvitationPermissions(requestedBy, invitation.clientId);
        }
        return invitation;
    }
    async findInvitationByToken(token) {
        return this.invitationRepository.findByToken(token);
    }
    async cleanupExpiredInvitations() {
        const expiredInvitations = await this.invitationRepository.findExpiredInvitations();
        let cleanupCount = 0;
        for (const invitation of expiredInvitations) {
            invitation.revoke();
            await this.invitationRepository.update(invitation);
            cleanupCount++;
        }
        return cleanupCount;
    }
    async validateInvitationPermissions(userId, clientId) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const hasPermission = await this.clientService.validateUserPermissions(userId, clientId);
        if (!hasPermission) {
            throw new common_1.BadRequestException('Insufficient permissions to manage invitations for this client');
        }
    }
    async validateInvitationToken(token) {
        const invitation = await this.invitationRepository.findByToken(token);
        if (!invitation) {
            throw new common_1.NotFoundException('Invalid invitation token');
        }
        return invitation;
    }
    async hashPassword(password) {
        const saltRounds = this.configService.get('BCRYPT_SALT_ROUNDS', 12);
        return `hashed_${password}_${saltRounds}`;
    }
};
exports.InvitationService = InvitationService;
exports.InvitationService = InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('InvitationRepository')),
    __param(1, (0, common_1.Inject)('UserService')),
    __param(2, (0, common_1.Inject)('EmailService')),
    __param(3, (0, common_1.Inject)('ClientService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, config_1.ConfigService])
], InvitationService);
//# sourceMappingURL=invitation.service.js.map