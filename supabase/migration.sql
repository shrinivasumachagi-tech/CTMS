-- ============================================================
-- CTMS (Complaint Ticket Management System)
-- Complete Database Migration for Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mobile TEXT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  designation TEXT,
  employee_id TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('super_admin', 'department_manager', 'support_executive', 'user')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from departments to users
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================
-- 3. TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  sub_category TEXT,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Pending User Response', 'Escalated', 'Resolved', 'Closed', 'Reopened')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  sla_deadline TIMESTAMPTZ,
  sla_breached BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  auto_close_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. TICKET COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. TICKET ATTACHMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. TICKET STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS ticket_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. USER ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_status_history_ticket ON ticket_status_history(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_departments_updated_at
  BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_tickets_updated_at
  BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, mobile, department_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULLIF(NEW.raw_user_meta_data->>'mobile', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'department_id' IS NOT NULL
        AND NEW.raw_user_meta_data->>'department_id' != ''
        AND NEW.raw_user_meta_data->>'department_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      THEN (NEW.raw_user_meta_data->>'department_id')::uuid
      ELSE NULL
    END,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- AUTO-CLOSE TICKETS AFTER 72 HOURS (via auto_close_at)
-- ============================================================
CREATE OR REPLACE FUNCTION auto_close_expired_tickets()
RETURNS void AS $$
BEGIN
  UPDATE tickets
  SET status = 'Closed',
      closed_at = now(),
      updated_at = now()
  WHERE status = 'Pending User Response'
    AND auto_close_at IS NOT NULL
    AND auto_close_at <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DEFAULT ROLES
-- ============================================================
INSERT INTO roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access', '{"all": true}'),
  ('department_manager', 'Manage department tickets', '{"tickets": "all", "users": "department"}'),
  ('support_executive', 'Handle assigned tickets', '{"tickets": "assigned", "comments": "all"}'),
  ('user', 'Create and view own tickets', '{"tickets": "own"}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DEFAULT DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, description) VALUES
  ('IT', 'Information Technology'),
  ('HR', 'Human Resources'),
  ('Finance', 'Finance & Accounting'),
  ('Administration', 'Administration'),
  ('Operations', 'Operations'),
  ('Security', 'Security'),
  ('Facilities', 'Facilities & Maintenance')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- USERS: Users can read all, update own profile
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Authenticated users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage users" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- DEPARTMENTS: Everyone can read, admins can manage
CREATE POLICY "Everyone can view departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- TICKETS: Department-based access
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.department_id = tickets.department_id
    AND u.role IN ('department_manager', 'support_executive')
  )
);
CREATE POLICY "Authenticated users can create tickets" ON tickets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update accessible tickets" ON tickets FOR UPDATE USING (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  OR EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.department_id = tickets.department_id
    AND u.role IN ('department_manager', 'support_executive')
  )
);

-- TICKET COMMENTS: Visible to ticket participants
CREATE POLICY "Comments visible to ticket participants" ON ticket_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_comments.ticket_id
    AND (
      t.created_by = auth.uid()
      OR t.assigned_to = auth.uid()
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    )
  )
);
CREATE POLICY "Authenticated users can add comments" ON ticket_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET ATTACHMENTS: Visible to ticket participants
CREATE POLICY "Attachments visible to ticket participants" ON ticket_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_attachments.ticket_id
    AND (
      t.created_by = auth.uid()
      OR t.assigned_to = auth.uid()
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    )
  )
);
CREATE POLICY "Authenticated users can upload attachments" ON ticket_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TICKET STATUS HISTORY: Visible to ticket participants
CREATE POLICY "History visible to ticket participants" ON ticket_status_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = ticket_status_history.ticket_id
    AND (
      t.created_by = auth.uid()
      OR t.assigned_to = auth.uid()
      OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
    )
  )
);
CREATE POLICY "Authenticated users can insert history" ON ticket_status_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- NOTIFICATIONS: Users see only their own
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (user_id = auth.uid());

-- AUDIT LOGS: Admins can read all, system can insert
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ROLES: Everyone can read, admins can manage
CREATE POLICY "Everyone can view roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage roles" ON roles FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- USER ROLES: Everyone can read, admins can manage
CREATE POLICY "Everyone can view user roles" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can manage user roles" ON user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
);

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_status_history;

-- ============================================================
-- STORAGE BUCKET FOR ATTACHMENTS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ticket-attachments');

-- Storage policy: users can read their ticket attachments
CREATE POLICY "Users can read ticket attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ticket-attachments');
