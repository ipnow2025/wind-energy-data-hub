-- Add files column to collaboration_posts table
ALTER TABLE collaboration_posts
ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_collaboration_posts_files ON collaboration_posts USING GIN (files);
