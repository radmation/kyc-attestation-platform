import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Request,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../../../../shared/decorators/public.decorator';
import { GetClientBrandingUseCase } from '../../application/use-cases/get-client-branding.use-case';
import { UpdateBrandingUseCase } from '../../application/use-cases/update-branding.use-case';
import { ClearBrandingCacheUseCase } from '../../application/use-cases/clear-branding-cache.use-case';
import { UpdateBrandingDto } from '../../application/dto/update-branding.dto';
import { ClientBrandingResponseDto } from '../../application/dto/client-branding-response.dto';

@Controller('branding')
export class BrandingController {
  private readonly logger = new Logger(BrandingController.name);

  constructor(
    private readonly getClientBrandingUseCase: GetClientBrandingUseCase,
    private readonly updateBrandingUseCase: UpdateBrandingUseCase,
    private readonly clearBrandingCacheUseCase: ClearBrandingCacheUseCase,
  ) {}

  /**
   * Health check endpoint
   */
  @Public()
  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Test endpoint
   */
  @Public()
  @Get('test')
  getTest(): { message: string } {
    return { message: 'Branding API is working!' };
  }

  /**
   * Get branding by client ID
   */
  @Public()
  @Get('client/:clientId')
  async getClientBranding(
    @Param('clientId') clientId: string,
  ): Promise<ClientBrandingResponseDto> {
    try {
      this.logger.debug(`Getting branding for client: ${clientId}`);
      return await this.getClientBrandingUseCase.execute(clientId);
    } catch (error) {
      this.logger.error(
        `Failed to get branding for client ${clientId}:`,
        error,
      );
      throw new NotFoundException(`Branding not found for client ${clientId}`);
    }
  }

  /**
   * Get branding by domain
   */
  @Public()
  @Get('domain/:domain')
  async getBrandingByDomain(
    @Param('domain') domain: string,
  ): Promise<ClientBrandingResponseDto> {
    try {
      this.logger.debug(`Getting branding for domain: ${domain}`);
      return await this.getClientBrandingUseCase.executeByDomain(domain);
    } catch (error) {
      this.logger.error(`Failed to get branding for domain ${domain}:`, error);
      throw new NotFoundException(`Branding not found for domain ${domain}`);
    }
  }

  /**
   * Get current user's client branding (requires authentication)
   */
  @Get('current')
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is properly set up
  async getCurrentUserBranding(
    @Request() req: any,
  ): Promise<ClientBrandingResponseDto> {
    try {
      // For now, use a default client ID since auth isn't fully integrated
      const clientId = req.user?.clientId || 'default-client';
      this.logger.debug(
        `Getting current user branding for client: ${clientId}`,
      );
      return await this.getClientBrandingUseCase.execute(clientId);
    } catch (error) {
      this.logger.error(`Failed to get current user branding:`, error);
      throw new NotFoundException('Current user branding not found');
    }
  }

