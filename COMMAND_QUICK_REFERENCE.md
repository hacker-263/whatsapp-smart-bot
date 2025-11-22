# WhatsApp Bot - Quick Command Reference

## 🎯 General Commands (All Users)

| Command | Purpose | Example |
|---------|---------|---------|
| `!owner` | Get bot owner contact (Hxcker-263, +263781564004) | `!owner` |
| `!about` | Learn about the platform | `!about` |
| `!feedback <msg>` | Send feedback/suggestions | `!feedback Great app!` |
| `!stats` | View platform statistics | `!stats` |
| `!help [cmd]` | Get help on commands | `!help menu` |

---

## 👤 Authentication Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `!register <name> <role>` | Sign up as customer/merchant | `!register John customer` |
| `!login` | Log in with OTP | `!login` |
| `!verify <code>` | Verify OTP code | `!verify 123456` |
| `!profile` | View your profile | `!profile` |
| `!logout` | Log out | `!logout` |

---

## 🛒 Customer Commands

### 📋 Browsing & Search
| Command | Purpose | Example |
|---------|---------|---------|
| `!menu` or `!m` | View all products | `!menu` |
| `!search <query>` | Search products | `!search pizza` |
| `!categories` | View product categories | `!categories` |
| `!nearby` | Stores near you | `!nearby` |
| `!store <id>` | View store details | `!store store123` |
| `!trending` | Top 5 popular items | `!trending` |
| `!featured` | Featured merchants | `!featured` |

### 🛍️ Shopping & Checkout
| Command | Purpose | Example |
|---------|---------|---------|
| `!add <id> <qty>` | Add to cart | `!add prod001 2` |
| `!cart` or `!c` | View shopping cart | `!cart` |
| `!remove <#>` | Remove from cart | `!remove 3` |
| `!clear` | Empty cart | `!clear` |
| `!checkout` or `!pay` | Place order | `!checkout` |

### 📦 Orders & Tracking
| Command | Purpose | Example |
|---------|---------|---------|
| `!orders` | View order history | `!orders` |
| `!track <id>` | Track order status | `!track ORD12345` |
| `!reorder <id>` | Reorder from history | `!reorder ORD12345` |
| `!rate <id> <1-5>` | Rate an order | `!rate ORD12345 5` |

### 💳 Promotions & Preferences
| Command | Purpose | Example |
|---------|---------|---------|
| `!deals` | View special deals | `!deals` |
| `!promo` | View promo codes | `!promo` |
| `!favorites [add/remove]` | Manage favorites | `!favorites add prod001` |
| `!addresses [list/add/remove]` | Manage addresses | `!addresses list` |

---

## 🏪 Merchant Commands

### 📦 Order Management
| Command | Purpose | Example |
|---------|---------|---------|
| `!merchant orders [new/today/week]` | View orders | `!merchant orders new` |
| `!merchant accept <id>` | Accept order | `!merchant accept ORD123` |
| `!merchant reject <id> [reason]` | Reject order | `!merchant reject ORD123 Out of stock` |
| `!merchant update-status <id> <status>` | Update order status | `!merchant update-status ORD123 preparing` |

### 🛍️ Product Management
| Command | Purpose | Example |
|---------|---------|---------|
| `!merchant products [list/search]` | View products | `!merchant products list` |
| `!merchant add-product` | Add new product | `!merchant add-product` |
| `!merchant edit-product <id>` | Edit product | `!merchant edit-product prod123` |
| `!merchant delete-product <id>` | Delete product | `!merchant delete-product prod123` |

### 🏢 Store Management
| Command | Purpose | Example |
|---------|---------|---------|
| `!merchant store` | View store profile | `!merchant store` |
| `!merchant store-status [open/closed]` | Update status | `!merchant store-status open` |
| `!merchant store-hours <open> <close>` | Set hours | `!merchant store-hours 08:00 20:00` |
| `!merchant store-profile` | Edit profile | `!merchant store-profile` |

