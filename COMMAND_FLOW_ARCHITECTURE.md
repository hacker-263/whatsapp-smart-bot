# 🗺️ Command Flow & Architecture Map

## Command Routing Architecture

```
User Message
    ↓
Parse Command (!)
    ↓
    ├─→ !owner, !about, !feedback, !stats → AuthHandler
    │
    ├─→ !register, !login, !verify, !help → AuthHandler
    │
    ├─→ !menu, !search, !add, !checkout → CustomerHandler
    │   ├─→ !trending
    │   ├─→ !deals
    │   ├─→ !promo
    │   └─→ !featured
    │
    ├─→ !merchant <cmd> → MerchantHandler
    │   ├─→ !merchant performance
    │   ├─→ !merchant customers
    │   ├─→ !merchant feedback
    │   ├─→ !merchant boost
    │   └─→ !merchant tips
    │
    └─→ !admin <cmd> → AdminHandler
        ├─→ !admin merchants
        ├─→ !admin approve
        └─→ !admin sales
```

---

## User Journey Maps

### 👤 New Customer Journey

```
START
  ↓
!help / !owner / !about
  ↓
!register [name] [customer]
  ↓
!menu (browse products)
  ↓
!search pizza (find specific item)
  ↓
!add prod_001 2 (add to cart)
  ↓
!cart (view cart)
  ↓
!checkout (place order)
  ↓
!track [order_id] (track delivery)
  ↓
!rate [order_id] 5 (rate order)
  ↓
COMPLETED
```

### 🏪 New Merchant Journey

```
START
  ↓
!help / !owner / !about
  ↓
!register [shop_name] [merchant]
  ↓
!merchant store (set up profile)
  ↓
!merchant add-product (add items)
  ↓
Await approval from admin
  ↓
!merchant orders new (receive orders)
  ↓
!merchant accept [order_id]
  ↓
!merchant update-status [order_id] [status]
  ↓
!merchant analytics (view performance)
  ↓
!merchant boost (promote store)
  ↓
GROWING
```

### 👨‍💼 Admin Workflow

```
START
  ↓
!admin merchants pending (review new merchants)
  ↓
!admin approve [merchant_id] OR !admin reject [merchant_id]
  ↓
!admin sales today (monitor sales)
  ↓
!admin stats (view platform stats)
  ↓
!admin logs errors (check issues)
  ↓
!admin broadcast (send announcements)
  ↓
END OF DAY
```

---

## Command Family Trees

### General Commands
```
!help / !about / !owner / !feedback / !stats
├─ Information
├─ Contact
├─ Feedback
└─ Analytics
```

### Authentication
```
!register / !login / !verify / !logout / !profile
├─ Onboarding
├─ Login Flow
└─ Account Management
```

### Shopping Commands
```
!menu / !search / !categories / !nearby
├─ Browse
├─ Discover
└─ Location-based
```

### Cart & Checkout
```
!add / !cart / !remove / !clear / !checkout
├─ Add Items
├─ Manage Cart
└─ Complete Purchase
```

### Order Management
```
!orders / !track / !reorder / !rate
├─ Order History
├─ Live Tracking
└─ Feedback
```

### Promotions
```
!deals / !promo / !trending / !featured
├─ Special Offers
├─ Vouchers
├─ Popular Items
└─ Recommendations
```

### Merchant Operations
```
!merchant <command>
├─ Orders
│  ├─ orders
│  ├─ accept
│  ├─ reject
│  └─ update-status
├─ Products
│  ├─ products
│  ├─ add-product
│  ├─ edit-product
│  └─ delete-product
├─ Store
│  ├─ store
│  ├─ store-status
│  ├─ store-hours
│  └─ store-profile
├─ Analytics
│  ├─ analytics
│  ├─ dashboard
│  ├─ performance
│  └─ customers
├─ Feedback
│  └─ feedback
└─ Growth
   ├─ boost
   └─ tips
```

---

## Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    WhatsApp User Input                          │
│                    (User sends message)                         │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│            BotController.processMessage()                       │
│  ├─ Validate message                                            │
│  ├─ Check rate limits                                           │
│  └─ Extract command & args                                      │
└────────────────┬──────────────────────────────────────────────┘
                 │
                 ↓
         ┌──────────────────┐
         │  Is Command?     │
         └────┬─────────────┘
              │
              ├─→ Yes → CommandParser.parseCommand()
              │         └─→ Route to handler
              │
              └─→ No → Natural Language Processing
                       ├─→ Detect intent
                       └─→ Route to appropriate handler
                
    Routes to:
    ├─ AuthHandler (registration, auth, info)
    ├─ CustomerHandler (shopping, orders)
    ├─ MerchantHandler (store management)
    └─ AdminHandler (moderation)
                
                 ↓
         Handler processes request
         ├─ Validate user permissions
         ├─ Query database/cache
         ├─ Call backend API if needed
         └─ Format response
         
                 ↓
         Format message with:
         ├─ Box drawing borders
         ├─ Emojis
         ├─ Hierarchical sections
         └─ Action buttons
         
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│              Send Response to User                              │
│    (Beautiful formatted message with actionable items)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
WhatsApp Bot ←→ Local Cache (JSON) ←→ Backend API ←→ Database
                 ├─ Sessions (24h)
                 ├─ Carts (2h)
                 ├─ Products (15m)
                 ├─ Merchants (30m)
                 └─ Command History
