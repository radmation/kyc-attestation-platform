import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';

export interface JWTPayload {
  sub: string;              // User ID
  email: string;
  role: string;
  clientId: string;
  permissions: string[];
  iat: number;
  exp: number;
  jti: string;              // JWT ID for revocation
}

export interface RefreshTokenPayload {
  sub: string;
  tokenFamily: string;      // For token rotation
  iat: number;
  exp: number;
}

/**
 * JWT Service for handling token generation, validation, and refresh
 * Provides secure token management for the KYC platform authentication system
 */
@Injectable()
export class JwtService {
  constructor(
    private nestJwtService: NestJwtService,
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  /**
   * Generate access and refresh tokens for a user
   * @param user - User object containing id, email, role, clientId, and permissions
   * @returns Promise containing accessToken and refreshToken
   * @throws Error if JWT_REFRESH_SECRET is not configured
   */
  async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      permissions: user.permissions || [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
      jti: `${user.id}-${Date.now()}`,
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      tokenFamily: `${user.id}-${Date.now()}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };

    const accessToken = this.nestJwtService.sign(payload);
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }
    
    const refreshToken = this.nestJwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Validate and decode a JWT access token
   * @param token - JWT token string to validate
   * @returns Promise containing decoded JWT payload
   * @throws UnauthorizedException if token is invalid or expired
   */
  async validateToken(token: string): Promise<JWTPayload> {
    try {
      return this.nestJwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Refresh access and refresh tokens using a valid refresh token
   * Validates the refresh token and generates new token pair
   * @param refreshToken - Valid refresh token string
   * @returns Promise containing new accessToken and refreshToken
   * @throws UnauthorizedException if refresh token is invalid or user not found
   */
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET not configured');
      }
      
      const payload = this.nestJwtService.verify(refreshToken, {
        secret: refreshSecret,
      }) as RefreshTokenPayload;
      
      // Get user from database with roles and permissions
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
        include: {
          client: true,
          roles: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new token pair
      const userTokenData = {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
        permissions: user.roles.flatMap(role => role.permissions.map(p => p.name)),
      };

      return this.generateTokens(userTokenData);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 