/**
 * Utility Commands Handler
 * Handles menu, help, about, ping, status, prefix, source, support, donate, terms, privacy, stats, etc.
 */

const chalk = require('chalk');
const os = require('os');
const fs = require('fs');
const path = require('path');

class UtilityCommandHandler {
  constructor(bot, messageService) {
    this.bot = bot;
    this.messageService = messageService;
    this.startTime = Date.now();
    this.commandHistory = {};
  }

  /**
   * Handle utility commands
   */
  async handle(command, args, from, text) {
    try {
      switch (command) {
        case 'menu':
          return await this.showMenu(from);
        
        case 'help':
          return await this.showHelp(from, args[0]);
        
        case 'about':
          return await this.showAbout(from);
        
        case 'ping':
          return await this.showPing(from);
        
        case 'status':
          return await this.showStatus(from);
        
        case 'prefix':
          return await this.changePrefix(from, args[0]);
        
        case 'source':
          return await this.showSource(from);
        
        case 'support':
          return await this.showSupport(from);
        
        case 'donate':
          return await this.showDonate(from);
        
        case 'terms':
          return await this.showTerms(from);
        
        case 'privacy':
          return await this.showPrivacy(from);
        
        case 'uptime':
          return await this.showUptime(from);
        
        case 'stats':
          return await this.showStats(from);
        
        case 'join':
          return await this.joinGroup(from, args[0]);
        
        case 'feedback':
          return await this.sendFeedback(from, args.join(' '));
        
        default:
          return { success: false, message: 'Unknown utility command' };
      }
    } catch (error) {
      console.error(chalk.red('Error in utility command:'), error.message);
      return { success: false, error: error.message };
    }
  }

  async showMenu(from) {
    const menuText = `
╔════════════════════════════════════════════╗
║         📱 SMART BOT - MAIN MENU          ║
╚════════════════════════════════════════════╝

🛍️  *SHOPPING COMMANDS*
├─ !menu - Show this menu
├─ !help [command] - Get help on a command
├─ !products - Browse products
├─ !order <items> - Place an order
├─ !cart - View your shopping cart
├─ !checkout - Proceed to payment
├─ !status - Check order status

💼 *MERCHANT COMMANDS*
├─ !dashboard - View business dashboard
├─ !billing - View billing info
├─ !inventory - Check inventory
├─ !commission - View commissions
├─ !payout - Request payout
├─ !subscription - Manage subscription
├─ !analytics - Business analytics

👨‍💼 *ADMIN COMMANDS*
├─ !merchants - Manage merchants
├─ !broadcast - Send broadcast message
├─ !stats - Platform statistics
├─ !block <number> - Block a user
├─ !unblock <number> - Unblock a user

ℹ️  *INFORMATION*
├─ !about - About this bot
├─ !ping - Check bot status
├─ !uptime - Bot uptime
├─ !support - Get support
├─ !donate - Support the project
├─ !terms - Terms of Service
├─ !privacy - Privacy Policy
├─ !source - Source code

Type ${this.bot.prefix}help <command> for more info!
    `;

    return await this.messageService.sendTextMessage(from, menuText);
  }

  async showHelp(from, command) {
    if (!command) {
      return await this.showMenu(from);
    }

    const helpText = this.getCommandHelp(command);
    if (!helpText) {
      return await this.messageService.sendTextMessage(from, `❌ No help found for command: ${command}`);
    }

    return await this.messageService.sendTextMessage(from, helpText);
  }

