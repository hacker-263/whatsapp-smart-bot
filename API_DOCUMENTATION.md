# 📚 Smart WhatsApp Bot API Documentation

## Overview

The Bot API Server provides REST endpoints for integrating the WhatsApp bot with your web platform. All endpoints are available at `http://localhost:4001` during local development.

---

## Authentication

Most endpoints don't require authentication for local testing but are rate-limited. In production, all requests should include:

```
Authorization: Bearer YOUR_API_KEY
```

---

## Response Format

All endpoints return JSON responses:

### Success Response
```json
{
  "success": true,
  "data": {
    // Endpoint-specific data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

---

## User Management APIs

### Register User
Create a new customer, merchant, or admin account.

**Endpoint**: `POST /api/users/register`

**Request**:
```json
{
  "name": "John Doe",
  "phone_number": "+263781234567",
  "email": "john@example.com",
  "role": "customer"  // or "merchant", "admin"
}
```

**Response**:
```json
{
  "success": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone_number": "+263781234567",
    "role": "customer"
  }
}
```

**Status Codes**:
- `200`: User created successfully
- `400`: Invalid input (missing required fields)
- `409`: User already exists
- `500`: Server error

**cURL Example**:
```bash
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone_number": "+263781234567",
    "role": "customer"
  }'
```

---

### Verify User
Verify if a user exists and retrieve their details.

**Endpoint**: `POST /api/users/verify`

**Request**:
```json
{
  "phone_number": "+263781234567"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone_number": "+263781234567",
    "role": "customer",
    "verified": true
  }
}
```

---

### Get User Profile
Retrieve detailed user information.

**Endpoint**: `GET /api/users/{phone_number}`

**Example**:
```bash
curl http://localhost:4001/api/users/263781234567
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "phone_number": "+263781234567",
    "role": "customer",
    "email": "john@example.com",
    "preferences": {
      "language": "en",
      "notifications": true
    },
    "created_at": "2025-11-21T10:30:00Z"
  }
}
```

---

## Product Catalog APIs

### List All Products
Get all active products (optionally filtered by merchant or category).

**Endpoint**: `GET /api/products`

**Query Parameters**:
- `merchant_id` (optional): Filter by merchant
- `category` (optional): Filter by category

**Example**:
```bash
curl "http://localhost:4001/api/products?category=food"
```

**Response**:
```json
{
  "success": true,
  "products": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "name": "Sadza & Beef",
      "description": "Traditional sadza with beef stew",
      "price": 5.50,
      "currency": "USD",
      "category": "food",
      "stock": 50,
      "image_url": "https://example.com/image.jpg"
    }
  ]
}
```

---

### Search Products
Search for products by name, description, or category.

**Endpoint**: `GET /api/products/search`

**Query Parameters**:
- `q` (required): Search query
- `merchant_id` (optional): Filter by merchant

**Example**:
```bash
curl "http://localhost:4001/api/products/search?q=sadza"
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "name": "Sadza & Beef",
      "price": 5.50,
      "currency": "USD"
    }
  ],
  "count": 1
}
```

---

## Shopping Cart APIs

### Add to Cart
Add a product to customer's cart.

**Endpoint**: `POST /api/cart/add`

**Request**:
```json
{
  "customer_phone": "+263781234567",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "product_id": "650e8400-e29b-41d4-a716-446655440000",
  "quantity": 2
}
```

**Response**:
```json
{
  "success": true,
  "cart": {
    "id": "750e8400-e29b-41d4-a716-446655440000",
    "items": [
      {
        "product_id": "650e8400-e29b-41d4-a716-446655440000",
        "product_name": "Sadza & Beef",
        "quantity": 2,
        "price": 5.50,
        "subtotal": 11.00
      }
    ],
    "total": 11.00,
    "currency": "USD"
  }
}
```

---

### Get Cart
Retrieve customer's current cart.

**Endpoint**: `GET /api/cart/{phone_number}`

**Query Parameters**:
- `merchant_id` (optional): Filter by merchant

**Example**:
```bash
curl "http://localhost:4001/api/cart/263781234567?merchant_id=550e8400-e29b-41d4-a716-446655440000"
```

**Response**: Same as add to cart

---

### Clear Cart
Remove all items from customer's cart.

**Endpoint**: `DELETE /api/cart/{phone_number}`

**Example**:
```bash
curl -X DELETE http://localhost:4001/api/cart/263781234567
```

**Response**:
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

---

## Order Management APIs

### Create Order
Place a new order from a cart.

**Endpoint**: `POST /api/orders`

**Request**:
```json
{
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_phone": "+263781234567",
  "items": [
    {
      "product_id": "650e8400-e29b-41d4-a716-446655440000",
      "quantity": 2,
      "price": 5.50
    }
  ],
  "total_amount": 11.00,
  "currency": "USD",
  "payment_method": "cash_on_delivery"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_phone": "+263781234567",
    "items": [...],
    "total_amount": 11.00,
    "currency": "USD",
    "status": "pending",
    "payment_status": "pending",
    "created_at": "2025-11-21T10:30:00Z"
  }
}
```

---

### Get Order
Retrieve order details by ID.

**Endpoint**: `GET /api/orders/{order_id}`

**Example**:
```bash
curl http://localhost:4001/api/orders/850e8400-e29b-41d4-a716-446655440000
```

**Response**: Order object (see Create Order response)

---

### List Orders
List orders by merchant or customer.

**Endpoint**: `GET /api/orders`

**Query Parameters**:
- `merchant_id`: Filter by merchant
- `customer_phone`: Filter by customer
- `status` (optional): Filter by status (pending, confirmed, delivered)

**Examples**:
```bash
# Customer's orders
curl "http://localhost:4001/api/orders?customer_phone=263781234567"

