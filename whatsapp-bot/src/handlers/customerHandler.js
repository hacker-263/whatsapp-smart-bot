/**
 * Customer Command Handlers
 * Manages browsing, searching, cart operations, orders
 */

const backendAPI = require('../api/backendAPI');
const authMiddleware = require('../middlewares/auth');
const cache = require('../database/cache');
const MessageFormatter = require('../utils/messageFormatter');
const Logger = require('../config/logger');

const logger = new Logger('CustomerHandler');

class CustomerHandler {
  /**
   * Handle customer commands
   */
  async handleCustomerCommand(command, args, from, phoneNumber) {
    try {
      const session = await cache.getUserSession(phoneNumber);

      // Add to command history
      await cache.addCommandHistory(phoneNumber, `customer ${command}`);

      switch (command) {
        // Browsing
        case 'menu':
        case 'm':
          return await this.handleMenuCommand(args, phoneNumber, from);
        
        case 'search':
          return await this.handleSearchCommand(args.join(' '), phoneNumber, from);
        
        case 'categories':
          return await this.handleCategoriesCommand(phoneNumber, from);
        
        case 'nearby':
          return await this.handleNearbyCommand(args, phoneNumber, from);
        
        case 'store':
          return await this.handleStoreDetailsCommand(args[0], phoneNumber, from);
        
        // Cart operations
        case 'add':
          return await this.handleAddToCartCommand(args, phoneNumber, from);
        
        case 'cart':
        case 'c':
          return await this.handleShowCartCommand(phoneNumber, from);
        
        case 'remove':
          return await this.handleRemoveFromCartCommand(args[0], phoneNumber, from);
        
        case 'clear':
          return await this.handleClearCartCommand(phoneNumber, from);
        
        // Checkout & Orders
        case 'checkout':
        case 'pay':
          return await this.handleCheckoutCommand(phoneNumber, from);
        
        case 'orders':
          return await this.handleOrdersCommand(phoneNumber, from);
        
        case 'reorder':
          return await this.handleReorderCommand(args[0], phoneNumber, from);
        
        case 'track':
        case 'status':
          return await this.handleTrackOrderCommand(args[0], phoneNumber, from);
        
        case 'rate':
          return await this.handleRateOrderCommand(args[0], args[1], phoneNumber, from);
        
        // Preferences
        case 'favorites':
          return await this.handleFavoritesCommand(args, phoneNumber, from);
        
        case 'addresses':
          return await this.handleAddressesCommand(args, phoneNumber, from);
        
        case 'deals':
          return await this.handleDealsCommand(phoneNumber, from);
        
        case 'trending':
          return await this.handleTrendingCommand(phoneNumber, from);
        
        case 'promo':
          return await this.handlePromoCommand(phoneNumber, from);
        
        case 'featured':
          return await this.handleFeaturedCommand(phoneNumber, from);
        
        default:
          return null;
      }
    } catch (error) {
      logger.error('Customer command error', error);
      return { error: error.message };
    }
  }

