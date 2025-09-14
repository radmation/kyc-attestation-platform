import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';

// Domain
import { User } from './domain/entities/user.entity';
import { RateLimitAttempt } from './domain/entities/rate-limit-attempt.entity';

// Application
import { SendVerificationEmailUseCase } from './application/use-cases/send-verification-email.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';

// Infrastructure
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRateLimitRepository } from './infrastructure/repositories/prisma-rate-limit.repository';
import { SendGridEmailService } from './infrastructure/services/sendgrid-email.service';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { JwtService } from './infrastructure/services/jwt.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

// Presentation
import { EmailVerificationController } from './presentation/controllers/email-verification.controller';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET not configured');
        }
        return {
          secret,
          signOptions: { expiresIn: '15m' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailVerificationController, AuthController],
  providers: [
    // Use cases
    SendVerificationEmailUseCase,
    VerifyEmailUseCase,
    CreateUserUseCase,

    // Infrastructure services
    {
      provide: 'EmailService',
      useClass: SendGridEmailService,
    },
    {
      provide: 'PasswordService',
      useClass: BcryptPasswordService,
    },
    JwtService,
    JwtStrategy,

    // Repositories
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'RateLimitRepository',
      useClass: PrismaRateLimitRepository,
    },
  ],
  exports: [
    SendVerificationEmailUseCase,
    VerifyEmailUseCase,
    CreateUserUseCase,
    {
      provide: 'EmailService',
      useClass: SendGridEmailService,
    },
    {
      provide: 'PasswordService',
      useClass: BcryptPasswordService,
    },
    JwtService,
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    {
      provide: 'RateLimitRepository',
      useClass: PrismaRateLimitRepository,
    },
  ],
})
export class AuthModule {}
