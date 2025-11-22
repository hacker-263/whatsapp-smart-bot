# WhatsApp Bot - Complete Implementation Guide

## 📦 Project Structure

```
whatsapp-bot/
├── src/
│   ├── index.js                 # Main bot entry point
│   ├── services/
│   │   ├── messageService.js    # All message types (buttons, lists, templates, etc.)
│   │   ├── utilityCommandHandler.js # 15+ utility commands
│   │   ├── advancedAdminHandler.js  # 30+ admin commands
│   │   └── interactiveMessageHandler.js # Button, list, reaction handlers
│   ├── handlers/
│   │   ├── customerHandler.js   # Order, cart, products
│   │   ├── merchantHandler.js   # Dashboard, billing, inventory
│   │   └── adminHandler.js      # Platform management
│   ├── database/
│   │   └── models.js            # Database schema & migrations
│   ├── api/
│   │   └── ENDPOINTS.md         # All API endpoints
│   ├── config/
│   │   └── logger.js
│   ├── utils/
│   │   ├── commandParser.js
│   │   ├── messageFormatter.js
│   │   └── interactionFlowManager.js
│   └── middlewares/
│       └── auth.js
├── package.json
├── .env.example
└── README.md

docs/
├── 00_START_HERE.md
├── 01_INSTALLATION.md
├── 02_COMMANDS.md
├── 03_FEATURES.md
├── 04_API_INTEGRATION.md
├── 05_DEPLOYMENT.md
├── 06_TROUBLESHOOTING.md
└── 07_DASHBOARD_SYNC.md
```

## 🚀 Quick Start

### Installation (5 minutes)

```bash
cd whatsapp-bot
cp .env.example .env
npm install
npm start
```

Scan QR code with WhatsApp → Bot ready!

### Basic Commands

| Command | Description |
|---------|-------------|
| `!menu` | Show all available commands |
| `!help <cmd>` | Get help on a command |
| `!ping` | Check bot status |
| `!status` | System status |
| `!about` | About the bot |

### Merchant Commands

| Command | Description |
|---------|-------------|
| `!dashboard` | View business dashboard |
| `!billing` | View billing info |
| `!inventory` | Check inventory |
| `!commission` | View commissions |
| `!payout` | Request payout |

### Admin Commands

| Command | Description |
|---------|-------------|
| `!broadcast <msg>` | Send to all chats |
| `!block <phone>` | Block a user |
| `!stats` | Platform statistics |
| `!backup` | Create database backup |
| `!restart` | Restart bot |

## 🎯 Advanced Features

### 1. Interactive Messages

**Button Messages**
```javascript
await messageService.sendButtonMessage(chatId, 'Header', 'Choose action', [
  { text: 'Order' },
  { text: 'Check Status' },
  { text: 'Help' }
]);
```

**List Messages**
```javascript
await messageService.sendListMessage(chatId, 'Select', 'Choose item', 'Footer', [
  {
    title: 'Section 1',
    rows: [
      { title: 'Item 1', description: 'Desc' }
    ]
  }
]);
```

### 2. Message Reactions

```javascript
await interactiveMessageHandler.reactToMessage(chatId, messageKey, '👍');
await interactiveMessageHandler.starMessage(message, true);
await interactiveMessageHandler.deleteMessageForEveryone(chatId, messageKey);
```

### 3. Chat Modifications

```javascript
// Archive chat
await interactiveMessageHandler.modifyChat(chatId, { archive: true });

// Mute for 8 hours
await interactiveMessageHandler.modifyChat(chatId, { mute: 28800000 });

// Pin chat
await interactiveMessageHandler.modifyChat(chatId, { pin: true });
```

### 4. Presence Updates

```javascript
// Show typing
await interactiveMessageHandler.setPresence(chatId, 'typing');

// Show recording
await interactiveMessageHandler.setPresence(chatId, 'recording');
```

### 5. Contact Cards

```javascript
await messageService.sendContactCard(chatId, {
  name: 'Support Team',
  phone: '+263771234567',
  email: 'support@bot.com',
  organization: 'Smart Bot'
});
```

