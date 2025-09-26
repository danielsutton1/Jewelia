-- 🔍 VERIFY ENCRYPTED COMMUNICATION SYSTEM DEPLOYMENT
-- This script verifies all components are properly deployed

-- =====================================================
-- 1. VERIFY TABLE CREATION
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'message_threads',
        'messages', 
        'user_encryption_keys',
        'conversation_encryption_keys',
        'user_conversation_keys',
        'video_calls',
        'video_call_participants',
        'group_conversations',
        'group_members',
        'encryption_audit_logs',
        'retention_policies'
    ];
    missing_tables TEXT[] := '{}';
    table_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFYING TABLE CREATION...';
    
    -- Check each expected table
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND information_schema.tables.table_name = table_name
        ) THEN
            RAISE NOTICE '✅ Table % exists', table_name;
        ELSE
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '❌ Table % is MISSING', table_name;
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(missing_tables, 1) = 0 THEN
        RAISE NOTICE '🎉 ALL TABLES CREATED SUCCESSFULLY!';
    ELSE
        RAISE NOTICE '⚠️  MISSING TABLES: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- =====================================================
-- 2. VERIFY INDEX CREATION
-- =====================================================

DO $$
DECLARE
    index_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFYING INDEX CREATION...';
    
    -- Count indexes on key tables
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename IN ('messages', 'user_encryption_keys', 'video_calls', 'group_conversations');
    
    IF index_count >= 5 THEN
        RAISE NOTICE '✅ Indexes created successfully (% found)', index_count;
    ELSE
        RAISE NOTICE '⚠️  Only % indexes found (expected at least 5)', index_count;
    END IF;
END $$;

-- =====================================================
-- 3. VERIFY RETENTION POLICIES
-- =====================================================

DO $$
DECLARE
    policy_count INTEGER;
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
-- 4. VERIFY FUNCTION CREATION
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
-- 5. VERIFY DATA INTEGRITY
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
-- 6. FINAL VERIFICATION SUMMARY
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
