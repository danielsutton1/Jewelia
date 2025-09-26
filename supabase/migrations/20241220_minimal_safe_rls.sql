-- MINIMAL SAFE RLS POLICIES - ESSENTIAL SECURITY ONLY
-- This migration only ADDS security policies, does NOT modify or delete any data
-- Only creates indexes on columns that actually exist

-- Step 1: Enable RLS on tables (safe - just adds security layer)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Step 2: Create helper function (safe - just adds tool)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role::text FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create RLS policies (safe - just adds security rules)

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Customers table policies (all authenticated users can view/manage)
CREATE POLICY "Authenticated users can view customers" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage customers" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders table policies (all authenticated users can view/manage)
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Inventory table policies (all authenticated users can view/manage)
CREATE POLICY "Authenticated users can view inventory" ON inventory
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage inventory" ON inventory
  FOR ALL USING (auth.role() = 'authenticated');

-- Repairs table policies (all authenticated users can view/manage)
CREATE POLICY "Authenticated users can view repairs" ON repairs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage repairs" ON repairs
  FOR ALL USING (auth.role() = 'authenticated');



-- Step 4: Grant necessary permissions (safe - just gives access)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5: Create only essential indexes (safe - just improves speed)
-- Only create indexes on columns that actually exist
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_repairs_customer_id ON repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);


-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Minimal RLS policies applied successfully! No data was modified or deleted.';
  RAISE NOTICE 'All authenticated users can now access the system with proper security.';
END $$; 