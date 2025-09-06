import { Injectable, Inject, Logger } from '@nestjs/common';
import { Branding } from '../../domain/entities/branding.entity';
import { ThemeConfig, ThemeColors, ThemeTypography, ThemeSpacing, ThemeBorderRadius, ThemeShadows } from '../../domain/entities/theme-config.entity';
import { BrandingRepository } from '../interfaces/branding.repository.interface';
import { CacheService } from '../interfaces/cache.service.interface';
import { ClientBrandingResponseDto } from '../dto/client-branding-response.dto';

@Injectable()
export class GetClientBrandingUseCase {
  private readonly logger = new Logger(GetClientBrandingUseCase.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_PREFIX = 'branding:';

  constructor(
    @Inject('BrandingRepository')
    private readonly brandingRepository: BrandingRepository,
    @Inject('CacheService')
    private readonly cacheService: CacheService,
  ) {}

  async execute(clientId: string): Promise<ClientBrandingResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}${clientId}`;

    try {
      // Check cache first
      const cached = await this.cacheService.get<ClientBrandingResponseDto>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for branding: ${clientId}`);
        return cached;
      }

      // Fetch from repository
      const branding = await this.brandingRepository.findByClientId(clientId);
      
      let brandingWithDefaults: Branding;
      let clientName = 'Unknown Client';

      if (!branding) {
        // Create default branding
        this.logger.debug(`No branding found for client ${clientId}, using defaults`);
        brandingWithDefaults = this.createDefaultBranding(clientId);
      } else {
        brandingWithDefaults = branding.withDefaults();
        // Note: In a real implementation, you'd fetch client name from client repository
        clientName = 'Client Name'; // Placeholder
      }

      // Generate theme configuration
      const theme = this.generateTheme(brandingWithDefaults);

      // Create response DTO
      const response = ClientBrandingResponseDto.fromEntity(
        brandingWithDefaults,
        clientName,
        theme
      );

      // Cache the result
      await this.cacheService.set(cacheKey, response, this.CACHE_TTL);

      return response;
    } catch (error) {
      this.logger.error(`Failed to get branding for client ${clientId}:`, error);
      
      // Return default branding on error
      const defaultBranding = this.createDefaultBranding(clientId);
      const theme = this.generateTheme(defaultBranding);
      
      return ClientBrandingResponseDto.fromEntity(
        defaultBranding,
        'Default Client',
        theme
      );
    }
  }

  async executeByDomain(domain: string): Promise<ClientBrandingResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}domain:${domain}`;

    try {
      // Check cache first
      const cached = await this.cacheService.get<ClientBrandingResponseDto>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for domain branding: ${domain}`);
        return cached;
      }

      // Fetch by domain
      const branding = await this.brandingRepository.findByDomain(domain);
      
      if (!branding) {
        this.logger.debug(`No branding found for domain ${domain}, using defaults`);
        const defaultBranding = this.createDefaultBranding('default');
        const theme = this.generateTheme(defaultBranding);
        
        return ClientBrandingResponseDto.fromEntity(
          defaultBranding,
          'Default Client',
          theme
        );
      }

      const brandingWithDefaults = branding.withDefaults();
      const theme = this.generateTheme(brandingWithDefaults);
      const response = ClientBrandingResponseDto.fromEntity(
        brandingWithDefaults,
        'Client Name', // Placeholder
        theme
      );

      // Cache the result
      await this.cacheService.set(cacheKey, response, this.CACHE_TTL);

      return response;
    } catch (error) {
      this.logger.error(`Failed to get branding for domain ${domain}:`, error);
      
      // Return default branding on error
      const defaultBranding = this.createDefaultBranding('default');
      const theme = this.generateTheme(defaultBranding);
      
      return ClientBrandingResponseDto.fromEntity(
        defaultBranding,
        'Default Client',
        theme
      );
    }
  }

  private createDefaultBranding(clientId: string): Branding {
    const defaults = Branding.getDefaults();
    return new Branding(
      `default-${clientId}`,
      clientId,
      undefined, // logoUrl
      defaults.primaryColor,
      defaults.secondaryColor,
      defaults.accentColor,
      defaults.backgroundColor,
      defaults.surfaceColor,
      defaults.textColor,
      defaults.borderColor,
      defaults.fontFamily,
      defaults.borderRadius,
      defaults.shadow,
      undefined, // customCSS
    );
  }

  private generateTheme(branding: Branding): ThemeConfig {
    const colors: ThemeColors = {
      primary: branding.primaryColor || '#000000',
      secondary: branding.secondaryColor || '#666666',
      accent: branding.accentColor || '#007bff',
      background: branding.backgroundColor || '#ffffff',
      surface: branding.surfaceColor || '#f8f9fa',
      text: branding.textColor || '#212529',
      border: branding.borderColor || '#dee2e6',
    };

    const typography: ThemeTypography = {
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

    const spacing: ThemeSpacing = {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    };

    const borderRadius: ThemeBorderRadius = {
      none: '0',
      sm: '0.125rem',
      base: branding.borderRadius || '0.375rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    };

    const shadows: ThemeShadows = {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: branding.shadow || '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    };

    return new ThemeConfig(colors, typography, spacing, borderRadius, shadows);
  }
} 