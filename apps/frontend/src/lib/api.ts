// API Client for KYC Attestation Platform
// Handles all HTTP requests to the backend API with proper error handling and authentication

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateInvitationDto {
  email: string;
  role: 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'CLIENT_USER';
  firstName?: string;
  lastName?: string;
  message?: string;
  permissions?: string[];
}

export interface BulkInvitationDto {
  invitations: CreateInvitationDto[];
  commonMessage?: string;
}

export interface InvitationResponse {
  id: string;
  email: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  invitedBy: string;
  firstName?: string;
  lastName?: string;
}

export interface PaginatedInvitationsResult {
  invitations: InvitationResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BrandingData {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  borderColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  shadow?: string;
  customCSS?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
          data: data,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Invitation API methods
  async createInvitation(invitation: CreateInvitationDto): Promise<ApiResponse<InvitationResponse>> {
    return this.request<InvitationResponse>('/api/v1/invitations', {
      method: 'POST',
      body: JSON.stringify(invitation),
    });
  }

  async createBulkInvitations(bulkInvitation: BulkInvitationDto): Promise<ApiResponse<any>> {
    return this.request('/api/v1/invitations/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkInvitation),
    });
  }

  async getInvitations(params: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    search?: string;
  } = {}): Promise<ApiResponse<PaginatedInvitationsResult>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedInvitationsResult>(
      `/api/v1/invitations?${searchParams.toString()}`
    );
  }

  async getInvitation(id: string): Promise<ApiResponse<InvitationResponse>> {
    return this.request<InvitationResponse>(`/api/v1/invitations/${id}`);
  }

  async resendInvitation(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/invitations/${id}/resend`, {
      method: 'POST',
    });
  }

  async revokeInvitation(id: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/invitations/${id}/revoke`, {
      method: 'DELETE',
    });
  }

  async acceptInvitation(token: string, userData: {
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<ApiResponse<User>> {
    return this.request<User>(`/api/v1/invitations/accept/${token}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User management methods
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/api/v1/users');
  }

  async removeUser(userId: string): Promise<ApiResponse<void>> {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Branding/White-labeling API methods
  async getBranding(): Promise<ApiResponse<BrandingData>> {
    return this.request<BrandingData>('/api/v1/branding');
  }

  async updateBranding(branding: Partial<BrandingData>): Promise<ApiResponse<BrandingData>> {
    return this.request<BrandingData>('/api/v1/branding', {
      method: 'PUT',
      body: JSON.stringify(branding),
    });
  }

  async uploadLogo(file: File): Promise<ApiResponse<{ logoUrl: string }>> {
    const formData = new FormData();
    formData.append('logo', file);

    return this.request<{ logoUrl: string }>('/api/v1/branding/logo', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let the browser set it for multipart/form-data
      },
    });
  }

  // Billing API methods
  async getBillingStatus(): Promise<ApiResponse<{
    status: string;
    subscriptionId?: string;
    gracePeriodEndsAt?: string;
    lastPaymentFailedAt?: string;
  }>> {
    return this.request('/api/v1/billing/status');
  }

  async createCustomerPortalSession(): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>('/api/v1/billing/customer-portal', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/api/v1/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient; 