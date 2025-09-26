-- Fix message enums to match TypeScript interface
-- This will ensure the database schema matches what the frontend expects

-- Drop existing enum types if they exist
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS priority CASCADE;
DROP TYPE IF EXISTS message_status CASCADE;

-- Create the correct enum types
CREATE TYPE message_type AS ENUM (
    'general',
    'urgent', 
    'announcement',
    'task',
    'support'
);

CREATE TYPE priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);

CREATE TYPE message_status AS ENUM (
    'unread',
    'read',
    'archived',
    'deleted'
);

-- Drop and recreate the internal_messages table with proper types
DROP TABLE IF EXISTS internal_messages CASCADE;

CREATE TABLE internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type message_type DEFAULT 'general',
    priority priority DEFAULT 'normal',
    status message_status DEFAULT 'unread',
    is_admin_message BOOLEAN DEFAULT FALSE,
    business_id UUID,
    company_id UUID,
    order_id UUID,
    parent_message_id UUID,
    attachments JSONB DEFAULT '[]',
    read_at TIMESTAMP WITH TIME ZONE,
    thread_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert the sample message again
INSERT INTO internal_messages (
    sender_id, 
    recipient_id, 
    subject, 
    content, 
    message_type, 
    priority, 
    business_id
) VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',  -- Test User (sender)
    '550e8400-e29b-41d4-a716-446655440001',   -- Michael Jones (recipient)
    'Welcome to the Team!',
    'Welcome Michael! We''re excited to have you join our jewelry team.',
    'announcement',
    'high',
    '550e8400-e29b-41d4-a716-446655440000'   -- Jewelia business
);

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'internal_messages'
ORDER BY ordinal_position;

-- Verify the data
SELECT * FROM internal_messages;

