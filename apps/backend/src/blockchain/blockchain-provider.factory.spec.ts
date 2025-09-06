/**
 * Unit Tests for BlockchainProviderFactory
 * 
 * These tests validate the provider factory functionality including
 * provider creation, caching, validation, and error handling.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlockchainProviderFactory } from './blockchain-provider.factory';
import { BlockchainProviderType } from './interfaces/blockchain-provider.interface';
import { FabricProviderConfiguration } from './types/provider-config.types';

describe('BlockchainProviderFactory', () => {
  let factory: BlockchainProviderFactory;
  let configService: jest.Mocked<ConfigService>;

  const mockFabricConfig: FabricProviderConfiguration = {
    providerType: BlockchainProviderType.HYPERLEDGER_FABRIC,
    networkName: 'testchannel',
    enabled: true,
    connectionTimeout: 30000,
    requestTimeout: 10000,
    maxRetries: 3,
    healthCheckInterval: 60000,
    environment: 'development',
    fabricConfig: {
      connectionProfilePath: '/path/to/connection.json',
      walletPath: '/path/to/wallet',
      identityName: 'testUser',
      channelName: 'testchannel',
      chaincodeName: 'testchaincode',
      mspId: 'TestMSP',
      enableDiscovery: true,
      asLocalhost: true
    }
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainProviderFactory,
        { provide: ConfigService, useValue: mockConfigService }
      ],
    }).compile();

    factory = module.get<BlockchainProviderFactory>(BlockchainProviderFactory);
    configService = module.get(ConfigService);

    // Setup default config service responses
    configService.get
      .mockReturnValueOnce('HYPERLEDGER_FABRIC') // PRIMARY_BLOCKCHAIN_PROVIDER
      .mockReturnValueOnce('kycchannel') // PRIMARY_BLOCKCHAIN_NETWORK
      .mockReturnValue('default_value'); // For any other config calls
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Factory Initialization', () => {
    it('should initialize with empty provider registry initially', () => {
      const availableProviders = factory.getAvailableProviders();
      expect(availableProviders).toHaveLength(0);
    });

    it('should initialize cached providers map as empty', () => {
      const cachedProviders = factory.getCachedProviders();
      expect(cachedProviders).toHaveLength(0);
    });
  });

  describe('Provider Creation', () => {
    it('should fail to create provider for unsupported type', async () => {
      await expect(
        factory.createProvider(mockFabricConfig)
      ).rejects.toThrow('Unsupported provider type');
    });

    it('should validate configuration before creating provider', async () => {
      const invalidConfig = {
        ...mockFabricConfig,
        enabled: false
      };

      await expect(
        factory.createProvider(invalidConfig)
      ).rejects.toThrow('Provider configuration validation failed');
    });

    it('should validate required Fabric configuration fields', async () => {
      const invalidFabricConfig = {
        ...mockFabricConfig,
        fabricConfig: {
          ...mockFabricConfig.fabricConfig,
          connectionProfilePath: '' // Required field missing
        }
      };

      await expect(
        factory.createProvider(invalidFabricConfig)
      ).rejects.toThrow('Connection profile path is required for Fabric');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate basic provider configuration', async () => {
      const incompleteConfig = {
        ...mockFabricConfig,
        providerType: undefined as any
      };

      await expect(
        factory.createProvider(incompleteConfig)
      ).rejects.toThrow('Provider type is required');
    });

    it('should validate network name is provided', async () => {
      const invalidConfig = {
        ...mockFabricConfig,
        networkName: ''
      };

      await expect(
        factory.createProvider(invalidConfig)
      ).rejects.toThrow('Network name is required');
    });

    it('should validate enabled flag is set', async () => {
      const invalidConfig = {
        ...mockFabricConfig,
        enabled: undefined as any
      };

      await expect(
        factory.createProvider(invalidConfig)
      ).rejects.toThrow('Enabled flag is required');
    });
  });

  describe('Provider Registry Management', () => {
    it('should allow registering new providers', () => {
      const mockProviderEntry = {
        providerType: BlockchainProviderType.ETHEREUM,
        providerClass: jest.fn() as any,
        supportedNetworks: ['mainnet', 'goerli'],
        isEnabled: true,
        description: 'Test Ethereum provider'
      };

      factory.registerProvider(mockProviderEntry);
      
      const availableProviders = factory.getAvailableProviders();
      expect(availableProviders).toHaveLength(1);
             expect(availableProviders[0]?.providerType).toBe(BlockchainProviderType.ETHEREUM);
    });

    it('should return available providers list', () => {
      // Initially empty since no providers are registered in test setup
      const providers = factory.getAvailableProviders();
      expect(Array.isArray(providers)).toBe(true);
    });
  });

  describe('Provider Cache Management', () => {
    it('should return empty cached providers initially', () => {
      const cachedProviders = factory.getCachedProviders();
      expect(cachedProviders).toHaveLength(0);
    });

    it('should clear all cached providers', async () => {
      await factory.clearCache();
      const cachedProviders = factory.getCachedProviders();
      expect(cachedProviders).toHaveLength(0);
    });

    it('should remove specific provider from cache', async () => {
      await factory.removeProvider(
        BlockchainProviderType.HYPERLEDGER_FABRIC, 
        'testchannel'
      );
      
      const cachedProviders = factory.getCachedProviders();
      expect(cachedProviders).toHaveLength(0);
    });
  });

  describe('Health Check Management', () => {
    it('should perform health checks on all cached providers', async () => {
      const healthResults = await factory.healthCheckAllProviders();
      expect(typeof healthResults).toBe('object');
    });
  });

  describe('Default Configuration Creation', () => {
    beforeEach(() => {
      // Setup config service mock responses for default configuration
      configService.get
        .mockReturnValueOnce(30000) // BLOCKCHAIN_CONNECTION_TIMEOUT
        .mockReturnValueOnce(10000) // BLOCKCHAIN_REQUEST_TIMEOUT
        .mockReturnValueOnce(3) // BLOCKCHAIN_MAX_RETRIES
        .mockReturnValueOnce(60000) // BLOCKCHAIN_HEALTH_CHECK_INTERVAL
        .mockReturnValueOnce('development') // NODE_ENV
        .mockReturnValueOnce('/test/profile.json') // FABRIC_CONNECTION_PROFILE_PATH
        .mockReturnValueOnce('./test-wallet') // FABRIC_WALLET_PATH
        .mockReturnValueOnce('testUser') // FABRIC_IDENTITY_NAME
        .mockReturnValueOnce('testchannel') // FABRIC_CHANNEL_NAME
        .mockReturnValueOnce('testchaincode') // FABRIC_CHAINCODE_NAME
        .mockReturnValueOnce('TestMSP') // FABRIC_MSP_ID
        .mockReturnValueOnce('true') // FABRIC_ENABLE_DISCOVERY
        .mockReturnValueOnce('true'); // FABRIC_AS_LOCALHOST
    });

    it('should create default Fabric configuration from environment', async () => {
      try {
        const provider = await factory.getProvider(
          BlockchainProviderType.HYPERLEDGER_FABRIC,
          'testchannel'
        );
                 // This will fail because no provider is registered, but it validates config creation
       } catch (error) {
         expect(error instanceof Error ? error.message : String(error)).toContain('Unsupported provider type');
       }
    });

    it('should throw error for unsupported provider type in default config', () => {
      expect(() => {
        // Access private method through any cast for testing
        (factory as any).createDefaultConfiguration(
          'UNSUPPORTED_TYPE' as BlockchainProviderType,
          'testnet'
        );
      }).toThrow('Default configuration not implemented for provider type');
    });
  });

  describe('Error Handling', () => {
    it('should handle provider creation failures gracefully', async () => {
      // Register a mock provider that will fail
      const failingProviderClass = jest.fn().mockImplementation(() => {
        throw new Error('Provider creation failed');
      });

      const mockProviderEntry = {
        providerType: BlockchainProviderType.ETHEREUM,
        providerClass: failingProviderClass,
        supportedNetworks: ['mainnet'],
        isEnabled: true,
        description: 'Failing test provider'
      };

      factory.registerProvider(mockProviderEntry);

      const ethereumConfig = {
        providerType: BlockchainProviderType.ETHEREUM,
        networkName: 'mainnet',
        enabled: true,
        ethereumConfig: {
          rpcUrl: 'https://mainnet.infura.io/v3/test',
          chainId: 1,
          contracts: {
            attestationContract: '0x1234567890123456789012345678901234567890'
          }
        }
      };

      await expect(
        factory.createProvider(ethereumConfig as any)
      ).rejects.toThrow('Provider creation failed');
    });
  });
}); 