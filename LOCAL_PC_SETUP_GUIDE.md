# 💻 Run Everything Locally on Your PC - Complete Setup Guide

**OS**: Windows/Mac/Linux  
**Date**: November 22, 2025  
**Status**: Full Local Development Setup  

---

## 🎯 What You'll Get

Run the complete WhatsApp bot stack on your PC:
- ✅ WhatsApp Bot (Baileys)
- ✅ REST API Server
- ✅ PostgreSQL Database
- ✅ Redis Cache/Queue
- ✅ React Frontend
- ✅ All 13 commands working
- ✅ Real-time job processing

---

## 📋 System Requirements

### Minimum
- 8GB RAM
- 5GB free disk space
- Windows 10/11, macOS, or Linux

### Recommended
- 16GB RAM
- SSD for better performance
- Modern CPU (4+ cores)

---

## 🪟 Windows PC Setup

### Step 1: Install Required Software

**1.1 Node.js** (includes npm)
```
1. Download: https://nodejs.org/ (LTS version recommended)
2. Run installer
3. Check installation:
   - Open CMD or PowerShell
   - Type: node --version && npm --version
   - Should show version numbers
```

**1.2 Git** (for version control)
```
1. Download: https://git-scm.com/download/win
2. Run installer (use default settings)
3. Restart computer
4. Verify: git --version in CMD
```

**1.3 PostgreSQL** (Database)
```
1. Download: https://www.postgresql.org/download/windows/
2. Run installer
3. Set password: remember this!
4. Port: 5432 (default)
5. When asked, say YES to stack builder
6. Create superuser: postgres / your-password
```

**1.4 Redis** (Cache & Queues)
```
Option A - Windows Subsystem for Linux (Recommended):
1. Open PowerShell as Admin
2. Run: wsl --install
3. Restart computer
4. In WSL terminal: sudo apt-get install redis-server
5. Start: redis-server
6. Keep terminal open

Option B - Docker Desktop (Easier):
1. Download: https://www.docker.com/products/docker-desktop
2. Install and restart
3. Run: docker run -d -p 6379:6379 redis:latest
4. Verify: docker ps (should show redis container)
```

### Step 2: Download Project

```bash
# Open CMD/PowerShell in folder where you want the project

# Clone project
git clone https://github.com/hacker-263/whatsapp-smart-bot.git

# Go to project folder
cd whatsapp-smart-bot
```

### Step 3: Setup Environment Files

**3.1 Create `.env.local` in root folder**
```bash
# From whatsapp-smart-bot folder
# Create file: .env.local (copy from .env.local.example)

# Content:
DEPLOYMENT_MODE=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_whatsapp
DB_USER=postgres
DB_PASSWORD=your-postgres-password
REDIS_HOST=localhost
REDIS_PORT=6379
BOT_PHONE=your-whatsapp-number
BOT_API_PORT=4001
```

**3.2 Create `whatsapp-bot/.env` file**
```bash
# From whatsapp-bot folder
# Create file: .env

# Content:
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
BOT_API_PORT=4001
WEBHOOK_SECRET=your-secret-key-123
BOT_API_KEY=your-api-key-123
```

### Step 4: Initialize Database

**4.1 Create Database**
```bash
# Open CMD/PowerShell
# Connect to PostgreSQL:
psql -U postgres

# At the postgres=# prompt, run:
CREATE DATABASE smart_whatsapp;
\c smart_whatsapp

# Copy & paste content from: docker/init.sql
# Or run migrations from supabase/migrations/
```

**4.2 Verify Database**
```bash
# Still in PostgreSQL, run:
\dt
# Should show tables like: users, products, orders, etc.

# Exit:
\q
```

### Step 5: Install Project Dependencies

**5.1 Install Frontend Dependencies**
```bash
# In project root:
npm install
```

**5.2 Install Bot Dependencies**
```bash
# In whatsapp-bot folder:
cd whatsapp-bot
npm install
```

### Step 6: Start Everything

**Open 4 Terminal Windows** (or tabs):

**Terminal 1 - PostgreSQL** (if not running as service)
```bash
psql -U postgres
# Keep this open
```

**Terminal 2 - Redis** (if using WSL)
```bash
wsl
redis-server
# Keep this open
```

**Terminal 3 - Bot Server**
```bash
cd whatsapp-smart-bot/whatsapp-bot
npm run dev

# Expected output:
# [Bot] Connected to WhatsApp
# [Bot] Listening for messages...
# Scan QR code with WhatsApp to authenticate
```

**Terminal 4 - API Server**
```bash
cd whatsapp-smart-bot/whatsapp-bot
npm run api:dev

# Expected output:
# ✅ Bot API Server running on http://localhost:4001
```

