# 🏠 Local Development Complete Setup

**Date**: November 22, 2025  
**Status**: Ready for Local PC Development  
**All Platforms**: Windows, macOS, Linux  

---

## 📦 What You Get

A complete, working WhatsApp bot stack on your PC:

```
Your PC
├── 🤖 WhatsApp Bot (Baileys)
│   ├── Command handlers
│   ├── Message processor
│   ├── 13 built-in commands
│   └── Real-time response
│
├── 🌐 REST API Server
│   ├── 6 endpoints
│   ├── Job queue
│   ├── Webhook support
│   └── Template management
│
├── 💾 PostgreSQL Database
│   ├── 8 tables
│   ├── Auto-audit
│   ├── Row security
│   └── Migrations ready
│
├── ⚡ Redis Cache/Queue
│   ├── 4 job queues
│   ├── Message cache
│   ├── Session storage
│   └── Real-time processing
│
└── 🎨 React Frontend
    ├── Customer dashboard
    ├── Merchant panel
    ├── Admin console
    └── Live updates
```

---

## 🛠️ Installation Methods

### Method 1: Automated (Windows) - 2 Minutes

**Step 1**: Open PowerShell as Administrator
```powershell
cd C:\Users\YourName\Documents
git clone https://github.com/hacker-263/whatsapp-smart-bot.git
cd whatsapp-smart-bot
```

**Step 2**: Run setup script
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\setup-local.ps1
```

**Step 3**: Follow prompts and edit `.env.local`

**Done!** Jump to "Running Services" section.

---

### Method 2: Manual (All OS) - 10 Minutes

#### 2.1 Install Prerequisites

**Windows**:
```bash
# Install from:
# - Node.js: https://nodejs.org/ (LTS version)
# - PostgreSQL: https://www.postgresql.org/download/windows/
# - Redis: docker run -d -p 6379:6379 redis:latest
# - Git: https://git-scm.com/download/win

# Verify in PowerShell:
node --version
npm --version
psql --version
redis-cli --version
git --version
```

**macOS**:
```bash
# Using Homebrew:
brew install node postgresql redis git

# Or download from official sites
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get update
sudo apt-get install -y nodejs npm postgresql postgresql-contrib redis-server git
```

#### 2.2 Clone Project
```bash
git clone https://github.com/hacker-263/whatsapp-smart-bot.git
cd whatsapp-smart-bot
```

#### 2.3 Create Environment Files
```bash
# Copy template
cp .env.local.example .env.local

# Edit with your settings
# Windows: notepad .env.local
# Mac/Linux: nano .env.local

# Content should include:
DEPLOYMENT_MODE=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_whatsapp
DB_USER=postgres
DB_PASSWORD=your-secure-password
REDIS_HOST=localhost
REDIS_PORT=6379
BOT_API_PORT=4001
```

```bash
# Create bot .env
cd whatsapp-bot
cat > .env << EOF
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
BOT_API_PORT=4001
EOF
cd ..
```

#### 2.4 Initialize Database
```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL terminal:
CREATE DATABASE smart_whatsapp;
\c smart_whatsapp

# Paste content from docker/init.sql
# Or run migrations:
\q
```

#### 2.5 Install Dependencies
```bash
# Root dependencies
npm install

# Bot dependencies
cd whatsapp-bot
npm install
cd ..
```

---

## 🚀 Running Services

### Open 3-4 Terminal Windows

#### Terminal 1: Start PostgreSQL
```bash
# If using service (most cases)
# Windows: Services app → PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Verify:
psql -U postgres -c "SELECT version();"
```

#### Terminal 2: Start Redis
```bash
# If installed via package manager:
redis-server

# Or with Docker:
docker run -d -p 6379:6379 redis:latest

# Verify:
redis-cli ping
# Should return: PONG
```

#### Terminal 3: Start Bot
```bash
cd whatsapp-smart-bot/whatsapp-bot

# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

**Wait for**: "Scan QR code with WhatsApp"

#### Terminal 4: Start API Server
```bash
cd whatsapp-smart-bot/whatsapp-bot

npm run api:dev
```

**Wait for**: "✅ Bot API Server running on http://localhost:4001"

#### Terminal 5 (Optional): Frontend
```bash
cd whatsapp-smart-bot

npm run dev
```

