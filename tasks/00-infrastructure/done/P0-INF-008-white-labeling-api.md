# Task: White-Labeling API for Dynamic Branding

## Meta Information
- **Task ID**: P0-INF-008
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P0 (Critical - needed for white-labeling)
- **Estimate**: M (1-2 weeks)
- **Sprint**: Sprint 2
- **Assignee**: AI Developer

## Dependencies
- [x] P0-INF-001: Authentication & Authorization System (needs client management)
- [ ] P0-INF-006: Frontend React Application (needs branding API)
- [ ] P0-INF-005: Email Infrastructure with SendGrid Integration (needs branding for emails)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Existing Files**: Client and Branding models exist in Prisma schema

**Related Files**: 
- Reference: `/apps/backend/prisma/schema.prisma` (Client and Branding models)
- Pattern: `/apps/backend/src/modules/auth/` (service patterns)
- Database: Existing branding structure in schema

## Objective
Implement a comprehensive white-labeling API that provides dynamic branding information (colors, logos, themes) to the frontend, supports real-time branding updates, and integrates with the multi-tenant architecture for client-specific customization.

## 🎯 **TASK BREAKDOWN INTO MANAGEABLE CHUNKS**

### **Phase 1: Branding API Infrastructure (Week 1)**
**Goal**: Set up core branding API structure and endpoints

#### **Chunk 1.1: Branding Service Implementation**
- [ ] Create `BrandingService` class
- [ ] Implement branding retrieval logic
- [ ] Add client branding validation
- [ ] Create branding fallback system

#### **Chunk 1.2: Branding Controllers**
- [ ] Create branding CRUD endpoints
- [ ] Implement public branding endpoint
- [ ] Add admin branding management
- [ ] Create branding validation endpoints

#### **Chunk 1.3: Branding DTOs & Validation**
- [ ] Create branding request/response DTOs
- [ ] Add comprehensive validation schemas
- [ ] Implement branding format validation
- [ ] Create branding transformation logic

### **Phase 2: Dynamic Branding Features (Week 1)**
**Goal**: Implement advanced branding capabilities

#### **Chunk 2.1: Theme System**
- [ ] Implement CSS custom properties generation
- [ ] Create theme configuration system
- [ ] Add dark/light mode support
- [ ] Implement theme switching logic

#### **Chunk 2.2: Asset Management**
- [ ] Implement logo upload and storage
- [ ] Add image optimization and resizing
- [ ] Create asset CDN integration
- [ ] Implement asset caching system

#### **Chunk 2.3: Branding Inheritance**
- [ ] Implement default branding system
- [ ] Add branding override capabilities
- [ ] Create branding hierarchy logic
- [ ] Implement branding fallbacks

### **Phase 3: Multi-Tenant Integration (Week 2)**
**Goal**: Integrate branding with multi-tenant architecture

#### **Chunk 3.1: Client Scoping**
- [ ] Implement client-specific branding
- [ ] Add subdomain branding support
- [ ] Create client branding isolation
- [ ] Implement cross-client branding

#### **Chunk 3.2: Real-Time Updates**
- [ ] Implement branding change notifications
- [ ] Add WebSocket support for live updates
- [ ] Create branding cache invalidation
- [ ] Implement branding synchronization

#### **Chunk 3.3: Performance Optimization**
- [ ] Implement branding caching
- [ ] Add CDN integration
- [ ] Create branding preloading
- [ ] Implement lazy loading

### **Phase 4: Frontend Integration & Testing (Week 2)**
**Goal**: Ensure seamless frontend integration and comprehensive testing

#### **Chunk 4.1: Frontend Integration**
- [ ] Create branding hooks and context
- [ ] Implement dynamic theme application
- [ ] Add branding error handling
- [ ] Create branding loading states

#### **Chunk 4.2: Testing & Validation**
- [ ] Test all branding scenarios
- [ ] Validate performance under load
- [ ] Test multi-tenant isolation
- [ ] Validate branding fallbacks

#### **Chunk 4.3: Documentation & Deployment**
- [ ] Create API documentation
- [ ] Add branding configuration guides
- [ ] Implement monitoring and alerts
- [ ] Create deployment procedures

