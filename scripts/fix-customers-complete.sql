-- Complete Customers Table Fix
-- This script will fix the schema and add sample data

-- Step 1: Check current schema
SELECT 'Current schema:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public';

-- Step 2: Fix schema issues
DO $$
BEGIN
    -- If 'name' column exists, rename it to 'full_name'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'name'
    ) THEN
        ALTER TABLE customers RENAME COLUMN name TO full_name;
        RAISE NOTICE 'Renamed name column to full_name';
    END IF;
    
    -- If 'full_name' column doesn't exist, add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE customers ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Added full_name column';
    END IF;
    
    -- Remove any unwanted columns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'customer_type'
    ) THEN
        ALTER TABLE customers DROP COLUMN customer_type;
        RAISE NOTICE 'Removed customer_type column';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'Address'
    ) THEN
        ALTER TABLE customers DROP COLUMN "Address";
        RAISE NOTICE 'Removed Address column';
    END IF;
    
    -- Ensure required columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'email'
    ) THEN
        ALTER TABLE customers ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'phone'
    ) THEN
        ALTER TABLE customers ADD COLUMN phone VARCHAR(50);
        RAISE NOTICE 'Added phone column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'address'
    ) THEN
        ALTER TABLE customers ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'notes'
    ) THEN
        ALTER TABLE customers ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE customers ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Step 3: Show final schema
SELECT 'Final schema:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Clear existing data and add sample customers
DELETE FROM customers;

INSERT INTO customers (id, full_name, email, phone, address, notes, created_at, updated_at) VALUES
('cust_001', 'Sarah Johnson', 'sarah.johnson@emeraldjewels.com', '+1-555-0101', '123 Main Street, New York, NY 10001', 'Premium jewelry store owner, VIP customer, prefers platinum pieces', NOW(), NOW()),
('cust_002', 'Michael Chen', 'michael.chen@elegantevents.com', '+1-555-0102', '456 Oak Avenue, Los Angeles, CA 90210', 'Wedding planner, frequently orders bridal jewelry sets', NOW(), NOW()),
('cust_003', 'Emma Rodriguez', 'emma.rodriguez@couture.com', '+1-555-0103', '789 Fashion Blvd, Miami, FL 33101', 'Fashion designer, interested in custom jewelry pieces', NOW(), NOW()),
('cust_004', 'David Thompson', 'david.thompson@luxuryhomes.com', '+1-555-0104', '321 Luxury Lane, Beverly Hills, CA 90212', 'High-end real estate agent, collects vintage jewelry', NOW(), NOW()),
('cust_005', 'Lisa Park', 'lisa.park@techcorp.com', '+1-555-0105', '654 Innovation Drive, San Francisco, CA 94105', 'Tech executive, prefers modern, minimalist jewelry designs', NOW(), NOW()),
('cust_006', 'Robert Williams', 'robert.williams@artgallery.com', '+1-555-0106', '987 Art District, Chicago, IL 60601', 'Art gallery owner, interested in unique, artistic jewelry pieces', NOW(), NOW()),
('cust_007', 'Maria Garcia', 'maria.garcia@finecuisine.com', '+1-555-0107', '147 Gourmet Street, New Orleans, LA 70130', 'Restaurant owner, collects traditional jewelry from different cultures', NOW(), NOW()),
('cust_008', 'James Wilson', 'james.wilson@investments.com', '+1-555-0108', '258 Wall Street, New York, NY 10005', 'Investment banker, prefers high-value investment pieces', NOW(), NOW()),
('cust_009', 'Amanda Foster', 'amanda.foster@interiors.com', '+1-555-0109', '369 Design Way, Austin, TX 78701', 'Interior designer, interested in jewelry that complements home decor', NOW(), NOW()),
('cust_010', 'Dr. Christopher Lee', 'dr.lee@medicalcenter.com', '+1-555-0110', '741 Health Plaza, Boston, MA 02108', 'Medical professional, prefers hypoallergenic jewelry materials', NOW(), NOW());

-- Step 5: Verify the data
SELECT 'Sample data added:' as info;
SELECT 
    id,
    full_name,
    email,
    phone,
    address,
    notes,
    created_at
FROM customers 
ORDER BY created_at DESC; 