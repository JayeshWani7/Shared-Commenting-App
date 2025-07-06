-- Database setup for Comment App
-- Run this script in your PostgreSQL database

-- Create the database (if it doesn't exist)
-- You may need to create this manually: CREATE DATABASE comment_app;
createdb -U postgres comment_app

-- Connect to the comment_app database and run the following:

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table will be created automatically by TypeORM
-- Comments table will be created automatically by TypeORM  
-- Notifications table will be created automatically by TypeORM

-- Create indexes for better performance (these will be created after tables exist)
-- You can run these after the first time you start the backend:

-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
-- CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
-- CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
-- CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
-- CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
-- CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
-- CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
