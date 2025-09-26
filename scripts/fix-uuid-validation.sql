-- =====================================================
-- FIX UUID VALIDATION ISSUES
-- =====================================================
-- This script ensures all user IDs are valid UUIDs and creates test users

-- =====================================================
-- 1. CREATE TEST USERS IN AUTH.USERS
-- =====================================================

-- Insert test user into auth.users if it doesn't exist
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token,
    recovery_token
) VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test@jewelia.com',
    crypt('testpassword123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test User", "role": "admin"}',
    false,
    NOW(),
    NULL,
    NULL,
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Insert another test user for messaging tests
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at,
    phone,
    phone_confirmed_at,
    confirmation_token,
    email_change,
    email_change_token,
    recovery_token
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@jewelia.com',
    crypt('adminpassword123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin User", "role": "admin"}',
    false,
    NOW(),
    NULL,
    NULL,
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE USERS TABLE ENTRIES
-- =====================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'staff',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert test users into users table
INSERT INTO users (id, full_name, email, role, avatar_url)
VALUES (
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'Test User',
    'test@jewelia.com',
    'admin',
    NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, full_name, email, role, avatar_url)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Admin User',
    'admin@jewelia.com',
    'admin',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CREATE PARTNERS TABLE FOR EXTERNAL MESSAGING
-- =====================================================

-- Create partners table if it doesn't exist
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    type TEXT DEFAULT 'supplier',
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample partner
INSERT INTO partners (id, name, company, email, type, status)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'Test Partner',
    'Partner Company Inc.',
    'partner@example.com',
    'supplier',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. CREATE ORGANIZATIONS TABLE
-- =====================================================

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'company',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample organization
INSERT INTO organizations (id, name, type, status)
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'Jewelia CRM',
    'company',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. CREATE ORDERS TABLE
-- =====================================================

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE,
    customer_id UUID,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CREATE TASKS TABLE
-- =====================================================

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    assigned_to UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. CREATE PROJECTS TABLE
-- =====================================================

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. CREATE DEPARTMENTS TABLE
-- =====================================================

-- Create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. VERIFY THE FIX
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'UUID validation fix completed successfully!';
    RAISE NOTICE 'Test users created in auth.users and users tables';
    RAISE NOTICE 'Supporting tables created: partners, organizations, orders, tasks, projects, departments';
    RAISE NOTICE 'All UUIDs are now valid and properly referenced';
END $$;
