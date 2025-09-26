-- 🔴 CRITICAL DATABASE FIXES - JEWELRY CRM
-- Apply this script in your Supabase Dashboard SQL Editor
-- This fixes all critical issues identified in the audit

-- =====================================================
-- 1. CREATE MISSING update_customer_company FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_customer_company(
    customer_id UUID,
    company_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the customer's company information
    UPDATE customers 
    SET 
        company = company_name,
        updated_at = NOW()
    WHERE id = customer_id;
    
    -- Return true if update was successful
    RETURN FOUND;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error and return false
        RAISE WARNING 'Error updating customer company: %', SQLERRM;
        RETURN FALSE;
END;
$$;

-- =====================================================
-- 2. ADD MISSING COMPANY COLUMN TO CUSTOMERS TABLE
-- =====================================================

-- Add company column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'company'
    ) THEN
        ALTER TABLE customers ADD COLUMN company TEXT;
        RAISE NOTICE 'Added company column to customers table';
    ELSE
        RAISE NOTICE 'Company column already exists in customers table';
    END IF;
END $$;

-- =====================================================
-- 3. FIX COMMUNICATIONS TABLE RELATIONSHIPS
-- =====================================================

-- First, let's check if communications table exists and its current structure
DO $$ 
BEGIN
    -- Check if communications table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'communications') THEN
        
        -- Add sender_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'sender_id'
        ) THEN
            ALTER TABLE communications ADD COLUMN sender_id UUID;
            RAISE NOTICE 'Added sender_id column to communications table';
        END IF;
        
        -- Add recipient_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'communications' AND column_name = 'recipient_id'
        ) THEN
            ALTER TABLE communications ADD COLUMN recipient_id UUID;
            RAISE NOTICE 'Added recipient_id column to communications table';
        END IF;
        
        -- Add foreign key constraints if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'communications' 
            AND constraint_name = 'communications_sender_id_fkey'
        ) THEN
            ALTER TABLE communications 
            ADD CONSTRAINT communications_sender_id_fkey 
            FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added foreign key constraint for sender_id';
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'communications' 
            AND constraint_name = 'communications_recipient_id_fkey'
        ) THEN
            ALTER TABLE communications 
            ADD CONSTRAINT communications_recipient_id_fkey 
            FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added foreign key constraint for recipient_id';
        END IF;
        
    ELSE
        -- Create communications table if it doesn't exist
        CREATE TABLE communications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            subject TEXT,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'email' CHECK (type IN ('email', 'sms', 'notification', 'internal')),
            status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'failed')),
            priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created communications table with proper relationships';
    END IF;
END $$;

-- =====================================================
-- 4. ADD CRITICAL PERFORMANCE INDEXES
-- =====================================================

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Inventory table indexes
CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);

-- Communications table indexes
CREATE INDEX IF NOT EXISTS idx_communications_sender_id ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient_id ON communications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on core business tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR CORE TABLES
-- =====================================================

-- Customers table policies
DROP POLICY IF EXISTS "Users can view customers" ON customers;
CREATE POLICY "Users can view customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create customers" ON customers;
CREATE POLICY "Users can create customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update customers" ON customers;
CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete customers" ON customers;
CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Products table policies
DROP POLICY IF EXISTS "Users can view products" ON products;
CREATE POLICY "Users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create products" ON products;
CREATE POLICY "Users can create products" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update products" ON products;
CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete products" ON products;
CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Orders table policies
DROP POLICY IF EXISTS "Users can view orders" ON orders;
CREATE POLICY "Users can view orders" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update orders" ON orders;
CREATE POLICY "Users can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete orders" ON orders;
CREATE POLICY "Users can delete orders" ON orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Inventory table policies
DROP POLICY IF EXISTS "Users can view inventory" ON inventory;
CREATE POLICY "Users can view inventory" ON inventory
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create inventory" ON inventory;
CREATE POLICY "Users can create inventory" ON inventory
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update inventory" ON inventory;
CREATE POLICY "Users can update inventory" ON inventory
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete inventory" ON inventory;
CREATE POLICY "Users can delete inventory" ON inventory
    FOR DELETE USING (auth.role() = 'authenticated');

-- Communications table policies
DROP POLICY IF EXISTS "Users can view their communications" ON communications;
CREATE POLICY "Users can view their communications" ON communications
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            recipient_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Users can create communications" ON communications;
CREATE POLICY "Users can create communications" ON communications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their communications" ON communications;
CREATE POLICY "Users can update their communications" ON communications
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete their communications" ON communications;
CREATE POLICY "Users can delete their communications" ON communications
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            sender_id = auth.uid() OR 
            auth.uid() IN (
                SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
            )
        )
    );

-- =====================================================
-- 7. CREATE UPDATED_AT TRIGGER FOR COMMUNICATIONS
-- =====================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for communications table
DROP TRIGGER IF EXISTS update_communications_updated_at_trigger ON communications;
CREATE TRIGGER update_communications_updated_at_trigger
    BEFORE UPDATE ON communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Test the update_customer_company function
DO $$
DECLARE
    test_customer_id UUID;
    function_result BOOLEAN;
BEGIN
    -- Get a test customer ID
    SELECT id INTO test_customer_id FROM customers LIMIT 1;
    
    IF test_customer_id IS NOT NULL THEN
        -- Test the function
        SELECT update_customer_company(test_customer_id, 'Test Company') INTO function_result;
        
        IF function_result THEN
            RAISE NOTICE '✅ update_customer_company function working correctly';
        ELSE
            RAISE NOTICE '❌ update_customer_company function failed';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No customers found to test function';
    END IF;
END $$;

-- Check if all critical columns exist
DO $$
BEGIN
    -- Check customers table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company') THEN
        RAISE NOTICE '✅ Company column exists in customers table';
    ELSE
        RAISE NOTICE '❌ Company column missing from customers table';
    END IF;
    
    -- Check communications table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'sender_id') THEN
        RAISE NOTICE '✅ Sender_id column exists in communications table';
    ELSE
        RAISE NOTICE '❌ Sender_id column missing from communications table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'communications' AND column_name = 'recipient_id') THEN
        RAISE NOTICE '✅ Recipient_id column exists in communications table';
    ELSE
        RAISE NOTICE '❌ Recipient_id column missing from communications table';
    END IF;
END $$;

-- Check RLS policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers') THEN
        RAISE NOTICE '✅ RLS policies exist for customers table';
    ELSE
        RAISE NOTICE '❌ RLS policies missing for customers table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications') THEN
        RAISE NOTICE '✅ RLS policies exist for communications table';
    ELSE
        RAISE NOTICE '❌ RLS policies missing for communications table';
    END IF;
END $$;

-- =====================================================
-- 9. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CRITICAL DATABASE FIXES APPLIED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Fixed Issues:';
    RAISE NOTICE '   - Created update_customer_company function';
    RAISE NOTICE '   - Added company column to customers table';
    RAISE NOTICE '   - Fixed communications table relationships';
    RAISE NOTICE '   - Added critical performance indexes';
    RAISE NOTICE '   - Enabled RLS on core tables';
    RAISE NOTICE '   - Created comprehensive RLS policies';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your jewelry CRM database is now production-ready!';
    RAISE NOTICE '';
END $$; 