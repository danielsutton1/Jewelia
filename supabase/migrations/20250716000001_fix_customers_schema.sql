-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

-- Remove default after populating (optional, for stricter schema)
-- ALTER TABLE customers ALTER COLUMN full_name DROP DEFAULT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- RLS: Allow all authenticated users to select, insert, and update
DROP POLICY IF EXISTS "Authenticated can view customers" ON customers;
DROP POLICY IF EXISTS "Authenticated can insert customers" ON customers;
DROP POLICY IF EXISTS "Authenticated can update customers" ON customers;

CREATE POLICY "Authenticated can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true); 