-- Add More Team Members for Jewelia CRM
-- This script adds Daniel Smith, Eli Martin, Lisa Rodriguez, and Renee Lepir

-- Step 1: Add Daniel Smith - Senior Designer
INSERT INTO users (
    id,
    full_name,
    email,
    role,
    jewelry_role,
    department,
    created_at,
    updated_at
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Daniel Smith',
    'daniel@jewelia.com',
    'designer',
    'senior_designer',
    'Design',
    NOW(),
    NOW()
);

-- Step 2: Add Eli Martin - Production Manager
INSERT INTO users (
    id,
    full_name,
    email,
    role,
    jewelry_role,
    department,
    created_at,
    updated_at
) VALUES (
    'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    'Eli Martin',
    'eli@jewelia.com',
    'manager',
    'production_manager',
    'Production',
    NOW(),
    NOW()
);

-- Step 3: Add Lisa Rodriguez - Sales Representative
INSERT INTO users (
    id,
    full_name,
    email,
    role,
    jewelry_role,
    department,
    created_at,
    updated_at
) VALUES (
    'c3d4e5f6-g7h8-9012-cdef-g34567890123',
    'Lisa Rodriguez',
    'lisa@jewelia.com',
    'sales',
    'sales_representative',
    'Sales',
    NOW(),
    NOW()
);

-- Step 4: Add Renee Lepir - Quality Control Specialist
INSERT INTO users (
    id,
    full_name,
    email,
    role,
    jewelry_role,
    department,
    created_at,
    updated_at
) VALUES (
    'd4e5f6g7-h8i9-0123-defg-h45678901234',
    'Renee Lepir',
    'renee@jewelia.com',
    'specialist',
    'quality_control',
    'Quality Control',
    NOW(),
    NOW()
);

-- Step 5: Verify all team members are added
SELECT 'Verifying all team members:' as step;
SELECT 
    id,
    full_name,
    email,
    role,
    jewelry_role,
    department,
    created_at
FROM users 
ORDER BY created_at DESC;

-- Step 6: Refresh Supabase schema cache
SELECT 'Refreshing schema cache...' as step;
NOTIFY pgrst, 'reload schema';
