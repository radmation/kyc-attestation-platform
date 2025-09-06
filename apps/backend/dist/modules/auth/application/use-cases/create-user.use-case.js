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
exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../domain/entities/user.entity");
let CreateUserUseCase = class CreateUserUseCase {
    constructor(userRepository, passwordService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
    }
    async execute(command) {
        try {
            const existingUser = await this.userRepository.findByEmail(command.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'User with this email already exists',
                    error: 'Email already taken',
                };
            }
            if (!this.passwordService.validatePassword(command.password)) {
                return {
                    success: false,
                    message: 'Password does not meet requirements',
                    error: 'Invalid password',
                };
            }
            const hashedPassword = await this.passwordService.hashPassword(command.password);
            const createProps = {
                email: command.email,
                password: hashedPassword,
                clientId: command.clientId,
            };
            if (command.firstName)
                createProps.firstName = command.firstName;
            if (command.lastName)
                createProps.lastName = command.lastName;
            const user = user_entity_1.User.create(createProps);
            const savedUser = await this.userRepository.save(user);
            return {
                success: true,
                user: {
                    id: savedUser.id,
                    email: savedUser.email,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    clientId: savedUser.clientId,
                    role: savedUser.role,
                    accountStatus: savedUser.accountStatus,
                },
                message: 'User created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to create user',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __param(1, (0, common_1.Inject)('PasswordService')),
    __metadata("design:paramtypes", [Object, Object])
], CreateUserUseCase);
//# sourceMappingURL=create-user.use-case.js.map