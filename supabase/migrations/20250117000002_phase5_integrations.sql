-- Phase 5: Advanced Features & Integrations
-- Integration System Database Schema

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
    sync_interval INTEGER DEFAULT 3600, -- seconds
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

-- Integration Sync History Table
CREATE TABLE IF NOT EXISTS integration_sync_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    sync_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_synced INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    metadata JSONB
);

-- API Keys Table for External Services
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

-- Integration Mappings Table (for data field mapping between systems)
CREATE TABLE IF NOT EXISTS integration_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    source_field VARCHAR(255) NOT NULL,
    target_field VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    transformation_rule JSONB,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_field_mapping UNIQUE (integration_id, source_field, target_field)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_active ON integrations(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration ON webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_history_integration ON integration_sync_history(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON integration_sync_history(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_mappings_integration ON integration_mappings(integration_id);

-- Create RLS policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for integrations
CREATE POLICY "Users can view integrations" ON integrations
    FOR SELECT USING (auth.uid() = created_by OR auth.role() = 'admin');

CREATE POLICY "Users can create integrations" ON integrations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their integrations" ON integrations
    FOR UPDATE USING (auth.uid() = created_by OR auth.role() = 'admin');

CREATE POLICY "Users can delete their integrations" ON integrations
    FOR DELETE USING (auth.uid() = created_by OR auth.role() = 'admin');

-- RLS Policies for webhook_events
CREATE POLICY "Users can view webhook events" ON webhook_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = webhook_events.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

CREATE POLICY "System can create webhook events" ON webhook_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update webhook events" ON webhook_events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = webhook_events.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

-- RLS Policies for integration_sync_history
CREATE POLICY "Users can view sync history" ON integration_sync_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = integration_sync_history.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

CREATE POLICY "System can create sync history" ON integration_sync_history
    FOR INSERT WITH CHECK (true);

-- RLS Policies for api_keys
CREATE POLICY "Users can view their API keys" ON api_keys
    FOR SELECT USING (auth.uid() = created_by OR auth.role() = 'admin');

CREATE POLICY "Users can create API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = created_by OR auth.role() = 'admin');

CREATE POLICY "Users can delete their API keys" ON api_keys
    FOR DELETE USING (auth.uid() = created_by OR auth.role() = 'admin');

-- RLS Policies for integration_mappings
CREATE POLICY "Users can view integration mappings" ON integration_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = integration_mappings.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

CREATE POLICY "Users can create integration mappings" ON integration_mappings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = integration_mappings.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

CREATE POLICY "Users can update integration mappings" ON integration_mappings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = integration_mappings.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

CREATE POLICY "Users can delete integration mappings" ON integration_mappings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM integrations 
            WHERE integrations.id = integration_mappings.integration_id 
            AND (integrations.created_by = auth.uid() OR auth.role() = 'admin')
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_integration_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER update_integration_mappings_updated_at
    BEFORE UPDATE ON integration_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_mapping_updated_at();

-- Function to clean up old webhook events
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS void AS $$
BEGIN
    DELETE FROM webhook_events 
    WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('processed', 'failed');
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old sync history
CREATE OR REPLACE FUNCTION cleanup_old_sync_history()
RETURNS void AS $$
BEGIN
    DELETE FROM integration_sync_history 
    WHERE completed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Insert sample integrations for testing
INSERT INTO integrations (name, type, provider, is_active, config) VALUES
('QuickBooks Online', 'accounting', 'QuickBooks', true, '{"version": "v3", "company_id": "sample"}'),
('Shopify Store', 'ecommerce', 'Shopify', true, '{"store_url": "sample-store.myshopify.com", "api_version": "2024-01"}'),
('Mailchimp Campaigns', 'email', 'Mailchimp', true, '{"audience_id": "sample-audience", "api_key": "sample-key"}'),
('Stripe Payments', 'payment', 'Stripe', true, '{"webhook_secret": "sample-secret", "api_version": "2024-01-01"}'),
('ShipStation Shipping', 'shipping', 'ShipStation', false, '{"warehouse_id": "sample-warehouse"}'),
('Google Calendar', 'calendar', 'Google', true, '{"calendar_id": "primary", "timezone": "UTC"}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample webhook events
INSERT INTO webhook_events (integration_id, event_type, payload, status) 
SELECT 
    i.id,
    'order.created',
    '{"order_id": "sample-123", "customer_email": "test@example.com", "total": 299.99}',
    'processed'
FROM integrations i 
WHERE i.name = 'Shopify Store'
LIMIT 1;

-- Insert sample API keys
INSERT INTO api_keys (name, key_hash, key_prefix, permissions, expires_at) VALUES
('Integration API Key', 'sample-hash', 'int_', '{"integrations": ["read", "write"], "webhooks": ["read"]}', NOW() + INTERVAL '1 year')
ON CONFLICT (name) DO NOTHING; 