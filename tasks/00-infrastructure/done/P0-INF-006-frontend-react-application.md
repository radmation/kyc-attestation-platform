# Task: Frontend React Application with Centralized Theming

## Meta Information
- **Task ID**: P0-INF-006
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P0 (Critical - needed for user onboarding)
- **Estimate**: L (2-3 weeks)
- **Sprint**: Sprint 2-3
- **Assignee**: AI Developer

## Dependencies
- [x] P0-INF-001: Authentication & Authorization System (needs frontend auth)
- [ ] P0-INF-005: Email Infrastructure with SendGrid Integration (needs email templates)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Frontend**: React.js with TypeScript + shadcn/ui at `/apps/frontend/src/`
- **Database**: PostgreSQL with Prisma ORM at `/apps/backend/prisma/`
- **Existing Files**: Basic frontend structure may exist at `/apps/frontend/`

**Related Files**: 
- Reference: `/apps/frontend/src/` (frontend application structure)
- Pattern: `/apps/backend/src/modules/auth/` (backend service patterns)
- Database: `/apps/backend/prisma/schema.prisma` (client branding models)
- Documentation: `/docs/TECHNICAL_SPECIFICATIONS.md` (frontend architecture)

## Objective
Create a comprehensive React frontend application with centralized theming, white-labeling support, user onboarding flows, and integration with the KYC attestation platform backend.

## 🎯 **TASK BREAKDOWN INTO MANAGEABLE CHUNKS**

### **Phase 1: Core Frontend Infrastructure (Week 1)**
**Goal**: Set up React application foundation with centralized theming

#### **Chunk 1.1: React Application Setup**
- [ ] Initialize React app with TypeScript and Vite
- [ ] Set up shadcn/ui component library
- [ ] Configure Tailwind CSS with custom theme system
- [ ] Set up routing with React Router
- [ ] Configure build and development tooling

#### **Chunk 1.2: Centralized Theming System**
- [ ] Create theme configuration system
- [ ] Implement CSS custom properties for colors
- [ ] Set up theme context and providers
- [ ] Create theme switching capabilities
- [ ] Implement dark/light mode support

#### **Chunk 1.3: Component Library Foundation**
- [ ] Set up shadcn/ui components
- [ ] Create base component wrappers
- [ ] Implement responsive design system
- [ ] Set up icon library (Lucide React)
- [ ] Create layout components

### **Phase 2: Authentication & User Management (Week 2)**
**Goal**: Implement user authentication and account management

#### **Chunk 2.1: Authentication UI**
- [ ] Create login page with form validation
- [ ] Implement registration page
- [ ] Add password reset functionality
- [ ] Create email verification page
- [ ] Add social login support (optional)

#### **Chunk 2.2: User Onboarding Flow**
- [ ] Create user invitation acceptance page
- [ ] Implement profile completion wizard
- [ ] Add multi-step onboarding process
- [ ] Create welcome dashboard
- [ ] Add onboarding progress tracking

#### **Chunk 2.3: User Management**
- [ ] Create user profile management
- [ ] Implement account settings
- [ ] Add role-based access control UI
- [ ] Create user administration panel
- [ ] Add session management

### **Phase 3: White-Labeling & Branding (Week 2-3)**
**Goal**: Implement dynamic branding and white-labeling support

#### **Chunk 3.1: Branding API Integration**
- [ ] Create branding service for API calls
- [ ] Implement dynamic logo loading
- [ ] Add color scheme application
- [ ] Create branding fallback system
- [ ] Add branding validation

#### **Chunk 3.2: Theme Customization**
- [ ] Implement client-specific themes
- [ ] Add dynamic color application
- [ ] Create custom logo support
- [ ] Implement branding persistence
- [ ] Add theme preview capabilities

#### **Chunk 3.3: Multi-Tenant Support**
- [ ] Implement client switching
- [ ] Add tenant isolation
- [ ] Create client-specific routing
- [ ] Add tenant branding validation
- [ ] Implement cross-tenant features

### **Phase 4: KYC Integration & Dashboard (Week 3)**
**Goal**: Integrate KYC functionality and create user dashboard

#### **Chunk 4.1: KYC Integration**
- [ ] Create KYC initiation flow
- [ ] Implement iDenfy iframe integration
- [ ] Add verification status tracking
- [ ] Create verification history
- [ ] Add document management

#### **Chunk 4.2: User Dashboard**
- [ ] Create main dashboard layout
- [ ] Implement status overview cards
- [ ] Add recent activity feed
- [ ] Create notification system
- [ ] Add quick action buttons

#### **Chunk 4.3: Profile Management**
- [ ] Create profile editing interface
- [ ] Implement address management
- [ ] Add wallet address management
- [ ] Create attestation history
- [ ] Add compliance status display

## 🔧 **IMPLEMENTATION APPROACH**

### **1. Technology Stack**
```typescript
// Core Technologies
- React 18+ with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui for components
- React Router for navigation
- React Hook Form for forms
- Zod for validation
- Axios for API calls
- React Query for data fetching
```

### **2. Centralized Theming Architecture**
```typescript
// Theme Configuration
interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Theme Context
const ThemeContext = createContext<{
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  isDark: boolean;
  toggleDark: () => void;
}>({});

// Theme Provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### **3. White-Labeling Implementation**
```typescript
// Branding Service
export class BrandingService {
  private async fetchClientBranding(clientId: string): Promise<ClientBranding> {
    const response = await api.get(`/api/v1/clients/${clientId}/branding`);
    return response.data;
  }

  private applyBranding(branding: ClientBranding): void {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--color-primary', branding.primaryColor);
    root.style.setProperty('--color-secondary', branding.secondaryColor);
    
    // Apply logo
    if (branding.logoUrl) {
      this.updateLogo(branding.logoUrl);
    }
    
    // Store branding in context
    this.brandingContext.setBranding(branding);
  }

