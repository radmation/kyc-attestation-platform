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
var ClearBrandingCacheUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearBrandingCacheUseCase = void 0;
const common_1 = require("@nestjs/common");
let ClearBrandingCacheUseCase = ClearBrandingCacheUseCase_1 = class ClearBrandingCacheUseCase {
    constructor(cacheService) {
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(ClearBrandingCacheUseCase_1.name);
        this.CACHE_PREFIX = 'branding:';
    }
    async clearClientCache(clientId) {
        try {
            await this.cacheService.del(`${this.CACHE_PREFIX}${clientId}`);
            this.logger.log(`Cache cleared for client: ${clientId}`);
        }
        catch (error) {
            this.logger.error(`Failed to clear cache for client ${clientId}:`, error);
            throw new Error('Failed to clear client cache');
        }
    }
    async clearDomainCache() {
        try {
            await this.cacheService.delPattern(`${this.CACHE_PREFIX}domain:*`);
            this.logger.log('All domain cache cleared');
        }
        catch (error) {
            this.logger.error('Failed to clear domain cache:', error);
            throw new Error('Failed to clear domain cache');
        }
    }
    async clearAllBrandingCache() {
        try {
            await this.cacheService.delPattern(`${this.CACHE_PREFIX}*`);
            this.logger.log('All branding cache cleared');
        }
        catch (error) {
            this.logger.error('Failed to clear all branding cache:', error);
            throw new Error('Failed to clear all branding cache');
        }
    }
    async getCacheStats() {
        try {
            const allKeys = await this.getAllBrandingCacheKeys();
            const clientKeys = allKeys.filter(key => key.startsWith(`${this.CACHE_PREFIX}`) &&
                !key.includes('domain:')).length;
            const domainKeys = allKeys.filter(key => key.includes(`${this.CACHE_PREFIX}domain:`)).length;
            return {
                totalKeys: allKeys.length,
                clientKeys,
                domainKeys,
            };
        }
        catch (error) {
            this.logger.error('Failed to get cache stats:', error);
            throw new Error('Failed to get cache statistics');
        }
    }
    async getCacheInfo(clientId) {
        try {
            const key = `${this.CACHE_PREFIX}${clientId}`;
            const exists = await this.cacheService.exists(key);
            const ttl = exists ? await this.cacheService.ttl(key) : -1;
            return {
                exists,
                ttl,
                key,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get cache info for ${clientId}:`, error);
            throw new Error('Failed to get cache information');
        }
    }
    async getAllBrandingCacheKeys() {
        return [];
    }
};
exports.ClearBrandingCacheUseCase = ClearBrandingCacheUseCase;
exports.ClearBrandingCacheUseCase = ClearBrandingCacheUseCase = ClearBrandingCacheUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CacheService')),
    __metadata("design:paramtypes", [Object])
], ClearBrandingCacheUseCase);
//# sourceMappingURL=clear-branding-cache.use-case.js.map