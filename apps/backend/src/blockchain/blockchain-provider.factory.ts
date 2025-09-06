/**
 * Blockchain Provider Factory
 *
 * Factory pattern implementation for creating blockchain provider instances
 * based on configuration. Provides caching, validation, and extensibility
 * for supporting multiple blockchain providers.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlockchainProvider,
  BlockchainProviderType,
} from './interfaces/blockchain-provider.interface';
import {
  ProviderConfiguration,
  FabricProviderConfiguration,
  EthereumProviderConfiguration,
  ConfigValidationResult,
} from './types/provider-config.types';
// import { FabricBlockchainProvider } from './providers/fabric-blockchain.provider';
// import { EthereumBlockchainProvider } from './providers/ethereum-blockchain.provider';

/**
 * Provider registry entry containing metadata about each provider
 */
interface ProviderRegistryEntry {
  providerType: BlockchainProviderType;
  providerClass: new (config: ProviderConfiguration) => BlockchainProvider;
  supportedNetworks: string[];
  isEnabled: boolean;
  description: string;
}

@Injectable()
export class BlockchainProviderFactory {
  private readonly logger = new Logger(BlockchainProviderFactory.name);
  private readonly providers = new Map<string, BlockchainProvider>();
  private readonly registry = new Map<
    BlockchainProviderType,
    ProviderRegistryEntry
  >();

  constructor(private readonly configService: ConfigService) {
    this.initializeRegistry();
  }

  /**
   * Initialize the provider registry with supported providers
   */
  private initializeRegistry(): void {
    // TODO: Register Hyperledger Fabric provider when implementation is ready
    // this.registry.set(BlockchainProviderType.HYPERLEDGER_FABRIC, {
    //   providerType: BlockchainProviderType.HYPERLEDGER_FABRIC,
    //   providerClass: FabricBlockchainProvider,
    //   supportedNetworks: ['kycchannel', 'mainchannel', 'testchannel'],
    //   isEnabled: true,
    //   description: 'Hyperledger Fabric permissioned blockchain provider'
    // });

    // TODO: Register Ethereum provider when implemented
    // this.registry.set(BlockchainProviderType.ETHEREUM, {
    //   providerType: BlockchainProviderType.ETHEREUM,
    //   providerClass: EthereumBlockchainProvider,
    //   supportedNetworks: ['mainnet', 'goerli', 'sepolia', 'localhost'],
    //   isEnabled: false,
    //   description: 'Ethereum public blockchain provider'
    // });

    this.logger.log(
      `Initialized provider registry with ${this.registry.size} providers`,
    );
  }