  /**
   * !menu or !m
   */
  async handleMenuCommand(args, phoneNumber, from) {
    // Dummy products for demo
    const dummyProducts = [
      { id: 'prod_001', name: 'Margherita Pizza', price: 2500, rating: 4.8, reviews: 156, merchant: 'Quick Eats', image: '🍕' },
      { id: 'prod_002', name: 'Fried Chicken Combo', price: 3200, rating: 4.6, reviews: 234, merchant: 'KFC Harare', image: '🍗' },
      { id: 'prod_003', name: 'Fresh Bread Loaf', price: 450, rating: 4.9, reviews: 89, merchant: 'Local Bakery', image: '🍞' },
      { id: 'prod_004', name: 'Cold Bottle Coke', price: 350, rating: 4.7, reviews: 445, merchant: 'Refresh Shop', image: '🥤' },
      { id: 'prod_005', name: 'Beef Burger', price: 1500, rating: 4.5, reviews: 312, merchant: 'Burger King', image: '🍔' },
      { id: 'prod_006', name: 'Fresh Vegetables Pack', price: 800, rating: 4.8, reviews: 167, merchant: 'Farmers Market', image: '🥬' },
      { id: 'prod_007', name: 'Grilled Fish Fillet', price: 2800, rating: 4.9, reviews: 203, merchant: 'Sea Foods', image: '🐟' },
      { id: 'prod_008', name: 'Mixed Fruit Salad', price: 600, rating: 4.7, reviews: 134, merchant: 'Health Hub', image: '🥗' },
      { id: 'prod_009', name: 'Chocolate Cake', price: 1200, rating: 4.8, reviews: 178, merchant: 'Sweet Treats', image: '🎂' },
      { id: 'prod_010', name: 'Orange Juice 500ml', price: 280, rating: 4.6, reviews: 267, merchant: 'Fresh Juices', image: '🧃' },
      { id: 'prod_011', name: 'Rice & Beans Meal', price: 1800, rating: 4.7, reviews: 189, merchant: 'Traditional Kitchen', image: '🍛' },
      { id: 'prod_012', name: 'Chicken Sadza Combo', price: 2000, rating: 4.8, reviews: 156, merchant: 'Local Market', image: '🍲' },
    ];

    const response = await backendAPI.getProducts({});
    const products = response?.success ? response.data.slice(0, 12) : dummyProducts;

    let message = `
╔════════════════════════════════════════════════════════════════════════╗
║ 🛒  MENU - AVAILABLE PRODUCTS
╠════════════════════════════════════════════════════════════════════════╣
║
`;

    products.forEach((product, i) => {
      const image = product.image || '📦';
      const name = (product.name || 'Product').substring(0, 28);
      const price = `ZWL ${(product.price || 0).toFixed(0)}`.substring(0, 10);
      const rating = MessageFormatter.getStarRating(product.rating || 0);
      message += `║ ${(i + 1).toString().padStart(2)}. ${image} ${name.padEnd(28)} │ ${price.padEnd(10)} │ ${rating}\n`;
    });

    message += `║
╠════════════════════════════════════════════════════════════════════════╣
║ 💡 HOW TO ORDER
║ ┌────────────────────────────────────────────────────────────────────┐
║ │ !add <number> <qty>  → Add to cart (e.g., !add 5 2)               │
║ │ !search <name>       → Search for items (e.g., !search pizza)     │
║ │ !cart                → View your shopping cart                    │
║ │ !deals               → See special discounts                      │
║ │ !trending            → Top trending items                         │
║ └────────────────────────────────────────────────────────────────────┘
║
╚════════════════════════════════════════════════════════════════════════╝
    `.trim();

    return { message };
  }

  /**
   * !search <query>
   */
  async handleSearchCommand(query, phoneNumber, from) {
    if (!query || query.length < 2) {
      return { error: 'Search query too short. Try: !search noodles' };
    }

    const response = await backendAPI.searchProducts(query);
    if (!response.success || response.data.length === 0) {
      return { message: `❌ No products found for "*${query}*"\n\n💡 Try searching with different keywords or browse categories with !categories` };
    }

    let message = `
╔════════════════════════════════════════════════╗
║ 🔎  SEARCH RESULTS
╠════════════════════════════════════════════════╣
║ Query: *${query}*
║ Found: ${response.data.length} results
╠════════════════════════════════════════════════╣
║
`;
    const results = response.data.slice(0, 10);

    results.forEach((product, i) => {
      message += `║ ${(i + 1).toString().padStart(2)}. *${product.name.substring(0, 25)}*
║    🏪 ${product.merchant_name.substring(0, 25)}
║    💰 ZWL ${product.price.toFixed(2).padEnd(8)} ⭐ ${product.rating || 'N/A'}
║
`;
    });

    if (response.data.length > 10) {
      message += `║ ... and ${response.data.length - 10} more results\n║\n`;
    }

    message += `╠════════════════════════════════════════════════╣
║ 🛒 Quick Action:
║ !add <number> <quantity>
║ Example: !add 3 2
╚════════════════════════════════════════════════╝
    `.trim();

    return { message };
  }

  /**
   * !categories
   */
  async handleCategoriesCommand(phoneNumber, from) {
    const categories = [
      '🍔 Food & Restaurants',
      '🛍️ Retail & Shopping',
      '📚 Books & Media',
      '👕 Fashion & Apparel',
      '🏥 Health & Wellness',
      '⚙️ Electronics',
      '🌿 Groceries',
    ];

    let message = `*📂 Product Categories*\n━━━━━━━━━━━━━━━\n\n`;
    categories.forEach((cat, i) => {
      message += `${i + 1}. ${cat}\n`;
    });

    message += `\nTo browse: *!search <category>*`;

    return { message };
  }

