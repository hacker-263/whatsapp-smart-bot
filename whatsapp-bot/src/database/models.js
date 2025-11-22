/**
 * Database Models and Migrations
 * For blocked users, premium users, command logs, message stars, etc.
 */

// This would be used with Supabase or PostgreSQL

const databaseSchema = {
  // Blocked Users Table
  blocked_users: {
    name: 'blocked_users',
    sql: `
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  reason TEXT,
  blocked_at TIMESTAMP DEFAULT NOW(),
  blocked_by UUID REFERENCES users(id),
  unblocked_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_blocked_users_phone ON blocked_users(phone_number);
CREATE INDEX idx_blocked_users_active ON blocked_users(is_active);
    `
  },

  // Premium Users Table
  premium_users: {
    name: 'premium_users',
    sql: `
CREATE TABLE IF NOT EXISTS premium_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  tier VARCHAR(20) DEFAULT 'basic', -- basic, pro, enterprise
  added_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  added_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_premium_users_phone ON premium_users(phone_number);
CREATE INDEX idx_premium_users_expires ON premium_users(expires_at);
CREATE INDEX idx_premium_users_active ON premium_users(is_active);
    `
  },

  // Command Logs Table
  command_logs: {
    name: 'command_logs',
    sql: `
CREATE TABLE IF NOT EXISTS command_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  command VARCHAR(50) NOT NULL,
  arguments TEXT,
  status VARCHAR(20), -- success, failed, error
  response TEXT,
  execution_time INTEGER, -- milliseconds
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_command_logs_phone ON command_logs(phone_number);
CREATE INDEX idx_command_logs_command ON command_logs(command);
CREATE INDEX idx_command_logs_created ON command_logs(created_at);
    `
  },

  // Message Stars/Pins Table
  starred_messages: {
    name: 'starred_messages',
    sql: `
CREATE TABLE IF NOT EXISTS starred_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  chat_id VARCHAR(100) NOT NULL,
  message_id VARCHAR(100) NOT NULL,
  message_text TEXT,
  message_type VARCHAR(20), -- text, image, video, document
  starred_by VARCHAR(20),
  category VARCHAR(50), -- order, payment, important, etc
  notes TEXT,
  starred_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_starred_messages_phone ON starred_messages(phone_number);
CREATE INDEX idx_starred_messages_chat ON starred_messages(chat_id);
CREATE INDEX idx_starred_messages_category ON starred_messages(category);
    `
  },

  // Message Reactions Table
  message_reactions: {
    name: 'message_reactions',
    sql: `
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id VARCHAR(100) NOT NULL,
  message_id VARCHAR(100) NOT NULL,
  reacted_by VARCHAR(20) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  reaction_type VARCHAR(20), -- like, love, haha, wow, sad, angry
  reacted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_reactions_chat ON message_reactions(chat_id);
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_emoji ON message_reactions(emoji);
    `
  },

  // User Limits Table
  user_limits: {
    name: 'user_limits',
    sql: `
CREATE TABLE IF NOT EXISTS user_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  daily_limit INTEGER DEFAULT 100,
  hourly_limit INTEGER DEFAULT 10,
  commands_used_today INTEGER DEFAULT 0,
  commands_used_this_hour INTEGER DEFAULT 0,
  last_command_at TIMESTAMP,
  reset_today_at TIMESTAMP,
  reset_hour_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_limits_phone ON user_limits(phone_number);
CREATE INDEX idx_user_limits_reset ON user_limits(reset_today_at);
    `
  },

  // Chat Modifications Table (Archive, Mute, Pin history)
  chat_modifications: {
    name: 'chat_modifications',
    sql: `
CREATE TABLE IF NOT EXISTS chat_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id VARCHAR(100) NOT NULL,
  modification_type VARCHAR(20) NOT NULL, -- archive, mute, pin
  is_active BOOLEAN DEFAULT TRUE,
  duration INTEGER, -- for mute, in seconds
  modified_by VARCHAR(20) NOT NULL,
  reason TEXT,
  modified_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_modifications_chat ON chat_modifications(chat_id);
CREATE INDEX idx_chat_modifications_type ON chat_modifications(modification_type);
    `
  },

  // Broadcast Messages Table
  broadcast_messages: {
    name: 'broadcast_messages',
    sql: `
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id VARCHAR(100) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20), -- text, button, list, template
  broadcast_by VARCHAR(20) NOT NULL,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status VARCHAR(20), -- pending, sending, completed, failed
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_broadcast_messages_status ON broadcast_messages(status);
CREATE INDEX idx_broadcast_messages_created ON broadcast_messages(created_at);
    `
  },

  // Session Data Table
  session_data: {
    name: 'session_data',
    sql: `
CREATE TABLE IF NOT EXISTS session_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  session_key VARCHAR(100) UNIQUE NOT NULL,
  data JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_data_phone ON session_data(phone_number);
CREATE INDEX idx_session_data_key ON session_data(session_key);
CREATE INDEX idx_session_data_expires ON session_data(expires_at);
    `
  },

  // Forward Message History
  forwarded_messages: {
    name: 'forwarded_messages',
    sql: `
CREATE TABLE IF NOT EXISTS forwarded_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id VARCHAR(100) NOT NULL,
  forwarded_to_chat_id VARCHAR(100) NOT NULL,
  forwarded_by VARCHAR(20) NOT NULL,
  original_sender VARCHAR(20) NOT NULL,
  content TEXT,
  forward_count INTEGER DEFAULT 1,
  forwarded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forwarded_messages_original ON forwarded_messages(original_message_id);
CREATE INDEX idx_forwarded_messages_to_chat ON forwarded_messages(forwarded_to_chat_id);
    `
  },

  // Quote/Reply History
  message_quotes: {
    name: 'message_quotes',
    sql: `
CREATE TABLE IF NOT EXISTS message_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_message_id VARCHAR(100) NOT NULL,
  reply_message_id VARCHAR(100) NOT NULL,
  original_text TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  quoted_by VARCHAR(20) NOT NULL,
  chat_id VARCHAR(100) NOT NULL,
  quoted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_message_quotes_original ON message_quotes(original_message_id);
CREATE INDEX idx_message_quotes_reply ON message_quotes(reply_message_id);
CREATE INDEX idx_message_quotes_chat ON message_quotes(chat_id);
    `
  }
};

// Export for migration tools
module.exports = {
  tables: Object.values(databaseSchema).map(t => t.name),
  schema: databaseSchema,

  /**
   * Get all migration SQL
   */
  getMigrationSQL() {
    return Object.values(databaseSchema)
      .map(t => t.sql)
      .join('\n\n');
  },

  /**
   * Get specific table schema
   */
  getTableSchema(tableName) {
    return databaseSchema[tableName]?.sql || null;
  }
};
