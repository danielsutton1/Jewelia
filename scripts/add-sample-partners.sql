-- =====================================================
-- ADD SAMPLE PARTNERS FOR MESSAGING SYSTEM
-- =====================================================

-- Insert sample B2B partners
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

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SAMPLE PARTNERS ADDED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ 5 B2B partners added to database';
    RAISE NOTICE '✅ Partners include suppliers, retailers, and designers';
    RAISE NOTICE '✅ All partners marked as active';
    RAISE NOTICE '✅ Schema cache refreshed';
    RAISE NOTICE '=====================================================';
END $$;
