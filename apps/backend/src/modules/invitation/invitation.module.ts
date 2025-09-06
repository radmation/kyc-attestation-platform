import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Application layer
import { InvitationService } from './application/services/invitation.service';

// Infrastructure layer
import { PrismaInvitationRepository } from './infrastructure/repositories/prisma-invitation.repository';

// Interface layer
import { InvitationController } from './interfaces/invitation.controller';

// Database module
import { DatabaseModule } from '../../database/database.module';

// Import shared services (these will be available when other modules are integrated)
// Note: These imports will work when the respective modules are properly set up
// import { UserService } from '../users/application/services/user.service';
// import { EmailService } from '../email/application/services/email.service';
// import { ClientService } from '../clients/application/services/client.service';
// import { PrismaService } from '../../shared/database/prisma.service';

// Temporary service implementations for development
// These will be replaced with actual implementations when other modules are integrated
class MockUserService {
  async findByEmail(email: string): Promise<any> {
    // Mock implementation - returns null to simulate no existing user
    return null;
  }

  async createUser(userData: any): Promise<any> {
    // Mock implementation - returns a mock user
    return {
      id: 'mock-user-id',
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      clientId: userData.clientId,
      accountStatus: 'ACTIVE',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findById(id: string): Promise<any> {
    // Mock implementation - returns a mock user
    return {
      id,
      email: 'mock@example.com',
      role: 'CLIENT_ADMIN',
      clientId: 'mock-client-id',
    };
  }
}

class MockEmailService {
  async sendInvitationEmail(invitation: any): Promise<void> {
    console.log(`Mock: Sending invitation email to ${invitation.email}`);
    // Mock implementation - logs instead of actually sending
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    console.log(`Mock: Sending welcome email to ${email} (${firstName})`);
    // Mock implementation - logs instead of actually sending
  }

  async sendInvitationRevokedEmail(email: string): Promise<void> {
    console.log(`Mock: Sending revocation email to ${email}`);
    // Mock implementation - logs instead of actually sending
  }
}

class MockClientService {
  async findById(id: string): Promise<any> {
    // Mock implementation - returns a mock client
    return {
      id,
      name: 'Mock Client',
      domain: 'mock-client.com',
      isActive: true,
    };
  }

  async validateUserPermissions(
    userId: string,
    clientId: string,
  ): Promise<boolean> {
    // Mock implementation - always returns true for development
    return true;
  }
}

// MockPrismaService removed - now using real PrismaService via DatabaseModule

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [InvitationController],
  providers: [
    // Application services
    InvitationService,

    // Repository implementations
    {
      provide: 'InvitationRepository',
      useClass: PrismaInvitationRepository,
    },

    // External service dependencies (mocked for now)
    {
      provide: 'UserService',
      useClass: MockUserService,
    },
    {
      provide: 'EmailService',
      useClass: MockEmailService,
    },
    {
      provide: 'ClientService',
      useClass: MockClientService,
    },
    // Note: PrismaService is now available through DatabaseModule import

    // TODO: Replace remaining mock services with real implementations when available:
    // {
    //   provide: 'UserService',
    //   useExisting: UserService,
    // },
    // {
    //   provide: 'EmailService',
    //   useExisting: EmailService,
    // },
    // {
    //   provide: 'ClientService',
    //   useExisting: ClientService,
    // },
    // ✅ PrismaService: Now available through DatabaseModule import
  ],
  exports: [InvitationService, 'InvitationRepository'],
})
export class InvitationModule {}
