/**
 * Message Template Engine
 * Handles template rendering, variables, and WhatsApp format conversion
 */

const Logger = require('../config/logger');

const logger = new Logger('TemplateEngine');

class TemplateEngine {
  /**
   * Render template with variables
   * Example: "Hello {{name}}, your order {{order_id}} is {{status}}"
   */
  static render(template, variables = {}) {
    try {
      let rendered = template.body || template;

      // Find all {{variable}} patterns
      const variablePattern = /\{\{([^}]+)\}\}/g;

      rendered = rendered.replace(variablePattern, (match, key) => {
        const trimmedKey = key.trim();
        return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
      });

      return rendered;
    } catch (error) {
      logger.error('Template render error', error);
      return template;
    }
  }

  /**
   * Extract variable names from template
   */
  static extractVariables(template) {
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;

    while ((match = variablePattern.exec(template)) !== null) {
      variables.push(match[1].trim());
    }

    return [...new Set(variables)]; // Remove duplicates
  }

  /**
   * Convert template to WhatsApp button format
   */
  static toWhatsAppButtons(template) {
    if (!template.buttons || template.buttons.length === 0) {
      return null;
    }

    return {
      text: template.body,
      buttons: template.buttons.slice(0, 3).map((btn) => ({
        buttonId: btn.id || `btn_${Date.now()}`,
        buttonText: { displayText: btn.label },
        type: 1,
      })),
      headerType: 1,
    };
  }

  /**
   * Convert template to WhatsApp list format
   */
  static toWhatsAppList(template) {
    if (!template.sections || template.sections.length === 0) {
      return null;
    }

    return {
      text: template.body,
      footer: template.footer || 'Smart WhatsApp Bot',
      title: template.title || 'Menu',
      buttonText: template.buttonText || 'View Options',
      sections: template.sections.map((section) => ({
        title: section.title,
        rows: (section.rows || []).map((row) => ({
          rowId: row.id || `row_${Date.now()}`,
          title: row.title,
          description: row.description || '',
        })),
      })),
    };
  }

  /**
   * Convert template to WhatsApp media format
   */
  static toWhatsAppMedia(template) {
    if (!template.media) {
      return null;
    }

    const mediaType = template.media.type || 'image';

    return {
      [mediaType]: {
        url: template.media.url,
      },
      caption: template.body,
      ...(template.buttons && {
        buttons: template.buttons.slice(0, 2),
      }),
    };
  }

  /**
   * Get WhatsApp JSON payload
   */
  static getPayload(template, variables = {}, format = 'text') {
    const rendered = this.render(template, variables);

    switch (format) {
      case 'buttons':
        return {
          text: rendered,
          buttons: template.buttons || [],
        };

      case 'list':
        return this.toWhatsAppList({ ...template, body: rendered });

      case 'media':
        return this.toWhatsAppMedia({ ...template, body: rendered });

      case 'text':
      default:
        return { text: rendered };
    }
  }

  /**
   * Validate template structure
   */
  static validate(template) {
    const errors = [];

    if (!template.name) errors.push('Template must have a name');
    if (!template.body) errors.push('Template must have a body');
    if (!template.type) errors.push('Template must have a type');

    if (!['text', 'buttons', 'list', 'media'].includes(template.type)) {
      errors.push('Invalid template type');
    }

    if (template.type === 'buttons' && (!template.buttons || template.buttons.length === 0)) {
      errors.push('Button template must have buttons');
    }

    if (template.type === 'list' && (!template.sections || template.sections.length === 0)) {
      errors.push('List template must have sections');
    }

    if (template.type === 'media' && !template.media) {
      errors.push('Media template must have media');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = TemplateEngine;
