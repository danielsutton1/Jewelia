-- Migration: Add missing indexes for performance optimization (2025-07-16)
-- Note: Only includes indexes for tables that exist in the current schema

-- Repairs table (exists in main schema)
CREATE INDEX IF NOT EXISTS idx_repairs_customer_id ON repairs(customer_id);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_estimated_completion ON repairs(estimated_completion);



-- Orders table (exists in main schema)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);



-- Inventory table (exists in main schema)
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);

-- Customers table (exists in main schema)
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Users table (exists in main schema)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Note: Production tables (production_projects, production_stages) may need to be created first
-- before their indexes can be added. These should be added after the production tables migration is applied. 