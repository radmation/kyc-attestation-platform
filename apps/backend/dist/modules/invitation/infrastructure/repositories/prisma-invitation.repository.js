"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaInvitationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const user_invitation_entity_1 = require("../../domain/entities/user-invitation.entity");
function convertPrismaToEntity(prismaInvitation) {
    return user_invitation_entity_1.UserInvitation.fromPersistence({
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
function convertEntityToPrisma(invitation) {
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
let PrismaInvitationRepository = class PrismaInvitationRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(invitation) {
        const data = convertEntityToPrisma(invitation);
        const savedInvitation = await this.prisma.userInvitation.create({
            data,
        });
        return convertPrismaToEntity(savedInvitation);
    }
    async findById(id) {
        const invitation = await this.prisma.userInvitation.findUnique({
            where: { id },
        });
        return invitation ? convertPrismaToEntity(invitation) : null;
    }
    async findByToken(token) {
        const invitation = await this.prisma.userInvitation.findUnique({
            where: { token },
        });
        return invitation ? convertPrismaToEntity(invitation) : null;
    }
    async update(invitation) {
        const data = convertEntityToPrisma(invitation);
        const updatedInvitation = await this.prisma.userInvitation.update({
            where: { id: invitation.id },
            data,
        });
        return convertPrismaToEntity(updatedInvitation);
    }
    async delete(id) {
        await this.prisma.userInvitation.delete({
            where: { id },
        });
    }
    async findByEmail(email) {
        const invitations = await this.prisma.userInvitation.findMany({
            where: { email },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map(convertPrismaToEntity);
    }
    async findByClientId(clientId) {
        const invitations = await this.prisma.userInvitation.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map(convertPrismaToEntity);
    }
    async findByInviterId(inviterId) {
        const invitations = await this.prisma.userInvitation.findMany({
            where: { invitedBy: inviterId },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map(convertPrismaToEntity);
    }
    async findByStatus(status) {
        const invitations = await this.prisma.userInvitation.findMany({
            where: { status: status },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map(convertPrismaToEntity);
    }
    async findActiveByEmail(email) {
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
    async findExpiredInvitations() {
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
    async findPendingByClientId(clientId) {
        const invitations = await this.prisma.userInvitation.findMany({
            where: {
                clientId,
                status: 'PENDING',
            },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map(convertPrismaToEntity);
    }
    async saveMany(invitations) {
        const data = invitations.map(convertEntityToPrisma);
        const savedInvitations = await this.prisma.$transaction(data.map(invitation => this.prisma.userInvitation.create({ data: invitation })));
        return savedInvitations.map(convertPrismaToEntity);
    }
    async countByClientId(clientId) {
        return this.prisma.userInvitation.count({
            where: { clientId },
        });
    }
    async countByStatus(status) {
        return this.prisma.userInvitation.count({
            where: { status: status },
        });
    }
    async findWithPagination(params) {
        const { page, limit, clientId, status, email, invitedBy, sortBy = 'createdAt', sortOrder = 'desc', } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (clientId)
            where.clientId = clientId;
        if (status)
            where.status = status;
        if (email)
            where.email = { contains: email, mode: 'insensitive' };
        if (invitedBy)
            where.invitedBy = invitedBy;
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
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
    async exists(token) {
        const count = await this.prisma.userInvitation.count({
            where: { token },
        });
        return count > 0;
    }
    async existsByEmail(email, clientId) {
        const count = await this.prisma.userInvitation.count({
            where: {
                email,
                clientId,
                status: 'PENDING',
            },
        });
        return count > 0;
    }
};
exports.PrismaInvitationRepository = PrismaInvitationRepository;
exports.PrismaInvitationRepository = PrismaInvitationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaInvitationRepository);
//# sourceMappingURL=prisma-invitation.repository.js.map