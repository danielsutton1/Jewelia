-- Create Sample Unread Messages for Testing NewMessageBox Component
-- This script creates sample unread messages to test the dashboard message box

-- First, let's ensure we have the unified messaging tables
-- Check if messages table exists and create sample data

-- Insert sample unread messages for testing
INSERT INTO messages (
    type,
    sender_id,
    recipient_id,
    subject,
    content,
    content_type,
    priority,
    category,
    status,
    is_read,
    created_at
) VALUES 
-- High priority message from partner
(
    'external',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132', -- System user as sender
    'fdb2a122-d6ae-4e78-b277-3317e1a09132', -- Current user as recipient
    'Urgent: New Partnership Opportunity',
    'We have received an exciting partnership proposal from a luxury jewelry distributor in Europe. They are interested in carrying our exclusive diamond collection and are offering excellent terms. Please review the attached proposal and let me know your thoughts by end of week.',
    'text',
    'high',
    'partnership',
    'sent',
    false,
    NOW() - INTERVAL '2 hours'
),

-- Normal priority internal message
(
    'internal',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'Production Update: Custom Ring Order',
    'The custom engagement ring for the Johnson wedding is ready for final inspection. The 2-carat diamond has been set perfectly and the platinum band is polished to perfection. Please schedule a time to review before delivery.',
    'text',
    'normal',
    'production',
    'sent',
    false,
    NOW() - INTERVAL '4 hours'
),

-- System notification
(
    'system',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'Inventory Alert: Low Stock Items',
    'Your inventory system has detected that several popular items are running low on stock. The following items need to be reordered: Diamond Stud Earrings (14k Gold), Pearl Necklace (16 inches), and Sapphire Ring (Size 7).',
    'text',
    'normal',
    'inventory',
    'sent',
    false,
    NOW() - INTERVAL '6 hours'
),

-- Urgent message
(
    'internal',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'URGENT: Client Meeting Rescheduled',
    'The VIP client meeting scheduled for tomorrow at 2 PM has been moved to 4 PM due to their flight delay. Please update your calendar and prepare the presentation materials. This is a high-value potential customer.',
    'text',
    'urgent',
    'meeting',
    'sent',
    false,
    NOW() - INTERVAL '1 hour'
),

-- External partner message
(
    'external',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'fdb2a122-d6ae-4e78-b277-3317e1a09132',
    'New Order Inquiry from Partner',
    'Hello! We have a customer interested in your custom jewelry services. They are looking for a vintage-style emerald necklace with matching earrings. Budget is $15,000-$20,000. Can you provide a quote and timeline?',
    'text',
    'normal',
    'inquiry',
    'sent',
    false,
    NOW() - INTERVAL '30 minutes'
);

-- Verify the messages were created
SELECT 
    id,
    type,
    subject,
    priority,
    category,
    is_read,
    created_at
FROM messages 
WHERE recipient_id = 'fdb2a122-d6ae-4e78-b277-3317e1a09132' 
    AND is_read = false
ORDER BY created_at DESC;
