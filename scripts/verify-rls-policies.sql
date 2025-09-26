-- Verify RLS policies for message_attachments table
-- This will help debug why the INSERT is still failing

-- 1. Check if RLS is enabled
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'message_attachments';

-- 2. Show all policies on the table
SELECT 
    'Policy Details' as check_type,
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as using_clause,
    with_check as check_clause
FROM pg_policies 
WHERE tablename = 'message_attachments'
ORDER BY policyname;

-- 3. Check the specific INSERT policy
SELECT 
    'INSERT Policy Details' as check_type,
    policyname,
    with_check as check_clause
FROM pg_policies 
WHERE tablename = 'message_attachments' 
AND cmd = 'INSERT';

-- 4. Test the policy logic manually
-- Let's see what the policy is checking against
SELECT 
    'Policy Test' as check_type,
    'Testing INSERT policy logic' as note,
    'Current user ID: ' || auth.uid() as current_user,
    'Message exists: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '76ab88c2-916e-4da1-bdbb-783252c8372a'
        ) THEN 'YES' 
        ELSE 'NO' 
    END as message_exists,
    'User is sender: ' || CASE 
        WHEN EXISTS (
            SELECT 1 FROM internal_messages m
            WHERE m.id = '76ab88c2-916e-4da1-bdbb-783252c8372a'
            AND m.sender_id = auth.uid()
        ) THEN 'YES' 
        ELSE 'NO' 
    END as user_is_sender;

-- 5. Check the actual message data
SELECT 
    'Message Data' as check_type,
    id,
    sender_id,
    recipient_id,
    subject,
    created_at
FROM internal_messages 
WHERE id = '76ab88c2-916e-4da1-bdbb-783252c8372a';

-- 6. Check if there are any other policies that might conflict
SELECT 
    'All Table Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename LIKE '%message%'
ORDER BY tablename, policyname;
