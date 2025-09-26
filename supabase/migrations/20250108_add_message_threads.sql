-- Create message_threads table for conversation management
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    team_member_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    type VARCHAR(20) NOT NULL CHECK (type IN ('external', 'internal')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_threads_user_id ON message_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_partner_id ON message_threads(partner_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_team_member_id ON message_threads(team_member_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_type ON message_threads(type);
CREATE INDEX IF NOT EXISTS idx_message_threads_status ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_message_threads_last_message_at ON message_threads(last_message_at);

-- Enable RLS
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own message threads" ON message_threads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own message threads" ON message_threads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message threads" ON message_threads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message threads" ON message_threads
    FOR DELETE USING (auth.uid() = user_id);

-- Insert sample conversations
INSERT INTO message_threads (user_id, partner_id, title, last_message, last_message_at, unread_count, type, status)
VALUES 
    ('6d1a08f1-134c-46dd-aa1e-21f95b80bed4', 'd44f297b-a185-4cca-994f-8ebf182380cd', 'Gemstone Collection Inquiry', 'We are interested in your diamond collection. Can you send us your latest catalog?', NOW() - INTERVAL '1 hour', 3, 'external', 'active'),
    ('6d1a08f1-134c-46dd-aa1e-21f95b80bed4', 'bd180762-49e2-477d-b286-d7039b43cd83', 'Gold Supply Discussion', 'We need 2kg of 18k gold for our new collection. What is your current pricing and delivery timeline?', NOW() - INTERVAL '2 hours', 15, 'external', 'active'),
    ('6d1a08f1-134c-46dd-aa1e-21f95b80bed4', 'a74c5094-1ca1-4efd-9a6f-6d857aad5651', 'Luxury Watch Partnership', 'hey', NOW() - INTERVAL '3 hours', 1, 'external', 'active');
