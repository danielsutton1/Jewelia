-- Add sample communications data for testing
INSERT INTO communications (
    type,
    subject,
    content,
    sender_id,
    recipient_id,
    priority,
    status,
    category,
    created_at
) VALUES 
(
    'internal',
    'Welcome to the CRM System',
    'Welcome to our new CRM system! This is your first internal communication.',
    NULL,
    NULL,
    'normal',
    'read',
    'general',
    NOW() - INTERVAL '2 days'
),
(
    'notification',
    'New Order Received',
    'A new order has been received and requires your attention.',
    NULL,
    NULL,
    'high',
    'unread',
    'orders',
    NOW() - INTERVAL '1 day'
),
(
    'task',
    'Follow up with Customer',
    'Please follow up with customer regarding their recent inquiry.',
    NULL,
    NULL,
    'normal',
    'unread',
    'customer-service',
    NOW() - INTERVAL '6 hours'
),
(
    'external',
    'Quote Request',
    'Customer has requested a quote for custom jewelry piece.',
    NULL,
    NULL,
    'high',
    'unread',
    'sales',
    NOW() - INTERVAL '3 hours'
),
(
    'internal',
    'Inventory Update',
    'Monthly inventory count has been completed. All items accounted for.',
    NULL,
    NULL,
    'normal',
    'read',
    'inventory',
    NOW() - INTERVAL '1 hour'
);

-- Verify the data was inserted
SELECT 
    id,
    type,
    subject,
    priority,
    status,
    category,
    created_at
FROM communications 
ORDER BY created_at DESC; 