import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { InvitationService } from '../application/services/invitation.service';
import {
  CreateInvitationDto,
  AcceptInvitationDto,
  BulkInvitationDto,
  BulkInvitationResult,
  GetInvitationsQueryDto,
  PaginatedInvitationsResult,
} from '../dto';
import { UserInvitation } from '../domain/entities/user-invitation.entity';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { Public } from '../../../shared/decorators/public.decorator';
import { UserRole } from '@prisma/client';

interface AuthenticatedRequest {
  user: {
    id: string;
    clientId: string;
    role: string;
    permissions: string[];
  };
}

@ApiTags('invitations')
@Controller('api/v1/invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invitation' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invitation data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserInvitation> {
    return this.invitationService.createInvitation({
      ...createInvitationDto,
      invitedBy: req.user.id,
    });
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple invitations at once' })
  @ApiResponse({ status: 201, description: 'Bulk invitations processed' })
  @ApiResponse({ status: 400, description: 'Invalid bulk invitation data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async createBulkInvitations(
    @Body() bulkInvitationDto: BulkInvitationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<BulkInvitationResult> {
    return this.invitationService.createBulkInvitations({
      ...bulkInvitationDto,
      invitedBy: req.user.id,
    });
  }

  @Post(':token/accept')
  @Public()
  @ApiOperation({ summary: 'Accept an invitation using token' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token or invitation data' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @Param('token') token: string,
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ): Promise<{ user: any; message: string }> {
    const user = await this.invitationService.acceptInvitation(
      token,
      acceptInvitationDto,
    );
    return {
      user,
      message: 'Invitation accepted successfully. Welcome to the platform!',
    };
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend invitation email' })
  @ApiResponse({ status: 200, description: 'Invitation resent successfully' })
  @ApiResponse({ status: 400, description: 'Cannot resend invitation' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async resendInvitation(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.invitationService.resendInvitation(id, req.user.id);
    return { message: 'Invitation resent successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an invitation' })
  @ApiResponse({ status: 200, description: 'Invitation revoked successfully' })
  @ApiResponse({ status: 400, description: 'Cannot revoke invitation' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async revokeInvitation(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.invitationService.revokeInvitation(id, req.user.id);
    return { message: 'Invitation revoked successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get invitations with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Invitations retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_USER)
  async getInvitations(
    @Query() query: GetInvitationsQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PaginatedInvitationsResult> {
    return this.invitationService.getInvitations(query, req.user.clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invitation by ID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN, UserRole.CLIENT_USER)
  async getInvitation(@Param('id') id: string): Promise<UserInvitation> {
    const invitation = await this.invitationService.getInvitation(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    return invitation;
  }

  @Get('token/:token/validate')
  @Public()
  @ApiOperation({ summary: 'Validate invitation token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Token is invalid or expired' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async validateInvitationToken(@Param('token') token: string): Promise<{
    valid: boolean;
    invitation?: Partial<UserInvitation>;
    message: string;
  }> {
    try {
      const invitation =
        await this.invitationService.findInvitationByToken(token);
      if (!invitation) {
        return {
          valid: false,
          message: 'Invalid or expired token',
        };
      }

      // Check if expired
      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        return {
          valid: false,
          message: 'Token has expired',
        };
      }

      return {
        valid: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          status: invitation.status,
        },
        message: 'Token is valid',
      };
    } catch (error: any) {
      return {
        valid: false,
        message: error.message || 'Invalid or expired token',
      };
    }
  }

  // Note: Stats endpoint can be added later when getInvitationStats method is implemented in the service
}
