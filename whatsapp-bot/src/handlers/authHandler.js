/**
 * Authentication & General Commands Handler
 * Handles register, login, help, profile
 */

const backendAPI = require('../api/backendAPI');
const authMiddleware = require('../middlewares/auth');
const cache = require('../database/cache');
const MessageFormatter = require('../utils/messageFormatter');
const commandParser = require('../utils/commandParser');
const Logger = require('../config/logger');
const constants = require('../config/constants');

const logger = new Logger('AuthHandler');

class AuthHandler {
  /**
   * Handle general/auth commands
   */
  async handleAuthCommand(command, args, from, phoneNumber) {
    try {
      // Add to command history
      await cache.addCommandHistory(phoneNumber, command);

      switch (command) {
        case 'register':
          return await this.handleRegisterCommand(args, from, phoneNumber);
        
        case 'login':
          return await this.handleLoginCommand(args, from, phoneNumber);
        
        case 'logout':
          return await this.handleLogoutCommand(from, phoneNumber);
        
        case 'profile':
          return await this.handleProfileCommand(from, phoneNumber);
        
        case 'help':
          return await this.handleHelpCommand(args, from, phoneNumber);
        
        case 'verify':
          return await this.handleVerifyCommand(args, from, phoneNumber);
        
        case 'owner':
          return await this.handleOwnerCommand(from, phoneNumber);
        
        case 'about':
          return await this.handleAboutCommand(from, phoneNumber);
        
        case 'feedback':
          return await this.handleFeedbackCommand(args.join(' '), from, phoneNumber);
        
        case 'stats':
          return await this.handleStatsCommand(from, phoneNumber);
        
        default:
          return null;
      }
    } catch (error) {
      logger.error('Auth command error', error);
      return { error: error.message };
    }
  }

  /**
   * !register [name] [role]
   * Example: !register John customer
   */
  async handleRegisterCommand(args, from, phoneNumber) {
    // Check if already registered
    const existing = await cache.getUserSession(phoneNumber);
    if (existing) {
      return { error: 'You are already registered. Type !login to continue.' };
    }

    if (!args[0]) {
      return {
        message: `
╔════════════════════════════════════════════════╗
║ 👋  WELCOME TO SMART WHATSAPP BOT!
╠════════════════════════════════════════════════╣
║
║ Let's get you set up! 📝
║
║ Please tell us your name:
║ (Reply with just your name)
║
╚════════════════════════════════════════════════╝
        `,
        flowActive: true,
      };
    }

    const name = args.slice(0, -1).join(' ') || args[0];
    const role = args[args.length - 1].toLowerCase() || 'customer';

    if (!['customer', 'merchant'].includes(role)) {
      return { error: 'Invalid role. Choose: *customer* or *merchant*' };
    }

    // Send registration request to backend
    const response = await backendAPI.registerUser(phoneNumber, name, role);

    if (!response.success) {
      return { error: `Registration failed: ${response.error}` };
    }

    const user = response.data;

    // Save session
    await cache.setUserSession(phoneNumber, {
      ...user,
      registered_at: new Date().toISOString(),
    });

    let message = role === 'merchant' ? `
╔════════════════════════════════════════════════╗
║ 🎉  WELCOME TO OUR MERCHANT COMMUNITY!
╠════════════════════════════════════════════════╣
║
║ Hello ${name}! 👋
║
║ Your merchant account has been created! 🏪
║
║ 📋 NEXT STEPS:
║ ┌──────────────────────────────────────────┐
║ │ 1. We'll review your application         │
║ │ 2. You'll receive approval notification  │
║ │ 3. Then you can add products & orders    │
║ │ 4. Start making sales! 💰                │
║ └──────────────────────────────────────────┘
║
║ 🔐 Verify your account with OTP:
║ (Check your registered email/phone)
║
║ Questions? Type !help
║
╚════════════════════════════════════════════════╝
    ` : `
╔════════════════════════════════════════════════╗
║ 🎉  WELCOME TO SMART WHATSAPP BOT!
╠════════════════════════════════════════════════╣
║
║ Hello ${name}! 👋
║
║ You're all set up as a customer! 🛒
║
║ 🚀 START SHOPPING NOW:
║ ┌──────────────────────────────────────────┐
║ │ !menu        📋 Browse all products      │
║ │ !search xyz  🔎 Search for items        │
║ │ !categories  📂 View categories          │
║ │ !nearby      📍 See stores near you      │
║ │ !deals       🎉 Check out deals         │
║ └──────────────────────────────────────────┘
║
║ 💡 TIP: Add items to cart with !add
║ Then checkout with !checkout
║
║ Need help? Type !help
║
╚════════════════════════════════════════════════╝
    `;

    return { message: message.trim() };
  }

