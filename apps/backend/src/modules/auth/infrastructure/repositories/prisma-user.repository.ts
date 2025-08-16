import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import type { UserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

// Helper function to convert null to undefined for optional properties
function convertNullToUndefined<T extends Record<string, any>>(
  obj: T,
): {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: any;
  accountStatus: any;
  isActive: boolean;
  clientId: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  lastVerificationEmailSent?: Date;
  verificationEmailCount: number;
  createdAt: Date;
  updatedAt: Date;
} {
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

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
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

    return User.reconstruct(convertNullToUndefined(savedUserData));
  }

  async findById(id: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id },
    });

    return userData ? User.reconstruct(convertNullToUndefined(userData)) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email },
    });

    return userData ? User.reconstruct(convertNullToUndefined(userData)) : null;
  }

  async findByClientId(clientId: string): Promise<User[]> {
    const usersData = await this.prisma.user.findMany({
      where: { clientId },
    });

    return usersData.map((userData: any) =>
      User.reconstruct(convertNullToUndefined(userData)),
    );
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const userData = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    return userData ? User.reconstruct(convertNullToUndefined(userData)) : null;
  }

  async update(user: User): Promise<User> {
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

    return User.reconstruct(convertNullToUndefined(updatedUserData));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }
}