**Terminal 5 - Frontend** (optional)
```bash
cd whatsapp-smart-bot
npm run dev

# Expected output:
# VITE v5.0.0  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

---

## 🍎 macOS Setup

### Similar to Windows, but use Homebrew:

```bash
# Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node@18
brew install postgresql
brew install redis
brew install git

# Start services
brew services start postgresql
brew services start redis

# Continue with Step 3 from Windows guide above
```

---

## 🐧 Linux Setup (Ubuntu/Debian)

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Install dependencies
sudo apt-get install -y nodejs npm postgresql postgresql-contrib redis-server git

# Start services
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl enable postgresql
sudo systemctl enable redis-server

# Continue with Step 3 from Windows guide above
```

---

## ✅ Verification Checklist

Once everything is running:

```bash
# 1. Check Node.js
node --version
npm --version

# 2. Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# 3. Check Redis is running
redis-cli ping
# Should return: PONG

# 4. Check Bot is connected
# Look for: "[Bot] Connected to WhatsApp" in Terminal 3

# 5. Check API is running
curl http://localhost:4001/health
# Should return: {"status":"ok","service":"Bot API Server",...}

# 6. Check Frontend (if running)
# Open: http://localhost:5173/

# 7. Test bot commands
# Send message to bot number: !help
# Should get list of available commands
```

---

## 🎮 First Test - Send Command to Bot

### Via WhatsApp

1. **Get Bot Phone Number**
   - When you run `npm run dev`, look for QR code
   - Scan with WhatsApp
   - See "Connected" message

2. **Send Test Message**
   - Open WhatsApp
   - Find the bot number
   - Send: `!help`
   - Bot should respond with command list

3. **Try Commands**
   ```
   !help              # List all commands
   !owner             # Owner info (+263781564004)
   !menu              # Show products
   !register          # Start registration
   !about             # Bot info
   ```

### Via API

```bash
# Test template endpoint
curl http://localhost:4001/api/templates

# Create template
curl -X POST http://localhost:4001/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test",
    "type": "text",
    "body": "Hello {{name}}"
  }'

# Test media upload
curl -X POST http://localhost:4001/api/media/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "test.jpg",
    "mime_type": "image/jpeg",
    "file_data": "base64_encoded_data",
    "merchant_id": "merchant-1"
  }'
```

---

## 📁 Project Structure

```
whatsapp-smart-bot/
├── src/                    # Frontend (React)
│   ├── App.tsx
│   ├── components/
│   └── pages/
│
├── whatsapp-bot/           # Bot & API
│   ├── bot-modular.js      # Main bot entry point
│   ├── api-server.js       # REST API server
│   ├── package.json
│   └── src/
│       ├── handlers/       # Command handlers
│       ├── controllers/    # Message routing
│       ├── queues/         # Job queues
│       ├── webhooks/       # Webhook events
│       └── services/       # Utilities
│
├── supabase/               # Database
│   └── migrations/         # SQL migrations
│
└── docker/                 # Docker files
    └── init.sql            # Database init
```

---

## 🔧 Port Assignments

```
Port 5173  - Frontend (React)
Port 4001  - Bot API Server
Port 5432  - PostgreSQL Database
Port 6379  - Redis
Port 3000  - Reserved for backups
```

If ports are in use, check:
```bash
# Windows (PowerShell as Admin):
netstat -ano | findstr :5173

# macOS/Linux:
lsof -i :5173

# Kill process:
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>
```

---

## 🐛 Troubleshooting

### "Cannot find module 'baileys'"
```bash
cd whatsapp-bot
npm install @whiskeysockets/baileys
```

### "Connection refused - Redis"
```bash
# Check if Redis is running
redis-cli ping

# If error, start Redis:
# Windows (WSL): wsl && redis-server
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
```

### "Port 4001 already in use"
```bash
# Windows (PowerShell as Admin):
netstat -ano | findstr :4001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :4001
kill -9 <PID>

# Or change port in whatsapp-bot/.env:
BOT_API_PORT=4002
```

### "PostgreSQL connection failed"
```bash
# Check if PostgreSQL is running
# Windows: Services app → PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Check credentials in .env.local:
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your-password
```

### "QR Code keeps appearing (QR loop)"
This is already fixed in the current version. If you see it:
```bash
# Delete auth cache:
cd whatsapp-bot
rm -rf auth_info_baileys/

# Restart bot:
npm run dev
```

### "Bot not receiving messages"
```bash
# Make sure WhatsApp account is NOT using the official app
# Use WhatsApp Web or WhatsApp Business separately
# Verify phone number format: +263781234567

# Check logs for errors:
npm run dev 2>&1 | grep -i error
```

