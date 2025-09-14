import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

// Infrastructure
import { PrismaUserRepository } from '../auth/infrastructure/repositories/prisma-user.repository';

// Presentation
import { UsersController } from './presentation/controllers/users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    UsersController,
  ],
  providers: [
    // Repositories
    PrismaUserRepository,
  ],
  exports: [PrismaUserRepository],
})
export class UsersModule {}
