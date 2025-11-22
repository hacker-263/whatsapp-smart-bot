# Complete Command Reference Guide

## 📋 Command Overview

The bot supports **50+** commands organized by category. Use `!help <command>` for details.

---

## 🛍️ CUSTOMER COMMANDS (7 commands)

### Product Discovery
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Menu** | `!menu` | `!menu` | Shows main menu |
| **Browse Products** | `!products [category]` | `!products groceries` | Browse items in category |
| **Search** | `!search <item>` | `!search sadza` | Find specific item |

### Shopping
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **View Cart** | `!cart` | `!cart` | Show shopping cart |
| **Add to Cart** | `!order <items>` | `!order sadza x2, chicken` | Add items |
| **Checkout** | `!checkout` | `!checkout` | Proceed to payment |
| **Order Status** | `!status [order_id]` | `!status` | View your orders |

---

## 💼 MERCHANT COMMANDS (17 commands)

### Business Dashboard
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Dashboard** | `!dashboard` | `!dashboard` | Full business overview |
| **Orders** | `!orders [filter]` | `!orders pending` | View orders |
| **Analytics** | `!analytics` | `!analytics` | Business statistics |

### Billing & Payments
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Billing** | `!billing` | `!billing` | View billing info |
| **Commissions** | `!commission` | `!commission` | Commission breakdown |
| **Payout** | `!payout` | `!payout` | Request withdrawal |
| **Subscription** | `!subscription` | `!subscription` | Manage subscription |
| **Upgrade** | `!upgrade` | `!upgrade` | View upgrade options |

### Inventory Management
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Inventory** | `!inventory` | `!inventory` | Stock status |
| **Low Stock** | `!lowstock` | `!lowstock` | Items below threshold |
| **Reorder** | `!reorder` | `!reorder` | Reorder suggestions |
| **Update Stock** | `!stock <item> <qty>` | `!stock sadza 100` | Update quantity |
| **Products** | `!products` | `!products` | Your product list |

---

## 👨‍💼 ADMIN COMMANDS (30+ commands)

### Platform Management
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Merchants** | `!merchants [filter]` | `!merchants` | View all merchants |
| **Platform Stats** | `!platform` | `!platform` | Platform overview |
| **Health** | `!health` | `!health` | System health check |
| **Broadcast** | `!broadcast <msg>` | `!broadcast New items!` | Send to all chats |

### User Management
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Block User** | `!block <phone>` | `!block 263771234567` | Block phone number |
| **Unblock User** | `!unblock <phone>` | `!unblock 263771234567` | Unblock phone |
| **List Blocked** | `!listblocked` | `!listblocked` | Show blocked users |
| **Add Premium** | `!addpremium <phone> <days>` | `!addpremium 263771234567 30` | Grant premium |
| **Remove Premium** | `!removepremium <phone>` | `!removepremium 263771234567` | Revoke premium |
| **List Premium** | `!listpremium` | `!listpremium` | Show premium users |

### System Operations
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Restart** | `!restart` | `!restart` | Restart bot (⚠️ Owner only) |
| **Update** | `!update` | `!update` | Update from repo |
| **Backup** | `!backup` | `!backup` | Create database backup |
| **Restore** | `!restore <id>` | `!restore backup_2024_01_01` | Restore from backup |
| **Clear Cache** | `!clearcache` | `!clearcache` | Clear all caches |

### Developer Commands (⚠️ Owner Only)
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Eval** | `!eval <code>` | `!eval 1+1` | Execute JavaScript |
| **Exec** | `!exec <command>` | `!exec ls -la` | Execute shell command |
| **Get DB** | `!getdb <table>` | `!getdb orders` | Export database table |
| **Get Session** | `!getsession` | `!getsession` | Export session file |
| **Set Main GC** | `!setgc <id>` | `!setgc 123@g.us` | Set logging group |
| **Send Template** | `!sendtemplate <jid> <name>` | `!sendtemplate 263771234567@s.whatsapp.net order` | Send template |

### User Rate Limiting
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Set Limit** | `!setlimit <phone> <limit>` | `!setlimit 263771234567 100` | Set daily limit |
| **Log** | `!log <message>` | `!log test message` | Write to log file |

---

## ℹ️ UTILITY COMMANDS (15+ commands)

### Information & Help
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Menu** | `!menu` | `!menu` | Show main menu |
| **Help** | `!help [cmd]` | `!help order` | Get command help |
| **About** | `!about` | `!about` | About this bot |
| **Source** | `!source` | `!source` | Source code link |
| **Terms** | `!terms` | `!terms` | Terms of Service |
| **Privacy** | `!privacy` | `!privacy` | Privacy Policy |

### Status & Stats
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Ping** | `!ping` | `!ping` | Check response time |
| **Status** | `!status` | `!status` | System status |
| **Uptime** | `!uptime` | `!uptime` | Bot running time |
| **Stats** | `!stats` | `!stats` | Bot statistics |

