"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branding = void 0;
class Branding {
    constructor(id, clientId, logoUrl, primaryColor, secondaryColor, accentColor, backgroundColor, surfaceColor, textColor, borderColor, fontFamily, borderRadius, shadow, customCSS, createdAt = new Date(), updatedAt = new Date()) {
        this.id = id;
        this.clientId = clientId;
        this.logoUrl = logoUrl;
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
        this.accentColor = accentColor;
        this.backgroundColor = backgroundColor;
        this.surfaceColor = surfaceColor;
        this.textColor = textColor;
        this.borderColor = borderColor;
        this.fontFamily = fontFamily;
        this.borderRadius = borderRadius;
        this.shadow = shadow;
        this.customCSS = customCSS;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    update(updates) {
        return new Branding(this.id, this.clientId, updates.logoUrl ?? this.logoUrl, updates.primaryColor ?? this.primaryColor, updates.secondaryColor ?? this.secondaryColor, updates.accentColor ?? this.accentColor, updates.backgroundColor ?? this.backgroundColor, updates.surfaceColor ?? this.surfaceColor, updates.textColor ?? this.textColor, updates.borderColor ?? this.borderColor, updates.fontFamily ?? this.fontFamily, updates.borderRadius ?? this.borderRadius, updates.shadow ?? this.shadow, updates.customCSS ?? this.customCSS, this.createdAt, new Date());
    }
    static getDefaults() {
        return {
            primaryColor: '#000000',
            secondaryColor: '#666666',
            accentColor: '#007bff',
            backgroundColor: '#ffffff',
            surfaceColor: '#f8f9fa',
            textColor: '#212529',
            borderColor: '#dee2e6',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '0.375rem',
            shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        };
    }
    withDefaults() {
        const defaults = Branding.getDefaults();
        return new Branding(this.id, this.clientId, this.logoUrl, this.primaryColor ?? defaults.primaryColor, this.secondaryColor ?? defaults.secondaryColor, this.accentColor ?? defaults.accentColor, this.backgroundColor ?? defaults.backgroundColor, this.surfaceColor ?? defaults.surfaceColor, this.textColor ?? defaults.textColor, this.borderColor ?? defaults.borderColor, this.fontFamily ?? defaults.fontFamily, this.borderRadius ?? defaults.borderRadius, this.shadow ?? defaults.shadow, this.customCSS, this.createdAt, this.updatedAt);
    }
    toJSON() {
        return {
            id: this.id,
            clientId: this.clientId,
            logoUrl: this.logoUrl,
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            accentColor: this.accentColor,
            backgroundColor: this.backgroundColor,
            surfaceColor: this.surfaceColor,
            textColor: this.textColor,
            borderColor: this.borderColor,
            fontFamily: this.fontFamily,
            borderRadius: this.borderRadius,
            shadow: this.shadow,
            customCSS: this.customCSS,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
exports.Branding = Branding;
//# sourceMappingURL=branding.entity.js.map