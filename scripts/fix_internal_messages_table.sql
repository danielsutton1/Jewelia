-- Fix Internal Messages Table Structure
-- This script will recreate the internal_messages table with the proper structure
-- so that users like Eli Martin can properly send and receive messages

-- Step 1: Drop the existing incomplete internal_messages table
DROP TABLE IF EXISTS internal_messages CASCADE;

-- Step 2: Create the proper internal_messages table with all necessary columns
CREATE TABLE internal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'urgent', 'announcement', 'task', 'support')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
    is_admin_message BOOLEAN DEFAULT FALSE,
    company_id UUID DEFAULT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    order_id UUID,
    parent_message_id UUID,
    thread_id UUID,
    attachments JSONB DEFAULT '[]',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_internal_messages_sender_id ON internal_messages(sender_id);
CREATE INDEX idx_internal_messages_recipient_id ON internal_messages(recipient_id);
CREATE INDEX idx_internal_messages_status ON internal_messages(status);
CREATE INDEX idx_internal_messages_created_at ON internal_messages(created_at);

-- Step 4: Insert a test message to Eli Martin to verify the system works
INSERT INTO internal_messages (
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    priority,
    status,
    company_id
) VALUES (
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4', -- Test User (Sarah Goldstein)
    'b2c3d4e5-f6a7-8901-bcde-f23456789012', -- Eli Martin
    'Welcome to Jewelia CRM!',
    'Hi Eli! Welcome to the team. You can now send and receive internal messages with your colleagues. This system will help us stay connected and coordinate our jewelry production workflow.',
    'general',
    'normal',
    'unread',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Step 5: Insert another test message from Eli Martin to verify bidirectional communication
INSERT INTO internal_messages (
    sender_id,
    recipient_id,
    subject,
    content,
    message_type,
    priority,
    status,
    company_id
) VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f23456789012', -- Eli Martin
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4', -- Test User (Sarah Goldstein)
    'Production Update',
    'Hi Sarah! Thanks for the welcome. I wanted to let you know that our new diamond collection is ready for quality inspection. The pieces look fantastic and meet all our standards.',
    'general',
    'normal',
    'unread',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Step 6: Verify the messages were created
SELECT 'Verifying internal messages:' as step;
SELECT 
    id,
    sender_id,
    recipient_id,
    subject,
    status,
    created_at
FROM internal_messages 
ORDER BY created_at DESC;

-- Step 7: Show user details for verification
SELECT 'User details:' as step;
SELECT 
    id,
    full_name,
    email,
    role
FROM users 
WHERE id IN (
    '6d1a08f1-134c-46dd-aa1e-21f95b80bed4',
    'b2c3d4e5-f6a7-8901-bcde-f23456789012'
)
ORDER BY full_name;

-- Step 8: Refresh Supabase schema cache
SELECT 'Refreshing schema cache...' as step;
NOTIFY pgrst, 'reload schema';
