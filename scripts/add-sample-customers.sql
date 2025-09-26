-- Add Sample Customers to Supabase Database
-- This script adds 10 realistic customer records for testing

-- Clear existing customers (optional - comment out if you want to keep existing data)
-- DELETE FROM customers;

-- Insert 10 sample customers
INSERT INTO customers (id, full_name, email, phone, address, notes, created_at, updated_at) VALUES
-- Customer 1: Jewelry Store Owner
('cust_001', 'Sarah Johnson', 'sarah.johnson@emeraldjewels.com', '+1-555-0101', '123 Main Street, New York, NY 10001', 'Premium jewelry store owner, VIP customer, prefers platinum pieces', NOW(), NOW()),

-- Customer 2: Wedding Planner
('cust_002', 'Michael Chen', 'michael.chen@elegantevents.com', '+1-555-0102', '456 Oak Avenue, Los Angeles, CA 90210', 'Wedding planner, frequently orders bridal jewelry sets', NOW(), NOW()),

-- Customer 3: Fashion Designer
('cust_003', 'Emma Rodriguez', 'emma.rodriguez@couture.com', '+1-555-0103', '789 Fashion Blvd, Miami, FL 33101', 'Fashion designer, interested in custom jewelry pieces', NOW(), NOW()),

-- Customer 4: Real Estate Agent
('cust_004', 'David Thompson', 'david.thompson@luxuryhomes.com', '+1-555-0104', '321 Luxury Lane, Beverly Hills, CA 90212', 'High-end real estate agent, collects vintage jewelry', NOW(), NOW()),

-- Customer 5: Tech Executive
('cust_005', 'Lisa Park', 'lisa.park@techcorp.com', '+1-555-0105', '654 Innovation Drive, San Francisco, CA 94105', 'Tech executive, prefers modern, minimalist jewelry designs', NOW(), NOW()),

-- Customer 6: Art Gallery Owner
('cust_006', 'Robert Williams', 'robert.williams@artgallery.com', '+1-555-0106', '987 Art District, Chicago, IL 60601', 'Art gallery owner, interested in unique, artistic jewelry pieces', NOW(), NOW()),

-- Customer 7: Restaurant Owner
('cust_007', 'Maria Garcia', 'maria.garcia@finecuisine.com', '+1-555-0107', '147 Gourmet Street, New Orleans, LA 70130', 'Restaurant owner, collects traditional jewelry from different cultures', NOW(), NOW()),

-- Customer 8: Investment Banker
('cust_008', 'James Wilson', 'james.wilson@investments.com', '+1-555-0108', '258 Wall Street, New York, NY 10005', 'Investment banker, prefers high-value investment pieces', NOW(), NOW()),

-- Customer 9: Interior Designer
('cust_009', 'Amanda Foster', 'amanda.foster@interiors.com', '+1-555-0109', '369 Design Way, Austin, TX 78701', 'Interior designer, interested in jewelry that complements home decor', NOW(), NOW()),

-- Customer 10: Medical Professional
('cust_010', 'Dr. Christopher Lee', 'dr.lee@medicalcenter.com', '+1-555-0110', '741 Health Plaza, Boston, MA 02108', 'Medical professional, prefers hypoallergenic jewelry materials', NOW(), NOW());

-- Verify the data was inserted
SELECT 
    id,
    full_name,
    email,
    phone,
    address,
    notes,
    created_at
FROM customers 
ORDER BY created_at DESC; 