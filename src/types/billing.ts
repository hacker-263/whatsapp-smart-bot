/**
 * Billing, Payments & Business Operations Types
 * Supports tiered subscriptions, commissions, invoicing, and multi-region tax handling
 */

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export type CommissionType = 'percentage' | 'fixed' | 'tiered' | 'hybrid';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';

export type TaxRegion = 'ZW' | 'ZA' | 'US' | 'GB' | 'EU';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  
  // Limits
  features: {
    maxProducts: number;
    maxOrdersPerMonth: number;
    maxStaffMembers: number;
    apiCallsPerDay: number;
    fileStorageGB: number;
    customBranding: boolean;
    advancedAnalytics: boolean;
    multiLocation: boolean;
    advancedPayments: boolean;
    webhooks: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    dedicatedAccount: boolean;
  };
  
  // Commission structure
  commission: CommissionStructure;
  
  // Discount & promo
  discountPercentage?: number;
  promoCode?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionStructure {
  type: CommissionType;
  basePercentage?: number;
  baseFixed?: number;
  
  // Tiered commissions by order value
  tiers?: {
    minOrderValue: number;
    maxOrderValue?: number;
    percentage: number;
    fixed?: number;
  }[];
  
  // Per-category commission
  categoryCommissions?: {
    category: string;
    percentage: number;
    fixed?: number;
  }[];
  
  // Seasonal adjustments
  seasonalAdjustments?: {
    period: string;
    percentageChange: number;
  }[];
}

export interface MerchantSubscription {
  id: string;
  merchantId: string;
  planId: string;
  tier: SubscriptionTier;
  
  // Status
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  
  // Dates
  startDate: Date;
  renewalDate: Date;
  trialEndsAt?: Date;
  cancelledAt?: Date;
  
  // Usage
  currentUsage: {
    ordersThisMonth: number;
    apiCallsToday: number;
    storageUsedGB: number;
    staffCount: number;
  };
  
  // Auto-renewal
  autoRenew: boolean;
  
  // Payment method
  paymentMethodId?: string;
  
  // Discount
  appliedPromoCode?: string;
  discountPercentage?: number;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  merchantId: string;
  subscriptionId?: string;
  
  // Invoice details
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  
  // Line items
  lineItems: InvoiceLineItem[];
  
  // Calculations
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  
  // Payment
  currency: string;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod?: string;
  paidAt?: Date;
  
  // Tax
  taxRegion: TaxRegion;
  taxId?: string;
  
  // PDF
  pdfUrl?: string;
  
  // Memo
  memo?: string;
  notes?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxPercentage?: number;
  taxAmount?: number;
}

export interface CommissionCalculation {
  orderId: string;
  orderAmount: number;
  commissionType: CommissionType;
  commissionPercentage: number;
  commissionAmount: number;
  
  // Breakdown
  baseCommission: number;
  adjustments: CommissionAdjustment[];
  
  // Tax
  taxOnCommission: number;
  netCommission: number;
  
  // Status
  status: 'calculated' | 'pending' | 'paid';
  
  calculatedAt: Date;
  paidAt?: Date;
}

export interface CommissionAdjustment {
  type: 'discount' | 'bonus' | 'penalty' | 'refund';
  reason: string;
  amount: number;
  percentage?: number;
}

export interface MerchantStatement {
  id: string;
  merchantId: string;
  periodStart: Date;
  periodEnd: Date;
  frequency: 'daily' | 'weekly' | 'monthly';
  
  // Revenue
  totalOrders: number;
  totalRevenue: number;
  
  // Commissions
  totalCommissions: number;
  commissionsBreakdown: {
    type: string;
    amount: number;
    percentage: number;
  }[];
  
  // Payouts
  totalPayouts: number;
  pendingPayouts: number;
  
  // Analysis
  topProducts: {
    productId: string;
    productName: string;
    sales: number;
    revenue: number;
  }[];
  
  // Taxes
  totalTaxes: number;
  
  // Net
  netEarnings: number;
  
  pdfUrl?: string;
  status: 'generated' | 'sent' | 'viewed';
  sentAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxRate {
  region: TaxRegion;
  standardRate: number;
  reducedRate?: number;
  zeroRated?: string[];
  
  // Category-specific
  categoryRates?: {
    category: string;
    rate: number;
  }[];
  
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  
  // Discount
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  
  // Validity
  validFrom: Date;
  validUntil?: Date;
  maxUsageCount?: number;
  currentUsageCount: number;
  maxUsagePerUser?: number;
  
  // Restrictions
  minOrderValue?: number;
  maxDiscountAmount?: number;
  applicableRegions?: TaxRegion[];
  applicablePlans?: SubscriptionTier[];
  applicableCategories?: string[];
  
  // Trial
  isTrialCode?: boolean;
  trialDuration?: number; // days
  
  // Status
  isActive: boolean;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId?: string;
  merchantId?: string;
  
  balance: number;
  currency: string;
  
  // Transactions
  totalCredit: number;
  totalDebit: number;
  
  // Status
  isActive: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  
  // Reference
  referenceType: 'order' | 'refund' | 'topup' | 'payout' | 'adjustment';
  referenceId: string;
  
  // Description
  description: string;
  
  // Status
  status: PaymentStatus;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export interface Payout {
  id: string;
  merchantId: string;
  
  // Amount
  amount: number;
  currency: string;
  
  // Bank details
  bankAccountId: string;
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Dates
  requestedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  
  // Reference
  referenceNumber?: string;
  failureReason?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReconciliationRecord {
  id: string;
  merchantId: string;
  
  // Dates
  periodStart: Date;
  periodEnd: Date;
  
  // Orders
  ordersCount: number;
  ordersTotal: number;
  
  // Commissions
  commissionsTotal: number;
  
  // Payouts
  payoutsTotal: number;
  
  // Discrepancies
  discrepancies: {
    type: string;
    amount: number;
    description: string;
  }[];
  
  // Status
  status: 'pending' | 'verified' | 'disputed';
  notes?: string;
  
  verifiedAt?: Date;
  verifiedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  userId?: string;
  merchantId?: string;
  
  // Type
  type: 'card' | 'bank_transfer' | 'ecocash' | 'onemoney' | 'payfast' | 'paypal' | 'wallet';
  
  // Status
  isDefault: boolean;
  isActive: boolean;
  
  // Details (encrypted)
  details: {
    lastFour?: string;
    expiryDate?: string;
    cardholderName?: string;
    bankName?: string;
    accountNumber?: string;
  };
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
