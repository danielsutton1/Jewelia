-- Create enum types for communication status and priority
CREATE TYPE communication_status AS ENUM ('active', 'resolved', 'pending', 'closed');
CREATE TYPE communication_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE communication_type AS ENUM ('message', 'email', 'call', 'meeting', 'document', 'task', 'issue');

-- Create communication threads table
CREATE TABLE communication_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    subject TEXT NOT NULL,
    type communication_type NOT NULL,
    status communication_status NOT NULL DEFAULT 'active',
    priority communication_priority NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    related_order_id UUID REFERENCES orders(id),
    related_issue_id UUID REFERENCES issues(id),
    assigned_to UUID REFERENCES users(id),
    tags TEXT[] DEFAULT '{}'::text[]
);

-- Create communication messages table
CREATE TABLE communication_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES communication_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create communication attachments table
CREATE TABLE communication_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES communication_messages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type communication_type NOT NULL,
    email BOOLEAN DEFAULT true,
    push BOOLEAN DEFAULT true,
    sms BOOLEAN DEFAULT false,
    in_app BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, type)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_communication_threads_updated_at
    BEFORE UPDATE ON communication_threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop trigger if it exists to avoid duplicate errors
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_preferences_updated_at'
    ) THEN
        EXECUTE 'DROP TRIGGER update_notification_preferences_updated_at ON notification_preferences';
    END IF;
END $$;

CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE communication_threads
    SET last_message_at = NEW.timestamp
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for last_message_at
CREATE TRIGGER update_thread_last_message_at
    AFTER INSERT ON communication_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_last_message_at();

-- Create indexes
CREATE INDEX idx_communication_threads_partner_id ON communication_threads(partner_id);
CREATE INDEX idx_communication_threads_related_order_id ON communication_threads(related_order_id);
CREATE INDEX idx_communication_threads_assigned_to ON communication_threads(assigned_to);
CREATE INDEX idx_communication_messages_thread_id ON communication_messages(thread_id);
CREATE INDEX idx_communication_messages_sender_id ON communication_messages(sender_id);
CREATE INDEX idx_communication_attachments_message_id ON communication_attachments(message_id);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id); 