-- =====================================================
-- UNIFIED MESSAGING SYSTEM
-- =====================================================

-- Create enums for message types, status, and priority
CREATE TYPE message_type AS ENUM ('internal', 'external', 'system', 'notification');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');
CREATE TYPE message_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- =====================================================
-- MESSAGES TABLE
-- =====================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type message_type NOT NULL DEFAULT 'internal',
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'markdown')),
  priority message_priority NOT NULL DEFAULT 'normal',
  category TEXT NOT NULL DEFAULT 'general',
  status message_status NOT NULL DEFAULT 'sent',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  reply_to_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  related_order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- MESSAGE THREADS TABLE
-- =====================================================

CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type message_type NOT NULL DEFAULT 'internal',
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participants UUID[] NOT NULL DEFAULT '{}',
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  related_order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  related_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- MESSAGE ATTACHMENTS TABLE
-- =====================================================

CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  mime_type TEXT,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- MESSAGE REACTIONS TABLE
-- =====================================================

CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  reaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction_type)
);

-- =====================================================
-- MESSAGE READ RECEIPTS TABLE
-- =====================================================

CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_method TEXT NOT NULL DEFAULT 'app',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- =====================================================
-- MESSAGE NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE message_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'message',
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_sent BOOLEAN NOT NULL DEFAULT false,
  is_delivered BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  push_sent BOOLEAN NOT NULL DEFAULT false,
  sms_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Messages indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_organization_id ON messages(organization_id);
CREATE INDEX idx_messages_partner_id ON messages(partner_id);

-- Threads indexes
CREATE INDEX idx_message_threads_created_by ON message_threads(created_by);
CREATE INDEX idx_message_threads_participants ON message_threads USING GIN(participants);
CREATE INDEX idx_message_threads_type ON message_threads(type);
CREATE INDEX idx_message_threads_is_active ON message_threads(is_active);
CREATE INDEX idx_message_threads_is_archived ON message_threads(is_archived);
CREATE INDEX idx_message_threads_last_message_at ON message_threads(last_message_at DESC);
CREATE INDEX idx_message_threads_organization_id ON message_threads(organization_id);
CREATE INDEX idx_message_threads_partner_id ON message_threads(partner_id);

-- Attachments indexes
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_file_type ON message_attachments(file_type);

-- Reactions indexes
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX idx_message_reactions_type ON message_reactions(reaction_type);

-- Read receipts indexes
CREATE INDEX idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON message_read_receipts(user_id);
CREATE INDEX idx_message_read_receipts_read_at ON message_read_receipts(read_at);

-- Notifications indexes
CREATE INDEX idx_message_notifications_user_id ON message_notifications(user_id);
CREATE INDEX idx_message_notifications_message_id ON message_notifications(message_id);
CREATE INDEX idx_message_notifications_is_read ON message_notifications(is_read);
CREATE INDEX idx_message_notifications_created_at ON message_notifications(created_at DESC);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON message_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_attachments_updated_at BEFORE UPDATE ON message_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER FOR LAST_MESSAGE_AT
-- =====================================================

-- Function to update last_message_at in threads
CREATE OR REPLACE FUNCTION update_thread_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_threads 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update last_message_at when new message is inserted
CREATE TRIGGER update_thread_last_message_at_trigger 
  AFTER INSERT ON messages 
  FOR EACH ROW 
  WHEN (NEW.thread_id IS NOT NULL)
  EXECUTE FUNCTION update_thread_last_message_at();

-- =====================================================
-- TRIGGER FOR MESSAGE NOTIFICATIONS
-- =====================================================

-- Function to create notifications for new messages
CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for recipient
  IF NEW.recipient_id IS NOT NULL THEN
    INSERT INTO message_notifications (
      message_id, 
      user_id, 
      notification_type, 
      title, 
      body, 
      data
    ) VALUES (
      NEW.id,
      NEW.recipient_id,
      'message',
      CASE 
        WHEN NEW.subject IS NOT NULL AND NEW.subject != '' THEN NEW.subject
        ELSE 'New message'
      END,
      CASE 
        WHEN LENGTH(NEW.content) > 100 THEN LEFT(NEW.content, 100) || '...'
        ELSE NEW.content
      END,
      jsonb_build_object(
        'message_type', NEW.type,
        'sender_id', NEW.sender_id,
        'thread_id', NEW.thread_id,
        'priority', NEW.priority
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create notifications when new message is inserted
CREATE TRIGGER create_message_notifications_trigger 
  AFTER INSERT ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION create_message_notifications();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_notifications ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    EXISTS (
      SELECT 1 FROM message_threads 
      WHERE id = messages.thread_id 
      AND auth.uid() = ANY(participants)
    )
  );

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Threads policies
CREATE POLICY "Users can view threads they participate in" ON message_threads
  FOR SELECT USING (auth.uid() = ANY(participants) OR auth.uid() = created_by);

CREATE POLICY "Users can create threads" ON message_threads
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update threads they created or participate in" ON message_threads
  FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = ANY(participants));

-- Attachments policies
CREATE POLICY "Users can view attachments for messages they can access" ON message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE id = message_attachments.message_id 
      AND (auth.uid() = sender_id OR auth.uid() = recipient_id)
    )
  );

CREATE POLICY "Users can insert attachments" ON message_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE id = message_attachments.message_id 
      AND auth.uid() = sender_id
    )
  );

-- Reactions policies
CREATE POLICY "Users can view reactions" ON message_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reactions" ON message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Read receipts policies
CREATE POLICY "Users can view read receipts" ON message_read_receipts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own read receipts" ON message_read_receipts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON message_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON message_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM messages 
    WHERE recipient_id = user_uuid 
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get thread participants with user details
CREATE OR REPLACE FUNCTION get_thread_participants(thread_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.raw_user_meta_data->>'full_name' as full_name,
    u.email,
    u.raw_user_meta_data->>'avatar_url' as avatar_url
  FROM auth.users u
  WHERE u.id = ANY(
    SELECT participants 
    FROM message_threads 
    WHERE id = thread_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE messages IS 'Unified messages table for internal, external, system, and notification messages';
COMMENT ON TABLE message_threads IS 'Message threads/conversations';
COMMENT ON TABLE message_attachments IS 'File attachments for messages';
COMMENT ON TABLE message_reactions IS 'User reactions to messages (emojis, etc.)';
COMMENT ON TABLE message_read_receipts IS 'Track when users read messages';
COMMENT ON TABLE message_notifications IS 'Notifications for new messages and events';

COMMENT ON COLUMN messages.type IS 'Type of message: internal (admin-to-user), external (admin-to-admin), system, notification';
COMMENT ON COLUMN messages.priority IS 'Message priority level';
COMMENT ON COLUMN messages.status IS 'Current status of message delivery';
COMMENT ON COLUMN messages.metadata IS 'Additional metadata for the message';
COMMENT ON COLUMN message_threads.participants IS 'Array of user IDs participating in the thread';
COMMENT ON COLUMN message_threads.metadata IS 'Additional metadata for the thread'; 