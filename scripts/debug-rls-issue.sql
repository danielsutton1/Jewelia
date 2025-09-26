-- Debug RLS policy issue for message_attachments
-- This will help identify why the INSERT is still failing

-- 1. Check current RLS status
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'message_attachments';

-- 2. Show all current policies
SELECT 
    'Current Policies' as check_type,
    policyname,
    cmd as operation,
    permissive,
    with_check as check_clause
FROM pg_policies 
WHERE tablename = 'message_attachments'
ORDER BY policyname;

-- 3. Test the authentication context
SELECT 
    'Auth Context' as check_type,
    'Current user ID: ' || COALESCE(auth.uid()::text, 'NULL') as current_user,
    'Current role: ' || COALESCE(auth.role(), 'NULL') as current_role,
    'Is authenticated: ' || CASE WHEN auth.uid() IS NOT NULL THEN 'YES' ELSE 'NO' END as is_authenticated;

-- 4. Test the message existence
SELECT 
    'Message Test' as check_type,
    'Message ID exists: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '5d625942-fc19-4df1-af5d-b81cab7cdea2'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as message_exists;

-- 5. Test the policy logic step by step
SELECT 
    'Policy Logic Test' as check_type,
    'Step 1 - Message exists: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '5d625942-fc19-4df1-af5d-b81cab7cdea2'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as step1,
    'Step 2 - User ID exists: ' || CASE 
        WHEN auth.uid() IS NOT NULL THEN 'YES' 
        ELSE 'NO' 
    END as step2,
    'Step 3 - User is sender: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '5d625942-fc19-4df1-af5d-b81cab7cdea2'
            AND m.sender_id = auth.uid()
        ) THEN 'YES' 
        ELSE 'NO' 
    END as step3;

-- 6. Check if there are any other RLS policies that might interfere
SELECT 
    'Other RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('internal_messages', 'messages', 'message_threads')
ORDER BY tablename, policyname;

-- 7. Check the internal_messages table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'internal_messages'
ORDER BY ordinal_position;
