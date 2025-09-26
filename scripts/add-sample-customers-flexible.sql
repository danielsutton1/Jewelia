-- Add Sample Customers - Flexible Schema Version
-- This script adapts to whatever columns exist in the customers table

-- First, let's see what columns exist
SELECT 'Current schema:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Now insert customers using the correct column names
-- We'll use a flexible approach based on what columns exist

DO $$
DECLARE
    has_name BOOLEAN;
    has_full_name BOOLEAN;
    has_email BOOLEAN;
    has_phone BOOLEAN;
    has_address BOOLEAN;
    has_notes BOOLEAN;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'name'
    ) INTO has_name;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'full_name'
    ) INTO has_full_name;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'email'
    ) INTO has_email;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'phone'
    ) INTO has_phone;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'address'
    ) INTO has_address;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'notes'
    ) INTO has_notes;
    
    -- Insert customers based on available columns
    IF has_full_name THEN
        -- Use full_name column
        INSERT INTO customers (id, full_name, email, phone, address, notes, created_at, updated_at) VALUES
        ('cust_001', 'Sarah Johnson', 'sarah.johnson@emeraldjewels.com', '+1-555-0101', '123 Main Street, New York, NY 10001', 'Premium jewelry store owner, VIP customer', NOW(), NOW()),
        ('cust_002', 'Michael Chen', 'michael.chen@elegantevents.com', '+1-555-0102', '456 Oak Avenue, Los Angeles, CA 90210', 'Wedding planner, frequently orders bridal jewelry', NOW(), NOW()),
        ('cust_003', 'Emily Rodriguez', 'emily@styleboutique.com', '+1-555-0103', '789 Fashion District, Miami, FL 33101', 'Fashion boutique owner, orders seasonal collections', NOW(), NOW()),
        ('cust_004', 'David Thompson', 'david.thompson@techcorp.com', '+1-555-0104', '321 Business Park, San Francisco, CA 94105', 'Corporate client, orders custom jewelry', NOW(), NOW()),
        ('cust_005', 'Lisa Anderson', 'lisa.anderson@email.com', '+1-555-0105', '654 Collector Lane, Boston, MA 02108', 'Individual collector, interested in vintage pieces', NOW(), NOW()),
        ('cust_006', 'James Wilson', 'james@eventpros.com', '+1-555-0106', '987 Event Center, Las Vegas, NV 89101', 'Event coordinator, orders jewelry for events', NOW(), NOW()),
        ('cust_007', 'Amanda Foster', 'amanda@jewelryonline.com', '+1-555-0107', '147 E-commerce Blvd, Seattle, WA 98101', 'Online jewelry retailer, bulk orders', NOW(), NOW()),
        ('cust_008', 'Robert Kim', 'robert@artgallery.com', '+1-555-0108', '258 Art District, Chicago, IL 60601', 'Art gallery owner, orders unique pieces', NOW(), NOW()),
        ('cust_009', 'Jennifer Davis', 'jennifer@luxuryhotels.com', '+1-555-0109', '369 Hospitality Way, Orlando, FL 32801', 'Hotel chain buyer, orders for gift shops', NOW(), NOW()),
        ('cust_010', 'Thomas Brown', 'thomas@charityfoundation.org', '+1-555-0110', '741 Charity Plaza, Washington, DC 20001', 'Charity organization, orders for auctions', NOW(), NOW());
        
        RAISE NOTICE 'Inserted 10 customers using full_name column';
        
    ELSIF has_name THEN
        -- Use name column instead
        INSERT INTO customers (id, name, email, phone, address, notes, created_at, updated_at) VALUES
        ('cust_001', 'Sarah Johnson', 'sarah.johnson@emeraldjewels.com', '+1-555-0101', '123 Main Street, New York, NY 10001', 'Premium jewelry store owner, VIP customer', NOW(), NOW()),
        ('cust_002', 'Michael Chen', 'michael.chen@elegantevents.com', '+1-555-0102', '456 Oak Avenue, Los Angeles, CA 90210', 'Wedding planner, frequently orders bridal jewelry', NOW(), NOW()),
        ('cust_003', 'Emily Rodriguez', 'emily@styleboutique.com', '+1-555-0103', '789 Fashion District, Miami, FL 33101', 'Fashion boutique owner, orders seasonal collections', NOW(), NOW()),
        ('cust_004', 'David Thompson', 'david.thompson@techcorp.com', '+1-555-0104', '321 Business Park, San Francisco, CA 94105', 'Corporate client, orders custom jewelry', NOW(), NOW()),
        ('cust_005', 'Lisa Anderson', 'lisa.anderson@email.com', '+1-555-0105', '654 Collector Lane, Boston, MA 02108', 'Individual collector, interested in vintage pieces', NOW(), NOW()),
        ('cust_006', 'James Wilson', 'james@eventpros.com', '+1-555-0106', '987 Event Center, Las Vegas, NV 89101', 'Event coordinator, orders jewelry for events', NOW(), NOW()),
        ('cust_007', 'Amanda Foster', 'amanda@jewelryonline.com', '+1-555-0107', '147 E-commerce Blvd, Seattle, WA 98101', 'Online jewelry retailer, bulk orders', NOW(), NOW()),
        ('cust_008', 'Robert Kim', 'robert@artgallery.com', '+1-555-0108', '258 Art District, Chicago, IL 60601', 'Art gallery owner, orders unique pieces', NOW(), NOW()),
        ('cust_009', 'Jennifer Davis', 'jennifer@luxuryhotels.com', '+1-555-0109', '369 Hospitality Way, Orlando, FL 32801', 'Hotel chain buyer, orders for gift shops', NOW(), NOW()),
        ('cust_010', 'Thomas Brown', 'thomas@charityfoundation.org', '+1-555-0110', '741 Charity Plaza, Washington, DC 20001', 'Charity organization, orders for auctions', NOW(), NOW());
        
        RAISE NOTICE 'Inserted 10 customers using name column';
        
    ELSE
        -- Minimal insert with just id and basic fields
        INSERT INTO customers (id, email, created_at, updated_at) VALUES
        ('cust_001', 'sarah.johnson@emeraldjewels.com', NOW(), NOW()),
        ('cust_002', 'michael.chen@elegantevents.com', NOW(), NOW()),
        ('cust_003', 'emily@styleboutique.com', NOW(), NOW()),
        ('cust_004', 'david.thompson@techcorp.com', NOW(), NOW()),
        ('cust_005', 'lisa.anderson@email.com', NOW(), NOW()),
        ('cust_006', 'james@eventpros.com', NOW(), NOW()),
        ('cust_007', 'amanda@jewelryonline.com', NOW(), NOW()),
        ('cust_008', 'robert@artgallery.com', NOW(), NOW()),
        ('cust_009', 'jennifer@luxuryhotels.com', NOW(), NOW()),
        ('cust_010', 'thomas@charityfoundation.org', NOW(), NOW());
        
        RAISE NOTICE 'Inserted 10 customers with minimal fields';
    END IF;
END $$;

-- Verify the insertion
SELECT COUNT(*) as total_customers FROM customers;
SELECT id, 
       COALESCE(full_name, name, 'Unknown') as customer_name,
       email, 
       phone, 
       address, 
       notes 
FROM customers 
ORDER BY created_at; 