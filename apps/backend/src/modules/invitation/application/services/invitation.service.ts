import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Note: bcrypt import will be available when dependency is installed
import * as crypto from 'crypto';

import type { InvitationRepository } from '../../domain/repositories/invitation.repository.interface';
import { UserInvitation } from '../../domain/entities/user-invitation.entity';
import {
  CreateInvitationDto,
  AcceptInvitationDto,
  BulkInvitationDto,
  BulkInvitationResult,
  GetInvitationsQueryDto,
  PaginatedInvitationsResult,
} from '../../dto';

// Define service interfaces for dependency injection
export interface UserService {
  findByEmail(email: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  findById(id: string): Promise<any>;
}

export interface EmailService {
  sendInvitationEmail(invitation: any): Promise<void>;
  sendWelcomeEmail(email: string, firstName?: string): Promise<void>;
  sendInvitationRevokedEmail(email: string): Promise<void>;
}

export interface ClientService {
  findById(id: string): Promise<any>;
  validateUserPermissions(userId: string, clientId: string): Promise<boolean>;
}

@Injectable()
export class InvitationService {
  constructor(
    @Inject('InvitationRepository')
    private readonly invitationRepository: InvitationRepository,
    @Inject('UserService')
    private readonly userService: UserService,
    @Inject('EmailService')
    private readonly emailService: EmailService,
    @Inject('ClientService')
    private readonly clientService: ClientService,
    private readonly configService: ConfigService,
  ) {}

  async createInvitation(
    createInvitationDto: CreateInvitationDto & { invitedBy: string },
  ): Promise<UserInvitation> {
    const {
      email,
      role,
      clientId,
      invitedBy,
      firstName,
      lastName,
      message,
      permissions,
    } = createInvitationDto;

    // Validate client exists and user has permission to invite
    await this.validateInvitationPermissions(invitedBy, clientId);

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if there's already a pending invitation for this email/client
    const existingInvitation = await this.invitationRepository.existsByEmail(
      email,
      clientId,
    );
    if (existingInvitation) {
      throw new BadRequestException(
        'Pending invitation already exists for this email',
      );
    }

    // Create invitation entity with business logic
    const invitation = UserInvitation.create({
      email,
      role,
      clientId,
      invitedBy,
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(message && { message }),
      ...(permissions && { permissions }),
      expirationDays: this.configService.get('INVITATION_EXPIRATION_DAYS', 7),
    });

    // Save invitation
    const savedInvitation = await this.invitationRepository.save(invitation);

    // Mark email as sent and send invitation email
    savedInvitation.markEmailSent();
    await this.invitationRepository.update(savedInvitation);
    await this.emailService.sendInvitationEmail(savedInvitation);

    return savedInvitation;
  }

