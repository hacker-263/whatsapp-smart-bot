/**
 * BOT API DOCUMENTATION
 * All endpoints for Dashboard - WhatsApp Bot synchronization
 */

const Express = require('express');

module.exports = {
  endpoints: {
    // ============ HEALTH & STATUS ============
    'GET /api/bot/health': {
      description: 'Check bot connection status and uptime',
      response: {
        status: 'connected | disconnected',
        uptime: 'number (seconds)',
        timestamp: 'ISO timestamp'
      },
      example: 'curl http://localhost:3001/api/bot/health'
    },

    // ============ MESSAGING ============
    'POST /api/bot/send-message': {
      description: 'Send message from dashboard to WhatsApp',
      body: {
        to: 'phone number or chat ID',
        message: 'string or object',
        type: 'text | button | list | template'
      },
      example: {
        to: '263771234567@s.whatsapp.net',
        message: 'Hello from dashboard!',
        type: 'text'
      }
    },

    'POST /api/bot/send-button': {
      description: 'Send interactive button message',
      body: {
        to: 'chat ID',
        header: 'header text',
        body: 'message text',
        buttons: [{ text: 'Button 1' }, { text: 'Button 2' }],
        footer: 'footer text'
      }
    },

    'POST /api/bot/send-list': {
      description: 'Send interactive list message',
      body: {
        to: 'chat ID',
        text: 'message text',
        sections: [
          {
            title: 'Section 1',
            rows: [
              { title: 'Item 1', description: 'Description' },
              { title: 'Item 2', description: 'Description' }
            ]
          }
        ],
        buttonText: 'Select Option'
      }
    },

    'POST /api/bot/send-contact': {
      description: 'Send contact card (vCard)',
      body: {
        to: 'chat ID',
        name: 'Contact name',
        phone: 'Phone number',
        email: 'Email address',
        organization: 'Organization name'
      }
    },

    // ============ CHAT MANAGEMENT ============
    'GET /api/bot/chats': {
      description: 'Get all active chats',
      response: [
        {
          id: 'chat ID',
          name: 'Chat name',
          isGroup: 'boolean',
          participants: 'number',
          lastMessage: 'string',
          unreadCount: 'number'
        }
      ]
    },

    'GET /api/bot/chats/:chatId': {
      description: 'Get specific chat details',
      params: { chatId: 'Chat ID' },
      response: {
        id: 'chat ID',
        messages: 'array of messages',
        participants: 'array of participant details'
      }
    },

    'POST /api/bot/chat/archive': {
      description: 'Archive a chat',
      body: { chatId: 'Chat ID', archive: 'true|false' }
    },

    'POST /api/bot/chat/mute': {
      description: 'Mute a chat',
      body: {
        chatId: 'Chat ID',
        duration: 'milliseconds (optional, 28800000 for 8 hours)'
      }
    },

    'POST /api/bot/chat/pin': {
      description: 'Pin or unpin a chat',
      body: { chatId: 'Chat ID', pin: 'true|false' }
    },

    // ============ MESSAGE OPERATIONS ============
    'POST /api/bot/message/react': {
      description: 'React to a message with emoji',
      body: {
        chatId: 'Chat ID',
        messageId: 'Message ID',
        emoji: 'Emoji character'
      }
    },

    'POST /api/bot/message/star': {
      description: 'Star or unstar a message',
      body: {
        chatId: 'Chat ID',
        messageId: 'Message ID',
        star: 'true|false'
      }
    },

    'POST /api/bot/message/delete': {
      description: 'Delete message for everyone',
      body: {
        chatId: 'Chat ID',
        messageId: 'Message ID'
      }
    },

    'POST /api/bot/message/edit': {
      description: 'Edit message text',
      body: {
        chatId: 'Chat ID',
        messageId: 'Message ID',
        newText: 'New message text'
      }
    },

    'POST /api/bot/message/forward': {
      description: 'Forward message to another chat',
      body: {
        fromChat: 'Source chat ID',
        messageId: 'Message ID to forward',
        toChat: 'Destination chat ID'
      }
    },

    // ============ BROADCAST ============
    'POST /api/bot/broadcast': {
      description: 'Send broadcast message to all chats',
      body: {
        message: 'Message text',
        type: 'text | button | list'
      },
      response: {
        success: 'boolean',
        sent: 'number of successful sends',
        failed: 'number of failed sends'
      }
    },

    'GET /api/bot/broadcasts': {
      description: 'Get broadcast history',
      query: {
        limit: 'number (default 20)',
        offset: 'number (default 0)'
      }
    },

    // ============ USER MANAGEMENT ============
    'POST /api/bot/block': {
      description: 'Block or unblock a user',
      body: {
        phoneNumber: 'Phone number to block/unblock',
        block: 'true|false'
      }
    },

    'GET /api/bot/blocked-users': {
      description: 'Get all blocked users'
    },

    'POST /api/bot/premium/add': {
      description: 'Add premium access to user',
      body: {
        phoneNumber: 'Phone number',
        days: 'number of days',
        tier: 'basic | pro | enterprise'
      }
    },

    'POST /api/bot/premium/remove': {
      description: 'Remove premium access from user',
      body: { phoneNumber: 'Phone number' }
    },

    'GET /api/bot/premium-users': {
      description: 'Get all premium users'
    },

    'POST /api/bot/user-limit': {
      description: 'Set daily command limit for user',
      body: {
        phoneNumber: 'Phone number',
        limit: 'number of commands per day'
      }
    },

    // ============ ADMIN OPERATIONS ============
    'POST /api/bot/admin/restart': {
      description: 'Restart the bot (owner only)',
      auth: 'ADMIN_PHONE required'
    },

    'POST /api/bot/admin/update': {
      description: 'Update bot from repository and restart (owner only)'
    },

    'POST /api/bot/admin/backup': {
      description: 'Create database backup',
      response: {
        success: 'boolean',
        backupPath: 'path to backup file',
        timestamp: 'when backup was created'
      }
    },

    'POST /api/bot/admin/restore': {
      description: 'Restore from backup',
      body: { backupId: 'ID of backup to restore' }
    },

    'POST /api/bot/admin/clearcache': {
      description: 'Clear all caches'
    },

    'POST /api/bot/admin/eval': {
      description: 'Execute JavaScript code (DANGER - Owner only)',
      body: { code: 'JavaScript code to execute' }
    },

    'POST /api/bot/admin/exec': {
      description: 'Execute shell command (DANGER - Owner only)',
      body: { command: 'Shell command to execute' }
    },

    // ============ STATISTICS ============
    'GET /api/bot/stats': {
      description: 'Get bot statistics',
      response: {
        totalChats: 'number',
        blockedUsers: 'number',
        premiumUsers: 'number',
        uptime: 'seconds',
        memoryUsage: 'object with heapUsed, heapTotal, etc',
        timestamp: 'ISO timestamp'
      }
    },

    'GET /api/bot/command-logs': {
      description: 'Get command execution logs',
      query: {
        phone: 'filter by phone number',
        command: 'filter by command',
        limit: 'number (default 50)',
        offset: 'number (default 0)'
      }
    },

    'GET /api/bot/starred-messages': {
      description: 'Get starred/pinned messages',
      query: {
        category: 'filter by category (order, payment, etc)',
        limit: 'number (default 20)',
        offset: 'number (default 0)'
      }
    },

    // ============ TEMPLATES ============
    'GET /api/bot/templates': {
      description: 'Get available message templates'
    },

    'POST /api/bot/template/send': {
      description: 'Send pre-approved WhatsApp template message',
      body: {
        to: 'chat ID',
        templateName: 'template name',
        parameters: 'array of values'
      }
    },

    // ============ PRESENCE & TYPING ============
    'POST /api/bot/presence': {
      description: 'Set typing/recording presence',
      body: {
        chatId: 'Chat ID',
        type: 'typing | recording | paused'
      }
    },

    'POST /api/bot/read-receipt': {
      description: 'Mark messages as read',
      body: {
        chatId: 'Chat ID',
        messageIds: 'array of message IDs'
      }
    }
  },

  // Authentication
  auth: {
    type: 'Bearer Token or Custom Header',
    header: 'Authorization: Bearer <token> or X-API-Key: <key>',
    note: 'Admin operations require ADMIN_PHONE environment variable'
  },

  // Rate Limiting
  rateLimits: {
    default: '100 requests per 15 minutes',
    broadcast: '5 requests per minute',
    adminOps: '10 requests per minute',
    messaging: '50 requests per minute'
  },

  // Error Responses
  errors: {
    400: { message: 'Bad Request', cause: 'Invalid parameters' },
    401: { message: 'Unauthorized', cause: 'Missing or invalid auth' },
    403: { message: 'Forbidden', cause: 'Insufficient permissions' },
    404: { message: 'Not Found', cause: 'Resource does not exist' },
    429: { message: 'Too Many Requests', cause: 'Rate limit exceeded' },
    500: { message: 'Internal Server Error', cause: 'Server error' }
  },

  // Usage Examples
  examples: {
    sendTextMessage: `
curl -X POST http://localhost:3001/api/bot/send-message \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "to": "263771234567@s.whatsapp.net",
    "message": "Hello from dashboard!",
    "type": "text"
  }'
    `,

    sendButtonMessage: `
curl -X POST http://localhost:3001/api/bot/send-button \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "263771234567@s.whatsapp.net",
    "header": "Choose an action",
    "body": "What would you like to do?",
    "buttons": [
      { "text": "Order" },
      { "text": "Check Status" },
      { "text": "Help" }
    ],
    "footer": "Smart Bot"
  }'
    `,

    broadcast: `
curl -X POST http://localhost:3001/api/bot/broadcast \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "🎉 New products available!",
    "type": "text"
  }'
    `,

    blockUser: `
curl -X POST http://localhost:3001/api/bot/block \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "263771234567",
    "block": true
  }'
    `
  }
};
