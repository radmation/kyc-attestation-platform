import { Controller, Get, UseGuards, Request, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaUserRepository } from '../../../auth/infrastructure/repositories/prisma-user.repository';

@ApiTags('users')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly userRepository: PrismaUserRepository) {}

  @ApiOperation({ summary: 'List all users for the authenticated client' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved list of users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: { type: 'string', example: 'user@example.com' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          clientId: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          role: { type: 'string', example: 'CLIENT_USER' },
          accountStatus: { type: 'string', example: 'ACTIVE' },
          isActive: { type: 'boolean', example: true },
          emailVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have CLIENT_ADMIN role',
  })
  @Roles(UserRole.CLIENT_ADMIN)
  @Get()
  async listUsers(@Request() req: any) {
    const { user } = req;
    const clientId = user.clientId;

    this.logger.log(`Listing users for client: ${clientId}`);

    try {
      const users = await this.userRepository.findByClientId(clientId);

      // Remove sensitive data from the response
      const sanitizedUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        clientId: user.clientId,
        role: user.role,
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        verificationEmailCount: user.verificationEmailCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      this.logger.log(
        `Found ${sanitizedUsers.length} users for client: ${clientId}`,
      );
      return sanitizedUsers;
    } catch (error) {
      this.logger.error(`Failed to list users for client ${clientId}:`, error);
      throw error;
    }
  }
}
