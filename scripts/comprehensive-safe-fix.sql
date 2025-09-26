-- Comprehensive Safe Fix Script
-- Drops duplicate FK, adds missing FKs, and adds missing columns (all non-destructive)

-- 1. Drop duplicate foreign key constraint from orders (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_orders_customer' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT fk_orders_customer;
        RAISE NOTICE 'Dropped duplicate foreign key constraint: fk_orders_customer';
    END IF;
END $$;

-- 2. Add missing foreign key to quotes.customer_id -> customers.id (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_quotes_customer' 
        AND table_name = 'quotes'
    ) THEN
        ALTER TABLE quotes ADD CONSTRAINT fk_quotes_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint: fk_quotes_customer';
    END IF;
END $$;

-- 3. Add missing columns to products (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku TEXT UNIQUE;
        RAISE NOTICE 'Added column: products.sku';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name'
    ) THEN
        ALTER TABLE products ADD COLUMN name TEXT;
        RAISE NOTICE 'Added column: products.name';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status'
    ) THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added column: products.status';
    END IF;
END $$;

-- All done! 