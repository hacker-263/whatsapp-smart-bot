# ✏️ CUSTOMIZATION QUICK START

This guide shows you exactly what to change to make the bot YOUR bot.

---

## 🎯 30-Second Customization

### 1. Your Contact Info
**File:** `whatsapp-bot/src/handlers/authHandler.js` (around line 399)

**Find:**
```javascript
name: 'Hxcker-263',
phone: '+263781564004',
```

**Replace with:**
```javascript
name: 'Your Name',
phone: '+263XXXXXXXXX',
```

### 2. Your Owner Name in Help
**Search:** The word "Hxcker-263" anywhere in the codebase  
**Replace:** With your name

### 3. Your Business Info
**File:** `whatsapp-bot/src/handlers/authHandler.js`  
**Find:** The services list under `handleOwnerCommand()`  
**Update:** With your actual services

---

## 🍕 Add Your Products (5 minutes)

**File:** `whatsapp-bot/src/handlers/customerHandler.js`  
**Method:** `handleMenuCommand()` around line 110

**Current:**
```javascript
const dummyProducts = [
  { id: 'prod_001', name: 'Margherita Pizza', price: 2500, rating: 4.8, reviews: 156, merchant: 'Quick Eats', image: '🍕' },
  // ... more products
];
```

**What to Change:**
- `id` - Unique product ID
- `name` - Your product name
- `price` - Price in ZWL (or your currency)
- `rating` - Average rating (0-5)
- `reviews` - Number of reviews
- `merchant` - Your store name
- `image` - Emoji that represents it

**How to Add More:**
Simply add more objects to the array following the same format.

---

## 🏪 Add Your Merchants (5 minutes)

**File:** `whatsapp-bot/src/handlers/customerHandler.js`  
**Method:** `handleFeaturedCommand()` around line 720

**Find:** The merchant information sections

**Update:**
```javascript
{
  name: 'Your Store Name',
  category: 'Your Category',
  rating: 4.8,
  reviews: 342,
  location: 'Your Location',
  delivery_time: '25-35 mins',
  avg_price: 'ZWL 2,500',
  special: 'Your Special Offer',
  emoji: '🍕'
}
```

---

## 📊 Update Platform Statistics (2 minutes)

**File:** `whatsapp-bot/src/handlers/authHandler.js`  
**Method:** `handleStatsCommand()` around line 520

**Update these numbers:**
```javascript
const stats = {
  totalUsers: 2543,           // Your actual user count
  totalMerchants: 187,        // Your actual merchants
  totalOrders: 8934,          // Your total orders
  totalRevenue: 245600,       // Your total revenue
  avgOrderValue: 27.5,        // Calculate: revenue / orders
  activeNow: 342,             // Current active users
  avgRating: 4.8,             // Your platform average
  topCategory: 'Fresh Food',  // Your top category
  topMerchant: 'Local Mart',  // Your top merchant
  monthlyGrowth: 15,          // Growth percentage
};
```

---

## 🎟️ Create Your Promo Codes (5 minutes)

**File:** `whatsapp-bot/src/handlers/customerHandler.js`  
**Method:** `handlePromoCommand()` around line 690

**Add your codes:**
```javascript
// Code: WELCOME20      │ Discount: 20% OFF first order
// Code: YOURCODE       │ Discount: Your discount here
// Code: SUMMER50       │ Discount: 50% OFF summer items
```

**Real promo codes to add:**
- Create codes that match your marketing
- Set discount amounts you're comfortable with
- Update validity dates
- Keep them easy to remember

---

## 🔥 Update Trending Items (3 minutes)

**File:** `whatsapp-bot/src/handlers/customerHandler.js`  
**Method:** `handleTrendingCommand()` around line 629

**Replace the top 5 items:**
```javascript
const trendingItems = [
  { name: 'Your Popular Item', merchant: 'Merchant Name', sales: 324, rating: 4.8, emoji: '🍕' },
  { name: 'Item 2', merchant: 'Store 2', sales: 267, rating: 4.6, emoji: '🍗' },
  // ... update with your actual top sellers
];
```

**Where to get this data:**
- Look at your actual sales records
- Pick your 5 best-selling items
- Update with current numbers weekly

---

## 💰 Set Your Boost Prices (3 minutes)

**File:** `whatsapp-bot/src/handlers/merchantHandler.js`  
**Method:** `handleBoostCommand()` around line 640

**Update package prices:**
```javascript
// Current prices:
1. Featured Merchant (24hrs)    → ZWL 500
2. Flash Sale Promotion         → ZWL 800
3. Premium Badge                → ZWL 1,000/month
4. Category Spotlight           → ZWL 2,000/week
```

**Change to your prices:**
Decide what you want to charge merchants for these premium features.

---

## 📞 Contact Information Changes

### Places Where Contact Info Appears:

1. **!owner command** (authHandler.js, line 399)
   - Your name
   - Your phone
   - Your services list

2. **Sample merchant data** (customerHandler.js, line 720)
   - Replace example merchants with yours

3. **Documentation files**
   - Update in ENHANCED_COMMANDS_GUIDE.md
   - Update in SAMPLE_DATA_TEMPLATE.md

