-- Add missing product columns for filtering
-- This migration ensures all required columns exist for product filtering

-- Add material and gemstone columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gemstone VARCHAR(100);

-- Add indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_gemstone ON products(gemstone);

-- Update existing products with sample material and gemstone data if they don't have it
UPDATE products 
SET 
    material = CASE 
        WHEN name ILIKE '%gold%' OR name ILIKE '%Gold%' THEN 'Gold'
        WHEN name ILIKE '%silver%' OR name ILIKE '%Silver%' THEN 'Silver'
        WHEN name ILIKE '%platinum%' OR name ILIKE '%Platinum%' THEN 'Platinum'
        WHEN name ILIKE '%rose%' OR name ILIKE '%Rose%' THEN 'Rose Gold'
        ELSE 'Gold' -- Default to Gold for jewelry
    END,
    gemstone = CASE 
        WHEN name ILIKE '%diamond%' OR name ILIKE '%Diamond%' THEN 'Diamond'
        WHEN name ILIKE '%pearl%' OR name ILIKE '%Pearl%' THEN 'Pearl'
        WHEN name ILIKE '%ruby%' OR name ILIKE '%Ruby%' THEN 'Ruby'
        WHEN name ILIKE '%sapphire%' OR name ILIKE '%Sapphire%' THEN 'Sapphire'
        WHEN name ILIKE '%emerald%' OR name ILIKE '%Emerald%' THEN 'Emerald'
        ELSE 'Diamond' -- Default to Diamond for jewelry
    END
WHERE material IS NULL OR gemstone IS NULL;

-- Add some sample products with different materials and gemstones for testing
INSERT INTO products (sku, name, description, category, price, cost, stock_quantity, material, gemstone, weight, dimensions, tags) VALUES
('RING-GOLD-001', 'Gold Wedding Ring', 'Classic 14k gold wedding ring', 'Rings', 800.00, 400.00, 10, 'Gold', 'Diamond', 2.5, '6mm', ARRAY['wedding', 'gold', 'classic']),
('NECK-SILVER-001', 'Silver Chain Necklace', 'Elegant silver chain necklace', 'Necklaces', 150.00, 75.00, 15, 'Silver', 'None', 5.0, '18 inches', ARRAY['silver', 'chain', 'elegant']),
('RING-PLATINUM-001', 'Platinum Engagement Ring', 'Luxurious platinum engagement ring', 'Rings', 3500.00, 2000.00, 3, 'Platinum', 'Diamond', 4.0, '7mm', ARRAY['engagement', 'platinum', 'luxury']),
('EARR-RUBY-001', 'Ruby Stud Earrings', 'Beautiful ruby stud earrings', 'Earrings', 600.00, 300.00, 8, 'Gold', 'Ruby', 1.5, '6mm', ARRAY['ruby', 'stud', 'earrings']),
('BRAC-SAPPHIRE-001', 'Sapphire Tennis Bracelet', 'Stunning sapphire tennis bracelet', 'Bracelets', 1200.00, 600.00, 5, 'Gold', 'Sapphire', 8.0, '7 inches', ARRAY['sapphire', 'tennis', 'bracelet']),
('PEND-EMERALD-001', 'Emerald Pendant', 'Vintage emerald pendant necklace', 'Pendants', 900.00, 450.00, 6, 'Gold', 'Emerald', 3.0, '12mm', ARRAY['emerald', 'pendant', 'vintage'])
ON CONFLICT (sku) DO NOTHING;
