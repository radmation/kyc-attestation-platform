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
var PrismaBrandingRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaBrandingRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const branding_entity_1 = require("../../domain/entities/branding.entity");
const crypto_1 = require("crypto");
let PrismaBrandingRepository = PrismaBrandingRepository_1 = class PrismaBrandingRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PrismaBrandingRepository_1.name);
    }
    async findByClientId(clientId) {
        try {
            const branding = await this.prisma.branding.findUnique({
                where: { clientId },
                include: { client: true },
            });
            if (!branding) {
                return null;
            }
            return new branding_entity_1.Branding(branding.id, branding.clientId, branding.logoUrl || undefined, branding.primaryColor || undefined, branding.secondaryColor || undefined, branding.accentColor || undefined, branding.backgroundColor || undefined, branding.surfaceColor || undefined, branding.textColor || undefined, branding.borderColor || undefined, branding.fontFamily || undefined, branding.borderRadius || undefined, branding.shadow || undefined, branding.customCSS || undefined, branding.createdAt, branding.updatedAt);
        }
        catch (error) {
            this.logger.error(`Failed to find branding by client ID ${clientId}:`, error);
            throw error;
        }
    }
    async findByDomain(domain) {
        try {
            const subdomain = domain.split('.')[0];
            const client = await this.prisma.client.findFirst({
                where: {
                    OR: [{ domain }, { subdomain: subdomain || null }],
                },
                include: { branding: true },
            });
            if (!client || !client.branding) {
                return null;
            }
            const branding = client.branding;
            return new branding_entity_1.Branding(branding.id, branding.clientId, branding.logoUrl || undefined, branding.primaryColor || undefined, branding.secondaryColor || undefined, branding.accentColor || undefined, branding.backgroundColor || undefined, branding.surfaceColor || undefined, branding.textColor || undefined, branding.borderColor || undefined, branding.fontFamily || undefined, branding.borderRadius || undefined, branding.shadow || undefined, branding.customCSS || undefined, branding.createdAt, branding.updatedAt);
        }
        catch (error) {
            this.logger.error(`Failed to find branding by domain ${domain}:`, error);
            throw error;
        }
    }
    async upsert(clientId, brandingData) {
        try {
            const branding = await this.prisma.branding.upsert({
                where: { clientId },
                update: {
                    logoUrl: brandingData.logoUrl,
                    primaryColor: brandingData.primaryColor,
                    secondaryColor: brandingData.secondaryColor,
                    accentColor: brandingData.accentColor,
                    backgroundColor: brandingData.backgroundColor,
                    surfaceColor: brandingData.surfaceColor,
                    textColor: brandingData.textColor,
                    borderColor: brandingData.borderColor,
                    fontFamily: brandingData.fontFamily,
                    borderRadius: brandingData.borderRadius,
                    shadow: brandingData.shadow,
                    customCSS: brandingData.customCSS,
                },
                create: {
                    id: (0, crypto_1.randomUUID)(),
                    clientId,
                    logoUrl: brandingData.logoUrl,
                    primaryColor: brandingData.primaryColor,
                    secondaryColor: brandingData.secondaryColor,
                    accentColor: brandingData.accentColor,
                    backgroundColor: brandingData.backgroundColor,
                    surfaceColor: brandingData.surfaceColor,
                    textColor: brandingData.textColor,
                    borderColor: brandingData.borderColor,
                    fontFamily: brandingData.fontFamily,
                    borderRadius: brandingData.borderRadius,
                    shadow: brandingData.shadow,
                    customCSS: brandingData.customCSS,
                },
            });
            return new branding_entity_1.Branding(branding.id, branding.clientId, branding.logoUrl || undefined, branding.primaryColor || undefined, branding.secondaryColor || undefined, branding.accentColor || undefined, branding.backgroundColor || undefined, branding.surfaceColor || undefined, branding.textColor || undefined, branding.borderColor || undefined, branding.fontFamily || undefined, branding.borderRadius || undefined, branding.shadow || undefined, branding.customCSS || undefined, branding.createdAt, branding.updatedAt);
        }
        catch (error) {
            this.logger.error(`Failed to upsert branding for client ${clientId}:`, error);
            throw error;
        }
    }
    async update(clientId, brandingData) {
        try {
            const branding = await this.prisma.branding.update({
                where: { clientId },
                data: {
                    logoUrl: brandingData.logoUrl,
                    primaryColor: brandingData.primaryColor,
                    secondaryColor: brandingData.secondaryColor,
                    accentColor: brandingData.accentColor,
                    backgroundColor: brandingData.backgroundColor,
                    surfaceColor: brandingData.surfaceColor,
                    textColor: brandingData.textColor,
                    borderColor: brandingData.borderColor,
                    fontFamily: brandingData.fontFamily,
                    borderRadius: brandingData.borderRadius,
                    shadow: brandingData.shadow,
                    customCSS: brandingData.customCSS,
                },
            });
            return new branding_entity_1.Branding(branding.id, branding.clientId, branding.logoUrl || undefined, branding.primaryColor || undefined, branding.secondaryColor || undefined, branding.accentColor || undefined, branding.backgroundColor || undefined, branding.surfaceColor || undefined, branding.textColor || undefined, branding.borderColor || undefined, branding.fontFamily || undefined, branding.borderRadius || undefined, branding.shadow || undefined, branding.customCSS || undefined, branding.createdAt, branding.updatedAt);
        }
        catch (error) {
            this.logger.error(`Failed to update branding for client ${clientId}:`, error);
            throw error;
        }
    }
    async delete(clientId) {
        try {
            await this.prisma.branding.delete({
                where: { clientId },
            });
        }
        catch (error) {
            this.logger.error(`Failed to delete branding for client ${clientId}:`, error);
            throw error;
        }
    }
    async exists(clientId) {
        try {
            const count = await this.prisma.branding.count({
                where: { clientId },
            });
            return count > 0;
        }
        catch (error) {
            this.logger.error(`Failed to check branding existence for client ${clientId}:`, error);
            throw error;
        }
    }
};
exports.PrismaBrandingRepository = PrismaBrandingRepository;
exports.PrismaBrandingRepository = PrismaBrandingRepository = PrismaBrandingRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaBrandingRepository);
//# sourceMappingURL=prisma-branding.repository.js.map