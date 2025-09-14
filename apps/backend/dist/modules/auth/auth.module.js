"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../../prisma/prisma.module");
const send_verification_email_use_case_1 = require("./application/use-cases/send-verification-email.use-case");
const verify_email_use_case_1 = require("./application/use-cases/verify-email.use-case");
const create_user_use_case_1 = require("./application/use-cases/create-user.use-case");
const prisma_user_repository_1 = require("./infrastructure/repositories/prisma-user.repository");
const prisma_rate_limit_repository_1 = require("./infrastructure/repositories/prisma-rate-limit.repository");
const sendgrid_email_service_1 = require("./infrastructure/services/sendgrid-email.service");
const bcrypt_password_service_1 = require("./infrastructure/services/bcrypt-password.service");
const jwt_service_1 = require("./infrastructure/services/jwt.service");
const jwt_strategy_1 = require("./infrastructure/strategies/jwt.strategy");
const email_verification_controller_1 = require("./presentation/controllers/email-verification.controller");
const auth_controller_1 = require("./presentation/controllers/auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const secret = configService.get('JWT_SECRET');
                    if (!secret) {
                        throw new Error('JWT_SECRET not configured');
                    }
                    return {
                        secret,
                        signOptions: { expiresIn: '15m' },
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [email_verification_controller_1.EmailVerificationController, auth_controller_1.AuthController],
        providers: [
            send_verification_email_use_case_1.SendVerificationEmailUseCase,
            verify_email_use_case_1.VerifyEmailUseCase,
            create_user_use_case_1.CreateUserUseCase,
            {
                provide: 'EmailService',
                useClass: sendgrid_email_service_1.SendGridEmailService,
            },
            {
                provide: 'PasswordService',
                useClass: bcrypt_password_service_1.BcryptPasswordService,
            },
            jwt_service_1.JwtService,
            jwt_strategy_1.JwtStrategy,
            {
                provide: 'UserRepository',
                useClass: prisma_user_repository_1.PrismaUserRepository,
            },
            {
                provide: 'RateLimitRepository',
                useClass: prisma_rate_limit_repository_1.PrismaRateLimitRepository,
            },
        ],
        exports: [
            send_verification_email_use_case_1.SendVerificationEmailUseCase,
            verify_email_use_case_1.VerifyEmailUseCase,
            create_user_use_case_1.CreateUserUseCase,
            {
                provide: 'EmailService',
                useClass: sendgrid_email_service_1.SendGridEmailService,
            },
            {
                provide: 'PasswordService',
                useClass: bcrypt_password_service_1.BcryptPasswordService,
            },
            jwt_service_1.JwtService,
            {
                provide: 'UserRepository',
                useClass: prisma_user_repository_1.PrismaUserRepository,
            },
            {
                provide: 'RateLimitRepository',
                useClass: prisma_rate_limit_repository_1.PrismaRateLimitRepository,
            },
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map