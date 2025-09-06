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
exports.VerifyEmailUseCase = void 0;
const common_1 = require("@nestjs/common");
let VerifyEmailUseCase = class VerifyEmailUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(command) {
        try {
            const user = await this.userRepository.findByVerificationToken(command.token);
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid verification token',
                    error: 'Invalid verification token',
                };
            }
            if (user.emailVerificationExpires &&
                user.emailVerificationExpires < new Date()) {
                return {
                    success: false,
                    message: 'Verification token has expired',
                    error: 'Token expired',
                };
            }
            user.verifyEmail();
            await this.userRepository.update(user);
            return {
                success: true,
                message: 'Email verified successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to verify email',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
};
exports.VerifyEmailUseCase = VerifyEmailUseCase;
exports.VerifyEmailUseCase = VerifyEmailUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object])
], VerifyEmailUseCase);
//# sourceMappingURL=verify-email.use-case.js.map