### 📊 Analytics & Performance
| Command | Purpose | Example |
|---------|---------|---------|
| `!merchant analytics [today/week/month]` | View analytics | `!merchant analytics today` |
| `!merchant dashboard` | Quick dashboard | `!merchant dashboard` |
| `!merchant performance` | Performance metrics | `!merchant performance` |
| `!merchant customers [list]` | View customers | `!merchant customers list` |
| `!merchant feedback <id>` | View order feedback | `!merchant feedback ORD123` |

### 🚀 Growth & Promotions
| Command | Purpose | Example |
|---------|---------|---------|
| `!merchant boost` | Promote your store | `!merchant boost` |
| `!merchant tips` | Success tips | `!merchant tips` |
| `!merchant settings` | Manage settings | `!merchant settings` |

---

## 👨‍💼 Admin Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `!admin merchants [pending/approved]` | View merchants | `!admin merchants pending` |
| `!admin approve <id>` | Approve merchant | `!admin approve merc123` |
| `!admin reject <id>` | Reject merchant | `!admin reject merc123` |
| `!admin suspend <id>` | Suspend merchant | `!admin suspend merc123` |
| `!admin sales [today/week]` | View sales | `!admin sales today` |
| `!admin stats` | Platform stats | `!admin stats` |
| `!admin logs [errors/users]` | View logs | `!admin logs errors` |
| `!admin broadcast <msg>` | Send broadcast | `!admin broadcast New deal!` |
| `!admin alerts` | System alerts | `!admin alerts` |

---

## 📊 Sample Product Menu

```
1. 🍕 Margherita Pizza - ZWL 2,500 ⭐ 4.8
2. 🍗 Fried Chicken Combo - ZWL 3,200 ⭐ 4.6
3. 🍞 Fresh Bread Loaf - ZWL 450 ⭐ 4.9
4. 🥤 Cold Bottle Coke - ZWL 350 ⭐ 4.7
5. 🍔 Beef Burger - ZWL 1,500 ⭐ 4.5
6. 🥬 Fresh Vegetables Pack - ZWL 800 ⭐ 4.8
7. 🐟 Grilled Fish Fillet - ZWL 2,800 ⭐ 4.9
8. 🥗 Mixed Fruit Salad - ZWL 600 ⭐ 4.7
9. 🎂 Chocolate Cake - ZWL 1,200 ⭐ 4.8
10. 🧃 Orange Juice 500ml - ZWL 280 ⭐ 4.6
11. 🍛 Rice & Beans Meal - ZWL 1,800 ⭐ 4.7
12. 🍲 Chicken Sadza Combo - ZWL 2,000 ⭐ 4.8
```

---

## 🎟️ Sample Promo Codes

```
WELCOME20   → 20% OFF first order
WEEKEND50   → 50% OFF on weekends
FOOD15      → 15% OFF food orders
LUCKY100    → ZWL 100 OFF orders > ZWL 500
VIP200      → ZWL 200 OFF (Min 3 orders)
REFER2024   → ZWL 75 referral credit
```

---

## 🔗 Command Prefixes

- `!` - All commands start with this prefix
- `!help` - Get help on any command
- `!menu` - Start shopping
- `!dashboard` - Quick overview (merchants)
- `!owner` - Contact owner directly

---

## 💡 Quick Tips

1. **New Users:** Start with `!register` then `!menu`
2. **Shopping:** Use `!search <item>` to find products
3. **Checkout:** Build cart with `!add` then `!checkout`
4. **Track Orders:** Use `!track <order_id>` anytime
5. **Merchants:** Check `!merchant dashboard` for quick stats
6. **Feedback:** Send suggestions with `!feedback`
7. **Deals:** Type `!deals` for current promotions

---

## 🎯 Order Status Workflow

```
New Order
    ↓
!merchant accept / !merchant reject
    ↓
preparing
    ↓
ready
    ↓
out_for_delivery
    ↓
delivered
```

---

## 📞 Contact

**Owner:** Hxcker-263  
**Phone:** +263781564004  
**Available:** 24/7 for support

---

**Last Updated:** November 22, 2025  
**Version:** 2.0 - Enhanced Commands  
**Print this page for quick reference!**
