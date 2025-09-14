import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaUserRepository } from '../../../auth/infrastructure/repositories/prisma-user.repository';
import { UserRole } from '@prisma/client';
import { User } from '../../../auth/domain/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let userRepository: jest.Mocked<PrismaUserRepository>;

  const mockUser = User.reconstruct({
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    clientId: 'client-123',
    role: UserRole.CLIENT_USER,
    accountStatus: 'ACTIVE' as any,
    isActive: true,
    emailVerified: true,
    verificationEmailCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockClientAdminUser = User.reconstruct({
    id: 'admin-123',
    email: 'admin@example.com',
    password: 'hashedpassword',
    firstName: 'Admin',
    lastName: 'User',
    clientId: 'client-123',
    role: UserRole.CLIENT_ADMIN,
    accountStatus: 'ACTIVE' as any,
    isActive: true,
    emailVerified: true,
    verificationEmailCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockUserRepository = {
      findByClientId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: PrismaUserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userRepository = module.get(PrismaUserRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listUsers', () => {
    it('should return a list of users for authorized CLIENT_ADMIN', async () => {
      const mockUsers = [mockUser, mockClientAdminUser];
      userRepository.findByClientId.mockResolvedValue(mockUsers);

      const mockRequest = {
        user: {
          clientId: 'client-123',
          role: UserRole.CLIENT_ADMIN,
        },
      };

      const result = await controller.listUsers(mockRequest);

      expect(userRepository.findByClientId).toHaveBeenCalledWith('client-123');
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('emailVerificationToken');
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('clientId');
      expect(result[0]).toHaveProperty('role');
      expect(result[0]).toHaveProperty('accountStatus');
    });

    it('should return empty array when no users found', async () => {
      userRepository.findByClientId.mockResolvedValue([]);

      const mockRequest = {
        user: {
          clientId: 'client-123',
          role: UserRole.CLIENT_ADMIN,
        },
      };

      const result = await controller.listUsers(mockRequest);

      expect(userRepository.findByClientId).toHaveBeenCalledWith('client-123');
      expect(result).toEqual([]);
    });

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed');
      userRepository.findByClientId.mockRejectedValue(error);

      const mockRequest = {
        user: {
          clientId: 'client-123',
          role: UserRole.CLIENT_ADMIN,
        },
      };

      await expect(controller.listUsers(mockRequest)).rejects.toThrow(error);
      expect(userRepository.findByClientId).toHaveBeenCalledWith('client-123');
    });

    it('should properly sanitize user data by removing sensitive fields', async () => {
      const userWithSensitiveData = User.reconstruct({
        id: 'user-sensitive-123',
        email: 'test@example.com',
        password: 'hashedpassword123',
        firstName: 'John',
        lastName: 'Doe',
        clientId: 'client-123',
        role: UserRole.CLIENT_USER,
        accountStatus: 'ACTIVE' as any,
        isActive: true,
        emailVerified: true,
        emailVerificationToken: 'secret-token-123', // Include token in reconstruction
        verificationEmailCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      userRepository.findByClientId.mockResolvedValue([userWithSensitiveData]);

      const mockRequest = {
        user: {
          clientId: 'client-123',
          role: UserRole.CLIENT_ADMIN,
        },
      };

      const result = await controller.listUsers(mockRequest);

      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).not.toHaveProperty('emailVerificationToken');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('firstName');
      expect(result[0]).toHaveProperty('lastName');
      expect(result[0]).toHaveProperty('clientId');
      expect(result[0]).toHaveProperty('role');
    });

    it('should use the correct clientId from the authenticated user', async () => {
      userRepository.findByClientId.mockResolvedValue([]);

      const mockRequest = {
        user: {
          clientId: 'different-client-456',
          role: UserRole.CLIENT_ADMIN,
        },
      };

      await controller.listUsers(mockRequest);

      expect(userRepository.findByClientId).toHaveBeenCalledWith(
        'different-client-456',
      );
    });
  });
});
