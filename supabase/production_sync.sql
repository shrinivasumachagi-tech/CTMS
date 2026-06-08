-- ============================================================
-- CTMS PRODUCTION SYNC MIGRATION
-- Run this ONCE in Supabase SQL Editor before deployment
-- Safe to re-run (uses IF NOT EXISTS)
-- ============================================================

-- 1. Add missing ticket columns (from previous sync)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_breached BOOLEAN DEFAULT false;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS auto_close_at TIMESTAMPTZ;

-- 2. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);

-- 3. Update tickets status CHECK to include Reopened
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Pending User Response', 'Escalated', 'Resolved', 'Closed', 'Reopened'));

-- 4. Verify all tables exist
DO $$
DECLARE
  required_tables TEXT[] := ARRAY[
    'departments', 'users', 'roles', 'user_roles',
    'tickets', 'ticket_comments', 'ticket_attachments',
    'ticket_status_history', 'notifications', 'audit_logs'
  ];
  tbl TEXT;
  missing TEXT[] := '{}';
BEGIN
  FOREACH tbl IN ARRAY required_tables LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl AND table_schema = 'public') THEN
      missing := array_append(missing, tbl);
    END IF;
  END LOOP;
  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'Missing tables: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'All 10 required tables verified present';
  END IF;
END $$;

-- 5. Verify all indexes exist
DO $$
DECLARE
  required_indexes TEXT[] := ARRAY[
    'idx_users_email', 'idx_tickets_ticket_number',
    'idx_tickets_department', 'idx_tickets_status',
    'idx_notifications_user', 'idx_audit_logs_user'
  ];
  idx TEXT;
  missing TEXT[] := '{}';
BEGIN
  FOREACH idx IN ARRAY required_indexes LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = idx) THEN
      missing := array_append(missing, idx);
    END IF;
  END LOOP;
  IF array_length(missing, 1) > 0 THEN
    RAISE WARNING 'Missing indexes: %', array_to_string(missing, ', ');
  ELSE
    RAISE NOTICE 'All 6 required indexes verified present';
  END IF;
END $$;

-- 6. Verify all foreign keys exist
DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT count(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public';
  RAISE NOTICE 'Found % foreign key constraints', fk_count;
END $$;

-- 7. Verify RLS is enabled on all tables
DO $$
DECLARE
  rls_disabled TEXT[] := '{}';
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'users', 'departments', 'tickets', 'ticket_comments',
    'ticket_attachments', 'ticket_status_history',
    'notifications', 'audit_logs', 'roles', 'user_roles'
  ]) LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = tbl AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN
      rls_disabled := array_append(rls_disabled, tbl);
    END IF;
  END LOOP;
  IF array_length(rls_disabled, 1) > 0 THEN
    RAISE WARNING 'RLS disabled on: %', array_to_string(rls_disabled, ', ');
  ELSE
    RAISE NOTICE 'RLS verified enabled on all tables';
  END IF;
END $$;
