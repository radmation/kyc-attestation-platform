# KYC Platform Development Knowledge Base

## 🧠 AI Developer Reference Guide
This knowledge base provides critical patterns, troubleshooting, and integration details for AI-assisted development.

## 📁 Project Structure Patterns

### Backend Module Organization
```typescript
apps/backend/src/modules/[module-name]/
├── domain/
│   ├── entities/         # Domain entities (business logic)
│   └── repositories/     # Repository interfaces
├── infrastructure/
│   ├── services/         # External service integrations
│   ├── repositories/     # Repository implementations
│   └── strategies/       # Implementation strategies
└── presentation/
    ├── controllers/      # API controllers
    ├── dto/             # Data transfer objects
    └── guards/          # Route guards (if module-specific)
```

### Import Patterns
```typescript
// Always use relative imports within the same module
import { UserService } from '../infrastructure/services/user.service';

// Use absolute imports for shared utilities
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { PrismaService } from '../../../../database/prisma.service';

// External dependencies
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
```

## 🔗 Critical Integration Patterns

### 1. NestJS Service Pattern
```typescript
@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async exampleMethod(data: InputDto): Promise<OutputDto> {
    try {
      this.logger.log(`Processing: ${data.id}`);
      
      // Implementation here
      const result = await this.processSomething(data);
      
      this.logger.log(`Completed: ${data.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed processing ${data.id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Processing failed');
    }
  }
}
```

### 2. Controller Pattern with Validation
```typescript
@ApiTags('example')
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create example' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  async create(@Request() req: any, @Body() body: CreateExampleDto) {
    const userId = req.user.id;
    return await this.exampleService.create({ ...body, userId });
  }
}
```

### 3. Database Integration Pattern
```typescript
// Always use transactions for multi-step operations
async createWithTransaction(data: CreateData): Promise<Result> {
  return await this.prismaService.$transaction(async (prisma) => {
    const step1 = await prisma.tableA.create({ data: data.stepOne });
    const step2 = await prisma.tableB.create({ 
      data: { ...data.stepTwo, relatedId: step1.id } 
    });
    return { step1, step2 };
  });
}
```

## 🛠️ Technology-Specific Patterns

### Hyperledger Fabric Integration
```typescript
// Service pattern for Fabric operations
export class FabricService {
  private gateway: Gateway;
  private contract: Contract;

  async submitTransaction(functionName: string, ...args: string[]): Promise<Buffer> {
    try {
      const result = await this.contract.submitTransaction(functionName, ...args);
      this.logger.log(`Transaction submitted: ${functionName}`);
      return result;
    } catch (error) {
      this.logger.error(`Transaction failed: ${functionName}`, error);
      throw new InternalServerErrorException('Blockchain transaction failed');
    }
  }

