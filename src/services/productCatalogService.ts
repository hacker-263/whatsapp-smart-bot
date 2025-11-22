/**
 * Product Catalog Service
 * Handles advanced product management: variants, SKUs, bundles, lifecycle, previews
 */

import { 
  AdvancedProduct, 
  ProductVariant, 
  ProductBundle,
  ProductDraft,
  PreviewSnapshot,
  ProductMedia
} from '../types/product';

class ProductCatalogService {
  private baseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:3000';
  private anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key';

  /**
   * Create a new product
   */
  async createProduct(merchantId: string, product: Partial<AdvancedProduct>): Promise<{ success: boolean; product?: AdvancedProduct; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_product',
          merchant_id: merchantId,
          product,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product',
      };
    }
  }

  /**
   * Get product details
   */
  async getProduct(productId: string): Promise<{ success: boolean; product?: AdvancedProduct; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_product',
          product_id: productId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get product',
      };
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, updates: Partial<AdvancedProduct>): Promise<{ success: boolean; product?: AdvancedProduct; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_product',
          product_id: productId,
          updates,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product',
      };
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string, markArchived?: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_product',
          product_id: productId,
          mark_archived: markArchived,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product',
      };
    }
  }

  /**
   * Create product variant
   */
  async createVariant(productId: string, variant: Partial<ProductVariant>): Promise<{ success: boolean; variant?: ProductVariant; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_variant',
          product_id: productId,
          variant,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create variant',
      };
    }
  }

  /**
   * Update variant
   */
  async updateVariant(variantId: string, updates: Partial<ProductVariant>): Promise<{ success: boolean; variant?: ProductVariant; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_variant',
          variant_id: variantId,
          updates,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update variant',
      };
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySKU(sku: string): Promise<{ success: boolean; product?: AdvancedProduct; variant?: ProductVariant; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_by_sku',
          sku,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get product by SKU',
      };
    }
  }

  /**
   * Get product by barcode
   */
  async getProductByBarcode(barcode: string): Promise<{ success: boolean; product?: AdvancedProduct; variant?: ProductVariant; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_by_barcode',
          barcode,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get product by barcode',
      };
    }
  }

  /**
   * Create product bundle
   */
  async createBundle(merchantId: string, bundle: Partial<ProductBundle>): Promise<{ success: boolean; bundle?: ProductBundle; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_bundle',
          merchant_id: merchantId,
          bundle,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create bundle',
      };
    }
  }

  /**
   * Update bundle
   */
  async updateBundle(bundleId: string, updates: Partial<ProductBundle>): Promise<{ success: boolean; bundle?: ProductBundle; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_bundle',
          bundle_id: bundleId,
          updates,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update bundle',
      };
    }
  }

  /**
   * Draft a product for review
   */
  async draftProduct(merchantId: string, product: Partial<AdvancedProduct>): Promise<{ success: boolean; draft?: ProductDraft; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'draft_product',
          merchant_id: merchantId,
          product,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to draft product',
      };
    }
  }

  /**
   * Submit draft for review
   */
  async submitForReview(draftId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_for_review',
          draft_id: draftId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit for review',
      };
    }
  }

  /**
   * Publish product from draft
   */
  async publishProduct(draftId: string): Promise<{ success: boolean; product?: AdvancedProduct; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish_product',
          draft_id: draftId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish product',
      };
    }
  }

  /**
   * Archive product (soft delete)
   */
  async archiveProduct(productId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'archive_product',
          product_id: productId,
          reason,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive product',
      };
    }
  }

  /**
   * Generate WhatsApp preview
   */
  async generatePreview(productId: string, platform: 'whatsapp' | 'web' | 'mobile_app' = 'whatsapp'): Promise<{ success: boolean; preview?: PreviewSnapshot; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_preview',
          product_id: productId,
          platform,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview',
      };
    }
  }

  /**
   * Upload product media (images/videos)
   */
  async uploadMedia(productId: string, file: File, type: 'primary' | 'gallery' | 'video' = 'gallery'): Promise<{ success: boolean; media?: ProductMedia; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('action', 'upload_media');
      formData.append('product_id', productId);
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload media',
      };
    }
  }

  /**
   * Optimize product images
   */
  async optimizeImages(productId: string): Promise<{ success: boolean; optimizedCount?: number; savedBytes?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimize_images',
          product_id: productId,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize images',
      };
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(merchantId: string, category: string, limit?: number): Promise<{ success: boolean; products?: AdvancedProduct[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_by_category',
          merchant_id: merchantId,
          category,
          limit,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get products by category',
      };
    }
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(productIds: string[], updates: Partial<AdvancedProduct>): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_update',
          product_ids: productIds,
          updates,
        }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk update products',
      };
    }
  }

  /**
   * Export products to CSV
   */
  async exportProductsToCSV(merchantId: string, filters?: any): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export_csv',
          merchant_id: merchantId,
          filters,
        }),
      });

      if (!response.ok) return null;
      return await response.blob();
    } catch (error) {
      console.error('Failed to export products:', error);
      return null;
    }
  }

  /**
   * Import products from CSV
   */
  async importProductsFromCSV(merchantId: string, file: File): Promise<{ success: boolean; imported?: number; errors?: string[]; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('action', 'import_csv');
      formData.append('merchant_id', merchantId);
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/functions/v1/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.anonKey}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import products',
      };
    }
  }
}

export const productCatalogService = new ProductCatalogService();
