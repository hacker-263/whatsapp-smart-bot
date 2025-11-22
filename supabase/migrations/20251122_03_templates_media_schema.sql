-- ============================================================
-- Message Templates & Media Management Schema
-- Date: 2025-11-22
-- Purpose: WhatsApp template rendering and media storage
-- ============================================================

-- 1. MESSAGE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'buttons', 'list', 'media')),
  language VARCHAR(10) DEFAULT 'en',
  body TEXT NOT NULL,
  buttons JSONB, -- [{id, label, callback_data}]
  sections JSONB, -- [{title, rows: [{id, title, description}]}]
  media JSONB, -- {type: 'image'|'document', url, caption}
  variables TEXT[] DEFAULT '{}', -- List of variables like ['name', 'order_id']
  example_payload JSONB,
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_buttons CHECK (
    (type != 'buttons') OR (buttons IS NOT NULL AND jsonb_array_length(buttons) > 0)
  ),
  CONSTRAINT valid_sections CHECK (
    (type != 'list') OR (sections IS NOT NULL AND jsonb_array_length(sections) > 0)
  ),
  CONSTRAINT valid_media CHECK (
    (type != 'media') OR (media IS NOT NULL)
  )
);

-- 2. TEMPLATE VERSIONS (Audit Trail)
CREATE TABLE IF NOT EXISTS template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES message_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  body TEXT NOT NULL,
  buttons JSONB,
  sections JSONB,
  media JSONB,
  variables TEXT[] DEFAULT '{}',
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, version)
);

-- 3. MEDIA FILES TABLE
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash VARCHAR(32) NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL UNIQUE,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  url VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  owner_id UUID REFERENCES auth.users(id),
  merchant_id UUID REFERENCES merchants(id),
  storage_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'ready' CHECK (status IN ('uploading', 'ready', 'processing', 'failed')),
  metadata JSONB, -- Additional file metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT owner_required CHECK (owner_id IS NOT NULL OR merchant_id IS NOT NULL)
);

-- 4. PRODUCT MEDIA MAPPING
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL DEFAULT 1,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, media_id),
  UNIQUE(product_id, sequence)
);

-- 5. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  actor_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL, -- 'template', 'product', 'order', etc.
  target_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_actor_id (actor_id),
  INDEX idx_target_id (target_id),
  INDEX idx_created_at (created_at)
);

-- 6. DELIVERY TASKS TABLE
CREATE TABLE IF NOT EXISTS delivery_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES merchants(id), -- Assign to driver/merchant
  status VARCHAR(50) DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'arrived', 'in_transit', 'delivered', 'failed', 'cancelled')
  ),
  pickup_coords POINT,
  dropoff_coords POINT,
  estimated_time_minutes INTEGER,
  distance_km NUMERIC,
  fee NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. WEBHOOKS TABLE
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL, -- 'order_created', 'order_status_changed', etc.
  url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  secret VARCHAR(255),
  retry_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. WEBHOOK LOGS
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_templates_status ON message_templates(status);
CREATE INDEX idx_templates_type ON message_templates(type);
CREATE INDEX idx_templates_language ON message_templates(language);
CREATE INDEX idx_media_owner ON media_files(owner_id);
CREATE INDEX idx_media_merchant ON media_files(merchant_id);
CREATE INDEX idx_media_created ON media_files(created_at);
CREATE INDEX idx_product_media ON product_media(product_id);
CREATE INDEX idx_delivery_status ON delivery_tasks(status);
CREATE INDEX idx_delivery_driver ON delivery_tasks(driver_id);
CREATE INDEX idx_webhooks_merchant ON webhooks(merchant_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Templates: Public read, admin/merchant write
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active templates" ON message_templates
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage all templates" ON message_templates
  FOR ALL
  USING (
    (SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

-- Media Files: Owner can manage, others read
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own media" ON media_files
  FOR SELECT
  USING (
    owner_id = auth.uid() OR merchant_id IN (
      SELECT id FROM merchants WHERE created_by = auth.uid()
    )
  );

-- Audit Logs: Admins only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins see audit logs" ON audit_logs
  FOR SELECT
  USING (
    (SELECT auth.jwt() ->> 'role') IN ('admin', 'super_admin')
  );

-- ============================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================

-- Update template updated_at on changes
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_timestamp_trigger
BEFORE UPDATE ON message_templates
FOR EACH ROW
EXECUTE FUNCTION update_template_timestamp();

-- Auto-create audit log on template update
CREATE OR REPLACE FUNCTION audit_template_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    before_state,
    after_state,
    ip_address
  ) VALUES (
    auth.uid(),
    (SELECT auth.jwt() ->> 'role'),
    CASE WHEN TG_OP = 'INSERT' THEN 'CREATE' ELSE TG_OP END,
    'template',
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN 
      jsonb_build_object('name', OLD.name, 'body', OLD.body)
    END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN 
      jsonb_build_object('name', NEW.name, 'body', NEW.body)
    END,
    inet_client_addr()
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_template_trigger
AFTER INSERT OR UPDATE OR DELETE ON message_templates
FOR EACH ROW
EXECUTE FUNCTION audit_template_changes();

-- ============================================================
-- DEFAULT TEMPLATES (Seed Data)
-- ============================================================

INSERT INTO message_templates (name, type, body, buttons, version, status, description)
VALUES
  (
    'order_confirmation',
    'buttons',
    'Order confirmed! 🎉\n\nOrder ID: {{order_id}}\nTotal: {{amount}}\nEstimated: {{eta}}',
    '[
      {"id": "track", "label": "📍 Track Order"},
      {"id": "help", "label": "❓ Help"}
    ]'::jsonb,
    1,
    'active',
    'Order confirmation with tracking button'
  ),
  (
    'payment_request',
    'buttons',
    'Payment needed for order {{order_id}}\n\nAmount: {{amount}}\nClick below to pay:',
    '[
      {"id": "pay_now", "label": "💳 Pay Now"},
      {"id": "cancel", "label": "Cancel"}
    ]'::jsonb,
    1,
    'active',
    'Payment request template'
  ),
  (
    'order_status',
    'text',
    'Order {{order_id}}: {{status}} ✓\n\nExpected delivery: {{delivery_date}}',
    NULL,
    1,
    'active',
    'Order status update'
  )
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Tables created:
-- 1. message_templates - Main templates storage
-- 2. template_versions - Version history
-- 3. media_files - File storage records
-- 4. product_media - Product-to-media mapping
-- 5. audit_logs - Action tracking
-- 6. delivery_tasks - Delivery management
-- 7. webhooks - Webhook subscriptions
-- 8. webhook_logs - Webhook execution logs
-- ============================================================
