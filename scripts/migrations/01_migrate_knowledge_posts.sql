-- Migrate knowledge posts from collaboration_posts to knowledge_posts
-- This script copies all posts with board_id starting with 'KNOWLEDGE' to the knowledge_posts table

-- First, ensure knowledge_posts table exists (it should already exist)
-- Insert posts from collaboration_posts to knowledge_posts if they don't already exist
INSERT INTO knowledge_posts (id, title, content, author, created_at, updated_at, files)
SELECT 
  id,
  title,
  content,
  author,
  created_at,
  updated_at,
  files
FROM collaboration_posts
WHERE board_id LIKE 'KNOWLEDGE%'
  AND id NOT IN (SELECT id FROM knowledge_posts)
ON CONFLICT (id) DO NOTHING;

-- Verify the migration
SELECT 
  'Migration complete' as status,
  COUNT(*) as migrated_posts
FROM knowledge_posts;
