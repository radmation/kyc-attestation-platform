import { Test, TestingModule } from '@nestjs/testing';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { PrismaService } from '../../../../database/prisma.service';

describe('JwtService', () => {
  let service: JwtService;
  let nestJwtService: jest.Mocked<NestJwtService>;
  let configService: jest.Mocked<ConfigService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'USER',
    clientId: 'client-1',
    permissions: ['read:profile', 'write:profile'],
  };

  const mockDbUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'USER',
    clientId: 'client-1',
    client: { id: 'client-1', name: 'Test Client' },
    roles: [
      {
        permissions: [
          { name: 'read:profile' },
          { name: 'write:profile' },
        ],
      },
    ],
  };

  beforeEach(async () => {
    const mockNestJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    const mockConfigService = {
      get: jest.fn(),
    } as any;

    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: NestJwtService,
          useValue: mockNestJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
    nestJwtService = module.get(NestJwtService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      configService.get.mockReturnValue('refresh-secret');
      nestJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.generateTokens(mockUser);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(nestJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw error if JWT_REFRESH_SECRET not configured', async () => {
      configService.get.mockReturnValue(undefined);

      await expect(service.generateTokens(mockUser)).rejects.toThrow(
        'JWT_REFRESH_SECRET not configured',
      );
    });
  });

  describe('validateToken', () => {
    it('should validate and return JWT payload', async () => {
      const mockPayload = { sub: 'user-1', email: 'test@example.com' };
      nestJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(nestJwtService.verify).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      nestJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockRefreshPayload = { sub: 'user-1', tokenFamily: 'family-1' };
      
      configService.get.mockReturnValue('refresh-secret');
      nestJwtService.verify.mockReturnValue(mockRefreshPayload);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockDbUser);
      nestJwtService.sign
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          client: true,
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockRefreshPayload = { sub: 'user-1', tokenFamily: 'family-1' };
      
      configService.get.mockReturnValue('refresh-secret');
      nestJwtService.verify.mockReturnValue(mockRefreshPayload);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.refreshTokens('valid-refresh-token')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      configService.get.mockReturnValue('refresh-secret');
      nestJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshTokens('invalid-refresh-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw error if JWT_REFRESH_SECRET not configured', async () => {
      configService.get.mockReturnValue(undefined);

      await expect(service.refreshTokens('refresh-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });
}); 