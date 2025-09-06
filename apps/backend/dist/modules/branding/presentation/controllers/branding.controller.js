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
var BrandingController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandingController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../../../shared/decorators/public.decorator");
const get_client_branding_use_case_1 = require("../../application/use-cases/get-client-branding.use-case");
const update_branding_use_case_1 = require("../../application/use-cases/update-branding.use-case");
const clear_branding_cache_use_case_1 = require("../../application/use-cases/clear-branding-cache.use-case");
const update_branding_dto_1 = require("../../application/dto/update-branding.dto");
let BrandingController = BrandingController_1 = class BrandingController {
    constructor(getClientBrandingUseCase, updateBrandingUseCase, clearBrandingCacheUseCase) {
        this.getClientBrandingUseCase = getClientBrandingUseCase;
        this.updateBrandingUseCase = updateBrandingUseCase;
        this.clearBrandingCacheUseCase = clearBrandingCacheUseCase;
        this.logger = new common_1.Logger(BrandingController_1.name);
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    getTest() {
        return { message: 'Branding API is working!' };
    }
    async getClientBranding(clientId) {
        try {
            this.logger.debug(`Getting branding for client: ${clientId}`);
            return await this.getClientBrandingUseCase.execute(clientId);
        }
        catch (error) {
            this.logger.error(`Failed to get branding for client ${clientId}:`, error);
            throw new common_1.NotFoundException(`Branding not found for client ${clientId}`);
        }
    }
    async getBrandingByDomain(domain) {
        try {
            this.logger.debug(`Getting branding for domain: ${domain}`);
            return await this.getClientBrandingUseCase.executeByDomain(domain);
        }
        catch (error) {
            this.logger.error(`Failed to get branding for domain ${domain}:`, error);
            throw new common_1.NotFoundException(`Branding not found for domain ${domain}`);
        }
    }
    async getCurrentUserBranding(req) {
        try {
            const clientId = req.user?.clientId || 'default-client';
            this.logger.debug(`Getting current user branding for client: ${clientId}`);
            return await this.getClientBrandingUseCase.execute(clientId);
        }
        catch (error) {
            this.logger.error(`Failed to get current user branding:`, error);
            throw new common_1.NotFoundException('Current user branding not found');
        }
    }
    async updateBranding(clientId, updateDto, req) {
        try {
            this.logger.debug(`Updating branding for client: ${clientId}`);
            return await this.updateBrandingUseCase.execute(clientId, updateDto);
        }
        catch (error) {
            this.logger.error(`Failed to update branding for client ${clientId}:`, error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update branding');
        }
    }
    async createOrUpdateBranding(clientId, updateDto, req) {
        return this.updateBranding(clientId, updateDto, req);
    }
    async getClientTheme(clientId) {
        try {
            this.logger.debug(`Getting theme for client: ${clientId}`);
            const branding = await this.getClientBrandingUseCase.execute(clientId);
            return branding.theme;
        }
        catch (error) {
            this.logger.error(`Failed to get theme for client ${clientId}:`, error);
            throw new common_1.NotFoundException(`Theme not found for client ${clientId}`);
        }
    }
    async getClientCSSVariables(clientId) {
        try {
            this.logger.debug(`Getting CSS variables for client: ${clientId}`);
            const branding = await this.getClientBrandingUseCase.execute(clientId);
            return {
                css: branding.theme.toCSSVariables(),
            };
        }
        catch (error) {
            this.logger.error(`Failed to get CSS variables for client ${clientId}:`, error);
            throw new common_1.NotFoundException(`CSS variables not found for client ${clientId}`);
        }
    }
    async clearClientCache(clientId) {
        try {
            await this.clearBrandingCacheUseCase.clearClientCache(clientId);
            this.logger.log(`Cache cleared for client: ${clientId}`);
        }
        catch (error) {
            this.logger.error(`Failed to clear cache for client ${clientId}:`, error);
            throw new common_1.BadRequestException('Failed to clear client cache');
        }
    }
    async clearDomainCache() {
        try {
            await this.clearBrandingCacheUseCase.clearDomainCache();
            this.logger.log('All domain cache cleared');
        }
        catch (error) {
            this.logger.error('Failed to clear domain cache:', error);
            throw new common_1.BadRequestException('Failed to clear domain cache');
        }
    }
    async clearAllCache() {
        try {
            await this.clearBrandingCacheUseCase.clearAllBrandingCache();
            this.logger.log('All branding cache cleared');
        }
        catch (error) {
            this.logger.error('Failed to clear all cache:', error);
            throw new common_1.BadRequestException('Failed to clear all cache');
        }
    }
    async getCacheStats() {
        try {
            return await this.clearBrandingCacheUseCase.getCacheStats();
        }
        catch (error) {
            this.logger.error('Failed to get cache stats:', error);
            throw new common_1.BadRequestException('Failed to get cache statistics');
        }
    }
    async getCacheInfo(clientId) {
        try {
            return await this.clearBrandingCacheUseCase.getCacheInfo(clientId);
        }
        catch (error) {
            this.logger.error(`Failed to get cache info for ${clientId}:`, error);
            throw new common_1.BadRequestException('Failed to get cache information');
        }
    }
};
exports.BrandingController = BrandingController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], BrandingController.prototype, "getHealth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], BrandingController.prototype, "getTest", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('client/:clientId'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getClientBranding", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('domain/:domain'),
    __param(0, (0, common_1.Param)('domain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getBrandingByDomain", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getCurrentUserBranding", null);
__decorate([
    (0, common_1.Put)('client/:clientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branding_dto_1.UpdateBrandingDto, Object]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "updateBranding", null);
__decorate([
    (0, common_1.Post)('client/:clientId'),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branding_dto_1.UpdateBrandingDto, Object]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "createOrUpdateBranding", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('client/:clientId/theme'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getClientTheme", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('client/:clientId/css-variables'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getClientCSSVariables", null);
__decorate([
    (0, common_1.Delete)('cache/client/:clientId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "clearClientCache", null);
__decorate([
    (0, common_1.Delete)('cache/domains'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "clearDomainCache", null);
__decorate([
    (0, common_1.Delete)('cache/all'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "clearAllCache", null);
__decorate([
    (0, common_1.Get)('cache/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Get)('cache/client/:clientId/info'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandingController.prototype, "getCacheInfo", null);
exports.BrandingController = BrandingController = BrandingController_1 = __decorate([
    (0, common_1.Controller)('branding'),
    __metadata("design:paramtypes", [get_client_branding_use_case_1.GetClientBrandingUseCase,
        update_branding_use_case_1.UpdateBrandingUseCase,
        clear_branding_cache_use_case_1.ClearBrandingCacheUseCase])
], BrandingController);
//# sourceMappingURL=branding.controller.js.map