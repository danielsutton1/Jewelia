-- =====================================================
-- ADD USER STATUS TABLE FOR ONLINE/OFFLINE STATUS
-- =====================================================

-- Create user_status table for tracking online/offline status
CREATE TABLE IF NOT EXISTS user_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_typing BOOLEAN DEFAULT false,
  current_thread_id UUID REFERENCES message_threads(id) ON DELETE SET NULL,
  custom_status TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_status_user_id ON user_status(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_status ON user_status(status);
CREATE INDEX IF NOT EXISTS idx_user_status_last_seen ON user_status(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_user_status_is_typing ON user_status(is_typing);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_status_updated_at
  BEFORE UPDATE ON user_status
  FOR EACH ROW
  EXECUTE FUNCTION update_user_status_updated_at();

-- Enable RLS
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_status
CREATE POLICY "Users can view their own status and status of users in their threads"
  ON user_status FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT DISTINCT unnest(participants) 
      FROM message_threads 
      WHERE participants @> ARRAY[auth.uid()]
    )
  );

CREATE POLICY "Users can update their own status"
  ON user_status FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own status"
  ON user_status FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to automatically set users as offline after 5 minutes of inactivity
CREATE OR REPLACE FUNCTION set_inactive_users_offline()
RETURNS void AS $$
BEGIN
  UPDATE user_status 
  SET status = 'offline', updated_at = NOW()
  WHERE last_seen < NOW() - INTERVAL '5 minutes'
    AND status != 'offline';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run every minute (if using pg_cron)
-- SELECT cron.schedule('set-users-offline', '* * * * *', 'SELECT set_inactive_users_offline();');

-- Function to get online users count
CREATE OR REPLACE FUNCTION get_online_users_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM user_status 
    WHERE status = 'online' 
      AND last_seen > NOW() - INTERVAL '5 minutes'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get users typing in a specific thread
CREATE OR REPLACE FUNCTION get_typing_users_in_thread(thread_uuid UUID)
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  is_typing BOOLEAN,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.user_id,
    u.full_name as user_name,
    us.is_typing,
    us.last_seen
  FROM user_status us
  JOIN auth.users u ON us.user_id = u.id
  WHERE us.current_thread_id = thread_uuid
    AND us.is_typing = true
    AND us.last_seen > NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- Insert default status for existing users
INSERT INTO user_status (user_id, status, last_seen)
SELECT 
  id as user_id,
  'offline' as status,
  NOW() as last_seen
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_status)
ON CONFLICT (user_id) DO NOTHING; 