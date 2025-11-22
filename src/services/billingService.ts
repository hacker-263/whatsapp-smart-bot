/**
 * Billing & Subscription Service
 * Handles subscriptions, commissions, invoicing, tax, wallets, payouts
 */

import { 
  SubscriptionPlan, 
  MerchantSubscription, 
  Invoice, 
  CommissionCalculation,
  MerchantStatement,
  PromoCode,
  Wallet,
  Payout
} from '../types/billing';

class BillingService {
  private baseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3000';
  private anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key';

  /**
   * Get all subscription plans
   */
  async getSubscriptionPlans(): Promise<{ success: boolean; plans?: SubscriptionPlan[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_plans',
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get plans',
      };
    }
  }

  /**
   * Subscribe merchant to a plan
   */
  async subscribePlan(merchantId: string, planId: string, promoCode?: string): Promise<{ success: boolean; subscription?: MerchantSubscription; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'subscribe_plan',
          merchant_id: merchantId,
          plan_id: planId,
          promo_code: promoCode,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to subscribe',
      };
    }
  }

  /**
   * Get merchant's current subscription
   */
  async getMerchantSubscription(merchantId: string): Promise<{ success: boolean; subscription?: MerchantSubscription; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_subscription',
          merchant_id: merchantId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get subscription',
      };
    }
  }

  /**
   * Upgrade subscription plan
   */
  async upgradePlan(merchantId: string, newPlanId: string): Promise<{ success: boolean; subscription?: MerchantSubscription; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upgrade_plan',
          merchant_id: merchantId,
          new_plan_id: newPlanId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upgrade plan',
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(merchantId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel_subscription',
          merchant_id: merchantId,
          reason,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      };
    }
  }

  /**
   * Calculate commission for an order
   */
  async calculateCommission(merchantId: string, orderAmount: number, category?: string): Promise<{ success: boolean; calculation?: CommissionCalculation; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'calculate_commission',
          merchant_id: merchantId,
          order_amount: orderAmount,
          category,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate commission',
      };
    }
  }

  /**
   * Generate merchant statement
   */
  async generateMerchantStatement(merchantId: string, periodStart: Date, periodEnd: Date, frequency: 'daily' | 'weekly' | 'monthly'): Promise<{ success: boolean; statement?: MerchantStatement; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_statement',
          merchant_id: merchantId,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          frequency,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate statement',
      };
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice(merchantId: string, subscriptionId?: string): Promise<{ success: boolean; invoice?: Invoice; pdfUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_invoice',
          merchant_id: merchantId,
          subscription_id: subscriptionId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate invoice',
      };
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(invoiceId: string): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download_invoice',
          invoice_id: invoiceId,
        }),
      });

      if (!response.ok) return null;
      return await response.blob();
    } catch (error) {
      console.error('Failed to download invoice:', error);
      return null;
    }
  }

  /**
   * Validate and apply promo code
   */
  async validatePromoCode(code: string, merchantId?: string, orderAmount?: number): Promise<{ success: boolean; promoCode?: PromoCode; discountAmount?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate_promo_code',
          code,
          merchant_id: merchantId,
          order_amount: orderAmount,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to validate promo code',
      };
    }
  }

  /**
   * Get or create merchant wallet
   */
  async getWallet(merchantId: string): Promise<{ success: boolean; wallet?: Wallet; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_wallet',
          merchant_id: merchantId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get wallet',
      };
    }
  }

  /**
   * Request payout
   */
  async requestPayout(merchantId: string, amount: number, bankAccountId: string): Promise<{ success: boolean; payout?: Payout; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request_payout',
          merchant_id: merchantId,
          amount,
          bank_account_id: bankAccountId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request payout',
      };
    }
  }

  /**
   * Get merchant payouts
   */
  async getPayouts(merchantId: string, status?: string): Promise<{ success: boolean; payouts?: Payout[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_payouts',
          merchant_id: merchantId,
          status,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payouts',
      };
    }
  }

  /**
   * Check subscription feature access
   */
  async hasFeatureAccess(merchantId: string, feature: string): Promise<boolean> {
    try {
      const result = await this.getMerchantSubscription(merchantId);
      
      if (!result.success || !result.subscription) {
        return false;
      }

      const tier = result.subscription.tier;
      // This would need to map tier to features
      return true;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  }

  /**
   * Get subscription usage
   */
  async getSubscriptionUsage(merchantId: string): Promise<{ success: boolean; usage?: any; limits?: any; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/billing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_usage',
          merchant_id: merchantId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get usage',
      };
    }
  }
}

export const billingService = new BillingService();
