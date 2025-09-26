-- Create partner_messages table for external network messaging
CREATE TABLE partner_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_partner_messages_partner_id ON partner_messages(partner_id);
CREATE INDEX idx_partner_messages_sender_id ON partner_messages(sender_id);
CREATE INDEX idx_partner_messages_recipient_id ON partner_messages(recipient_id);
CREATE INDEX idx_partner_messages_created_at ON partner_messages(created_at);
CREATE INDEX idx_partner_messages_is_read ON partner_messages(is_read);

-- Create trigger for updated_at
CREATE TRIGGER update_partner_messages_updated_at
    BEFORE UPDATE ON partner_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE partner_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_messages
CREATE POLICY "Users can view messages they sent or received"
    ON partner_messages FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() OR 
        recipient_id = auth.uid() OR
        partner_id IN (
            SELECT partner_id FROM partner_relationships 
            WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
            AND status = 'active'
        )
    );

CREATE POLICY "Users can insert messages to partners they have relationships with"
    ON partner_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        partner_id IN (
            SELECT partner_id FROM partner_relationships 
            WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
            AND status = 'active'
        )
    );

CREATE POLICY "Users can update messages they sent"
    ON partner_messages FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- Create partner_message_attachments table
CREATE TABLE partner_message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES partner_messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for attachments
CREATE INDEX idx_partner_message_attachments_message_id ON partner_message_attachments(message_id);

-- Enable RLS for attachments
ALTER TABLE partner_message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments (inherit from parent message)
CREATE POLICY "Users can view attachments for messages they can access"
    ON partner_message_attachments FOR SELECT
    TO authenticated
    USING (
        message_id IN (
            SELECT id FROM partner_messages 
            WHERE sender_id = auth.uid() OR 
                  recipient_id = auth.uid() OR
                  partner_id IN (
                      SELECT partner_id FROM partner_relationships 
                      WHERE (partner_a = auth.uid() OR partner_b = auth.uid()) 
                      AND status = 'active'
                  )
        )
    );

CREATE POLICY "Users can insert attachments for their messages"
    ON partner_message_attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        message_id IN (
            SELECT id FROM partner_messages 
            WHERE sender_id = auth.uid()
        )
    ); 