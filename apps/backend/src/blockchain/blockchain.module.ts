import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainProviderFactory } from './blockchain-provider.factory';
import { BlockchainProviderService } from './blockchain-provider.service';
// import { FabricService } from './fabric.service'; // Will be replaced by provider abstraction

/**
 * Blockchain Module
 * 
 * This module provides blockchain functionality through the provider abstraction layer.
 * It supports multiple blockchain providers (Fabric, Ethereum, etc.) through a 
 * standardized interface while maintaining backward compatibility.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    BlockchainProviderFactory,
    BlockchainProviderService,
    // TODO: Add individual provider implementations when ready
    // FabricBlockchainProvider, 
    // EthereumBlockchainProvider,
  ],
  exports: [
    BlockchainProviderService,
    BlockchainProviderFactory,
    // Export service for backward compatibility
    // 'BLOCKCHAIN_SERVICE' - alias for BlockchainProviderService
  ],
})
export class BlockchainModule {}
