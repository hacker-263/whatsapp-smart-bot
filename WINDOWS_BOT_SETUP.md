# WhatsApp Bot - Windows Setup Guide

This guide helps you run the Smart WhatsApp Bot on Windows (and other platforms).

## 🖥️ System Requirements

- **OS**: Windows 10/11 (or any OS with Node.js)
- **Node.js**: 16.0.0 or higher
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk Space**: 500MB
- **Internet**: Stable connection required

## 📥 Installation Steps

### Step 1: Install Node.js

1. Go to https://nodejs.org/
2. Download **LTS (Long Term Support)** version
3. Run the installer
4. Check **Add to PATH** during installation
5. Complete the setup

**Verify installation:**
```cmd
node --version
npm --version
```

### Step 2: Clone or Download the Project

**Option A: Using Git**
```cmd
git clone https://github.com/smartbot/whatsapp-bot.git
cd whatsapp-bot
```

**Option B: Manual Download**
1. Download ZIP file
2. Extract to a folder
3. Open Command Prompt in that folder

### Step 3: Install Dependencies

```cmd
npm install
```

This will download all required packages (~500MB).

### Step 4: Configure the Bot

1. Copy `.env.example` to `.env`:
   ```cmd
   copy .env.example .env
   ```

2. Edit `.env` file with your settings:
   - `ADMIN_PHONE=263771234567` (your WhatsApp number without + or 00)
   - `BOT_PREFIX=!` (or any character you prefer)
   - Other settings (leave defaults if unsure)

### Step 5: Start the Bot

```cmd
npm start
```

**Expected output:**
```
✅ Bot initialized successfully
📱 Scan this QR code with WhatsApp:
[QR Code displayed]
```

### Step 6: Scan QR Code

1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices**
3. Click **Link a Device**
4. Point your phone camera at the QR code in the terminal
5. Wait for connection

**When connected:**
```
✅ Bot connected successfully!
🚀 Bot API server running on port 3001
```

## 🎮 Testing the Bot

Send messages to your WhatsApp number:

```
!menu          → Show all commands
!ping          → Check if bot is online
!help order    → Get help on order command
!status        → System status
```

## 🔧 Development Mode (Hot Reload)

For development, use hot-reload mode (restarts on file changes):

```cmd
npm run dev
```

## 📁 Project Structure

```
whatsapp-bot/
├── src/
│   ├── index.js         ← Main bot code
│   ├── services/        ← Features (messages, commands, etc.)
│   ├── handlers/        ← Command handlers
│   └── database/        ← Database models
├── .env                 ← Your configuration
├── package.json         ← Dependencies
└── auth_info_baileys/   ← WhatsApp session (auto-created)
```

## ⚠️ Common Issues & Solutions

### "Command not found: npm"
- Node.js not installed or not in PATH
- **Fix**: Restart Command Prompt after installing Node.js

### "Port 3001 already in use"
- Another program using the port
- **Fix**: 
  ```cmd
  netstat -ano | findstr :3001
  taskkill /PID <pid> /F
  ```

### "Cannot find module"
- Dependencies not installed
- **Fix**: Run `npm install` again

### "QR Code not showing"
- Terminal too small
- **Fix**: Make terminal window bigger, or check terminal logs

### "Bot disconnects randomly"
- Unstable internet connection
- **Fix**: Check internet, ensure WhatsApp on phone has internet

### "Auth error" or "Session expired"
- Session file corrupted
- **Fix**: Delete `auth_info_baileys` folder and restart, rescan QR

## 🚀 Running with Dashboard

The bot has an API server that can work with a web dashboard:

```cmd
# Terminal 1: Start bot
npm start

# Terminal 2: Start dashboard (if applicable)
npm run dashboard
```

Access dashboard: http://localhost:3000

## 📊 Dashboard API Endpoints

From dashboard, you can:

```
GET /api/bot/health         → Check bot status
GET /api/bot/stats          → Get statistics
POST /api/bot/send-message  → Send message from dashboard
POST /api/bot/broadcast     → Broadcast to all chats
POST /api/bot/block         → Block users
```

## 🛑 Stopping the Bot

- **Press**: `Ctrl + C` in the terminal

The bot will save its state and shut down gracefully.

## 🔄 Restarting the Bot

```cmd
npm start
```

It will reconnect using saved WhatsApp session.

## 📝 Useful Commands for Admin

```
!menu                    → Show all commands
!stats                   → View bot statistics
!broadcast <message>     → Send to all chats
!block <phone>          → Block a user
!unblock <phone>        → Unblock a user
!status                 → System status
!uptime                 → How long bot is running
!backup                 → Create database backup
!restart                → Restart the bot
```

## 🌍 Using on Different Platforms

### Linux/Ubuntu
```bash
sudo apt-get install nodejs npm
git clone <repo>
cd whatsapp-bot
npm install
npm start
```

### macOS
```bash
brew install node
git clone <repo>
cd whatsapp-bot
npm install
npm start
```

### Docker (Any Platform)
```bash
docker-compose up -d
```

## 📊 Performance Tips

1. **Keep bot running 24/7** for best experience (use PM2)
2. **Monitor RAM usage**: Should stay under 200MB
3. **Clear cache monthly**: `!clearcache`
4. **Backup database weekly**: `!backup`

## 🔐 Security Notes

- Keep `.env` file private (don't share it)
- Only you should have `ADMIN_PHONE`
- Don't commit `.env` to git
- Use strong passwords for databases
- Regularly update Node.js and npm

## 🤖 With PM2 (Production)

Run bot in background with auto-restart:

```cmd
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start src/index.js --name "smart-bot"

# Auto-start on system boot
pm2 startup
pm2 save

# View logs
pm2 logs smart-bot

# Stop bot
pm2 stop smart-bot

# Restart bot
pm2 restart smart-bot
```

## 📚 Documentation

- **IMPLEMENTATION_GUIDE.md** - Complete guide
- **src/api/ENDPOINTS.md** - All API endpoints
- **src/handlers/** - Command handlers
- **src/services/** - Feature services

## 🆘 Need Help?

1. Check **IMPLEMENTATION_GUIDE.md**
2. Review error messages in terminal
3. Check **troubleshooting** section above
4. Open issue: github.com/smartbot/whatsapp-bot/issues
5. Email: support@smartbot.com

## ✅ Quick Checklist

- [ ] Node.js 16+ installed
- [ ] Project cloned/downloaded
- [ ] `npm install` completed
- [ ] `.env` file configured
- [ ] `npm start` running
- [ ] QR code scanned
- [ ] Commands working
- [ ] Messages sending

## 🎉 Success!

Your WhatsApp bot is now running! Start using commands and managing your business through WhatsApp.

**Remember**: 
- Keep terminal running (don't close it)
- Keep phone connected to internet
- Use `Ctrl + C` to stop safely
- Use PM2 for production deployment

Happy botting! 🤖

---

**Last Updated**: November 2024  
**Version**: 2.0.0  
**Platform Support**: Windows, Linux, macOS, Docker  
**Status**: Production Ready ✅
