/**
 * Inventory Management Service
 * Multi-warehouse support, stock sync, FIFO/LIFO, backorders, bundles
 */

import { 
  InventoryLevel, 
  StockBatch, 
  LowStockAlert,
  ReorderSuggestion,
  StockTransfer,
  BackorderItem,
  PartialShipment,
  Bundle,
  BundleInventory,
  InventoryAdjustment
} from '../types/inventory';

class InventoryService {
  private baseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3000';
  private anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key';

  /**
   * Get inventory level for a product in a warehouse
   */
  async getInventoryLevel(productId: string, warehouseId?: string): Promise<{ success: boolean; inventory?: InventoryLevel; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_inventory',
          product_id: productId,
          warehouse_id: warehouseId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get inventory',
      };
    }
  }

  /**
   * Get all stock batches for a product
   */
  async getStockBatches(productId: string, warehouseId: string): Promise<{ success: boolean; batches?: StockBatch[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_batches',
          product_id: productId,
          warehouse_id: warehouseId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stock batches',
      };
    }
  }

  /**
   * Adjust inventory (add/remove stock)
   */
  async adjustInventory(productId: string, quantity: number, reason: string, reference?: string, warehouseId?: string): Promise<{ success: boolean; adjustment?: InventoryAdjustment; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'adjust_inventory',
          product_id: productId,
          quantity,
          reason,
          reference,
          warehouse_id: warehouseId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to adjust inventory',
      };
    }
  }

  /**
   * Reserve stock for an order
   */
  async reserveStock(productId: string, quantity: number, orderId: string, warehouseId?: string): Promise<{ success: boolean; batchId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reserve_stock',
          product_id: productId,
          quantity,
          order_id: orderId,
          warehouse_id: warehouseId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reserve stock',
      };
    }
  }

  /**
   * Release reserved stock
   */
  async releaseReservedStock(productId: string, quantity: number, orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'release_reserved_stock',
          product_id: productId,
          quantity,
          order_id: orderId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to release reserved stock',
      };
    }
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(productId: string, quantity: number, fromWarehouseId: string, toWarehouseId: string): Promise<{ success: boolean; transfer?: StockTransfer; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transfer_stock',
          product_id: productId,
          quantity,
          from_warehouse_id: fromWarehouseId,
          to_warehouse_id: toWarehouseId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer stock',
      };
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(merchantId: string): Promise<{ success: boolean; alerts?: LowStockAlert[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_low_stock_alerts',
          merchant_id: merchantId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get low stock alerts',
      };
    }
  }

  /**
   * Acknowledge low stock alert
   */
  async acknowledgeLowStockAlert(alertId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'acknowledge_alert',
          alert_id: alertId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to acknowledge alert',
      };
    }
  }

  /**
   * Get reorder suggestions
   */
  async getReorderSuggestions(merchantId: string): Promise<{ success: boolean; suggestions?: ReorderSuggestion[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_reorder_suggestions',
          merchant_id: merchantId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get reorder suggestions',
      };
    }
  }

  /**
   * Create backorder for out-of-stock item
   */
  async createBackorder(orderId: string, productId: string, quantity: number, expectedDate?: Date): Promise<{ success: boolean; backorder?: BackorderItem; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_backorder',
          order_id: orderId,
          product_id: productId,
          quantity,
          expected_date: expectedDate?.toISOString(),
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create backorder',
      };
    }
  }

  /**
   * Fulfill partial shipment for backorder
   */
  async fulfillPartialShipment(backorderId: string, quantity: number): Promise<{ success: boolean; shipment?: PartialShipment; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'fulfill_partial_shipment',
          backorder_id: backorderId,
          quantity,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fulfill partial shipment',
      };
    }
  }

  /**
   * Get bundle inventory availability
   */
  async getBundleInventory(bundleId: string): Promise<{ success: boolean; inventory?: BundleInventory; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_bundle_inventory',
          bundle_id: bundleId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bundle inventory',
      };
    }
  }

  /**
   * Sync inventory with external system
   */
  async syncInventory(merchantId: string, externalSystemId?: string): Promise<{ success: boolean; itemsSynced?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync_inventory',
          merchant_id: merchantId,
          external_system_id: externalSystemId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync inventory',
      };
    }
  }

  /**
   * Get inventory audit trail
   */
  async getInventoryAuditTrail(productId: string, warehouseId: string, days?: number): Promise<{ success: boolean; trail?: InventoryAdjustment[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_audit_trail',
          product_id: productId,
          warehouse_id: warehouseId,
          days,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get audit trail',
      };
    }
  }

  /**
   * Check if product is available for order
   */
  async isProductAvailable(productId: string, quantity: number, variantId?: string): Promise<boolean> {
    try {
      const result = await this.getInventoryLevel(productId);
      
      if (!result.success || !result.inventory) {
        return false;
      }

      return result.inventory.availableQuantity >= quantity;
    } catch (error) {
      console.error('Failed to check product availability:', error);
      return false;
    }
  }

  /**
   * Forecast stock for a product
   */
  async forecastStock(productId: string, warehouseId: string, daysAhead?: number): Promise<{ success: boolean; forecast?: { date: Date; projectedStock: number }[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/inventory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forecast_stock',
          product_id: productId,
          warehouse_id: warehouseId,
          days_ahead: daysAhead || 30,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to forecast stock',
      };
    }
  }
}

export const inventoryService = new InventoryService();
