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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const user_entity_1 = require("../../domain/entities/user.entity");
function convertNullToUndefined(obj) {
    return {
        id: obj.id,
        email: obj.email,
        password: obj.password,
        firstName: obj.firstName ?? undefined,
        lastName: obj.lastName ?? undefined,
        role: obj.role,
        accountStatus: obj.accountStatus,
        isActive: obj.isActive,
        clientId: obj.clientId,
        emailVerified: obj.emailVerified,
        emailVerificationToken: obj.emailVerificationToken ?? undefined,
        emailVerificationExpires: obj.emailVerificationExpires ?? undefined,
        lastVerificationEmailSent: obj.lastVerificationEmailSent ?? undefined,
        verificationEmailCount: obj.verificationEmailCount,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt,
    };
}
let PrismaUserRepository = class PrismaUserRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(user) {
        const userData = {
            id: user.id,
            email: user.email,
            password: user.password,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            role: user.role,
            accountStatus: user.accountStatus,
            isActive: user.isActive,
            clientId: user.clientId,
            emailVerified: user.emailVerified,
            emailVerificationToken: user.emailVerificationToken || null,
            emailVerificationExpires: user.emailVerificationExpires || null,
            lastVerificationEmailSent: user.lastVerificationEmailSent || null,
            verificationEmailCount: user.verificationEmailCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        const savedUserData = await this.prisma.user.create({
            data: userData,
        });
        return user_entity_1.User.reconstruct(convertNullToUndefined(savedUserData));
    }
    async findById(id) {
        const userData = await this.prisma.user.findUnique({
            where: { id },
        });
        return userData ? user_entity_1.User.reconstruct(convertNullToUndefined(userData)) : null;
    }
    async findByEmail(email) {
        const userData = await this.prisma.user.findUnique({
            where: { email },
        });
        return userData ? user_entity_1.User.reconstruct(convertNullToUndefined(userData)) : null;
    }
    async findByClientId(clientId) {
        const usersData = await this.prisma.user.findMany({
            where: { clientId },
        });
        return usersData.map((userData) => user_entity_1.User.reconstruct(convertNullToUndefined(userData)));
    }
    async findByVerificationToken(token) {
        const userData = await this.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpires: { gt: new Date() },
            },
        });
        return userData ? user_entity_1.User.reconstruct(convertNullToUndefined(userData)) : null;
    }
    async update(user) {
        const userData = {
            id: user.id,
            email: user.email,
            password: user.password,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            role: user.role,
            accountStatus: user.accountStatus,
            isActive: user.isActive,
            clientId: user.clientId,
            emailVerified: user.emailVerified,
            emailVerificationToken: user.emailVerificationToken || null,
            emailVerificationExpires: user.emailVerificationExpires || null,
            lastVerificationEmailSent: user.lastVerificationEmailSent || null,
            verificationEmailCount: user.verificationEmailCount,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
        const updatedUserData = await this.prisma.user.update({
            where: { id: user.id },
            data: userData,
        });
        return user_entity_1.User.reconstruct(convertNullToUndefined(updatedUserData));
    }
    async delete(id) {
        await this.prisma.user.delete({
            where: { id },
        });
    }
    async exists(email) {
        const count = await this.prisma.user.count({
            where: { email },
        });
        return count > 0;
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map