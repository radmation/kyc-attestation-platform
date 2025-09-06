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
exports.InvitationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const invitation_service_1 = require("../application/services/invitation.service");
const dto_1 = require("../dto");
let InvitationController = class InvitationController {
    constructor(invitationService) {
        this.invitationService = invitationService;
    }
    async createInvitation(createInvitationDto, req) {
        return this.invitationService.createInvitation({
            ...createInvitationDto,
            invitedBy: req.user.id,
        });
    }
    async createBulkInvitations(bulkInvitationDto, req) {
        return this.invitationService.createBulkInvitations({
            ...bulkInvitationDto,
            invitedBy: req.user.id,
        });
    }
    async acceptInvitation(token, acceptInvitationDto) {
        const user = await this.invitationService.acceptInvitation(token, acceptInvitationDto);
        return {
            user,
            message: 'Invitation accepted successfully. Welcome to the platform!',
        };
    }
    async resendInvitation(id, req) {
        await this.invitationService.resendInvitation(id, req.user.id);
        return { message: 'Invitation resent successfully' };
    }
    async revokeInvitation(id, req) {
        await this.invitationService.revokeInvitation(id, req.user.id);
        return { message: 'Invitation revoked successfully' };
    }
    async getInvitations(query, req) {
        return this.invitationService.getInvitations(query, req.user.clientId);
    }
    async getInvitation(id) {
        const invitation = await this.invitationService.getInvitation(id);
        if (!invitation) {
            throw new common_1.NotFoundException('Invitation not found');
        }
        return invitation;
    }
    async validateInvitationToken(token) {
        try {
            const invitation = await this.invitationService.findInvitationByToken(token);
            if (!invitation) {
                return {
                    valid: false,
                    message: 'Invalid or expired token',
                };
            }
            if (invitation.expiresAt && invitation.expiresAt < new Date()) {
                return {
                    valid: false,
                    message: 'Token has expired',
                };
            }
            return {
                valid: true,
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    firstName: invitation.firstName,
                    lastName: invitation.lastName,
                    role: invitation.role,
                    expiresAt: invitation.expiresAt,
                    status: invitation.status,
                },
                message: 'Token is valid',
            };
        }
        catch (error) {
            return {
                valid: false,
                message: error.message || 'Invalid or expired token',
            };
        }
    }
};
exports.InvitationController = InvitationController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new invitation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Invitation created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid invitation data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "createInvitation", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Create multiple invitations at once' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Bulk invitations processed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid bulk invitation data' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BulkInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "createBulkInvitations", null);
__decorate([
    (0, common_1.Post)(':token/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an invitation using token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation accepted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token or invitation data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AcceptInvitationDto]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "acceptInvitation", null);
__decorate([
    (0, common_1.Post)(':id/resend'),
    (0, swagger_1.ApiOperation)({ summary: 'Resend invitation email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation resent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot resend invitation' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "resendInvitation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke an invitation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Invitation revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot revoke invitation' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "revokeInvitation", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get invitations with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitations retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GetInvitationsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getInvitations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invitation by ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Invitation retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "getInvitation", null);
__decorate([
    (0, common_1.Get)('token/:token/validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate invitation token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token is valid' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token is invalid or expired' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Invitation not found' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvitationController.prototype, "validateInvitationToken", null);
exports.InvitationController = InvitationController = __decorate([
    (0, swagger_1.ApiTags)('invitations'),
    (0, common_1.Controller)('api/v1/invitations'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [invitation_service_1.InvitationService])
], InvitationController);
//# sourceMappingURL=invitation.controller.js.map