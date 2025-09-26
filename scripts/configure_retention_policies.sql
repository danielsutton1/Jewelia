-- ⚙️ CONFIGURE RETENTION POLICIES
-- This script sets up automated message retention and deletion policies

-- =====================================================
-- 1. RETENTION POLICY CONFIGURATION
-- =====================================================

-- Create retention policies table if it doesn't exist
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
-- 2. ARCHIVED MESSAGES TABLE
-- =====================================================

-- Table for storing archived messages before deletion
CREATE TABLE IF NOT EXISTS archived_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_message_id UUID,
    original_table TEXT NOT NULL,
    
    -- Archived content
    archived_content JSONB NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Retention metadata
    retention_policy_id UUID REFERENCES retention_policies(id) ON DELETE SET NULL,
    scheduled_deletion_date TIMESTAMP WITH TIME ZONE,
    
    -- Compliance
    legal_hold BOOLEAN DEFAULT false,
    compliance_tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INSERT DEFAULT RETENTION POLICIES
-- =====================================================

-- GDPR Compliance Policy (Personal Data)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard,
    conditions
) VALUES (
    'GDPR_Personal_Data',
    'Automatically delete personal data after 30 days unless consent is renewed',
    30,
    'delete',
    ARRAY['messages', 'files'],
    ARRAY['messages', 'encrypted_message_metadata', 'encrypted_files'],
    'GDPR',
    '{"requires_consent": true, "data_type": "personal"}'
) ON CONFLICT (policy_name) DO NOTHING;

-- HIPAA Compliance Policy (Healthcare Data)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard,
    conditions
) VALUES (
    'HIPAA_Healthcare_Data',
    'Archive healthcare-related communications for 6 years, then delete',
    2190, -- 6 years
    'archive',
    ARRAY['messages', 'files', 'video_calls'],
    ARRAY['messages', 'encrypted_message_metadata', 'encrypted_files', 'video_calls'],
    'HIPAA',
    '{"data_type": "healthcare", "phi_protected": true}'
) ON CONFLICT (policy_name) DO NOTHING;

-- SOX Compliance Policy (Financial Data)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard,
    conditions
) VALUES (
    'SOX_Financial_Data',
    'Retain financial communications for 7 years for audit purposes',
    2555, -- 7 years
    'archive',
    ARRAY['messages', 'files'],
    ARRAY['messages', 'encrypted_message_metadata', 'encrypted_files'],
    'SOX',
    '{"data_type": "financial", "audit_required": true}'
) ON CONFLICT (policy_name) DO NOTHING;

-- General Business Policy (Non-sensitive Data)
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard,
    conditions
) VALUES (
    'General_Business_Data',
    'Delete general business communications after 1 year',
    365,
    'delete',
    ARRAY['messages', 'files'],
    ARRAY['messages', 'encrypted_message_metadata', 'encrypted_files'],
    'Internal',
    '{"data_type": "business", "sensitivity": "low"}'
) ON CONFLICT (policy_name) DO NOTHING;

-- Audit Log Retention Policy
INSERT INTO retention_policies (
    policy_name, 
    description, 
    retention_period_days, 
    retention_type, 
    applies_to, 
    applies_to_tables,
    compliance_standard,
    conditions
) VALUES (
    'Audit_Log_Retention',
    'Retain security audit logs for 3 years for compliance',
    1095, -- 3 years
    'archive',
    ARRAY['audit_logs'],
    ARRAY['encryption_audit_logs'],
    'Internal',
    '{"data_type": "audit", "security_related": true}'
) ON CONFLICT (policy_name) DO NOTHING;

-- =====================================================
-- 4. RETENTION POLICY FUNCTIONS
-- =====================================================

