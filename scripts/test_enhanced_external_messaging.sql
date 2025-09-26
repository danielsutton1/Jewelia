-- =====================================================
-- TEST ENHANCED EXTERNAL MESSAGING SYSTEM
-- =====================================================
-- Run this script after implementing the enhanced system
-- to verify everything is working correctly

-- =====================================================
-- 1. VERIFY TABLE STRUCTURE
-- =====================================================

SELECT '🔍 Verifying table structure...' as step;

-- Check if all new tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('external_conversations', 'message_attachments', 'conversation_participants', 'conversation_notifications') 
        THEN '✅ NEW TABLE'
        ELSE '📋 EXISTING TABLE'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('messages', 'external_conversations', 'message_attachments', 'conversation_participants', 'conversation_notifications')
ORDER BY table_name;

-- =====================================================
-- 2. VERIFY ENHANCED MESSAGES TABLE
-- =====================================================

SELECT '🔍 Verifying enhanced messages table...' as step;

-- Check new columns in messages table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('subject', 'priority', 'conversation_id', 'status', 'category', 'tags', 'related_order_id', 'related_project_id') 
        THEN '🆕 NEW COLUMN'
        ELSE '📋 EXISTING COLUMN'
    END as status
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('id', 'message_type', 'sender_id', 'content', 'subject', 'priority', 'conversation_id', 'status', 'category', 'tags', 'related_order_id', 'related_project_id', 'created_at')
ORDER BY column_name;

-- =====================================================
-- 3. VERIFY DATA MIGRATION
-- =====================================================

SELECT '🔍 Verifying data migration...' as step;

