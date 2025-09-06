import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { BrandingRepository } from '../interfaces/branding.repository.interface';
import { CacheService } from '../interfaces/cache.service.interface';
import { UpdateBrandingDto } from '../dto/update-branding.dto';
import { ClientBrandingResponseDto } from '../dto/client-branding-response.dto';
import { GetClientBrandingUseCase } from './get-client-branding.use-case';

@Injectable()
export class UpdateBrandingUseCase {
  private readonly logger = new Logger(UpdateBrandingUseCase.name);
  private readonly CACHE_PREFIX = 'branding:';

  constructor(
    @Inject('BrandingRepository')
    private readonly brandingRepository: BrandingRepository,
    @Inject('CacheService')
    private readonly cacheService: CacheService,
    private readonly getClientBrandingUseCase: GetClientBrandingUseCase,
  ) {}

  async execute(
    clientId: string,
    updateDto: UpdateBrandingDto,
  ): Promise<ClientBrandingResponseDto> {
    try {
      this.logger.debug(`Updating branding for client: ${clientId}`);

      // Validate branding data
      await this.validateBrandingData(updateDto);

      // Update branding in repository
      const updatedBranding = await this.brandingRepository.upsert(
        clientId,
        updateDto,
      );

      // Invalidate cache
      await this.invalidateCache(clientId);

      // Get the updated branding with theme
      const result = await this.getClientBrandingUseCase.execute(clientId);

      this.logger.debug(
        `Successfully updated branding for client: ${clientId}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to update branding for client ${clientId}:`,
        error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Failed to update branding');
    }
  }

  private async validateBrandingData(
    updateDto: UpdateBrandingDto,
  ): Promise<void> {
    // Validate color contrast if both text and background colors are provided
    if (updateDto.textColor && updateDto.backgroundColor) {
      const contrast = this.calculateColorContrast(
        updateDto.textColor,
        updateDto.backgroundColor,
      );
      if (contrast < 4.5) {
        throw new BadRequestException(
          'Text and background colors do not meet accessibility contrast requirements (minimum 4.5:1)',
        );
      }
    }

    // Validate font family availability
    if (updateDto.fontFamily) {
      const allowedFonts = [
        'Inter',
        'Roboto',
        'Open Sans',
        'Lato',
        'Poppins',
        'system-ui',
        'sans-serif',
      ];
      if (!allowedFonts.includes(updateDto.fontFamily)) {
        throw new BadRequestException(
          `Font family must be one of: ${allowedFonts.join(', ')}`,
        );
      }
    }

    // Validate shadow format
    if (updateDto.shadow) {
      const shadowRegex =
        /^(\d+px\s+\d+px\s+\d+px\s+(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|\w+)|none)$/;
      if (!shadowRegex.test(updateDto.shadow.trim())) {
        throw new BadRequestException(
          'Shadow format is invalid. Use CSS shadow format like "0 1px 3px rgba(0,0,0,0.1)"',
        );
      }
    }

    // Validate custom CSS for security (basic check)
    if (updateDto.customCSS) {
      if (this.containsUnsafeCSS(updateDto.customCSS)) {
        throw new BadRequestException(
          'Custom CSS contains potentially unsafe content',
        );
      }
    }
  }

  private calculateColorContrast(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In production, you'd use a proper color contrast library
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private getLuminance(hex: string): number {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Calculate relative luminance
    const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
  }

  private containsUnsafeCSS(css: string): boolean {
    // Basic security check for potentially dangerous CSS
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

    return unsafePatterns.some((pattern) => pattern.test(css));
  }

  private async invalidateCache(clientId: string): Promise<void> {
    try {
      // Invalidate specific client cache
      await this.cacheService.del(`${this.CACHE_PREFIX}${clientId}`);

      // Invalidate domain cache pattern (if we knew the domain)
      await this.cacheService.delPattern(`${this.CACHE_PREFIX}domain:*`);

      this.logger.debug(`Cache invalidated for client: ${clientId}`);
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate cache for client ${clientId}:`,
        error,
      );
      // Don't throw error for cache invalidation failure
    }
  }
}
