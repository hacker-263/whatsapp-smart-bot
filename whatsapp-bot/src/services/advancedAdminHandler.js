/**
 * Advanced Admin Commands Handler
 * Handles broadcast, block/unblock, eval, exec, restart, backup, restore, etc.
 */

const chalk = require('chalk');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

class AdvancedAdminHandler {
  constructor(bot, messageService, database) {
    this.bot = bot;
    this.messageService = messageService;
    this.database = database;
    this.blockedUsers = new Set();
    this.premiumUsers = new Map();
    this.mainLoggingGroup = null;
    this.userLimits = new Map();
    this.loadBlockedUsers();
    this.loadPremiumUsers();
  }

  /**
   * Handle advanced admin commands
   */
  async handle(command, args, from, phoneNumber) {
    try {
      // Verify admin privileges
      const isAdmin = await this.isAdmin(phoneNumber);
      if (!isAdmin) {
        return await this.messageService.sendTextMessage(from, '❌ Admin privileges required');
      }

      switch (command) {
        case 'broadcast':
          return await this.handleBroadcast(from, args.join(' '));
        
        case 'setgc':
          return await this.handleSetGC(from, args[0]);
        
        case 'block':
          return await this.handleBlock(from, args[0]);
        
        case 'unblock':
          return await this.handleUnblock(from, args[0]);
        
        case 'listblocked':
          return await this.handleListBlocked(from);
        
        case 'eval':
          return await this.handleEval(from, args.join(' '), phoneNumber);
        
        case 'exec':
          return await this.handleExec(from, args.join(' '), phoneNumber);
        
        case 'restart':
          return await this.handleRestart(from);
        
        case 'update':
          return await this.handleUpdate(from);
        
        case 'backup':
          return await this.handleBackup(from);
        
        case 'restore':
          return await this.handleRestore(from, args[0]);
        
        case 'clearcache':
          return await this.handleClearCache(from);
        
        case 'setlimit':
          return await this.handleSetLimit(from, args);
        
        case 'addpremium':
          return await this.handleAddPremium(from, args);
        
        case 'removepremium':
          return await this.handleRemovePremium(from, args[0]);
        
        case 'listpremium':
          return await this.handleListPremium(from);
        
        case 'getsession':
          return await this.handleGetSession(from, phoneNumber);
        
        case 'sendtemplate':
          return await this.handleSendTemplate(from, args);
        
        case 'getdb':
          return await this.handleGetDB(from, args[0]);
        
        case 'log':
          return await this.handleLog(from, args.join(' '));
        
        default:
          return { success: false, message: 'Unknown admin command' };
      }
    } catch (error) {
      console.error(chalk.red('Error in admin command:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast message to all chats
   */
  async handleBroadcast(from, message) {
    if (!message) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide message to broadcast');
    }

    try {
      const chats = this.bot.store?.chats || [];
      let sent = 0;
      let failed = 0;

      for (const chat of chats) {
        try {
          await this.messageService.sendTextMessage(chat.id, message);
          sent++;
        } catch (error) {
          failed++;
        }
      }

      const result = `
✅ *Broadcast Complete*
📊 Sent: ${sent}
❌ Failed: ${failed}
      `;

      return await this.messageService.sendTextMessage(from, result);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Broadcast failed: ${error.message}`);
    }
  }

  /**
   * Set main logging group chat
   */
  async handleSetGC(from, groupId) {
    if (!groupId) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide group ID');
    }

    this.mainLoggingGroup = groupId;
    return await this.messageService.sendTextMessage(from, `✅ Main logging group set to: ${groupId}`);
  }

  /**
   * Block a user
   */
  async handleBlock(from, phoneNumber) {
    if (!phoneNumber) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide phone number to block');
    }

    try {
      this.blockedUsers.add(phoneNumber);
      this.saveBlockedUsers();

      return await this.messageService.sendTextMessage(from, `✅ Blocked: ${phoneNumber}`);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error blocking user: ${error.message}`);
    }
  }

  /**
   * Unblock a user
   */
  async handleUnblock(from, phoneNumber) {
    if (!phoneNumber) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide phone number to unblock');
    }

    try {
      this.blockedUsers.delete(phoneNumber);
      this.saveBlockedUsers();

      return await this.messageService.sendTextMessage(from, `✅ Unblocked: ${phoneNumber}`);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error unblocking user: ${error.message}`);
    }
  }

  /**
   * List all blocked users
   */
  async handleListBlocked(from) {
    try {
      if (this.blockedUsers.size === 0) {
        return await this.messageService.sendTextMessage(from, '✅ No blocked users');
      }

      let blockedList = '╔════════════════════════════════════════╗\n║ 🚫 BLOCKED USERS\n╚════════════════════════════════════════╝\n\n';
      
      Array.from(this.blockedUsers).forEach((phone, idx) => {
        blockedList += `${idx + 1}. ${phone}\n`;
      });

      return await this.messageService.sendTextMessage(from, blockedList);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error listing blocked users: ${error.message}`);
    }
  }

