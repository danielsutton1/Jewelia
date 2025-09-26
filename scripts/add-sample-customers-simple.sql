-- Add Sample Customers - Simple Version
-- This script only uses basic columns that should exist in any customers table

-- First, let's see what columns exist
SELECT 'Current schema:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Insert customers with minimal required fields
INSERT INTO customers (id, email, created_at, updated_at) VALUES
(gen_random_uuid(), 'sarah.johnson@emeraldjewels.com', NOW(), NOW()),
(gen_random_uuid(), 'michael.chen@elegantevents.com', NOW(), NOW()),
(gen_random_uuid(), 'emily@styleboutique.com', NOW(), NOW()),
(gen_random_uuid(), 'david.thompson@techcorp.com', NOW(), NOW()),
(gen_random_uuid(), 'lisa.anderson@email.com', NOW(), NOW()),
(gen_random_uuid(), 'james@eventpros.com', NOW(), NOW()),
(gen_random_uuid(), 'amanda@jewelryonline.com', NOW(), NOW()),
(gen_random_uuid(), 'robert@artgallery.com', NOW(), NOW()),
(gen_random_uuid(), 'jennifer@luxuryhotels.com', NOW(), NOW()),
(gen_random_uuid(), 'thomas@charityfoundation.org', NOW(), NOW());

-- Verify the insertion
SELECT COUNT(*) as total_customers FROM customers;
SELECT id, email, created_at FROM customers ORDER BY created_at; 