**Opens**: http://localhost:5173/

---

## ✅ Verification

After starting all services, verify everything works:

```bash
# 1. Check Bot Connected
# Look in Terminal 3 for: "Connected to WhatsApp"

# 2. Check API Running
curl http://localhost:4001/health
# Response: {"status":"ok","service":"Bot API Server",...}

# 3. Check Database
psql -U postgres -d smart_whatsapp -c "\dt"
# Shows tables: users, products, orders, etc.

# 4. Check Redis
redis-cli PING
# Response: PONG

# 5. Scan QR Code
# In Terminal 3, QR code should appear
# Scan with WhatsApp
```

---

## 🎮 Test Bot Commands

### Via WhatsApp

After scanning QR code:

```
Send to bot number:
!help              → Show all commands
!menu              → Show products
!search pizza      → Search for pizza
!trending          → Show trending items
!register          → Start registration
!login             → User login
!owner             → Show owner info
!about             → Bot information
!feedback          → Send feedback
!stats             → Your stats
```

### Via API

```bash
# List templates
curl http://localhost:4001/api/templates

# Create template
curl -X POST http://localhost:4001/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "welcome",
    "type": "text",
    "body": "Welcome {{name}}!"
  }'

# Upload media
curl -X POST http://localhost:4001/api/media/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "image.jpg",
    "mime_type": "image/jpeg",
    "file_data": "base64_image_data"
  }'
```

---

## 📂 Project Layout

```
whatsapp-smart-bot/
│
├── whatsapp-bot/              # Main application
│   ├── bot-modular.js         # Bot entry point
│   ├── api-server.js          # REST API
│   ├── package.json
│   └── src/
│       ├── handlers/          # Command handlers
│       │   ├── authHandler.js
│       │   ├── customerHandler.js
│       │   └── merchantHandler.js
│       ├── controllers/
│       │   └── botController.js
│       ├── queues/
│       │   └── jobQueue.js
│       ├── webhooks/
│       │   └── webhookManager.js
│       ├── templates/
│       │   └── templateEngine.js
│       ├── media/
│       │   └── mediaManager.js
│       └── services/
│
├── src/                       # Frontend (React)
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   └── services/
│
├── supabase/                  # Database
│   ├── migrations/
│   └── functions/
│
├── docker/                    # Docker setup
│   └── init.sql
│
├── .env.local                 # Configuration (create)
├── LOCAL_PC_SETUP_GUIDE.md    # Detailed guide
├── QUICK_START_LOCAL.md       # Quick start
├── setup-local.ps1            # Windows PowerShell setup
└── setup-local.bat            # Windows batch setup
```

---

## 🔧 Configuration

### Main Config (.env.local)
```env
# Deployment
DEPLOYMENT_MODE=local

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_whatsapp
DB_USER=postgres
DB_PASSWORD=your-password

# Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# API
BOT_API_PORT=4001

# Bot
BOT_PHONE=your-number-optional
```

### Bot Config (whatsapp-bot/.env)
```env
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
BOT_API_PORT=4001
WEBHOOK_SECRET=local-secret
BOT_API_KEY=local-key
```

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
cd whatsapp-bot
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "Port already in use"
```bash
# Find process using port 4001
# Windows: netstat -ano | findstr :4001
# Mac/Linux: lsof -i :4001

# Kill process or change port in .env
BOT_API_PORT=4002
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
psql -U postgres -c "\l"

# Check .env.local settings
# Make sure password is correct
# Check DB_NAME=smart_whatsapp exists
```

### "Redis connection refused"
```bash
# Check Redis is running
redis-cli PING

# Start Redis:
# Windows (WSL): wsl && redis-server
# Mac: brew services start redis
# Linux: sudo systemctl start redis-server
# Docker: docker run -d -p 6379:6379 redis:latest
```

### "QR code keeps looping"
```bash
# Delete auth cache
cd whatsapp-bot
rm -rf auth_info_baileys/

# Restart
npm run dev

# Scan new QR code
```

### "Cannot send messages"
```bash
# Make sure WhatsApp phone is NOT using official app
# Use WhatsApp Web or separate device
# Check phone number format: +263781234567
# Check bot is connected: look for "Connected" in logs
```

