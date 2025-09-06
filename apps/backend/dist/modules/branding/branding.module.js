"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const get_client_branding_use_case_1 = require("./application/use-cases/get-client-branding.use-case");
const update_branding_use_case_1 = require("./application/use-cases/update-branding.use-case");
const prisma_branding_repository_1 = require("./infrastructure/repositories/prisma-branding.repository");
const memory_cache_service_1 = require("./infrastructure/services/memory-cache.service");
const branding_controller_1 = require("./presentation/controllers/branding.controller");
let BrandingModule = class BrandingModule {
};
exports.BrandingModule = BrandingModule;
exports.BrandingModule = BrandingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
        ],
        controllers: [
            branding_controller_1.BrandingController,
        ],
        providers: [
            get_client_branding_use_case_1.GetClientBrandingUseCase,
            update_branding_use_case_1.UpdateBrandingUseCase,
            {
                provide: 'CacheService',
                useClass: memory_cache_service_1.MemoryCacheService,
            },
            {
                provide: 'BrandingRepository',
                useClass: prisma_branding_repository_1.PrismaBrandingRepository,
            },
        ],
        exports: [
            get_client_branding_use_case_1.GetClientBrandingUseCase,
            update_branding_use_case_1.UpdateBrandingUseCase,
            {
                provide: 'BrandingRepository',
                useClass: prisma_branding_repository_1.PrismaBrandingRepository,
            },
            {
                provide: 'CacheService',
                useClass: memory_cache_service_1.MemoryCacheService,
            },
        ],
    })
], BrandingModule);
//# sourceMappingURL=branding.module.js.map