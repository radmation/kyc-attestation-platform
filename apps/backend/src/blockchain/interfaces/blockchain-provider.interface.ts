/**
 * Core Blockchain Provider Interface
 * 
 * This interface standardizes blockchain operations across different providers
 * (Hyperledger Fabric, Ethereum, Polygon, etc.) while maintaining consistency
 * in attestation management and network operations.
 */

export interface AttestationRequest {
  id: string;
  profileId: string;
  walletId: string;
  metadataUri: string;
  status?: AttestationStatus;
  issuedAt?: string;
  expiresAt?: string;
}

export interface AttestationData {
  id: string;
  profileId: string;
  walletId: string;
  metadataUri: string;
  status: AttestationStatus;
  issuedAt: string;
  expiresAt?: string;
  blockNumber?: string;
  transactionId: string;
  providerData?: Record<string, any>;
}

export interface BlockchainResult {
  success: boolean;
  transactionId?: string;
  blockNumber?: string;
  error?: string;
  providerData?: Record<string, any>;
}

export interface NetworkInfo {
  providerType: BlockchainProviderType;
  networkName: string;
  chainId?: string;
  blockHeight?: string;
  peersConnected?: number;
  lastBlockTime?: Date;
  gasPrice?: string;
}

export interface TransactionStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'failed' | 'unknown';
  blockNumber?: string;
  confirmations?: number;
  timestamp?: Date;
  gasUsed?: string;
  error?: string;
}

export enum AttestationStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED'
}

export enum BlockchainProviderType {
  HYPERLEDGER_FABRIC = 'HYPERLEDGER_FABRIC',
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  ARBITRUM = 'ARBITRUM',
  AVALANCHE = 'AVALANCHE',
  BSC = 'BSC',
  PRIVATE_ETHEREUM = 'PRIVATE_ETHEREUM'
}

/**
 * Standardized blockchain provider interface that all blockchain implementations must follow
 */
export interface BlockchainProvider {
  /** Provider type identifier */
  readonly providerType: BlockchainProviderType;
  
  /** Network name or identifier */
  readonly networkName: string;
  
  // Core attestation operations
  
  /**
   * Create a new attestation on the blockchain
   * @param request Attestation creation request
   * @returns Result of the creation operation
   */
  createAttestation(request: AttestationRequest): Promise<BlockchainResult>;
  
  /**
   * Retrieve an attestation by its ID
   * @param id Attestation identifier
   * @returns Attestation data or null if not found
   */
  getAttestation(id: string): Promise<AttestationData | null>;
  
  /**
   * Revoke an existing attestation
   * @param id Attestation identifier to revoke
   * @returns Result of the revocation operation
   */
  revokeAttestation(id: string): Promise<BlockchainResult>;
  
  /**
   * Update the status of an attestation
   * @param id Attestation identifier
   * @param status New status to set
   * @returns Result of the update operation
   */
  updateAttestationStatus(id: string, status: AttestationStatus): Promise<BlockchainResult>;
  
  /**
   * Get all attestations for a specific wallet address
   * @param walletId Wallet address to query
   * @returns Array of attestations for the wallet
   */
  getAttestationsByWallet(walletId: string): Promise<AttestationData[]>;
  
  /**
   * Get the transaction history for an attestation
   * @param id Attestation identifier
   * @returns Array of historical transactions
   */
  getAttestationHistory(id: string): Promise<any[]>;
  
  // Network operations
  
  /**
   * Check if the blockchain provider is healthy and connected
   * @returns True if healthy, false otherwise
   */
  isHealthy(): Promise<boolean>;
  
  /**
   * Get current network information
   * @returns Network status and metadata
   */
  getNetworkInfo(): Promise<NetworkInfo>;
  
  /**
   * Get the balance for the provider's account (if applicable)
   * @returns Balance as string
   */
  getBalance?(): Promise<string>;
  
  // Transaction monitoring
  
  /**
   * Get the status of a specific transaction
   * @param txId Transaction identifier
   * @returns Transaction status information
   */
  getTransactionStatus(txId: string): Promise<TransactionStatus>;
  
  /**
   * Wait for a transaction to receive specified confirmations
   * @param txId Transaction identifier
   * @param confirmations Number of confirmations to wait for (default: 1)
   */
  waitForConfirmation(txId: string, confirmations?: number): Promise<void>;
  
  // Lifecycle management
  
  /**
   * Initialize the blockchain provider connection
   * Should be called before using any other methods
   */
  initialize(): Promise<void>;
  
  /**
   * Disconnect from the blockchain network and clean up resources
   */
  disconnect(): Promise<void>;
} 