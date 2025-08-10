import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

// Infrastructure
import { PrismaUserRepository } from '../auth/infrastructure/repositories/prisma-user.repository';

// Presentation
// TODO: Add controllers when they are created

@Module({
  imports: [PrismaModule],
  controllers: [
    // TODO: Add controllers when they are created
  ],
  providers: [
    // Repositories
    PrismaUserRepository,
  ],
  exports: [
    PrismaUserRepository,
  ],
})
export class UsersModule {} 