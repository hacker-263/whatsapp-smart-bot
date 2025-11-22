/**
 * Smart WhatsApp Bot - API Server
 * Serves as a bridge between the web platform and the WhatsApp bot
 * Provides REST APIs for bot commands, user management, and order tracking
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const chalk = require('chalk');
const rateLimit = require('express-rate-limit');

class BotApiServer {
  constructor() {
    this.app = express();
    this.port = process.env.BOT_API_PORT || 4001;
    this.supabaseUrl = process.env.VITE_SUPABASE_URL;
    this.supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS - Allow web platform to communicate
    this.app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    }));

    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });

    this.app.use(limiter);

    // Logging middleware
    this.app.use((req, res, next) => {
      console.log(chalk.cyan(`[${new Date().toISOString()}] ${req.method} ${req.path}`));
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'Bot API Server',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // === USER MANAGEMENT ===
    
    this.app.post('/api/users/register', async (req, res) => {
      try {
        const { name, phone_number, role = 'customer', email } = req.body;

        if (!name || !phone_number) {
          return res.status(400).json({
            success: false,
            error: 'Name and phone number are required',
          });
        }

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-auth`,
          {
            action: 'register',
            phone_number: phone_number.replace(/\D/g, ''),
            name,
            role,
            email,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Register error:', error.message);
        res.status(500).json({
          success: false,
          error: error.response?.data?.error || 'Registration failed',
        });
      }
    });

    this.app.post('/api/users/verify', async (req, res) => {
      try {
        const { phone_number } = req.body;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-auth`,
          {
            action: 'verify',
            phone_number: phone_number.replace(/\D/g, ''),
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Verify error:', error.message);
        res.status(500).json({ success: false, error: 'Verification failed' });
      }
    });

    this.app.get('/api/users/:phone', async (req, res) => {
      try {
        const { phone } = req.params;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-auth`,
          {
            action: 'get_user',
            phone_number: phone.replace(/\D/g, ''),
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Get user error:', error.message);
        res.status(404).json({ success: false, error: 'User not found' });
      }
    });

    // === PRODUCTS ===

    this.app.get('/api/products', async (req, res) => {
      try {
        const { merchant_id, category } = req.query;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-products`,
          {
            action: 'list',
            merchant_id,
            category,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Get products error:', error.message);
        res.status(500).json({ success: false, error: 'Could not fetch products' });
      }
    });

    this.app.get('/api/products/search', async (req, res) => {
      try {
        const { q, merchant_id } = req.query;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-products`,
          {
            action: 'search',
            query: q,
            merchant_id,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ success: false, error: 'Search failed' });
      }
    });

    // === CART MANAGEMENT ===

    this.app.post('/api/cart/add', async (req, res) => {
      try {
        const { customer_phone, merchant_id, product_id, quantity } = req.body;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-carts`,
          {
            action: 'add',
            customer_phone: customer_phone.replace(/\D/g, ''),
            merchant_id,
            product_id,
            quantity,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Add to cart error:', error.message);
        res.status(500).json({ success: false, error: 'Could not add to cart' });
      }
    });

    this.app.get('/api/cart/:phone', async (req, res) => {
      try {
        const { phone } = req.params;
        const { merchant_id } = req.query;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-carts`,
          {
            action: 'get',
            customer_phone: phone.replace(/\D/g, ''),
            merchant_id,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Get cart error:', error.message);
        res.status(500).json({ success: false, error: 'Could not fetch cart' });
      }
    });

    this.app.delete('/api/cart/:phone', async (req, res) => {
      try {
        const { phone } = req.params;
        const { merchant_id } = req.query;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-carts`,
          {
            action: 'clear',
            customer_phone: phone.replace(/\D/g, ''),
            merchant_id,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Clear cart error:', error.message);
        res.status(500).json({ success: false, error: 'Could not clear cart' });
      }
    });

    // === ORDERS ===

    this.app.post('/api/orders', async (req, res) => {
      try {
        const { merchant_id, customer_phone, items, total_amount, currency, payment_method } = req.body;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-orders`,
          {
            action: 'create',
            merchant_id,
            customer_phone: customer_phone.replace(/\D/g, ''),
            items,
            total_amount,
            currency,
            payment_method,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Create order error:', error.message);
        res.status(500).json({ success: false, error: 'Could not create order' });
      }
    });

    this.app.get('/api/orders/:id', async (req, res) => {
      try {
        const { id } = req.params;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-orders`,
          {
            action: 'get',
            order_id: id,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Get order error:', error.message);
        res.status(404).json({ success: false, error: 'Order not found' });
      }
    });

    this.app.get('/api/orders', async (req, res) => {
      try {
        const { merchant_id, customer_phone, status } = req.query;

        let action = 'list';
        let payload = { action };

        if (merchant_id) {
          payload.merchant_id = merchant_id;
          payload.status = status;
        } else if (customer_phone) {
          action = 'list_customer';
          payload.action = action;
          payload.customer_phone = customer_phone.replace(/\D/g, '');
        }

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-orders`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('List orders error:', error.message);
        res.status(500).json({ success: false, error: 'Could not fetch orders' });
      }
    });

    this.app.patch('/api/orders/:id/status', async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-orders`,
          {
            action: 'update_status',
            order_id: id,
            status,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Update order status error:', error.message);
        res.status(500).json({ success: false, error: 'Could not update order' });
      }
    });

    // === MESSAGES / CONVERSATIONS ===

    this.app.post('/api/messages/send', async (req, res) => {
      try {
        const { customer_phone, content, merchant_id } = req.body;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-messages`,
          {
            action: 'save',
            customer_phone: customer_phone.replace(/\D/g, ''),
            merchant_id,
            message_content: content,
            direction: 'outgoing',
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Send message error:', error.message);
        res.status(500).json({ success: false, error: 'Could not send message' });
      }
    });

    this.app.get('/api/conversations/:phone', async (req, res) => {
      try {
        const { phone } = req.params;

        const response = await axios.post(
          `${this.supabaseUrl}/functions/v1/bot-messages`,
          {
            action: 'get_session',
            customer_phone: phone.replace(/\D/g, ''),
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        res.json(response.data);
      } catch (error) {
        console.error('Get conversation error:', error.message);
        res.status(500).json({ success: false, error: 'Could not fetch conversation' });
      }
    });

    // === MESSAGE TEMPLATES ===

    // Get all templates
    this.app.get('/api/templates', async (req, res) => {
      try {
        const { type, status = 'active' } = req.query;
        let query = `SELECT * FROM message_templates WHERE status = '${status}'`;
        
        if (type) query += ` AND type = '${type}'`;
        
        const response = await axios.post(
          `${this.supabaseUrl}/rest/v1/rpc/exec_query`,
          { query },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey,
            },
          }
        );

        res.json({
          success: true,
          templates: response.data || [],
          count: (response.data || []).length,
        });
      } catch (error) {
        console.error('Fetch templates error:', error.message);
        res.status(500).json({ success: false, error: 'Could not fetch templates' });
      }
    });

    // Create template
    this.app.post('/api/templates', async (req, res) => {
      try {
        const { name, type, body, buttons, sections, media, variables, description } = req.body;

        if (!name || !type || !body) {
          return res.status(400).json({
            success: false,
            error: 'Name, type, and body are required',
          });
        }

        // Validate type
        if (!['text', 'buttons', 'list', 'media'].includes(type)) {
          return res.status(400).json({ success: false, error: 'Invalid template type' });
        }

        const response = await axios.post(
          `${this.supabaseUrl}/rest/v1/message_templates`,
          {
            name,
            type,
            body,
            buttons: buttons || null,
            sections: sections || null,
            media: media || null,
            variables: variables || [],
            description,
            status: 'draft',
            created_by: 'admin',
          },
          {
            headers: {
              'Authorization': `Bearer ${this.supabaseKey}`,
              'apikey': this.supabaseKey,
              'Prefer': 'return=representation',
            },
          }
        );

        res.status(201).json({
          success: true,
          template: response.data?.[0] || response.data,
          message: 'Template created successfully',
        });
      } catch (error) {
        console.error('Create template error:', error.message);
        res.status(500).json({ success: false, error: 'Could not create template' });
      }
    });

    // Preview template with variables
    this.app.post('/api/templates/preview', async (req, res) => {
      try {
        const { template_id, variables = {} } = req.body;

        if (!template_id) {
          return res.status(400).json({ success: false, error: 'Template ID required' });
        }

        // For now, return the interpolation logic
        // In production, use the templateEngine from bot
        res.json({
          success: true,
          preview: 'Template preview would show here with variable interpolation',
          variables_used: Object.keys(variables),
        });
      } catch (error) {
        console.error('Preview error:', error.message);
        res.status(500).json({ success: false, error: 'Could not preview template' });
      }
    });

    // === MEDIA MANAGEMENT ===

    // Upload media file
    this.app.post('/api/media/upload', async (req, res) => {
      try {
        const { file_data, file_name, mime_type, merchant_id } = req.body;

        if (!file_data || !file_name || !mime_type) {
          return res.status(400).json({
            success: false,
            error: 'File data, name, and mime type are required',
          });
        }

        // Validate image types
        const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validMimes.includes(mime_type)) {
          return res.status(400).json({
            success: false,
            error: 'Only JPEG, PNG, and WebP images are supported',
          });
        }

        // Validate size (max 5MB)
        const sizeInBytes = Buffer.byteLength(file_data, 'base64');
        const maxSize = 5 * 1024 * 1024;
        if (sizeInBytes > maxSize) {
          return res.status(400).json({
            success: false,
            error: 'File too large (max 5MB)',
          });
        }

        // In production, call mediaManager.createMediaRecord
        const mediaRecord = {
          id: `media-${Date.now()}`,
          file_name,
          mime_type,
          size: sizeInBytes,
          status: 'ready',
          url: `/uploads/${file_name}`,
          thumbnail_url: `/uploads/thumb-${file_name}`,
          created_at: new Date().toISOString(),
        };

        res.status(201).json({
          success: true,
          media: mediaRecord,
          message: 'Media uploaded successfully',
        });
      } catch (error) {
        console.error('Upload error:', error.message);
        res.status(500).json({ success: false, error: 'Upload failed' });
      }
    });

    // Get media file
    this.app.get('/api/media/:media_id', async (req, res) => {
      try {
        const { media_id } = req.params;

        if (!media_id) {
          return res.status(400).json({ success: false, error: 'Media ID required' });
        }

        // Fetch from database or filesystem
        res.json({
          success: true,
          media: {
            id: media_id,
            url: `/uploads/${media_id}.jpg`,
            thumbnail_url: `/uploads/thumb-${media_id}.jpg`,
            status: 'ready',
          },
        });
      } catch (error) {
        console.error('Fetch media error:', error.message);
        res.status(500).json({ success: false, error: 'Could not fetch media' });
      }
    });

    // Delete media file
    this.app.delete('/api/media/:media_id', async (req, res) => {
      try {
        const { media_id } = req.params;

        if (!media_id) {
          return res.status(400).json({ success: false, error: 'Media ID required' });
        }

        // Delete from filesystem and database
        res.json({
          success: true,
          message: 'Media deleted successfully',
        });
      } catch (error) {
        console.error('Delete media error:', error.message);
        res.status(500).json({ success: false, error: 'Could not delete media' });
      }
    });

    // === ERROR HANDLING ===

    this.app.use((err, req, res, next) => {
      console.error(chalk.red('Error:'), err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message,
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
      });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(chalk.green(`✅ Bot API Server running on http://localhost:${this.port}`));
      console.log(chalk.blue(`📚 API Docs:`));
      console.log(chalk.gray(`   POST /api/users/register`));
      console.log(chalk.gray(`   GET  /api/products`));
      console.log(chalk.gray(`   POST /api/cart/add`));
      console.log(chalk.gray(`   GET  /api/cart/:phone`));
      console.log(chalk.gray(`   POST /api/orders`));
      console.log(chalk.gray(`   GET  /api/orders/:id`));
      console.log(chalk.gray(`   PATCH /api/orders/:id/status`));
    });
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        console.log(chalk.yellow('Bot API Server stopped'));
      });
    }
  }
}

const server = new BotApiServer();
server.start();

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down API server...'));
  server.stop();
  process.exit(0);
});

module.exports = BotApiServer;
