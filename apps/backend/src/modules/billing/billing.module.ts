import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { BillingSchedulerService } from './billing-scheduler.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController, StripeController],
  providers: [StripeService, BillingSchedulerService],
  exports: [StripeService],
})
export class BillingModule {}
