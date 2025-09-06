"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeConfig = void 0;
class ThemeConfig {
    constructor(colors, typography, spacing, borderRadius, shadows) {
        this.colors = colors;
        this.typography = typography;
        this.spacing = spacing;
        this.borderRadius = borderRadius;
        this.shadows = shadows;
    }
    toCSSVariables() {
        return `
      :root {
        /* Colors */
        --color-primary: ${this.colors.primary};
        --color-secondary: ${this.colors.secondary};
        --color-accent: ${this.colors.accent};
        --color-background: ${this.colors.background};
        --color-surface: ${this.colors.surface};
        --color-text: ${this.colors.text};
        --color-border: ${this.colors.border};
        
        /* Typography */
        --font-family: ${this.typography.fontFamily};
        --font-size-xs: ${this.typography.fontSize.xs};
        --font-size-sm: ${this.typography.fontSize.sm};
        --font-size-base: ${this.typography.fontSize.base};
        --font-size-lg: ${this.typography.fontSize.lg};
        --font-size-xl: ${this.typography.fontSize.xl};
        --font-size-2xl: ${this.typography.fontSize['2xl']};
        --font-size-3xl: ${this.typography.fontSize['3xl']};
        --font-size-4xl: ${this.typography.fontSize['4xl']};
        --font-weight-normal: ${this.typography.fontWeight.normal};
        --font-weight-medium: ${this.typography.fontWeight.medium};
        --font-weight-semibold: ${this.typography.fontWeight.semibold};
        --font-weight-bold: ${this.typography.fontWeight.bold};
        
        /* Spacing */
        --spacing-xs: ${this.spacing.xs};
        --spacing-sm: ${this.spacing.sm};
        --spacing-md: ${this.spacing.md};
        --spacing-lg: ${this.spacing.lg};
        --spacing-xl: ${this.spacing.xl};
        --spacing-2xl: ${this.spacing['2xl']};
        
        /* Border Radius */
        --border-radius-none: ${this.borderRadius.none};
        --border-radius-sm: ${this.borderRadius.sm};
        --border-radius-base: ${this.borderRadius.base};
        --border-radius-md: ${this.borderRadius.md};
        --border-radius-lg: ${this.borderRadius.lg};
        --border-radius-xl: ${this.borderRadius.xl};
        --border-radius-full: ${this.borderRadius.full};
        
        /* Shadows */
        --shadow-none: ${this.shadows.none};
        --shadow-sm: ${this.shadows.sm};
        --shadow-base: ${this.shadows.base};
        --shadow-md: ${this.shadows.md};
        --shadow-lg: ${this.shadows.lg};
        --shadow-xl: ${this.shadows.xl};
      }
    `;
    }
    toJSON() {
        return {
            colors: this.colors,
            typography: this.typography,
            spacing: this.spacing,
            borderRadius: this.borderRadius,
            shadows: this.shadows,
        };
    }
}
exports.ThemeConfig = ThemeConfig;
//# sourceMappingURL=theme-config.entity.js.map