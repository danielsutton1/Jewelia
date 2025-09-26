-- Fresh Team Management System Setup
-- This script completely recreates everything from scratch

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS internal_messages CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Step 2: Create jewelry_role enum
DO $$ BEGIN
    CREATE TYPE jewelry_role AS ENUM (
        'admin',
        'manager',
        'sales_representative',
        'jewelry_designer',
        'gemologist',
        'metalsmith',
        'quality_control',
        'inventory_specialist',
        'customer_service',
        'assistant'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100) DEFAULT 'jewelry',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Add columns to users table (remove existing ones first if they exist)
DO $$ BEGIN
    ALTER TABLE users DROP COLUMN IF EXISTS business_id;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users DROP COLUMN IF EXISTS jewelry_role;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users DROP COLUMN IF EXISTS department;
EXCEPTION
    WHEN undefined_column THEN null;
END $$;

-- Now add the columns fresh
ALTER TABLE users ADD COLUMN business_id UUID;
ALTER TABLE users ADD COLUMN jewelry_role jewelry_role DEFAULT 'assistant';
ALTER TABLE users ADD COLUMN department VARCHAR(100);

-- Step 5: Create internal_messages table with ALL columns
CREATE TABLE internal_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'unread',
    business_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Insert default business
INSERT INTO businesses (id, name, description, industry, address, phone, email, website)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Jewelia Jewelry Co.',
    'Premium jewelry design and manufacturing company',
    'jewelry',
    '123 Jewelry Lane, NY 10001',
    '+1-555-0123',
    'info@jewelia.com',
    'https://jewelia.com'
) ON CONFLICT DO NOTHING;

-- Step 7: Update existing test user
UPDATE users 
SET business_id = '550e8400-e29b-41d4-a716-446655440000',
    jewelry_role = 'admin',
    department = 'Management'
WHERE email = 'test@jewelia.com';

-- Step 8: Insert one sample team member
INSERT INTO users (id, email, full_name, role, jewelry_role, business_id, department)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'michael.jones@jewelia.com',
    'Michael Jones',
    'manager',
    'manager',
    '550e8400-e29b-41d4-a716-446655440000',
    'Sales'
) ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    jewelry_role = EXCLUDED.jewelry_role,
    business_id = EXCLUDED.business_id,
    department = EXCLUDED.department;

-- Step 9: Insert sample message (now business_id column exists)
INSERT INTO internal_messages (sender_id, recipient_id, subject, content, business_id)
VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '550e8400-e29b-41d4-a716-446655440001',
    'Welcome to the Team!',
    'Welcome Michael! We''re excited to have you join our jewelry team.',
    '550e8400-e29b-41d4-a716-446655440000'
);

-- Step 10: Create basic indexes
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_jewelry_role ON users(jewelry_role);
CREATE INDEX IF NOT EXISTS idx_internal_messages_business_id ON internal_messages(business_id);

-- Success message
SELECT 'Fresh Team Management System created successfully!' as status;