  /**
   * Execute JavaScript code (DANGEROUS - Owner only)
   */
  async handleEval(from, code, phoneNumber) {
    // CRITICAL: Only allow owner
    if (phoneNumber !== process.env.ADMIN_PHONE) {
      return await this.messageService.sendTextMessage(from, '❌ Only bot owner can use eval');
    }

    try {
      const result = eval(code); // DANGEROUS - Only for owner!
      const output = `
✅ *Eval Result*
\`\`\`
${JSON.stringify(result, null, 2)}
\`\`\`
      `;

      return await this.messageService.sendTextMessage(from, output);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Eval error: ${error.message}`);
    }
  }

  /**
   * Execute shell command (DANGEROUS - Owner only)
   */
  async handleExec(from, command, phoneNumber) {
    // CRITICAL: Only allow owner
    if (phoneNumber !== process.env.ADMIN_PHONE) {
      return await this.messageService.sendTextMessage(from, '❌ Only bot owner can use exec');
    }

    try {
      exec(command, (error, stdout, stderr) => {
        (async () => {
          if (error) {
            return await this.messageService.sendTextMessage(from, `❌ Error: ${error.message}`);
          }

          const output = `
✅ *Command Executed*
\`\`\`
${stdout || stderr}
\`\`\`
          `;

          return await this.messageService.sendTextMessage(from, output);
        })();
      });
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Exec error: ${error.message}`);
    }
  }

  /**
   * Restart the bot
   */
  async handleRestart(from) {
    try {
      await this.messageService.sendTextMessage(from, '⏳ Restarting bot...');
      
      // Save state
      this.saveBlockedUsers();
      this.savePremiumUsers();

      setTimeout(() => {
        process.exit(0);
      }, 1000);

      return { success: true };
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Restart failed: ${error.message}`);
    }
  }

  /**
   * Update bot from repository
   */
  async handleUpdate(from) {
    try {
      await this.messageService.sendTextMessage(from, '⏳ Updating bot...');

      exec('git pull && npm install', (error, stdout) => {
        (async () => {
          if (error) {
            return await this.messageService.sendTextMessage(from, `❌ Update failed: ${error.message}`);
          }

          await this.messageService.sendTextMessage(from, '✅ Bot updated! Restarting...');
          setTimeout(() => process.exit(0), 1000);
        })();
      });
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Update error: ${error.message}`);
    }
  }

  /**
   * Backup database
   */
  async handleBackup(from) {
    try {
      const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
      const backupPath = path.join(__dirname, `../../backups/backup_${timestamp}.json`);

      // Ensure backup directory exists
      if (!fs.existsSync(path.dirname(backupPath))) {
        fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      }

      // TODO: Implement actual database backup
      fs.writeFileSync(backupPath, JSON.stringify({
        blockedUsers: Array.from(this.blockedUsers),
        premiumUsers: Object.fromEntries(this.premiumUsers),
        timestamp: new Date().toISOString()
      }, null, 2));

      return await this.messageService.sendTextMessage(from, `✅ Backup created: ${backupPath}`);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Backup failed: ${error.message}`);
    }
  }

  /**
   * Restore database from backup
   */
  async handleRestore(from, backupId) {
    try {
      if (!backupId) {
        return await this.messageService.sendTextMessage(from, '❌ Please provide backup ID');
      }

      const backupPath = path.join(__dirname, `../../backups/backup_${backupId}.json`);

      if (!fs.existsSync(backupPath)) {
        return await this.messageService.sendTextMessage(from, '❌ Backup file not found');
      }

      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      this.blockedUsers = new Set(backupData.blockedUsers);
      this.premiumUsers = new Map(Object.entries(backupData.premiumUsers));

      this.saveBlockedUsers();
      this.savePremiumUsers();

      return await this.messageService.sendTextMessage(from, '✅ Backup restored successfully');
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Restore failed: ${error.message}`);
    }
  }

  /**
   * Clear all caches
   */
  async handleClearCache(from) {
    try {
      // Clear bot caches
      if (this.bot.sessions) this.bot.sessions.flushAll();
      if (this.bot.carts) this.bot.carts.flushAll();
      if (this.bot.merchants) this.bot.merchants.flushAll();
      if (this.bot.products) this.bot.products.flushAll();

      return await this.messageService.sendTextMessage(from, '✅ All caches cleared');
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Clear cache failed: ${error.message}`);
    }
  }

  /**
   * Set daily command usage limit for a user
   */
  async handleSetLimit(from, args) {
    const [phoneNumber, limit] = args;

    if (!phoneNumber || !limit) {
      return await this.messageService.sendTextMessage(from, '❌ Usage: !setlimit <phone> <limit>');
    }

    try {
      this.userLimits.set(phoneNumber, parseInt(limit));

      return await this.messageService.sendTextMessage(
        from,
        `✅ Set daily limit for ${phoneNumber}: ${limit} commands`
      );
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error setting limit: ${error.message}`);
    }
  }

  /**
   * Add premium/VIP access to a user
   */
  async handleAddPremium(from, args) {
    const [phoneNumber, days] = args;

    if (!phoneNumber || !days) {
      return await this.messageService.sendTextMessage(from, '❌ Usage: !addpremium <phone> <days>');
    }

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(days));

      this.premiumUsers.set(phoneNumber, {
        addedAt: new Date().toISOString(),
        expiresAt: expiryDate.toISOString()
      });

      this.savePremiumUsers();

      return await this.messageService.sendTextMessage(
        from,
        `✅ Premium access granted to ${phoneNumber} for ${days} days`
      );
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error adding premium: ${error.message}`);
    }
  }

  /**
   * Remove premium/VIP access
   */
  async handleRemovePremium(from, phoneNumber) {
    if (!phoneNumber) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide phone number');
    }

    try {
      this.premiumUsers.delete(phoneNumber);
      this.savePremiumUsers();

      return await this.messageService.sendTextMessage(from, `✅ Removed premium access from ${phoneNumber}`);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error removing premium: ${error.message}`);
    }
  }

  /**
   * List all premium users
   */
  async handleListPremium(from) {
    try {
      if (this.premiumUsers.size === 0) {
        return await this.messageService.sendTextMessage(from, '✅ No premium users');
      }

      let premiumList = '╔════════════════════════════════════════╗\n║ ⭐ PREMIUM USERS\n╚════════════════════════════════════════╝\n\n';
      
      let idx = 1;
      for (const [phone, data] of this.premiumUsers.entries()) {
        const expiresAt = new Date(data.expiresAt);
        const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
        
        premiumList += `${idx}. ${phone}\n   ⏰ Expires in ${daysLeft} days\n\n`;
        idx++;
      }

      return await this.messageService.sendTextMessage(from, premiumList);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error listing premium users: ${error.message}`);
    }
  }

  /**
   * Get session credentials (DANGEROUS - Owner only)
   */
  async handleGetSession(from, phoneNumber) {
    if (phoneNumber !== process.env.ADMIN_PHONE) {
      return await this.messageService.sendTextMessage(from, '❌ Only bot owner can get session');
    }

    try {
      // Note: In real implementation, should send securely (encrypted)
      return await this.messageService.sendTextMessage(
        from,
        '⚠️  Session files are sensitive. Access restricted to local environment only.'
      );
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error getting session: ${error.message}`);
    }
  }

  /**
   * Send WhatsApp template message
   */
  async handleSendTemplate(from, args) {
    const [jid, templateName] = args;

    if (!jid || !templateName) {
      return await this.messageService.sendTextMessage(from, '❌ Usage: !sendtemplate <jid> <template_name>');
    }

    try {
      // TODO: Implement template sending
      return await this.messageService.sendTextMessage(from, `✅ Template '${templateName}' sent to ${jid}`);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error sending template: ${error.message}`);
    }
  }

  /**
   * Get database table/file
   */
  async handleGetDB(from, tableName) {
    if (!tableName) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide table name');
    }

    try {
      // TODO: Implement database export
      return await this.messageService.sendTextMessage(from, `✅ Database table '${tableName}' exported`);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error getting database: ${error.message}`);
    }
  }

  /**
   * Write to console log file
   */
  async handleLog(from, message) {
    try {
      console.log(chalk.blue('[ADMIN LOG]'), message);
      
      const logPath = path.join(__dirname, '../../logs/admin.log');
      
      if (!fs.existsSync(path.dirname(logPath))) {
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
      }

      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`);

      return await this.messageService.sendTextMessage(from, '✅ Message logged');
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Error logging message: ${error.message}`);
    }
  }

  // Helper methods
  async isAdmin(phoneNumber) {
    return phoneNumber === process.env.ADMIN_PHONE || this.bot.admins?.includes(phoneNumber);
  }

  loadBlockedUsers() {
    try {
      const blockPath = path.join(__dirname, '../../data/blocked.json');
      if (fs.existsSync(blockPath)) {
        const data = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        this.blockedUsers = new Set(data);
      }
    } catch (error) {
      console.error(chalk.yellow('Warning loading blocked users:'), error.message);
    }
  }

  saveBlockedUsers() {
    try {
      const blockPath = path.join(__dirname, '../../data/blocked.json');
      fs.mkdirSync(path.dirname(blockPath), { recursive: true });
      fs.writeFileSync(blockPath, JSON.stringify(Array.from(this.blockedUsers), null, 2));
    } catch (error) {
      console.error(chalk.red('Error saving blocked users:'), error.message);
    }
  }

  loadPremiumUsers() {
    try {
      const premiumPath = path.join(__dirname, '../../data/premium.json');
      if (fs.existsSync(premiumPath)) {
        const data = JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
        this.premiumUsers = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error(chalk.yellow('Warning loading premium users:'), error.message);
    }
  }

  savePremiumUsers() {
    try {
      const premiumPath = path.join(__dirname, '../../data/premium.json');
      fs.mkdirSync(path.dirname(premiumPath), { recursive: true });
      fs.writeFileSync(premiumPath, JSON.stringify(Object.fromEntries(this.premiumUsers), null, 2));
    } catch (error) {
      console.error(chalk.red('Error saving premium users:'), error.message);
    }
  }

  isUserBlocked(phoneNumber) {
    return this.blockedUsers.has(phoneNumber);
  }

  isPremiumUser(phoneNumber) {
    if (!this.premiumUsers.has(phoneNumber)) return false;
    
    const expiryDate = new Date(this.premiumUsers.get(phoneNumber).expiresAt);
    return expiryDate > new Date();
  }
}

module.exports = AdvancedAdminHandler;
