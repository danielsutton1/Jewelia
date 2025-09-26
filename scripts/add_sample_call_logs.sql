-- Add sample call log data
INSERT INTO call_logs (
    customer_name,
    staff_name,
    call_type,
    duration,
    outcome,
    notes,
    summary,
    status,
    created_at
) VALUES 
(
    'John Smith',
    'Sarah Johnson',
    'Inbound',
    '15 minutes',
    'Resolved',
    'Customer called about order #12345 status. Order is ready for pickup.',
    'Order status inquiry - resolved',
    'completed',
    NOW() - INTERVAL '2 days'
),
(
    'Emily Davis',
    'Mike Wilson',
    'Outbound',
    '8 minutes',
    'follow-up-needed',
    'Called to follow up on repair estimate. Customer needs to review and call back.',
    'Repair estimate follow-up - pending customer response',
    'pending',
    NOW() - INTERVAL '1 day'
),
(
    'Robert Brown',
    'Lisa Chen',
    'Inbound',
    '22 minutes',
    'Resolved',
    'Customer had questions about warranty coverage. Explained policy and provided documentation.',
    'Warranty inquiry - fully resolved with documentation provided',
    'completed',
    NOW() - INTERVAL '6 hours'
),
(
    'Jennifer Garcia',
    'David Thompson',
    'Outbound',
    '12 minutes',
    'No answer',
    'Attempted to call about appointment reminder. Left voicemail.',
    'Appointment reminder - left voicemail',
    'missed',
    NOW() - INTERVAL '3 hours'
),
(
    'Michael Lee',
    'Amanda Rodriguez',
    'Inbound',
    '18 minutes',
    'Resolved',
    'Customer called about pricing for custom jewelry. Provided quote and scheduled consultation.',
    'Custom jewelry inquiry - quote provided, consultation scheduled',
    'completed',
    NOW() - INTERVAL '1 hour'
),
(
    'Jessica White',
    'Kevin Martinez',
    'Inbound',
    '5 minutes',
    'follow-up-needed',
    'Quick call about payment method. Need to call back with payment options.',
    'Payment method inquiry - need to follow up with options',
    'pending',
    NOW() - INTERVAL '30 minutes'
);

-- Update the created_at timestamps to be more realistic
UPDATE call_logs 
SET created_at = created_at + (random() * INTERVAL '7 days')
WHERE id IN (SELECT id FROM call_logs LIMIT 6); 