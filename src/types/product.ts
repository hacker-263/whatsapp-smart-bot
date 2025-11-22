/**
 * Advanced Product Catalog Types
 * Supports variants, SKUs, barcodes, bundles, lifecycle, rich attributes
 */

export type ProductStatus = 'draft' | 'under_review' | 'published' | 'archived' | 'discontinued';

export type VariantType = 'size' | 'color' | 'material' | 'weight' | 'capacity' | 'custom';

export interface ProductVariant {
  id: string;
  productId: string;
  
  // Variant attributes
  attributes: {
    type: VariantType;
    name: string;
    value: string;
  }[];
  
  // SKU
  sku: string;
  barcode?: string;
  upc?: string;
  
  // Pricing
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  
  // Stock
  stock: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  
  // Media
  imageUrl?: string;
  mediaGallery?: string[];
  
  // Status
  isActive: boolean;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdvancedProduct {
  id: string;
  merchantId: string;
  
  // Basic info
  name: string;
  description: string;
  shortDescription?: string;
  
  // Category & tags
  category: string;
  subcategory?: string;
  tags: string[];
  collections?: string[];
  
  // Status & lifecycle
  status: ProductStatus;
  statusHistory: {
    status: ProductStatus;
    changedAt: Date;
    changedBy: string;
    reason?: string;
  }[];
  
  // Pricing
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;
  
  // Stock
  baseStock: number;
  reserved: number;
  available: number;
  
  // Variants
  variants: ProductVariant[];
  hasVariants: boolean;
  
  // Images & media
  media: ProductMedia[];
  mainImage?: string;
  
  // Rich attributes
  attributes: ProductAttribute[];
  
  // Specifications
  specifications: {
    name: string;
    value: string;
  }[];
  
  // Physical properties
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  
  // Compliance
  warranty?: {
    period: number;
    unit: 'months' | 'years';
    description: string;
  };
  
  vendorInfo?: {
    vendorName: string;
    vendorPartNumber?: string;
    vendorSku?: string;
  };
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  seoSlug: string;
  
  // Content staging
  stagedContent?: {
    name?: string;
    description?: string;
    media?: ProductMedia[];
    scheduledFor: Date;
    status: 'scheduled' | 'active' | 'archived';
  };
  
  // Preview
  previewData: {
    whatsappPreview: string;
    webPreview: string;
    lastPreviewedAt?: Date;
  };
  
  // Ratings & reviews
  averageRating: number;
  reviewCount: number;
  
  // Analytics
  viewCount: number;
  cartCount: number;
  saleCount: number;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ProductMedia {
  id: string;
  productId: string;
  
  // File info
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'video/mp4' | 'video/webm';
  
  // Metadata
  width?: number;
  height?: number;
  duration?: number; // for video
  
  // Thumbnail
  thumbnailUrl?: string;
  
  // Optimization
  isOptimized: boolean;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  
  // Order
  displayOrder: number;
  
  // Type
  type: 'primary' | 'gallery' | 'thumbnail' | 'video' | 'other';
  
  // Alt text for accessibility
  altText?: string;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
  
  // Display
  displayOrder: number;
  isVisible: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  
  // For select/multiselect
  options?: {
    label: string;
    value: string;
  }[];
}

export interface ProductBundle {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  
  // Items
  bundledProducts: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number; // Individual product price at bundle creation
  }[];
  
  // Pricing
  bundlePrice: number;
  originalPrice: number; // Sum of individual prices
  discountPercentage: number;
  discountAmount: number;
  
  // Stock
  currentStock: number;
  minStockThreshold: number;
  
  // Promotion
  isFeatured: boolean;
  displayOrder: number;
  bannerImage?: string;
  
  // Validity
  validFrom: Date;
  validUntil?: Date;
  isActive: boolean;
  
  // Rules
  autoApplyDiscount: boolean;
  minimumOrderValue?: number;
  applicableRegions?: string[];
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDraft {
  id: string;
  merchantId: string;
  
  // Status
  status: 'draft' | 'in_review';
  
  // Content
  content: Partial<AdvancedProduct>;
  
  // Version
  version: number;
  versions: {
    version: number;
    content: Partial<AdvancedProduct>;
    createdAt: Date;
  }[];
  
  // Review
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  
  // Collaborative
  lastEditedBy: string;
  lastEditedAt: Date;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface PreviewSnapshot {
  productId: string;
  platform: 'whatsapp' | 'web' | 'mobile_app';
  
  // Preview data
  htmlSnapshot: string;
  imageSnapshot?: string;
  
  // Content
  content: {
    name: string;
    description: string;
    price: string;
    media: {
      url: string;
      altText?: string;
    }[];
  };
  
  // Metadata
  generatedAt: Date;
  isLatest: boolean;
  
  metadata?: Record<string, any>;
}

export interface ProductSeoData {
  productId: string;
  
  // Meta
  title: string;
  description: string;
  keywords: string[];
  slug: string;
  
  // Structured data
  schema: {
    '@context': string;
    '@type': string;
    name: string;
    description: string;
    image: string[];
    price: string;
    priceCurrency: string;
    availability: string;
    aggregateRating?: {
      '@type': string;
      ratingValue: number;
      reviewCount: number;
    };
  };
  
  // OpenGraph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  
  // Twitter Card
  twitterCard?: 'summary' | 'summary_large_image' | 'product';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Canonical URL
  canonicalUrl?: string;
  
  // Performance
  pagespeedScore?: number;
  lastAnalyzedAt?: Date;
  
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
