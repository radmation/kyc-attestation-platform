import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class JwtService {
  constructor(
    private nestJwtService: NestJwtService,
    private configService: ConfigService,
  ) {}

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

  async validateToken(token: string): Promise<JWTPayload> {
    try {
      return this.nestJwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      if (!refreshSecret) {
        throw new Error('JWT_REFRESH_SECRET not configured');
      }
      
      const payload = this.nestJwtService.verify(refreshToken, {
        secret: refreshSecret,
      });
      
      // Get user from database and generate new tokens
      // Implementation depends on user service
      throw new Error('Implement user lookup and token generation');
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 