## 🔧 **IMPLEMENTATION APPROACH**

### **1. Branding Service Architecture**
```typescript
@Injectable()
export class BrandingService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private cacheService: CacheService,
  ) {}

  async getClientBranding(clientId: string): Promise<ClientBranding> {
    // Check cache first
    const cacheKey = `branding:${clientId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const branding = await this.prismaService.branding.findUnique({
      where: { clientId },
      include: { client: true }
    });

    if (!branding) {
      // Return default branding
      return this.getDefaultBranding();
    }

    // Transform and cache
    const transformed = this.transformBranding(branding);
    await this.cacheService.set(cacheKey, transformed, 300); // 5 minutes

    return transformed;
  }

  async getBrandingByDomain(domain: string): Promise<ClientBranding> {
    const client = await this.prismaService.client.findFirst({
      where: {
        OR: [
          { domain },
          { subdomain: domain.split('.')[0] }
        ]
      }
    });

    if (!client) {
      return this.getDefaultBranding();
    }

    return this.getClientBranding(client.id);
  }

  async updateBranding(clientId: string, updateDto: UpdateBrandingDto): Promise<ClientBranding> {
    // Validate branding data
    await this.validateBranding(updateDto);

    // Update branding
    const branding = await this.prismaService.branding.upsert({
      where: { clientId },
      update: updateDto,
      create: {
        clientId,
        ...updateDto
      }
    });

    // Invalidate cache
    await this.cacheService.del(`branding:${clientId}`);

    // Notify frontend of changes
    await this.notifyBrandingChange(clientId);

    return this.transformBranding(branding);
  }

  private transformBranding(branding: any): ClientBranding {
    return {
      id: branding.id,
      clientId: branding.clientId,
      clientName: branding.client.name,
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor || '#000000',
      secondaryColor: branding.secondaryColor || '#666666',
      accentColor: branding.accentColor || '#007bff',
      backgroundColor: branding.backgroundColor || '#ffffff',
      surfaceColor: branding.surfaceColor || '#f8f9fa',
      textColor: branding.textColor || '#212529',
      borderColor: branding.borderColor || '#dee2e6',
      fontFamily: branding.fontFamily || 'Inter, system-ui, sans-serif',
      borderRadius: branding.borderRadius || '0.375rem',
      shadow: branding.shadow || '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      customCSS: branding.customCSS,
      theme: this.generateTheme(branding),
    };
  }

  private generateTheme(branding: any): ThemeConfig {
    return {
      colors: {
        primary: branding.primaryColor,
        secondary: branding.secondaryColor,
        accent: branding.accentColor,
        background: branding.backgroundColor,
        surface: branding.surfaceColor,
        text: branding.textColor,
        border: branding.borderColor,
      },
      typography: {
        fontFamily: branding.fontFamily,
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        fontWeight: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: branding.borderRadius,
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: branding.shadow,
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    };
  }
}
```

### **2. Branding API Endpoints**
```typescript
@Controller('api/v1/branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard)
  async getClientBranding(@Param('clientId') clientId: string): Promise<ClientBranding> {
    return this.brandingService.getClientBranding(clientId);
  }

  @Get('domain/:domain')
  async getBrandingByDomain(@Param('domain') domain: string): Promise<ClientBranding> {
    return this.brandingService.getBrandingByDomain(domain);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserBranding(@Request() req: any): Promise<ClientBranding> {
    return this.brandingService.getClientBranding(req.user.clientId);
  }

  @Post('client/:clientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  async updateBranding(
    @Param('clientId') clientId: string,
    @Body() updateDto: UpdateBrandingDto,
    @Request() req: any
  ): Promise<ClientBranding> {
    // Validate user has permission to update this client's branding
    await this.validateBrandingPermission(req.user, clientId);
    
    return this.brandingService.updateBranding(clientId, updateDto);
  }

  @Post('client/:clientId/logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @Param('clientId') clientId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any
  ): Promise<{ logoUrl: string }> {
    await this.validateBrandingPermission(req.user, clientId);
    
    const logoUrl = await this.brandingService.uploadLogo(clientId, file);
    return { logoUrl };
  }

  @Get('client/:clientId/theme')
  async getClientTheme(@Param('clientId') clientId: string): Promise<ThemeConfig> {
    const branding = await this.brandingService.getClientBranding(clientId);
    return branding.theme;
  }

  @Get('client/:clientId/css-variables')
  async getClientCSSVariables(@Param('clientId') clientId: string): Promise<string> {
    const branding = await this.brandingService.getClientBranding(clientId);
    return this.generateCSSVariables(branding);
  }

  private generateCSSVariables(branding: ClientBranding): string {
    return `
      :root {
        --color-primary: ${branding.primaryColor};
        --color-secondary: ${branding.secondaryColor};
        --color-accent: ${branding.accentColor};
        --color-background: ${branding.backgroundColor};
        --color-surface: ${branding.surfaceColor};
        --color-text: ${branding.textColor};
        --color-border: ${branding.borderColor};
        --font-family: ${branding.fontFamily};
        --border-radius: ${branding.borderRadius};
        --shadow: ${branding.shadow};
      }
    `;
  }
}
```

### **3. Branding DTOs and Validation**
```typescript
export class UpdateBrandingDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Primary color must be a valid hex color' })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Secondary color must be a valid hex color' })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Accent color must be a valid hex color' })
  accentColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Background color must be a valid hex color' })
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Surface color must be a valid hex color' })
  surfaceColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Text color must be a valid hex color' })
  textColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Border color must be a valid hex color' })
  borderColor?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins'])
  fontFamily?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]+)?rem$/, { message: 'Border radius must be in rem units' })
  borderRadius?: string;

  @IsOptional()
  @IsString()
  shadow?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000, { message: 'Custom CSS is too long' })
  customCSS?: string;
}

