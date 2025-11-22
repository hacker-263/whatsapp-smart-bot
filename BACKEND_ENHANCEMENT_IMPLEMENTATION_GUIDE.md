# Backend Enhancement Implementation Guide

**Date**: November 22, 2025  
**Status**: Phase 6 - Core Infrastructure Created  
**Owner**: Hxcker (Bot Owner, +263781564004)

---

## 📋 Implementation Summary

This document outlines the backend enhancement implementation for the WhatsApp Smart Bot, covering templates, media management, job queues, and webhooks.

### What's Been Completed ✅

1. **Database Schema Migration** (`supabase/migrations/20251122_03_templates_media_schema.sql`)
   - Created 8 new tables with full relationships and RLS policies
   - Added 3 default message templates (order_confirmation, payment_request, order_status)
   - Implemented audit logging with auto-triggers
   - Configured webhook support infrastructure

2. **API Endpoints** (Updated `whatsapp-bot/api-server.js`)
   - `GET /api/templates` - Fetch templates by type/status
   - `POST /api/templates` - Create new templates
   - `POST /api/templates/preview` - Preview with variable interpolation
   - `POST /api/media/upload` - Upload and validate media files
   - `GET /api/media/:media_id` - Retrieve media records
   - `DELETE /api/media/:media_id` - Delete media files

3. **Job Queue System** (NEW: `whatsapp-bot/src/queues/jobQueue.js`)
   - BullMQ-based async job processing
   - 4 queues: media_processing, message_sending, order_processing, webhook_delivery
   - Automatic retry with exponential backoff
   - Job status tracking and queue statistics

4. **Webhook Manager** (NEW: `whatsapp-bot/src/webhooks/webhookManager.js`)
   - Event-driven architecture for real-time updates
   - 10 event types: message, order, product, payment, delivery, bot status
   - HMAC signature verification for security
   - Event history tracking for debugging

5. **Core Subsystems** (Already Created)
   - `TemplateEngine` - Variable interpolation and format conversion
   - `MediaManager` - File storage, validation, thumbnail generation

---

## 🗄️ Database Schema

### Tables Created

```
1. message_templates         - Message templates with versions
2. template_versions         - Version history and audit trail
3. media_files              - File storage metadata
4. product_media            - Product-to-media relationships
5. audit_logs               - Comprehensive action logging
6. delivery_tasks           - Order delivery workflow
7. webhooks                 - Webhook subscriptions
8. webhook_logs             - Webhook execution history
```

### Key Relationships

```
Users → message_templates (created_by)
Users → media_files (owner_id)
Merchants → media_files (merchant_id)
Products → product_media → media_files
Orders → delivery_tasks
Merchants → webhooks
Webhooks → webhook_logs
```

### RLS Policies

- **Templates**: Public read (active only), admin full access
- **Media**: Owner can manage, others read
- **Audit Logs**: Admin-only visibility
- **Webhooks**: Merchant-owned with read/write controls

---

## 🚀 API Endpoints

### Template Endpoints

```bash
# Get all active templates
GET /api/templates?type=buttons&status=active

# Create template
POST /api/templates
{
  "name": "order_confirmation",
  "type": "buttons",
  "body": "Order confirmed! {{order_id}}",
  "buttons": [
    {"id": "track", "label": "📍 Track"}
  ],
  "variables": ["order_id", "amount"]
}

# Preview template with variables
POST /api/templates/preview
{
  "template_id": "uuid",
  "variables": { "order_id": "ORD123", "amount": "$45" }
}
```

### Media Endpoints

```bash
# Upload media
POST /api/media/upload
{
  "file_data": "base64_encoded_image",
  "file_name": "product.jpg",
  "mime_type": "image/jpeg",
  "merchant_id": "uuid"
}

# Retrieve media
GET /api/media/media-uuid

# Delete media
DELETE /api/media/media-uuid
```

---

## 🔧 Job Queue System

### Queue Types

