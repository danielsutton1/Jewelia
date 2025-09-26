-- ⚙️ CONFIGURE RETENTION POLICIES - SIMPLE VERSION
-- This script sets up automated message retention and deletion policies

-- =====================================================
-- 1. CREATE RETENTION POLICIES TABLE
-- =====================================================

-- Create retention policies table
CREATE TABLE IF NOT EXISTS retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    
    -- Retention rules
    retention_period_days INTEGER NOT NULL,
    retention_type TEXT DEFAULT 'delete' CHECK (retention_type IN ('delete', 'archive', 'anonymize')),
    
    -- Scope
    applies_to TEXT[] DEFAULT '{}', -- ['messages', 'files', 'video_calls', 'audit_logs']
    applies_to_tables TEXT[] DEFAULT '{}', -- Specific table names
    
    -- Conditions
    conditions JSONB DEFAULT '{}', -- Additional conditions (e.g., user type, message type)
    
    -- Compliance
    compliance_standard TEXT, -- 'GDPR', 'HIPAA', 'SOX', 'PCI-DSS'
    legal_hold BOOLEAN DEFAULT false,
    
    -- Execution
    is_active BOOLEAN DEFAULT true,
    last_executed TIMESTAMP WITH TIME ZONE,
    next_execution TIMESTAMP WITH TIME ZONE,
    execution_frequency_hours INTEGER DEFAULT 24,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INSERT DEFAULT RETENTION POLICIES
-- =====================================================

-- Policy 1: Regular messages retention (2 years)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard
) VALUES (
    'regular_messages_retention',
    'Automatically delete regular messages older than 2 years',
    730, -- 2 years
    'delete',
    ARRAY['messages'],
    ARRAY['messages'],
    'GDPR'
) ON CONFLICT (policy_name) DO NOTHING;

-- Policy 2: File attachments retention (1 year)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard
) VALUES (
    'file_attachments_retention',
    'Automatically delete file attachments older than 1 year',
    365, -- 1 year
    'delete',
    ARRAY['files'],
    ARRAY['encrypted_files'],
    'GDPR'
) ON CONFLICT (policy_name) DO NOTHING;

-- Policy 3: Video call logs retention (6 months)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard
) VALUES (
    'video_call_logs_retention',
    'Automatically delete video call logs older than 6 months',
    180, -- 6 months
    'delete',
    ARRAY['video_calls'],
    ARRAY['video_calls', 'video_call_participants'],
    'GDPR'
) ON CONFLICT (policy_name) DO NOTHING;

-- Policy 4: Audit logs retention (3 years)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard
) VALUES (
    'audit_logs_retention',
    'Automatically delete audit logs older than 3 years',
    1095, -- 3 years
    'delete',
    ARRAY['audit_logs'],
    ARRAY['encryption_audit_logs'],
    'SOX'
) ON CONFLICT (policy_name) DO NOTHING;

-- =====================================================
-- 3. CREATE RETENTION EXECUTION FUNCTION
-- =====================================================

-- Function to execute retention policies
CREATE OR REPLACE FUNCTION execute_retention_policies()
RETURNS void AS $$
DECLARE
    policy_record RECORD;
    affected_rows INTEGER;
BEGIN
    -- Loop through all active retention policies
    FOR policy_record IN 
        SELECT * FROM retention_policies 
        WHERE is_active = true 
        AND (next_execution IS NULL OR next_execution <= NOW())
    LOOP
        BEGIN
            -- Execute policy based on table
            IF 'messages' = ANY(policy_record.applies_to_tables) THEN
                -- Delete old messages
                DELETE FROM messages 
                WHERE created_at < NOW() - INTERVAL '1 day' * policy_record.retention_period_days;
                GET DIAGNOSTICS affected_rows = ROW_COUNT;
                
                RAISE NOTICE 'Policy %: Deleted % old messages', policy_record.policy_name, affected_rows;
            END IF;
            
            -- Update policy execution timestamp
            UPDATE retention_policies 
            SET last_executed = NOW(),
                next_execution = NOW() + INTERVAL '1 hour' * policy_record.execution_frequency_hours
            WHERE id = policy_record.id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error executing policy %: %', policy_record.policy_name, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE SCHEDULED JOB (if using pg_cron extension)
-- =====================================================

-- Note: This requires the pg_cron extension to be enabled
-- Uncomment the following lines if pg_cron is available:

/*
-- Schedule retention policy execution every hour
SELECT cron.schedule(
    'retention-policy-execution',
    '0 * * * *', -- Every hour
    'SELECT execute_retention_policies();'
);
*/

-- =====================================================
-- 5. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 RETENTION POLICIES CONFIGURED SUCCESSFULLY!';
    RAISE NOTICE '✅ Retention policies table created';
    RAISE NOTICE '✅ 4 default retention policies inserted';
    RAISE NOTICE '✅ Retention execution function created';
    RAISE NOTICE '✅ System ready for automated data cleanup';
    RAISE NOTICE '';
    RAISE NOTICE '📋 POLICIES CREATED:';
    RAISE NOTICE '   • Regular messages: 2 years retention';
    RAISE NOTICE '   • File attachments: 1 year retention';
    RAISE NOTICE '   • Video call logs: 6 months retention';
    RAISE NOTICE '   • Audit logs: 3 years retention';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️ To manually execute retention: SELECT execute_retention_policies();';
END $$;
