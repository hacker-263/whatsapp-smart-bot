/**
 * Smart WhatsApp Bot - Main Entry Point
 * Integrates all services, handlers, and APIs
 * Works with React Dashboard for unified control
 */

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  getContentType,
  Browsers
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const chalk = require('chalk');
const figlet = require('figlet');
const NodeCache = require('node-cache');
const P = require('pino');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import services
const MessageService = require('./services/messageService');
const UtilityCommandHandler = require('./services/utilityCommandHandler');
const AdvancedAdminHandler = require('./services/advancedAdminHandler');
const InteractiveMessageHandler = require('./services/interactiveMessageHandler');

// Import existing handlers
const CustomerHandler = require('./handlers/customerHandler');
const MerchantHandler = require('./handlers/merchantHandler');
const AdminHandler = require('./handlers/adminHandler');

class SmartWhatsAppBot {
  constructor() {
    this.sock = null;
    this.store = makeInMemoryStore({
      logger: P().child({ level: 'silent', stream: 'store' })
    });

    // Configuration
    this.prefix = process.env.BOT_PREFIX || '!';
    this.adminPhone = process.env.ADMIN_PHONE;
    this.apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5173';

    // Caches for performance (4-tier strategy)
    this.sessions = new NodeCache({ stdTTL: 3600 });
    this.carts = new NodeCache({ stdTTL: 7200 });
    this.merchants = new NodeCache({ stdTTL: 1800 });
    this.products = new NodeCache({ stdTTL: 900 });

    // Initialize services
    this.initializeServices();

    // Setup
    this.setupLogger();
    this.displayBanner();
    this.setupExpressServer();
    this.setupCronJobs();
  }

  initializeServices() {
    // These will be initialized after socket creation
    this.messageService = null;
    this.utilityCommandHandler = null;
    this.advancedAdminHandler = null;
    this.interactiveMessageHandler = null;
    this.customerHandler = null;
    this.merchantHandler = null;
    this.adminHandler = null;
  }

  setupLogger() {
    this.logger = P({
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      level: process.env.LOG_LEVEL || 'info'
    });
  }