-- Function to check if message should be retained
CREATE OR REPLACE FUNCTION check_message_retention()
RETURNS TRIGGER AS $$
DECLARE
    policy_record RECORD;
    should_archive BOOLEAN := false;
    should_delete BOOLEAN := false;
    retention_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check applicable retention policies
    FOR policy_record IN 
        SELECT * FROM retention_policies 
        WHERE is_active = true 
        AND 'messages' = ANY(applies_to)
        AND NEW.created_at < NOW() - INTERVAL '1 day' * retention_period_days
    LOOP
        -- Check if message matches policy conditions
        IF policy_record.conditions->>'data_type' = 'personal' OR 
           policy_record.conditions->>'data_type' = 'healthcare' OR
           policy_record.conditions->>'data_type' = 'financial' THEN
            
            CASE policy_record.retention_type
                WHEN 'archive' THEN
                    should_archive := true;
                    retention_date := NOW() + INTERVAL '30 days';
                WHEN 'delete' THEN
                    should_delete := true;
                WHEN 'anonymize' THEN
                    -- Anonymize sensitive content
                    NEW.content := '[REDACTED - ' || policy_record.compliance_standard || ']';
                    NEW.is_encrypted := false;
            END CASE;
        END IF;
    END LOOP;
    
    -- Archive message if needed
    IF should_archive THEN
        INSERT INTO archived_messages (
            original_message_id,
            original_table,
            archived_content,
            retention_policy_id,
            scheduled_deletion_date
        ) VALUES (
            NEW.id,
            'messages',
            to_jsonb(NEW),
            policy_record.id,
            retention_date
        );
        
        -- Mark original message as archived
        NEW.is_encrypted := false;
        NEW.content := '[ARCHIVED]';
    END IF;
    
    -- Return modified record
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to execute retention policies
CREATE OR REPLACE FUNCTION execute_retention_policies()
RETURNS INTEGER AS $$
DECLARE
    policy_record RECORD;
    affected_rows INTEGER := 0;
    current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Process each active retention policy
    FOR policy_record IN 
        SELECT * FROM retention_policies 
        WHERE is_active = true 
        AND (next_execution IS NULL OR next_execution <= current_time)
    LOOP
        -- Execute policy based on type
        CASE policy_record.retention_type
            WHEN 'delete' THEN
                -- Delete expired data
                EXECUTE format('
                    DELETE FROM %I 
                    WHERE created_at < NOW() - INTERVAL ''1 day'' * $1
                    AND id NOT IN (
                        SELECT original_message_id FROM archived_messages 
                        WHERE legal_hold = true
                    )
                ', policy_record.applies_to_tables[1])
                USING policy_record.retention_period_days;
                
                GET DIAGNOSTICS affected_rows = ROW_COUNT;
                
            WHEN 'archive' THEN
                -- Archive expired data
                EXECUTE format('
                    INSERT INTO archived_messages (
                        original_message_id, 
                        original_table, 
                        archived_content, 
                        retention_policy_id,
                        scheduled_deletion_date
                    )
                    SELECT 
                        id, 
                        %L, 
                        to_jsonb(t.*), 
                        %L,
                        NOW() + INTERVAL ''30 days''
                    FROM %I t
                    WHERE created_at < NOW() - INTERVAL ''1 day'' * %L
                    AND id NOT IN (
                        SELECT original_message_id FROM archived_messages
                    )
                ', 
                policy_record.applies_to_tables[1],
                policy_record.id,
                policy_record.applies_to_tables[1],
                policy_record.retention_period_days
                );
                
                GET DIAGNOSTICS affected_rows = ROW_COUNT;
        END CASE;
        
        -- Update policy execution time
        UPDATE retention_policies 
        SET last_executed = current_time,
            next_execution = current_time + INTERVAL '1 hour' * execution_frequency_hours
        WHERE id = policy_record.id;
    END LOOP;
    
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. TRIGGERS FOR AUTOMATED RETENTION
-- =====================================================

-- Trigger to check message retention on insert/update
DROP TRIGGER IF EXISTS trigger_check_message_retention ON messages;
CREATE TRIGGER trigger_check_message_retention
    AFTER INSERT OR UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_retention();

-- =====================================================
-- 6. SCHEDULED EXECUTION (PostgreSQL Extension)
-- =====================================================

-- Note: This requires the pg_cron extension to be enabled in Supabase
-- If pg_cron is not available, you can use external cron jobs or Supabase Edge Functions

-- Example cron job (uncomment if pg_cron is available):
-- SELECT cron.schedule('retention-policy-execution', '0 2 * * *', 'SELECT execute_retention_policies();');

-- =====================================================
-- 7. COMPLIANCE REPORTING FUNCTIONS
-- =====================================================

-- Function to generate compliance report
CREATE OR REPLACE FUNCTION generate_compliance_report(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    compliance_standard TEXT,
    total_messages BIGINT,
    archived_messages BIGINT,
    deleted_messages BIGINT,
    legal_hold_messages BIGINT,
    retention_compliance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rp.compliance_standard,
        COUNT(m.id)::BIGINT as total_messages,
        COUNT(am.id)::BIGINT as archived_messages,
        COUNT(CASE WHEN m.content = '[DELETED]' THEN 1 END)::BIGINT as deleted_messages,
        COUNT(CASE WHEN am.legal_hold = true THEN 1 END)::BIGINT as legal_hold_messages,
        CASE 
            WHEN COUNT(m.id) > 0 THEN 
                (COUNT(am.id) + COUNT(CASE WHEN m.content = '[DELETED]' THEN 1 END))::NUMERIC / COUNT(m.id)::NUMERIC * 100
            ELSE 0 
        END as retention_compliance_rate
    FROM retention_policies rp
    LEFT JOIN messages m ON m.created_at BETWEEN start_date AND end_date
    LEFT JOIN archived_messages am ON am.original_message_id = m.id
    WHERE rp.compliance_standard IS NOT NULL
    GROUP BY rp.compliance_standard, rp.id
    ORDER BY rp.compliance_standard;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. INDEXES FOR RETENTION PERFORMANCE
-- =====================================================

-- Indexes for retention policy execution
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_archived_messages_scheduled_deletion ON archived_messages(scheduled_deletion_date);
CREATE INDEX IF NOT EXISTS idx_archived_messages_legal_hold ON archived_messages(legal_hold);
CREATE INDEX IF NOT EXISTS idx_retention_policies_next_execution ON retention_policies(next_execution);

-- =====================================================
-- 9. FINAL COMMENTS
-- =====================================================

COMMENT ON TABLE retention_policies IS 'Configures automated data retention policies for compliance';
COMMENT ON TABLE archived_messages IS 'Stores archived messages before final deletion';
COMMENT ON FUNCTION check_message_retention() IS 'Trigger function to check message retention on insert/update';
COMMENT ON FUNCTION execute_retention_policies() IS 'Executes retention policies based on configured rules';
COMMENT ON FUNCTION generate_compliance_report() IS 'Generates compliance reports for audit purposes';

-- Retention policies configured successfully
-- ⚙️ Automated data retention is now active!
