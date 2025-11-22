/**
 * Interactive Message Handler
 * Handles button clicks, list selections, quick replies, and message reactions
 */

const chalk = require('chalk');

class InteractiveMessageHandler {
  constructor(bot, messageService) {
    this.bot = bot;
    this.messageService = messageService;
    this.messageHistory = new Map();
    this.userInteractions = new Map();
  }

  /**
   * Handle interactive button response
   */
  async handleButtonResponse(message, from, phoneNumber) {
    try {
      const buttonReply = message.message?.buttonResponseMessage;
      if (!buttonReply) return null;

      const selectedButtonId = buttonReply.selectedButtonId;
      const selectedDisplayText = buttonReply.selectedDisplayText;

      console.log(chalk.cyan(`📲 Button clicked: ${selectedDisplayText} by ${phoneNumber}`));

      // Store interaction
      this.storeInteraction(from, {
        type: 'button',
        buttonId: selectedButtonId,
        text: selectedDisplayText,
        timestamp: Date.now()
      });

      return {
        type: 'button',
        buttonId: selectedButtonId,
        displayText: selectedDisplayText
      };
    } catch (error) {
      console.error(chalk.red('Error handling button response:'), error.message);
      return null;
    }
  }

  /**
   * Handle interactive list selection
   */
  async handleListResponse(message, from, phoneNumber) {
    try {
      const listReply = message.message?.listResponseMessage;
      if (!listReply) return null;

      const selectedRowId = listReply.singleSelectReply?.selectedRowId;
      const selectedTitle = listReply.title;

      console.log(chalk.cyan(`📋 List item selected: ${selectedTitle} by ${phoneNumber}`));

      // Store interaction
      this.storeInteraction(from, {
        type: 'list',
        rowId: selectedRowId,
        title: selectedTitle,
        timestamp: Date.now()
      });

      return {
        type: 'list',
        rowId: selectedRowId,
        title: selectedTitle
      };
    } catch (error) {
      console.error(chalk.red('Error handling list response:'), error.message);
      return null;
    }
  }