  /**
   * !nearby [category]
   */
  async handleNearbyCommand(args, phoneNumber, from) {
    const category = args[0] || 'all';

    let message = `*📍 Stores Near You*\n━━━━━━━━━━━━━━━\n\n`;
    message += `Harare & Bulawayo Area:\n\n`;
    message += `🏪 Top Stores:\n`;
    message += `1. Supa Stores - 2km away ⭐⭐⭐⭐⭐\n`;
    message += `2. Quick Mart - 3.5km away ⭐⭐⭐⭐\n`;
    message += `3. Local Bakery - 1.2km away ⭐⭐⭐⭐⭐\n\n`;

    message += `To view store: *!store <store_id>*\n`;
    message += `To search items: *!search <item>*`;

    return { message };
  }

  /**
   * !store <store_id>
   */
  async handleStoreDetailsCommand(storeId, phoneNumber, from) {
    if (!storeId) {
      return { error: 'Usage: !store <store_id>' };
    }

    const response = await backendAPI.getMerchantProfile(storeId);
    if (!response.success) {
      return { error: 'Store not found' };
    }

    return { message: MessageFormatter.formatMerchantProfile(response.data) };
  }

  /**
   * !add <product_id> <quantity>
   */
  async handleAddToCartCommand(args, phoneNumber, from) {
    if (!args[0] || !args[1]) {
      return { error: 'Usage: !add <product_id> <quantity>\nExample: !add prod123 2' };
    }

    const productId = args[0];
    const quantity = parseInt(args[1]);

    if (isNaN(quantity) || quantity < 1) {
      return { error: 'Invalid quantity. Must be a number ≥ 1' };
    }

    // Fetch product details
    const productRes = await backendAPI.getProductDetails(productId);
    if (!productRes.success) {
      return { error: 'Product not found' };
    }

    const product = productRes.data;

    // Get current cart
    let cart = await cache.getUserCart(phoneNumber);
    if (!cart.items) cart.items = [];

    // Check if product already in cart
    const existingItem = cart.items.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        id: productId,
        name: product.name,
        price: product.price,
        quantity,
        merchant_id: product.merchant_id,
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Save cart
    await cache.setUserCart(phoneNumber, cart);

    return {
      message: MessageFormatter.formatSuccess(
        `Added ${quantity}x ${product.name} to cart!\n\n💰 Cart Total: ZWL ${cart.total.toFixed(2)}\n\nType *!cart* to view or *!checkout* to order`
      ),
    };
  }

  /**
   * !cart or !c
   */
  async handleShowCartCommand(phoneNumber, from) {
    const cart = await cache.getUserCart(phoneNumber);
    return { message: MessageFormatter.formatCart(cart) };
  }

  /**
   * !remove <item_index>
   */
  async handleRemoveFromCartCommand(itemIndex, phoneNumber, from) {
    if (!itemIndex) {
      return { error: 'Usage: !remove <item_index>\nGet index from !cart command' };
    }

    const index = parseInt(itemIndex) - 1;
    let cart = await cache.getUserCart(phoneNumber);

    if (index < 0 || index >= cart.items.length) {
      return { error: 'Invalid item index' };
    }

    const removed = cart.items.splice(index, 1)[0];
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cache.setUserCart(phoneNumber, cart);

    return {
      message: MessageFormatter.formatSuccess(
        `Removed ${removed.name} from cart\n\nNew Total: ZWL ${cart.total.toFixed(2)}`
      ),
    };
  }

  /**
   * !clear
   */
  async handleClearCartCommand(phoneNumber, from) {
    await cache.clearUserCart(phoneNumber);
    return { message: '✨ Cart cleared!' };
  }

