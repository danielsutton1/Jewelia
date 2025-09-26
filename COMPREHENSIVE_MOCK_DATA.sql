-- Comprehensive Mock Data for Jewelia CRM
-- 20 orders with realistic data flowing through sales → production → logistics pipeline

-- First, let's ensure we have the customer
INSERT INTO customers (name, email, phone, company, status, customer_type, created_at) 
VALUES 
('Sarah Johnson', 'sarah.johnson@email.com', '555-0101', 'Johnson & Associates', 'active', 'wholesale', NOW() - INTERVAL '60 days')
ON CONFLICT (email) DO NOTHING;

-- Get the customer ID
DO $$
DECLARE
    customer_id UUID;
BEGIN
    SELECT id INTO customer_id FROM customers WHERE email = 'sarah.johnson@email.com' LIMIT 1;
    
    -- Create 20 comprehensive orders with realistic progression through the pipeline
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
    -- SALES PIPELINE ORDERS (5 orders)
    -- 1. Initial Contact - Log Call
    (
        'O-2025-001',
        customer_id,
        'pending',
        3500.00,
        280.00,
        50.00,
        0.00,
        'Initial contact made - customer interested in custom engagement ring. Logged call for follow-up.',
        NOW() + INTERVAL '45 days',
        NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '30 days'
    ),
    -- 2. Design Status - In Progress
    (
        'O-2025-002',
        customer_id,
        'designing',
        2800.00,
        224.00,
        40.00,
        100.00,
        'Design phase - customer approved initial sketches. CAD work in progress.',
        NOW() + INTERVAL '40 days',
        NOW() - INTERVAL '28 days',
        NOW() - INTERVAL '25 days'
    ),
    -- 3. Quote Sent - Awaiting Response
    (
        'O-2025-003',
        customer_id,
        'quoted',
        4200.00,
        336.00,
        60.00,
        0.00,
        'Quote sent to customer for anniversary ring. Awaiting client response.',
        NOW() + INTERVAL '35 days',
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '22 days'
    ),
    -- 4. Client Response - Negotiating
    (
        'O-2025-004',
        customer_id,
        'negotiating',
        3800.00,
        304.00,
        55.00,
        200.00,
        'Client responded with counter-offer. Negotiating final terms and pricing.',
        NOW() + INTERVAL '32 days',
        NOW() - INTERVAL '22 days',
        NOW() - INTERVAL '20 days'
    ),
    -- 5. Approved/Order Created - Ready for Production
    (
        'O-2025-005',
        customer_id,
        'approved',
        3600.00,
        288.00,
        50.00,
        150.00,
        'Order approved and created. Moving to production phase.',
        NOW() + INTERVAL '30 days',
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '18 days'
    ),
    
    -- PRODUCTION PIPELINE ORDERS (10 orders)
    -- 6. Design Phase
    (
        'O-2025-006',
        customer_id,
        'designing',
        2900.00,
        232.00,
        45.00,
        0.00,
        'Production: Design phase - creating detailed CAD models',
        NOW() + INTERVAL '28 days',
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '15 days'
    ),
    -- 7. CAD Phase
    (
        'O-2025-007',
        customer_id,
        'cad_work',
        3200.00,
        256.00,
        50.00,
        100.00,
        'Production: CAD phase - 3D modeling and technical drawings complete',
        NOW() + INTERVAL '25 days',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '12 days'
    ),
    -- 8. Casting Phase
    (
        'O-2025-008',
        customer_id,
        'casting',
        4100.00,
        328.00,
        60.00,
        0.00,
        'Production: Casting phase - metal casting in progress',
        NOW() + INTERVAL '22 days',
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '10 days'
    ),
    -- 9. Setting Phase
    (
        'O-2025-009',
        customer_id,
        'setting',
        3800.00,
        304.00,
        55.00,
        150.00,
        'Production: Setting phase - stone setting in progress',
        NOW() + INTERVAL '20 days',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '8 days'
    ),
    -- 10. Polishing Phase
    (
        'O-2025-010',
        customer_id,
        'polishing',
        3500.00,
        280.00,
        50.00,
        100.00,
        'Production: Polishing phase - final finishing and polishing',
        NOW() + INTERVAL '18 days',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '6 days'
    ),
    -- 11. Quality Control
    (
        'O-2025-011',
        customer_id,
        'quality_check',
        4200.00,
        336.00,
        60.00,
        0.00,
        'Production: Quality control - final inspection and testing',
        NOW() + INTERVAL '15 days',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '4 days'
    ),
    -- 12. Production Complete
    (
        'O-2025-012',
        customer_id,
        'production_complete',
        3900.00,
        312.00,
        55.00,
        200.00,
        'Production: Complete - ready for logistics and shipping',
        NOW() + INTERVAL '12 days',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '2 days'
    ),
    -- 13. Pack & Ship
    (
        'O-2025-013',
        customer_id,
        'packaging',
        3600.00,
        288.00,
        50.00,
        150.00,
        'Logistics: Packaging and preparing for shipment',
        NOW() + INTERVAL '10 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day'
    ),
    -- 14. Shipped
    (
        'O-2025-014',
        customer_id,
        'shipped',
        3800.00,
        304.00,
        55.00,
        100.00,
        'Logistics: Shipped - tracking number provided to customer',
        NOW() + INTERVAL '8 days',
        NOW() - INTERVAL '1 day',
        NOW()
    ),
    -- 15. In Transit
    (
        'O-2025-015',
        customer_id,
        'in_transit',
        4100.00,
        328.00,
        60.00,
        0.00,
        'Logistics: In transit - expected delivery in 3-5 business days',
        NOW() + INTERVAL '5 days',
        NOW(),
        NOW()
    ),
    
    -- LOGISTICS PIPELINE ORDERS (5 orders)
    -- 16. Out for Delivery
    (
        'O-2025-016',
        customer_id,
        'out_for_delivery',
        3500.00,
        280.00,
        50.00,
        100.00,
        'Logistics: Out for delivery - scheduled for today',
        NOW() + INTERVAL '2 days',
        NOW(),
        NOW()
    ),
    -- 17. Delivered
    (
        'O-2025-017',
        customer_id,
        'delivered',
        4200.00,
        336.00,
        60.00,
        0.00,
        'Logistics: Delivered successfully - customer confirmed receipt',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day'
    ),
    -- 18. Pickup Available
    (
        'O-2025-018',
        customer_id,
        'pickup_ready',
        3800.00,
        304.00,
        0.00,
        150.00,
        'Logistics: Ready for pickup at downtown location',
        NOW() + INTERVAL '1 day',
        NOW() - INTERVAL '3 days',
        NOW()
    ),
    -- 19. Completed
    (
        'O-2025-019',
        customer_id,
        'completed',
        3600.00,
        288.00,
        50.00,
        100.00,
        'Completed: Order fulfilled successfully - customer satisfied',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '3 days'
    ),
    -- 20. Follow-up
    (
        'O-2025-020',
        customer_id,
        'follow_up',
        3900.00,
        312.00,
        55.00,
        0.00,
        'Follow-up: Post-delivery customer satisfaction survey sent',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '5 days'
    );

    RAISE NOTICE '✅ Created 20 comprehensive orders for customer %', customer_id;
