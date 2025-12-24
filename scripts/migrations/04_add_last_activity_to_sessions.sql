-- Add last_activity column to user_sessions table for inactivity tracking
ALTER TABLE user_sessions
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing sessions to have current time as last_activity
UPDATE user_sessions
SET last_activity = NOW()
WHERE last_activity IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