export class ClientBranding {
  id: string;
  clientId: string;
  clientName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  borderRadius: string;
  shadow: string;
  customCSS?: string;
  theme: ThemeConfig;
  createdAt: Date;
  updatedAt: Date;
}
```

### **4. Frontend Integration**
```typescript
// Branding Hook
export const useBranding = (clientId?: string) => {
  const [branding, setBranding] = useState<ClientBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/v1/branding/client/${clientId}`);
        setBranding(response.data);
        
        // Apply branding to document
        applyBrandingToDocument(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientId) {
      fetchBranding();
    }
  }, [clientId]);

  const applyBrandingToDocument = (branding: ClientBranding) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', branding.primaryColor);
    root.style.setProperty('--color-secondary', branding.secondaryColor);
    root.style.setProperty('--color-accent', branding.accentColor);
    root.style.setProperty('--color-background', branding.backgroundColor);
    root.style.setProperty('--color-surface', branding.surfaceColor);
    root.style.setProperty('--color-text', branding.textColor);
    root.style.setProperty('--color-border', branding.borderColor);
    root.style.setProperty('--font-family', branding.fontFamily);
    root.style.setProperty('--border-radius', branding.borderRadius);
    root.style.setProperty('--shadow', branding.shadow);
    
    // Apply custom CSS if provided
    if (branding.customCSS) {
      const styleId = 'custom-branding-css';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;
      
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = branding.customCSS;
    }
  };

  return { branding, isLoading, error, applyBrandingToDocument };
};

// Branding Context
export const BrandingContext = createContext<{
  branding: ClientBranding | null;
  isLoading: boolean;
  error: string | null;
  updateBranding: (updates: Partial<UpdateBrandingDto>) => Promise<void>;
}>({});

export const BrandingProvider: React.FC<{ children: React.ReactNode; clientId: string }> = ({ 
  children, 
  clientId 
}) => {
  const { branding, isLoading, error } = useBranding(clientId);

  const updateBranding = async (updates: Partial<UpdateBrandingDto>) => {
    try {
      const response = await api.post(`/api/v1/branding/client/${clientId}`, updates);
      // Refresh branding
      window.location.reload();
    } catch (err) {
      throw new Error('Failed to update branding');
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, error, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};
```

## 📋 **DELIVERABLES BY PHASE**

### **Phase 1 Deliverables**
- ✅ Branding service with core functionality
- ✅ Complete branding API endpoints
- ✅ DTOs and validation schemas
- ✅ Branding transformation logic

### **Phase 2 Deliverables**
- ✅ Theme system with CSS generation
- ✅ Asset management and CDN integration
- ✅ Branding inheritance and fallbacks
- ✅ Advanced branding features

### **Phase 3 Deliverables**
- ✅ Multi-tenant branding isolation
- ✅ Real-time branding updates
- ✅ Performance optimization
- ✅ Caching and CDN integration

### **Phase 4 Deliverables**
- ✅ Frontend integration complete
- ✅ Comprehensive testing
- ✅ Documentation and guides
- ✅ Monitoring and deployment

## 🚨 **CRITICAL SUCCESS FACTORS**

### **1. Performance**
- **Must cache**: Branding data efficiently
- **Must optimize**: Asset delivery
- **Must support**: High-traffic scenarios
- **Must provide**: Fast branding retrieval

### **2. Multi-Tenancy**
- **Must isolate**: Client branding data
- **Must support**: Subdomain routing
- **Must handle**: Cross-client scenarios
- **Must validate**: Branding permissions

### **3. Real-Time Updates**
- **Must notify**: Frontend of changes
- **Must invalidate**: Cached branding
- **Must synchronize**: Across instances
- **Must handle**: Update failures gracefully

### **4. Frontend Integration**
- **Must apply**: Branding dynamically
- **Must support**: Theme switching
- **Must handle**: Loading states
- **Must provide**: Fallback branding

## 🔍 **TESTING STRATEGY**

### **Unit Testing**
- Branding service methods
- Theme generation logic
- Validation schemas
- Transformation functions

### **Integration Testing**
- API endpoint functionality
- Database operations
- Cache integration
- Asset management

### **End-to-End Testing**
- Complete branding flow
- Multi-tenant scenarios
- Real-time updates
- Frontend integration

## 📚 **RESOURCES & REFERENCES**

### **Primary Documentation**
- **NestJS Documentation**: [NestJS Official Docs](https://nestjs.com/)
- **Prisma Documentation**: [Prisma Docs](https://www.prisma.io/docs/)
- **CSS Custom Properties**: [MDN CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

### **Implementation Patterns**
- **Service Layer**: Follow existing service patterns
- **Caching**: Use Redis or in-memory caching
- **Asset Management**: Use CDN for logo storage
- **Real-Time Updates**: Use WebSockets or Server-Sent Events

### **Key Integration Points**
- **Frontend**: Provide branding context and hooks
- **Email System**: Supply branding for email templates
- **Multi-Tenancy**: Integrate with client management
- **Performance**: Optimize with caching and CDN

## 🎯 **SUCCESS METRICS**

### **Functional Requirements**
- ✅ Dynamic branding retrieval working
- ✅ Real-time updates functional
- ✅ Multi-tenant isolation working
- ✅ Frontend integration complete

### **Performance Requirements**
- ✅ Branding retrieval < 100ms
- ✅ Asset loading < 500ms
- ✅ Cache hit rate > 90%
- ✅ API response time < 200ms

### **Quality Requirements**
- ✅ Comprehensive validation
- ✅ Proper error handling
- ✅ Security permissions enforced
- ✅ Comprehensive testing coverage

## 🚀 **NEXT STEPS FOR AI AGENT**

1. **Start with Phase 1, Chunk 1.1**: Implement branding service
2. **Focus on performance**: Implement caching and optimization
3. **Build API endpoints**: Create comprehensive branding API
4. **Implement multi-tenancy**: Ensure proper client isolation
5. **Add real-time updates**: Implement change notifications
6. **Integrate with frontend**: Provide branding context and hooks
7. **Test thoroughly**: Validate all branding scenarios
8. **Document everything**: Create API and integration guides

This task creates a robust white-labeling API that provides dynamic branding capabilities, supports multi-tenant architecture, and enables real-time branding updates for the KYC attestation platform. - **Started**: Sat Sep  6 07:46:50 PDT 2025
- **Last Update**: Sat Sep  6 07:46:50 PDT 2025 - Started implementation
