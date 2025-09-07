"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackendModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./modules/auth/auth.module");
const kyc_module_1 = require("./modules/kyc/kyc.module");
const invitation_module_1 = require("./modules/invitation/invitation.module");
const branding_module_1 = require("./modules/branding/branding.module");
const billing_module_1 = require("./modules/billing/billing.module");
const blockchain_module_1 = require("./blockchain/blockchain.module");
const jwt_auth_guard_1 = require("./shared/guards/jwt-auth.guard");
const roles_guard_1 = require("./shared/guards/roles.guard");
const database_module_1 = require("./database/database.module");
const health_module_1 = require("./health/health.module");
const security_middleware_1 = require("./shared/middleware/security.middleware");
const logging_middleware_1 = require("./shared/middleware/logging.middleware");
const rate_limit_config_1 = require("./shared/config/rate-limit.config");
let BackendModule = class BackendModule {
    configure(consumer) {
        consumer.apply(security_middleware_1.SecurityMiddleware, logging_middleware_1.LoggingMiddleware).forRoutes('*');
    }
};
exports.BackendModule = BackendModule;
exports.BackendModule = BackendModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: rate_limit_config_1.createRateLimitConfig,
                inject: [config_1.ConfigService],
            }),
            schedule_1.ScheduleModule.forRoot(),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            kyc_module_1.KycModule,
            invitation_module_1.InvitationModule,
            branding_module_1.BrandingModule,
            billing_module_1.BillingModule,
            blockchain_module_1.BlockchainModule,
            health_module_1.HealthModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], BackendModule);
//# sourceMappingURL=backend.module.js.map