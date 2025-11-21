-- ============================================================
-- Smart WhatsApp Bot - Database Extensions
-- ============================================================
-- Add to existing migrations for enhanced features
-- These tables/functions support advanced bot features

-- ============================================================
-- CONVERSATION TRACKING & ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS bot_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id),
  date date DEFAULT CURRENT_DATE,
  total_messages integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  active_users integer DEFAULT 0,
  avg_order_value decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(merchant_id, date)
);

-- ============================================================
-- CUSTOMER INTERACTION HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS customer_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES merchants(id),
  interaction_type text NOT NULL CHECK (interaction_type IN ('browse', 'search', 'add_cart', 'remove_cart', 'checkout', 'view_order')),
  interaction_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_customer_interactions ON customer_interactions(customer_id, created_at DESC);

-- ============================================================
-- BOT COMMAND HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS bot_command_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone text NOT NULL,
  merchant_id uuid REFERENCES merchants(id),
  command text NOT NULL,
  arguments jsonb,
  response text,
  success boolean DEFAULT true,
  error_message text,
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_command_history_phone_date ON bot_command_history(customer_phone, created_at DESC);

-- ============================================================
-- CUSTOMER PREFERENCES - EXTENDED
-- ============================================================

ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS
  notification_settings jsonb DEFAULT '{
    "email": false,
    "whatsapp": true,
    "order_confirmation": true,
    "order_update": true,
    "promotional": false
  }'::jsonb;

ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS
  browsing_history uuid[] DEFAULT ARRAY[]::uuid[];

ALTER TABLE customer_preferences ADD COLUMN IF NOT EXISTS
  frequently_bought uuid[] DEFAULT ARRAY[]::uuid[];

-- ============================================================
-- CONVERSATION SESSION EXTENSIONS
-- ============================================================

ALTER TABLE conversation_sessions ADD COLUMN IF NOT EXISTS
  user_role text DEFAULT 'customer' CHECK (user_role IN ('customer', 'merchant', 'admin'));

ALTER TABLE conversation_sessions ADD COLUMN IF NOT EXISTS
  conversation_flow jsonb DEFAULT '{"visited_steps": [], "action_count": 0}'::jsonb;

ALTER TABLE conversation_sessions ADD COLUMN IF NOT EXISTS
  command_count integer DEFAULT 0;

-- ============================================================
-- ORDER FEEDBACK & RATINGS
-- ============================================================

CREATE TABLE IF NOT EXISTS order_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  delivery_rating integer CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  product_quality_rating integer CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
  would_recommend boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(order_id, customer_id)
);

-- ============================================================
-- MERCHANT PERFORMANCE METRICS
-- ============================================================

CREATE TABLE IF NOT EXISTS merchant_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL UNIQUE REFERENCES merchants(id) ON DELETE CASCADE,
  total_orders integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  avg_rating decimal(3,2),
  response_time_minutes integer,
  order_completion_rate decimal(5,2),
  customer_satisfaction_score decimal(5,2),
  last_updated timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- BOT AUTOMATION RULES
-- ============================================================

CREATE TABLE IF NOT EXISTS bot_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  rule_name text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('auto_response', 'auto_tag', 'auto_action')),
  trigger_condition jsonb,
  action jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PROMOTIONAL CAMPAIGNS
-- ============================================================

CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed', 'bogo')),
  discount_value decimal(10,2),
  start_date timestamptz,
  end_date timestamptz,
  min_order_amount decimal(10,2),
  max_discount decimal(10,2),
  applicable_products uuid[] DEFAULT ARRAY[]::uuid[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE bot_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_command_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Allow merchants to view their own analytics
CREATE POLICY "Merchants can view own analytics"
  ON bot_analytics FOR SELECT
  TO authenticated
  USING (merchant_id IN (SELECT id FROM merchants WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Allow customers to view own feedback
CREATE POLICY "Customers can view own feedback"
  ON order_feedback FOR SELECT
  TO authenticated
  USING (customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid()));

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_bot_analytics_merchant_date ON bot_analytics(merchant_id, date DESC);
CREATE INDEX idx_customer_interactions_merchant ON customer_interactions(merchant_id, created_at DESC);
CREATE INDEX idx_order_feedback_merchant ON order_feedback(order_id);
CREATE INDEX idx_merchant_metrics_score ON merchant_metrics(avg_rating DESC NULLS LAST);
CREATE INDEX idx_bot_rules_merchant_active ON bot_rules(merchant_id, is_active);
CREATE INDEX idx_promotions_active ON promotions(merchant_id, is_active);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to update merchant metrics
CREATE OR REPLACE FUNCTION update_merchant_metrics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE merchant_metrics
  SET
    total_orders = (SELECT COUNT(*) FROM orders WHERE merchant_id = NEW.merchant_id),
    total_revenue = (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE merchant_id = NEW.merchant_id AND status = 'delivered'),
    last_updated = now()
  WHERE merchant_id = NEW.merchant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics on new order
CREATE TRIGGER trigger_update_merchant_metrics_on_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_merchant_metrics();

-- ============================================================
-- DATA VIEWS FOR ANALYTICS
-- ============================================================

-- Top performing merchants
CREATE OR REPLACE VIEW top_merchants AS
SELECT
  m.id,
  m.business_name,
  mm.total_orders,
  mm.total_revenue,
  mm.avg_rating,
  mm.customer_satisfaction_score,
  u.phone_number
FROM merchants m
LEFT JOIN merchant_metrics mm ON m.id = mm.merchant_id
LEFT JOIN users u ON m.user_id = u.id
ORDER BY mm.total_revenue DESC NULLS LAST
LIMIT 20;

-- Customer purchase patterns
CREATE OR REPLACE VIEW customer_purchase_patterns AS
SELECT
  c.id,
  c.name,
  COUNT(o.id) as total_orders,
  AVG(o.total_amount) as avg_order_value,
  MAX(o.created_at) as last_order_date,
  ARRAY_AGG(DISTINCT o.merchant_id) as favorite_merchants
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;

-- Conversation summary
CREATE OR REPLACE VIEW conversation_summary AS
SELECT
  cs.customer_phone,
  COUNT(bm.id) as total_messages,
  MAX(bm.created_at) as last_message,
  cs.conversation_state->>'step' as current_step,
  cs.expires_at
FROM conversation_sessions cs
LEFT JOIN bot_messages bm ON cs.id = bm.conversation_session_id
GROUP BY cs.id, cs.customer_phone, cs.conversation_state, cs.expires_at;
