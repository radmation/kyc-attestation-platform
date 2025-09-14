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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_user_use_case_1 = require("../../application/use-cases/create-user.use-case");
const create_user_dto_1 = require("../../application/dto/create-user.dto");
let AuthController = AuthController_1 = class AuthController {
    constructor(createUserUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async createUser(createUserDto) {
        this.logger.log(`Creating user with email: ${createUserDto.email}`);
        const command = {
            email: createUserDto.email,
            password: createUserDto.password,
            clientId: createUserDto.clientId,
        };
        if (createUserDto.firstName)
            command.firstName = createUserDto.firstName;
        if (createUserDto.lastName)
            command.lastName = createUserDto.lastName;
        const result = await this.createUserUseCase.execute(command);
        if (result.success) {
            this.logger.log(`User created successfully with ID: ${result.user?.id}`);
            return result;
        }
        else {
            this.logger.warn(`Failed to create user: ${result.error}`);
            return result;
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                user: {
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
                        accountStatus: { type: 'string', example: 'PENDING' },
                    },
                },
                message: { type: 'string', example: 'User created successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad request - Validation failed or user already exists',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: {
                    type: 'string',
                    example: 'User with this email already exists',
                },
                error: { type: 'string', example: 'Email already taken' },
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [create_user_use_case_1.CreateUserUseCase])
], AuthController);
//# sourceMappingURL=auth.controller.js.map