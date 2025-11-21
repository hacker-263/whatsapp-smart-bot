# ⚡ Quick Reference Guide

## 🎯 Start Here

### First Time Setup (5 minutes)
```bash
./quickstart.sh
# or manually:
docker-compose up -d
cd whatsapp-bot && npm install && npm start
```

### Running Services
```bash
# Terminal 1: Web
npm run dev

# Terminal 2: Bot
cd whatsapp-bot && npm start

# Terminal 3: API
cd whatsapp-bot && npm run api
```

---

## 📱 Bot Commands

### Essential
- `!help` - Show all commands
- `!test` - Run self-test
- `!menu` / `!m` - View products
- `!add product qty` - Add to cart
- `!cart` / `!c` - View cart
- `!checkout` / `!pay` - Order
- `!status id` - Track order

### User Account
- `!register name` - Create account
- `!login email password` - Login
- `!profile` - View profile
- `!preferences` - Update settings
- `!orders-history` - Past orders

---

## 🔗 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Web | http://localhost:5173 | None |
| Bot Health | http://localhost:3001/health | None |
| API | http://localhost:4001 | None |
| pgAdmin | http://localhost:5050 | admin@example.com / admin |
| PostgreSQL | localhost:5432 | postgres / postgres |
| Redis | localhost:6379 | None |

---

## 🚀 Quick API Tests

### Get Products
```bash
curl http://localhost:4001/api/products
```

### Register User
```bash
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","phone_number":"+263781234567","role":"customer"}'
```

### Create Order
```bash
curl -X POST http://localhost:4001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id":"550e...",
    "customer_phone":"+263781234567",
    "items":[{"product_id":"650e...","quantity":2}],
    "total_amount":11.00,
    "currency":"USD",
    "payment_method":"cash"
  }'
```

---

## 🔧 Docker Commands

```bash
# Start all
docker-compose up -d

# Stop all
docker-compose stop

# View logs
docker-compose logs -f

# Restart service
docker-compose restart postgres

# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d smart_whatsapp

# Connect to Redis
docker-compose exec redis redis-cli
```

---

## 📊 Database Queries

### See All Users
```sql
SELECT * FROM users;
```

### See All Orders
```sql
SELECT id, status, total_amount, created_at FROM orders;
```

### See Products
```sql
SELECT name, price, currency, stock FROM products;
```

### See Analytics
```sql
SELECT * FROM bot_analytics;
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -i :5432` then `kill -9 PID` |
| Database error | `docker-compose down -v && docker-compose up -d` |
| QR code not showing | Resize terminal, check UTF-8 support |
| API not responding | `curl http://localhost:4001/health` |
| Slow response | Check `docker stats` |

---

## 📝 Common Tasks

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d
# Migrationgs run automatically
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U postgres smart_whatsapp > backup.sql
```

### View Bot Logs
```bash
docker-compose logs bot -f
# or
tail -100 logs/bot.log
```

### Test API
```bash
curl -s http://localhost:4001/health | jq
```

---

## 🎯 Testing Checklist

- [ ] `!register John` works
- [ ] `!menu` shows products
- [ ] `I want 2 sadza` → intent detected
- [ ] `!add sadza 2` adds to cart
- [ ] `!cart` shows formatted cart
- [ ] `!checkout` creates order
- [ ] Random text ignored
- [ ] `!test` passes
- [ ] API responds (GET /api/products)
- [ ] Commands work in groups

---

## 📚 Documentation Map

```
README.md
├─ LOCAL_SETUP_GUIDE.md (Docker setup)
├─ API_DOCUMENTATION.md (Endpoint reference)
├─ FEATURES_COMPLETE.md (All features)
├─ BOT_FEATURES.md (Bot capabilities)
├─ DEPLOYMENT_READY.md (Production info)
├─ PRODUCTION_DEPLOYMENT.md (Deploy checklist)
└─ IMPLEMENTATION_SUMMARY.md (What was built)
```

**Start with**: LOCAL_SETUP_GUIDE.md

---

## 💡 Tips & Tricks

### Watch Real-Time Activity
```bash
# Terminal 1
docker-compose logs -f

# Terminal 2
tail -f logs/bot.log

# Terminal 3
watch docker stats
```

### Test in Multiple Accounts
- Bot on your number
- API on Postman
- Web on browser
- All connected to same database

### Reset Bot State
```bash
rm -rf whatsapp-bot/auth_info_baileys
npm start  # Generates new QR
```

### Monitor Database
```bash
# Watch query performance
docker-compose exec postgres psql -U postgres -d smart_whatsapp -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"
```

---

## 🚀 Going to Production

1. Read PRODUCTION_DEPLOYMENT.md
2. Update .env with production credentials
3. Update docker-compose for production
4. Run pre-deployment checks
5. Deploy!

---

## 📞 Getting Help

**Issues?**
1. Check LOCAL_SETUP_GUIDE.md troubleshooting
2. Review API_DOCUMENTATION.md
3. Run `!test` command
4. Check logs: `docker-compose logs`
5. See FEATURES_COMPLETE.md for details

**Documentation is comprehensive!** 📚

---

## ⚡ Power Commands

```bash
# Complete reset
docker-compose down -v && docker-compose up -d && npm install

# Start everything
docker-compose up -d && \
  (cd whatsapp-bot && npm start) & \
  (cd whatsapp-bot && npm run api)

# Monitor all
watch 'docker-compose ps && curl -s http://localhost:4001/health'

# Database backup
docker-compose exec -T postgres pg_dump -U postgres smart_whatsapp | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
gunzip < backup_20251121.sql.gz | docker-compose exec -T postgres psql -U postgres smart_whatsapp
```

---

## 🎓 Learning Path

1. ✅ Run quickstart.sh
2. ✅ Read LOCAL_SETUP_GUIDE.md
3. ✅ Test !help in WhatsApp
4. ✅ Run !test
5. ✅ Try order flow
6. ✅ Review API_DOCUMENTATION.md
7. ✅ Test API endpoints
8. ✅ Read FEATURES_COMPLETE.md
9. ✅ Read PRODUCTION_DEPLOYMENT.md
10. ✅ Deploy!

---

## 📋 Files Modified

```
whatsapp-bot/
├─ enhanced-bot.js ✅ (Enhanced with new features)
├─ api-server.js ✅ (NEW: REST API)
├─ package.json ✅ (Updated scripts)
└─ auth_info_baileys/ (QR code auth)

supabase/migrations/
└─ 20251121_02_enhanced_bot_features.sql ✅ (NEW: Tables)

docs/
├─ LOCAL_SETUP_GUIDE.md ✅ (NEW)
├─ API_DOCUMENTATION.md ✅ (NEW)
├─ FEATURES_COMPLETE.md ✅ (NEW)
├─ PRODUCTION_DEPLOYMENT.md ✅ (NEW)
├─ IMPLEMENTATION_SUMMARY.md ✅ (NEW)
└─ QUICK_REFERENCE.md ✅ (This file)

config/
└─ .env.local.example ✅ (NEW)
```

---

## 🎉 You're Ready!

Everything is set up and documented. Start with:

```bash
./quickstart.sh
```

Then read LOCAL_SETUP_GUIDE.md

**Happy coding! 🚀**
