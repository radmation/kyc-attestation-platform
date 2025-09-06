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
var GetClientBrandingUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClientBrandingUseCase = void 0;
const common_1 = require("@nestjs/common");
const branding_entity_1 = require("../../domain/entities/branding.entity");
const theme_config_entity_1 = require("../../domain/entities/theme-config.entity");
const client_branding_response_dto_1 = require("../dto/client-branding-response.dto");
let GetClientBrandingUseCase = GetClientBrandingUseCase_1 = class GetClientBrandingUseCase {
    constructor(brandingRepository, cacheService) {
        this.brandingRepository = brandingRepository;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(GetClientBrandingUseCase_1.name);
        this.CACHE_TTL = 300;
        this.CACHE_PREFIX = 'branding:';
    }
    async execute(clientId) {
        const cacheKey = `${this.CACHE_PREFIX}${clientId}`;
        try {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.debug(`Cache hit for branding: ${clientId}`);
                return cached;
            }
            const branding = await this.brandingRepository.findByClientId(clientId);
            let brandingWithDefaults;
            let clientName = 'Unknown Client';
            if (!branding) {
                this.logger.debug(`No branding found for client ${clientId}, using defaults`);
                brandingWithDefaults = this.createDefaultBranding(clientId);
            }
            else {
                brandingWithDefaults = branding.withDefaults();
                clientName = 'Client Name';
            }
            const theme = this.generateTheme(brandingWithDefaults);
            const response = client_branding_response_dto_1.ClientBrandingResponseDto.fromEntity(brandingWithDefaults, clientName, theme);
            await this.cacheService.set(cacheKey, response, this.CACHE_TTL);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to get branding for client ${clientId}:`, error);
            const defaultBranding = this.createDefaultBranding(clientId);
            const theme = this.generateTheme(defaultBranding);
            return client_branding_response_dto_1.ClientBrandingResponseDto.fromEntity(defaultBranding, 'Default Client', theme);
        }
    }
    async executeByDomain(domain) {
        const cacheKey = `${this.CACHE_PREFIX}domain:${domain}`;
        try {
            const cached = await this.cacheService.get(cacheKey);
            if (cached) {
                this.logger.debug(`Cache hit for domain branding: ${domain}`);
                return cached;
            }
            const branding = await this.brandingRepository.findByDomain(domain);
            if (!branding) {
                this.logger.debug(`No branding found for domain ${domain}, using defaults`);
                const defaultBranding = this.createDefaultBranding('default');
                const theme = this.generateTheme(defaultBranding);
                return client_branding_response_dto_1.ClientBrandingResponseDto.fromEntity(defaultBranding, 'Default Client', theme);
            }
            const brandingWithDefaults = branding.withDefaults();
            const theme = this.generateTheme(brandingWithDefaults);
            const response = client_branding_response_dto_1.ClientBrandingResponseDto.fromEntity(brandingWithDefaults, 'Client Name', theme);
            await this.cacheService.set(cacheKey, response, this.CACHE_TTL);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to get branding for domain ${domain}:`, error);
            const defaultBranding = this.createDefaultBranding('default');
            const theme = this.generateTheme(defaultBranding);
            return client_branding_response_dto_1.ClientBrandingResponseDto.fromEntity(defaultBranding, 'Default Client', theme);
        }
    }
    createDefaultBranding(clientId) {
        const defaults = branding_entity_1.Branding.getDefaults();
        return new branding_entity_1.Branding(`default-${clientId}`, clientId, undefined, defaults.primaryColor, defaults.secondaryColor, defaults.accentColor, defaults.backgroundColor, defaults.surfaceColor, defaults.textColor, defaults.borderColor, defaults.fontFamily, defaults.borderRadius, defaults.shadow, undefined);
    }
    generateTheme(branding) {
        const colors = {
            primary: branding.primaryColor || '#000000',
            secondary: branding.secondaryColor || '#666666',
            accent: branding.accentColor || '#007bff',
            background: branding.backgroundColor || '#ffffff',
            surface: branding.surfaceColor || '#f8f9fa',
            text: branding.textColor || '#212529',
            border: branding.borderColor || '#dee2e6',
        };
        const typography = {
            fontFamily: branding.fontFamily || 'Inter, system-ui, sans-serif',
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
            },
            fontWeight: {
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
            },
        };
        const spacing = {
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
            '2xl': '3rem',
        };
        const borderRadius = {
            none: '0',
            sm: '0.125rem',
            base: branding.borderRadius || '0.375rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            full: '9999px',
        };
        const shadows = {
            none: 'none',
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            base: branding.shadow || '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        };
        return new theme_config_entity_1.ThemeConfig(colors, typography, spacing, borderRadius, shadows);
    }
};
exports.GetClientBrandingUseCase = GetClientBrandingUseCase;
exports.GetClientBrandingUseCase = GetClientBrandingUseCase = GetClientBrandingUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('BrandingRepository')),
    __param(1, (0, common_1.Inject)('CacheService')),
    __metadata("design:paramtypes", [Object, Object])
], GetClientBrandingUseCase);
//# sourceMappingURL=get-client-branding.use-case.js.map