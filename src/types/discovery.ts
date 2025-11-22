/**
 * Discovery, Search & Analytics Types
 * Full-text search, geo-search, faceted filtering, trending, analytics
 */

export type FilterType = 'price' | 'rating' | 'category' | 'merchant' | 'delivery' | 'payment' | 'eco';

export type SortOption = 'relevance' | 'price_low' | 'price_high' | 'newest' | 'rating' | 'popularity' | 'delivery_time';

export interface SearchQuery {
  q: string;
  filters?: SearchFilter[];
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  type: FilterType;
  value: any;
  operator?: 'eq' | 'gte' | 'lte' | 'between' | 'in';
}

export interface SearchResult {
  id: string;
  type: 'product' | 'merchant' | 'collection';
  title: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
  relevanceScore: number;
}

export interface FacetedSearch {
  query: SearchQuery;
  results: SearchResult[];
  totalCount: number;
  facets: Facet[];
  suggestedQueries?: string[];
}

export interface Facet {
  type: FilterType;
  name: string;
  options: {
    value: any;
    label: string;
    count: number;
  }[];
}

export interface GeoSearch {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  maxResults?: number;
}

export interface GeoSearchResult {
  id: string;
  name: string;
  type: 'merchant' | 'warehouse';
  latitude: number;
  longitude: number;
  distanceKm: number;
  estimatedDeliveryTime?: number; // minutes
  address?: string;
}

export interface TrendingItem {
  id: string;
  title: string;
  type: 'product' | 'merchant' | 'category';
  image?: string;
  trendingScore: number;
  searchVolume: number;
  period: 'daily' | 'weekly' | 'monthly';
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  rank: number;
}

export interface SeasonalPromotion {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  products: string[]; // Product IDs
  discount: number;
  type: 'seasonal' | 'holiday' | 'flash_sale';
}

export interface MerchantDiscovery {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  image?: string;
  badges: string[];
  trustScore: number;
  deliveryTime?: number;
  minimumOrder?: number;
  socialProof?: {
    followers: number;
    orders: number;
  };
}

// Analytics types
export interface ProductAnalytics {
  productId: string;
  views: number;
  clicks: number;
  addedToCart: number;
  purchased: number;
  conversionRate: number;
  averageTimeOnPage: number;
  searchKeywords: {
    keyword: string;
    count: number;
  }[];
  referralSources: {
    source: string;
    count: number;
  }[];
}

export interface MerchantAnalytics {
  merchantId: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  customerRetentionRate: number;
  topProducts: {
    productId: string;
    sales: number;
    revenue: number;
  }[];
  trafficSource: {
    organic: number;
    paid: number;
    direct: number;
    referral: number;
  };
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  geographicBreakdown: {
    region: string;
    orders: number;
    revenue: number;
  }[];
}

export interface CustomerCohort {
  cohortId: string;
  createdDate: Date;
  size: number;
  retentionByWeek: number[];
  revenue: number;
  churnRate: number;
}

export interface HeatmapData {
  region: string;
  orderDensity: number;
  avgOrderValue: number;
  topCategories: string[];
  timestamp: Date;
}

export interface RecommendationEngine {
  productId: string;
  recommendations: {
    productId: string;
    score: number;
    reason: 'frequently_bought_together' | 'similar' | 'personalized' | 'trending';
  }[];
}