### Search & Replace These:
```
Hxcker-263          → Your Name
+263781564004       → Your WhatsApp Number
Quick Eats          → Your Primary Business Name
Harare CBD          → Your Location
WhatsApp Commerce   → Your Service Description
```

---

## 🎯 Customization Checklist

### Essential (Do First)
- [ ] Update owner name and phone
- [ ] Add your actual products (at least 12)
- [ ] Update merchant names to yours
- [ ] Change contact email
- [ ] Update statistics with real numbers

### Important (Do Soon)
- [ ] Create real promo codes
- [ ] Update trending items
- [ ] Set your boost package prices
- [ ] Add your store locations
- [ ] Update service descriptions

### Nice to Have (Optional)
- [ ] Add product images/descriptions
- [ ] Create loyalty program tiers
- [ ] Add team members
- [ ] Create merchant application form
- [ ] Add delivery zones map

### Technical (For Developers)
- [ ] Connect to real backend API
- [ ] Update database connection strings
- [ ] Configure payment processor
- [ ] Set up notification service
- [ ] Enable real image uploads

---

## 🔍 Where to Find Each Section

| What to Change | File | Method | Line |
|---|---|---|---|
| Owner Name/Phone | authHandler.js | handleOwnerCommand | ~399 |
| Platform Stats | authHandler.js | handleStatsCommand | ~520 |
| Products | customerHandler.js | handleMenuCommand | ~110 |
| Promo Codes | customerHandler.js | handlePromoCommand | ~690 |
| Trending | customerHandler.js | handleTrendingCommand | ~629 |
| Featured Merchants | customerHandler.js | handleFeaturedCommand | ~720 |
| Boost Prices | merchantHandler.js | handleBoostCommand | ~640 |
| Tips/Advice | merchantHandler.js | handleTipsCommand | ~670 |

---

## 📝 Sample Customization (Complete Example)

### BEFORE (Sample Data):
```
Owner: Hxcker-263
Phone: +263781564004
Product: Margherita Pizza - ZWL 2,500
Merchant: Quick Eats
Users: 2,543
Code: WELCOME20
```

### AFTER (Your Data):
```
Owner: Your Name
Phone: +263XXXXXXXXX
Product: Your Product - ZWL XXXX
Merchant: Your Store
Users: XXXXX
Code: YOUR_CODE
```

---

## ✅ Testing After Customization

After making changes, test these commands:

```
1. !owner
   ✓ See your name and number

2. !menu
   ✓ See your products and prices

3. !deals
   ✓ See your promo codes

4. !featured
   ✓ See your merchants

5. !trending
   ✓ See your trending items

6. !merchant boost
   ✓ See your boost prices

7. !stats
   ✓ See your platform stats
```

---

## 🚨 Common Customization Mistakes

### ❌ DON'T
- Leave demo data in production
- Use the same numbers as example
- Forget to update prices
- Modify handler function names
- Remove box drawing characters

### ✅ DO
- Replace all sample data
- Update statistics regularly
- Test commands after changes
- Keep proper formatting
- Backup original files first

---

## 📊 Data Update Schedule

**Daily:**
- Active users count
- Current trending items

**Weekly:**
- Platform statistics
- Top merchants
- Promo code refreshes

**Monthly:**
- Product catalog
- Merchant list
- Growth metrics

**As Needed:**
- Owner information
- Boost package prices
- Service descriptions

---

## 🔧 Quick Customization Script

You can use find & replace to update multiple places at once:

```bash
# Find all instances of your contact
grep -r "Hxcker-263" .

# Find all mentions of sample merchant
grep -r "Quick Eats" .

# Find all price placeholders
grep -r "ZWL" whatsapp-bot/src/handlers/
```

---

## 📞 Need Help?

### For Product Data
- Check your inventory system
- Get prices from your accounting
- Use actual sales numbers

### For Merchant Data
- Contact merchants directly
- Update from your CRM
- Get ratings from customers

### For Statistics
- Pull from your database
- Calculate from order history
- Use backend analytics API

### For Promo Codes
- Decide on your margins
- Check competitor offerings
- Test with small audience first

---

## 🎯 Priority Customization (Do This First)

1. **Your Name** (Takes 30 seconds)
   - Change "Hxcker-263" to your name everywhere

2. **Your Phone** (Takes 30 seconds)
   - Change "+263781564004" to your WhatsApp number

3. **Your Products** (Takes 5 minutes)
   - Add at least 12 products with real prices

4. **Your Stores** (Takes 5 minutes)
   - Add your actual merchant/store information

5. **Real Numbers** (Takes 2 minutes)
   - Update statistics with your real data

**Total Time: 18 minutes to basic customization ✅**

---

## 📚 Reference Files

All customizable data is in these files:

1. **authHandler.js** - General commands
2. **customerHandler.js** - Shopping commands  
3. **merchantHandler.js** - Merchant commands
4. **constants.js** - Global settings
5. **messageFormatter.js** - Message templates

---

## 🎉 You're Ready!

Once you customize these items, your bot will be:
- ✅ Personalized with your info
- ✅ Loaded with your products
- ✅ Showing your merchants
- ✅ Reflecting your business
- ✅ Ready for real users!

---

**Quick Start Guide Version:** 1.0  
**Last Updated:** November 22, 2025  
**Estimated Customization Time:** 20-30 minutes  
**Difficulty Level:** Easy ⭐
