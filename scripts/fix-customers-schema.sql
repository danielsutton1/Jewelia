-- Fix Customers Table Schema
-- This script ensures the customers table has the correct columns

-- First, let's check what columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public';

-- Add full_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'full_name'
    ) THEN
        -- If 'name' column exists, rename it to 'full_name'
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'customers' AND column_name = 'name'
        ) THEN
            ALTER TABLE customers RENAME COLUMN name TO full_name;
            RAISE NOTICE 'Renamed name column to full_name';
        ELSE
            -- Add full_name column
            ALTER TABLE customers ADD COLUMN full_name VARCHAR(255);
            RAISE NOTICE 'Added full_name column';
        END IF;
    END IF;
END $$;

-- Remove any unwanted columns if they exist
DO $$
BEGIN
    -- Remove customer_type column if it exists (we don't need it)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'customer_type'
    ) THEN
        ALTER TABLE customers DROP COLUMN customer_type;
        RAISE NOTICE 'Removed customer_type column';
    END IF;
    
    -- Remove Address column if it exists (we have address)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'Address'
    ) THEN
        ALTER TABLE customers DROP COLUMN "Address";
        RAISE NOTICE 'Removed Address column';
    END IF;
END $$;

-- Verify the final schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position; 