// Authentication service for frontend
// Handles login, logout, token management, and user state

import apiClient from './api';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  clientId: string;
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize user from localStorage if available
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        apiClient.setToken(token);
        this.scheduleTokenRefresh();
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        this.logout();
      }
    }
  }

  async login(
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // For now, we'll use mock authentication since the login endpoint isn't implemented
      // TODO: Replace with actual login endpoint when available

      // Mock successful login for development
      if (credentials.email && credentials.password) {
        const mockUser: AuthUser = {
          id: 'mock-user-id',
          email: credentials.email,
          firstName: 'Mock',
          lastName: 'User',
          role: 'CLIENT_ADMIN',
          clientId: 'mock-client-id',
          permissions: ['invite:create', 'invite:manage', 'branding:manage'],
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        this.currentUser = mockUser;
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', mockToken);
        apiClient.setToken(mockToken);

        this.scheduleTokenRefresh();

        return { success: true };
      } else {
        return { success: false, error: 'Please provide email and password' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    apiClient.clearToken();

    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return (
      this.currentUser !== null && localStorage.getItem('auth_token') !== null
    );
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasPermission(permission: string): boolean {
    return this.currentUser?.permissions.includes(permission) || false;
  }

  private scheduleTokenRefresh() {
    // Schedule token refresh for 14 minutes (1 minute before expiry)
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    this.tokenRefreshTimeout = setTimeout(
      () => {
        this.refreshToken();
      },
      14 * 60 * 1000,
    ); // 14 minutes
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return;
    }

    try {
      // TODO: Implement actual token refresh when the endpoint is available
      console.log('Token refresh would happen here');
      this.scheduleTokenRefresh();
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  // Mock login for development - creates a fake admin user
  async mockLogin(
    role: 'CLIENT_ADMIN' | 'CLIENT_USER' = 'CLIENT_ADMIN',
  ): Promise<void> {
    const mockUser: AuthUser = {
      id: 'mock-user-' + Date.now(),
      email: `${role.toLowerCase()}@example.com`,
      firstName: 'Mock',
      lastName: role === 'CLIENT_ADMIN' ? 'Admin' : 'User',
      role: role,
      clientId: 'mock-client-id',
      permissions:
        role === 'CLIENT_ADMIN'
          ? [
              'invite:create',
              'invite:manage',
              'branding:manage',
              'billing:manage',
            ]
          : ['invite:view'],
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    this.currentUser = mockUser;
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', mockToken);
    apiClient.setToken(mockToken);

    this.scheduleTokenRefresh();
  }
}

export const authService = new AuthService();
export default authService;
