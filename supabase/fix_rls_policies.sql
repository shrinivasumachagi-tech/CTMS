-- ============================================================
-- CTMS RLS Policy Fix
-- Ensures INSERT policies exist for all tables used during
-- ticket creation. Run this in Supabase SQL Editor.
-- ============================================================

-- TICKETS: Authenticated users can create tickets
DROP POLICY IF EXISTS "Authenticated users can create tickets" ON tickets;
CREATE POLICY "Authenticated users can create tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET STATUS HISTORY: Authenticated users can insert history
DROP POLICY IF EXISTS "Authenticated users can insert history" ON ticket_status_history;
CREATE POLICY "Authenticated users can insert history" ON ticket_status_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- NOTIFICATIONS: System can insert notifications (any authenticated user)
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- AUDIT LOGS: Authenticated users can insert audit logs
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET COMMENTS: Authenticated users can add comments
DROP POLICY IF EXISTS "Authenticated users can add comments" ON ticket_comments;
CREATE POLICY "Authenticated users can add comments" ON ticket_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET ATTACHMENTS: Authenticated users can upload attachments
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON ticket_attachments;
CREATE POLICY "Authenticated users can upload attachments" ON ticket_attachments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Verify all INSERT policies exist
DO $$
DECLARE
  policies_found INT;
BEGIN
  SELECT count(*) INTO policies_found
  FROM pg_policies
  WHERE tablename IN ('tickets', 'ticket_status_history', 'notifications', 'audit_logs', 'ticket_comments', 'ticket_attachments')
    AND cmd = 'INSERT'
    AND schemaname = 'public';
  RAISE NOTICE '% INSERT policies found (expected 6)', policies_found;
END $$;