END $$;

-- Create order_items for each order
DO $$
DECLARE
    order_record RECORD;
    product_id UUID;
BEGIN
    -- Get a product ID
    SELECT id INTO product_id FROM products LIMIT 1;
    
    -- Create order items for each order
    FOR order_record IN SELECT id, order_number FROM orders ORDER BY created_at
    LOOP
        INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            created_at
        ) VALUES (
            order_record.id,
            product_id,
            1,
            CASE 
                WHEN order_record.order_number LIKE 'O-2025-001%' THEN 3500.00
                WHEN order_record.order_number LIKE 'O-2025-002%' THEN 2800.00
                WHEN order_record.order_number LIKE 'O-2025-003%' THEN 4200.00
                WHEN order_record.order_number LIKE 'O-2025-004%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-005%' THEN 3600.00
                WHEN order_record.order_number LIKE 'O-2025-006%' THEN 2900.00
                WHEN order_record.order_number LIKE 'O-2025-007%' THEN 3200.00
                WHEN order_record.order_number LIKE 'O-2025-008%' THEN 4100.00
                WHEN order_record.order_number LIKE 'O-2025-009%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-010%' THEN 3500.00
                WHEN order_record.order_number LIKE 'O-2025-011%' THEN 4200.00
                WHEN order_record.order_number LIKE 'O-2025-012%' THEN 3900.00
                WHEN order_record.order_number LIKE 'O-2025-013%' THEN 3600.00
                WHEN order_record.order_number LIKE 'O-2025-014%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-015%' THEN 4100.00
                WHEN order_record.order_number LIKE 'O-2025-016%' THEN 3500.00
                WHEN order_record.order_number LIKE 'O-2025-017%' THEN 4200.00
                WHEN order_record.order_number LIKE 'O-2025-018%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-019%' THEN 3600.00
                WHEN order_record.order_number LIKE 'O-2025-020%' THEN 3900.00
                ELSE 3500.00
            END,
            CASE 
                WHEN order_record.order_number LIKE 'O-2025-001%' THEN 3500.00
                WHEN order_record.order_number LIKE 'O-2025-002%' THEN 2800.00
                WHEN order_record.order_number LIKE 'O-2025-003%' THEN 4200.00
                WHEN order_record.order_number LIKE 'O-2025-004%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-005%' THEN 3600.00
                WHEN order_record.order_number LIKE 'O-2025-006%' THEN 2900.00
                WHEN order_record.order_number LIKE 'O-2025-007%' THEN 3200.00
                WHEN order_record.order_number LIKE 'O-2025-008%' THEN 4100.00
                WHEN order_record.order_number LIKE 'O-2025-009%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-010%' THEN 3500.00
                WHEN order_record.order_number LIKE 'O-2025-011%' THEN 4200.00
                WHEN order_record.order_number LIKE 'O-2025-012%' THEN 3900.00
                WHEN order_record.order_number LIKE 'O-2025-013%' THEN 3600.00
                WHEN order_record.order_number LIKE 'O-2025-014%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-015%' THEN 4100.00
                WHEN order_record.order_number LIKE 'O-2025-016%' THEN 3500.00
                WHEN order_record.order_number LIKE 'O-2025-017%' THEN 4200.00
                WHEN order_record.order_number LIKE 'O-2025-018%' THEN 3800.00
                WHEN order_record.order_number LIKE 'O-2025-019%' THEN 3600.00
                WHEN order_record.order_number LIKE 'O-2025-020%' THEN 3900.00
                ELSE 3500.00
            END,
            NOW()
        );
    END LOOP;
    
    RAISE NOTICE '✅ Created order items for all 20 orders';
END $$;

-- Verify the data
SELECT 
    order_number,
    status,
    total_amount,
    created_at,
    expected_delivery_date
FROM orders 
ORDER BY created_at;

-- Show order count by status
SELECT 
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_value
FROM orders 
GROUP BY status 
ORDER BY order_count DESC; 