  /**
   * !login
   */
  async handleLoginCommand(args, from, phoneNumber) {
    const existing = await cache.getUserSession(phoneNumber);
    if (existing?.authenticated) {
      return { message: `Welcome back ${existing.name}! You're already logged in.` };
    }

    // Send OTP
    const response = await backendAPI.sendOTP(phoneNumber);

    if (!response.success) {
      return { error: 'Failed to send OTP. Please try again.' };
    }

    // Store login flow state
    await cache.setUserSession(phoneNumber, {
      loginFlow: true,
      sentAt: new Date().toISOString(),
    });

    return {
      message: `📱 *OTP Sent*\n\nCheck your WhatsApp for the verification code.\nReply with: !verify <code>`,
      flowActive: true,
    };
  }

  /**
   * !verify <otp_code>
   */
  async handleVerifyCommand(args, from, phoneNumber) {
    if (!args[0]) {
      return { error: 'Usage: !verify <otp_code>' };
    }

    const otp = args[0];

    // Verify with backend
    const response = await backendAPI.loginUser(phoneNumber, otp);

    if (!response.success) {
      return { error: 'Invalid OTP. Please try again or request a new one.' };
    }

    const user = response.data;

    // Save authenticated session
    await cache.setUserSession(phoneNumber, {
      ...user,
      authenticated: true,
      authenticatedAt: new Date().toISOString(),
    });

    logger.success(`User authenticated: ${phoneNumber}`);

    let message = `✅ *Login Successful*\n\n`;
    message += `Welcome ${user.name}!\n\n`;
    message += `Role: ${user.role === 'admin' ? '👨‍💼 Admin' : user.role === 'merchant' ? '🏪 Merchant' : '🛍️ Customer'}\n\n`;

    if (user.role === 'admin') {
      message += `Type *!help* to see admin commands`;
    } else if (user.role === 'merchant') {
      message += `Type *!help* to see merchant commands`;
    } else {
      message += `Type *!help* to see customer commands`;
    }

    return { message };
  }

  /**
   * !logout
   */
  async handleLogoutCommand(from, phoneNumber) {
    await cache.setUserSession(phoneNumber, { authenticated: false });
    return { message: '✅ Logged out successfully!' };
  }

  /**
   * !profile
   */
  async handleProfileCommand(from, phoneNumber) {
    const session = await cache.getUserSession(phoneNumber);

    if (!session?.authenticated) {
      return { message: 'Please login first with !login' };
    }

    let message = `*👤 Your Profile*\n━━━━━━━━━━━━━━━\n\n`;
    message += `Name: ${session.name}\n`;
    message += `Phone: ${phoneNumber}\n`;
    message += `Role: ${session.role}\n`;
    message += `Status: ${session.status || 'Active'}\n`;

    if (session.role === 'merchant') {
      message += `\nBusiness: ${session.business_name || 'N/A'}\n`;
      message += `Category: ${session.category || 'N/A'}\n`;
      message += `Approval: ${session.approval_status || 'Pending'}\n`;
    }

    message += `\nJoined: ${new Date(session.authenticated_at).toLocaleDateString()}\n`;

    return { message };
  }

  /**
   * !help [command]
   */
  async handleHelpCommand(args, from, phoneNumber) {
    const session = await cache.getUserSession(phoneNumber);
    const role = session?.role || 'customer';

    if (args[0]) {
      return { message: this.getCommandHelp(args[0]) };
    }

    // Show role-based menu
    return { message: MessageFormatter.formatMenu(role) };
  }

