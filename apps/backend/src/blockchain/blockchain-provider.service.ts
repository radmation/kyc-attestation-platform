/**
 * Blockchain Provider Manager Service
 * 
 * Service for managing blockchain provider instances, including caching,
 * lifecycle management, health checking, and provider switching logic.
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  BlockchainProvider, 
  BlockchainProviderType,
  AttestationRequest,
  AttestationData,
  BlockchainResult,
  AttestationStatus
} from './interfaces/blockchain-provider.interface';
import { BlockchainProviderFactory } from './blockchain-provider.factory';
import { ProviderConfiguration } from './types/provider-config.types';

/**
 * Provider health status information
 */
interface ProviderHealthStatus {
  isHealthy: boolean;
  lastChecked: Date;
  consecutiveFailures: number;
  errorMessage?: string;
}

/**
 * Provider performance metrics
 */
interface ProviderMetrics {
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
}

@Injectable()
export class BlockchainProviderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainProviderService.name);
  private readonly healthStatus = new Map<string, ProviderHealthStatus>();
  private readonly metrics = new Map<string, ProviderMetrics>();
  private readonly primaryProvider: { type: BlockchainProviderType; network: string };
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly providerFactory: BlockchainProviderFactory,
    private readonly configService: ConfigService
  ) {
    // Configure primary provider from environment
    this.primaryProvider = {
      type: this.configService.get<BlockchainProviderType>('PRIMARY_BLOCKCHAIN_PROVIDER', BlockchainProviderType.HYPERLEDGER_FABRIC),
      network: this.configService.get<string>('PRIMARY_BLOCKCHAIN_NETWORK', 'kycchannel')
    };
  }

  async onModuleInit() {
    this.logger.log('Initializing Blockchain Provider Service');
    
    // Start health checking
    const healthCheckIntervalMs = this.configService.get<number>('BLOCKCHAIN_HEALTH_CHECK_INTERVAL', 60000);
    this.healthCheckInterval = setInterval(
      () => this.performHealthChecks(),
      healthCheckIntervalMs
    );
    
    // Perform initial health check
    await this.performHealthChecks();
    
    this.logger.log('Blockchain Provider Service initialized');
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Blockchain Provider Service');
    
    // Stop health checking
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Clear all cached providers
    await this.providerFactory.clearCache();
    
    this.logger.log('Blockchain Provider Service shutdown complete');
  }

  /**
   * Get the primary provider instance
   */
  async getPrimaryProvider(): Promise<BlockchainProvider> {
    try {
      const provider = await this.providerFactory.getProvider(
        this.primaryProvider.type,
        this.primaryProvider.network
      );
      
      await this.recordProviderMetric(provider, 'getPrimaryProvider', true, 0);
      return provider;
    } catch (error) {
      await this.recordProviderMetric(null, 'getPrimaryProvider', false, 0);
      throw error;
    }
  }

  /**
   * Get a specific provider by type and network
   */
  async getProvider(providerType: BlockchainProviderType, networkName: string): Promise<BlockchainProvider> {
    try {
      const provider = await this.providerFactory.getProvider(providerType, networkName);
      await this.recordProviderMetric(provider, 'getProvider', true, 0);
      return provider;
    } catch (error) {
      await this.recordProviderMetric(null, 'getProvider', false, 0);
      throw error;
    }
  }

  /**
   * Create an attestation using the primary provider
   */
  async createAttestation(request: AttestationRequest): Promise<BlockchainResult> {
    const startTime = Date.now();
    
    try {
      const provider = await this.getPrimaryProvider();
      const result = await provider.createAttestation(request);
      
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(provider, 'createAttestation', result.success, responseTime);
      
      this.logger.log(`Attestation creation ${result.success ? 'succeeded' : 'failed'} for ID: ${request.id}`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(null, 'createAttestation', false, responseTime);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create attestation for ID ${request.id}:`, error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get an attestation using the primary provider
   */
  async getAttestation(id: string): Promise<AttestationData | null> {
    const startTime = Date.now();
    
    try {
      const provider = await this.getPrimaryProvider();
      const result = await provider.getAttestation(id);
      
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(provider, 'getAttestation', true, responseTime);
      
      this.logger.log(`Attestation retrieval ${result ? 'succeeded' : 'failed'} for ID: ${id}`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(null, 'getAttestation', false, responseTime);
      
      this.logger.error(`Failed to get attestation for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Revoke an attestation using the primary provider
   */
  async revokeAttestation(id: string): Promise<BlockchainResult> {
    const startTime = Date.now();
    
    try {
      const provider = await this.getPrimaryProvider();
      const result = await provider.revokeAttestation(id);
      
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(provider, 'revokeAttestation', result.success, responseTime);
      
      this.logger.log(`Attestation revocation ${result.success ? 'succeeded' : 'failed'} for ID: ${id}`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(null, 'revokeAttestation', false, responseTime);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to revoke attestation for ID ${id}:`, error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update attestation status using the primary provider
   */
  async updateAttestationStatus(id: string, status: AttestationStatus): Promise<BlockchainResult> {
    const startTime = Date.now();
    
    try {
      const provider = await this.getPrimaryProvider();
      const result = await provider.updateAttestationStatus(id, status);
      
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(provider, 'updateAttestationStatus', result.success, responseTime);
      
      this.logger.log(`Attestation status update ${result.success ? 'succeeded' : 'failed'} for ID: ${id} to status: ${status}`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(null, 'updateAttestationStatus', false, responseTime);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update attestation status for ID ${id}:`, error);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get attestations by wallet using the primary provider
   */
  async getAttestationsByWallet(walletId: string): Promise<AttestationData[]> {
    const startTime = Date.now();
    
    try {
      const provider = await this.getPrimaryProvider();
      const result = await provider.getAttestationsByWallet(walletId);
      
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(provider, 'getAttestationsByWallet', true, responseTime);
      
      this.logger.log(`Retrieved ${result.length} attestations for wallet: ${walletId}`);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await this.recordProviderMetric(null, 'getAttestationsByWallet', false, responseTime);
      
      this.logger.error(`Failed to get attestations for wallet ${walletId}:`, error);
      throw error;
    }
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): any[] {
    return this.providerFactory.getAvailableProviders();
  }

  /**
   * Get cached providers with health status
   */
  getCachedProvidersWithHealth() {
    const cachedProviders = this.providerFactory.getCachedProviders();
    
    return cachedProviders.map(cached => {
      const health = this.healthStatus.get(cached.key);
      const metrics = this.metrics.get(cached.key);
      
      return {
        ...cached,
        health,
        metrics
      };
    });
  }

  /**
   * Get provider metrics
   */
  getProviderMetrics(providerType?: BlockchainProviderType, networkName?: string) {
    if (providerType && networkName) {
      const key = `${providerType}-${networkName}`;
      return this.metrics.get(key);
    }
    
    // Return all metrics
    return Object.fromEntries(this.metrics.entries());
  }

  /**
   * Perform health checks on all cached providers
   */
  private async performHealthChecks(): Promise<void> {
    try {
      const healthResults = await this.providerFactory.healthCheckAllProviders();
      const currentTime = new Date();
      
      for (const [providerKey, isHealthy] of Object.entries(healthResults)) {
        const currentStatus = this.healthStatus.get(providerKey);
        const consecutiveFailures = isHealthy ? 0 : (currentStatus?.consecutiveFailures || 0) + 1;
        
        const healthStatus: ProviderHealthStatus = {
          isHealthy,
          lastChecked: currentTime,
          consecutiveFailures
        };
        
        if (!isHealthy) {
          healthStatus.errorMessage = 'Health check failed';
        }
        
        this.healthStatus.set(providerKey, healthStatus);
        
        // Log warnings for unhealthy providers
        if (!isHealthy && consecutiveFailures >= 3) {
          this.logger.warn(`Provider ${providerKey} has failed ${consecutiveFailures} consecutive health checks`);
        }
      }
    } catch (error) {
      this.logger.error('Health check process failed:', error);
    }
  }

  /**
   * Record provider performance metrics
   */
  private async recordProviderMetric(
    provider: BlockchainProvider | null,
    operation: string,
    success: boolean,
    responseTime: number
  ): Promise<void> {
    if (!provider) return;
    
    const providerKey = `${provider.providerType}-${provider.networkName}`;
    const currentMetrics = this.metrics.get(providerKey) || {
      requestCount: 0,
      successCount: 0,
      failureCount: 0,
      averageResponseTime: 0
    };
    
    const newRequestCount = currentMetrics.requestCount + 1;
    const newAverageResponseTime = 
      (currentMetrics.averageResponseTime * currentMetrics.requestCount + responseTime) / newRequestCount;
    
    this.metrics.set(providerKey, {
      requestCount: newRequestCount,
      successCount: success ? currentMetrics.successCount + 1 : currentMetrics.successCount,
      failureCount: success ? currentMetrics.failureCount : currentMetrics.failureCount + 1,
      averageResponseTime: newAverageResponseTime,
      lastRequestTime: new Date()
    });
  }
} 