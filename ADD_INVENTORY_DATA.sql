-- Add comprehensive inventory data for Jewelia CRM

-- Create inventory table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    category TEXT,
    location TEXT DEFAULT 'Main Warehouse',
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    unit_price DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued', 'low_stock')),
    condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'used', 'refurbished', 'damaged')),
    supplier TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory
CREATE POLICY "Users can view inventory" ON inventory
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create inventory" ON inventory
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update inventory" ON inventory
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add comprehensive inventory data
INSERT INTO inventory (
    product_id,
    sku,
    name,
    category,
    location,
    quantity,
    reserved_quantity,
    available_quantity,
    unit_cost,
    unit_price,
    status,
    condition,
    supplier
) VALUES 
-- Diamond Inventory
(
    (SELECT id FROM products WHERE name LIKE '%Diamond%' LIMIT 1),
    'DIAM-001',
    '1.5 Carat Diamond',
    'diamonds',
    'Vault A',
    15,
    3,
    12,
    1200.00,
    2500.00,
    'active',
    'new',
    'Diamond Source Inc.'
),
(
    (SELECT id FROM products WHERE name LIKE '%Diamond%' LIMIT 1),
    'DIAM-002',
    '2.0 Carat Diamond',
    'diamonds',
    'Vault A',
    8,
    2,
    6,
    1800.00,
    3500.00,
    'active',
    'new',
    'Diamond Source Inc.'
),
(
    (SELECT id FROM products WHERE name LIKE '%Diamond%' LIMIT 1),
    'DIAM-003',
    '0.75 Carat Diamond',
    'diamonds',
    'Vault B',
    25,
    5,
    20,
    600.00,
    1200.00,
    'active',
    'new',
    'Diamond Source Inc.'
),

-- Gold Inventory
(
    (SELECT id FROM products WHERE name LIKE '%Ring%' LIMIT 1),
    'GOLD-001',
    '14K Gold Band',
    'metals',
    'Storage Room 1',
    50,
    8,
    42,
    200.00,
    450.00,
    'active',
    'new',
    'Gold Suppliers Ltd.'
),
(
    (SELECT id FROM products WHERE name LIKE '%Ring%' LIMIT 1),
    'GOLD-002',
    '18K Gold Band',
    'metals',
    'Storage Room 1',
    30,
    4,
    26,
    300.00,
    650.00,
    'active',
    'new',
    'Gold Suppliers Ltd.'
),

-- Watch Inventory
(
    (SELECT id FROM products WHERE name LIKE '%Watch%' LIMIT 1),
    'WATCH-001',
    'Luxury Watch Movement',
    'watch_parts',
    'Storage Room 2',
    12,
    2,
    10,
    400.00,
    800.00,
    'active',
    'new',
    'Watch Parts Co.'
),
(
    (SELECT id FROM products WHERE name LIKE '%Watch%' LIMIT 1),
    'WATCH-002',
    'Watch Band - Leather',
    'watch_parts',
    'Storage Room 2',
    45,
    6,
    39,
    50.00,
    120.00,
    'active',
    'new',
    'Watch Parts Co.'
),

-- Pearl Inventory
(
    (SELECT id FROM products WHERE name LIKE '%Pearl%' LIMIT 1),
    'PEARL-001',
    'Freshwater Pearls',
    'pearls',
    'Storage Room 3',
    100,
    15,
    85,
    25.00,
    60.00,
    'active',
    'new',
    'Pearl Harvesters'
),
(
    (SELECT id FROM products WHERE name LIKE '%Pearl%' LIMIT 1),
    'PEARL-002',
    'South Sea Pearls',
    'pearls',
    'Storage Room 3',
    20,
    3,
    17,
    150.00,
    300.00,
    'active',
    'new',
    'Pearl Harvesters'
),

-- Sapphire Inventory
(
    (SELECT id FROM products WHERE name LIKE '%Sapphire%' LIMIT 1),
    'SAPP-001',
    'Blue Sapphire 1.0ct',
    'gemstones',
    'Vault C',
    18,
    4,
    14,
    300.00,
    600.00,
    'active',
    'new',
    'Gemstone Traders'
),
(
    (SELECT id FROM products WHERE name LIKE '%Sapphire%' LIMIT 1),
    'SAPP-002',
    'Pink Sapphire 0.8ct',
    'gemstones',
    'Vault C',
    22,
    3,
    19,
    250.00,
    500.00,
    'active',
    'new',
    'Gemstone Traders'
),

-- Bracelet Inventory
(
    (SELECT id FROM products WHERE name LIKE '%Bracelet%' LIMIT 1),
    'BRAC-001',
    'Tennis Bracelet Chain',
    'bracelet_parts',
    'Storage Room 4',
    35,
    7,
    28,
    400.00,
    900.00,
    'active',
    'new',
    'Chain Manufacturers'
),
(
    (SELECT id FROM products WHERE name LIKE '%Bracelet%' LIMIT 1),
    'BRAC-002',
    'Bracelet Clasp',
    'bracelet_parts',
    'Storage Room 4',
    60,
    10,
    50,
    30.00,
    75.00,
    'active',
    'new',
    'Chain Manufacturers'
),

-- Low Stock Items
(
    (SELECT id FROM products LIMIT 1),
    'LOW-001',
    'Rare Emerald 2.0ct',
    'gemstones',
    'Vault A',
    3,
    1,
    2,
    800.00,
    1600.00,
    'low_stock',
    'new',
    'Gemstone Traders'
),
(
    (SELECT id FROM products LIMIT 1),
    'LOW-002',
    'Platinum Wire',
    'metals',
    'Storage Room 1',
    5,
    2,
    3,
    500.00,
    1100.00,
    'low_stock',
    'new',
    'Platinum Suppliers'
),

-- Discontinued Items
(
    (SELECT id FROM products LIMIT 1),
    'DISC-001',
    'Old Style Watch Face',
    'watch_parts',
    'Storage Room 2',
    8,
    0,
    8,
    100.00,
    200.00,
    'discontinued',
    'new',
    'Watch Parts Co.'
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Verify inventory data
SELECT 
    sku,
    name,
    category,
    location,
    quantity,
    available_quantity,
    status,
    unit_price
FROM inventory 
ORDER BY category, name;

-- Show inventory summary by category
SELECT 
    category,
    COUNT(*) as item_count,
    SUM(quantity) as total_quantity,
    SUM(available_quantity) as available_quantity,
    SUM(quantity * unit_price) as total_value
FROM inventory 
GROUP BY category 
ORDER BY total_value DESC; 