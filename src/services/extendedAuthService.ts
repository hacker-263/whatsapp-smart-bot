/**
 * Extended Authentication Service
 * Supports phone-first auth, OTP, PIN, multi-factor, RBAC, device management
 */

import { 
  ExtendedUser, 
  UserRole, 
  UserSession, 
  OTPVerification,
  RegisterRequest,
  LoginRequest,
  ROLE_PERMISSIONS
} from '../types/auth';

class ExtendedAuthService {
  private baseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3000';
  private anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key';

  /**
   * Register a new user with phone-first approach
   */
  async register(request: RegisterRequest): Promise<{ success: boolean; user?: ExtendedUser; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          ...request,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string, method: 'sms' | 'whatsapp' = 'whatsapp'): Promise<{ success: boolean; expiresIn?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_otp',
          phone_number: phoneNumber,
          method,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<{ success: boolean; user?: ExtendedUser; token?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_otp',
          phone_number: phoneNumber,
          otp,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OTP verification failed',
      };
    }
  }

  /**
   * Verify PIN
   */
  async verifyPIN(userId: string, pin: string): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify_pin',
          user_id: userId,
          pin,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PIN verification failed',
      };
    }
  }

  /**
   * Set or update PIN
   */
  async setPIN(userId: string, pin: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set_pin',
          user_id: userId,
          pin,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set PIN',
      };
    }
  }

  /**
   * Enable multi-factor authentication
   */
  async enableMFA(userId: string, method: 'otp' | 'pin' | 'authenticator'): Promise<{ success: boolean; secret?: string; backupCodes?: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'enable_mfa',
          user_id: userId,
          method,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable MFA',
      };
    }
  }

  /**
   * Create a new session for device
   */
  async createSession(userId: string, deviceInfo: any): Promise<{ success: boolean; session?: UserSession; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_session',
          user_id: userId,
          device_info: deviceInfo,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      };
    }
  }

  /**
   * Get active sessions for user
   */
  async getActiveSessions(userId: string): Promise<{ success: boolean; sessions?: UserSession[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_sessions',
          user_id: userId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sessions',
      };
    }
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: string, sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'revoke_session',
          user_id: userId,
          session_id: sessionId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke session',
      };
    }
  }

  /**
   * Revoke all sessions
   */
  async revokeAllSessions(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'revoke_all_sessions',
          user_id: userId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke all sessions',
      };
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(userRole: UserRole, permission: string): boolean {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  }

  /**
   * Get all permissions for a role
   */
  getPermissions(userRole: UserRole): string[] {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }

      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refresh token',
      };
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await this.getToken();
      
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'logout',
        }),
      });

      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
      
      return await response.json();
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
      
      return { success: true };
    }
  }

  /**
   * Get current token
   */
  private async getToken(): Promise<string> {
    let token = localStorage.getItem('authToken');
    
    if (!token) {
      const result = await this.refreshToken();
      token = result.token || '';
    }
    
    return token;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ success: boolean; user?: ExtendedUser; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_current_user',
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<ExtendedUser>): Promise<{ success: boolean; user?: ExtendedUser; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/auth-extended`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_profile',
          user_id: userId,
          updates,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }
}

export const extendedAuthService = new ExtendedAuthService();
