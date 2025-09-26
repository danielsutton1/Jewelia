-- Add RLS policies to communication_threads
ALTER TABLE communication_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view threads they participate in"
    ON communication_threads FOR SELECT
    TO authenticated
    USING (
        partner_id IN (
            SELECT partner_id FROM partner_relationships 
            WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
            AND status = 'active'
        ) OR
        assigned_to = auth.uid() OR
        related_order_id IN (
            SELECT id FROM orders WHERE customer_id IN (
                SELECT id FROM customers WHERE created_by = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create threads with partners they have relationships with"
    ON communication_threads FOR INSERT
    TO authenticated
    WITH CHECK (
        partner_id IN (
            SELECT partner_id FROM partner_relationships 
            WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
            AND status = 'active'
        ) OR
        assigned_to = auth.uid()
    );

CREATE POLICY "Users can update threads they are assigned to"
    ON communication_threads FOR UPDATE
    TO authenticated
    USING (assigned_to = auth.uid())
    WITH CHECK (assigned_to = auth.uid());

-- Add RLS policies to communication_messages
ALTER TABLE communication_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in threads they participate in"
    ON communication_messages FOR SELECT
    TO authenticated
    USING (
        thread_id IN (
            SELECT id FROM communication_threads 
            WHERE partner_id IN (
                SELECT partner_id FROM partner_relationships 
                WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
                AND status = 'active'
            ) OR
            assigned_to = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to threads they participate in"
    ON communication_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        thread_id IN (
            SELECT id FROM communication_threads 
            WHERE partner_id IN (
                SELECT partner_id FROM partner_relationships 
                WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
                AND status = 'active'
            ) OR
            assigned_to = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages"
    ON communication_messages FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Add RLS policies to communication_attachments
ALTER TABLE communication_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for messages they can access"
    ON communication_attachments FOR SELECT
    TO authenticated
    USING (
        message_id IN (
            SELECT id FROM communication_messages 
            WHERE thread_id IN (
                SELECT id FROM communication_threads 
                WHERE partner_id IN (
                    SELECT partner_id FROM partner_relationships 
                    WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
                    AND status = 'active'
                ) OR
                assigned_to = auth.uid()
            )
        )
    );

CREATE POLICY "Users can upload attachments for their messages"
    ON communication_attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        message_id IN (
            SELECT id FROM communication_messages 
            WHERE sender_id = auth.uid()
        )
    );

-- Add RLS policies to notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences"
    ON notification_preferences FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid()); 