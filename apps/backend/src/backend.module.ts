import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { KycModule } from './modules/kyc/kyc.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { BrandingModule } from './modules/branding/branding.module';
import { BillingModule } from './modules/billing/billing.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { createRateLimitConfig } from './shared/config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createRateLimitConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    KycModule,
    InvitationModule,
    BrandingModule,
    BillingModule,
    BlockchainModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class BackendModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware, LoggingMiddleware).forRoutes('*');
  }
}
