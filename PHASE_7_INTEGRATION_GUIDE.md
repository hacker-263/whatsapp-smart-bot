# Phase 6 → Phase 7 Integration Guide

**Date**: November 22, 2025  
**Current Phase**: 6 Complete ✅  
**Next Phase**: 7 - Integration & Real-time Updates  
**Transition Status**: 🔵 Ready to Begin  

---

## 🔗 Integration Points Summary

### What Phase 6 Provided
```
✅ Database Schema (8 tables, RLS, audit)
✅ API Endpoints (6 new endpoints)
✅ Job Queue System (4 queue types)
✅ Webhook Manager (10 event types)
✅ Template Engine (variable interpolation)
✅ Media Manager (file storage & validation)
✅ Dependencies (6 new packages)
```

### What Phase 7 Needs to Do
```
⏳ Wire job queue into bot handlers
⏳ Add WebSocket server to Express
⏳ Create frontend real-time listeners
⏳ Add input validation (Joi schemas)
⏳ Implement API security layer
⏳ Create test suite
⏳ Performance tuning
```

---

## 🔧 Specific Integration Tasks

### Task 1: Wire Job Queue into Bot
**File**: `whatsapp-bot/src/controllers/botController.js`  
**Priority**: Critical  
**Effort**: 2 hours

**What to do**:
```javascript
// At top of file, add:
const jobQueue = require('../queues/jobQueue');

// In handleCheckoutCommand(), after order creation:
async handleCheckoutCommand(message, phone) {
  // ... existing order creation code ...
  
  // NEW: Queue order processing
  const processJobId = await jobQueue.queueOrderProcessing(order.id, {
    items: cartItems,
    totalAmount: total,
    customerId: phone,
    merchantId: merchant.id
  });
  logger.debug(`Order processing job queued: ${processJobId}`);
  
  // NEW: Queue confirmation message
  const messageJobId = await jobQueue.queueMessageSending(phone, confirmMsg, {
    templateId: 'order_confirmation',
    variables: {
      order_id: order.id,
      amount: formatCurrency(total),
      eta: formatTime(estimatedDelivery)
    },
    priority: 'high'
  });
  logger.debug(`Confirmation message job queued: ${messageJobId}`);
  
  // Send initial response (async processing happens in background)
  await this.sendMessage(phone, '✓ Order queued for processing...');
}

// Similar additions needed for:
// - handlePaymentCommand() → queueMessageSending
// - handleOrderStatusCommand() → webhook trigger
// - handleMediaUploadCommand() → queueMediaProcessing
// - handleProductCommand() → queueWebhookDelivery
```

**Testing**:
```javascript
// Verify job is queued
const status = await jobQueue.getJobStatus('order_processing', processJobId);
console.log(status); // Should show 'waiting' or 'active'

// Monitor queue
const stats = await jobQueue.getQueueStats('order_processing');
console.log(stats.active); // Should increase with activity
```

---

### Task 2: Add WebSocket Server
**File**: `whatsapp-bot/api-server.js`  
**Priority**: High  
**Effort**: 3 hours

**What to do**:
```javascript
// At top:
const WebSocket = require('ws');
const http = require('http');

// Replace:
this.app.listen(this.port, () => {

// With:
const server = http.createServer(this.app);
this.wss = new WebSocket.Server({ server });

// Handle WebSocket connections
this.wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({ type: 'connected', message: 'Subscribed to events' }));
  
  // Handle client disconnect
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// Listen instead of this.app.listen
server.listen(this.port, () => {
  console.log(`Server with WebSocket running on port ${this.port}`);
});

// Broadcast function for events
broadcastToClients(eventType, payload) {
  this.wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: eventType,
        data: payload,
        timestamp: new Date().toISOString()
      }));
    }
  });
}

// Connect webhooks to WebSocket broadcasts
webhookManager.on('webhook_event', (event) => {
  this.broadcastToClients(event.eventType, event.payload);
});

webhookManager.on('order_created', (event) => {
  this.broadcastToClients('order_created', event);
});

webhookManager.on('order_status_changed', (event) => {
  this.broadcastToClients('order_status_changed', event);
});

// ... repeat for other 10 event types
```

**Testing**:
```bash
# Terminal 1: Start server
npm run api:dev

# Terminal 2: Test WebSocket connection
websocat ws://localhost:4001

# You should receive:
# {"type":"connected","message":"Subscribed to events"}

# Trigger an event from bot, should see it flow through
```

---

### Task 3: Frontend Real-time Listeners
**File**: `src/components/MerchantDashboard.tsx` (React)  
**Priority**: High  
**Effort**: 2 hours