### Configuration & Support
| Command | Syntax | Example | Result |
|---------|--------|---------|--------|
| **Prefix** | `!prefix <char>` | `!prefix #` | Change command prefix |
| **Support** | `!support` | `!support` | Get support contact |
| **Donate** | `!donate` | `!donate` | Support project |
| **Feedback** | `!feedback <msg>` | `!feedback Great bot!` | Send feedback |
| **Join** | `!join <link>` | `!join https://...` | Join group |

---

## 🔤 COMMAND SYNTAX GUIDE

### Basic Syntax
```
!command              → Simple command
!command arg1 arg2    → With arguments
!command "text here"  → Quoted text
!command <item> x2    → With quantity
```

### Examples

**Order Items:**
```
!order sadza              → Single item
!order sadza, chicken     → Multiple items
!order sadza x2, chicken x3  → With quantities
```

**Dates:**
```
!payout 30        → Days
!backup           → Current date
```

**Filters:**
```
!orders pending        → Filter orders
!merchants active      → Active merchants
```

---

## 📱 NATURAL LANGUAGE PROCESSING

Even without prefix, the bot responds to:

| Message | Bot Response |
|---------|-------------|
| "hello" | Greeting response |
| "help" | Show menu |
| "thanks" | Acknowledgment |
| "how do i order" | Order instructions |
| "what's the price" | Pricing information |

---

## 🎯 COMMAND EXAMPLES BY USE CASE

### Scenario 1: Customer Ordering
```
Customer: !products groceries
Bot: Shows 10 grocery items
Customer: !order sadza x2, beans
Bot: Added to cart
Customer: !cart
Bot: Shows cart with total
Customer: !checkout
Bot: Payment options
```

### Scenario 2: Merchant Check Income
```
Merchant: !dashboard
Bot: Shows today's earnings, monthly stats, pending orders
Merchant: !billing
Bot: Invoice details
Merchant: !commission
Bot: Breakdown by category
```

### Scenario 3: Admin Manage Users
```
Admin: !merchants
Bot: List of all merchants
Admin: !stats
Bot: Platform statistics
Admin: !block 263771234567
Bot: User blocked
Admin: !broadcast New items available!
Bot: Message sent to all chats
```

---

## 🔒 PERMISSION LEVELS

### Public Commands (Everyone)
```
!menu, !help, !about, !ping, !products, !order, !cart, !status
```

### Merchant Commands (Verified merchants)
```
!dashboard, !billing, !inventory, !commission, !payout
```

### Admin Commands (Admin phone only)
```
!broadcast, !block, !merchants, !stats, !backup
```

### Owner Commands (ADMIN_PHONE only)
```
!eval, !exec, !restart, !getsession, !update
```

---

## ⚡ QUICK REFERENCE

### Most Used Commands
- `!menu` - Show all commands
- `!help` - Get help
- `!order` - Place order
- `!cart` - View shopping cart
- `!status` - Check order status
- `!dashboard` - Merchant dashboard
- `!stats` - Bot statistics

### Emergency Commands
- `!status` - Check if bot is online
- `!uptime` - See how long running
- `!health` - System health
- `!restart` - Restart bot (requires admin)

### Daily Use (Merchant)
```
Morning: !dashboard          → Check overnight sales
        !lowstock           → See what needs restocking
Midday:  !orders pending     → Check pending orders
Ending:  !commission         → Check earnings
        !payout             → Request payment
```

---

## 🎓 Learning Path

**Beginner** (Start here):
1. `!menu` - Learn available commands
2. `!help order` - Understand ordering
3. `!products` - Browse items
4. `!order` - Make first order

**Intermediate** (Next level):
1. `!dashboard` - Understand merchant view
2. `!billing` - Learn billing system
3. `!broadcast` - Send messages

**Advanced** (Master):
1. `!eval` - Execute code
2. `!backup` - Database management
3. `!getdb` - Data export

---

## 🔄 Command Variations

Some commands have aliases:

```
!order        = !buy = !purchase
!dashboard    = !dash = !business
!billing      = !invoice = !payment
!status       = !check = !track
!help         = !? = !info
```

---

## 📊 Command Statistics

- **Total Commands**: 50+
- **Customer Commands**: 7
- **Merchant Commands**: 17
- **Admin Commands**: 30+
- **Utility Commands**: 15+

---

## 💡 Tips & Tricks

1. **Use abbreviations**: `!dash` instead of `!dashboard`
2. **Get help anytime**: `!help <command>`
3. **Copy-paste commands**: Easy way to use long commands
4. **Share commands**: Send commands to others
5. **Set reminders**: Bot can remind you via messages

---

## ⚠️ Common Mistakes

| Mistake | Correct |
|---------|---------|
| `order sadza` | `!order sadza` |
| `! order sadza` | `!order sadza` |
| `!ORDER SADZA` | `!order sadza` |
| `!order "sadza x2"` | `!order sadza x2` |

---

**Last Updated:** November 2024  
**Total Commands:** 50+  
**Status:** Production Ready ✅

For more help: Type `!help` in WhatsApp
