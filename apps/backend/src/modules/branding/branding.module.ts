import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

// Domain
// (No domain services to register)

// Application
import { GetClientBrandingUseCase } from './application/use-cases/get-client-branding.use-case';
import { UpdateBrandingUseCase } from './application/use-cases/update-branding.use-case';

// Infrastructure
import { PrismaBrandingRepository } from './infrastructure/repositories/prisma-branding.repository';
import { MockBrandingRepository } from './infrastructure/repositories/mock-branding.repository';
import { MemoryCacheService } from './infrastructure/services/memory-cache.service';

// Presentation
import { BrandingController } from './presentation/controllers/branding.controller';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [
    BrandingController,
  ],
  providers: [
    // Use cases
    GetClientBrandingUseCase,
    UpdateBrandingUseCase,

    // Infrastructure services
    {
      provide: 'CacheService',
      useClass: MemoryCacheService,
    },

    // Repositories
    {
      provide: 'BrandingRepository',
      useClass: MockBrandingRepository, // Use mock for now until database migration is ready
    },
  ],
  exports: [
    // Export use cases for other modules
    GetClientBrandingUseCase,
    UpdateBrandingUseCase,
    {
      provide: 'BrandingRepository',
      useClass: MockBrandingRepository, // Use mock for now until database migration is ready
    },
    {
      provide: 'CacheService',
      useClass: MemoryCacheService,
    },
  ],
})
export class BrandingModule {} 