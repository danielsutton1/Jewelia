-- Add Sample Orders for Realistic Analytics
-- This script adds sample orders to make the customer analytics more realistic

-- First, let's see what columns exist in the orders table
SELECT 'Current orders table schema:' as info;
SELECT column_name, is_nullable FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Get some customer IDs to use for orders
SELECT 'Available customers:' as info, COUNT(*) as total_customers FROM customers;

-- Insert sample orders with realistic data
INSERT INTO orders (
    id, 
    order_number, 
    customer_id, 
    status, 
    total_amount, 
    notes, 
    order_date, 
    created_at, 
    updated_at
) VALUES
-- Orders for Sarah Johnson (customer 1)
(gen_random_uuid(), 'ORD-2025-001', (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'completed', 3200.00, 'Premium jewelry order', '2025-06-15', '2025-06-15 10:30:00', '2025-06-15 10:30:00'),
(gen_random_uuid(), 'ORD-2025-002', (SELECT id FROM customers WHERE name = 'Sarah Johnson' LIMIT 1), 'completed', 1800.00, 'Follow-up order', '2025-06-20', '2025-06-20 14:15:00', '2025-06-20 14:15:00'),

-- Orders for Michael Chen (customer 2)
(gen_random_uuid(), 'ORD-2025-003', (SELECT id FROM customers WHERE name = 'Michael Chen' LIMIT 1), 'completed', 4500.00, 'Wedding jewelry set', '2025-06-10', '2025-06-10 09:45:00', '2025-06-10 09:45:00'),
(gen_random_uuid(), 'ORD-2025-004', (SELECT id FROM customers WHERE name = 'Michael Chen' LIMIT 1), 'pending', 2200.00, 'Bridal party gifts', '2025-06-25', '2025-06-25 16:20:00', '2025-06-25 16:20:00'),

-- Orders for Emily Rodriguez (customer 3)
(gen_random_uuid(), 'ORD-2025-005', (SELECT id FROM customers WHERE name = 'Emily Rodriguez' LIMIT 1), 'completed', 1200.00, 'Seasonal collection', '2025-06-12', '2025-06-12 11:30:00', '2025-06-12 11:30:00'),

-- Orders for David Thompson (customer 4)
(gen_random_uuid(), 'ORD-2025-006', (SELECT id FROM customers WHERE name = 'David Thompson' LIMIT 1), 'completed', 8500.00, 'Corporate gift order', '2025-06-08', '2025-06-08 13:45:00', '2025-06-08 13:45:00'),
(gen_random_uuid(), 'ORD-2025-007', (SELECT id FROM customers WHERE name = 'David Thompson' LIMIT 1), 'completed', 3200.00, 'Executive gifts', '2025-06-18', '2025-06-18 15:10:00', '2025-06-18 15:10:00'),

-- Orders for Lisa Anderson (customer 5)
(gen_random_uuid(), 'ORD-2025-008', (SELECT id FROM customers WHERE name = 'Lisa Anderson' LIMIT 1), 'completed', 2800.00, 'Vintage piece', '2025-06-14', '2025-06-14 12:00:00', '2025-06-14 12:00:00'),

-- Orders for James Wilson (customer 6)
(gen_random_uuid(), 'ORD-2025-009', (SELECT id FROM customers WHERE name = 'James Wilson' LIMIT 1), 'completed', 1500.00, 'Event jewelry', '2025-06-16', '2025-06-16 10:15:00', '2025-06-16 10:15:00'),

-- Orders for Amanda Foster (customer 7)
(gen_random_uuid(), 'ORD-2025-010', (SELECT id FROM customers WHERE name = 'Amanda Foster' LIMIT 1), 'completed', 4200.00, 'Bulk online order', '2025-06-11', '2025-06-11 14:30:00', '2025-06-11 14:30:00'),
(gen_random_uuid(), 'ORD-2025-011', (SELECT id FROM customers WHERE name = 'Amanda Foster' LIMIT 1), 'pending', 1800.00, 'Follow-up bulk order', '2025-06-22', '2025-06-22 09:45:00', '2025-06-22 09:45:00'),

-- Orders for Robert Kim (customer 8)
(gen_random_uuid(), 'ORD-2025-012', (SELECT id FROM customers WHERE name = 'Robert Kim' LIMIT 1), 'completed', 3600.00, 'Art gallery piece', '2025-06-13', '2025-06-13 16:20:00', '2025-06-13 16:20:00'),

-- Orders for Jennifer Davis (customer 9)
(gen_random_uuid(), 'ORD-2025-013', (SELECT id FROM customers WHERE name = 'Jennifer Davis' LIMIT 1), 'completed', 2800.00, 'Hotel gift shop', '2025-06-17', '2025-06-17 11:00:00', '2025-06-17 11:00:00'),

-- Orders for Thomas Brown (customer 10)
(gen_random_uuid(), 'ORD-2025-014', (SELECT id FROM customers WHERE name = 'Thomas Brown' LIMIT 1), 'completed', 1900.00, 'Charity auction item', '2025-06-19', '2025-06-19 13:30:00', '2025-06-19 13:30:00');

-- Verify the insertion
SELECT 'Orders inserted successfully!' as info;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as completed_orders FROM orders WHERE status = 'completed';
SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending';

-- Show sample orders with customer names
SELECT 
    o.order_number,
    c.name as customer_name,
    o.total_amount,
    o.status,
    o.order_date
FROM orders o
JOIN customers c ON o.customer_id = c.id
ORDER BY o.order_date DESC
LIMIT 10; 