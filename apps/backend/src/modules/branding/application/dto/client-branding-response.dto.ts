import { ThemeConfig } from '../../domain/entities/theme-config.entity';

export class ClientBrandingResponseDto {
  id!: string;
  clientId!: string;
  clientName!: string;
  logoUrl?: string;
  primaryColor!: string;
  secondaryColor!: string;
  accentColor!: string;
  backgroundColor!: string;
  surfaceColor!: string;
  textColor!: string;
  borderColor!: string;
  fontFamily!: string;
  borderRadius!: string;
  shadow!: string;
  customCSS?: string;
  theme!: ThemeConfig;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ClientBrandingResponseDto>) {
    Object.assign(this, data);
  }

  static fromEntity(branding: any, clientName: string, theme: ThemeConfig): ClientBrandingResponseDto {
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