  public async initializeBranding(clientId?: string): Promise<void> {
    if (clientId) {
      const branding = await this.fetchClientBranding(clientId);
      this.applyBranding(branding);
    } else {
      this.applyDefaultBranding();
    }
  }
}

// Branding Hook
export const useBranding = () => {
  const { branding, isLoading, error } = useContext(BrandingContext);
  
  return {
    branding,
    isLoading,
    error,
    logoUrl: branding?.logoUrl,
    primaryColor: branding?.primaryColor,
    secondaryColor: branding?.secondaryColor,
    clientName: branding?.client?.name,
  };
};
```

### **4. Component Architecture**
```typescript
// Base Component with Theming
export const BaseButton: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantClasses = {
    primary: `bg-primary text-primary-foreground hover:bg-primary/90`,
    secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/80`,
    outline: `border border-input hover:bg-accent hover:text-accent-foreground`,
    ghost: `hover:bg-accent hover:text-accent-foreground`,
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8',
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size])}
      {...props}
    >
      {children}
    </button>
  );
};
```

### **5. Routing Structure**
```typescript
// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/reset-password" element={<PasswordResetPage />} />
      <Route path="/invite/:token" element={<InviteAcceptancePage />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="kyc" element={<KycPage />} />
        <Route path="attestations" element={<AttestationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="clients" element={<ClientManagementPage />} />
        <Route path="branding" element={<BrandingManagementPage />} />
      </Route>
    </Routes>
  );
};
```

## 📋 **DELIVERABLES BY PHASE**

### **Phase 1 Deliverables**
- ✅ React app initialized with TypeScript and Vite
- ✅ shadcn/ui components configured
- ✅ Centralized theming system working
- ✅ Base component library established

### **Phase 2 Deliverables**
- ✅ Authentication UI functional
- ✅ User onboarding flow complete
- ✅ User management interface working
- ✅ Account settings operational

### **Phase 3 Deliverables**
- ✅ White-labeling system functional
- ✅ Dynamic branding working
- ✅ Multi-tenant support implemented
- ✅ Theme customization complete

### **Phase 4 Deliverables**
- ✅ KYC integration working
- ✅ User dashboard functional
- ✅ Profile management complete
- ✅ End-to-end user flow working

## 🚨 **CRITICAL SUCCESS FACTORS**

### **1. Centralized Theming**
- **Must support**: Dynamic theme switching
- **Must handle**: Client-specific branding
- **Must provide**: Consistent design system
- **Must support**: Dark/light mode

### **2. White-Labeling**
- **Must support**: Dynamic logo and colors
- **Must handle**: Branding fallbacks
- **Must provide**: Client isolation
- **Must support**: Real-time branding updates

### **3. User Experience**
- **Must provide**: Intuitive onboarding
- **Must support**: Responsive design
- **Must handle**: Accessibility requirements
- **Must support**: Multiple languages

### **4. Performance**
- **Must load**: < 3 seconds initial load
- **Must render**: < 100ms component updates
- **Must support**: Code splitting
- **Must optimize**: Bundle size

## 🔍 **TESTING STRATEGY**

### **Unit Testing**
- Component rendering
- Theme application
- Branding integration
- Form validation

### **Integration Testing**
- API integration
- Authentication flows
- Branding application
- User onboarding

### **End-to-End Testing**
- Complete user journeys
- Cross-browser compatibility
- Mobile responsiveness
- Performance validation

## 📚 **RESOURCES & REFERENCES**

### **Primary Documentation**
- **React Documentation**: [React Official Docs](https://react.dev/)
- **shadcn/ui**: [shadcn/ui Documentation](https://ui.shadcn.com/)
- **Tailwind CSS**: [Tailwind CSS Docs](https://tailwindcss.com/)
- **Vite**: [Vite Documentation](https://vitejs.dev/)

### **Implementation Patterns**
- **Component Architecture**: Follow shadcn/ui patterns
- **State Management**: Use React hooks and context
- **Styling**: Use Tailwind CSS with CSS custom properties
- **API Integration**: Use React Query for data fetching

### **Key Integration Points**
- **Backend API**: Integrate with NestJS backend
- **Authentication**: Use JWT tokens from auth system
- **Branding**: Integrate with client branding API
- **KYC**: Integrate with iDenfy iframe system

## 🎯 **SUCCESS METRICS**

### **Functional Requirements**
- ✅ All authentication flows working
- ✅ White-labeling functional
- ✅ User onboarding complete
- ✅ KYC integration operational

### **Performance Requirements**
- ✅ Initial load < 3 seconds
- ✅ Component updates < 100ms
- ✅ Bundle size < 2MB
- ✅ Lighthouse score > 90

### **Quality Requirements**
- ✅ Responsive design working
- ✅ Accessibility compliant
- ✅ Cross-browser compatible
- ✅ Mobile-first design

## 🚀 **NEXT STEPS FOR AI AGENT**

1. **Start with Phase 1, Chunk 1.1**: Set up React application foundation
2. **Focus on theming system**: Implement centralized theming early
3. **Build component library**: Create reusable components with theming
4. **Implement authentication**: Connect with backend auth system
5. **Add white-labeling**: Integrate branding API and dynamic theming
6. **Test user flows**: Validate complete user journeys
7. **Optimize performance**: Ensure fast loading and rendering
8. **Document everything**: Create component and theming guides

This task creates a production-ready React frontend with centralized theming, white-labeling support, and complete user onboarding flows that integrate seamlessly with the KYC attestation platform. - **Started**: Wed Aug 27 18:07:07 PDT 2025
- **Last Update**: Wed Aug 27 18:07:08 PDT 2025 - Started implementation
