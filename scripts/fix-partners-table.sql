-- =====================================================
-- FIX PARTNERS TABLE STRUCTURE AND ADD SAMPLE DATA
-- =====================================================

-- First, let's check what columns exist in the partners table
-- and add missing columns if needed

-- Add missing columns to partners table
DO $$
BEGIN
    -- Add 'type' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'type') THEN
        ALTER TABLE partners ADD COLUMN type TEXT DEFAULT 'supplier';
    END IF;
    
    -- Add 'website' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'website') THEN
        ALTER TABLE partners ADD COLUMN website TEXT;
    END IF;
    
    -- Add 'contact_person' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'contact_person') THEN
        ALTER TABLE partners ADD COLUMN contact_person TEXT;
    END IF;
    
    -- Add 'description' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'description') THEN
        ALTER TABLE partners ADD COLUMN description TEXT;
    END IF;
    
    -- Add 'rating' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'rating') THEN
        ALTER TABLE partners ADD COLUMN rating DECIMAL(3,1) DEFAULT 0.0;
    END IF;
    
    -- Add 'notes' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'notes') THEN
        ALTER TABLE partners ADD COLUMN notes TEXT;
    END IF;
    
    -- Add 'created_at' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'created_at') THEN
        ALTER TABLE partners ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add 'updated_at' column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partners' AND column_name = 'updated_at') THEN
        ALTER TABLE partners ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Now insert sample partners data
INSERT INTO partners (id, name, type, email, phone, address, website, contact_person, description, status, rating, notes, created_at, updated_at) VALUES
('partner-1', 'Diamond Wholesale Co.', 'supplier', 'contact@diamondwholesale.com', '+1-555-0101', '123 Diamond Street, New York, NY 10001', 'www.diamondwholesale.com', 'John Smith', 'Premium diamond supplier with 20+ years experience', 'active', 4.8, 'Reliable supplier, fast shipping', NOW(), NOW()),
('partner-2', 'Gold & Silver Exchange', 'supplier', 'sales@goldandsilver.com', '+1-555-0102', '456 Precious Metals Ave, Los Angeles, CA 90210', 'www.goldandsilver.com', 'Sarah Johnson', 'Leading precious metals supplier', 'active', 4.6, 'Great prices, quality products', NOW(), NOW()),
('partner-3', 'Luxury Jewelry Retail', 'retailer', 'orders@luxuryjewelry.com', '+1-555-0103', '789 Luxury Lane, Miami, FL 33101', 'www.luxuryjewelry.com', 'Mike Chen', 'High-end jewelry retailer', 'active', 4.9, 'Premium customer service', NOW(), NOW()),
('partner-4', 'Gemstone Importers', 'supplier', 'info@gemstoneimporters.com', '+1-555-0104', '321 Gem Street, San Francisco, CA 94102', 'www.gemstoneimporters.com', 'Emma Wilson', 'Specialized gemstone importer', 'active', 4.7, 'Unique stones, competitive pricing', NOW(), NOW()),
('partner-5', 'Jewelry Design Studio', 'designer', 'hello@jewelrydesign.com', '+1-555-0105', '654 Design Blvd, Chicago, IL 60601', 'www.jewelrydesign.com', 'Lisa Rodriguez', 'Custom jewelry design services', 'active', 4.8, 'Creative designs, excellent craftsmanship', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    website = EXCLUDED.website,
    contact_person = EXCLUDED.contact_person,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    rating = EXCLUDED.rating,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- =====================================================
-- REFRESH SCHEMA CACHE
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- VERIFY THE DATA
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PARTNERS TABLE FIXED AND SAMPLE DATA ADDED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ Added missing columns to partners table';
    RAISE NOTICE '✅ Inserted 5 sample B2B partners';
    RAISE NOTICE '✅ Partners include suppliers, retailers, and designers';
    RAISE NOTICE '✅ All partners marked as active';
    RAISE NOTICE '✅ Schema cache refreshed';
    RAISE NOTICE '=====================================================';
END $$;
