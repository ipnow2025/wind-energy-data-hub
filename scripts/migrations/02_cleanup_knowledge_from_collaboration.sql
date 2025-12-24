-- Clean up KNOWLEDGE posts from collaboration_posts table
-- Run this AFTER verifying that posts are successfully migrated to knowledge_posts

-- Delete all posts with board_id starting with 'KNOWLEDGE' from collaboration_posts
DELETE FROM collaboration_posts
WHERE board_id LIKE 'KNOWLEDGE%';

-- Verify the cleanup
SELECT 
  'Cleanup complete' as status,
  COUNT(*) as remaining_knowledge_posts
FROM collaboration_posts
WHERE board_id LIKE 'KNOWLEDGE%';