  /**
   * Get detailed help for specific command
   */
  getCommandHelp(command) {
    const helps = {
      register: `
*!register*
Sign up as a customer or merchant

Usage: !register [name] [role]
Example: !register John customer

Roles: customer, merchant
      `.trim(),

      login: `
*!login*
Log in to your account

Usage: !login
You'll receive an OTP code to verify
      `.trim(),

      menu: `
*!menu*
Browse all available products

Usage: !menu or !m
Shows product list with prices
      `.trim(),

      search: `
*!search*
Find products by name

Usage: !search <query>
Example: !search pizza
      `.trim(),

      add: `
*!add*
Add items to your shopping cart

Usage: !add <product_id> <quantity>
Example: !add prod123 2
      `.trim(),

      cart: `
*!cart*
View your shopping cart

Usage: !cart or !c
Shows items, prices, and total
      `.trim(),

      checkout: `
*!checkout*
Place your order

Usage: !checkout or !pay
Submits your cart as an order
      `.trim(),

      track: `
*!track*
Track your order status

Usage: !track <order_id>
Shows current order status
      `.trim(),

      owner: `
*!owner*
Get contact information of the bot owner

Usage: !owner
Displays owner contact and details
      `.trim(),

      about: `
*!about*
Learn about Smart WhatsApp Bot

Usage: !about
Shows platform information and features
      `.trim(),

      feedback: `
*!feedback*
Send feedback or report issues

Usage: !feedback <your message>
Example: !feedback The app is amazing!
      `.trim(),

      stats: `
*!stats*
View platform statistics

Usage: !stats
Shows user count, orders, revenue, etc.
      `.trim(),
    };

    return helps[command] || `❌ Command not found: ${command}`;
  }

  /**
   * !owner - Get owner contact information
   */
  async handleOwnerCommand(from, phoneNumber) {
    return {
      message: `
╔══════════════════════════════════════════════════════════════════════╗
║ 👨‍💼  BOT OWNER - CONTACT INFORMATION
╠══════════════════════════════════════════════════════════════════════╣
║
║ 🎯 Name:           *Hxcker-263*
║ 📱 WhatsApp:       *+263781564004*
║ 💼 Role:           Platform Developer & Owner
║ 🌐 Specialty:      WhatsApp Commerce Solutions
║
╠══════════════════════════════════════════════════════════════════════╣
║ 📞 QUICK CONTACT
║ ┌──────────────────────────────────────────────────────────────────┐
║ │ Click here to chat: wa.me/263781564004                           │
║ │ Available: 24/7 for business inquiries and support               │
║ └──────────────────────────────────────────────────────────────────┘
║
╠══════════════════════════════════════════════════════════════════════╣
║ 💡 SERVICES OFFERED
║ ┌──────────────────────────────────────────────────────────────────┐
║ │ • 🤖 WhatsApp Bot Development & Customization                   │
║ │ • 🏪 E-commerce Solutions & Integration                         │
║ │ • 📊 Business Analytics & Reporting                             │
║ │ • 🔗 API Integration & Automation                               │
║ │ • ⚙️  Custom Automation & Workflows                             │
║ │ • 🚀 Deployment & Hosting Solutions                            │
║ └──────────────────────────────────────────────────────────────────┘
║
╠══════════════════════════════════════════════════════════════════════╣
║ 🏆 ACHIEVEMENTS
║ ├─ 2,500+ Active Users
║ ├─ 187 Merchants Onboarded
║ ├─ 8,900+ Successful Orders
║ ├─ 99.9% Platform Uptime
║ └─ Serving Zimbabwe & Beyond
║
╚══════════════════════════════════════════════════════════════════════╝

💬 Feel free to reach out for collaboration, support, or inquiries!
      `.trim(),
      contact: {
        name: 'Hxcker-263',
        phone: '+263781564004',
      }
    };
  }

  /**
   * !about - Platform information
   */
  async handleAboutCommand(from, phoneNumber) {
    return {
      message: `
╔══════════════════════════════════════════════════════════════════════╗
║ ℹ️  ABOUT SMART WHATSAPP BOT
╠══════════════════════════════════════════════════════════════════════╣
║
║ 🚀 Platform:       Smart E-Commerce Bot
║ 📱 Channel:        WhatsApp Messaging
║ 🌍 Region:         Zimbabwe & Beyond
║ 💡 Purpose:        Connect Customers & Merchants Seamlessly
║
╠══════════════════════════════════════════════════════════════════════╣
║ ✨ CORE FEATURES
║ ┌──────────────────────────────────────────────────────────────────┐
║ │ 🛍️  Smart Shopping & Browse Products                            │
║ │ 🔍 Intelligent Search & Discovery                               │
║ │ 🏪 Multi-Merchant Support                                       │
║ │ 💳 Seamless Checkout Process                                    │
║ │ 📦 Real-time Order Tracking                                     │
║ │ ⭐ Ratings & Reviews System                                     │
║ │ 📊 Merchant Analytics Dashboard                                 │
║ │ 🔔 Instant Notifications                                        │
║ └──────────────────────────────────────────────────────────────────┘
║
╠══════════════════════════════════════════════════════════════════════╣
║ 👥 SUPPORTED USERS
║ • 🛍️ Customers - Shop anytime, anywhere
║ • 🏪 Merchants - Manage store & sales efficiently
║ • 👨‍💼 Admins - Oversee entire platform
║
╠══════════════════════════════════════════════════════════════════════╣
║ 🎯 OUR VISION
║ Making e-commerce accessible via WhatsApp for everyone!
║ Empowering businesses through smart technology.
║
║ Type !owner to get in touch with the developer
║
╚══════════════════════════════════════════════════════════════════════╝
      `.trim()
    };
  }

