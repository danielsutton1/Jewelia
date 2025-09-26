-- Email Integration System - Direct Application
-- This script applies only the email integration tables and functions

-- Create email_integration_settings table
CREATE TABLE IF NOT EXISTS email_integration_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('quotes', 'orders', 'repairs', 'communications', 'general')),
    is_active BOOLEAN DEFAULT true,
    auto_process BOOLEAN DEFAULT true,
    require_confirmation BOOLEAN DEFAULT false,
    notification_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_processing_logs table
CREATE TABLE IF NOT EXISTS email_processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email_integration_id UUID REFERENCES email_integration_settings(id) ON DELETE CASCADE,
    original_email_id VARCHAR(255),
    sender_email VARCHAR(255) NOT NULL,
    subject TEXT,
    email_type VARCHAR(50),
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'requires_review')),
    ai_confidence_score DECIMAL(3,2) DEFAULT 0.00,
    extracted_data JSONB,
    created_record_id UUID,
    created_record_type VARCHAR(50),
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_templates table for AI processing
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    sample_emails TEXT[],
    extraction_rules JSONB,
    validation_rules JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_processing_queue table for async processing
CREATE TABLE IF NOT EXISTS email_processing_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email_data JSONB NOT NULL,
    processing_priority INTEGER DEFAULT 5,
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying')),
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_integration_settings_tenant_id ON email_integration_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_integration_settings_email_address ON email_integration_settings(email_address);
CREATE INDEX IF NOT EXISTS idx_email_processing_logs_tenant_id ON email_processing_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_processing_logs_status ON email_processing_logs(processing_status);
CREATE INDEX IF NOT EXISTS idx_email_processing_logs_created_at ON email_processing_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_processing_queue_status ON email_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_processing_queue_scheduled_for ON email_processing_queue(scheduled_for);

-- Enable RLS
ALTER TABLE email_integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_processing_queue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (using IF NOT EXISTS approach)
DO $$
BEGIN
    -- Email integration settings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_integration_settings' AND policyname = 'Users can manage their email integration settings') THEN
        CREATE POLICY "Users can manage their email integration settings" ON email_integration_settings
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    user_id = auth.uid() OR 
                    tenant_id IN (
                        SELECT tenant_id FROM users WHERE id = auth.uid()
                    )
                )
            );
    END IF;

    -- Email processing logs policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_processing_logs' AND policyname = 'Users can view their email processing logs') THEN
        CREATE POLICY "Users can view their email processing logs" ON email_processing_logs
            FOR SELECT USING (
                auth.role() = 'authenticated' AND (
                    tenant_id IN (
                        SELECT tenant_id FROM users WHERE id = auth.uid()
                    )
                )
            );
    END IF;

    -- Email templates policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Users can manage their email templates') THEN
        CREATE POLICY "Users can manage their email templates" ON email_templates
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    tenant_id IN (
                        SELECT tenant_id FROM users WHERE id = auth.uid()
                    )
                )
            );
    END IF;

    -- Email processing queue policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_processing_queue' AND policyname = 'System can manage email processing queue') THEN
        CREATE POLICY "System can manage email processing queue" ON email_processing_queue
            FOR ALL USING (
                auth.role() = 'authenticated' AND (
                    tenant_id IN (
                        SELECT tenant_id FROM users WHERE id = auth.uid()
                    )
                )
            );
    END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_email_integration_settings_updated_at ON email_integration_settings;
CREATE TRIGGER update_email_integration_settings_updated_at
    BEFORE UPDATE ON email_integration_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_email_integration_updated_at();

DROP TRIGGER IF EXISTS update_email_processing_logs_updated_at ON email_processing_logs;
CREATE TRIGGER update_email_processing_logs_updated_at
    BEFORE UPDATE ON email_processing_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_email_integration_updated_at();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_integration_updated_at();

-- Create function to process email queue
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS void AS $$
DECLARE
    queue_item RECORD;
