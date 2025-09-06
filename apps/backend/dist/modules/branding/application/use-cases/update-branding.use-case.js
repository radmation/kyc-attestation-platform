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
var UpdateBrandingUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBrandingUseCase = void 0;
const common_1 = require("@nestjs/common");
const get_client_branding_use_case_1 = require("./get-client-branding.use-case");
let UpdateBrandingUseCase = UpdateBrandingUseCase_1 = class UpdateBrandingUseCase {
    constructor(brandingRepository, cacheService, getClientBrandingUseCase) {
        this.brandingRepository = brandingRepository;
        this.cacheService = cacheService;
        this.getClientBrandingUseCase = getClientBrandingUseCase;
        this.logger = new common_1.Logger(UpdateBrandingUseCase_1.name);
        this.CACHE_PREFIX = 'branding:';
    }
    async execute(clientId, updateDto) {
        try {
            this.logger.debug(`Updating branding for client: ${clientId}`);
            await this.validateBrandingData(updateDto);
            const updatedBranding = await this.brandingRepository.upsert(clientId, updateDto);
            await this.invalidateCache(clientId);
            const result = await this.getClientBrandingUseCase.execute(clientId);
            this.logger.debug(`Successfully updated branding for client: ${clientId}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to update branding for client ${clientId}:`, error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update branding');
        }
    }
    async validateBrandingData(updateDto) {
        if (updateDto.textColor && updateDto.backgroundColor) {
            const contrast = this.calculateColorContrast(updateDto.textColor, updateDto.backgroundColor);
            if (contrast < 4.5) {
                throw new common_1.BadRequestException('Text and background colors do not meet accessibility contrast requirements (minimum 4.5:1)');
            }
        }
        if (updateDto.fontFamily) {
            const allowedFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'system-ui', 'sans-serif'];
            if (!allowedFonts.includes(updateDto.fontFamily)) {
                throw new common_1.BadRequestException(`Font family must be one of: ${allowedFonts.join(', ')}`);
            }
        }
        if (updateDto.shadow) {
            const shadowRegex = /^(\d+px\s+\d+px\s+\d+px\s+(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|\w+)|none)$/;
            if (!shadowRegex.test(updateDto.shadow.trim())) {
                throw new common_1.BadRequestException('Shadow format is invalid. Use CSS shadow format like "0 1px 3px rgba(0,0,0,0.1)"');
            }
        }
        if (updateDto.customCSS) {
            if (this.containsUnsafeCSS(updateDto.customCSS)) {
                throw new common_1.BadRequestException('Custom CSS contains potentially unsafe content');
            }
        }
    }
    calculateColorContrast(color1, color2) {
        const luminance1 = this.getLuminance(color1);
        const luminance2 = this.getLuminance(color2);
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        return (lighter + 0.05) / (darker + 0.05);
    }
    getLuminance(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
    }
    containsUnsafeCSS(css) {
        const unsafePatterns = [
            /@import/i,
            /javascript:/i,
            /expression\(/i,
            /behavior:/i,
            /binding:/i,
            /-moz-binding/i,
            /vbscript:/i,
            /data:/i,
            /<script/i,
            /<\/script/i,
        ];
        return unsafePatterns.some(pattern => pattern.test(css));
    }
    async invalidateCache(clientId) {
        try {
            await this.cacheService.del(`${this.CACHE_PREFIX}${clientId}`);
            await this.cacheService.delPattern(`${this.CACHE_PREFIX}domain:*`);
            this.logger.debug(`Cache invalidated for client: ${clientId}`);
        }
        catch (error) {
            this.logger.warn(`Failed to invalidate cache for client ${clientId}:`, error);
        }
    }
};
exports.UpdateBrandingUseCase = UpdateBrandingUseCase;
exports.UpdateBrandingUseCase = UpdateBrandingUseCase = UpdateBrandingUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('BrandingRepository')),
    __param(1, (0, common_1.Inject)('CacheService')),
    __metadata("design:paramtypes", [Object, Object, get_client_branding_use_case_1.GetClientBrandingUseCase])
], UpdateBrandingUseCase);
//# sourceMappingURL=update-branding.use-case.js.map