  /**
   * !checkout or !pay
   */
  async handleCheckoutCommand(phoneNumber, from) {
    const cart = await cache.getUserCart(phoneNumber);

    if (!cart.items || cart.items.length === 0) {
      return { message: `
╔════════════════════════════════════════╗
║ 🛒  CART IS EMPTY
╠════════════════════════════════════════╣
║
║ Start shopping now:
║ • !menu             (browse all items)
║ • !search <item>    (search for items)
║ • !categories       (view categories)
║ • !deals            (see hot deals)
║
╚════════════════════════════════════════╝
      ` };
    }

    const session = await cache.getUserSession(phoneNumber);

    // Create order in backend
    const orderRes = await backendAPI.createOrder(phoneNumber, {
      items: cart.items,
      total: cart.total,
      customer_name: session?.name || 'Customer',
      delivery_type: 'delivery',
      delivery_address: session?.delivery_address || '',
    });

    if (!orderRes.success) {
      return { error: `Failed to create order: ${orderRes.error}` };
    }

    const order = orderRes.data;

    // Clear cart after successful order
    await cache.clearUserCart(phoneNumber);

    const message = `
╔════════════════════════════════════════════════╗
║ ✅  ORDER PLACED SUCCESSFULLY!
╠════════════════════════════════════════════════╣
║
║ 🎉 Thank you for your order!
║
║ 📦 Order ID: ${order.id}
║ 💰 Total:    ZWL ${order.total.toFixed(2)}
║ 📍 Delivery: ${session?.delivery_address || 'Will be requested'}
║
╠════════════════════════════════════════════════╣
║
║ 📊 What's Next?
║ ┌──────────────────────────────────────────┐
║ │ ✅ Your order has been sent to merchant  │
║ │ 🔔 You'll get updates as it progresses   │
║ │ 📍 Track order: !track ${order.id}
║ │ 📞 Contact support if needed             │
║ └──────────────────────────────────────────┘
║
║ 🔘 Quick Actions:
║ • !orders    (view all orders)
║ • !menu      (continue shopping)
║ • !track ${order.id}  (track this order)
║
╚════════════════════════════════════════════════╝
    `.trim();

    return { message };
  }

  /**
   * !orders
   */
  async handleOrdersCommand(phoneNumber, from) {
    const response = await backendAPI.getCustomerOrders(phoneNumber);
    if (!response.success || response.data.length === 0) {
      return { message: 'You have no orders yet. Type !menu to browse and !add to order.' };
    }

    const orders = response.data.slice(0, 10);
    let message = `*📦 Your Orders (${orders.length})*\n━━━━━━━━━━━━━━━\n\n`;

    orders.forEach((order, i) => {
      message += `${i + 1}. Order #${order.id}\n`;
      message += `   🏪 ${order.merchant_name}\n`;
      message += `   💰 ZWL ${order.total.toFixed(2)}\n`;
      message += `   Status: ${MessageFormatter.getStatusEmoji(order.status)} ${order.status}\n`;
      message += `   Date: ${new Date(order.created_at).toLocaleDateString()}\n\n`;
    });

    message += `To track: *!track <order_id>*\n`;
    message += `To reorder: *!reorder <order_id>*`;

    return { message };
  }

  /**
   * !reorder <order_id>
   */
  async handleReorderCommand(orderId, phoneNumber, from) {
    if (!orderId) {
      return { error: 'Usage: !reorder <order_id>' };
    }

    const orderRes = await backendAPI.getOrderStatus(orderId);
    if (!orderRes.success) {
      return { error: 'Order not found' };
    }

    const order = orderRes.data;
    let cart = await cache.getUserCart(phoneNumber);

    // Add items from previous order to cart
    order.items.forEach(item => {
      const existing = cart.items.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
    });

    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cache.setUserCart(phoneNumber, cart);

    return {
      message: MessageFormatter.formatSuccess(
        `Reordered items from Order #${orderId}!\n\n💰 New Cart Total: ZWL ${cart.total.toFixed(2)}\n\nType *!checkout* to place order`
      ),
    };
  }

  /**
   * !track <order_id>
   */
  async handleTrackOrderCommand(orderId, phoneNumber, from) {
    if (!orderId) {
      return { error: 'Usage: !track <order_id>' };
    }

    const response = await backendAPI.getOrderStatus(orderId);
    if (!response.success) {
      return { error: 'Order not found' };
    }

    return { message: MessageFormatter.formatOrder(response.data) };
  }

  /**
   * !rate <order_id> <rating>
   */
  async handleRateOrderCommand(orderId, rating, phoneNumber, from) {
    if (!orderId || !rating) {
      return { error: 'Usage: !rate <order_id> <rating_1_to_5>' };
    }

    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return { error: 'Rating must be 1 to 5' };
    }

    // Post rating to backend
    const response = await backendAPI.request('POST', `/api/orders/${orderId}/rating`, {
      customer_phone: phoneNumber,
      rating: ratingNum,
    });

    if (!response.success) {
      return { error: 'Failed to save rating' };
    }

