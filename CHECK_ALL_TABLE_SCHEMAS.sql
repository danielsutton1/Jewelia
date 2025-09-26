-- Check structure of all core business tables

-- Check products table structure
SELECT 
    'products' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check orders table structure
SELECT 
    'orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check inventory table structure
SELECT 
    'inventory' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'inventory'
ORDER BY ordinal_position;

-- Check communications table structure
SELECT 
    'communications' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'communications'
ORDER BY ordinal_position;

-- Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name IN ('customers', 'products', 'orders', 'inventory', 'communications')
AND table_schema = 'public'
ORDER BY table_name; 