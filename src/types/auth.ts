/**
 * Extended Authentication & Authorization Types
 * Supports phone-first accounts, multi-factor auth, RBAC with 6+ role tiers
 */

export type UserRole = 
  | 'super_admin'      // Platform owner, full access
  | 'admin'            // Regional/category admin
  | 'manager'          // Merchant manager/team lead
  | 'merchant'         // Store owner
  | 'staff'            // Store staff (kitchen, cashier, etc)
  | 'driver'           // Delivery driver
  | 'support'          // Customer support agent
  | 'customer';        // Regular customer

export type AuthMethod = 'otp' | 'pin' | 'email_password' | 'oauth' | 'whatsapp';

export type OTPStatus = 'pending' | 'verified' | 'failed' | 'expired';

export interface PhoneVerification {
  phoneNumber: string;
  countryCode: string;
  isVerified: boolean;
  verifiedAt?: Date;
}

export interface MultiFactorAuth {
  enabled: boolean;
  method: 'otp' | 'pin' | 'authenticator';
  backupCodes: string[];
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceName?: string;
  deviceType: 'mobile' | 'web' | 'tablet' | 'bot';
  ipAddress?: string;
  userAgent?: string;
  token: string;
  refreshToken?: string;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface ExtendedUser {
  id: string;
  phoneNumber: string;
  email?: string;
  name: string;
  role: UserRole;
  roles?: UserRole[]; // Multiple roles support
  status: 'active' | 'inactive' | 'suspended' | 'pending_approval';
  
  // Auth methods
  authMethods: AuthMethod[];
  passwordHash?: string;
  pinHash?: string;
  
  // Phone verification
  phone: PhoneVerification;
  
  // Multi-factor auth
  mfa?: MultiFactorAuth;
  
  // Profile
  profileImage?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  
  // Account health
  accountHealth: {
    passwordStrength: 'weak' | 'medium' | 'strong';
    last2faEnabled?: Date;
    last2faUsed?: Date;
    suspiciousActivities: number;
    riskScore: number; // 0-100
  };
  
  // Merchant-specific
  merchantId?: string;
  merchantRole?: 'owner' | 'manager' | 'staff';
  
  // Driver-specific
  driverId?: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  vehicleInfo?: {
    model: string;
    plate: string;
    color: string;
  };
  
  // Support-specific
  department?: 'sales' | 'support' | 'billing' | 'technical';
  
  // Sessions
  activeSessions: UserSession[];
  maxActiveSessions: number;
  
  // Preferences
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    privacyMode: boolean;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  lastPasswordChange?: Date;
}

export interface OTPVerification {
  code: string;
  status: OTPStatus;
  phoneNumber: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

export interface PINVerification {
  pin: string;
  enabled: boolean;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  createdAt: Date;
}

export interface AuthContext {
  user: ExtendedUser | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface LoginRequest {
  phoneNumber?: string;
  email?: string;
  password?: string;
  pin?: string;
  method: AuthMethod;
}

export interface OTPRequest {
  phoneNumber: string;
  method: 'sms' | 'whatsapp';
  duration?: number; // minutes
}

export interface RegisterRequest {
  phoneNumber: string;
  name: string;
  role: UserRole;
  email?: string;
  password?: string;
  region?: 'ZW' | 'ZA' | string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
  features: string[];
  limits?: {
    maxProducts?: number;
    maxOrders?: number;
    maxStaff?: number;
  };
}

// Role-based permission matrix
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'manage_users',
    'manage_merchants',
    'manage_admins',
    'view_analytics',
    'manage_payments',
    'manage_disputes',
    'manage_compliance',
    'system_settings',
    'manage_features',
  ],
  admin: [
    'view_merchants',
    'approve_merchants',
    'suspend_merchants',
    'view_regional_analytics',
    'manage_support',
    'manage_disputes',
  ],
  manager: [
    'manage_staff',
    'view_analytics',
    'manage_inventory',
    'manage_orders',
    'export_data',
  ],
  merchant: [
    'manage_products',
    'manage_orders',
    'view_analytics',
    'manage_inventory',
    'manage_messages',
    'export_data',
    'manage_templates',
  ],
  staff: [
    'view_orders',
    'update_order_status',
    'manage_inventory_basic',
    'view_schedule',
  ],
  driver: [
    'view_assigned_orders',
    'update_delivery_status',
    'view_route',
    'view_schedule',
  ],
  support: [
    'view_customers',
    'manage_disputes',
    'process_refunds',
    'view_analytics_basic',
  ],
  customer: [
    'view_orders',
    'place_orders',
    'view_products',
    'manage_profile',
  ],
};
