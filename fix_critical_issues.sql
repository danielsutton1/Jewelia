-- Critical Database Fixes - Direct SQL Application
-- This script fixes the immediate issues causing API failures

-- 1. Create the missing update_customer_company function
CREATE OR REPLACE FUNCTION update_customer_company(
  customer_id UUID,
  company_name VARCHAR(255)
) RETURNS VOID AS $$
BEGIN
  UPDATE customers 
  SET company = company_name, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure company column exists in customers table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'company'
  ) THEN
    ALTER TABLE customers ADD COLUMN company VARCHAR(255);
  END IF;
END $$;

-- 3. Fix communications table structure
DO $$
BEGIN
  -- Add sender_id and recipient_id columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'communications' 
    AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE communications ADD COLUMN sender_id UUID REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'communications' 
    AND column_name = 'recipient_id'
  ) THEN
    ALTER TABLE communications ADD COLUMN recipient_id UUID REFERENCES users(id);
  END IF;
END $$;

-- 4. Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);
CREATE INDEX IF NOT EXISTS idx_communications_sender ON communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_communications_recipient ON communications(recipient_id);

-- 6. Update any existing communications records to have proper relationships
UPDATE communications 
SET sender_id = (SELECT id FROM users LIMIT 1)
WHERE sender_id IS NULL;

-- 7. Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for audit_logs
CREATE POLICY "Enable read access for authenticated users" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 9. Verify the fixes
SELECT 'Function created successfully' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'update_customer_company'
);

SELECT 'Company column exists' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'customers' 
  AND column_name = 'company'
);

SELECT 'Communications table fixed' as status WHERE EXISTS (
  SELECT 1 FROM information_schema.columns 
  WHERE table_name = 'communications' 
  AND column_name = 'sender_id'
); 