1. **media_processing** - Image optimization, thumbnails, resizing
2. **message_sending** - WhatsApp message delivery with retry
3. **order_processing** - Order validation, inventory, delivery tasks
4. **webhook_delivery** - Webhook HTTP calls with retry logic

### Usage Examples

```javascript
const jobQueue = require('./src/queues/jobQueue');

// Queue media processing
await jobQueue.queueMediaProcessing('media-123', '/uploads/image.jpg', {
  sizes: [
    { name: 'thumbnail', width: 200, height: 200 },
    { name: 'medium', width: 600, height: 600 }
  ],
  quality: 85
});

// Queue message sending
await jobQueue.queueMessageSending('1234567890', 'Hello!', {
  templateId: 'order_confirmation',
  variables: { order_id: 'ORD123' },
  priority: 'high'
});

// Queue order processing
await jobQueue.queueOrderProcessing('order-uuid', {
  items: [...],
  totalAmount: 250,
  customerId: 'customer-uuid'
});

// Get job status
const status = await jobQueue.getJobStatus('message_sending', 'job-id');

// Get queue stats
const stats = await jobQueue.getQueueStats('media_processing');
```

---

## 🔌 Webhook System

### Event Types

1. **message_received** - Customer sends message
2. **message_sent** - Bot sends message
3. **order_created** - New order placed
4. **order_status_changed** - Order status updated
5. **product_updated** - Product info changed
6. **payment_received** - Payment confirmed
7. **delivery_started** - Driver begins delivery
8. **delivery_completed** - Order delivered
9. **bot_connected** - Bot goes online
10. **bot_disconnected** - Bot goes offline

### Webhook Registration

```javascript
// Register webhook for merchant
webhookManager.registerWebhookSecret('merchant-id', 'secret-key');

// Handle incoming webhook
const result = await webhookManager.handleWebhookEvent('order_created', {
  orderId: 'ORD123',
  customerId: 'cust-123',
  items: [...],
  totalAmount: 500
}, 'merchant-id');
```

### Webhook Payload Example

```json
{
  "event_type": "order_created",
  "timestamp": "2025-11-22T10:30:00Z",
  "merchant_id": "merchant-uuid",
  "payload": {
    "order_id": "ORD123",
    "customer_id": "cust-123",
    "items": [
      {
        "product_id": "prod-1",
        "quantity": 2,
        "price": 250
      }
    ],
    "total_amount": 500,
    "status": "pending",
    "created_at": "2025-11-22T10:30:00Z"
  },
  "signature": "hmac_sha256_hash"
}
```

---

## 🔐 Security Features

### Implemented

- ✅ HMAC-SHA256 webhook signature verification
- ✅ RLS policies on all database tables
- ✅ Input validation on media uploads (type, size limits)
- ✅ Rate limiting on API endpoints
- ✅ Audit logging of all sensitive operations

### To Implement (Phase 7)

- [ ] Input sanitization with Joi schema validation
- [ ] API key authentication for external services
- [ ] Encryption for sensitive data (payment info)
- [ ] Rate limiting per merchant
- [ ] DDoS protection with Cloudflare
- [ ] SQL injection prevention (already handled by Supabase)

---

## 📦 Dependencies to Install

```bash
# Install missing dependencies
npm install bullmq redis sharp joi axios ws

# In package.json:
{
  "dependencies": {
    "bullmq": "^3.x",
    "redis": "^4.x",
    "sharp": "^0.32.x",
    "joi": "^17.x",
    "axios": "^1.x",
    "ws": "^8.x"
  }
}
```

---

## 🔄 Integration Points

### Bot to API Integration

```javascript
// In botController.js
const jobQueue = require('../queues/jobQueue');
const webhookManager = require('../webhooks/webhookManager');

// When order is placed
async handleCheckoutCommand(message, phone) {
  // ... create order ...
  
  // Queue async processing
  await jobQueue.queueOrderProcessing(orderId, orderData);
  
  // Trigger webhooks for merchants
  await jobQueue.queueWebhookDelivery(webhookUrl, orderPayload, {
    eventType: 'order_created',
    merchantId: merchant.id
  });
  
  // Send confirmation to customer
  await jobQueue.queueMessageSending(phone, confirmationMessage, {
    templateId: 'order_confirmation'
  });
}
```

