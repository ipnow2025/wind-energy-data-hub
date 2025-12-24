-- Update all board_id values in collaboration_posts to uppercase
-- This ensures consistent board_id formatting across the database

-- First, let's see what board_ids currently exist
SELECT DISTINCT board_id, UPPER(board_id) as uppercase_version
FROM collaboration_posts
ORDER BY board_id;

-- Update all board_id values to uppercase
UPDATE collaboration_posts
SET board_id = UPPER(board_id)
WHERE board_id IS NOT NULL;

-- Verify the update
SELECT DISTINCT board_id, COUNT(*) as post_count
FROM collaboration_posts
GROUP BY board_id
ORDER BY board_id;

-- Show total number of posts updated
SELECT COUNT(*) as total_posts_updated
FROM collaboration_posts
WHERE board_id IS NOT NULL;
