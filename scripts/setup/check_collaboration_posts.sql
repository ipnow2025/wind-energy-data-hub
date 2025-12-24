-- Check all collaboration posts and their board_id values
SELECT 
  id,
  title,
  author,
  board_id,
  created_at
FROM collaboration_posts
ORDER BY created_at DESC;

-- Count posts by board_id
SELECT 
  board_id,
  COUNT(*) as post_count
FROM collaboration_posts
GROUP BY board_id
ORDER BY board_id;