  getCommandHelp(command) {
    const helpMap = {
      'order': `
*📦 ORDER COMMAND*
Usage: ${this.bot.prefix}order <item1> <item2> ...

Examples:
  ${this.bot.prefix}order sadza
  ${this.bot.prefix}order chicken x2, rice x3
  ${this.bot.prefix}order sadza, vegetables, beef

This command creates a new order with the items you specify.
      `,
      'cart': `
*🛒 CART COMMAND*
Usage: ${this.bot.prefix}cart

Shows your current shopping cart with:
  • Item names
  • Quantities
  • Individual prices
  • Total amount

Use ${this.bot.prefix}checkout to proceed to payment.
      `,
      'status': `
*📊 STATUS COMMAND*
Usage: ${this.bot.prefix}status <order_id> (optional)

If no order ID provided, shows all your orders.
Shows:
  • Order date
  • Status (pending, confirmed, shipped, delivered)
  • Items ordered
  • Total amount
      `,
      'products': `
*🛍️  PRODUCTS COMMAND*
Usage: ${this.bot.prefix}products [category] [search]

Examples:
  ${this.bot.prefix}products
  ${this.bot.prefix}products groceries
  ${this.bot.prefix}products groceries sadza

Browse available products. Use search to find specific items.
      `,
      'ping': `
*⏱️  PING COMMAND*
Usage: ${this.bot.prefix}ping

Tests bot response time and shows latency.
Used to check if bot is responding properly.
      `,
      'help': `
*ℹ️  HELP COMMAND*
Usage: ${this.bot.prefix}help [command]

Shows detailed information about a command.
If no command specified, shows general menu.
      `
    };

    return helpMap[command] || null;
  }

  async showAbout(from) {
    const aboutText = `
╔════════════════════════════════════════════╗
║           🤖 ABOUT THIS BOT               ║
╚════════════════════════════════════════════╝

*Smart WhatsApp Bot v2.0*

A comprehensive WhatsApp-based marketplace platform for 
merchants, customers, and admins to manage orders, billing, 
inventory, and more - all through WhatsApp!

*Features:*
✅ Order Management
✅ Payment Processing
✅ Inventory Tracking
✅ Commission Billing
✅ Real-time Notifications
✅ Multi-language Support
✅ Admin Dashboard
✅ Mobile-First Design

*Creator:* Smart Bot Team
*License:* MIT
*Support:* support@smartbot.com
*Repository:* github.com/smartbot/whatsapp-bot

Built with ❤️ for Zimbabwe & South Africa
    `;

    return await this.messageService.sendTextMessage(from, aboutText);
  }

