import { Module } from '@nestjs/common';
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
import { MockEmailService } from './infrastructure/services/mock-email.service';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';

// Presentation
import { EmailVerificationController } from './presentation/controllers/email-verification.controller';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    EmailVerificationController,
    UserController,
  ],
  providers: [
    // Use cases
    SendVerificationEmailUseCase,
    VerifyEmailUseCase,
    CreateUserUseCase,
    
    // Infrastructure services
    {
      provide: 'EmailService',
      useClass: MockEmailService,
    },
    {
      provide: 'PasswordService',
      useClass: BcryptPasswordService,
    },
    
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
      useClass: MockEmailService,
    },
    {
      provide: 'PasswordService',
      useClass: BcryptPasswordService,
    },
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