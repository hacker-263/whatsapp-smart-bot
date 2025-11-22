# Sample Data & Customization Template

This document provides sample data structures that you can customize with your actual business information.

---

## 📝 PRODUCT DATA TEMPLATE

### Sample Format

```javascript
{
  id: 'prod_001',
  name: 'Margherita Pizza',
  price: 2500,
  image: '🍕',
  merchant: 'Quick Eats',
  merchant_id: 'merc_001',
  rating: 4.8,
  reviews: 156,
  stock: 45,
  category: 'Food & Restaurants',
  description: 'Classic Margherita with fresh mozzarella',
  delivery_time: '25-35 mins',
  tags: ['pizza', 'italian', 'food', 'quick']
}
```

### Products to Add (Replace with yours)

#### 🍔 Fast Food & Restaurants
```
1. Margherita Pizza (ZWL 2,500) - Quick Eats
2. Fried Chicken Combo (ZWL 3,200) - KFC Harare
3. Beef Burger (ZWL 1,500) - Burger King
4. Chicken Sadza (ZWL 2,000) - Local Market
5. Grilled Fish Fillet (ZWL 2,800) - Sea Foods
6. Mixed Rice & Beans (ZWL 1,800) - Traditional Kitchen
```

#### 🥗 Healthy & Organic
```
7. Mixed Fruit Salad (ZWL 600) - Health Hub
8. Fresh Vegetable Pack (ZWL 800) - Farmers Market
9. Grilled Chicken Breast (ZWL 2,200) - Fitness Foods
10. Quinoa Bowl (ZWL 1,400) - Organic Kitchen
11. Fresh Juice Mix (ZWL 350) - Fresh Juices
12. Smoothie Combo (ZWL 450) - Juice Bar
```

#### 🛒 Groceries & Supermarket
```
13. Fresh Bread Loaf (ZWL 450) - Local Bakery
14. Cold Bottle Coke (ZWL 350) - Refresh Shop
15. Orange Juice 500ml (ZWL 280) - Fresh Juices
16. Fresh Milk 1L (ZWL 520) - Farmers Market
17. Eggs Pack (ZWL 380) - Farmers Market
18. Butter 250g (ZWL 650) - Refresh Shop
```

#### 🎂 Bakery & Desserts
```
19. Chocolate Cake (ZWL 1,200) - Sweet Treats
20. Vanilla Cupcakes (ZWL 800) - Sweet Treats
21. Apple Pie (ZWL 950) - Local Bakery
22. Donut Pack (ZWL 600) - Sweet Treats
23. Cookies Assorted (ZWL 400) - Bakery
24. Cheesecake Slice (ZWL 700) - Sweet Treats
```

---

## 🏪 MERCHANT DATA TEMPLATE

### Sample Merchant Format

```javascript
{
  id: 'merc_001',
  name: 'Quick Eats',
  owner: 'John Mwale',
  phone: '+263781234567',
  category: 'Restaurant',
  location: 'Harare CBD',
  latitude: -17.8252,
  longitude: 31.0335,
  description: 'Premium Italian Pizza & Food',
  
  // Operations
  status: 'active', // active, closed, suspended
  hours: {
    open: '08:00',
    close: '21:00',
    breaks: []
  },
  delivery_radius: '5km',
  delivery_time_min: 25,
  delivery_time_max: 35,
  
  // Ratings & Reviews
  rating: 4.8,
  reviews_count: 342,
  satisfaction: 97.5,
  completion_rate: 98.2,
  on_time_delivery: 96.8,
  
  // Financial
  avg_order_value: 2500,
  total_orders: 2347,
  total_revenue: 5867500,
  
  // Verification
  approval_status: 'approved',
  verified: true,
  badge: 'premium',
  
  // Images
  banner_image: 'url',
  logo_image: 'url',
  
  // Contact
  email: 'info@quickeats.com',
  website: 'www.quickeats.com'
}
```

### Sample Merchants to Add

#### 🌟 Top Merchants