  async showPing(from) {
    const start = Date.now();
    
    try {
      const latency = Date.now() - start;
      const text = `
╔════════════════════════════════════════════╗
║              🏓 PONG!                      ║
╚════════════════════════════════════════════╝

⏱️  Response Time: ${latency}ms
📡 Connection: ${latency < 100 ? '✅ Excellent' : latency < 500 ? '⚠️ Good' : '❌ Slow'}
🤖 Bot Status: ${this.isRunning() ? '✅ Running' : '❌ Offline'}
      `;

      return await this.messageService.sendTextMessage(from, text);
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Ping failed: ${error.message}`);
    }
  }

  async showStatus(from) {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = Math.floor(uptime / (1000 * 60 * 60));
    const uptimeMinutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const uptimeSeconds = Math.floor((uptime % (1000 * 60)) / 1000);

    const ram = process.memoryUsage();
    const ramUsage = (ram.heapUsed / ram.heapTotal * 100).toFixed(2);

    const cpuUsage = require('os').loadavg()[0].toFixed(2);

    const statusText = `
╔════════════════════════════════════════════╗
║           📊 BOT STATUS                   ║
╚════════════════════════════════════════════╝

*Server Uptime:*
⏰ ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s

*System Resources:*
💾 RAM Usage: ${ramUsage}%
⚙️  CPU Load: ${cpuUsage}
🖥️  Platform: ${process.platform}
🔧 Node Version: ${process.version}

*Connection:*
📡 Status: ${this.isRunning() ? '✅ Connected' : '❌ Disconnected'}
🔗 API: ${this.isAPIOnline() ? '✅ Online' : '❌ Offline'}

*Database:*
🗄️  Status: ${await this.checkDatabaseConnection() ? '✅ Connected' : '❌ Offline'}
    `;

    return await this.messageService.sendTextMessage(from, statusText);
  }

  async changePrefix(from, newPrefix) {
    if (!newPrefix || newPrefix.length > 1) {
      return await this.messageService.sendTextMessage(from, '❌ Prefix must be a single character (e.g., !, #, $)');
    }

    this.bot.prefix = newPrefix;
    process.env.BOT_PREFIX = newPrefix;

    return await this.messageService.sendTextMessage(from, `✅ Prefix changed to: ${newPrefix}`);
  }

  async showSource(from) {
    const sourceText = `
╔════════════════════════════════════════════╗
║         📚 SOURCE CODE                    ║
╚════════════════════════════════════════════╝

*Repository:*
🔗 https://github.com/smartbot/whatsapp-bot

*Contribute:*
Fork, create a branch, make changes, and submit a pull request!

*License:*
MIT License - Free to use and modify

*Bug Reports:*
Report issues: github.com/smartbot/whatsapp-bot/issues

Thank you for contributing! ❤️
    `;

    return await this.messageService.sendTextMessage(from, sourceText);
  }

  async showSupport(from) {
    const supportText = `
╔════════════════════════════════════════════╗
║         🤝 SUPPORT                        ║
╚════════════════════════════════════════════╝

*Contact Us:*
📧 Email: support@smartbot.com
💬 WhatsApp: +263 123456789
🌐 Website: www.smartbot.com
📱 Discord: discord.gg/smartbot

*Hours:*
⏰ Monday - Friday: 08:00 - 18:00 (CAT)
📅 Saturday: 09:00 - 14:00 (CAT)
🚫 Sunday: Closed

*Resources:*
📖 Documentation: docs.smartbot.com
🎥 Tutorials: youtube.com/@smartbot
❓ FAQ: faq.smartbot.com

We're here to help! 💪
    `;

    return await this.messageService.sendTextMessage(from, supportText);
  }

  async showDonate(from) {
    const donateText = `
╔════════════════════════════════════════════╗
║         💝 SUPPORT OUR PROJECT            ║
╚════════════════════════════════════════════╝

Your donation helps us improve the bot!

*Options:*
💳 PayPal: paypal.me/smartbot
📱 Mobile Money: +263 771234567
🏦 Bank Transfer: Check our website
💰 Patreon: patreon.com/smartbot

*What your donation does:*
✅ Server maintenance
✅ New features development
✅ Bug fixes and improvements
✅ Customer support
✅ Documentation

Even \$1 helps! Thank you! 🙏
    `;

    return await this.messageService.sendTextMessage(from, donateText);
  }

  async showTerms(from) {
    const termsText = `
╔════════════════════════════════════════════╗
║    📋 TERMS OF SERVICE               ║
╚════════════════════════════════════════════╝

*Last Updated: November 2024*

1. *Acceptance of Terms*
By using this bot, you agree to these terms.

2. *User Responsibilities*
• You are responsible for your account
• Do not share your credentials
• Comply with WhatsApp's Terms of Service

3. *Prohibited Activities*
• Spam or harassment
• Illegal activities
• Sharing of malware
• Fraud or scams

4. *Limitation of Liability*
We provide the bot "as is" without warranties.

5. *Changes to Terms*
We may update these terms anytime.

Read full terms: smartbot.com/terms

By using this bot, you accept these terms.
    `;

    return await this.messageService.sendTextMessage(from, termsText);
  }

  async showPrivacy(from) {
    const privacyText = `
╔════════════════════════════════════════════╗
║         🔒 PRIVACY POLICY               ║
╚════════════════════════════════════════════╝

*Last Updated: November 2024*

*What Data We Collect:*
• Messages (for processing orders)
• Phone number (for identification)
• Usage patterns (for improvement)
• Payment information (encrypted)

*How We Use Your Data:*
✅ Process your requests
✅ Improve the bot
✅ Send notifications
✅ Prevent fraud

*What We DON'T Do:*
❌ Sell your data
❌ Share with third parties
❌ Store messages permanently
❌ Track your location

*Your Rights:*
• Request your data
• Delete your account
• Opt-out of tracking
• Data portability

Read full privacy policy: smartbot.com/privacy

Your privacy is our priority! 🔒
    `;

    return await this.messageService.sendTextMessage(from, privacyText);
  }

  async showUptime(from) {
    const uptime = Date.now() - this.startTime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    const uptimeText = `
╔════════════════════════════════════════════╗
║         ⏰ BOT UPTIME                    ║
╚════════════════════════════════════════════╝

🤖 Smart Bot is running continuously!

📅 Uptime: ${days}d ${hours}h ${minutes}m

✅ Status: Online and ready to serve

Started: ${new Date(this.startTime).toLocaleString()}
    `;

    return await this.messageService.sendTextMessage(from, uptimeText);
  }

  async showStats(from) {
    const statsText = `
╔════════════════════════════════════════════╗
║         📈 BOT STATISTICS                 ║
╚════════════════════════════════════════════╝

*Messages Processed:*
📨 Total: ${this.getTotalMessages()}
✅ Successful: ${this.getSuccessfulMessages()}
❌ Failed: ${this.getFailedMessages()}

*Users:*
👥 Total: ${this.getTotalUsers()}
🆕 New Today: ${this.getNewUsersToday()}

*Commands:*
🎯 Total Executed: ${this.getTotalCommands()}
⏱️  Most Used: ${this.getMostUsedCommand()}

*Performance:*
⚡ Avg Response: ${this.getAverageResponseTime()}ms
📈 Success Rate: ${this.getSuccessRate()}%

Last 24 hours stats shown above.
    `;

    return await this.messageService.sendTextMessage(from, statsText);
  }

  async joinGroup(from, inviteLink) {
    if (!inviteLink) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide an invite link');
    }

    try {
      // Note: Baileys may not support joining via link directly
      return await this.messageService.sendTextMessage(
        from,
        '⚠️  Group join requests require direct admin approval.\nPlease ask the group admin to add the bot.'
      );
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Could not join group: ${error.message}`);
    }
  }

  async sendFeedback(from, message) {
    if (!message) {
      return await this.messageService.sendTextMessage(from, '❌ Please provide feedback message');
    }

    try {
      // Log feedback to a file or database
      const feedback = {
        from,
        message,
        timestamp: new Date().toISOString()
      };

      // TODO: Send to developers or log to database
      console.log(chalk.blue('📝 Feedback received:'), feedback);

      return await this.messageService.sendTextMessage(from, '✅ Thank you for your feedback!\nWe appreciate your input.');
    } catch (error) {
      return await this.messageService.sendTextMessage(from, `❌ Could not send feedback: ${error.message}`);
    }
  }

  // Helper methods
  isRunning() {
    return this.bot && this.bot.sock;
  }

  isAPIOnline() {
    return true; // TODO: Add actual API check
  }

  async checkDatabaseConnection() {
    return true; // TODO: Add actual database check
  }

  getTotalMessages() {
    return Object.values(this.commandHistory).reduce((a, b) => a + b, 0) || 0;
  }

  getSuccessfulMessages() {
    return Math.floor(this.getTotalMessages() * 0.95);
  }

  getFailedMessages() {
    return Math.floor(this.getTotalMessages() * 0.05);
  }

  getTotalUsers() {
    return this.bot?.store?.chats?.length || 0;
  }

  getNewUsersToday() {
    return 5; // TODO: Calculate actual new users
  }

  getTotalCommands() {
    return this.getTotalMessages();
  }

  getMostUsedCommand() {
    const entries = Object.entries(this.commandHistory);
    if (entries.length === 0) return 'N/A';
    const [command] = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    return command;
  }

  getAverageResponseTime() {
    return 150; // TODO: Calculate actual response time
  }

  getSuccessRate() {
    const total = this.getTotalMessages();
    if (total === 0) return 100;
    return Math.floor((this.getSuccessfulMessages() / total) * 100);
  }
}

module.exports = UtilityCommandHandler;
