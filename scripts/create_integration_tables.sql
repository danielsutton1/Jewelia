-- Phase 5: Integration Tables
-- Run this script manually in your Supabase SQL editor

-- Integrations Table
CREATE TABLE IF NOT EXISTS integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('accounting', 'ecommerce', 'email', 'payment', 'shipping', 'calendar')),
    provider VARCHAR(255) NOT NULL,
    api_key TEXT,
    api_secret TEXT,
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT false,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_interval INTEGER DEFAULT 3600,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_integration_name UNIQUE (name)
);

-- Webhook Events Table
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix VARCHAR(10) NOT NULL,
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_api_key_name UNIQUE (name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Enable RLS
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for now)
CREATE POLICY "Allow all for integrations" ON integrations FOR ALL USING (true);
CREATE POLICY "Allow all for webhook_events" ON webhook_events FOR ALL USING (true);
CREATE POLICY "Allow all for api_keys" ON api_keys FOR ALL USING (true);

-- Insert sample data
INSERT INTO integrations (name, type, provider, is_active, config) VALUES
('QuickBooks Online', 'accounting', 'QuickBooks', true, '{"version": "v3", "company_id": "sample"}'),
('Shopify Store', 'ecommerce', 'Shopify', true, '{"store_url": "sample-store.myshopify.com", "api_version": "2024-01"}'),
('Mailchimp Campaigns', 'email', 'Mailchimp', true, '{"audience_id": "sample-audience", "api_key": "sample-key"}'),
('Stripe Payments', 'payment', 'Stripe', true, '{"webhook_secret": "sample-secret", "api_version": "2024-01-01"}'),
('ShipStation Shipping', 'shipping', 'ShipStation', false, '{"warehouse_id": "sample-warehouse"}'),
('Google Calendar', 'calendar', 'Google', true, '{"calendar_id": "primary", "timezone": "UTC"}')
ON CONFLICT (name) DO NOTHING; 