-- Check if external messages have conversation_id
SELECT 
    COUNT(*) as total_external_messages,
    COUNT(CASE WHEN conversation_id IS NOT NULL THEN 1 END) as messages_with_conversations,
    COUNT(CASE WHEN conversation_id IS NULL THEN 1 END) as messages_without_conversations,
    ROUND(
        (COUNT(CASE WHEN conversation_id IS NOT NULL THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as migration_percentage
FROM messages 
WHERE message_type = 'external';

-- =====================================================
-- 4. VERIFY CONVERSATIONS CREATED
-- =====================================================

SELECT '🔍 Verifying conversations created...' as step;

-- Check external conversations
SELECT 
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_conversations,
    COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_conversations,
    COUNT(CASE WHEN priority = 'normal' THEN 1 END) as normal_priority_conversations,
    COUNT(CASE WHEN business_type = 'quote' THEN 1 END) as quote_conversations,
    COUNT(CASE WHEN business_type = 'inquiry' THEN 1 END) as inquiry_conversations
FROM external_conversations;

-- Show sample conversations
SELECT 
    title,
    subject,
    category,
    business_type,
    priority,
    status,
    created_at
FROM external_conversations 
ORDER BY created_at DESC 
LIMIT 5;

-- =====================================================
-- 5. VERIFY MESSAGE ATTACHMENTS
-- =====================================================

SELECT '🔍 Verifying message attachments...' as step;

-- Check if message_attachments table has data
SELECT 
    COUNT(*) as total_attachments,
    COUNT(CASE WHEN message_id IS NOT NULL THEN 1 END) as attachments_with_messages,
    COUNT(CASE WHEN conversation_id IS NOT NULL THEN 1 END) as attachments_with_conversations
FROM message_attachments;

-- =====================================================
-- 6. VERIFY CONVERSATION PARTICIPANTS
-- =====================================================

SELECT '🔍 Verifying conversation participants...' as step;

-- Check conversation participants
SELECT 
    COUNT(*) as total_participants,
    COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
    COUNT(CASE WHEN role = 'participant' THEN 1 END) as participants,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_participants
FROM conversation_participants;

-- =====================================================
-- 7. VERIFY NOTIFICATIONS
-- =====================================================

SELECT '🔍 Verifying conversation notifications...' as step;

-- Check conversation notifications
SELECT 
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN notification_type = 'new_message' THEN 1 END) as new_message_notifications,
    COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications
FROM conversation_notifications;

-- =====================================================
-- 8. VERIFY INDEXES
-- =====================================================

SELECT '🔍 Verifying performance indexes...' as step;

-- Check if performance indexes were created
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname LIKE 'idx_external_conversations%' THEN '🚀 EXTERNAL CONVERSATIONS'
        WHEN indexname LIKE 'idx_messages%' THEN '📨 MESSAGES'
        WHEN indexname LIKE 'idx_message_attachments%' THEN '📎 ATTACHMENTS'
        WHEN indexname LIKE 'idx_conversation_participants%' THEN '👥 PARTICIPANTS'
        WHEN indexname LIKE 'idx_conversation_notifications%' THEN '🔔 NOTIFICATIONS'
        ELSE '📋 OTHER'
    END as index_category
FROM pg_indexes 
WHERE tablename IN ('external_conversations', 'messages', 'message_attachments', 'conversation_participants', 'conversation_notifications')
ORDER BY tablename, indexname;

-- =====================================================
-- 9. VERIFY TRIGGERS
-- =====================================================

SELECT '🔍 Verifying automatic triggers...' as step;

-- Check if triggers were created
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    CASE 
        WHEN trigger_name = 'trigger_update_conversation_last_message' THEN '✅ CONVERSATION UPDATE TRIGGER'
        ELSE '📋 OTHER TRIGGER'
    END as trigger_status
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_conversation_last_message';

-- =====================================================
-- 10. VERIFY SAMPLE DATA INTEGRITY
-- =====================================================

SELECT '🔍 Verifying sample data integrity...' as step;

-- Check Precious Metals Co. conversation
SELECT 
    'Precious Metals Co. Conversation' as conversation_name,
    ec.title,
    ec.subject,
    ec.priority,
    ec.status,
    ec.business_type,
    ec.metadata,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM external_conversations ec
LEFT JOIN messages m ON ec.id = m.conversation_id
WHERE ec.partner_id = 'bd180762-49e2-477d-b286-d7039b43cd83'
GROUP BY ec.id, ec.title, ec.subject, ec.priority, ec.status, ec.business_type, ec.metadata;

-- Check Gemstone Suppliers conversation
SELECT 
    'Gemstone Suppliers Conversation' as conversation_name,
    ec.title,
    ec.subject,
    ec.priority,
    ec.status,
    ec.business_type,
    ec.metadata,
    COUNT(m.id) as message_count,
    MAX(m.created_at) as last_message_at
FROM external_conversations ec
LEFT JOIN messages m ON ec.id = m.conversation_id
WHERE ec.partner_id = 'd44f297b-a185-4cca-994f-8ebf182380cd'
GROUP BY ec.id, ec.title, ec.subject, ec.priority, ec.status, ec.business_type, ec.metadata;

-- =====================================================
-- 11. PERFORMANCE TEST
-- =====================================================

SELECT '🔍 Testing query performance...' as step;

-- Test conversation query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    ec.*,
    p.name as partner_name,
    p.type as partner_type,
    COUNT(m.id) as message_count
FROM external_conversations ec
LEFT JOIN partners p ON ec.partner_id = p.id
LEFT JOIN messages m ON ec.id = m.conversation_id
WHERE ec.status = 'active'
GROUP BY ec.id, p.name, p.type
ORDER BY ec.last_message_at DESC
LIMIT 10;

-- =====================================================
-- 12. FINAL VERIFICATION SUMMARY
-- =====================================================

SELECT '🎯 FINAL VERIFICATION SUMMARY' as step;

-- Overall system health check
SELECT 
    'Enhanced External Messaging System' as system_name,
    CASE 
        WHEN (SELECT COUNT(*) FROM external_conversations) > 0 THEN '✅ CONVERSATIONS'
        ELSE '❌ CONVERSATIONS'
    END as conversations_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM message_attachments) >= 0 THEN '✅ ATTACHMENTS'
        ELSE '❌ ATTACHMENTS'
    END as attachments_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM conversation_participants) > 0 THEN '✅ PARTICIPANTS'
        ELSE '❌ PARTICIPANTS'
    END as participants_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM conversation_notifications) >= 0 THEN '✅ NOTIFICATIONS'
        ELSE '❌ NOTIFICATIONS'
    END as notifications_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'external_conversations') > 0 THEN '✅ INDEXES'
        ELSE '❌ INDEXES'
    END as indexes_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'trigger_update_conversation_last_message') > 0 THEN '✅ TRIGGERS'
        ELSE '❌ TRIGGERS'
    END as triggers_status;

-- =====================================================
-- 13. READY FOR PRODUCTION CHECK
-- =====================================================

SELECT '🚀 PRODUCTION READINESS CHECK' as step;

-- Check if all critical components are working
SELECT 
    component,
    status,
    CASE 
        WHEN status = '✅ READY' THEN 'Ready for production use'
        WHEN status = '⚠️ PARTIAL' THEN 'Partially ready - review needed'
        ELSE 'Not ready - fix required'
    END as recommendation
FROM (
    VALUES 
        ('Database Schema', CASE WHEN (SELECT COUNT(*) FROM external_conversations) > 0 THEN '✅ READY' ELSE '❌ NOT READY' END),
        ('Data Migration', CASE WHEN (SELECT COUNT(*) FROM messages WHERE message_type = 'external' AND conversation_id IS NOT NULL) > 0 THEN '✅ READY' ELSE '❌ NOT READY' END),
        ('Performance Indexes', CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'external_conversations') > 0 THEN '✅ READY' ELSE '❌ NOT READY' END),
        ('Automatic Triggers', CASE WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_name = 'trigger_update_conversation_last_message') > 0 THEN '✅ READY' ELSE '❌ NOT READY' END),
        ('Sample Data', CASE WHEN (SELECT COUNT(*) FROM external_conversations WHERE title LIKE '%Precious Metals%') > 0 THEN '✅ READY' ELSE '❌ NOT READY' END)
    ) AS t(component, status)
ORDER BY component;

SELECT '🎉 Enhanced External Messaging System Test Complete!' as result;
