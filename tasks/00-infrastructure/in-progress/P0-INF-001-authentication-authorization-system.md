# Task: Authentication & Authorization System

## Meta Information
- **Task ID**: P0-INF-001
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P0 (Critical)
- **Estimate**: M (1-2 weeks)
- **Sprint**: Sprint 1
- **Assignee**: AI Developer

## Dependencies
- None (foundational task)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Existing Files**: Basic auth module structure exists at `/apps/backend/src/modules/auth/`

**Related Files**: 
- Reference: `/apps/backend/src/modules/auth/presentation/controllers/user.controller.ts`
- Pattern: `/apps/backend/src/shared/guards/` (create these)
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md` sections 9 (Security)

## Objective
Implement a complete JWT-based authentication and authorization system with RBAC support, multi-tenant architecture, and session management for the KYC attestation platform.

## Detailed Implementation Instructions

### Step 1: Create JWT Service
**File**: `/apps/backend/src/modules/auth/infrastructure/services/jwt.service.ts`
**Action**: Create JWT service with token generation and validation

```typescript
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
    const refreshToken = this.nestJwtService.sign(refreshPayload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
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
      const payload = this.nestJwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      
      // Get user from database and generate new tokens
      // Implementation depends on user service
      throw new Error('Implement user lookup and token generation');
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### Step 2: Create Authentication Guard
**File**: `/apps/backend/src/shared/guards/jwt-auth.guard.ts`
**Action**: Create JWT authentication guard following NestJS patterns

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

### Step 3: Create Authorization Guard (RBAC)
**File**: `/apps/backend/src/shared/guards/roles.guard.ts`
**Action**: Create role-based authorization guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Step 4: Create Decorators
**File**: `/apps/backend/src/shared/decorators/public.decorator.ts`
**Action**: Create public route decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**File**: `/apps/backend/src/shared/decorators/roles.decorator.ts`
**Action**: Create roles decorator

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### Step 5: Create JWT Strategy
**File**: `/apps/backend/src/modules/auth/infrastructure/strategies/jwt.strategy.ts`
**Action**: Create Passport JWT strategy

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';
import { JWTPayload } from '../services/jwt.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JWTPayload) {
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
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      permissions: user.roles.flatMap(role => role.permissions.map(p => p.name)),
    };
  }
}
```

### Step 6: Update Auth Module
**File**: `/apps/backend/src/modules/auth/auth.module.ts`
**Action**: Update auth module to include new services and strategies

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from './infrastructure/services/jwt.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { UserController } from './presentation/controllers/user.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [JwtService, JwtStrategy],
  exports: [JwtService],
})
export class AuthModule {}
```

### Step 7: Update Main App Module
**File**: `/apps/backend/src/backend.module.ts`
**Action**: Register guards globally and ensure auth module is imported

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class BackendModule {}
```

## Acceptance Criteria
- [ ] **Functional**: JWT tokens can be generated, validated, and refreshed
- [ ] **Technical**: All authentication components follow NestJS patterns
- [ ] **Integration**: Guards work with existing auth controllers
- [ ] **Testing**: Unit tests cover JWT service and guards
- [ ] **Documentation**: JSDoc comments added to all public methods

## Verification Steps
1. **Run Tests**: `npm run test` passes without errors
2. **Type Check**: `npm run build` completes successfully
3. **Integration**: Login endpoint returns valid JWT tokens
4. **Authorization**: Protected routes require valid authentication
5. **RBAC**: Role-based access control works correctly

## Expected Deliverables
- [ ] JWT service with token generation and validation
- [ ] Authentication and authorization guards
- [ ] Passport JWT strategy
- [ ] Public and roles decorators
- [ ] Updated auth module with all integrations
- [ ] Unit tests for new functionality

## Error Handling Requirements
- Use UnauthorizedException for auth failures
- Include proper error messages for debugging
- Add structured logging for security events
- Follow existing error handling patterns in auth module

## References
- **Architecture**: `/docs/TECHNICAL_SPECIFICATIONS.md` Section 9
- **Database Schema**: `/apps/backend/prisma/schema.prisma` (User, Role, Permission models)
- **Existing Auth**: `/apps/backend/src/modules/auth/` (follow patterns)
- **Cursor Rules**: `/.cursorrules` (NestJS patterns and security guidelines)

## Notes for AI
- Use exact file paths from project root
- Follow NestJS decorator patterns (@Injectable, @Module, etc.)
- Import from existing database and shared modules
- Add comprehensive JSDoc comments
- Include proper TypeScript types for all interfaces
- Test authentication flow end-to-end

## Progress Log
- **Created**: 2024-01-15
- **Started**: 
- **Last Update**: Sat Aug 16 10:28:32 PDT 2025 - Work in progress
- **Completed**: 

## Status History
- 2024-01-15 - Created in todo/ - **Started**: Sat Aug 16 10:17:20 PDT 2025
- **Last Update**: Sat Aug 16 10:28:32 PDT 2025 - Work in progress
