import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { InvitationRepository } from '../../domain/repositories/invitation.repository.interface';
import { UserInvitation } from '../../domain/entities/user-invitation.entity';

// Helper function to convert Prisma UserInvitation to domain entity
function convertPrismaToEntity(prismaInvitation: any): UserInvitation {
  return UserInvitation.fromPersistence({
    id: prismaInvitation.id,
    email: prismaInvitation.email,
    role: prismaInvitation.role,
    clientId: prismaInvitation.clientId,
    invitedBy: prismaInvitation.invitedBy,
    token: prismaInvitation.token,
    expiresAt: prismaInvitation.expiresAt,
    status: prismaInvitation.status,
    firstName: prismaInvitation.firstName ?? undefined,
    lastName: prismaInvitation.lastName ?? undefined,
    message: prismaInvitation.message ?? undefined,
    permissions: prismaInvitation.permissions || [],
    acceptedAt: prismaInvitation.acceptedAt ?? undefined,
    revokedAt: prismaInvitation.revokedAt ?? undefined,
    emailSentAt: prismaInvitation.emailSentAt ?? undefined,
    emailSentCount: prismaInvitation.emailSentCount,
    lastEmailSentAt: prismaInvitation.lastEmailSentAt ?? undefined,
    createdAt: prismaInvitation.createdAt,
    updatedAt: prismaInvitation.updatedAt,
  });
}

// Helper function to convert domain entity to Prisma data
function convertEntityToPrisma(invitation: UserInvitation) {
  const persistence = invitation.toPersistence();
  return {
    id: persistence.id,
    email: persistence.email,
    firstName: persistence.firstName || null,
    lastName: persistence.lastName || null,
    role: persistence.role,
    clientId: persistence.clientId,
    token: persistence.token,
    status: persistence.status,
    expiresAt: persistence.expiresAt,
    acceptedAt: persistence.acceptedAt || null,
    revokedAt: persistence.revokedAt || null,
    invitedBy: persistence.invitedBy,
    emailSentAt: persistence.emailSentAt || null,
    emailSentCount: persistence.emailSentCount,
    lastEmailSentAt: persistence.lastEmailSentAt || null,
    message: persistence.message || null,
    permissions: persistence.permissions,
    createdAt: persistence.createdAt,
    updatedAt: persistence.updatedAt,
  };
}

@Injectable()
export class PrismaInvitationRepository implements InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(invitation: UserInvitation): Promise<UserInvitation> {
    const data = convertEntityToPrisma(invitation);

    const savedInvitation = await this.prisma.userInvitation.create({
      data,
    });

    return convertPrismaToEntity(savedInvitation);
  }

  async findById(id: string): Promise<UserInvitation | null> {
    const invitation = await this.prisma.userInvitation.findUnique({
      where: { id },
    });

    return invitation ? convertPrismaToEntity(invitation) : null;
  }

  async findByToken(token: string): Promise<UserInvitation | null> {
    const invitation = await this.prisma.userInvitation.findUnique({
      where: { token },
    });

    return invitation ? convertPrismaToEntity(invitation) : null;
  }

  async update(invitation: UserInvitation): Promise<UserInvitation> {
    const data = convertEntityToPrisma(invitation);

    const updatedInvitation = await this.prisma.userInvitation.update({
      where: { id: invitation.id },
      data,
    });

    return convertPrismaToEntity(updatedInvitation);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.userInvitation.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserInvitation[]> {
    const invitations = await this.prisma.userInvitation.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(convertPrismaToEntity);
  }

  async findByClientId(clientId: string): Promise<UserInvitation[]> {
    const invitations = await this.prisma.userInvitation.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(convertPrismaToEntity);
  }

  async findByInviterId(inviterId: string): Promise<UserInvitation[]> {
    const invitations = await this.prisma.userInvitation.findMany({
      where: { invitedBy: inviterId },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(convertPrismaToEntity);
  }

  async findByStatus(status: string): Promise<UserInvitation[]> {
    const invitations = await this.prisma.userInvitation.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(convertPrismaToEntity);
  }

  async findActiveByEmail(email: string): Promise<UserInvitation | null> {
    const invitation = await this.prisma.userInvitation.findFirst({
      where: {
        email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitation ? convertPrismaToEntity(invitation) : null;
  }

  async findExpiredInvitations(): Promise<UserInvitation[]> {
    const invitations = await this.prisma.userInvitation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return invitations.map(convertPrismaToEntity);
  }

  async findPendingByClientId(clientId: string): Promise<UserInvitation[]> {
    const invitations = await this.prisma.userInvitation.findMany({
      where: {
        clientId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(convertPrismaToEntity);
  }

  async saveMany(invitations: UserInvitation[]): Promise<UserInvitation[]> {
    const data = invitations.map(convertEntityToPrisma);

    // Use transaction for bulk insert
    const savedInvitations = await this.prisma.$transaction(
      data.map((invitation) =>
        this.prisma.userInvitation.create({ data: invitation }),
      ),
    );

    return savedInvitations.map(convertPrismaToEntity);
  }

  async countByClientId(clientId: string): Promise<number> {
    return this.prisma.userInvitation.count({
      where: { clientId },
    });
  }

  async countByStatus(status: string): Promise<number> {
    return this.prisma.userInvitation.count({
      where: { status: status as any },
    });
  }

  async findWithPagination(params: {
    page: number;
    limit: number;
    clientId?: string;
    status?: string;
    email?: string;
    invitedBy?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    invitations: UserInvitation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page,
      limit,
      clientId,
      status,
      email,
      invitedBy,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (invitedBy) where.invitedBy = invitedBy;

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel
    const [invitations, total] = await Promise.all([
      this.prisma.userInvitation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.userInvitation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      invitations: invitations.map(convertPrismaToEntity),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async exists(token: string): Promise<boolean> {
    const count = await this.prisma.userInvitation.count({
      where: { token },
    });
    return count > 0;
  }

  async existsByEmail(email: string, clientId: string): Promise<boolean> {
    const count = await this.prisma.userInvitation.count({
      where: {
        email,
        clientId,
        status: 'PENDING',
      },
    });
    return count > 0;
  }
}