  /**
   * Handle quote/reply messages
   */
  async handleQuoteMessage(message, from, phoneNumber) {
    try {
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quotedMessage) return null;

      const quotedText = this.getMessageText(quotedMessage);
      const quotedFrom = message.message?.extendedTextMessage?.contextInfo?.participant;

      console.log(chalk.cyan(`💬 Reply received to: "${quotedText}" from ${phoneNumber}`));

      // Store interaction
      this.storeInteraction(from, {
        type: 'reply',
        quotedText,
        quotedFrom,
        replyText: this.getMessageText(message.message),
        timestamp: Date.now()
      });

      return {
        type: 'reply',
        quotedText,
        quotedFrom,
        replyText: this.getMessageText(message.message)
      };
    } catch (error) {
      console.error(chalk.red('Error handling quote message:'), error.message);
      return null;
    }
  }

  /**
   * Handle message reactions
   */
  async handleMessageReaction(message, from, phoneNumber) {
    try {
      const reactionMessage = message.message?.reactionMessage;
      if (!reactionMessage) return null;

      const emoji = reactionMessage.text;
      const reactedToKey = reactionMessage.key;

      console.log(chalk.cyan(`😂 Reaction: ${emoji} from ${phoneNumber}`));

      // Store interaction
      this.storeInteraction(from, {
        type: 'reaction',
        emoji,
        reactedToKey,
        timestamp: Date.now()
      });

      return {
        type: 'reaction',
        emoji,
        reactedToKey
      };
    } catch (error) {
      console.error(chalk.red('Error handling message reaction:'), error.message);
      return null;
    }
  }

  /**
   * Handle mentions in group messages
   */
  async handleMentions(message, from, phoneNumber) {
    try {
      const text = this.getMessageText(message.message);
      const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

      if (mentions.length > 0) {
        console.log(chalk.cyan(`@mention received from ${phoneNumber}`));

        return {
          type: 'mention',
          text,
          mentions,
          timestamp: Date.now()
        };
      }

      return null;
    } catch (error) {
      console.error(chalk.red('Error handling mentions:'), error.message);
      return null;
    }
  }

  /**
   * Handle forward messages
   */
  async handleForwardedMessage(message, from, phoneNumber) {
    try {
      const isForwarded = message.message?.extendedTextMessage?.contextInfo?.isForwarded;
      
      if (!isForwarded) return null;

      const originalText = this.getMessageText(message.message);
      const fromJid = message.message?.extendedTextMessage?.contextInfo?.participant;

      console.log(chalk.cyan(`➡️  Forwarded message from ${phoneNumber}`));

      return {
        type: 'forward',
        originalText,
        forwardedFrom: fromJid,
        forwardedBy: phoneNumber,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(chalk.red('Error handling forwarded message:'), error.message);
      return null;
    }
  }

  /**
   * Create and send Interactive Button Message
   */
  async createButtonMessage(chatId, bodyText, buttons, headerText = '', footerText = '') {
    try {
      const buttonMessage = {
        text: bodyText,
        footer: footerText || 'Smart Bot',
        buttons: buttons.map((btn, idx) => ({
          buttonId: btn.id || `btn_${idx}`,
          buttonText: { displayText: btn.text },
          type: 1
        })),
        headerType: 1
      };

      if (headerText) {
        buttonMessage.header = { text: headerText };
      }

      await this.bot.sock.sendMessage(chatId, { buttonMessage });

      // Store message for tracking
      this.messageHistory.set(`${chatId}_button`, {
        type: 'button',
        buttons,
        sentAt: Date.now()
      });

      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error creating button message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create and send Interactive List Message
   */
  async createListMessage(chatId, bodyText, sections, buttonText = 'Select Option', footerText = '') {
    try {
      const listMessage = {
        text: bodyText,
        footer: footerText || 'Smart Bot',
        sections: sections.map(section => ({
          title: section.title,
          rows: section.rows.map((row, idx) => ({
            rowId: row.id || `row_${idx}`,
            title: row.title,
            description: row.description || '',
            rowImage: row.image || null
          }))
        })),
        buttonText
      };

      await this.bot.sock.sendMessage(chatId, { listMessage });

      // Store message for tracking
      this.messageHistory.set(`${chatId}_list`, {
        type: 'list',
        sections,
        sentAt: Date.now()
      });

      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error creating list message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Quick Reply Message
   */
  async createQuickReplyMessage(chatId, text, quickReplies) {
    try {
      // Quick replies are similar to buttons in WhatsApp
      const buttonMessage = {
        text,
        footer: 'Quick Replies',
        buttons: quickReplies.map((reply, idx) => ({
          buttonId: `reply_${idx}`,
          buttonText: { displayText: reply },
          type: 1
        }))
      };

      await this.bot.sock.sendMessage(chatId, { buttonMessage });

      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error creating quick reply:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Contact Card (vCard)
   */
  async createContactCard(chatId, contact) {
    try {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name || 'Contact'}
TEL;type=CELL;type=VOICE;waid=${contact.phone?.replace(/\D/g, '') || ''}:+${contact.phone || ''}
ORG:${contact.organization || ''}
EMAIL:${contact.email || ''}
URL:${contact.website || ''}
END:VCARD`;

      const contactMessage = {
        contacts: {
          displayName: contact.name || 'Contact',
          contacts: [{
            vcard
          }]
        }
      };

      await this.bot.sock.sendMessage(chatId, contactMessage);

      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error creating contact card:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * React to a message with an emoji
   */
  async reactToMessage(fromJid, messageKey, emoji = '😊') {
    try {
      await this.bot.sock.sendMessage(fromJid, {
        react: { text: emoji, key: messageKey }
      });

      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error reacting to message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Smart reaction based on command type
   */
  async smartReact(fromJid, messageKey, commandType) {
    const reactions = {
      'order': '✅',
      'payment': '💳',
      'error': '❌',
      'success': '✨',
      'wait': '⏳',
      'question': '❓',
      'info': 'ℹ️ ',
      'tech': '⚙️ ',
      'money': '💰',
      'delivery': '🚚',
      'inventory': '📦',
      'alert': '⚠️ '
    };

    const emoji = reactions[commandType] || '👍';
    return await this.reactToMessage(fromJid, messageKey, emoji);
  }

  /**
   * Handle Chat Modifications
   */
  async modifyChat(chatId, modifications) {
    try {
      // modifications: { archive: true/false, mute: duration, pin: true/false }
      await this.bot.sock.chatModify(modifications, chatId);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error modifying chat:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Star/Unstar a message
   */
  async starMessage(fromJid, messageKey, star = true) {
    try {
      await this.bot.sock.sendMessage(fromJid, {
        star: { key: messageKey, starred: star }
      });

      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error starring message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete message for everyone
   */
  async deleteMessageForEveryone(fromJid, messageKey) {
    try {
      await this.bot.sock.sendMessage(fromJid, { delete: messageKey });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error deleting message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Edit message text
   */
  async editMessageText(fromJid, newText, messageKey) {
    try {
      await this.bot.sock.sendMessage(fromJid, { text: newText, edit: messageKey });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error editing message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send presence update (typing/recording)
   */
  async setPresence(chatId, type = 'typing') {
    try {
      await this.bot.sock.sendPresenceUpdate(type, chatId);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error setting presence:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(chatId, messageKeys) {
    try {
      for (const key of messageKeys) {
        await this.bot.sock.sendReadReceipt(chatId, undefined, [key]);
      }
      return { success: true };
    } catch (error) {
      console.error(chalk.red('Error marking as read:'), error.message);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  getMessageText(messageContent) {
    if (messageContent?.conversation) return messageContent.conversation;
    if (messageContent?.extendedTextMessage) return messageContent.extendedTextMessage.text;
    if (messageContent?.imageMessage?.caption) return messageContent.imageMessage.caption;
    if (messageContent?.videoMessage?.caption) return messageContent.videoMessage.caption;
    return '';
  }

  storeInteraction(chatId, interaction) {
    if (!this.userInteractions.has(chatId)) {
      this.userInteractions.set(chatId, []);
    }
    
    const interactions = this.userInteractions.get(chatId);
    interactions.push(interaction);

    // Keep only last 100 interactions per chat
    if (interactions.length > 100) {
      interactions.shift();
    }
  }

  getInteractionHistory(chatId) {
    return this.userInteractions.get(chatId) || [];
  }

  getLastInteraction(chatId) {
    const interactions = this.getInteractionHistory(chatId);
    return interactions[interactions.length - 1] || null;
  }
}

module.exports = InteractiveMessageHandler;