  /**
   * Create a blockchain provider instance based on configuration
   * @param config Provider configuration
   * @returns Blockchain provider instance
   */
  async createProvider(
    config: ProviderConfiguration,
  ): Promise<BlockchainProvider> {
    const cacheKey = `${config.providerType}-${config.networkName}`;

    // Return cached provider if available
    if (this.providers.has(cacheKey)) {
      const cachedProvider = this.providers.get(cacheKey)!;

      // Verify cached provider is still healthy
      if (await cachedProvider.isHealthy()) {
        this.logger.log(`Returning cached provider: ${cacheKey}`);
        return cachedProvider;
      } else {
        // Remove unhealthy cached provider
        this.logger.warn(
          `Cached provider ${cacheKey} is unhealthy, removing from cache`,
        );
        await cachedProvider.disconnect();
        this.providers.delete(cacheKey);
      }
    }

    // Validate configuration before creating provider
    const validationResult = this.validateConfiguration(config);
    if (!validationResult.isValid) {
      const errors = validationResult.errors.join(', ');
      throw new Error(`Provider configuration validation failed: ${errors}`);
    }

    // Get provider registry entry
    const registryEntry = this.registry.get(config.providerType);
    if (!registryEntry) {
      throw new Error(`Unsupported provider type: ${config.providerType}`);
    }

    if (!registryEntry.isEnabled) {
      throw new Error(`Provider ${config.providerType} is disabled`);
    }

    // Validate network support
    if (!registryEntry.supportedNetworks.includes(config.networkName)) {
      this.logger.warn(
        `Network ${config.networkName} is not in supported networks list for ${config.providerType}: ${registryEntry.supportedNetworks.join(', ')}`,
      );
    }

    try {
      // Create new provider instance
      const ProviderClass = registryEntry.providerClass;
      const provider = new ProviderClass(config);

      this.logger.log(`Creating new provider: ${cacheKey}`);

      // Initialize the provider
      await provider.initialize();

      // Verify provider is healthy after initialization
      if (!(await provider.isHealthy())) {
        throw new Error(
          `Provider ${cacheKey} failed health check after initialization`,
        );
      }

      // Cache the provider
      this.providers.set(cacheKey, provider);

      this.logger.log(`Successfully created and cached provider: ${cacheKey}`);
      return provider;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create provider ${cacheKey}:`, error);
      throw new Error(
        `Provider creation failed for ${cacheKey}: ${errorMessage}`,
      );
    }
  }

  /**
   * Get a provider from cache or create if not exists
   * @param providerType Type of provider
   * @param networkName Network name
   * @returns Blockchain provider instance
   */
  async getProvider(
    providerType: BlockchainProviderType,
    networkName: string,
  ): Promise<BlockchainProvider> {
    // Create default configuration from environment
    const config = this.createDefaultConfiguration(providerType, networkName);
    return this.createProvider(config);
  }

  /**
   * Get all available providers
   * @returns Array of provider registry entries
   */
  getAvailableProviders(): ProviderRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get cached providers
   * @returns Array of cached provider information
   */
  getCachedProviders(): Array<{
    key: string;
    providerType: BlockchainProviderType;
    networkName: string;
  }> {
    return Array.from(this.providers.entries()).map(([key, provider]) => ({
      key,
      providerType: provider.providerType,
      networkName: provider.networkName,
    }));
  }

  /**
   * Remove a provider from cache and disconnect
   * @param providerType Provider type
   * @param networkName Network name
   */
  async removeProvider(
    providerType: BlockchainProviderType,
    networkName: string,
  ): Promise<void> {
    const cacheKey = `${providerType}-${networkName}`;
    const provider = this.providers.get(cacheKey);

    if (provider) {
      this.logger.log(`Removing provider from cache: ${cacheKey}`);
      await provider.disconnect();
      this.providers.delete(cacheKey);
    }
  }

  /**
   * Clear all cached providers
   */
  async clearCache(): Promise<void> {
    this.logger.log('Clearing all cached providers');

    const disconnectPromises = Array.from(this.providers.values()).map(
      (provider) =>
        provider
          .disconnect()
          .catch((error) =>
            this.logger.error('Error disconnecting provider:', error),
          ),
    );

    await Promise.allSettled(disconnectPromises);
    this.providers.clear();

    this.logger.log('All cached providers cleared');
  }

  /**
   * Health check all cached providers
   * @returns Health status of all providers
   */
  async healthCheckAllProviders(): Promise<Record<string, boolean>> {
    const healthChecks: Record<string, boolean> = {};

    for (const [key, provider] of this.providers.entries()) {
      try {
        healthChecks[key] = await provider.isHealthy();
      } catch (error) {
        this.logger.error(`Health check failed for provider ${key}:`, error);
        healthChecks[key] = false;
      }
    }

    return healthChecks;
  }

  /**
   * Register a new provider type (for extensibility)
   * @param entry Provider registry entry
   */
  registerProvider(entry: ProviderRegistryEntry): void {
    this.registry.set(entry.providerType, entry);
    this.logger.log(
      `Registered new provider: ${entry.providerType} - ${entry.description}`,
    );
  }

  /**
   * Validate provider configuration
   * @param config Provider configuration
   * @returns Validation result
   */
  private validateConfiguration(
    config: ProviderConfiguration,
  ): ConfigValidationResult {
    const errors: string[] = [];

    // Basic validation
    if (!config.providerType) {
      errors.push('Provider type is required');
    }

    if (!config.networkName) {
      errors.push('Network name is required');
    }

    if (config.enabled === undefined) {
      errors.push('Enabled flag is required');
    }

    if (!config.enabled) {
      errors.push('Provider is disabled');
    }

    // Provider-specific validation
    if (config.providerType === BlockchainProviderType.HYPERLEDGER_FABRIC) {
      this.validateFabricConfiguration(config, errors);
    } else if (
      [
        BlockchainProviderType.ETHEREUM,
        BlockchainProviderType.POLYGON,
        BlockchainProviderType.ARBITRUM,
        BlockchainProviderType.AVALANCHE,
        BlockchainProviderType.BSC,
        BlockchainProviderType.PRIVATE_ETHEREUM,
      ].includes(config.providerType)
    ) {
      this.validateEthereumConfiguration(config, errors);
    } else {
      errors.push(`Unknown provider type: ${config.providerType}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Fabric-specific configuration
   */
  private validateFabricConfiguration(
    config: FabricProviderConfiguration,
    errors: string[],
  ): void {
    if (!config.fabricConfig) {
      errors.push('Fabric configuration is required');
      return;
    }

    const { fabricConfig } = config;

    if (!fabricConfig.connectionProfilePath) {
      errors.push('Connection profile path is required for Fabric');
    }

    if (!fabricConfig.walletPath) {
      errors.push('Wallet path is required for Fabric');
    }

    if (!fabricConfig.identityName) {
      errors.push('Identity name is required for Fabric');
    }

    if (!fabricConfig.channelName) {
      errors.push('Channel name is required for Fabric');
    }

    if (!fabricConfig.chaincodeName) {
      errors.push('Chaincode name is required for Fabric');
    }

    if (!fabricConfig.mspId) {
      errors.push('MSP ID is required for Fabric');
    }
  }

  /**
   * Validate Ethereum-specific configuration
   */
  private validateEthereumConfiguration(
    config: EthereumProviderConfiguration,
    errors: string[],
  ): void {
    if (!config.ethereumConfig) {
      errors.push('Ethereum configuration is required');
      return;
    }

    const { ethereumConfig } = config;

    if (!ethereumConfig.rpcUrl) {
      errors.push('RPC URL is required for Ethereum');
    }

    if (!ethereumConfig.chainId) {
      errors.push('Chain ID is required for Ethereum');
    }

    if (!ethereumConfig.contracts?.attestationContract) {
      errors.push('Attestation contract address is required for Ethereum');
    }

    if (!ethereumConfig.privateKey && !ethereumConfig.mnemonic) {
      errors.push('Either private key or mnemonic is required for Ethereum');
    }
  }

  /**
   * Create default configuration based on environment variables
   */
  private createDefaultConfiguration(
    providerType: BlockchainProviderType,
    networkName: string,
  ): ProviderConfiguration {
    const baseConfig = {
      providerType,
      networkName,
      enabled: true,
      connectionTimeout: this.configService.get<number>(
        'BLOCKCHAIN_CONNECTION_TIMEOUT',
        30000,
      ),
      requestTimeout: this.configService.get<number>(
        'BLOCKCHAIN_REQUEST_TIMEOUT',
        10000,
      ),
      maxRetries: this.configService.get<number>('BLOCKCHAIN_MAX_RETRIES', 3),
      healthCheckInterval: this.configService.get<number>(
        'BLOCKCHAIN_HEALTH_CHECK_INTERVAL',
        60000,
      ),
      environment: this.configService.get<
        'development' | 'staging' | 'production'
      >('NODE_ENV', 'development'),
    };

    if (providerType === BlockchainProviderType.HYPERLEDGER_FABRIC) {
      return {
        ...baseConfig,
        providerType: BlockchainProviderType.HYPERLEDGER_FABRIC,
        fabricConfig: {
          connectionProfilePath: this.configService.get<string>(
            'FABRIC_CONNECTION_PROFILE_PATH',
            '',
          ),
          walletPath: this.configService.get<string>(
            'FABRIC_WALLET_PATH',
            './wallet',
          ),
          identityName: this.configService.get<string>(
            'FABRIC_IDENTITY_NAME',
            'appUser',
          ),
          channelName: this.configService.get<string>(
            'FABRIC_CHANNEL_NAME',
            networkName || 'kycchannel',
          ),
          chaincodeName: this.configService.get<string>(
            'FABRIC_CHAINCODE_NAME',
            'kycattestation',
          ),
          mspId: this.configService.get<string>('FABRIC_MSP_ID', 'Org1MSP'),
          enableDiscovery:
            this.configService.get<string>(
              'FABRIC_ENABLE_DISCOVERY',
              'true',
            ) === 'true',
          asLocalhost:
            this.configService.get<string>('FABRIC_AS_LOCALHOST', 'true') ===
            'true',
        },
      } as FabricProviderConfiguration;
    } else {
      throw new Error(
        `Default configuration not implemented for provider type: ${providerType}`,
      );
    }
  }
}
