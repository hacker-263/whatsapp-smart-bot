/**
 * Inventory Management & Fulfillment Types
 * Multi-warehouse support, stock sync, FIFO/LIFO, backorders, bundles
 */

export type StockDepletionRule = 'fifo' | 'lifo' | 'fefo' | 'random';

export type WarehouseType = 'primary' | 'secondary' | 'fulfillment' | 'temporary';

export type InventoryAdjustmentReason = 'sale' | 'return' | 'damage' | 'lost' | 'count_correction' | 'transfer' | 'received';

export type BackorderStatus = 'pending' | 'partial' | 'backordered' | 'fulfilled' | 'cancelled';

export interface Warehouse {
  id: string;
  merchantId: string;
  name: string;
  type: WarehouseType;
  
  // Location
  address: {
    street: string;
    city: string;
    region: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // Contact
  contactName: string;
  phoneNumber: string;
  email?: string;
  
  // Capacity
  totalCapacityUnits: number;
  currentUtilizationUnits: number;
  
  // Operations
  workingHours: {
    open: string; // HH:MM
    close: string;
    daysOfWeek: number[]; // 0-6
  };
  
  // Stock rules
  defaultDepletionRule: StockDepletionRule;
  
  // Status
  isActive: boolean;
  isPrimary: boolean;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockBatch {
  id: string;
  warehouseId: string;
  productId: string;
  
  // Batch info
  batchNumber: string;
  lotNumber?: string;
  serialNumbers?: string[];
  
  // Dates
  receivedDate: Date;
  expiryDate?: Date;
  manufacturingDate?: Date;
  
  // Quantities
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  availableQuantity: number; // currentQuantity - reservedQuantity
  
  // Cost
  costPerUnit: number;
  totalCost: number;
  
  // Status
  status: 'receiving' | 'active' | 'reserved' | 'depleted' | 'expired';
  
  // Depletion
  depletionRule: StockDepletionRule;
  depletionHistory: {
    date: Date;
    quantity: number;
    reason: InventoryAdjustmentReason;
    reference: string;
  }[];
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryLevel {
  id: string;
  productId: string;
  warehouseId: string;
  
  // Stock levels
  onHandQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  inTransitQuantity: number;
  
  // Thresholds
  minimumLevel: number;
  reorderLevel: number;
  maximumLevel: number;
  
  // Lead time
  reorderLeadDays: number;
  
  // Status
  status: 'optimal' | 'low' | 'critical' | 'overstock';
  
  // Last count
  lastCountDate?: Date;
  lastCountByUser?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  warehouseId?: string;
  
  // Adjustment
  quantity: number; // Positive or negative
  reason: InventoryAdjustmentReason;
  reference?: string; // Order ID, return ID, etc.
  
  // Details
  description: string;
  costImpact?: number;
  
  // User
  adjustedBy: string;
  approvedBy?: string;
  
  // Status
  status: 'pending' | 'approved' | 'rejected';
  
  // Dates
  adjustedAt: Date;
  approvedAt?: Date;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransfer {
  id: string;
  productId: string;
  
  // Warehouses
  fromWarehouseId: string;
  toWarehouseId: string;
  
  // Quantity
  quantity: number;
  
  // Status
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  
  // Dates
  initiatedAt: Date;
  shippedAt?: Date;
  receivedAt?: Date;
  
  // Reference
  shippingReference?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LowStockAlert {
  id: string;
  productId: string;
  warehouseId: string;
  
  // Alert details
  currentStock: number;
  minimumLevel: number;
  threshold: number;
  
  // Action
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  
  // Recommendation
  suggestedReorderQuantity: number;
  estimatedDeliveryDate?: Date;
  
  // Notification
  notificationSentAt: Date;
  notificationChannels: ('email' | 'sms' | 'whatsapp')[];
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReorderSuggestion {
  id: string;
  productId: string;
  warehouseId: string;
  
  // Analysis
  currentStock: number;
  dailyAverageUsage: number;
  leadTimeDays: number;
  
  // Calculation
  reorderPoint: number;
  economicOrderQuantity: number;
  safetyStock: number;
  suggestedOrderQuantity: number;
  
  // Priority
  urgency: 'low' | 'medium' | 'high' | 'critical';
  
  // Cost
  estimatedCost: number;
  costPerDay: number;
  
  // Status
  status: 'suggested' | 'approved' | 'ordered';
  approvedAt?: Date;
  orderedAt?: Date;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackorderItem {
  id: string;
  orderId: string;
  productId: string;
  
  // Quantity
  requestedQuantity: number;
  fulfilledQuantity: number;
  pendingQuantity: number;
  
  // Status
  status: BackorderStatus;
  
  // Expected
  expectedAvailabilityDate?: Date;
  
  // Fulfillment
  partialShipments: {
    shipmentId: string;
    quantity: number;
    shippedDate: Date;
  }[];
  
  // Customer
  notificationPreference: 'email' | 'sms' | 'whatsapp' | 'none';
  lastNotificationDate?: Date;
  
  // Cancellation
  cancellationAllowed: boolean;
  cancellationReason?: string;
  cancelledAt?: Date;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartialShipment {
  id: string;
  orderId: string;
  
  // Items
  items: {
    productId: string;
    quantity: number;
    backorderItem?: string;
  }[];
  
  // Status
  status: 'pending' | 'picked' | 'packed' | 'shipped' | 'delivered' | 'returned';
  
  // Tracking
  trackingNumber?: string;
  carrier?: string;
  
  // Dates
  createdAt: Date;
  pickedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  // Delivery
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  
  metadata?: Record<string, any>;
  updatedAt: Date;
}

export interface Bundle {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  
  // Items
  items: {
    productId: string;
    quantity: number;
    requiredQuantity?: number; // For conditional bundles
  }[];
  
  // Pricing
  bundlePrice: number;
  individualPrice: number; // Sum of individual prices
  discountPercentage: number;
  discountAmount: number;
  
  // Status
  status: 'draft' | 'active' | 'inactive' | 'discontinued';
  
  // Inventory
  currentStock: number;
  lowStockThreshold: number;
  
  // Dates
  validFrom: Date;
  validUntil?: Date;
  
  // Promotion
  isFeatured: boolean;
  displayOrder: number;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BundleInventory {
  bundleId: string;
  
  // Stock calculations
  currentAvailableQuantity: number;
  constrainedBy: string; // Product ID with lowest stock relative to quantity needed
  
  // Status
  canFulfillOrders: boolean;
  
  // Forecasting
  projectedStockoutDate?: Date;
  daysUntilStockout?: number;
  
  updatedAt: Date;
}