BEGIN
    -- Get next item from queue
    SELECT * INTO queue_item
    FROM email_processing_queue
    WHERE status = 'queued' 
    AND scheduled_for <= NOW()
    ORDER BY processing_priority ASC, created_at ASC
    LIMIT 1;
    
    IF FOUND THEN
        -- Update status to processing
        UPDATE email_processing_queue
        SET status = 'processing', started_at = NOW()
        WHERE id = queue_item.id;
        
        -- Here we would call the email processing service
        -- This will be handled by the API endpoint
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default email templates
INSERT INTO email_templates (tenant_id, template_name, email_type, sample_emails, extraction_rules, validation_rules) VALUES
(
    '00000000-0000-0000-0000-000000000000', -- Default tenant
    'Quote Request Template',
    'quotes',
    ARRAY[
        'Subject: Quote Request for Wedding Ring',
        'Hi, I need a quote for a custom wedding ring. Customer: John Smith, Phone: 555-1234, Budget: $2000, Timeline: 2 weeks',
        'Subject: RE: Custom Jewelry Quote',
        'Please quote: 1x Diamond Ring, 14k gold, size 7, customer wants to see options under $1500'
    ],
    '{
        "customer_name": {"pattern": "customer[\\s:]*([A-Za-z\\s]+)", "required": true},
        "phone": {"pattern": "phone[\\s:]*([0-9\\-\\+\\(\\)\\s]+)", "required": false},
        "budget": {"pattern": "budget[\\s:]*\\$?([0-9,]+)", "required": false},
        "timeline": {"pattern": "timeline[\\s:]*([0-9]+\\s*(weeks?|days?|months?))", "required": false},
        "description": {"pattern": "quote[\\s:]*([^\\n]+)", "required": true}
    }'::jsonb,
    '{
        "customer_name": {"min_length": 2, "max_length": 100},
        "phone": {"pattern": "^[0-9\\-\\+\\(\\)\\s]+$"},
        "budget": {"min": 0, "max": 1000000},
        "timeline": {"pattern": "^[0-9]+\\s*(weeks?|days?|months?)$"}
    }'::jsonb
),
(
    '00000000-0000-0000-0000-000000000000',
    'Order Update Template',
    'orders',
    ARRAY[
        'Subject: Order #12345 Status Update',
        'Order #12345 has been completed and is ready for pickup. Customer: Jane Doe',
        'Subject: RE: Order Status',
        'Order #67890 shipped today via UPS, tracking: 1Z999AA1234567890'
    ],
    '{
        "order_number": {"pattern": "order[\\s#]*([A-Za-z0-9\\-]+)", "required": true},
        "status": {"pattern": "(completed|shipped|delivered|ready|pending)", "required": true},
        "customer_name": {"pattern": "customer[\\s:]*([A-Za-z\\s]+)", "required": false},
        "tracking": {"pattern": "tracking[\\s:]*([A-Za-z0-9\\-]+)", "required": false}
    }'::jsonb,
    '{
        "order_number": {"min_length": 3, "max_length": 50},
        "status": {"enum": ["completed", "shipped", "delivered", "ready", "pending"]}
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create notification function for email processing
CREATE OR REPLACE FUNCTION notify_email_processed()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification when email is processed
    PERFORM pg_notify('email_processed', json_build_object(
        'id', NEW.id,
        'status', NEW.processing_status,
        'record_type', NEW.created_record_type,
        'record_id', NEW.created_record_id
    )::text);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
DROP TRIGGER IF EXISTS email_processed_notification ON email_processing_logs;
CREATE TRIGGER email_processed_notification
    AFTER UPDATE ON email_processing_logs
    FOR EACH ROW
    WHEN (NEW.processing_status = 'completed' AND OLD.processing_status != 'completed')
    EXECUTE FUNCTION notify_email_processed();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_integration_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_processing_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_processing_queue TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Email integration system applied successfully!';
    RAISE NOTICE 'Tables created: email_integration_settings, email_processing_logs, email_templates, email_processing_queue';
    RAISE NOTICE 'RLS policies and triggers configured';
    RAISE NOTICE 'Default email templates inserted';
END $$;
