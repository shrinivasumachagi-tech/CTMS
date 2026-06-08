-- Add missing category columns to tickets table
-- Run this in Supabase SQL Editor if your tickets table is missing these columns

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sub_category TEXT;
