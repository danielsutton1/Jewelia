-- Final Schema Fix Script
-- Add missing columns to products table and fix inventory status

-- 1. ADD MISSING COLUMNS TO PRODUCTS TABLE
DO $$
BEGIN
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'sku'
    ) THEN
        ALTER TABLE products ADD COLUMN sku TEXT;
        RAISE NOTICE 'Added sku column to products table';
    END IF;
    
    -- Add name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'name'
    ) THEN
        ALTER TABLE products ADD COLUMN name TEXT;
        RAISE NOTICE 'Added name column to products table';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'status'
    ) THEN
        ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to products table';
    END IF;
END $$;

-- 2. FIX INVENTORY STATUS ENUM - Create type and alter column
DO $$
BEGIN
    -- Create inventory_status enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_status') THEN
        CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'on_order', 'discontinued');
        RAISE NOTICE 'Created inventory_status enum type';
    END IF;

    -- Fix inventory.status column to use the new enum type
    -- First, drop the default value if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'status' AND column_default IS NOT NULL
    ) THEN
        ALTER TABLE inventory ALTER COLUMN status DROP DEFAULT;
        RAISE NOTICE 'Dropped default value from inventory.status column';
    END IF;

    -- Then alter the column type with data conversion
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory' AND column_name = 'status' AND data_type = 'text'
    ) THEN
        ALTER TABLE inventory ALTER COLUMN status TYPE inventory_status USING 
            CASE 
                WHEN status = 'active' THEN 'in_stock'::inventory_status
                WHEN status = 'inactive' THEN 'out_of_stock'::inventory_status
                WHEN status = 'available' THEN 'in_stock'::inventory_status
                WHEN status = 'damaged' THEN 'out_of_stock'::inventory_status
                WHEN status = 'low_stock' THEN 'low_stock'::inventory_status
                WHEN status = 'on_order' THEN 'on_order'::inventory_status
                WHEN status = 'discontinued' THEN 'discontinued'::inventory_status
                ELSE 'in_stock'::inventory_status
            END;
        RAISE NOTICE 'Altered inventory.status column to inventory_status enum';
    END IF;

    -- Finally, add back the default value with the correct enum type
    ALTER TABLE inventory ALTER COLUMN status SET DEFAULT 'in_stock'::inventory_status;
    RAISE NOTICE 'Set default value for inventory.status column to in_stock';
END $$;

-- 3. UPDATE EXISTING PRODUCTS WITH DEFAULT VALUES
DO $$
BEGIN
    -- Update products with default values if they are null
    UPDATE products SET 
        sku = COALESCE(sku, 'SKU-' || id::text),
        name = COALESCE(name, 'Product ' || id::text),
        status = COALESCE(status, 'active')
    WHERE sku IS NULL OR name IS NULL OR status IS NULL;
    
    RAISE NOTICE 'Updated products with default values';
END $$;

-- 4. VERIFY THE FIXES
SELECT 
    'Products table columns:' as check_type,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('sku', 'name', 'status');

SELECT 
    'Inventory status enum:' as check_type,
    typname as enum_name,
    enumlabel as enum_value
FROM pg_type 
JOIN pg_enum ON pg_type.oid = pg_enum.enumtypid 
WHERE typname = 'inventory_status'
ORDER BY enumsortorder;

SELECT 
    'Sample products:' as check_type,
    COUNT(*) as total_products,
    COUNT(CASE WHEN sku IS NOT NULL THEN 1 END) as products_with_sku,
    COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as products_with_name,
    COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as products_with_status
FROM products;

SELECT 
    'Sample inventory:' as check_type,
    COUNT(*) as total_inventory,
    COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as inventory_with_status
FROM inventory; 