# Merchant's pending orders
curl "http://localhost:4001/api/orders?merchant_id=550e8400-e29b-41d4-a716-446655440000&status=pending"
```

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440000",
      "status": "pending",
      "total_amount": 11.00,
      "currency": "USD",
      "created_at": "2025-11-21T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### Update Order Status
Change order status (admin/merchant only).

**Endpoint**: `PATCH /api/orders/{order_id}/status`

**Request**:
```json
{
  "status": "confirmed"  // pending, confirmed, preparing, dispatched, delivered, cancelled
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "850e8400-e29b-41d4-a716-446655440000",
    "status": "confirmed",
    "updated_at": "2025-11-21T10:31:00Z"
  }
}
```

**Valid Status Values**:
- `pending` - Order received
- `confirmed` - Order confirmed by merchant
- `preparing` - Currently being prepared
- `dispatched` - On the way
- `delivered` - Order completed
- `cancelled` - Order cancelled

---

## Message & Conversation APIs

### Send Message
Send a message through the bot.

**Endpoint**: `POST /api/messages/send`

**Request**:
```json
{
  "customer_phone": "+263781234567",
  "merchant_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Your order has been confirmed!"
}
```

**Response**:
```json
{
  "success": true,
  "message": {
    "id": "950e8400-e29b-41d4-a716-446655440000",
    "direction": "outgoing",
    "content": "Your order has been confirmed!",
    "created_at": "2025-11-21T10:31:00Z"
  }
}
```

---

### Get Conversation
Retrieve conversation session and history.

**Endpoint**: `GET /api/conversations/{phone_number}`

**Example**:
```bash
curl http://localhost:4001/api/conversations/263781234567
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": "050e8400-e29b-41d4-a716-446655440000",
    "customer_phone": "+263781234567",
    "conversation_state": {
      "step": "browsing",
      "context": {}
    },
    "last_message_at": "2025-11-21T10:31:00Z",
    "expires_at": "2025-11-22T10:31:00Z"
  },
  "messages": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440000",
      "direction": "incoming",
      "content": "Show me your menu",
      "created_at": "2025-11-21T10:30:00Z"
    }
  ]
}
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Burst**: Up to 10 requests per second

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700576400
```

If limit exceeded: HTTP 429 (Too Many Requests)

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid input or missing fields |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

---

## Webhook Notifications

When orders are updated, the bot sends notifications via WhatsApp. The system fires webhooks for:

- Order created
- Order confirmed
- Order dispatched
- Order delivered
- Payment received
- Payment failed

Configure webhook URL in merchant settings.

---

## Testing

### Using cURL
```bash
# Register customer
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone_number":"+263781234567","role":"customer"}'

# Get products
curl http://localhost:4001/api/products

# Search
curl "http://localhost:4001/api/products/search?q=sadza"
```

### Using Postman
1. Import the collection from `docs/api-collection.json`
2. Set `{{baseUrl}}` = `http://localhost:4001`
3. Run requests

### Using JavaScript
```javascript
const response = await fetch('http://localhost:4001/api/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

---

## Best Practices

1. **Phone Formatting**: Always include country code (e.g., +263, +27)
2. **IDs**: Use UUID format for all entity IDs
3. **Timestamps**: Always use ISO 8601 format (2025-11-21T10:30:00Z)
4. **Error Handling**: Check `success` field and handle errors gracefully
5. **Pagination**: Implement pagination for list endpoints (future)
6. **Caching**: Cache product lists for better performance
7. **Retries**: Implement exponential backoff for failed requests

---

## Support

For API issues:
1. Check error message and error code
2. Review logs: `docker-compose logs`
3. Test endpoint manually with cURL
4. Check database directly: `docker-compose exec postgres psql ...`

