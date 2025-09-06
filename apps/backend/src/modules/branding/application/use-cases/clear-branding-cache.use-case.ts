import { Injectable, Inject, Logger } from '@nestjs/common';
import { CacheService } from '../interfaces/cache.service.interface';

@Injectable()
export class ClearBrandingCacheUseCase {
  private readonly logger = new Logger(ClearBrandingCacheUseCase.name);
  private readonly CACHE_PREFIX = 'branding:';

  constructor(
    @Inject('CacheService')
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Clear cache for a specific client
   */
  async clearClientCache(clientId: string): Promise<void> {
    try {
      await this.cacheService.del(`${this.CACHE_PREFIX}${clientId}`);
      this.logger.log(`Cache cleared for client: ${clientId}`);
    } catch (error) {
      this.logger.error(`Failed to clear cache for client ${clientId}:`, error);
      throw new Error('Failed to clear client cache');
    }
  }

  /**
   * Clear cache for all domains
   */
  async clearDomainCache(): Promise<void> {
    try {
      await this.cacheService.delPattern(`${this.CACHE_PREFIX}domain:*`);
      this.logger.log('All domain cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear domain cache:', error);
      throw new Error('Failed to clear domain cache');
    }
  }

  /**
   * Clear all branding cache
   */
  async clearAllBrandingCache(): Promise<void> {
    try {
      await this.cacheService.delPattern(`${this.CACHE_PREFIX}*`);
      this.logger.log('All branding cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear all branding cache:', error);
      throw new Error('Failed to clear all branding cache');
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    clientKeys: number;
    domainKeys: number;
  }> {
    try {
      // Note: This is a simplified implementation
      // In a real Redis implementation, you'd use SCAN for better performance
      const allKeys = await this.getAllBrandingCacheKeys();
      
      const clientKeys = allKeys.filter(key => 
        key.startsWith(`${this.CACHE_PREFIX}`) && 
        !key.includes('domain:')
      ).length;
      
      const domainKeys = allKeys.filter(key => 
        key.includes(`${this.CACHE_PREFIX}domain:`)
      ).length;

      return {
        totalKeys: allKeys.length,
        clientKeys,
        domainKeys,
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats:', error);
      throw new Error('Failed to get cache statistics');
    }
  }

  /**
   * Check if a specific cache key exists and get its TTL
   */
  async getCacheInfo(clientId: string): Promise<{
    exists: boolean;
    ttl: number;
    key: string;
  }> {
    try {
      const key = `${this.CACHE_PREFIX}${clientId}`;
      const exists = await this.cacheService.exists(key);
      const ttl = exists ? await this.cacheService.ttl(key) : -1;

      return {
        exists,
        ttl,
        key,
      };
    } catch (error) {
      this.logger.error(`Failed to get cache info for ${clientId}:`, error);
      throw new Error('Failed to get cache information');
    }
  }

  private async getAllBrandingCacheKeys(): Promise<string[]> {
    // This is a simplified implementation
    // In production, you'd implement this based on your cache service
    // For Redis, you'd use SCAN command
    return [];
  }
} 