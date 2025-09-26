-- 🔍 SIMPLE DEPLOYMENT VERIFICATION
-- This script verifies all components without any column name conflicts

-- =====================================================
-- 1. VERIFY TABLE CREATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔍 VERIFYING TABLE CREATION...';
    
    -- Check each table individually to avoid conflicts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'message_threads') THEN
        RAISE NOTICE '✅ Table message_threads exists';
    ELSE
        RAISE NOTICE '❌ Table message_threads is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        RAISE NOTICE '✅ Table messages exists';
    ELSE
        RAISE NOTICE '❌ Table messages is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_encryption_keys') THEN
        RAISE NOTICE '✅ Table user_encryption_keys exists';
    ELSE
        RAISE NOTICE '❌ Table user_encryption_keys is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_encryption_keys') THEN
        RAISE NOTICE '✅ Table conversation_encryption_keys exists';
    ELSE
        RAISE NOTICE '❌ Table conversation_encryption_keys is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_conversation_keys') THEN
        RAISE NOTICE '✅ Table user_conversation_keys exists';
    ELSE
        RAISE NOTICE '❌ Table user_conversation_keys is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_calls') THEN
        RAISE NOTICE '✅ Table video_calls exists';
    ELSE
        RAISE NOTICE '❌ Table video_calls is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'video_call_participants') THEN
        RAISE NOTICE '✅ Table video_call_participants exists';
    ELSE
        RAISE NOTICE '❌ Table video_call_participants is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_conversations') THEN
        RAISE NOTICE '✅ Table group_conversations exists';
    ELSE
        RAISE NOTICE '❌ Table group_conversations is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_members') THEN
        RAISE NOTICE '✅ Table group_members exists';
    ELSE
        RAISE NOTICE '❌ Table group_members is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'encryption_audit_logs') THEN
        RAISE NOTICE '✅ Table encryption_audit_logs exists';
    ELSE
        RAISE NOTICE '❌ Table encryption_audit_logs is MISSING';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'retention_policies') THEN
        RAISE NOTICE '✅ Table retention_policies exists';
    ELSE
        RAISE NOTICE '❌ Table retention_policies is MISSING';
    END IF;
    
    RAISE NOTICE '🎉 TABLE VERIFICATION COMPLETE!';
END $$;

-- =====================================================
-- 2. VERIFY RETENTION POLICIES
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
    policy_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFYING RETENTION POLICIES...';
    
    -- Count retention policies
    SELECT COUNT(*) INTO policy_count
    FROM retention_policies;
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ Retention policies configured (% found)', policy_count;
    ELSE
        RAISE NOTICE '⚠️  Only % retention policies found (expected 4)', policy_count;
    END IF;
    
    -- Show policy details
    RAISE NOTICE '📋 POLICIES:';
    FOR policy_record IN SELECT policy_name, retention_period_days, retention_type FROM retention_policies
    LOOP
        RAISE NOTICE '   • %: % days (% type)', policy_record.policy_name, policy_record.retention_period_days, policy_record.retention_type;
    END LOOP;
END $$;

-- =====================================================
-- 3. VERIFY FUNCTION CREATION
-- =====================================================

DO $$
DECLARE
    function_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFYING FUNCTION CREATION...';
    
    -- Check if retention function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'execute_retention_policies'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Retention execution function created successfully';
    ELSE
        RAISE NOTICE '❌ Retention execution function is MISSING';
    END IF;
END $$;

-- =====================================================
-- 4. VERIFY DATA INTEGRITY
-- =====================================================

DO $$
DECLARE
    message_threads_count INTEGER;
    messages_count INTEGER;
    encryption_keys_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFYING DATA INTEGRITY...';
    
    -- Count records in key tables
    SELECT COUNT(*) INTO message_threads_count FROM message_threads;
    SELECT COUNT(*) INTO messages_count FROM messages;
    SELECT COUNT(*) INTO encryption_keys_count FROM user_encryption_keys;
    
    RAISE NOTICE '📊 TABLE RECORDS:';
    RAISE NOTICE '   • message_threads: % records', message_threads_count;
    RAISE NOTICE '   • messages: % records', messages_count;
    RAISE NOTICE '   • user_encryption_keys: % records', encryption_keys_count;
    
    -- Verify table structure
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'thread_id'
    ) THEN
        RAISE NOTICE '✅ messages.thread_id column exists';
    ELSE
        RAISE NOTICE '❌ messages.thread_id column is MISSING';
    END IF;
END $$;

-- =====================================================
-- 5. FINAL SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 DEPLOYMENT VERIFICATION COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '   1. Test encryption services with sample data';
    RAISE NOTICE '   2. Verify video call functionality';
    RAISE NOTICE '   3. Test retention policies manually';
    RAISE NOTICE '   4. Access security monitoring dashboard';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  MANUAL TESTS:';
    RAISE NOTICE '   • Test retention: SELECT execute_retention_policies();';
    RAISE NOTICE '   • Check tables: SELECT * FROM retention_policies;';
    RAISE NOTICE '   • Verify structure: \d messages;';
END $$;