    return { message: MessageFormatter.formatSuccess(`Thanks for your ${ratingNum}⭐ rating!`) };
  }

  /**
   * !favorites [add|remove|list] <store_id>
   */
  async handleFavoritesCommand(args, phoneNumber, from) {
    const action = args[0]?.toLowerCase() || 'list';

    if (action === 'list') {
      let message = `*❤️ Your Favorite Stores*\n━━━━━━━━━━━━━━━\n\n`;
      message += `1. Supa Stores\n2. Quick Mart\n3. Local Bakery\n\n`;
      message += `To add: *!favorites add <store_id>*\n`;
      message += `To remove: *!favorites remove <store_id>*`;

      return { message };
    }

    if (action === 'add' && args[1]) {
      return { message: MessageFormatter.formatSuccess(`Store added to favorites!`) };
    }

    if (action === 'remove' && args[1]) {
      return { message: MessageFormatter.formatSuccess(`Store removed from favorites`) };
    }

    return { error: 'Usage: !favorites [list|add|remove] [store_id]' };
  }

  /**
   * !addresses [list|add|remove] [address]
   */
  async handleAddressesCommand(args, phoneNumber, from) {
    const action = args[0]?.toLowerCase() || 'list';

    if (action === 'list') {
      let message = `*📍 Your Delivery Addresses*\n━━━━━━━━━━━━━━━\n\n`;
      message += `1. 123 Main Street, Harare\n2. 456 Work Ave, CBD\n\n`;
      message += `To add: *!addresses add <address>*\n`;
      message += `To remove: *!addresses remove <number>*`;

      return { message };
    }

    return { error: 'Usage: !addresses [list|add|remove]' };
  }

  /**
   * !deals - Show special deals and promotions
   */
  async handleDealsCommand(phoneNumber, from) {
    return {
      message: `
╔════════════════════════════════════════════════════════════════════════╗
║ 🎉  SPECIAL DEALS & PROMOTIONS
╠════════════════════════════════════════════════════════════════════════╣
║
║ 🔥 HOT DEALS (Today Only)
║ ┌────────────────────────────────────────────────────────────────────┐
║ │ 🛒 30% OFF on Groceries - Shop Now!
║ │ 🍕 Buy 2 Pizzas Get 1 Free at Quick Eats
║ │ 🚚 FREE Delivery on Orders over ZWL 500
║ └────────────────────────────────────────────────────────────────────┘
║
║ ⏰ LIMITED TIME OFFERS
║ ┌────────────────────────────────────────────────────────────────────┐
║ │ ⚡ Flash Sale: 50% off Electronics (Ends 20:00)
║ │ 🌅 Breakfast Special: 40% off from 7-10am
║ │ 🌙 Night Deal: ZWL 100 off orders after 21:00
║ └────────────────────────────────────────────────────────────────────┘
║
║ 🎁 NEW CUSTOMER BONUS
║ ┌────────────────────────────────────────────────────────────────────┐
║ │ 💝 First Order: 20% OFF (Max ZWL 50)
║ │ 🔖 Use Code: WELCOME20
║ │ ✨ Valid for 30 days from registration
║ └────────────────────────────────────────────────────────────────────┘
║
║ 💳 REFERRAL REWARDS
║ ├─ Refer a friend: Get ZWL 50 credit
║ ├─ Friend gets: 15% OFF their first order
║ └─ Unlimited referrals!
║
╠════════════════════════════════════════════════════════════════════════╣
║ Type !search <item> to find deals on specific products
║ Type !trending to see what's popular
╚════════════════════════════════════════════════════════════════════════╝
      `.trim(),
    };
  }

  /**
   * !trending - Show trending and popular items
   */
  async handleTrendingCommand(phoneNumber, from) {
    const trendingItems = [
      { name: 'Margherita Pizza', merchant: 'Quick Eats', sales: 324, rating: 4.8, emoji: '🍕' },
      { name: 'Fried Chicken', merchant: 'KFC Harare', sales: 267, rating: 4.6, emoji: '🍗' },
      { name: 'Fresh Milk 1L', merchant: 'Farmers Market', sales: 189, rating: 4.9, emoji: '🥛' },
      { name: 'Sadza & Relish', merchant: 'Traditional Kitchen', sales: 156, rating: 4.7, emoji: '🍲' },
      { name: 'Beef Burger', merchant: 'Burger King', sales: 145, rating: 4.5, emoji: '🍔' },
    ];

    let message = `
╔════════════════════════════════════════════════════════════════════════╗
║ 🔥  TRENDING NOW - TOP 5 POPULAR ITEMS
╠════════════════════════════════════════════════════════════════════════╣
║
`;

    trendingItems.forEach((item, i) => {
      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
      const trendBar = '█'.repeat(Math.floor(item.sales / 50)) + '░'.repeat(8 - Math.floor(item.sales / 50));
      message += `║ ${medal} #${rank}. ${item.emoji}  ${item.name.padEnd(20)} │ ${item.merchant.substring(0, 15).padEnd(15)}\n`;
      message += `║     ⭐ ${item.rating.toFixed(1)}   │ ${trendBar}  ${item.sales} orders\n`;
      message += `║\n`;
    });

    message += `╠════════════════════════════════════════════════════════════════════════╣
║ 💡 Recommendations:
║ • These items are loved by 1000+ customers
║ • Fast delivery available for all trending items
║ • Try them now before they run out!
║
║ Order any trending item: !add <name> <qty>
╚════════════════════════════════════════════════════════════════════════╝
    `.trim();

    return { message };
  }

  /**
   * !promo - Show promotional codes and vouchers
   */
  async handlePromoCommand(phoneNumber, from) {
    return {
      message: `
╔════════════════════════════════════════════════════════════════════════╗
║ 🎟️   PROMOTIONAL CODES & VOUCHERS
╠════════════════════════════════════════════════════════════════════════╣
║
║ 📌 ACTIVE CODES (November 2025)
║ ┌────────────────────────────────────────────────────────────────────┐
║ │ Code: WELCOME20      │ Discount: 20% OFF first order
║ │ Code: WEEKEND50      │ Discount: 50% OFF on weekends
║ │ Code: FOOD15         │ Discount: 15% OFF food orders
║ │ Code: LUCKY100       │ Discount: ZWL 100 OFF orders > ZWL 500
║ │ Code: VIP200         │ Discount: ZWL 200 OFF (Min 3 orders)
║ │ Code: REFER2024      │ Discount: ZWL 75 referral credit
║ └────────────────────────────────────────────────────────────────────┘
║
║ ✅ HOW TO USE CODES
║ 1. Add items to cart: !add <item> <qty>
║ 2. At checkout: Enter promo code
║ 3. Discount applied automatically!
║
║ 🎯 MERCHANT-SPECIFIC VOUCHERS
║ • Quick Eats: Buy 2 Get 1 Free (Pizzas)
║ • KFC Harare: Combo meals 25% OFF
║ • Local Bakery: Free bread with every purchase > ZWL 1000
║ • Farmers Market: Fresh produce 20% OFF daily 5-7pm
║
║ 🔔 SUBSCRIBE to our newsletter for exclusive codes!
║ Type !feedback to request new promotional offers
║
╚════════════════════════════════════════════════════════════════════════╝
      `.trim(),
    };
  }

  /**
   * !featured - Show featured merchants and collections
   */
  async handleFeaturedCommand(phoneNumber, from) {
    return {
      message: `
╔════════════════════════════════════════════════════════════════════════╗
║ ⭐  FEATURED MERCHANTS & COLLECTIONS
╠════════════════════════════════════════════════════════════════════════╣
║
║ 👑 MERCHANT OF THE WEEK
║ ┌────────────────────────────────────────────────────────────────────┐
║ │ 🏪 Quick Eats - Premium Italian & Pizza
║ │ ⭐ Rating: 4.8/5.0 (342 reviews)
║ │ 📍 Location: Harare CBD
║ │ 🚚 Free delivery on orders > ZWL 500
║ │ ⏱️  Delivery time: 25-35 minutes
║ │ 💰 Avg price: ZWL 2,500
║ │ 🎁 Special: Buy 2 Pizzas Get 1 Free Today!
║ └────────────────────────────────────────────────────────────────────┘
║
║ 🆕 NEW MERCHANTS
║ ├─ 🍲 Traditional Kitchen - Authentic Zimbabwean Cuisine
║ ├─ 🥗 Health Hub - Organic & Healthy Meals
║ └─ 🍦 Sweet Treats - Cakes & Desserts
║
║ 📦 COLLECTIONS & CATEGORIES
║ ├─ 🍕 Pizza Paradise - All pizza places in one place
║ ├─ 🍜 Quick Meals - Fast delivery within 20 mins
║ ├─ 💪 Healthy Eating - Low-cal & nutritious
║ └─ 🎉 Party Pack Specials - Perfect for gatherings
║
╠════════════════════════════════════════════════════════════════════════╣
║ Tap on a merchant name to browse their menu
║ !search <merchant_name> to find specific stores
╚════════════════════════════════════════════════════════════════════════╝
      `.trim(),
    };
  }
}

module.exports = new CustomerHandler();