  /**
   * !feedback <message> - Send feedback
   */
  async handleFeedbackCommand(message, from, phoneNumber) {
    if (!message) {
      return {
        message: `
╔══════════════════════════════════════════════════════════════════════╗
║ 💬  SEND US YOUR FEEDBACK
╠══════════════════════════════════════════════════════════════════════╣
║
║ We'd love to hear from you! Your feedback helps us improve.
║
║ 📝 Usage: !feedback <your message>
║
║ 📌 Examples:
║    !feedback The bot is amazing and easy to use!
║    !feedback I found a bug in the search feature
║    !feedback Can you add a wishlist feature?
║
║ 💡 Tips:
║    • Be specific and descriptive
║    • Tell us what could be improved
║    • Share your ideas and suggestions
║
╚══════════════════════════════════════════════════════════════════════╝
        `.trim()
      };
    }

    // Save feedback to cache
    await cache.addCommandHistory(phoneNumber, `feedback: ${message}`);

    return {
      message: `
╔══════════════════════════════════════════════════════════════════════╗
║ ✅  THANK YOU FOR YOUR FEEDBACK!
╠══════════════════════════════════════════════════════════════════════╣
║
║ Your feedback has been recorded! 🎉
║
║ 📝 Message:
║ "${message}"
║
║ ✍️ We'll review it and improve the platform.
║ 💌 Thanks for using Smart WhatsApp Bot! 💙
║
║ Have more suggestions? Send !feedback again!
║
╚══════════════════════════════════════════════════════════════════════╝
      `.trim()
    };
  }

  /**
   * !stats - Show platform statistics
   */
  async handleStatsCommand(from, phoneNumber) {
    // Dummy statistics (replace with actual data from backend)
    const stats = {
      totalUsers: 2543,
      totalMerchants: 187,
      totalOrders: 8934,
      totalRevenue: 245600,
      avgOrderValue: 27.5,
      activeNow: 342,
      avgRating: 4.8,
      topCategory: 'Fresh Food',
      topMerchant: 'Local Mart',
      monthlyGrowth: 15,
    };

    return {
      message: `
╔══════════════════════════════════════════════════════════════════════╗
║ 📊  PLATFORM STATISTICS
╠══════════════════════════════════════════════════════════════════════╣
║
║ 👥 USERS
║ ┌──────────────────────────────────────────────────────────────────┐
║ │ Total Users:           ${String(stats.totalUsers).padEnd(30)} 👥
║ │ Active Merchants:      ${String(stats.totalMerchants).padEnd(30)} 🏪
║ │ Active Right Now:      ${String(stats.activeNow + ' 🟢').padEnd(30)}
║ └──────────────────────────────────────────────────────────────────┘
║
║ 📦 ORDERS & SALES
║ ┌──────────────────────────────────────────────────────────────────┐
║ │ Total Orders:          ${String(stats.totalOrders.toLocaleString()).padEnd(27)} 📦
║ │ Total Revenue:         ZWL ${String(stats.totalRevenue.toLocaleString()).padEnd(27)}
║ │ Average Order Value:   ZWL ${String(stats.avgOrderValue).padEnd(27)}
║ └──────────────────────────────────────────────────────────────────┘
║
║ 📈 INSIGHTS
║ ├─ Growth Trend:        ↗️  ${stats.monthlyGrowth}% this month
║ ├─ Average Rating:      ⭐ ${stats.avgRating}/5.0
║ ├─ Top Category:        ${stats.topCategory} 🌟
║ └─ Top Merchant:        ${stats.topMerchant} 👑
║
╚══════════════════════════════════════════════════════════════════════╝
      `.trim()
    };
  }
}

module.exports = new AuthHandler();
