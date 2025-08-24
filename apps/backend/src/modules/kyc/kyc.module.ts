import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../database/database.module';
import { IdenfyService } from './infrastructure/services/idenfy.service';
import { KycController } from './presentation/controllers/kyc.controller';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [KycController],
  providers: [IdenfyService],
  exports: [IdenfyService],
})
export class KycModule {}