  displayBanner() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('SMART BOT', { horizontalLayout: 'full' })));
    console.log(chalk.green('🤖 Enterprise WhatsApp Bot v2.0'));
    console.log(chalk.yellow('📱 Multi-tenant Marketplace Assistant'));
    console.log(chalk.blue('🌍 Zimbabwe & South Africa'));
    console.log(chalk.magenta('⚡ Advanced Interactive Features'));
    console.log(chalk.red('🔒 Fully Integrated Dashboard\n'));
  }

  /**
   * Start the WhatsApp bot
   */
  async startBot() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
      const { version, isLatest } = await fetchLatestBaileysVersion();

      console.log(chalk.green(`🔄 Using WA v${version.join('.')}, isLatest: ${isLatest}`));

      this.sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
        },
        browser: Browsers.ubuntu('Chrome'),
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        getMessage: async (key) => {
          if (this.store) {
            const msg = await this.store.loadMessage(key.remoteJid, key.id);
            return msg?.message || undefined;
          }
          return undefined;
        }
      });

      // Bind store to socket
      this.store?.bind(this.sock.ev);

      // Initialize all services now that socket exists
      this.messageService = new MessageService(this.sock);
      this.utilityCommandHandler = new UtilityCommandHandler(this, this.messageService);
      this.advancedAdminHandler = new AdvancedAdminHandler(this, this.messageService, null);
      this.interactiveMessageHandler = new InteractiveMessageHandler(this, this.messageService);
      this.customerHandler = new CustomerHandler(this.sock, this.messageService);
      this.merchantHandler = new MerchantHandler(this.sock, this.messageService);
      this.adminHandler = new AdminHandler(this.sock, this.messageService);

      // Setup event handlers
      this.setupEventHandlers(saveCreds);

      console.log(chalk.green('✅ Bot initialized successfully'));
    } catch (error) {
      console.error(chalk.red('❌ Error starting bot:'), error.message);
      setTimeout(() => this.startBot(), 5000);
    }
  }

  setupEventHandlers(saveCreds) {
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(chalk.yellow('\n📱 Scan this QR code with WhatsApp:'));
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'connecting') {
        console.log(chalk.blue('🔄 Connecting...'));
      }

      if (connection === 'open') {
        console.log(chalk.green('✅ Bot connected successfully!'));
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          chalk.yellow(`🔌 Connection closed: ${lastDisconnect?.error?.message || 'Unknown reason'}`),
          shouldReconnect ? chalk.yellow('Reconnecting...') : chalk.red('Not reconnecting')
        );

        if (shouldReconnect) {
          setTimeout(() => this.startBot(), 3000);
        }
      }
    });

    // Message handler
    this.sock.ev.on('messages.upsert', async (m) => {
      await this.handleMessage(m);
    });

    // Save credentials
    this.sock.ev.on('creds.update', saveCreds);

    // Handle interactive responses
    this.sock.ev.on('messages.update', async (updates) => {
      for (const update of updates) {
        const message = await this.store.loadMessage(
          update.key.remoteJid,
          update.key.id
        );

        if (!message) return;

        // Handle reactions
        if (update.update?.pollUpdates?.length) {
          const pollUpdate = update.update.pollUpdates[0];
          console.log(chalk.cyan('📊 Poll updated:'), pollUpdate);
        }
      }
    });

    // Handle group updates
    this.sock.ev.on('groups.update', (groupUpdates) => {
      for (const update of groupUpdates) {
        console.log(chalk.cyan('👥 Group update:'), update);
      }
    });

    // Handle chat updates (archive, mute, pin)
    this.sock.ev.on('chats.update', (chatUpdates) => {
      for (const update of chatUpdates) {
        if (update.archive) {
          console.log(chalk.cyan('📦 Chat archived'));
        }
        if (update.mute) {
          console.log(chalk.cyan('🔇 Chat muted'));
        }
        if (update.pin) {
          console.log(chalk.cyan('📌 Chat pinned'));
        }
      }
    });

    // Handle presence updates
    this.sock.ev.on('presence.update', (presenceUpdates) => {
      for (const { jid, lastKnownPresence } of presenceUpdates) {
        console.log(chalk.cyan(`👤 ${jid}: ${lastKnownPresence}`));
      }
    });
  }

  /**
   * Main message handler - routes to appropriate handler
   */
  async handleMessage(m) {
    try {
      if (!m.messages) return;

      const message = m.messages[0];
      if (!message.message) return;

      // Don't respond to own messages or status updates
      if (message.key.fromMe || message.key.remoteJid === 'status@broadcast') return;

      const from = message.key.remoteJid;
      const isGroup = from.includes('@g.us');
      const phoneNumber = message.key.participant || from;
      const cleanPhone = phoneNumber.split('@')[0];

      // Check if user is blocked
      if (this.advancedAdminHandler?.isUserBlocked(cleanPhone)) {
        return;
      }

      // Get message text
      const text = this.getMessageText(message);

      // Handle interactive responses
      const buttonReply = await this.interactiveMessageHandler.handleButtonResponse(message, from, cleanPhone);
      if (buttonReply) {
        await this.handleButtonClick(buttonReply, from, cleanPhone);
        return;
      }

      const listReply = await this.interactiveMessageHandler.handleListResponse(message, from, cleanPhone);
      if (listReply) {
        await this.handleListSelection(listReply, from, cleanPhone);
        return;
      }

      const quoteReply = await this.interactiveMessageHandler.handleQuoteMessage(message, from, cleanPhone);
      if (quoteReply) {
        console.log(chalk.cyan('💬 Quoted reply:'), quoteReply.quotedText);
      }

      const reaction = await this.interactiveMessageHandler.handleMessageReaction(message, from, cleanPhone);
      if (reaction) {
        console.log(chalk.cyan('😂 User reacted:'), reaction.emoji);
      }

      // Handle forwarded messages
      const forwarded = await this.interactiveMessageHandler.handleForwardedMessage(message, from, cleanPhone);
      if (forwarded) {
        console.log(chalk.cyan('➡️  Forwarded message received'));
      }

      // Process text commands
      if (text.startsWith(this.prefix)) {
        await this.handleCommand(text, from, phoneNumber, cleanPhone, isGroup, message);
      } else if (text.length > 0) {
        // Natural language processing for non-command messages
        await this.handleNaturalLanguage(text, from, cleanPhone, message);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error handling message:'), error.message);
    }
  }

  /**
   * Handle commands with prefix
   */
  async handleCommand(text, from, phoneNumber, cleanPhone, isGroup, message) {
    try {
      const args = text.slice(this.prefix.length).trim().split(/\s+/);
      const command = args[0]?.toLowerCase();
      const params = args.slice(1);

      console.log(chalk.blue(`📝 Command: ${command}`), chalk.gray(`from ${cleanPhone}`));

      // Smart reaction based on command type
      const reactionMap = {
        'order': '✅',
        'payment': '💳',
        'billing': '💰',
        'inventory': '📦',
        'help': '❓',
        'menu': '📋',
        'status': '📊'
      };

      if (reactionMap[command] && Math.random() > 0.3) {
        await this.interactiveMessageHandler.smartReact(from, message.key, command);
      }

      // Route to appropriate handler
      switch (command) {
        // Utility commands
        case 'menu':
        case 'help':
        case 'about':
        case 'ping':
        case 'status':
        case 'prefix':
        case 'source':
        case 'support':
        case 'donate':
        case 'terms':
        case 'privacy':
        case 'uptime':
        case 'stats':
        case 'join':
        case 'feedback':
          return await this.utilityCommandHandler.handle(command, params, from, text);

        // Advanced admin commands
        case 'broadcast':
        case 'setgc':
        case 'block':
        case 'unblock':
        case 'listblocked':
        case 'eval':
        case 'exec':
        case 'restart':
        case 'update':
        case 'backup':
        case 'restore':
        case 'clearcache':
        case 'setlimit':
        case 'addpremium':
        case 'removepremium':
        case 'listpremium':
        case 'getsession':
        case 'sendtemplate':
        case 'getdb':
        case 'log':
          return await this.advancedAdminHandler.handle(command, params, from, cleanPhone);

        // Customer commands
        case 'order':
        case 'cart':
        case 'checkout':
        case 'products':
        case 'search':
          return await this.customerHandler.handleCustomerCommand(command, params, from, cleanPhone);

        // Merchant commands
        case 'dashboard':
        case 'billing':
        case 'commission':
        case 'payout':
        case 'subscription':
        case 'inventory':
        case 'analytics':
        case 'orders':
          return await this.merchantHandler.handleMerchantCommand(command, params, from, cleanPhone);

        // Admin commands
        case 'merchants':
        case 'platform':
        case 'health':
        case 'logs':
          return await this.adminHandler.handleAdminCommand(command, params, from, cleanPhone);

        default:
          return await this.messageService.sendTextMessage(
            from,
            `❌ Unknown command: ${command}\nType ${this.prefix}menu for help`
          );
      }
    } catch (error) {
      console.error(chalk.red('Error handling command:'), error.message);
      await this.messageService.sendTextMessage(from, `❌ Command failed: ${error.message}`);
    }
  }

  /**
   * Handle button clicks
   */
  async handleButtonClick(buttonReply, from, phoneNumber) {
    console.log(chalk.cyan('🔘 Button clicked:'), buttonReply.displayText);

    // Route based on button ID
    const text = `!${buttonReply.displayText.toLowerCase().split(' ')[0]}`;
    await this.handleCommand(text, from, phoneNumber, phoneNumber, false, {});
  }

  /**
   * Handle list selections
   */
  async handleListSelection(listReply, from, phoneNumber) {
    console.log(chalk.cyan('📋 List item selected:'), listReply.title);

    const text = `!${listReply.title.toLowerCase().split(' ')[0]}`;
    await this.handleCommand(text, from, phoneNumber, phoneNumber, false, {});
  }

  /**
   * Handle natural language (non-command messages)
   */
  async handleNaturalLanguage(text, from, phoneNumber, message) {
    // Simple NLP: Check for keywords and respond appropriately
    const keywords = {
      'hello|hi|hey': 'greeting',
      'thanks|thank you': 'thanks',
      'ok|okay|sure': 'acknowledgment',
      'help': 'help',
      'order': 'order',
      'price|cost': 'pricing'
    };

    for (const [pattern, type] of Object.entries(keywords)) {
      if (new RegExp(pattern, 'i').test(text)) {
        console.log(chalk.gray(`📝 NLP: Detected ${type}`));

        switch (type) {
          case 'greeting':
            return await this.messageService.sendTextMessage(
              from,
              `👋 Hello! Welcome to Smart Bot.\nType ${this.prefix}menu to see available commands.`
            );

          case 'thanks':
            return await this.messageService.sendTextMessage(
              from,
              `😊 You're welcome!\nNeed anything else? Type ${this.prefix}help`
            );

          case 'help':
            return await this.utilityCommandHandler.showMenu(from);

          case 'order':
            return await this.messageService.sendTextMessage(
              from,
              `📦 To place an order, use: ${this.prefix}order <items>\nExample: ${this.prefix}order sadza, chicken`
            );
        }

        break;
      }
    }
  }

  /**
   * Setup Express server for API and Dashboard sync
   */
  setupExpressServer() {
    this.app = express();

    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.static(path.join(__dirname, '../../dist')));

    // Health check
    this.app.get('/api/bot/health', (req, res) => {
      res.json({
        status: this.sock ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Send message from dashboard
    this.app.post('/api/bot/send-message', async (req, res) => {
      try {
        const { to, message, type } = req.body;

        if (type === 'text') {
          await this.messageService.sendTextMessage(to, message);
        } else if (type === 'button') {
          // Handle button message sending from dashboard
          await this.messageService.sendButtonMessage(to, message.header, message.body, message.buttons, message.footer);
        }

        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get chat history
    this.app.get('/api/bot/chats/:chatId', (req, res) => {
      try {
        const chat = this.store?.chats?.get(req.params.chatId);
        res.json(chat || { error: 'Chat not found' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get all chats
    this.app.get('/api/bot/chats', (req, res) => {
      try {
        const chats = Array.from(this.store?.chats?.entries() || []).map(([id, chat]) => ({
          id,
          ...chat
        }));
        res.json(chats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get bot stats
    this.app.get('/api/bot/stats', (req, res) => {
      res.json({
        totalChats: this.store?.chats?.size || 0,
        blockedUsers: this.advancedAdminHandler?.blockedUsers?.size || 0,
        premiumUsers: this.advancedAdminHandler?.premiumUsers?.size || 0,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      });
    });

    // Send broadcast
    this.app.post('/api/bot/broadcast', async (req, res) => {
      try {
        const { message } = req.body;
        await this.advancedAdminHandler.handleBroadcast(this.adminPhone, message);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Block/Unblock user
    this.app.post('/api/bot/block', async (req, res) => {
      try {
        const { phoneNumber, block } = req.body;

        if (block) {
          this.advancedAdminHandler.blockedUsers.add(phoneNumber);
        } else {
          this.advancedAdminHandler.blockedUsers.delete(phoneNumber);
        }

        this.advancedAdminHandler.saveBlockedUsers();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    const PORT = process.env.BOT_PORT || 3001;
    this.server = this.app.listen(PORT, () => {
      console.log(chalk.green(`🚀 Bot API server running on port ${PORT}`));
    });
  }

  /**
   * Setup cron jobs for scheduled tasks
   */
  setupCronJobs() {
    const cron = require('node-cron');

    // Check premium user expiry every hour
    cron.schedule('0 * * * *', async () => {
      console.log(chalk.blue('⏰ Checking premium user expiry...'));

      for (const [phone, data] of this.advancedAdminHandler.premiumUsers) {
        const expiryDate = new Date(data.expiresAt);
        if (expiryDate < new Date()) {
          this.advancedAdminHandler.premiumUsers.delete(phone);
          console.log(chalk.yellow(`⏳ Premium expired for ${phone}`));
        }
      }

      this.advancedAdminHandler.savePremiumUsers();
    });

    // Backup database daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log(chalk.blue('💾 Running scheduled backup...'));
      await this.advancedAdminHandler.handleBackup(this.adminPhone);
    });

    // Clear old cache entries every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      console.log(chalk.blue('🧹 Cleaning up caches...'));
      // NodeCache automatically handles TTL
    });
  }

  // Helper method
  getMessageText(message) {
    if (message.message?.conversation) {
      return message.message.conversation;
    }
    if (message.message?.extendedTextMessage) {
      return message.message.extendedTextMessage.text;
    }
    if (message.message?.imageMessage?.caption) {
      return message.message.imageMessage.caption;
    }
    if (message.message?.videoMessage?.caption) {
      return message.message.videoMessage.caption;
    }
    if (message.message?.buttonsResponseMessage?.selectedDisplayText) {
      return message.message.buttonsResponseMessage.selectedDisplayText;
    }
    if (message.message?.listResponseMessage?.title) {
      return message.message.listResponseMessage.title;
    }
    return '';
  }
}

// Start the bot
const bot = new SmartWhatsAppBot();
bot.startBot().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});

module.exports = bot;