---

## 🎯 Development Workflow

### Making Changes

**1. Edit Bot Handler**
```bash
# Edit: whatsapp-bot/src/handlers/customerHandler.js
# Bot auto-reloads (nodemon watching)
# Test in WhatsApp
```

**2. Edit API Endpoint**
```bash
# Edit: whatsapp-bot/api-server.js
# API auto-reloads
# Test with: curl http://localhost:4001/api/...
```

**3. Edit Frontend**
```bash
# Edit: src/components/
# Frontend hot-reloads
# Refresh browser automatically
```

**4. Edit Database Schema**
```bash
# Create migration: supabase/migrations/
# Run: psql -U postgres < migration.sql
# Restart API server
```

---

## 📊 Port Reference

```
5173   →  Frontend (React)
4001   →  API Server (Express)
5432   →  PostgreSQL Database
6379   →  Redis Cache/Queue
3000   →  Reserved
8080   →  Reserved
```

If port conflicts, either:
1. Kill the process using the port
2. Change port in .env files

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Scan QR code in Terminal 3
# 2. Wait for "Connected" message
# 3. Send !help to bot
# 4. Verify response

# 5. Test API
curl http://localhost:4001/health

# 6. Check database
psql -U postgres -d smart_whatsapp -c "SELECT COUNT(*) FROM users;"
```

### Load Testing
```bash
# Test API under load
# Use: Apache Bench, wrk, or k6

# Example with curl loop:
for i in {1..100}; do
  curl http://localhost:4001/api/templates &
done
wait
```

---

## 📈 Monitoring

### Check Logs
```bash
# Terminal 3: Bot logs
# Terminal 4: API logs
# Check for errors, warnings, or issues

# Terminal 1: Database logs (if applicable)
# Check: /var/log/postgresql/ (Linux)
```

### Monitor Performance
```bash
# Check CPU/Memory usage
# Windows: Task Manager → Processes
# Mac: Activity Monitor
# Linux: top or htop

# Node.js memory: ps aux | grep node
```

### Monitor Database
```bash
# Connected users
psql -U postgres -d smart_whatsapp -c "SELECT COUNT(*) FROM users;"

# Recent orders
psql -U postgres -d smart_whatsapp -c "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;"

# Queue status
redis-cli ZCARD bull:message_sending:waiting
```

---

## 🚀 Deployment When Ready

When ready to deploy to production:

1. **Setup Production Server**
   - Buy VPS or cloud instance
   - Install same software (Node, PostgreSQL, Redis)

2. **Transfer Code**
   ```bash
   git push to production branch
   git pull on server
   ```

3. **Update Configuration**
   ```bash
   Edit .env.local for production
   Use strong passwords
   Enable HTTPS
   ```

4. **Run Services**
   ```bash
   Use PM2 to manage processes
   Setup auto-restart
   Setup monitoring/logging
   ```

See `PRODUCTION_DEPLOYMENT.md` for detailed guide.

---

## 📚 Documentation

**Quick Start**: `QUICK_START_LOCAL.md` (5 min read)  
**Detailed Setup**: `LOCAL_PC_SETUP_GUIDE.md` (20 min read)  
**API Reference**: `API_DOCUMENTATION.md`  
**Commands**: `COMMAND_REFERENCE.md`  
**Architecture**: `BACKEND_ENHANCEMENT_IMPLEMENTATION_GUIDE.md`  
**Phase 6**: `PHASE_6_README.md`

---

## ✅ Success Checklist

- [ ] All prerequisites installed
- [ ] Project cloned
- [ ] Environment files created
- [ ] Database initialized
- [ ] Dependencies installed
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] Bot connected to WhatsApp
- [ ] API server responding
- [ ] Commands working
- [ ] Frontend loading (optional)

---

## 🎊 You're Ready!

Your complete WhatsApp bot stack is running locally on your PC.

**Next Steps**:
1. Explore all 13 commands
2. Test API endpoints
3. Create custom templates
4. Build features
5. Deploy to production when ready

---

**Created**: November 22, 2025  
**Status**: Production-Ready Local Setup  
**Author**: Hxcker (+263781564004)  

## 🚀 Ready to Run!

Questions? Check the detailed guides above or review the full documentation.

Good luck! 🎉