  async createBulkInvitations(
    bulkInvitationDto: BulkInvitationDto & { invitedBy: string },
  ): Promise<BulkInvitationResult> {
    const { invitations, commonMessage, invitedBy } = bulkInvitationDto;

    const results: BulkInvitationResult = {
      successCount: 0,
      failureCount: 0,
      successfulInvitations: [],
      failedInvitations: [],
    };

    // Process invitations sequentially to avoid race conditions
    for (const invitationDto of invitations) {
      try {
        const invitation = await this.createInvitation({
          ...invitationDto,
          ...(invitationDto.message || commonMessage
            ? { message: invitationDto.message || commonMessage }
            : {}),
          invitedBy,
        });

        results.successCount++;
        results.successfulInvitations.push(invitation.id);
      } catch (error) {
        results.failureCount++;
        results.failedInvitations.push({
          email: invitationDto.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async acceptInvitation(
    token: string,
    acceptInvitationDto: AcceptInvitationDto,
  ): Promise<any> {
    // Validate invitation token
    const invitation = await this.validateInvitationToken(token);

    if (!invitation.isPending()) {
      throw new BadRequestException('Invitation is not pending or has expired');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(
      acceptInvitationDto.password,
    );

    // Create user account
    const userData = {
      email: invitation.email,
      firstName: acceptInvitationDto.firstName || invitation.firstName,
      lastName: acceptInvitationDto.lastName || invitation.lastName,
      password: hashedPassword,
      role: invitation.role,
      clientId: invitation.clientId,
      accountStatus: 'ACTIVE',
      emailVerified: true,
    };

    const user = await this.userService.createUser(userData);

    // Update invitation status
    invitation.accept();
    await this.invitationRepository.update(invitation);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);

    return user;
  }

  async resendInvitation(
    invitationId: string,
    requestedBy: string,
  ): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Validate permissions
    await this.validateInvitationPermissions(requestedBy, invitation.clientId);

    if (!invitation.canResend()) {
      throw new BadRequestException(
        'Cannot resend this invitation (not pending, expired, or max resends reached)',
      );
    }

    // Update email tracking and resend
    invitation.markEmailSent();
    await this.invitationRepository.update(invitation);
    await this.emailService.sendInvitationEmail(invitation);
  }

  async revokeInvitation(
    invitationId: string,
    requestedBy: string,
  ): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Validate permissions
    await this.validateInvitationPermissions(requestedBy, invitation.clientId);

    if (!invitation.isPending()) {
      throw new BadRequestException('Can only revoke pending invitations');
    }

    // Revoke invitation
    invitation.revoke();
    await this.invitationRepository.update(invitation);

    // Send revocation notification
    await this.emailService.sendInvitationRevokedEmail(invitation.email);
  }

  async getInvitations(
    query: GetInvitationsQueryDto,
    clientId: string,
  ): Promise<PaginatedInvitationsResult> {
    const result = await this.invitationRepository.findWithPagination({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      clientId, // Ensure client scoping
      ...(query.status && { status: query.status }),
      ...(query.email && { email: query.email }),
      ...(query.invitedBy && { invitedBy: query.invitedBy }),
      ...(query.sortBy && { sortBy: query.sortBy }),
      ...(query.sortOrder && { sortOrder: query.sortOrder }),
    });

    return {
      invitations: result.invitations.map((inv) => inv.toPersistence()),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.page < result.totalPages,
      hasPrevPage: result.page > 1,
    };
  }

  async getInvitation(
    id: string,
    requestedBy?: string,
  ): Promise<UserInvitation | null> {
    const invitation = await this.invitationRepository.findById(id);

    if (!invitation) {
      return null;
    }

    // Validate permissions if requestedBy is provided
    if (requestedBy) {
      await this.validateInvitationPermissions(
        requestedBy,
        invitation.clientId,
      );
    }

    return invitation;
  }

  async findInvitationByToken(token: string): Promise<UserInvitation | null> {
    return this.invitationRepository.findByToken(token);
  }

  async cleanupExpiredInvitations(): Promise<number> {
    const expiredInvitations =
      await this.invitationRepository.findExpiredInvitations();
    let cleanupCount = 0;

    for (const invitation of expiredInvitations) {
      // Mark as expired instead of deleting for audit trail
      invitation.revoke(); // You could add an expire() method to the entity
      await this.invitationRepository.update(invitation);
      cleanupCount++;
    }

    return cleanupCount;
  }

  // Private helper methods
  private async validateInvitationPermissions(
    userId: string,
    clientId: string,
  ): Promise<void> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hasPermission = await this.clientService.validateUserPermissions(
      userId,
      clientId,
    );
    if (!hasPermission) {
      throw new BadRequestException(
        'Insufficient permissions to manage invitations for this client',
      );
    }
  }

  private async validateInvitationToken(
    token: string,
  ): Promise<UserInvitation> {
    const invitation = await this.invitationRepository.findByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invalid invitation token');
    }

    return invitation;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get('BCRYPT_SALT_ROUNDS', 12);
    // TODO: Add bcrypt import when dependency is installed
    // return bcrypt.hash(password, saltRounds);
    return `hashed_${password}_${saltRounds}`; // Placeholder for now
  }
}