---

## 📊 Monitoring & Logs

### Bot Console
```bash
# Shows:
# - QR code for authentication
# - All messages received
# - Command processing
# - Errors and warnings
```

### API Server Console
```bash
# Shows:
# - All HTTP requests
# - Response times
# - Errors
# - Queue processing
```

### Database Logs
```bash
# Check PostgreSQL logs:
# Windows: C:\Program Files\PostgreSQL\15\data\pg_log\
# macOS: /usr/local/var/postgres/
# Linux: /var/log/postgresql/
```

### Redis Activity
```bash
redis-cli
MONITOR  # Shows all Redis commands in real-time
```

---

## 🚀 Development Workflow

### Making Changes to Bot

1. **Edit code** in `whatsapp-bot/src/`
2. **Bot auto-reloads** (nodemon watching)
3. **Test in WhatsApp** by sending command
4. **Check logs** for errors

### Making Changes to Frontend

1. **Edit code** in `src/components/`
2. **Vite auto-refreshes** browser
3. **No restart needed**

### Making Changes to Database

1. **Create migration** in `supabase/migrations/`
2. **Run migration**: `psql -U postgres < migration.sql`
3. **Restart API server**

---

## 🔒 Security for Local Development

**Important**: These are dev credentials. For production:
- Use strong passwords
- Enable authentication
- Use HTTPS
- Use environment variables properly

```bash
# .env.local (DEV ONLY):
DB_PASSWORD=devpassword123  # NOT for production!
WEBHOOK_SECRET=localsecret  # NOT for production!
BOT_API_KEY=localkey123     # NOT for production!
```

---

## 📞 Quick Commands Reference

### Bot Commands
```bash
# Terminal 3:
npm run dev                 # Start bot
npm run dev -- --watch     # With file watching
npm run bot:legacy         # Run legacy version
```

### API Commands
```bash
# Terminal 4:
npm run api                # Start API server
npm run api:dev           # With auto-reload
npm run api:prod          # Production mode
```

### Frontend Commands
```bash
# Terminal 5:
npm run dev               # Start with hot-reload
npm run build            # Build for production
npm run preview          # Preview production build
```

### Database Commands
```bash
# Connect to database:
psql -U postgres -d smart_whatsapp

# Common queries:
SELECT * FROM users;
SELECT * FROM products;
SELECT COUNT(*) FROM orders;

# Exit:
\q
```

---

## 📊 Performance Tips

### For Slow Machine (< 8GB RAM)

1. **Close unnecessary apps**
2. **Run only what you need** (not frontend if not testing UI)
3. **Disable nodemon watching** for less CPU:
   ```bash
   node whatsapp-bot/bot-modular.js  # Instead of npm run dev
   ```

### For Fast Machine (> 16GB RAM)

1. **Run everything together**:
   ```bash
   npm run all  # Runs bot + api concurrently
   ```

2. **Monitor performance**:
   ```bash
   # Windows (PowerShell):
   Get-Process | Where-Object {$_.Name -like "*node*"}
   
   # macOS/Linux:
   ps aux | grep node
   ```

---

## 🎯 Next Steps After Setup

1. **Test all 13 commands** - Send various commands to bot
2. **Try API endpoints** - Test templates, media, orders
3. **Create templates** - Add custom message templates
4. **Upload media** - Test image upload and optimization
5. **Queue jobs** - Trigger background jobs
6. **Deploy to server** - When ready for production

---

## 📚 Additional Resources

- Bot Commands: See `COMMAND_REFERENCE.md`
- API Docs: See `API_DOCUMENTATION.md`
- Database Schema: See `supabase/migrations/`
- Phase 6 Details: See `PHASE_6_README.md`
- Troubleshooting: See `TESTING_GUIDE.md`

---

## ✅ Success Checklist

- [ ] Node.js installed and working
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Project cloned to your PC
- [ ] .env files created and configured
- [ ] Database initialized
- [ ] Dependencies installed (npm install)
- [ ] Bot connected to WhatsApp (QR scanned)
- [ ] API server responding
- [ ] Commands working in WhatsApp
- [ ] API endpoints responding to curl

---

## 🎉 You're All Set!

Your WhatsApp bot is now running locally on your PC. You can:
- Develop new features
- Test commands
- Debug issues
- Build and customize
- Deploy when ready

**Ready to start?** Begin with `npm run dev` in the bot folder! 🚀

---

**Created**: November 22, 2025  
**Status**: Complete Local Setup Guide  
**Owner**: Hxcker (+263781564004)
