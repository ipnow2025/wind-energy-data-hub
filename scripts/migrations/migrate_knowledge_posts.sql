-- Migrate knowledge center posts from collaboration_posts to knowledge_posts table

-- Insert posts from collaboration_posts where board_id starts with 'KNOWLEDGE' into knowledge_posts
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
ON CONFLICT (id) DO NOTHING;

-- Show the migrated posts count
SELECT COUNT(*) as migrated_posts_count FROM knowledge_posts;

-- Show sample of migrated posts
SELECT id, title, author, created_at FROM knowledge_posts ORDER BY created_at DESC LIMIT 5;