  async evaluateTransaction(functionName: string, ...args: string[]): Promise<Buffer> {
    try {
      const result = await this.contract.evaluateTransaction(functionName, ...args);
      return result;
    } catch (error) {
      this.logger.error(`Query failed: ${functionName}`, error);
      throw new InternalServerErrorException('Blockchain query failed');
    }
  }
}
```

### iDenfy API Integration Pattern
```typescript
// Error handling for external APIs
async makeIdenfyRequest<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.response?.status === 429) {
      // Rate limiting
      throw new TooManyRequestsException('Rate limit exceeded');
    } else if (error.response?.status >= 500) {
      // Server errors - retry logic
      throw new ServiceUnavailableException('iDenfy service unavailable');
    } else {
      // Client errors
      throw new BadRequestException('Invalid request to iDenfy');
    }
  }
}
```

### IPFS Storage Pattern
```typescript
// Dual-provider pattern for reliability
export class IpfsService {
  async uploadMetadata(data: any): Promise<string> {
    try {
      // Try primary provider (Filebase)
      const primaryHash = await this.filebaseClient.upload(data);
      
      // Backup to secondary provider (Pinata)
      try {
        await this.pinataClient.pin(primaryHash);
      } catch (backupError) {
        this.logger.warn(`Backup pin failed: ${backupError.message}`);
      }
      
      return primaryHash;
    } catch (primaryError) {
      this.logger.warn(`Primary upload failed, trying backup: ${primaryError.message}`);
      return await this.pinataClient.upload(data);
    }
  }
}
```

## 🚨 Common Issues & Solutions

### 1. TypeScript Import Errors
**Problem**: Cannot find module errors
**Solution**: 
- Check tsconfig.json paths configuration
- Use relative imports for same-module files
- Ensure proper exports in index.ts files

### 2. Circular Dependency Issues
**Problem**: Unexpected token 'export' or undefined imports
**Solution**:
- Use `forwardRef()` in NestJS modules
- Avoid circular imports by restructuring dependencies
- Use interfaces instead of concrete classes in type definitions

### 3. Prisma Type Issues
**Problem**: Generated types not matching database
**Solution**:
```bash
npx prisma generate
npx prisma db push  # for development
# or
npx prisma migrate dev  # for production-ready migrations
```

### 4. Environment Variable Issues
**Problem**: Configuration not loading
**Solution**:
- Ensure .env file is in project root
- Use ConfigService.get() with proper typing
- Check environment variable names match exactly

## 🧪 Testing Patterns

### Unit Test Pattern
```typescript
describe('ExampleService', () => {
  let service: ExampleService;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      example: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExampleService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ExampleService>(ExampleService);
    mockPrisma = module.get(PrismaService);
  });

  it('should create example successfully', async () => {
    const mockResult = { id: '1', name: 'test' };
    mockPrisma.example.create.mockResolvedValue(mockResult);

    const result = await service.create({ name: 'test' });
    
    expect(result).toEqual(mockResult);
    expect(mockPrisma.example.create).toHaveBeenCalledWith({
      data: { name: 'test' }
    });
  });
});
```

## 🔧 Task-Specific Guidelines

### Infrastructure Tasks (INF)
1. **Always check dependencies first** - Docker, Node.js versions
2. **Use exact package versions** - Pin versions in package.json
3. **Test integrations immediately** - Don't accumulate integration debt
4. **Document configuration** - Add clear comments in config files

### KYC Integration Tasks (ATT)
1. **Handle webhook security** - Always validate signatures
2. **Implement retry logic** - External APIs can fail
3. **Log sensitive operations** - But never log PII
4. **Use proper error codes** - Map external errors to HTTP status codes

### Blockchain Tasks (Fabric)
1. **Test chaincode separately** - Use peer CLI before integration
2. **Handle connection failures** - Network can be unreliable
3. **Validate transaction results** - Always check transaction receipts
4. **Use proper error handling** - Fabric errors can be cryptic

## 📊 Performance Patterns

### Database Optimization
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    profile: {
      select: {
        firstName: true,
        lastName: true,
      }
    }
  }
});

// Use pagination for large datasets
const { skip, take } = getPaginationParams(page, limit);
const results = await prisma.example.findMany({
  skip,
  take,
  orderBy: { createdAt: 'desc' }
});
```

### Caching Pattern
```typescript
@Injectable()
export class CachedService {
  private cache = new Map<string, { data: any; expires: number }>();

  async getWithCache<T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, expires: Date.now() + ttl });
    return data;
  }
}
```

## 🛡️ Security Patterns

### Input Validation
```typescript
// Always use DTOs with validation
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string;
}
```

### JWT Handling
```typescript
// Proper JWT service pattern
export class JwtService {
  generateTokens(payload: JWTPayload): TokenPair {
    const accessToken = this.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.sign(
      { sub: payload.sub, tokenFamily: uuidv4() },
      { expiresIn: '7d', secret: this.refreshSecret }
    );
    return { accessToken, refreshToken };
  }
}
```

## 🎯 Task Completion Checklist

Before marking any task as complete, ensure:

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Proper error handling implemented
- [ ] Logging added for debugging
- [ ] No hardcoded values (use config)

### ✅ Testing
- [ ] Unit tests written and passing
- [ ] Integration points tested
- [ ] Error scenarios covered
- [ ] Manual testing completed

### ✅ Documentation
- [ ] JSDoc comments on public methods
- [ ] API endpoints documented in Swagger
- [ ] Configuration variables documented
- [ ] Complex logic explained in comments

### ✅ Security
- [ ] Input validation implemented
- [ ] Authentication/authorization working
- [ ] No sensitive data in logs
- [ ] Proper error messages (no info leakage)

### ✅ Integration
- [ ] Module properly exported
- [ ] Dependencies correctly injected
- [ ] Database migrations (if applicable)
- [ ] External services configured

This knowledge base should be consulted whenever implementing complex integrations or troubleshooting issues. Always prioritize patterns that have been proven to work in similar contexts. 