### Frontend WebSocket Integration

```javascript
// In React component
useEffect(() => {
  const eventBus = require('./eventBus');
  
  const handleOrderCreated = (event) => {
    console.log('Order created:', event);
    // Update UI in real-time
  };
  
  eventBus.on('order_created', handleOrderCreated);
  
  return () => eventBus.off('order_created', handleOrderCreated);
}, []);
```

---

## 📊 Monitoring & Debugging

### Queue Monitoring

```javascript
// Get queue statistics
const mediaStats = await jobQueue.getQueueStats('media_processing');
console.log(mediaStats);
// {
//   queue: 'media_processing',
//   active: 2,
//   waiting: 15,
//   completed: 342,
//   failed: 3,
//   delayed: 0
// }

// Get job status
const jobStatus = await jobQueue.getJobStatus('message_sending', 'msg-123');
console.log(jobStatus);
// {
//   id: 'msg-123',
//   status: 'completed',
//   progress: 100,
//   attempts: 1,
//   failedReason: null
// }
```

### Webhook Monitoring

```javascript
// Get webhook health status
const status = webhookManager.getWebhookStatus();
console.log(status);
// {
//   webhooksRegistered: 5,
//   eventsInHistory: 234,
//   lastEventAt: '2025-11-22T10:30:00Z',
//   listeners: { ... }
// }

// Get recent events
const recentEvents = webhookManager.getRecentEvents(10, 'order_created');
```

---

## 🧪 Testing Checklist

### Unit Tests to Create

- [ ] `templateEngine.render()` with various variables
- [ ] `mediaManager.validateImage()` with different file types
- [ ] Job queue job creation and status tracking
- [ ] Webhook signature verification

### Integration Tests

- [ ] Template API endpoints with Supabase
- [ ] Media upload with Sharp processing
- [ ] Job queue job execution and retry logic
- [ ] Webhook event handling and emission

### End-to-End Tests

- [ ] Full order workflow: create → process → deliver → webhook
- [ ] Media upload → optimization → thumbnail generation
- [ ] Message template rendering with real variables

---

## 📝 Next Steps (Phase 7)

1. **Install Dependencies**
   ```bash
   cd /workspaces/whatsapp-smart-bot/whatsapp-bot
   npm install bullmq redis sharp joi axios ws
   ```

2. **Run Database Migration**
   ```bash
   supabase migration up
   ```

3. **Wire Job Queue into Bot**
   - Import jobQueue in botController.js
   - Trigger jobs on order creation, message sending, etc.

4. **Implement WebSocket Server**
   - Add ws package and WebSocket upgrade to Express
   - Connect webhook events to WebSocket broadcast

5. **Add Frontend Real-time Listeners**
   - React hooks for webhook events
   - Live order status updates
   - Real-time chat messages

6. **Security Hardening**
   - Add Joi validation schemas for all inputs
   - Implement API key authentication
   - Add encryption for sensitive fields

---

## 🎯 Success Criteria

✅ All API endpoints working with Supabase  
✅ Job queue processing media and messages  
✅ Webhooks triggering correctly  
✅ Database audit logs recording all actions  
✅ Real-time updates flowing to frontend  
✅ No security vulnerabilities in code review  
✅ Performance meets SLA (p95 < 200ms)  

---

## 📚 Reference Files

- Schema: `supabase/migrations/20251122_03_templates_media_schema.sql`
- API Server: `whatsapp-bot/api-server.js`
- Job Queue: `whatsapp-bot/src/queues/jobQueue.js`
- Webhooks: `whatsapp-bot/src/webhooks/webhookManager.js`
- Template Engine: `whatsapp-bot/src/templates/templateEngine.js`
- Media Manager: `whatsapp-bot/src/media/mediaManager.js`

---

**Implementation Status**: 🟢 Phase 6 Core Complete - Ready for Phase 7 Integration
