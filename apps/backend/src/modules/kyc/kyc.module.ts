import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { IdenfyService } from './infrastructure/services/idenfy.service';
import { KycController } from './presentation/controllers/kyc.controller';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [KycController],
  providers: [IdenfyService],
  exports: [IdenfyService],
})
export class KycModule {}
