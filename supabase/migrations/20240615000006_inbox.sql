-- Inbox/messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES organizations(id),
    sender_id UUID REFERENCES users(id) NOT NULL,
    recipient_id UUID REFERENCES users(id), -- null = org-wide or broadcast
    subject VARCHAR(200),
    body TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_org_id ON messages(org_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(read);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_messages_updated_at();

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies: allow sender, recipient, or org admin to view/update/delete
CREATE POLICY "Messages are viewable by sender, recipient, or org admin"
    ON messages FOR SELECT
    TO authenticated
    USING (
        sender_id = auth.uid() OR recipient_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = messages.org_id AND om.role = 'admin'
            )
        )
    );

CREATE POLICY "Messages are insertable by sender"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid()
    );

CREATE POLICY "Messages are updatable by sender, recipient, or org admin"
    ON messages FOR UPDATE
    TO authenticated
    USING (
        sender_id = auth.uid() OR recipient_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = messages.org_id AND om.role = 'admin'
            )
        )
    )
    WITH CHECK (
        sender_id = auth.uid() OR recipient_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = messages.org_id AND om.role = 'admin'
            )
        )
    );

CREATE POLICY "Messages are deletable by sender, recipient, or org admin"
    ON messages FOR DELETE
    TO authenticated
    USING (
        sender_id = auth.uid() OR recipient_id = auth.uid() OR (
            org_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.user_id = auth.uid() AND om.org_id = messages.org_id AND om.role = 'admin'
            )
        )
    ); 