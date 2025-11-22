/**
 * Message Service
 * Handles all message types: buttons, lists, templates, reactions, etc.
 */

const chalk = require('chalk');

class MessageService {
  constructor(socket) {
    this.sock = socket;
  }

  /**
   * Send Interactive Button Message
   * @param {string} chatId - Recipient chat ID
   * @param {string} headerText - Header text
   * @param {string} bodyText - Body text
   * @param {array} buttons - Array of button objects
   * @param {string} footerText - Footer text (optional)
   */
  async sendButtonMessage(chatId, headerText, bodyText, buttons, footerText = '') {
    try {
      const buttonMessage = {
        text: bodyText,
        footer: footerText || 'Smart Bot',
        buttons: buttons.map((btn, idx) => ({
          buttonId: `btn_${idx}`,
          buttonText: { displayText: btn.text },
          type: 1
        })),
        headerType: 1
      };

      await this.sock.sendMessage(chatId, buttonMessage, { quoted: null });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending button message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Interactive List Message
   * @param {string} chatId - Recipient chat ID
   * @param {string} buttonText - Button text to show
   * @param {string} bodyText - Body text
   * @param {string} footerText - Footer text
   * @param {array} sections - Array of section objects
   */
  async sendListMessage(chatId, buttonText, bodyText, footerText, sections) {
    try {
      const listMessage = {
        text: bodyText,
        footer: footerText,
        sections: sections.map(section => ({
          title: section.title,
          rows: section.rows.map((row, idx) => ({
            rowId: `row_${idx}`,
            title: row.title,
            description: row.description || '',
            rowImage: row.image || null
          }))
        })),
        buttonText: buttonText || 'Select Option',
        title: 'Menu'
      };

      await this.sock.sendMessage(chatId, { listMessage }, { quoted: null });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending list message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Template Message
   * @param {string} chatId - Recipient chat ID
   * @param {string} templateName - Template name
   * @param {array} parameters - Parameters for template
   */
  async sendTemplateMessage(chatId, templateName, parameters = []) {
    try {
      const templateMessage = {
        text: `Template: ${templateName}`,
        templateButtons: parameters.map((param, idx) => ({
          index: idx,
          urlButton: {
            displayText: param.displayText,
            url: param.url
          }
        }))
      };

      await this.sock.sendMessage(chatId, templateMessage);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending template message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Contact Card (vCard)
   * @param {string} chatId - Recipient chat ID
   * @param {object} contact - Contact object with name, phone, email, organization
   */
  async sendContactCard(chatId, contact) {
    try {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contact.name || 'Bot Support'}
TEL;type=CELL;type=VOICE;waid=${contact.phone?.replace(/\D/g, '') || ''}:+${contact.phone || ''}
ORG:${contact.organization || 'Smart Bot'}
EMAIL:${contact.email || 'support@bot.com'}
END:VCARD`;

      const contactMessage = {
        contacts: {
          displayName: contact.name || 'Contact',
          contacts: [
            {
              vcard: vcard
            }
          ]
        }
      };

      await this.sock.sendMessage(chatId, contactMessage);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending contact card:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Text Message
   * @param {string} chatId - Recipient chat ID
   * @param {string} text - Message text
   * @param {boolean} parseLinks - Whether to parse links
   */
  async sendTextMessage(chatId, text, parseLinks = true) {
    try {
      await this.sock.sendMessage(chatId, { text }, { parseLinks });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending text message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Message with Quote/Reply
   * @param {string} chatId - Recipient chat ID
   * @param {string} text - Message text
   * @param {object} quotedMessage - Message to quote
   */
  async sendReplyMessage(chatId, text, quotedMessage) {
    try {
      await this.sock.sendMessage(chatId, { text }, { quoted: quotedMessage });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending reply message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * React to Message
   * @param {string} chatId - Recipient chat ID
   * @param {string} messageKey - Message key to react to
   * @param {string} emoji - Emoji reaction
   */
  async reactToMessage(chatId, messageKey, emoji) {
    try {
      await this.sock.sendMessage(chatId, {
        react: { text: emoji, key: messageKey }
      });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error reacting to message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete Message (for everyone)
   * @param {string} chatId - Recipient chat ID
   * @param {object} messageKey - Message key to delete
   */
  async deleteMessage(chatId, messageKey) {
    try {
      await this.sock.sendMessage(chatId, { delete: messageKey });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error deleting message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Edit Message Text
   * @param {string} chatId - Recipient chat ID
   * @param {string} newText - New message text
   * @param {object} messageKey - Message key to edit
   */
  async editMessage(chatId, newText, messageKey) {
    try {
      await this.sock.sendMessage(chatId, { text: newText, edit: messageKey });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error editing message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Forward Message
   * @param {string} toChat - Destination chat ID
   * @param {object} message - Message to forward
   */
  async forwardMessage(toChat, message) {
    try {
      await this.sock.sendMessage(toChat, message);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error forwarding message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send Mention in Group
   * @param {string} chatId - Group chat ID
   * @param {string} text - Message text
   * @param {array} mentions - Array of phone numbers to mention
   */
  async sendMentionMessage(chatId, text, mentions = []) {
    try {
      const mentionedJids = mentions.map(phone => phone.replace(/\D/g, '') + '@s.whatsapp.net');
      await this.sock.sendMessage(chatId, { text, mentions: mentionedJids });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error sending mention message:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set Presence (Recording, Typing)
   * @param {string} chatId - Chat ID
   * @param {string} type - 'recording' or 'typing'
   */
  async setPresence(chatId, type = 'typing') {
    try {
      await this.sock.sendPresenceUpdate(type, chatId);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error setting presence:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Read Receipt
   * @param {string} chatId - Chat ID
   * @param {array} messageKeys - Message keys to mark as read
   */
  async markAsRead(chatId, messageKeys) {
    try {
      for (const key of messageKeys) {
        await this.sock.sendReadReceipt(chatId, undefined, [key]);
      }
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error marking as read:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Archive Chat
   * @param {string} chatId - Chat ID
   */
  async archiveChat(chatId) {
    try {
      await this.sock.chatModify({ archive: true }, chatId);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error archiving chat:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mute Chat
   * @param {string} chatId - Chat ID
   * @param {number} duration - Duration in milliseconds
   */
  async muteChat(chatId, duration = 28800000) {
    try {
      await this.sock.chatModify({ mute: duration }, chatId);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error muting chat:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Pin Chat
   * @param {string} chatId - Chat ID
   * @param {boolean} pin - Whether to pin or unpin
   */
  async pinChat(chatId, pin = true) {
    try {
      await this.sock.chatModify({ pin }, chatId);
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error pinning chat:'), error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Star Message
   * @param {object} message - Message object
   * @param {boolean} star - Whether to star or unstar
   */
  async starMessage(message, star = true) {
    try {
      await this.sock.sendMessage(message.key.remoteJid, {
        star: { key: message.key, starred: star }
      });
      return { success: true };
    } catch (error) {
      console.error(chalk.red('❌ Error starring message:'), error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MessageService;
