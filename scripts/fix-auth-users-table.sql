-- =====================================================
-- FIX AUTH.USERS TABLE
-- =====================================================
-- This script adds the missing email_change_token column to auth.users

-- Add email_change_token column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'email_change_token'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN email_change_token UUID;
        RAISE NOTICE 'Added email_change_token column to auth.users';
    ELSE
        RAISE NOTICE 'email_change_token column already exists in auth.users';
    END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$
BEGIN
    -- Add email_change column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'email_change'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN email_change TEXT;
        RAISE NOTICE 'Added email_change column to auth.users';
    END IF;
    
    -- Add recovery_token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'recovery_token'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN recovery_token TEXT;
        RAISE NOTICE 'Added recovery_token column to auth.users';
    END IF;
    
    -- Add confirmation_token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'confirmation_token'
    ) THEN
        ALTER TABLE auth.users ADD COLUMN confirmation_token TEXT;
        RAISE NOTICE 'Added confirmation_token column to auth.users';
    END IF;
END $$;

-- Insert test users into auth.users if they don't exist
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
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (id) DO NOTHING;

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
    NULL,
    NULL,
    NULL,
    NULL
) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    RAISE NOTICE 'Auth.users table fix completed successfully!';
    RAISE NOTICE 'Added missing columns and test users.';
END $$;