```javascript
const topMerchants = [
  {
    name: 'Quick Eats',
    category: 'Italian Pizza & Restaurant',
    rating: 4.8,
    reviews: 342,
    location: 'Harare CBD',
    delivery_time: '25-35 mins',
    avg_price: 'ZWL 2,500',
    special: 'Buy 2 Pizzas Get 1 Free',
    emoji: '🍕'
  },
  {
    name: 'KFC Harare',
    category: 'Fried Chicken',
    rating: 4.6,
    reviews: 267,
    location: 'Avondale',
    delivery_time: '30-40 mins',
    avg_price: 'ZWL 3,200',
    special: 'Combo Meals 25% OFF',
    emoji: '🍗'
  },
  {
    name: 'Farmers Market',
    category: 'Fresh Groceries',
    rating: 4.9,
    reviews: 189,
    location: 'Downtown',
    delivery_time: '15-25 mins',
    avg_price: 'ZWL 800',
    special: 'Fresh Produce 20% OFF 5-7pm',
    emoji: '🥬'
  },
  {
    name: 'Local Bakery',
    category: 'Bakery & Bread',
    rating: 4.9,
    reviews: 156,
    location: 'Harare',
    delivery_time: '10-20 mins',
    avg_price: 'ZWL 500',
    special: 'Free Bread > ZWL 1,000',
    emoji: '🍞'
  },
  {
    name: 'Sweet Treats',
    category: 'Cakes & Desserts',
    rating: 4.7,
    reviews: 203,
    location: 'Greenside',
    delivery_time: '20-30 mins',
    avg_price: 'ZWL 1,200',
    special: 'Birthday Cakes Order 2 Days Ahead',
    emoji: '🎂'
  }
];
```

---

## 📊 TRENDING & FEATURED DATA

### Trending Items (Update Weekly)

```javascript
const trendingItems = [
  {
    rank: 1,
    name: 'Margherita Pizza',
    merchant: 'Quick Eats',
    sales: 324,
    rating: 4.8,
    emoji: '🍕',
    badge: 'Most Popular'
  },
  {
    rank: 2,
    name: 'Fried Chicken',
    merchant: 'KFC Harare',
    sales: 267,
    rating: 4.6,
    emoji: '🍗',
    badge: 'Customer Favorite'
  },
  {
    rank: 3,
    name: 'Fresh Milk 1L',
    merchant: 'Farmers Market',
    sales: 189,
    rating: 4.9,
    emoji: '🥛',
    badge: 'High Demand'
  },
  {
    rank: 4,
    name: 'Sadza & Relish',
    merchant: 'Traditional Kitchen',
    sales: 156,
    rating: 4.7,
    emoji: '🍲',
    badge: 'Comfort Food'
  },
  {
    rank: 5,
    name: 'Beef Burger',
    merchant: 'Burger King',
    sales: 145,
    rating: 4.5,
    emoji: '🍔',
    badge: 'Best Seller'
  }
];
```

---

## 🎟️ PROMOTIONAL CODES

### Create Your Codes

```javascript
const promoCodes = [
  {
    code: 'WELCOME20',
    description: '20% OFF first order',
    discount_type: 'percentage',
    discount_value: 20,
    max_discount: 50,
    usage: 1,
    valid_from: '2025-01-01',
    valid_to: '2025-12-31',
    target: 'new_customers'
  },
  {
    code: 'WEEKEND50',
    description: '50% OFF on weekends',
    discount_type: 'percentage',
    discount_value: 50,
    max_discount: 200,
    usage: 'unlimited',
    valid_days: ['Saturday', 'Sunday'],
    target: 'all_users'
  },
  {
    code: 'FOOD15',
    description: '15% OFF food orders',
    discount_type: 'percentage',
    discount_value: 15,
    max_discount: 100,
    usage: 'unlimited',
    min_order: 500,
    category: 'food',
    target: 'all_users'
  },
  {
    code: 'LUCKY100',
    description: 'ZWL 100 OFF orders > ZWL 500',
    discount_type: 'fixed',
    discount_value: 100,
    min_order: 500,
    usage: 2,
    target: 'all_users'
  }
];
```

---

## 📈 PLATFORM STATISTICS

### Update These Monthly