  /**
   * Update branding for a client
   */
  @Put('client/:clientId')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is properly set up
  // @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN) // Uncomment when roles are set up
  @HttpCode(HttpStatus.OK)
  async updateBranding(
    @Param('clientId') clientId: string,
    @Body() updateDto: UpdateBrandingDto,
    @Request() req: any,
  ): Promise<ClientBrandingResponseDto> {
    try {
      this.logger.debug(`Updating branding for client: ${clientId}`);

      // TODO: Validate user has permission to update this client's branding
      // await this.validateBrandingPermission(req.user, clientId);

      return await this.updateBrandingUseCase.execute(clientId, updateDto);
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

  /**
   * Create or update branding (POST endpoint for compatibility)
   */
  @Post('client/:clientId')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when auth is properly set up
  // @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN) // Uncomment when roles are set up
  async createOrUpdateBranding(
    @Param('clientId') clientId: string,
    @Body() updateDto: UpdateBrandingDto,
    @Request() req: any,
  ): Promise<ClientBrandingResponseDto> {
    // Delegate to the PUT endpoint logic
    return this.updateBranding(clientId, updateDto, req);
  }

  /**
   * Get theme configuration for a client
   */
  @Public()
  @Get('client/:clientId/theme')
  async getClientTheme(@Param('clientId') clientId: string): Promise<any> {
    try {
      this.logger.debug(`Getting theme for client: ${clientId}`);
      const branding = await this.getClientBrandingUseCase.execute(clientId);
      return branding.theme;
    } catch (error) {
      this.logger.error(`Failed to get theme for client ${clientId}:`, error);
      throw new NotFoundException(`Theme not found for client ${clientId}`);
    }
  }

  /**
   * Get CSS variables for a client
   */
  @Public()
  @Get('client/:clientId/css-variables')
  async getClientCSSVariables(
    @Param('clientId') clientId: string,
  ): Promise<{ css: string }> {
    try {
      this.logger.debug(`Getting CSS variables for client: ${clientId}`);
      const branding = await this.getClientBrandingUseCase.execute(clientId);
      return {
        css: branding.theme.toCSSVariables(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get CSS variables for client ${clientId}:`,
        error,
      );
      throw new NotFoundException(
        `CSS variables not found for client ${clientId}`,
      );
    }
  }

  /**
   * Clear cache for specific client (Admin only)
   */
  @Delete('cache/client/:clientId')
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when proper auth is set up
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearClientCache(@Param('clientId') clientId: string): Promise<void> {
    try {
      await this.clearBrandingCacheUseCase.clearClientCache(clientId);
      this.logger.log(`Cache cleared for client: ${clientId}`);
    } catch (error) {
      this.logger.error(`Failed to clear cache for client ${clientId}:`, error);
      throw new BadRequestException('Failed to clear client cache');
    }
  }

  /**
   * Clear all domain cache (Admin only)
   */
  @Delete('cache/domains')
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when proper auth is set up
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDomainCache(): Promise<void> {
    try {
      await this.clearBrandingCacheUseCase.clearDomainCache();
      this.logger.log('All domain cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear domain cache:', error);
      throw new BadRequestException('Failed to clear domain cache');
    }
  }

  /**
   * Clear all branding cache (Admin only)
   */
  @Delete('cache/all')
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when proper auth is set up
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAllCache(): Promise<void> {
    try {
      await this.clearBrandingCacheUseCase.clearAllBrandingCache();
      this.logger.log('All branding cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear all cache:', error);
      throw new BadRequestException('Failed to clear all cache');
    }
  }

  /**
   * Get cache statistics (Admin only)
   */
  @Get('cache/stats')
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when proper auth is set up
  async getCacheStats(): Promise<{
    totalKeys: number;
    clientKeys: number;
    domainKeys: number;
  }> {
    try {
      return await this.clearBrandingCacheUseCase.getCacheStats();
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      throw new BadRequestException('Failed to get cache statistics');
    }
  }

  /**
   * Get cache info for specific client (Admin only)
   */
  @Get('cache/client/:clientId/info')
  // @UseGuards(JwtAuthGuard, AdminGuard) // Uncomment when proper auth is set up
  async getCacheInfo(@Param('clientId') clientId: string): Promise<{
    exists: boolean;
    ttl: number;
    key: string;
  }> {
    try {
      return await this.clearBrandingCacheUseCase.getCacheInfo(clientId);
    } catch (error) {
      this.logger.error(`Failed to get cache info for ${clientId}:`, error);
      throw new BadRequestException('Failed to get cache information');
    }
  }

  // TODO: Implement when authentication is fully integrated
  // private async validateBrandingPermission(user: any, clientId: string): Promise<void> {
  //   if (user.role === UserRole.SUPER_ADMIN) {
  //     return; // Super admin can update any client's branding
  //   }
  //
  //   if (user.role === UserRole.CLIENT_ADMIN && user.clientId === clientId) {
  //     return; // Client admin can update their own client's branding
  //   }
  //
  //   throw new ForbiddenException('Insufficient permissions to update branding');
  // }
}
