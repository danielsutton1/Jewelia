-- Temporarily disable RLS on main tables to allow data insertion
-- Run this in your Supabase SQL Editor

-- Disable RLS on customers table
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on orders table  
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on inventory table
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;

-- Disable RLS on products_in_production_pipeline table
ALTER TABLE products_in_production_pipeline DISABLE ROW LEVEL SECURITY;

-- Note: You can re-enable RLS later with:
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products_in_production_pipeline ENABLE ROW LEVEL SECURITY;
