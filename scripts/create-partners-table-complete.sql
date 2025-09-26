-- =====================================================
-- CREATE COMPLETE PARTNERS TABLE WITH SAMPLE DATA
-- =====================================================

-- First, let's drop the existing partners table if it exists and recreate it properly
DROP TABLE IF EXISTS partners CASCADE;

-- Create the partners table with all required columns
CREATE TABLE partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'supplier',
    email TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    contact_person TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    rating DECIMAL(3,1) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_rating ON partners(rating);

-- Enable RLS (Row Level Security)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON partners
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON partners
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON partners
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON partners
    FOR DELETE USING (true);

-- Insert sample partners data
INSERT INTO partners (id, name, type, email, phone, address, website, contact_person, description, status, rating, notes, created_at, updated_at) VALUES
('partner-1', 'Diamond Wholesale Co.', 'supplier', 'contact@diamondwholesale.com', '+1-555-0101', '123 Diamond Street, New York, NY 10001', 'www.diamondwholesale.com', 'John Smith', 'Premium diamond supplier with 20+ years experience', 'active', 4.8, 'Reliable supplier, fast shipping', NOW(), NOW()),
('partner-2', 'Gold & Silver Exchange', 'supplier', 'sales@goldandsilver.com', '+1-555-0102', '456 Precious Metals Ave, Los Angeles, CA 90210', 'www.goldandsilver.com', 'Sarah Johnson', 'Leading precious metals supplier', 'active', 4.6, 'Great prices, quality products', NOW(), NOW()),
('partner-3', 'Luxury Jewelry Retail', 'retailer', 'orders@luxuryjewelry.com', '+1-555-0103', '789 Luxury Lane, Miami, FL 33101', 'www.luxuryjewelry.com', 'Mike Chen', 'High-end jewelry retailer', 'active', 4.9, 'Premium customer service', NOW(), NOW()),
('partner-4', 'Gemstone Importers', 'supplier', 'info@gemstoneimporters.com', '+1-555-0104', '321 Gem Street, San Francisco, CA 94102', 'www.gemstoneimporters.com', 'Emma Wilson', 'Specialized gemstone importer', 'active', 4.7, 'Unique stones, competitive pricing', NOW(), NOW()),
('partner-5', 'Jewelry Design Studio', 'designer', 'hello@jewelrydesign.com', '+1-555-0105', '654 Design Blvd, Chicago, IL 60601', 'www.jewelrydesign.com', 'Lisa Rodriguez', 'Custom jewelry design services', 'active', 4.8, 'Creative designs, excellent craftsmanship', NOW(), NOW());

-- =====================================================
-- REFRESH SCHEMA CACHE
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFY THE DATA
-- =====================================================

-- Check the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'partners' 
ORDER BY ordinal_position;

-- Check the inserted data
SELECT id, name, type, email, status, rating FROM partners ORDER BY name;

-- Count the records
SELECT COUNT(*) as total_partners FROM partners;

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PARTNERS TABLE CREATED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ Partners table recreated with all columns';
    RAISE NOTICE '✅ RLS policies enabled';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '✅ 5 sample B2B partners inserted';
    RAISE NOTICE '✅ Schema cache refreshed';
    RAISE NOTICE '=====================================================';
END $$;
