-- Add files column to call_logs table
-- Run this in your Supabase SQL Editor

ALTER TABLE call_logs ADD COLUMN IF NOT EXISTS files JSONB; 