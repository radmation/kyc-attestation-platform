/**
 * Unit Tests for FabricBlockchainProvider
 *
 * These tests validate the Fabric provider implementation's compliance
 * with the BlockchainProvider interface and proper functionality.
 */

import { FabricBlockchainProvider } from './fabric-blockchain.provider';
import {
  BlockchainProviderType,
  AttestationStatus,
} from '../interfaces/blockchain-provider.interface';
import { FabricProviderConfiguration } from '../types/provider-config.types';

describe('FabricBlockchainProvider', () => {
  let provider: FabricBlockchainProvider;
  let mockConfig: FabricProviderConfiguration;

  beforeEach(() => {
    mockConfig = {
      providerType: BlockchainProviderType.HYPERLEDGER_FABRIC,
      networkName: 'testchannel',
      enabled: true,
      connectionTimeout: 30000,
      requestTimeout: 10000,
      maxRetries: 3,
      healthCheckInterval: 60000,
      environment: 'development',
      fabricConfig: {
        connectionProfilePath: '/test/connection.json',
        walletPath: '/test/wallet',
        identityName: 'testUser',
        channelName: 'testchannel',
        chaincodeName: 'testchaincode',
        mspId: 'TestMSP',
        enableDiscovery: true,
        asLocalhost: true,
      },
    };
  });

  describe('Provider Initialization', () => {
    it('should initialize with correct provider type and network name', () => {
      provider = new FabricBlockchainProvider(mockConfig);

      expect(provider.providerType).toBe(
        BlockchainProviderType.HYPERLEDGER_FABRIC,
      );
      expect(provider.networkName).toBe('testchannel');
    });

    it('should validate configuration on construction', () => {
      const invalidConfig = {
        ...mockConfig,
        fabricConfig: {
          ...mockConfig.fabricConfig,
          connectionProfilePath: '', // Required field missing
        },
      };

      expect(() => {
        new FabricBlockchainProvider(invalidConfig);
      }).toThrow('Connection profile path is required');
    });

    it('should validate all required Fabric configuration fields', () => {
      const testCases = [
        {
          field: 'connectionProfilePath',
          error: 'Connection profile path is required',
        },
        { field: 'walletPath', error: 'Wallet path is required' },
        { field: 'identityName', error: 'Identity name is required' },
        { field: 'channelName', error: 'Channel name is required' },
        { field: 'chaincodeName', error: 'Chaincode name is required' },
        { field: 'mspId', error: 'MSP ID is required' },
      ];

      testCases.forEach(({ field, error }) => {
        const invalidConfig = {
          ...mockConfig,
          fabricConfig: {
            ...mockConfig.fabricConfig,
            [field]: '',
          },
        };

        expect(() => {
          new FabricBlockchainProvider(invalidConfig);
        }).toThrow(error);
      });
    });
  });

  describe('Provider Interface Compliance', () => {
    beforeEach(() => {
      provider = new FabricBlockchainProvider(mockConfig);
    });

    it('should implement BlockchainProvider interface methods', () => {
      // Verify all required methods exist
      expect(typeof provider.initialize).toBe('function');
      expect(typeof provider.createAttestation).toBe('function');
      expect(typeof provider.getAttestation).toBe('function');
      expect(typeof provider.revokeAttestation).toBe('function');
      expect(typeof provider.updateAttestationStatus).toBe('function');
      expect(typeof provider.getAttestationsByWallet).toBe('function');
      expect(typeof provider.getAttestationHistory).toBe('function');
      expect(typeof provider.isHealthy).toBe('function');
      expect(typeof provider.getNetworkInfo).toBe('function');
      expect(typeof provider.getTransactionStatus).toBe('function');
      expect(typeof provider.waitForConfirmation).toBe('function');
      expect(typeof provider.disconnect).toBe('function');
    });

    it('should have readonly providerType and networkName', () => {
      expect(provider.providerType).toBe(
        BlockchainProviderType.HYPERLEDGER_FABRIC,
      );
      expect(provider.networkName).toBe('testchannel');

      // These should be readonly - TypeScript will catch attempts to modify them
      // But we can verify they exist and have correct values
      expect(provider).toHaveProperty('providerType');
      expect(provider).toHaveProperty('networkName');
    });
  });

  describe('Attestation Operations', () => {
    beforeEach(async () => {
      provider = new FabricBlockchainProvider(mockConfig);
      // Mock successful initialization since Fabric SDK is not available in tests
      await provider.initialize();
    });

    it('should create attestation with mock data', async () => {
      const attestationRequest = {
        id: 'test-attestation-1',
        profileId: 'test-profile-1',
        walletId: '0x1234567890123456789012345678901234567890',
        metadataUri: 'ipfs://QmTestHash',
      };

      const result = await provider.createAttestation(attestationRequest);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.blockNumber).toBeDefined();
      expect(result.providerData?.fabric).toBeDefined();
      expect(result.providerData?.fabric?.chaincodeId).toBe(
        mockConfig.fabricConfig.chaincodeName,
      );
      expect(result.providerData?.fabric?.channelName).toBe(
        mockConfig.fabricConfig.channelName,
      );
    });

    it('should handle attestation creation errors', async () => {
      // Create provider but don't initialize to simulate connection failure
      const uninitializedProvider = new FabricBlockchainProvider(mockConfig);

      const attestationRequest = {
        id: 'test-attestation-1',
        profileId: 'test-profile-1',
        walletId: '0x1234567890123456789012345678901234567890',
        metadataUri: 'ipfs://QmTestHash',
      };

      const result =
        await uninitializedProvider.createAttestation(attestationRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fabric connection not established');
    });

    it('should get attestation by ID', async () => {
      const attestationId = 'test-attestation-1';

      const attestation = await provider.getAttestation(attestationId);

      expect(attestation).toBeDefined();
      expect(attestation?.id).toBe(attestationId);
      expect(attestation?.status).toBe(AttestationStatus.ACTIVE);
      expect(attestation?.providerData?.fabric).toBeDefined();
    });

    it('should revoke attestation', async () => {
      const attestationId = 'test-attestation-1';

      const result = await provider.revokeAttestation(attestationId);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.providerData?.fabric?.operation).toBe('revoke');
    });

    it('should update attestation status', async () => {
      const attestationId = 'test-attestation-1';
      const newStatus = AttestationStatus.SUSPENDED;

      const result = await provider.updateAttestationStatus(
        attestationId,
        newStatus,
      );

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.providerData?.fabric?.operation).toBe('updateStatus');
      expect(result.providerData?.fabric?.newStatus).toBe(newStatus);
    });

    it('should get attestations by wallet', async () => {
      const walletId = '0x1234567890123456789012345678901234567890';

      const attestations = await provider.getAttestationsByWallet(walletId);

      expect(Array.isArray(attestations)).toBe(true);
      expect(attestations.length).toBeGreaterThan(0);
      expect(attestations[0].walletId).toBe(walletId);
    });

    it('should get attestation history', async () => {
      const attestationId = 'test-attestation-1';

      const history = await provider.getAttestationHistory(attestationId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('txId');
      expect(history[0]).toHaveProperty('timestamp');
      expect(history[0]).toHaveProperty('action');
    });
  });

  describe('Network Operations', () => {
    beforeEach(async () => {
      provider = new FabricBlockchainProvider(mockConfig);
      await provider.initialize();
    });

    it('should check health status', async () => {
      const isHealthy = await provider.isHealthy();
      expect(typeof isHealthy).toBe('boolean');
      expect(isHealthy).toBe(true); // Should be true after initialization
    });

    it('should return false for health check when not connected', async () => {
      const uninitializedProvider = new FabricBlockchainProvider(mockConfig);
      const isHealthy = await uninitializedProvider.isHealthy();
      expect(isHealthy).toBe(false);
    });

    it('should get network information', async () => {
      const networkInfo = await provider.getNetworkInfo();

      expect(networkInfo.providerType).toBe(
        BlockchainProviderType.HYPERLEDGER_FABRIC,
      );
      expect(networkInfo.networkName).toBe('testchannel');
      expect(networkInfo.chainId).toBe(mockConfig.fabricConfig.channelName);
      expect(networkInfo.blockHeight).toBeDefined();
      expect(networkInfo.peersConnected).toBeDefined();
      expect(networkInfo.lastBlockTime).toBeDefined();
    });

    it('should get transaction status', async () => {
      const txId = 'test-transaction-123';

      const status = await provider.getTransactionStatus(txId);

      expect(status.id).toBe(txId);
      expect(status.status).toBe('confirmed');
      expect(status.blockNumber).toBeDefined();
      expect(status.confirmations).toBe(1);
      expect(status.timestamp).toBeDefined();
    });

    it('should wait for confirmation', async () => {
      const txId = 'test-transaction-123';

      // Should complete without throwing error
      await expect(
        provider.waitForConfirmation(txId, 1),
      ).resolves.toBeUndefined();
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize successfully with valid configuration', async () => {
      provider = new FabricBlockchainProvider(mockConfig);

      await expect(provider.initialize()).resolves.toBeUndefined();
    });

    it('should disconnect gracefully', async () => {
      provider = new FabricBlockchainProvider(mockConfig);
      await provider.initialize();

      await expect(provider.disconnect()).resolves.toBeUndefined();
    });

    it('should handle multiple disconnect calls', async () => {
      provider = new FabricBlockchainProvider(mockConfig);
      await provider.initialize();

      await provider.disconnect();
      await expect(provider.disconnect()).resolves.toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      provider = new FabricBlockchainProvider(mockConfig);
    });

    it('should handle operations when not initialized', async () => {
      const attestationRequest = {
        id: 'test-attestation-1',
        profileId: 'test-profile-1',
        walletId: '0x1234567890123456789012345678901234567890',
        metadataUri: 'ipfs://QmTestHash',
      };

      const result = await provider.createAttestation(attestationRequest);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Fabric connection not established');

      await expect(provider.getAttestation('test')).rejects.toThrow(
        'Fabric connection not established',
      );
      await expect(provider.getAttestationsByWallet('test')).rejects.toThrow(
        'Fabric connection not established',
      );
      await expect(provider.getAttestationHistory('test')).rejects.toThrow(
        'Fabric connection not established',
      );
    });

    it('should handle configuration errors', () => {
      const invalidConfigs = [
        {
          fabricConfig: {
            ...mockConfig.fabricConfig,
            connectionProfilePath: '',
          },
        },
        { fabricConfig: { ...mockConfig.fabricConfig, walletPath: '' } },
        { fabricConfig: { ...mockConfig.fabricConfig, identityName: '' } },
      ];

      invalidConfigs.forEach((configOverride) => {
        const invalidConfig = { ...mockConfig, ...configOverride };
        expect(() => new FabricBlockchainProvider(invalidConfig)).toThrow();
      });

      // Test null fabricConfig separately
      const nullConfigTest = { ...mockConfig, fabricConfig: undefined as any };
      expect(() => new FabricBlockchainProvider(nullConfigTest)).toThrow();
    });
  });
});
