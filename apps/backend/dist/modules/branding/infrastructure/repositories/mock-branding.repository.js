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
var MockBrandingRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockBrandingRepository = void 0;
const common_1 = require("@nestjs/common");
const branding_entity_1 = require("../../domain/entities/branding.entity");
const crypto_1 = require("crypto");
let MockBrandingRepository = MockBrandingRepository_1 = class MockBrandingRepository {
    constructor() {
        this.logger = new common_1.Logger(MockBrandingRepository_1.name);
        this.brandingStore = new Map();
        this.initializeDefaults();
    }
    async findByClientId(clientId) {
        this.logger.debug(`Finding branding for client: ${clientId}`);
        return this.brandingStore.get(clientId) || null;
    }
    async findByDomain(domain) {
        this.logger.debug(`Finding branding for domain: ${domain}`);
        const domainToClientMap = {
            'example.com': 'client-1',
            'test.com': 'client-2',
            'demo.kyc-platform.com': 'client-3',
        };
        const clientId = domainToClientMap[domain];
        if (clientId) {
            return this.brandingStore.get(clientId) || null;
        }
        return null;
    }
    async upsert(clientId, brandingData) {
        this.logger.debug(`Upserting branding for client: ${clientId}`);
        const existing = this.brandingStore.get(clientId);
        if (existing) {
            const updated = existing.update(brandingData);
            this.brandingStore.set(clientId, updated);
            return updated;
        }
        else {
            const defaults = branding_entity_1.Branding.getDefaults();
            const newBranding = new branding_entity_1.Branding((0, crypto_1.randomUUID)(), clientId, brandingData.logoUrl, brandingData.primaryColor || defaults.primaryColor, brandingData.secondaryColor || defaults.secondaryColor, brandingData.accentColor || defaults.accentColor, brandingData.backgroundColor || defaults.backgroundColor, brandingData.surfaceColor || defaults.surfaceColor, brandingData.textColor || defaults.textColor, brandingData.borderColor || defaults.borderColor, brandingData.fontFamily || defaults.fontFamily, brandingData.borderRadius || defaults.borderRadius, brandingData.shadow || defaults.shadow, brandingData.customCSS);
            this.brandingStore.set(clientId, newBranding);
            return newBranding;
        }
    }
    async update(clientId, brandingData) {
        this.logger.debug(`Updating branding for client: ${clientId}`);
        const existing = this.brandingStore.get(clientId);
        if (!existing) {
            throw new Error(`Branding not found for client: ${clientId}`);
        }
        const updated = existing.update(brandingData);
        this.brandingStore.set(clientId, updated);
        return updated;
    }
    async delete(clientId) {
        this.logger.debug(`Deleting branding for client: ${clientId}`);
        this.brandingStore.delete(clientId);
    }
    async exists(clientId) {
        return this.brandingStore.has(clientId);
    }
    initializeDefaults() {
        const defaults = branding_entity_1.Branding.getDefaults();
        const defaultBranding = new branding_entity_1.Branding((0, crypto_1.randomUUID)(), 'default-client', undefined, defaults.primaryColor, defaults.secondaryColor, defaults.accentColor, defaults.backgroundColor, defaults.surfaceColor, defaults.textColor, defaults.borderColor, defaults.fontFamily, defaults.borderRadius, defaults.shadow);
        const client1Branding = new branding_entity_1.Branding((0, crypto_1.randomUUID)(), 'client-1', 'https://example.com/logo.png', '#1e40af', '#64748b', '#10b981', '#ffffff', '#f8fafc', '#1e293b', '#e2e8f0', 'Inter, system-ui, sans-serif', '0.5rem', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
        const client2Branding = new branding_entity_1.Branding((0, crypto_1.randomUUID)(), 'client-2', 'https://test.com/logo.png', '#dc2626', '#6b7280', '#f59e0b', '#fefefe', '#f9fafb', '#111827', '#d1d5db', 'Roboto, sans-serif', '0.25rem', '0 2px 4px 0 rgba(0, 0, 0, 0.06)');
        this.brandingStore.set('default-client', defaultBranding);
        this.brandingStore.set('client-1', client1Branding);
        this.brandingStore.set('client-2', client2Branding);
        this.logger.debug('Initialized mock branding data');
    }
    getAllBranding() {
        return new Map(this.brandingStore);
    }
    clearAll() {
        this.brandingStore.clear();
        this.initializeDefaults();
    }
};
exports.MockBrandingRepository = MockBrandingRepository;
exports.MockBrandingRepository = MockBrandingRepository = MockBrandingRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MockBrandingRepository);
//# sourceMappingURL=mock-branding.repository.js.map