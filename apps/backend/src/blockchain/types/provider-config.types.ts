/**
 * Provider Configuration Types
 *
 * These interfaces define the configuration requirements for different
 * blockchain providers, allowing for type-safe configuration and easy
 * extension to support additional providers.
 */

import { BlockchainProviderType } from '../interfaces/blockchain-provider.interface';

/**
 * Base configuration interface with common fields across all providers
 */
export interface BaseProviderConfiguration {
  /** Type of blockchain provider */
  providerType: BlockchainProviderType;

  /** Network name or identifier */
  networkName: string;

  /** Whether this provider is enabled */
  enabled: boolean;

  /** Connection timeout in milliseconds */
  connectionTimeout?: number;

  /** Request timeout in milliseconds */
  requestTimeout?: number;

  /** Number of retry attempts for failed operations */
  maxRetries?: number;

  /** Health check interval in milliseconds */
  healthCheckInterval?: number;

  /** Environment-specific settings */
  environment?: 'development' | 'staging' | 'production';
}

/**
 * Hyperledger Fabric specific configuration
 */
export interface FabricProviderConfiguration extends BaseProviderConfiguration {
  providerType: BlockchainProviderType.HYPERLEDGER_FABRIC;

  fabricConfig: {
    /** Path to connection profile JSON file */
    connectionProfilePath: string;

    /** Path to wallet directory */
    walletPath: string;

    /** Identity to use from wallet */
    identityName: string;

    /** Channel name to connect to */
    channelName: string;

    /** Chaincode/contract name */
    chaincodeName: string;

    /** Organization MSP ID */
    mspId: string;

    /** Whether to use discovery service */
    enableDiscovery?: boolean;

    /** Whether running against localhost */
    asLocalhost?: boolean;

    /** Event hub configuration */
    eventHub?: {
      enabled: boolean;
      timeout?: number;
    };

    /** TLS configuration */
    tls?: {
      enabled: boolean;
      caCertPath?: string;
      clientCertPath?: string;
      clientKeyPath?: string;
    };
  };
}

/**
 * Ethereum (and EVM-compatible) specific configuration
 */
export interface EthereumProviderConfiguration
  extends BaseProviderConfiguration {
  providerType:
    | BlockchainProviderType.ETHEREUM
    | BlockchainProviderType.POLYGON
    | BlockchainProviderType.ARBITRUM
    | BlockchainProviderType.AVALANCHE
    | BlockchainProviderType.BSC
    | BlockchainProviderType.PRIVATE_ETHEREUM;

  ethereumConfig: {
    /** RPC endpoint URL */
    rpcUrl: string;

    /** Backup RPC endpoints for failover */
    backupRpcUrls?: string[];

    /** Chain ID */
    chainId: number;

    /** Private key for transactions (encrypted or from env) */
    privateKey?: string;

    /** Mnemonic for HD wallet (encrypted or from env) */
    mnemonic?: string;

    /** HD wallet derivation path */
    derivationPath?: string;

    /** Gas price strategy */
    gasPrice?: {
      strategy: 'legacy' | 'eip1559' | 'fast' | 'standard' | 'safe';
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
      gasLimit?: number;
    };

    /** Smart contract addresses */
    contracts: {
      /** KYC Attestation contract address */
      attestationContract: string;

      /** Other contract addresses */
      [contractName: string]: string;
    };

    /** Block confirmation requirements */
    confirmations?: number;

    /** WebSocket endpoint for events */
    wsUrl?: string;

    /** Infura/Alchemy project configuration */
    provider?: {
      type: 'infura' | 'alchemy' | 'quicknode' | 'custom';
      projectId?: string;
      apiKey?: string;
    };
  };
}

/**
 * Provider configuration union type for type-safe configuration handling
 */
export type ProviderConfiguration =
  | FabricProviderConfiguration
  | EthereumProviderConfiguration;

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Provider configuration factory for creating configurations from environment
 */
export interface ProviderConfigurationFactory {
  /**
   * Create configuration from environment variables
   * @param providerType Type of provider to configure
   * @param networkName Network name
   * @returns Provider configuration
   */
  createFromEnvironment(
    providerType: BlockchainProviderType,
    networkName: string,
  ): ProviderConfiguration;

  /**
   * Validate provider configuration
   * @param config Configuration to validate
   * @returns Validation result
   */
  validateConfiguration(config: ProviderConfiguration): ConfigValidationResult;

  /**
   * Get default configuration for a provider type
   * @param providerType Type of provider
   * @returns Default configuration
   */
  getDefaultConfiguration(
    providerType: BlockchainProviderType,
  ): Partial<ProviderConfiguration>;
}

/**
 * Environment variable mapping for different providers
 */
export interface ProviderEnvironmentConfig {
  // Fabric environment variables
  FABRIC_CONNECTION_PROFILE_PATH?: string;
  FABRIC_WALLET_PATH?: string;
  FABRIC_IDENTITY_NAME?: string;
  FABRIC_CHANNEL_NAME?: string;
  FABRIC_CHAINCODE_NAME?: string;
  FABRIC_MSP_ID?: string;
  FABRIC_ENABLE_DISCOVERY?: string;
  FABRIC_AS_LOCALHOST?: string;

  // Ethereum environment variables
  ETHEREUM_RPC_URL?: string;
  ETHEREUM_BACKUP_RPC_URLS?: string;
  ETHEREUM_CHAIN_ID?: string;
  ETHEREUM_PRIVATE_KEY?: string;
  ETHEREUM_MNEMONIC?: string;
  ETHEREUM_DERIVATION_PATH?: string;
  ETHEREUM_GAS_STRATEGY?: string;
  ETHEREUM_MAX_FEE_PER_GAS?: string;
  ETHEREUM_MAX_PRIORITY_FEE_PER_GAS?: string;
  ETHEREUM_GAS_LIMIT?: string;
  ETHEREUM_CONFIRMATIONS?: string;
  ETHEREUM_WS_URL?: string;
  ETHEREUM_PROVIDER_TYPE?: string;
  ETHEREUM_PROJECT_ID?: string;
  ETHEREUM_API_KEY?: string;

  // Contract addresses
  ATTESTATION_CONTRACT_ADDRESS?: string;

  // Common configuration
  BLOCKCHAIN_PROVIDER_TYPE?: string;
  BLOCKCHAIN_NETWORK_NAME?: string;
  BLOCKCHAIN_CONNECTION_TIMEOUT?: string;
  BLOCKCHAIN_REQUEST_TIMEOUT?: string;
  BLOCKCHAIN_MAX_RETRIES?: string;
  BLOCKCHAIN_HEALTH_CHECK_INTERVAL?: string;
}