**What to do**:
```typescript
import { useEffect, useState } from 'react';

export function MerchantDashboard() {
  const [orders, setOrders] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const websocket = new WebSocket('ws://localhost:4001');
    
    websocket.onopen = () => {
      console.log('Connected to real-time updates');
    };
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // Handle different event types
      switch (message.type) {
        case 'order_created':
          setOrders(prev => [message.data, ...prev]);
          showNotification('New order!', message.data.orderId);
          break;
          
        case 'order_status_changed':
          setOrders(prev => prev.map(order => 
            order.id === message.data.orderId 
              ? { ...order, status: message.data.newStatus }
              : order
          ));
          showNotification('Order updated', message.data.newStatus);
          break;
          
        case 'payment_received':
          setOrders(prev => prev.map(order =>
            order.id === message.data.orderId
              ? { ...order, paid: true }
              : order
          ));
          showNotification('Payment received!', `${message.data.amount}`);
          break;
          
        case 'delivery_started':
          showNotification('Delivery Started', message.data.orderId);
          break;
          
        case 'bot_connected':
          showNotification('Bot Online', '✓ Bot is connected');
          break;
          
        case 'bot_disconnected':
          showNotification('Bot Offline', '⚠ Bot is offline');
          break;
      }
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    websocket.onclose = () => {
      console.log('Disconnected from real-time updates');
      // Reconnect after 3 seconds
      setTimeout(() => setWs(null), 3000);
    };
    
    setWs(websocket);
    
    return () => websocket.close();
  }, []);

  return (
    <div>
      {/* Dashboard content that updates in real-time */}
      <OrderList orders={orders} />
    </div>
  );
}
```

**Testing**:
```bash
# Start frontend and backend
npm start

# In browser console:
# Should see WebSocket messages flowing in real-time
# As orders are placed, dashboard should update instantly
```

---

### Task 4: Add Input Validation (Joi)
**File**: `whatsapp-bot/src/middlewares/validation.js` (NEW)  
**Priority**: Medium  
**Effort**: 2 hours

**What to do**:
```javascript
const Joi = require('joi');

// Schema for template creation
const createTemplateSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(50).required(),
  type: Joi.string().valid('text', 'buttons', 'list', 'media').required(),
  body: Joi.string().min(1).max(1024).required(),
  buttons: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      label: Joi.string().max(20).required()
    })
  ),
  variables: Joi.array().items(Joi.string()),
  description: Joi.string().max(200)
});

// Schema for media upload
const uploadMediaSchema = Joi.object({
  file_data: Joi.string().required(),
  file_name: Joi.string().max(255).required(),
  mime_type: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
  merchant_id: Joi.string().uuid().required()
});

// Middleware
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    req.validated = value;
    next();
  };
}

// Usage in api-server.js:
app.post('/api/templates', 
  validateRequest(createTemplateSchema),
  async (req, res) => {
    // req.validated contains validated and sanitized data
    const { name, type, body, buttons } = req.validated;
    // ... rest of handler
  }
);

module.exports = { validateRequest, createTemplateSchema, uploadMediaSchema };
```

---

### Task 5: API Security Layer
**File**: `whatsapp-bot/src/middlewares/security.js` (NEW)  
**Priority**: Medium  
**Effort**: 2 hours

**What to do**:
```javascript
const crypto = require('crypto');

// API key verification
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.BOT_API_KEY) {
    return res.status(401).json({ success: false, error: 'Invalid API key' });
  }
  
  next();
}

// HMAC signature verification for webhooks
function verifyWebhookSignature(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-timestamp'];
  
  if (!signature || !timestamp) {
    return res.status(401).json({ success: false, error: 'Missing signature' });
  }
  
  const payload = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payload + timestamp)
    .digest('hex');
  
  if (expectedSig !== signature) {
    return res.status(401).json({ success: false, error: 'Invalid signature' });
  }
  
  // Check timestamp is within 5 minutes
  const age = Date.now() - parseInt(timestamp);
  if (age > 5 * 60 * 1000) {
    return res.status(401).json({ success: false, error: 'Request expired' });
  }
  
  next();
}

// Usage in api-server.js:
app.post('/webhooks/bot', verifyWebhookSignature, (req, res) => {
  // Handle webhook event
});

module.exports = { verifyApiKey, verifyWebhookSignature };
```

---

### Task 6: Create Test Suite
**File**: `whatsapp-bot/tests/integration.test.js` (NEW)  
**Priority**: Medium  
**Effort**: 3 hours

