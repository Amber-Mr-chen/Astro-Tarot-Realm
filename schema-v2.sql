-- Add new columns to users table
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN credits INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN plan_expires_at INTEGER;
ALTER TABLE users ADD COLUMN daily_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_used_date TEXT;

-- Guest usage tracking table
CREATE TABLE IF NOT EXISTS guest_usage (
  ip TEXT PRIMARY KEY,
  daily_count INTEGER NOT NULL DEFAULT 0,
  last_used_date TEXT
);
