-- Update all board_id values in collaboration_posts to uppercase
UPDATE collaboration_posts
SET board_id = UPPER(board_id)
WHERE board_id IS NOT NULL;

-- Verify the update
SELECT DISTINCT board_id, COUNT(*) as count
FROM collaboration_posts
GROUP BY board_id
ORDER BY board_id;
