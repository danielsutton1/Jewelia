-- Add sample orders data for testing

-- First, let's check if we have any customers to reference
SELECT id, name FROM customers LIMIT 5;

-- Add sample orders (using the first customer if available)
INSERT INTO orders (
    order_number,
    customer_id,
    status,
    total_amount,
    tax_amount,
    shipping_amount,
    discount_amount,
    notes,
    expected_delivery_date,
    created_at,
    updated_at
) VALUES 
(
    'O-2025-001',
    (SELECT id FROM customers LIMIT 1),
    'pending',
    2500.00,
    200.00,
    50.00,
    0.00,
    'Diamond engagement ring order',
    NOW() + INTERVAL '7 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),
(
    'O-2025-002',
    (SELECT id FROM customers LIMIT 1),
    'processing',
    1200.00,
    96.00,
    25.00,
    50.00,
    'Luxury watch order',
    NOW() + INTERVAL '5 days',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
),
(
    'O-2025-003',
    (SELECT id FROM customers LIMIT 1),
    'shipped',
    450.00,
    36.00,
    15.00,
    0.00,
    'Pearl necklace order',
    NOW() + INTERVAL '3 days',
    NOW() - INTERVAL '1 day',
    NOW()
),
(
    'O-2025-004',
    (SELECT id FROM customers LIMIT 1),
    'delivered',
    1800.00,
    144.00,
    30.00,
    100.00,
    'Tennis bracelet order',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days'
),
(
    'O-2025-005',
    (SELECT id FROM customers LIMIT 1),
    'cancelled',
    350.00,
    28.00,
    10.00,
    0.00,
    'Sapphire earrings order - cancelled by customer',
    NOW() + INTERVAL '4 days',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '1 day'
);

-- Verify orders were created
SELECT 
    order_number,
    status,
    total_amount,
    created_at
FROM orders
ORDER BY created_at DESC; 