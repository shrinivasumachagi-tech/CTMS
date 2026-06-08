-- ============================================================
-- SYNC: Add all missing columns to tickets table
-- Generated: 2026-06-03
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- Category fields
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- SLA fields
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;

-- Resolution/timestamp fields
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS auto_close_at TIMESTAMPTZ;

-- Verify all columns exist
DO $$
DECLARE
  missing_cols TEXT[];
BEGIN
  SELECT array_agg(col)
  INTO missing_cols
  FROM unnest(ARRAY[
    'id', 'ticket_number', 'title', 'description',
    'category', 'sub_category', 'priority', 'status',
    'department_id', 'created_by', 'assigned_to',
    'sla_deadline', 'sla_breached',
    'resolved_at', 'closed_at', 'auto_close_at',
    'created_at', 'updated_at'
  ]) AS col
  WHERE col NOT IN (
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'tickets'
    AND table_schema = 'public'
  );

  IF missing_cols IS NOT NULL AND array_length(missing_cols, 1) > 0 THEN
    RAISE WARNING 'Still missing columns: %', array_to_string(missing_cols, ', ');
  ELSE
    RAISE NOTICE 'All 18 tickets columns verified present';
  END IF;
END $$;
