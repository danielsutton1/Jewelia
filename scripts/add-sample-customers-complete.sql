-- Add Sample Customers - Complete Version
-- This script includes all required fields based on the actual schema

-- First, let's see what columns exist
SELECT 'Current schema:' as info;
SELECT column_name, is_nullable FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Insert customers with all required fields
INSERT INTO customers (
    id, 
    name, 
    email, 
    phone, 
    address, 
    notes, 
    country, 
    status, 
    customer_type, 
    created_at, 
    updated_at
) VALUES
(gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@emeraldjewels.com', '+1-555-0101', '123 Main Street, New York, NY 10001', 'Premium jewelry store owner, VIP customer', 'USA', 'active', 'retail', NOW(), NOW()),
(gen_random_uuid(), 'Michael Chen', 'michael.chen@elegantevents.com', '+1-555-0102', '456 Oak Avenue, Los Angeles, CA 90210', 'Wedding planner, frequently orders bridal jewelry', 'USA', 'active', 'retail', NOW(), NOW()),
(gen_random_uuid(), 'Emily Rodriguez', 'emily@styleboutique.com', '+1-555-0103', '789 Fashion District, Miami, FL 33101', 'Fashion boutique owner, orders seasonal collections', 'USA', 'active', 'retail', NOW(), NOW()),
(gen_random_uuid(), 'David Thompson', 'david.thompson@techcorp.com', '+1-555-0104', '321 Business Park, San Francisco, CA 94105', 'Corporate client, orders custom jewelry', 'USA', 'active', 'corporate', NOW(), NOW()),
(gen_random_uuid(), 'Lisa Anderson', 'lisa.anderson@email.com', '+1-555-0105', '654 Collector Lane, Boston, MA 02108', 'Individual collector, interested in vintage pieces', 'USA', 'active', 'individual', NOW(), NOW()),
(gen_random_uuid(), 'James Wilson', 'james@eventpros.com', '+1-555-0106', '987 Event Center, Las Vegas, NV 89101', 'Event coordinator, orders jewelry for events', 'USA', 'active', 'retail', NOW(), NOW()),
(gen_random_uuid(), 'Amanda Foster', 'amanda@jewelryonline.com', '+1-555-0107', '147 E-commerce Blvd, Seattle, WA 98101', 'Online jewelry retailer, bulk orders', 'USA', 'active', 'retail', NOW(), NOW()),
(gen_random_uuid(), 'Robert Kim', 'robert@artgallery.com', '+1-555-0108', '258 Art District, Chicago, IL 60601', 'Art gallery owner, orders unique pieces', 'USA', 'active', 'retail', NOW(), NOW()),
(gen_random_uuid(), 'Jennifer Davis', 'jennifer@luxuryhotels.com', '+1-555-0109', '369 Hospitality Way, Orlando, FL 32801', 'Hotel chain buyer, orders for gift shops', 'USA', 'active', 'corporate', NOW(), NOW()),
(gen_random_uuid(), 'Thomas Brown', 'thomas@charityfoundation.org', '+1-555-0110', '741 Charity Plaza, Washington, DC 20001', 'Charity organization, orders for auctions', 'USA', 'active', 'corporate', NOW(), NOW());

-- Verify the insertion
SELECT 'Insertion complete!' as info;
SELECT COUNT(*) as total_customers FROM customers;

-- Show sample data
SELECT 'Sample customers:' as info;
SELECT 
    id, 
    name, 
    email, 
    phone, 
    address, 
    customer_type,
    status,
    created_at
FROM customers 
ORDER BY created_at DESC 
LIMIT 5; 