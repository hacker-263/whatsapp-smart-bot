/**
 * Webhook Manager for Bot Events
 * Handles incoming webhook notifications from the bot
 * Emits events for real-time frontend updates via WebSocket/SSE
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const Logger = require('../config/logger');

class WebhookManager extends EventEmitter {
  constructor() {
    super();
    this.logger = Logger;
    this.webhookSecrets = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Register a webhook secret for HMAC verification
   */
  registerWebhookSecret(merchantId, secret) {
    this.webhookSecrets.set(merchantId, secret);
    this.logger.debug(`Webhook secret registered for merchant: ${merchantId}`);
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature, merchantId) {
    const secret = this.webhookSecrets.get(merchantId);
    
    if (!secret) {
      this.logger.warn(`No webhook secret for merchant: ${merchantId}`);
      return false;
    }

    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const verified = hash === signature;
    
    if (!verified) {
      this.logger.warn(`Invalid signature for merchant: ${merchantId}`);
    }

    return verified;
  }

  /**
   * Handle incoming webhook events from the bot
   */
  async handleWebhookEvent(eventType, payload, merchantId) {
    try {
      this.logger.debug(`Webhook event: ${eventType} from merchant: ${merchantId}`);

      // Store in history
      this.recordEvent({
        type: eventType,
        payload,
        merchantId,
        timestamp: new Date().toISOString(),
      });

      // Process different event types
      switch (eventType) {
        case 'message_received':
          await this.handleMessageReceived(payload, merchantId);
          break;

        case 'message_sent':
          await this.handleMessageSent(payload, merchantId);
          break;

        case 'order_created':
          await this.handleOrderCreated(payload, merchantId);
          break;

        case 'order_status_changed':
          await this.handleOrderStatusChanged(payload, merchantId);
          break;

        case 'product_updated':
          await this.handleProductUpdated(payload, merchantId);
          break;

        case 'payment_received':
          await this.handlePaymentReceived(payload, merchantId);
          break;

        case 'delivery_started':
          await this.handleDeliveryStarted(payload, merchantId);
          break;

        case 'delivery_completed':
          await this.handleDeliveryCompleted(payload, merchantId);
          break;

        case 'bot_connected':
          await this.handleBotConnected(payload, merchantId);
          break;

        case 'bot_disconnected':
          await this.handleBotDisconnected(payload, merchantId);
          break;

        default:
          this.logger.warn(`Unknown event type: ${eventType}`);
      }

      // Emit to all subscribers
      this.emit('webhook_event', { eventType, payload, merchantId });

      return { success: true, processed: true };
    } catch (error) {
      this.logger.error(`Webhook event processing error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Event Handlers
   */

  async handleMessageReceived(payload, merchantId) {
    const { messageId, fromPhone, text, timestamp } = payload;

    this.logger.debug(`Message received from ${fromPhone}`);

    // Emit for frontend listening
    this.emit('message_received', {
      messageId,
      fromPhone,
      text,
      timestamp,
      merchantId,
    });

    // Could trigger auto-responses, ML processing, etc.
  }

  async handleMessageSent(payload, merchantId) {
    const { messageId, toPhone, text, templateId } = payload;

    this.logger.debug(`Message sent to ${toPhone}`);

    this.emit('message_sent', {
      messageId,
      toPhone,
      text,
      templateId,
      merchantId,
      sentAt: new Date().toISOString(),
    });
  }

  async handleOrderCreated(payload, merchantId) {
    const { orderId, customerId, items, totalAmount } = payload;

    this.logger.debug(`Order created: ${orderId}`);

    this.emit('order_created', {
      orderId,
      customerId,
      items,
      totalAmount,
      merchantId,
      createdAt: new Date().toISOString(),
    });

    // Trigger order processing job
    // await jobQueue.queueOrderProcessing(orderId, payload);
  }

  async handleOrderStatusChanged(payload, merchantId) {
    const { orderId, oldStatus, newStatus, updatedAt } = payload;

    this.logger.debug(`Order ${orderId}: ${oldStatus} → ${newStatus}`);

    this.emit('order_status_changed', {
      orderId,
      oldStatus,
      newStatus,
      merchantId,
      updatedAt,
    });

    // Send notification to customer
    // Could be SMS, email, or another WhatsApp message
  }

  async handleProductUpdated(payload, merchantId) {
    const { productId, name, price, stock, mediaIds } = payload;

    this.logger.debug(`Product updated: ${productId}`);

    this.emit('product_updated', {
      productId,
      name,
      price,
      stock,
      mediaIds,
      merchantId,
      updatedAt: new Date().toISOString(),
    });

    // Update product listing for browsing customers
  }

  async handlePaymentReceived(payload, merchantId) {
    const { orderId, amount, paymentMethod, transactionId } = payload;

    this.logger.debug(`Payment received: ${transactionId}`);

    this.emit('payment_received', {
      orderId,
      amount,
      paymentMethod,
      transactionId,
      merchantId,
      receivedAt: new Date().toISOString(),
    });

    // Update order status to paid
    // Trigger delivery workflow
  }

  async handleDeliveryStarted(payload, merchantId) {
    const { deliveryTaskId, orderId, driverId, location } = payload;

    this.logger.debug(`Delivery started: ${deliveryTaskId}`);

    this.emit('delivery_started', {
      deliveryTaskId,
      orderId,
      driverId,
      location,
      merchantId,
      startedAt: new Date().toISOString(),
    });

    // Notify customer with real-time tracking
  }

  async handleDeliveryCompleted(payload, merchantId) {
    const { deliveryTaskId, orderId, completedAt, signature } = payload;

    this.logger.debug(`Delivery completed: ${deliveryTaskId}`);

    this.emit('delivery_completed', {
      deliveryTaskId,
      orderId,
      merchantId,
      completedAt,
      signature,
    });

    // Request customer feedback/review
  }

  async handleBotConnected(payload, merchantId) {
    const { botStatus, timestamp } = payload;

    this.logger.debug(`Bot connected for merchant: ${merchantId}`);

    this.emit('bot_connected', {
      merchantId,
      status: 'online',
      connectedAt: timestamp || new Date().toISOString(),
    });
  }

  async handleBotDisconnected(payload, merchantId) {
    const { reason, timestamp } = payload;

    this.logger.debug(`Bot disconnected for merchant: ${merchantId} (${reason})`);

    this.emit('bot_disconnected', {
      merchantId,
      status: 'offline',
      reason,
      disconnectedAt: timestamp || new Date().toISOString(),
    });

    // Alert merchant of disconnection
  }

  /**
   * Record event in history for debugging
   */
  recordEvent(event) {
    this.eventHistory.push(event);

    // Keep history size limited
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit = 50, eventType = null) {
    let events = this.eventHistory;

    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }

    return events.slice(-limit).reverse();
  }

  /**
   * Get webhook health status
   */
  getWebhookStatus() {
    return {
      webhooksRegistered: this.webhookSecrets.size,
      eventsInHistory: this.eventHistory.length,
      lastEventAt: this.eventHistory.length > 0 
        ? this.eventHistory[this.eventHistory.length - 1].timestamp 
        : null,
      listeners: {
        message_received: this.listenerCount('message_received'),
        message_sent: this.listenerCount('message_sent'),
        order_created: this.listenerCount('order_created'),
        order_status_changed: this.listenerCount('order_status_changed'),
        product_updated: this.listenerCount('product_updated'),
        payment_received: this.listenerCount('payment_received'),
        delivery_started: this.listenerCount('delivery_started'),
        delivery_completed: this.listenerCount('delivery_completed'),
        bot_connected: this.listenerCount('bot_connected'),
        bot_disconnected: this.listenerCount('bot_disconnected'),
      },
    };
  }
}

module.exports = new WebhookManager();
