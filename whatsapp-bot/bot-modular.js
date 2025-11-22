/**
 * Smart WhatsApp Bot - Main Entry Point (Modularized)
 * Uses restructured handlers, controllers, and middlewares
 * Backward compatible with existing code
 */

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');

const { makeInMemoryStore } = require('@rodrigogs/baileys-store');
const { Boom } = require('@hapi/boom');
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const figlet = require('figlet');
const P = require('pino');
require('dotenv').config();

// Import modular components
const Logger = require('./src/config/logger');
const constants = require('./src/config/constants');
const botController = require('./src/controllers/botController');
const connectionHandler = require('./src/middlewares/connectionHandler');
const cache = require('./src/database/cache');

const logger = new Logger('MainBot');

class SmartWhatsAppBotModular {
  constructor() {
    this.sock = null;
    this.qrShown = false;
    this.store = makeInMemoryStore({
      logger: P().child({ level: 'silent', stream: 'store' }),
    });
    this.prefix = constants.BOT_PREFIX;
    this.adminPhones = constants.ADMIN_PHONES;
    this.apiBaseUrl = constants.API_BASE_URL;

    this.setupBanner();
    this.setupWebhookServer();
    this.setupRetryQueue();
  }

  setupBanner() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('Smart WhatsApp', { horizontalLayout: 'full' })));
    console.log(chalk.green('🤖 Smart WhatsApp Bot - Modularized Architecture'));
    console.log(chalk.yellow('📱 Multi-tenant with Role-based Features'));
    console.log(chalk.blue('🌍 Zimbabwe & South Africa Support'));
    console.log(chalk.magenta('⚡ Handlers | Services | Middlewares | APIs\n'));
  }

  setupWebhookServer() {
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: this.sock ? 'connected' : 'disconnected',
        bot: 'smart-whatsapp-modular',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    // Order update webhook from backend
    this.app.post('/webhook/order-update', async (req, res) => {
      try {
        const { orderId, status, customerPhone } = req.body;
        
        const message = `📦 *Order Update*\n\nOrder #${orderId}\nStatus: ${status}\n\nType !track ${orderId} for more details`;
        
        await botController.sendMessage(this.sock, `${customerPhone}@s.whatsapp.net`, message);
        
        logger.success(`Webhook: Order update sent to ${customerPhone}`);
        res.json({ success: true });
      } catch (error) {
        logger.error('Webhook error', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Merchant approved notification
    this.app.post('/webhook/merchant-approved', async (req, res) => {
      try {
        const { merchantPhone, businessName } = req.body;
        
        const message = `🎉 *Congratulations!*\n\nYour merchant account for "${businessName}" has been approved!\n\nType !help to see merchant commands`;
        
        await botController.sendMessage(this.sock, `${merchantPhone}@s.whatsapp.net`, message);
        
        logger.success(`Webhook: Merchant approved notification sent to ${merchantPhone}`);
        res.json({ success: true });
      } catch (error) {
        logger.error('Webhook error', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Product updated notification
    this.app.post('/webhook/product-updated', async (req, res) => {
      try {
        const { merchantPhone, productName, action } = req.body;
        
        const message = `📦 *Product ${action}*\n\n"${productName}" has been ${action}.\n\nType !merchant products to see all your products`;
        
        await botController.sendMessage(this.sock, `${merchantPhone}@s.whatsapp.net`, message);
        
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Start server
    this.server = this.app.listen(constants.BOT_WEBHOOK_PORT, () => {
      logger.success(`✅ Webhook server running on port ${constants.BOT_WEBHOOK_PORT}`);
    });
  }

  setupRetryQueue() {
    // Process retry queue every 5 seconds
    setInterval(async () => {
      if (this.sock) {
        await botController.processRetryQueue(this.sock);
      }
    }, 5000);

    logger.info('Retry queue processor started (5s interval)');
  }

  async startBot() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
      const { version, isLatest } = await fetchLatestBaileysVersion();

      logger.info(`🔄 Using WhatsApp v${version.join('.')}, Latest: ${isLatest}`);

      this.sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        browser: ['Smart Bot', 'Chrome', '1.0.0'],
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        getMessage: async (key) => {
          if (this.store) {
            const msg = await this.store.loadMessage(key.remoteJid, key.id);
            return msg?.message || undefined;
          }
          return undefined;
        },
      });

      this.store?.bind(this.sock.ev);
      this.setupEventHandlers(saveCreds);

    } catch (error) {
      logger.error('Failed to start bot', error);
      setTimeout(() => this.startBot(), 5000);
    }
  }

  setupEventHandlers(saveCreds) {
    // Connection updates
    this.sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !this.qrShown) {
        this.qrShown = true;
        logger.info('📱 Scan QR code with WhatsApp:');
        const qrcodeTerminal = require('qrcode-terminal');
        qrcodeTerminal.generate(qr, { small: true });
        console.log(chalk.green('✨ Waiting for connection...\n'));
      }

      // Only restart on actual disconnection, not on initial connection
      if (connection === 'close') {
        this.qrShown = false;
      }

      connectionHandler.handleConnectionUpdate(update, () => this.startBot());
    });

    // Credentials update
    this.sock.ev.on('creds.update', saveCreds);

    // Message handler - Route to botController
    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        const message = m.messages[0];
        
        if (!message.message || message.key.fromMe) {
          return;
        }

        // Main message processor
        await botController.handleMessage(message, this.sock);

      } catch (error) {
        logger.error('Message event error', error);
      }
    });

    // Group updates (optional)
    this.sock.ev.on('groups.update', async (updates) => {
      logger.debug(`Group update received: ${updates.length} updates`);
    });

    this.displayStartupInfo();
  }

  displayStartupInfo() {
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green('✅ BOT CONNECTED AND READY'));
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('\n📋 Available Command Categories:\n'));
    
    console.log(chalk.white('👨‍💼 ADMIN Commands:'));
    console.log(chalk.gray('   !admin merchants pending'));
    console.log(chalk.gray('   !admin approve <id>'));
    console.log(chalk.gray('   !admin sales today\n'));
    
    console.log(chalk.white('🏪 MERCHANT Commands:'));
    console.log(chalk.gray('   !merchant orders new'));
    console.log(chalk.gray('   !merchant products list'));
    console.log(chalk.gray('   !merchant analytics\n'));
    
    console.log(chalk.white('🛍️  CUSTOMER Commands:'));
    console.log(chalk.gray('   !menu'));
    console.log(chalk.gray('   !search <item>'));
    console.log(chalk.gray('   !add <id> <qty>'));
    console.log(chalk.gray('   !checkout\n'));
    
    console.log(chalk.white('🔑 GENERAL Commands:'));
    console.log(chalk.gray('   !register [name] [role]'));
    console.log(chalk.gray('   !login'));
    console.log(chalk.gray('   !help\n'));
    
    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green('🚀 Ready to receive messages!\n'));
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    logger.warn('Shutting down bot...');
    
    if (this.sock) {
      await this.sock.end();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    process.exit(0);
  }
}

// Initialize and start
const bot = new SmartWhatsAppBotModular();

process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());

bot.startBot();

module.exports = bot;
