# Task: API Gateway & Security Middleware

## Meta Information
- **Task ID**: P0-INF-002
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P0 (Critical)
- **Estimate**: S (3-5 days)
- **Sprint**: Sprint 1
- **Assignee**: AI Developer

## Dependencies
- [ ] P0-INF-001: Authentication & Authorization System (needs JWT guards)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Existing Files**: Basic backend structure at `/apps/backend/src/main.ts`

**Related Files**: 
- Reference: `/apps/backend/src/main.ts` (application bootstrap)
- Pattern: Create `/apps/backend/src/shared/middleware/` directory
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md` section 6 (API Gateway)

## Objective
Implement API gateway functionality using NestJS middleware for rate limiting, security headers, CORS, request logging, and error handling to provide enterprise-grade API security.

## Detailed Implementation Instructions

### Step 1: Install Required Dependencies
**File**: `/package.json`
**Action**: Add required middleware packages

```bash
npm install helmet compression morgan express-rate-limit @nestjs/throttler cors
npm install --save-dev @types/morgan @types/compression
```

### Step 2: Create Rate Limiting Configuration
**File**: `/apps/backend/src/shared/config/rate-limit.config.ts`
**Action**: Create rate limiting configuration

```typescript
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';

export const createRateLimitConfig = (configService: ConfigService): ThrottlerModuleOptions => ({
  throttlers: [
    {
      name: 'short',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute per IP
    },
    {
      name: 'medium',
      ttl: 300000, // 5 minutes
      limit: 300, // 300 requests per 5 minutes per IP
    },
    {
      name: 'long',
      ttl: 900000, // 15 minutes
      limit: 500, // 500 requests per 15 minutes per IP
    },
  ],
});

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: any) => string;
}

export const rateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => `${req.ip}:${req.user?.id || 'anonymous'}`,
};
```

### Step 3: Create Security Middleware
**File**: `/apps/backend/src/shared/middleware/security.middleware.ts`
**Action**: Create comprehensive security middleware

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })(req, res, () => {
      // Response compression
      compression({
        filter: (req, res) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
        level: 6,
      })(req, res, () => {
        next();
      });
    });
  }
}
```

### Step 4: Create Request Logging Middleware
**File**: `/apps/backend/src/shared/middleware/logging.middleware.ts`
**Action**: Create structured request logging

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const morganMiddleware = morgan(
      ':remote-addr :method :url :status :res[content-length] - :response-time ms',
      {
        stream: {
          write: (message: string) => {
            this.logger.log(message.trim());
          },
        },
        skip: (req, res) => {
          // Skip health check and metrics endpoints
          return req.url === '/health' || req.url === '/metrics';
        },
      },
    );

    morganMiddleware(req, res, next);
  }
}
```

### Step 5: Create CORS Configuration
**File**: `/apps/backend/src/shared/config/cors.config.ts`
**Action**: Create CORS configuration

```typescript
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const createCorsConfig = (configService: ConfigService): CorsOptions => {
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:4200'];
  
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'API-Version',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400, // 24 hours
  };
};
```

### Step 6: Create Global Exception Filter
**File**: `/apps/backend/src/shared/filters/global-exception.filter.ts`
**Action**: Create global exception filter for consistent error responses

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
    path: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        code = (exceptionResponse as any).error || exception.constructor.name;
        details = (exceptionResponse as any).details;
      } else {
        message = exceptionResponse as string;
        code = exception.constructor.name;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INTERNAL_SERVER_ERROR';
    }

    const requestId = request.headers['x-request-id'] || this.generateRequestId();

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        requestId: requestId as string,
        path: request.url,
      },
    };

    // Log error with context
    this.logger.error(
      `${request.method} ${request.url} - ${status} ${message}`,
      {
        requestId,
        userId: (request as any).user?.id,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        exception: exception instanceof Error ? exception.stack : exception,
      },
    );

    response.status(status).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Step 7: Create Response Interceptor
**File**: `/apps/backend/src/shared/interceptors/response.interceptor.ts`
**Action**: Create response interceptor for consistent API responses

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    version: string;
    timestamp: string;
    requestId: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.headers['x-request-id'] || this.generateRequestId();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          requestId,
        },
      })),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### Step 8: Update Main Application Bootstrap
**File**: `/apps/backend/src/main.ts`
**Action**: Configure all middleware and global settings

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { BackendModule } from './backend.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { createCorsConfig } from './shared/config/cors.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(BackendModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors(createCorsConfig(configService));

  // Global middleware
  app.use(SecurityMiddleware);
  app.use(LoggingMiddleware);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('KYC Attestation Platform API')
      .setDescription('API for KYC verification and blockchain attestations')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('kyc', 'KYC verification')
      .addTag('attestations', 'Blockchain attestations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
```

### Step 9: Update Backend Module
**File**: `/apps/backend/src/backend.module.ts`
**Action**: Add throttling and middleware configuration

```typescript
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { DatabaseModule } from './database/database.module';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { createRateLimitConfig } from './shared/config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createRateLimitConfig,
      inject: [ConfigService],
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class BackendModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
```

## Acceptance Criteria
- [ ] **Functional**: Rate limiting works and blocks excessive requests
- [ ] **Technical**: Security headers are properly set on all responses
- [ ] **Integration**: CORS allows frontend communication
- [ ] **Testing**: API responses follow consistent format
- [ ] **Documentation**: Swagger docs are accessible and complete

## Verification Steps
1. **Run Tests**: `npm run test` passes without errors
2. **Type Check**: `npm run build` completes successfully
3. **Rate Limiting**: Test that excessive requests are blocked
4. **Security Headers**: Verify helmet security headers in responses
5. **Error Handling**: Test that errors return consistent format
6. **Swagger**: Check that API documentation is accessible

## Expected Deliverables
- [ ] Rate limiting configuration and middleware
- [ ] Security middleware with helmet and compression
- [ ] Request logging middleware
- [ ] Global exception filter with consistent error format
- [ ] Response interceptor for success responses
- [ ] CORS configuration for frontend integration
- [ ] Updated main.ts with all middleware configuration

## Error Handling Requirements
- Use structured error responses with request IDs
- Log all errors with context information
- Include proper HTTP status codes
- Hide sensitive information in production

## References
- **Architecture**: `/docs/TECHNICAL_SPECIFICATIONS.md` Section 6
- **Security**: `/docs/TECHNICAL_SPECIFICATIONS.md` Section 9
- **Cursor Rules**: `/.cursorrules` (API patterns and security)
- **Existing Code**: `/apps/backend/src/main.ts`

## Notes for AI
- Install dependencies first before creating files
- Follow NestJS middleware patterns exactly
- Use ConfigService for environment-based configuration
- Add comprehensive logging for debugging
- Ensure all middleware is properly registered
- Test rate limiting with multiple requests

## Progress Log
- **Created**: 2024-01-15
- **Started**: 
- **Last Update**: 
- **Completed**: 

## Status History
- 2024-01-15 - Created in todo/ - **Started**: Sat Aug 16 11:50:51 PDT 2025
- **Last Update**: Sat Aug 16 11:50:51 PDT 2025 - Started implementation