**What to do**:
```javascript
const jest = require('jest');
const axios = require('axios');
const WebSocket = require('ws');

describe('Backend Integration Tests', () => {
  
  test('Template API creates and retrieves templates', async () => {
    // Create template
    const createRes = await axios.post('http://localhost:4001/api/templates', {
      name: 'test_template_' + Date.now(),
      type: 'text',
      body: 'Hello {{name}}',
      variables: ['name']
    });
    
    expect(createRes.status).toBe(201);
    expect(createRes.data.template.id).toBeDefined();
    
    // Retrieve template
    const getRes = await axios.get('http://localhost:4001/api/templates?type=text');
    expect(getRes.data.templates.length).toBeGreaterThan(0);
  });
  
  test('Media upload and validation works', async () => {
    const res = await axios.post('http://localhost:4001/api/media/upload', {
      file_name: 'test.jpg',
      mime_type: 'image/jpeg',
      file_data: 'fake_base64_data',
      merchant_id: 'merchant-123'
    });
    
    expect(res.status).toBe(201);
    expect(res.data.media.url).toBeDefined();
  });
  
  test('Job queue processes jobs correctly', async () => {
    const jobQueue = require('../src/queues/jobQueue');
    
    const jobId = await jobQueue.queueMessageSending('1234567890', 'Test message');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for processing
    
    const status = await jobQueue.getJobStatus('message_sending', jobId);
    expect(status.id).toBe(jobId);
  });
  
  test('WebSocket real-time updates work', async () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket('ws://localhost:4001');
      
      ws.onopen = () => {
        console.log('Connected');
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        expect(message.type).toBe('connected');
        ws.close();
        resolve();
      };
      
      ws.onerror = (error) => {
        reject(error);
      };
    });
  });
});

// Run with: npm test
```

---

### Task 7: Performance Tuning
**File**: `whatsapp-bot/src/config/performance.js` (NEW)  
**Priority**: Low  
**Effort**: 2 hours

**What to do**:
```javascript
// Connection pooling for database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Redis connection optimization
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

// Cache frequently accessed data
const cache = new NodeCache({ stdTTL: 600 }); // 10 min TTL

// Add caching middleware
function cacheMiddleware(duration) {
  return (req, res, next) => {
    if (['GET'].includes(req.method)) {
      const key = `${req.baseUrl}${req.url}`;
      const cached = cache.get(key);
      
      if (cached) {
        res.json(cached);
        return;
      }
      
      res.json_original = res.json;
      res.json = (data) => {
        cache.set(key, data, duration);
        res.json_original(data);
      };
    }
    
    next();
  };
}

module.exports = { pool, client, cache, cacheMiddleware };
```

---

## 🎯 Phase 7 Timeline

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Wire job queue | 2h | Critical | ⏳ TODO |
| WebSocket server | 3h | High | ⏳ TODO |
| Frontend listeners | 2h | High | ⏳ TODO |
| Input validation | 2h | Medium | ⏳ TODO |
| Security layer | 2h | Medium | ⏳ TODO |
| Test suite | 3h | Medium | ⏳ TODO |
| Performance tuning | 2h | Low | ⏳ TODO |

**Total Effort**: ~16 hours  
**Estimated Completion**: 2-3 days (8 hours/day)

---

## ✅ Phase 7 Success Criteria

- [ ] Job queue events flowing through API
- [ ] WebSocket server broadcasting events
- [ ] Frontend updating in real-time (< 500ms latency)
- [ ] All inputs validated with Joi schemas
- [ ] API key authentication working
- [ ] Integration tests passing (90%+ coverage)
- [ ] Performance benchmarks met (p95 < 200ms)
- [ ] Zero security vulnerabilities

---

## 🚀 Getting Started Now

### Immediate Next Steps

1. **Review Phase 6 Files**
   ```bash
   cat PHASE_6_COMPLETION_REPORT.md
   cat BACKEND_ENHANCEMENT_IMPLEMENTATION_GUIDE.md
   ```

2. **Install Dependencies** (if not done)
   ```bash
   cd whatsapp-bot
   npm install bullmq redis sharp joi multer ws
   ```

3. **Start with Task 1: Wire Job Queue**
   - Begin in `botController.js`
   - Add 10-15 lines per command handler
   - Test with `npm run dev`

4. **Move to Task 2: WebSocket Server**
   - Add WebSocket support to `api-server.js`
   - Test with WebSocket client
   - Connect webhook events

5. **Finish with Frontend Integration**
   - Add React hooks in dashboard
   - Test real-time updates
   - Verify live order streaming

---

## 📚 Reference Documentation

- Phase 6 Report: `PHASE_6_COMPLETION_REPORT.md`
- Implementation Guide: `BACKEND_ENHANCEMENT_IMPLEMENTATION_GUIDE.md`
- Setup Checklist: `PHASE_6_SETUP_CHECKLIST.md`
- Backend Audit: `BACKEND_AUDIT_REPORT.md`

---

**Phase 6 Complete → Phase 7 Ready** ✅

All infrastructure is in place. Phase 7 is purely integration wiring.

**Start with Task 1 now!** 🚀
