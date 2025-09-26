-- Add settings tables for system and user preferences
-- This migration creates the missing tables for the settings API

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Jewelia CRM',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    sms_notifications BOOLEAN NOT NULL DEFAULT false,
    auto_backup BOOLEAN NOT NULL DEFAULT true,
    backup_frequency VARCHAR(20) NOT NULL DEFAULT 'daily' CHECK (backup_frequency IN ('daily', 'weekly', 'monthly')),
    max_file_size INTEGER NOT NULL DEFAULT 10, -- MB
    allowed_file_types TEXT[] NOT NULL DEFAULT ARRAY['jpg', 'png', 'pdf', 'doc', 'docx'],
    session_timeout INTEGER NOT NULL DEFAULT 30, -- minutes
    two_factor_auth BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    theme VARCHAR(20) NOT NULL DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    notifications JSONB NOT NULL DEFAULT '{"email": true, "push": true, "sms": false}',
    dashboard_layout JSONB NOT NULL DEFAULT '{"widgets": ["revenue", "orders", "customers", "inventory"], "columns": 3}',
    default_page_size INTEGER NOT NULL DEFAULT 20,
    auto_refresh BOOLEAN NOT NULL DEFAULT true,
    refresh_interval INTEGER NOT NULL DEFAULT 30, -- seconds
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (id) VALUES (uuid_generate_v4())
ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON user_preferences TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