```javascript
const platformStats = {
  monthly: {
    current_date: '2025-11-22',
    
    users: {
      total: 2543,
      new_this_month: 145,
      active_daily: 1240,
      active_now: 342
    },
    
    merchants: {
      total: 187,
      approved: 156,
      pending: 18,
      suspended: 3,
      new_this_month: 12
    },
    
    orders: {
      total: 8934,
      this_month: 1456,
      today: 123,
      completed: 8724,
      cancelled: 210
    },
    
    revenue: {
      total: 245600,
      this_month: 42800,
      today: 1950,
      currency: 'ZWL'
    },
    
    ratings: {
      average: 4.8,
      merchants: 4.8,
      drivers: 4.7,
      customers: 4.9
    },
    
    growth: {
      users_month_on_month: 12,
      orders_month_on_month: 15,
      revenue_growth: 18,
      merchant_growth: 8
    },
    
    top_items: [
      'Margherita Pizza',
      'Fried Chicken',
      'Fresh Milk',
      'Sadza & Relish',
      'Beef Burger'
    ],
    
    top_categories: [
      'Fresh Food',
      'Groceries',
      'Restaurants',
      'Bakery',
      'Beverages'
    ],
    
    top_merchants: [
      'Quick Eats',
      'KFC Harare',
      'Local Bakery',
      'Farmers Market',
      'Sweet Treats'
    ]
  }
};
```

---

## 💰 PRICING & PACKAGES

### Merchant Boost Packages

```javascript
const boostPackages = [
  {
    id: 'featured_24h',
    name: 'Featured Merchant (24hrs)',
    price: 500,
    duration: 24,
    placement: 'top_search_results',
    reach: 5000,
    expected_increase: '30-50%',
    features: [
      'Top placement in search',
      'Featured badge',
      'Highlighted in feed'
    ]
  },
  {
    id: 'flash_sale',
    name: 'Flash Sale Promotion',
    price: 800,
    duration: 6,
    placement: 'promotional_banner',
    reach: 10000,
    expected_increase: '40-60%',
    features: [
      'Promotional banner',
      'Highlight discounts',
      'Push notifications'
    ]
  },
  {
    id: 'premium_badge',
    name: 'Premium Badge (Monthly)',
    price: 1000,
    duration: 30,
    placement: 'profile_badge',
    reach: 'ongoing',
    expected_increase: '25-35%',
    features: [
      'Premium badge on profile',
      'Priority support',
      'Analytics dashboard'
    ]
  },
  {
    id: 'category_spotlight',
    name: 'Category Spotlight (Weekly)',
    price: 2000,
    duration: 7,
    placement: 'category_top',
    reach: 15000,
    expected_increase: '50-70%',
    features: [
      'Top in category',
      'Weekly featured',
      'Category highlights'
    ]
  }
];
```

---

## 🎁 REFERRAL & LOYALTY PROGRAM

### Referral Structure

```javascript
const referralProgram = {
  referee_reward: {
    discount: 50,
    type: 'credit',
    max_usage: 'first_order',
    expires: 30 // days
  },
  
  referrer_reward: {
    credit: 50,
    type: 'cash_credit',
    per_successful_referral: 50,
    unlimited: true,
    minimum_purchase_to_validate: 200
  },
  
  loyalty_tiers: [
    {
      name: 'Silver',
      min_orders: 5,
      min_spend: 2500,
      benefits: ['5% off', 'Priority support']
    },
    {
      name: 'Gold',
      min_orders: 15,
      min_spend: 7500,
      benefits: ['10% off', 'Free delivery', 'Birthday gift']
    },
    {
      name: 'Platinum',
      min_orders: 30,
      min_spend: 15000,
      benefits: ['15% off', 'Free delivery always', 'VIP support']
    }
  ]
};
```

---

## 🔑 CUSTOMIZATION CHECKLIST

### Before Going Live

- [ ] Add real merchant data (replace Quick Eats, KFC, etc.)
- [ ] Add real product listings with accurate prices
- [ ] Set up real promo codes and discounts
- [ ] Configure merchant boost packages with real pricing
- [ ] Set platform statistics to real data sources
- [ ] Add real customer data (if any)
- [ ] Update owner contact information
- [ ] Create actual product images/emojis
- [ ] Set real delivery zones and times
- [ ] Configure payment methods
- [ ] Test all commands with real data
- [ ] Set up backend API integration
- [ ] Enable notifications and alerts
- [ ] Create backup procedures

---

## 📝 NOTES FOR IMPLEMENTATION

1. **Database Integration:** These samples should be connected to your actual database via backend API
2. **Real-time Updates:** Product prices, stock, and merchant status should update from your database
3. **Image Handling:** Replace emoji placeholders with actual product images
4. **Localization:** Add local language support if needed
5. **Currency:** Update from ZWL if operating in different country
6. **Validation:** Ensure all IDs and references are unique
7. **Scalability:** Test with larger datasets as the platform grows

---

**Template Version:** 1.0  
**Last Updated:** November 22, 2025  
**Ready for Customization:** ✅
