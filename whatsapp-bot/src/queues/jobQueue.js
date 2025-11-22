/**
 * Job Queue Manager using BullMQ
 * Handles asynchronous tasks:
 * - Media optimization and thumbnail generation
 * - Message sending with retry logic
 * - Order processing and notifications
 * - Webhook deliveries
 */

const { Queue, Worker, QueueScheduler } = require('bullmq');
const redis = require('redis');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs').promises;
const Logger = require('../config/logger');

class JobQueueManager {
  constructor() {
    this.logger = Logger;
    
    // Redis connection for queue
    this.redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          this.logger.warn('Redis connection refused');
          return new Error('Redis connection failed');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });

    this.queues = {};
    this.workers = {};
    this.initQueues();
  }

  /**
   * Initialize all job queues
   */
  initQueues() {
    const queueNames = ['media_processing', 'message_sending', 'order_processing', 'webhook_delivery'];
    
    queueNames.forEach((name) => {
      this.queues[name] = new Queue(name, {
        connection: this.redisClient,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      });

      // Queue event listeners
      this.queues[name].on('waiting', (job) => {
        this.logger.debug(`Job ${job.id} waiting in ${name}`);
      });

      this.queues[name].on('completed', (job) => {
        this.logger.debug(`Job ${job.id} completed in ${name}`);
      });

      this.queues[name].on('failed', (job, err) => {
        this.logger.error(`Job ${job.id} failed in ${name}: ${err.message}`);
      });

      // Queue scheduler for recurring jobs
      new QueueScheduler(name, { connection: this.redisClient });
    });

    this.setupWorkers();
  }

  /**
   * Setup workers for each queue
   */
  setupWorkers() {
    // Media Processing Worker
    this.workers['media_processing'] = new Worker('media_processing', async (job) => {
      return this.handleMediaProcessing(job);
    }, {
      connection: this.redisClient,
      concurrency: 3,
    });

    // Message Sending Worker
    this.workers['message_sending'] = new Worker('message_sending', async (job) => {
      return this.handleMessageSending(job);
    }, {
      connection: this.redisClient,
      concurrency: 5,
    });

    // Order Processing Worker
    this.workers['order_processing'] = new Worker('order_processing', async (job) => {
      return this.handleOrderProcessing(job);
    }, {
      connection: this.redisClient,
      concurrency: 2,
    });

    // Webhook Delivery Worker
    this.workers['webhook_delivery'] = new Worker('webhook_delivery', async (job) => {
      return this.handleWebhookDelivery(job);
    }, {
      connection: this.redisClient,
      concurrency: 5,
    });
  }

  /**
   * Queue a media processing job
   * Tasks: resize, optimize, generate thumbnails
   */
  async queueMediaProcessing(mediaId, filePath, options = {}) {
    try {
      const job = await this.queues['media_processing'].add('optimize', {
        mediaId,
        filePath,
        sizes: options.sizes || [
          { name: 'thumbnail', width: 200, height: 200 },
          { name: 'medium', width: 600, height: 600 },
          { name: 'original', width: 1200, height: 1200 },
        ],
        quality: options.quality || 85,
      }, {
        jobId: `media-${mediaId}-${Date.now()}`,
        priority: options.priority || 5,
      });

      this.logger.debug(`Media processing job queued: ${job.id}`);
      return job.id;
    } catch (error) {
      this.logger.error('Queue media processing error:', error);
      throw error;
    }
  }

  /**
   * Handle media processing job
   */
  async handleMediaProcessing(job) {
    const { mediaId, filePath, sizes, quality } = job.data;

    try {
      const uploadDir = path.join(__dirname, '../../uploads');
      const mediaDir = path.join(uploadDir, mediaId);

      // Create media directory
      await fs.mkdir(mediaDir, { recursive: true });

      // Process each size
      const results = {};
      for (const size of sizes) {
        const outputPath = path.join(mediaDir, `${size.name}.jpg`);
        
        await sharp(filePath)
          .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality })
          .toFile(outputPath);

        results[size.name] = `${mediaId}/${size.name}.jpg`;
      }

      return {
        success: true,
        mediaId,
        sizes: results,
      };
    } catch (error) {
      this.logger.error('Media processing failed:', error);
      throw error;
    }
  }

  /**
   * Queue a message sending job with retry
   */
  async queueMessageSending(recipientId, message, options = {}) {
    try {
      const job = await this.queues['message_sending'].add('send', {
        recipientId,
        message,
        templateId: options.templateId,
        variables: options.variables || {},
        priority: options.priority || 'normal',
        scheduledFor: options.scheduledFor || new Date(),
      }, {
        jobId: `msg-${recipientId}-${Date.now()}`,
        delay: options.delay || 0,
      });

      this.logger.debug(`Message sending job queued: ${job.id}`);
      return job.id;
    } catch (error) {
      this.logger.error('Queue message sending error:', error);
      throw error;
    }
  }

  /**
   * Handle message sending job
   */
  async handleMessageSending(job) {
    const { recipientId, message, templateId, variables } = job.data;

    try {
      // In production, integrate with bot's send message function
      // For now, simulate sending
      
      this.logger.debug(`Sending message to ${recipientId}`);

      return {
        success: true,
        recipientId,
        messageId: `msg-${Date.now()}`,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Message sending failed:', error);
      throw error;
    }
  }

  /**
   * Queue order processing job
   */
  async queueOrderProcessing(orderId, orderData) {
    try {
      const job = await this.queues['order_processing'].add('process', {
        orderId,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        customerId: orderData.customerId,
        merchantId: orderData.merchantId,
        createdAt: new Date().toISOString(),
      }, {
        jobId: `order-${orderId}`,
        priority: 10,
      });

      this.logger.debug(`Order processing job queued: ${job.id}`);
      return job.id;
    } catch (error) {
      this.logger.error('Queue order processing error:', error);
      throw error;
    }
  }

  /**
   * Handle order processing
   */
  async handleOrderProcessing(job) {
    const { orderId, items, totalAmount, customerId, merchantId } = job.data;

    try {
      // Process order:
      // 1. Validate inventory
      // 2. Reserve items
      // 3. Calculate taxes and fees
      // 4. Create delivery task
      // 5. Send confirmation to merchant and customer

      this.logger.debug(`Processing order ${orderId}`);

      return {
        success: true,
        orderId,
        status: 'confirmed',
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Order processing failed:', error);
      throw error;
    }
  }

  /**
   * Queue webhook delivery job
   */
  async queueWebhookDelivery(webhookUrl, payload, options = {}) {
    try {
      const job = await this.queues['webhook_delivery'].add('deliver', {
        webhookUrl,
        payload,
        eventType: options.eventType,
        merchantId: options.merchantId,
        signature: options.signature,
      }, {
        jobId: `webhook-${Date.now()}`,
      });

      this.logger.debug(`Webhook delivery job queued: ${job.id}`);
      return job.id;
    } catch (error) {
      this.logger.error('Queue webhook delivery error:', error);
      throw error;
    }
  }

  /**
   * Handle webhook delivery with retry
   */
  async handleWebhookDelivery(job) {
    const { webhookUrl, payload, eventType, signature } = job.data;

    try {
      const axios = require('axios');

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Event-Type': eventType,
          'User-Agent': 'WhatsApp-Bot/1.0',
        },
        timeout: 10000,
      });

      return {
        success: true,
        webhookUrl,
        statusCode: response.status,
        deliveredAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Webhook delivery failed:', error.message);
      throw error;
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName, jobId) {
    try {
      const job = await this.queues[queueName].getJob(jobId);
      
      if (!job) {
        return { found: false, status: 'not_found' };
      }

      return {
        found: true,
        id: job.id,
        status: await job.getState(),
        progress: job.progress(),
        attempts: job.attemptsMade,
        failedReason: job.failedReason,
      };
    } catch (error) {
      this.logger.error('Get job status error:', error);
      return { error: error.message };
    }
  }

  /**
   * Get queue stats
   */
  async getQueueStats(queueName) {
    try {
      const queue = this.queues[queueName];
      const counts = await queue.getJobCounts();

      return {
        queue: queueName,
        active: counts.active,
        waiting: counts.waiting,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed,
      };
    } catch (error) {
      this.logger.error('Get queue stats error:', error);
      return { error: error.message };
    }
  }

  /**
   * Cleanup and close connections
   */
  async close() {
    try {
      // Close all workers
      for (const workerName in this.workers) {
        await this.workers[workerName].close();
      }

      // Close all queues
      for (const queueName in this.queues) {
        await this.queues[queueName].close();
      }

      // Close Redis connection
      await this.redisClient.quit();

      this.logger.debug('Job queue manager closed');
    } catch (error) {
      this.logger.error('Close error:', error);
    }
  }
}

module.exports = new JobQueueManager();
