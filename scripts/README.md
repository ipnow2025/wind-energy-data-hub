# SQL Scripts Organization

This directory contains SQL scripts organized by purpose.

## Directory Structure

### `/migrations`
Database migration scripts that modify schema or data structure. These should be run in order.

- `001_create_collaboration_posts.sql` - Initial collaboration posts table
- `002_add_files_column.sql` - Add files column to collaboration posts
- `003_create_user_sessions.sql` - Create user sessions table
- `005_user_password_functions.sql` - User password management functions
- `006_recreate_user_password_functions.sql` - Recreate password functions
- `007_add_knowledge_posts.sql` - Add knowledge posts table
- `01_migrate_knowledge_posts.sql` - Migrate knowledge posts
- `02_cleanup_knowledge_from_collaboration.sql` - Clean up knowledge from collaboration
- `021_add_email_to_users.sql` - Add email column to users
- `03_add_view_count_to_knowledge_posts.sql` - Add view count to knowledge posts
- `04_add_last_activity_to_sessions.sql` - Add last activity to sessions
- `migrate_board_ids_to_uppercase.sql` - Migrate board IDs to uppercase
- `migrate_knowledge_posts.sql` - Migrate knowledge posts (alternative)
- `migrate-existing-users.sql` - Migrate existing users
- `update_board_ids_to_uppercase.sql` - Update board IDs to uppercase
- `update_board_ids_uppercase.sql` - Update board IDs uppercase (alternative)

### `/setup`
Initial setup scripts for creating base tables and structures.

- `create_knowledge_posts_table.sql` - Create knowledge posts table
- `create-page-visits-table.sql` - Create page visits tracking table
- `create-users-table.sql` - Create users table
- `check_collaboration_posts.sql` - Check collaboration posts structure

### `/samples`
Sample data scripts for testing and development.

- `008_add_sample_knowledge_post.sql` - Add sample knowledge post
- `add-sample-knowledge-post.sql` - Add sample knowledge post (alternative)

## Usage

Run migrations in order:
```bash
# Example: Run all migrations
for file in migrations/*.sql; do
  psql -d your_database -f "$file"
done
```

