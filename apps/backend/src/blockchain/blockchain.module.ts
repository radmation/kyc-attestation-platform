import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FabricService } from './fabric.service';

@Module({
  imports: [ConfigModule],
  providers: [FabricService],
  exports: [FabricService],
})
export class BlockchainModule {} 