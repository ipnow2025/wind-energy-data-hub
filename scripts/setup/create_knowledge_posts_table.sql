-- Create knowledge_posts table separate from collaboration_posts
CREATE TABLE IF NOT EXISTS knowledge_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_knowledge_posts_created_at ON knowledge_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_posts_author ON knowledge_posts(author);

-- Migrate existing KNOWLEDGE posts from collaboration_posts to knowledge_posts
INSERT INTO knowledge_posts (id, title, content, author, files, created_at, updated_at)
SELECT id, title, content, author, files, created_at, updated_at
FROM collaboration_posts
WHERE board_id LIKE 'KNOWLEDGE%'
ON CONFLICT (id) DO NOTHING;

-- Optional: Delete migrated posts from collaboration_posts (uncomment if you want to remove them)
-- DELETE FROM collaboration_posts WHERE board_id LIKE 'KNOWLEDGE%';

-- Verify migration
SELECT 
  'knowledge_posts' as table_name,
  COUNT(*) as post_count
FROM knowledge_posts
UNION ALL
SELECT 
  'collaboration_posts (KNOWLEDGE)' as table_name,
  COUNT(*) as post_count
FROM collaboration_posts
WHERE board_id LIKE 'KNOWLEDGE%';
