"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientBrandingResponseDto = void 0;
class ClientBrandingResponseDto {
    constructor(data) {
        Object.assign(this, data);
    }
    static fromEntity(branding, clientName, theme) {
        return new ClientBrandingResponseDto({
            id: branding.id,
            clientId: branding.clientId,
            clientName,
            logoUrl: branding.logoUrl,
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            accentColor: branding.accentColor,
            backgroundColor: branding.backgroundColor,
            surfaceColor: branding.surfaceColor,
            textColor: branding.textColor,
            borderColor: branding.borderColor,
            fontFamily: branding.fontFamily,
            borderRadius: branding.borderRadius,
            shadow: branding.shadow,
            customCSS: branding.customCSS,
            theme,
            createdAt: branding.createdAt,
            updatedAt: branding.updatedAt,
        });
    }
}
exports.ClientBrandingResponseDto = ClientBrandingResponseDto;
//# sourceMappingURL=client-branding-response.dto.js.map