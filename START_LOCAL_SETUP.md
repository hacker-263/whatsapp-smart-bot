# 🎯 LOCAL SETUP - START HERE

**Last Updated**: November 22, 2025  
**Status**: ✅ **READY TO RUN LOCALLY**  

---

## 📖 Choose Your Path

### ⚡ **FASTEST PATH** (5 minutes)
**For**: Already have Node.js, PostgreSQL, Redis  
**Go to**: `QUICK_START_LOCAL.md`

```
1. npm install
2. Edit .env files  
3. Start 3 terminals
4. Scan QR code
5. Test: !help
```

---

### 🛠️ **WINDOWS AUTO SETUP** (2 minutes)
**For**: Windows users who want automated setup  
**Go to**: Run this in PowerShell

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
.\setup-local.ps1
```

---

### 📋 **COMPLETE SETUP** (30 minutes)
**For**: First-time setup, all OS  
**Go to**: `LOCAL_PC_SETUP_GUIDE.md`

```
1. Install software (Node, PostgreSQL, Redis)
2. Clone project
3. Setup environment
4. Initialize database
5. Install dependencies
6. Start all services
```

---

### 🏠 **COMPREHENSIVE GUIDE** (Reference)
**For**: Understanding everything  
**Go to**: `RUN_LOCALLY.md`

```
- Complete installation
- Configuration details
- Troubleshooting
- Development workflow
- Deployment ready
```

---

## 🚀 What You'll Get

| Component | Status | Port |
|-----------|--------|------|
| 🤖 Bot | ✅ Running | N/A |
| 🌐 API | ✅ Running | 4001 |
| 💾 Database | ✅ Running | 5432 |
| ⚡ Redis | ✅ Running | 6379 |
| 🎨 Frontend | ✅ Running | 5173 |

---

## ✅ System Requirements

```
✅ RAM: 8GB minimum
✅ Storage: 5GB free
✅ OS: Windows, Mac, Linux
✅ Software: Node.js, PostgreSQL, Redis
```

---

## ⚡ Quick Commands

```bash
# Clone project
git clone https://github.com/hacker-263/whatsapp-smart-bot.git
cd whatsapp-smart-bot

# Install (root)
npm install

# Install (bot)
cd whatsapp-bot
npm install

# Setup script (Windows)
.\setup-local.ps1

# Or manual (all OS)
# Edit .env.local
# Edit whatsapp-bot/.env
# Create database
# npm install
# npm run dev (Terminal 1)
# npm run api:dev (Terminal 2)
```

---

## 📚 Documentation Files

| File | Purpose | Time |
|------|---------|------|
| **QUICK_START_LOCAL.md** | Super fast setup | 5 min |
| **LOCAL_PC_SETUP_GUIDE.md** | Complete guide | 30 min |
| **RUN_LOCALLY.md** | Reference guide | Reference |
| **setup-local.ps1** | Windows auto-setup | 2 min |
| **setup-local.bat** | Windows batch setup | 2 min |

---

## 🎮 Test Commands

Once running, send to bot:
```
!help
!menu
!search
!trending
!register
!owner
!about
```

---

## 🆘 Quick Fixes

**PostgreSQL not found?**
```bash
Install from: https://postgresql.org/download
```

**Redis connection refused?**
```bash
docker run -d -p 6379:6379 redis:latest
# OR
wsl && redis-server
```

**Port already in use?**
```bash
# Windows: netstat -ano | findstr :4001
# Mac/Linux: lsof -i :4001
# Kill: taskkill /PID <PID> /F
# Or change port in .env
```

**Module not found?**
```bash
cd whatsapp-bot
rm -rf node_modules
npm install
```

---

## 📞 Next Steps

1. **Pick your guide** above
2. **Follow the steps**
3. **Run the services**
4. **Test the bot**
5. **Deploy when ready**

---

**🎉 Let's Go!** Choose a guide above and start building! 🚀