```

---

## Command Categories by Frequency

### ⭐⭐⭐ MOST USED
```
!menu           - 35% of messages
!search         - 25% of messages
!add / !cart    - 20% of messages
!checkout       - 15% of messages
```

### ⭐⭐ FREQUENTLY USED
```
!orders         - 10% of messages
!track          - 8% of messages
!deals          - 7% of messages
!merchant       - 6% of messages (merchants only)
```

### ⭐ OCCASIONALLY USED
```
!trending       - 3% of messages
!promo          - 2% of messages
!featured       - 2% of messages
!about          - 1% of messages
!feedback       - 1% of messages
!owner          - 0.5% of messages
```

---

## Response Time Targets

| Command | Type | Backend Call | Response Time |
|---------|------|--------------|---------------|
| !menu | Read Cache | Optional | <100ms |
| !search | API Call | Yes | 500-1000ms |
| !add | Local | No | <50ms |
| !checkout | API Call | Yes | 1-2s |
| !merchant | API Call | Yes | 500-1000ms |
| !stats | Cache/API | Optional | <500ms |
| !owner | Static | No | <50ms |

---

## Cache Strategy

```
Session Cache (24 hours)
├─ User profile
├─ Authentication status
├─ Preferences
└─ Recent orders

Product Cache (15 minutes)
├─ Product listings
├─ Availability
└─ Pricing

Merchant Cache (30 minutes)
├─ Store info
├─ Hours
├─ Ratings
└─ Special offers

Cart Cache (2 hours)
├─ Items added
├─ Quantities
└─ Temporary hold
```

---

## Error Handling Flow

```
Exception Occurs
    ↓
├─ Rate Limit Hit?
│  └─→ "Too many requests, please wait..."
│
├─ Invalid Input?
│  └─→ Show usage help
│
├─ User Not Authenticated?
│  └─→ "Please !login first"
│
├─ Permission Denied?
│  └─→ "This command requires merchant role"
│
├─ Backend API Error?
│  └─→ Retry 3 times with exponential backoff
│
├─ Unknown Error?
│  └─→ Log error & show generic message
│
└─→ Log to error tracking
    └─→ Notify admin if critical
```

---

## Command Enhancement Timeline

```
Phase 1 (Complete) ✅
├─ Basic commands
├─ User authentication
└─ Simple message formatting

Phase 2 (Complete) ✅
├─ Role-based commands
├─ Modern UI with emojis
└─ Box drawing borders

Phase 3 (Just Added) ✅
├─ Creative commands
├─ Dummy data
├─ Comprehensive docs
└─ Sample templates

Phase 4 (Upcoming)
├─ Real backend integration
├─ Image upload support
├─ Real-time notifications
└─ Advanced analytics
```

---

## Command Performance Metrics

### Execution Time
- Simple commands (no API): <100ms
- API-dependent commands: 500ms-2s
- Complex queries: 1-5s

### Success Rate Target
- All commands: 99.5% success
- API calls: 99% success (with retries)
- Cache hits: 100% fast delivery

### User Experience
- Message formatting: < 50ms
- Response display: < 100ms
- Button interaction: < 500ms

---

## Integration Points

```
Bot ← → Backend API
 ├─ POST /register (new user)
 ├─ POST /login (authenticate)
 ├─ GET /products (list items)
 ├─ GET /search (find products)
 ├─ POST /orders (create order)
 ├─ GET /orders/{id} (track order)
 ├─ POST /feedback (store feedback)
 ├─ GET /merchants (list sellers)
 └─ GET /stats (platform analytics)

Bot ← → WhatsApp API (Baileys)
 ├─ Send Message
 ├─ Receive Message
 ├─ Update Status
 ├─ Handle Groups
 └─ Media Support
```

---

## Scalability Considerations

### Horizontal Scaling
- Independent handler processes
- Load-balanced webhook receivers
- Distributed cache layer
- Multiple bot instances

### Vertical Scaling
- Command optimization
- Cache optimization
- API request batching
- Connection pooling

### Database Scaling
- Sharding by user ID
- Read replicas for analytics
- Archive old records
- Index optimization

---

## Security Flow

```
User Input
    ↓
├─ XSS Protection (escape special chars)
├─ SQL Injection Prevention (parameterized queries)
├─ Rate Limiting (per user per minute)
├─ Authentication Check (token validation)
├─ Authorization Check (role verification)
└─ Input Validation (schema validation)
    ↓
Safe to Process
    ↓
├─ Encrypt sensitive data
├─ Log audit trail
├─ Monitor suspicious activity
└─ Secure response delivery
```

---

## Notification Flow

```
Event Occurs
(Order status change, etc.)
    ↓
Webhook from Backend
    ↓
BotController processes
    ↓
Format notification
    ↓
Send to user via WhatsApp
    ↓
Log delivery status
```

---

## Testing Command Sequence

```
Test User Registration
  !register John customer
    ↓
Test Browsing
  !menu
  !search pizza
  !categories
    ↓
Test Shopping
  !add prod_001 2
  !cart
  !checkout
    ↓
Test Tracking
  !orders
  !track [order_id]
    ↓
Test Promotions
  !deals
  !promo
  !trending
  !featured
    ↓
Test General Commands
  !owner
  !about
  !feedback Nice app!
  !stats
```

---

**Last Updated:** November 22, 2025  
**Architecture Version:** 2.0  
**Status:** Ready for Implementation
