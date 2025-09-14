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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../shared/guards/jwt-auth.guard");
const roles_guard_1 = require("../../../../shared/guards/roles.guard");
const roles_decorator_1 = require("../../../../shared/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_user_repository_1 = require("../../../auth/infrastructure/repositories/prisma-user.repository");
let UsersController = UsersController_1 = class UsersController {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(UsersController_1.name);
    }
    async listUsers(req) {
        const { user } = req;
        const clientId = user.clientId;
        this.logger.log(`Listing users for client: ${clientId}`);
        try {
            const users = await this.userRepository.findByClientId(clientId);
            const sanitizedUsers = users.map((user) => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                clientId: user.clientId,
                role: user.role,
                accountStatus: user.accountStatus,
                isActive: user.isActive,
                emailVerified: user.emailVerified,
                verificationEmailCount: user.verificationEmailCount,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));
            this.logger.log(`Found ${sanitizedUsers.length} users for client: ${clientId}`);
            return sanitizedUsers;
        }
        catch (error) {
            this.logger.error(`Failed to list users for client ${clientId}:`, error);
            throw error;
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List all users for the authenticated client' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully retrieved list of users',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    email: { type: 'string', example: 'user@example.com' },
                    firstName: { type: 'string', example: 'John' },
                    lastName: { type: 'string', example: 'Doe' },
                    clientId: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    role: { type: 'string', example: 'CLIENT_USER' },
                    accountStatus: { type: 'string', example: 'ACTIVE' },
                    isActive: { type: 'boolean', example: true },
                    emailVerified: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or missing JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User does not have CLIENT_ADMIN role',
    }),
    (0, roles_decorator_1.Roles)(client_1.UserRole.CLIENT_ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listUsers", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [prisma_user_repository_1.PrismaUserRepository])
], UsersController);
//# sourceMappingURL=users.controller.js.map