## 🔌 Dashboard Integration

### API Endpoints

**Send Message from Dashboard**
```bash
POST /api/bot/send-message
{
  "to": "263771234567@s.whatsapp.net",
  "message": "Hello from dashboard!",
  "type": "text"
}
```

**Get Bot Stats**
```bash
GET /api/bot/stats
```

**Manage Users**
```bash
POST /api/bot/block
POST /api/bot/premium/add
POST /api/bot/premium/remove
```

### Dashboard Features

- [ ] Send messages from web dashboard
- [ ] View real-time chats
- [ ] Manage blocked users
- [ ] Add/remove premium access
- [ ] View command logs
- [ ] Broadcast messages
- [ ] System stats dashboard
- [ ] Settings & configuration

## 🗄️ Database Schema

### Tables Created

- `blocked_users` - Blocked phone numbers
- `premium_users` - Premium user access
- `command_logs` - Command execution logs
- `starred_messages` - Pinned/starred messages
- `message_reactions` - Message reactions
- `user_limits` - Command rate limits
- `chat_modifications` - Archive, mute, pin history
- `broadcast_messages` - Broadcast history
- `session_data` - User sessions
- `forwarded_messages` - Forwarded message tracking
- `message_quotes` - Quote/reply history

### Run Migrations

```bash
# Connect to Supabase
node scripts/migrate.js

# Or manually run SQL from src/database/models.js
```

## ⚙️ Configuration

### .env File

```env
# WhatsApp
BOT_PREFIX=!
ADMIN_PHONE=263771234567

# API
API_BASE_URL=http://localhost:5173
BOT_PORT=3001

# Database
SUPABASE_URL=your_url
SUPABASE_KEY=your_key

# Logging
LOG_LEVEL=info
```

## 🔒 Security

### Protected Commands

These require `ADMIN_PHONE` verification:
- `!eval` - Execute JavaScript
- `!exec` - Execute shell commands
- `!restart` - Restart bot
- `!getsession` - Get session credentials
- `!update` - Update bot

### Blocked Users

Users can be blocked globally:
```bash
!block 263771234567
```

### Premium Features

Grant premium access:
```bash
!addpremium 263771234567 30
```

## 📊 Monitoring

### Health Check
```bash
GET /api/bot/health
```

### System Stats
```bash
GET /api/bot/stats
```

### Command Logs
```bash
GET /api/bot/command-logs?limit=100
```

## 🐛 Troubleshooting

### Bot Won't Start

1. Check `.env` file exists and has `ADMIN_PHONE`
2. Verify `node_modules` installed: `npm install`
3. Check port 3001 is not in use
4. Check auth credentials in `auth_info_baileys`

### Connection Issues

1. Delete `auth_info_baileys` folder
2. Run `npm start` and scan QR again
3. Check internet connection

### Commands Not Working

1. Verify prefix: `!command` not `command`
2. Check user is not blocked
3. Check daily limit not exceeded
4. View logs: `npm run logs`

## 📱 Platform Support

✅ Works on:
- Windows (CMD, PowerShell)
- Linux (Ubuntu, Debian)
- macOS
- Docker (included)
- cloud platforms (Heroku, Railway)

## 🚀 Production Deployment

### Docker

```bash
docker-compose up -d
```

### Manual VPS Deployment

```bash
# 1. Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone repo
git clone <repo>
cd whatsapp-bot

# 3. Install deps
npm install

# 4. Setup .env
cp .env.example .env
# Edit .env with your settings

# 5. Start with PM2
npm install -g pm2
pm2 start src/index.js --name "smart-bot"
pm2 startup
pm2 save
```

## 📞 Support

- 📧 Email: support@smartbot.com
- 💬 WhatsApp: +263 771234567
- 🐛 Issues: github.com/smartbot/whatsapp-bot/issues
- 📖 Docs: docs.smartbot.com

## 📜 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

**Last Updated:** November 2024
**Version:** 2.0.0
**Status:** Production Ready ✅
