-- Add view_count column to knowledge_posts table
ALTER TABLE knowledge_posts 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Update existing posts to have view_count = 0
UPDATE knowledge_posts 
SET view_count = 0 
WHERE view_count IS NULL;
