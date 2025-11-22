# ⚡ Quick Start - Run Bot in 5 Minutes

**For**: Windows/Mac/Linux users  
**Time**: 5 minutes  
**Requirements**: Already have Node.js, PostgreSQL, Redis installed  

---

## 🚀 Super Quick (Already have all software installed)

### Step 1: Clone & Setup (2 min)
```bash
# Clone project
git clone https://github.com/hacker-263/whatsapp-smart-bot.git
cd whatsapp-smart-bot

# Run Windows setup script (Windows users)
setup-local.ps1
# Or: setup-local.bat

# Or manual (all OS):
npm install
cd whatsapp-bot && npm install
```

### Step 2: Configure (1 min)
```bash
# Edit .env.local with database password
# Edit whatsapp-bot/.env with API settings
```

### Step 3: Start Services (1 min)

**Open 3 terminals:**

```bash
# Terminal 1 - Bot (stays open)
cd whatsapp-bot
npm run dev

# Wait for: Scan QR code with WhatsApp
# STOP after seeing QR code displayed
```

```bash
# Terminal 2 - API Server (stays open)
cd whatsapp-bot
npm run api:dev

# Wait for: ✅ Bot API Server running on http://localhost:4001
```

```bash
# Terminal 3 - Frontend (optional)
npm run dev

# Opens: http://localhost:5173/
```

### Step 4: Test (1 min)

**Scan QR Code**
1. In Terminal 1, you see a QR code
2. Open WhatsApp on your phone
3. Scan the QR code
4. Bot is now connected ✅

**Send Command**
1. Open WhatsApp
2. Find the bot number
3. Send: `!help`
4. Bot responds with command list ✅

---

## 🎯 Available Commands to Test

```
!help               → List all commands
!owner              → Owner info
!menu               → Show products
!search chips       → Search products
!trending           → Trending products
!deals              → Show deals
!register           → Start registration
!login              → User login
!about              → Bot info
!feedback           → Send feedback
!stats              → Your statistics
!merchant info      → Merchant details
```

---

## 🧪 Test API Endpoints

```bash
# In another terminal, test API:

# Health check
curl http://localhost:4001/health

# Get templates
curl http://localhost:4001/api/templates

# Create template
curl -X POST http://localhost:4001/api/templates \
  -H "Content-Type: application/json" \
  -d '{"name":"test","type":"text","body":"Hello {{name}}"}'

# Upload media
curl -X POST http://localhost:4001/api/media/upload \
  -H "Content-Type: application/json" \
  -d '{"file_name":"test.jpg","mime_type":"image/jpeg","file_data":"base64data"}'
```

---

## 📝 Configuration Files

### .env.local (Root folder)
```
DEPLOYMENT_MODE=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_whatsapp
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE    ← Change this!
REDIS_HOST=localhost
REDIS_PORT=6379
BOT_API_PORT=4001
```

### whatsapp-bot/.env
```
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
BOT_API_PORT=4001
WEBHOOK_SECRET=dev-secret
BOT_API_KEY=dev-key
```

---

## 🆘 Troubleshooting

### "Cannot connect to PostgreSQL"
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# If fails, start PostgreSQL:
# Windows: Services app → PostgreSQL
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### "Redis connection refused"
```bash
# Check Redis is running
redis-cli ping

# If fails, start Redis:
# Windows (WSL): wsl && redis-server
# Mac: brew services start redis
# Linux: sudo systemctl start redis-server
# Docker: docker run -d -p 6379:6379 redis:latest
```

### "Port 4001 already in use"
```bash
# Find process using port
# Windows: netstat -ano | findstr :4001
# Mac/Linux: lsof -i :4001

# Kill it:
# Windows: taskkill /PID <PID> /F
# Mac/Linux: kill -9 <PID>

# Or change port in whatsapp-bot/.env:
BOT_API_PORT=4002
```

### "QR Code not appearing"
```bash
# Delete cached auth
cd whatsapp-bot
rm -rf auth_info_baileys/

# Restart bot
npm run dev

# New QR code should appear
```

### "Module not found"
```bash
# Reinstall dependencies
cd whatsapp-bot
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

---

## 📊 What's Running

| Component | Port | Status |
|-----------|------|--------|
| Bot | N/A | ✅ WhatsApp connected |
| API Server | 4001 | ✅ HTTP API |
| Frontend | 5173 | ✅ React app |
| PostgreSQL | 5432 | ✅ Database |
| Redis | 6379 | ✅ Queue/Cache |

---

## ⚙️ Project Structure

```
whatsapp-bot/
├── bot-modular.js          ← Main bot (Entry point)
├── api-server.js           ← REST API
├── src/
│   ├── handlers/           ← Command logic
│   ├── controllers/        ← Message router
│   ├── queues/            ← Background jobs
│   └── services/          ← Utilities
└── package.json

src/
├── components/            ← React UI
├── pages/                 ← App pages
└── App.tsx               ← Main app

Database:
├── PostgreSQL tables
├── Redis cache
└── Message queue
```

---

## 🔄 Common Tasks

### Add New Command
```bash
# 1. Edit: whatsapp-bot/src/handlers/authHandler.js
# 2. Add function: handleMyCommandCommand()
# 3. Edit: whatsapp-bot/src/controllers/botController.js
# 4. Add route: case '!mycommand': ...
# 5. Restart bot: npm run dev
```

### Send Message to User
```javascript
// In whatsapp-bot/src/controllers/botController.js
await this.sendMessage(phone, 'Hello user!');
```

### Queue Background Job
```javascript
// In whatsapp-bot/src/queues/jobQueue.js
const jobId = await jobQueue.queueMessageSending(phone, message);
```

### Create Template
```bash
curl -X POST http://localhost:4001/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my_template",
    "type": "text",
    "body": "Welcome {{name}}!",
    "variables": ["name"]
  }'
```

---

## 🎓 Next Steps

1. **Explore Commands** - Try all 13 commands
2. **Test API** - Call endpoints from curl/Postman
3. **Create Templates** - Build custom message templates
4. **Upload Media** - Test image upload
5. **Queue Jobs** - Trigger background processing
6. **Monitor** - Check logs and metrics
7. **Customize** - Modify for your use case
8. **Deploy** - Move to production when ready

---

## 📚 Full Documentation

- **Detailed Setup**: `LOCAL_PC_SETUP_GUIDE.md`
- **API Reference**: `API_DOCUMENTATION.md`
- **Commands**: `COMMAND_REFERENCE.md`
- **Database**: `supabase/migrations/`
- **Architecture**: `BACKEND_ENHANCEMENT_IMPLEMENTATION_GUIDE.md`

---

## ✅ Checklist

- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL running (`psql -U postgres`)
- [ ] Redis running (`redis-cli ping`)
- [ ] Project cloned
- [ ] Dependencies installed
- [ ] .env files created
- [ ] Database initialized
- [ ] Bot running (Terminal 1)
- [ ] API running (Terminal 2)
- [ ] QR code scanned
- [ ] Command sent and received

---

## 🎉 Success!

If you see:
- ✅ Bot connected to WhatsApp
- ✅ API responding at localhost:4001
- ✅ Commands working in chat
- ✅ Frontend loading at localhost:5173

**You're all set!** 🚀

---

**Created**: November 22, 2025  
**For**: Local PC Development  
**Author**: Hxcker
