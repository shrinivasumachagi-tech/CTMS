import { supabase } from "./supabase";

const API = "/api/supabase";

async function apiCall(action: string, params: Record<string, unknown> = {}) {
  // Attach Supabase session token so server can identify the user
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...params }),
  });
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.error || `API error (${res.status})`;
    console.error(`[API] ${action} failed (${res.status}):`, errorMsg);
    throw new Error(errorMsg);
  }
  return json.data;
}

// ============================================================
// AUTH — Client-side Supabase for signUp/signIn
// ============================================================

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  mobile: string,
  departmentId: string
) {
  // Step 1: Create auth user via client-side Supabase
  // The DB trigger (handle_new_user) auto-creates the public.users profile
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, mobile, department_id: departmentId, role: "user" },
    },
  });

  if (signUpError) {
    throw new Error(signUpError.message);
  }

  if (!signUpData.user) {
    throw new Error("Registration failed. Please try again.");
  }

  // Step 2: Auto-login immediately
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Account created but auto-login failed — user can login manually
    console.error("[signUp] Auto-login failed:", signInError.message);
    throw new Error("Account created. Please sign in with your credentials.");
  }

  // Set session cookie for middleware route protection
  document.cookie = `ctms_session=${signInData.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; ${window.location.protocol === "https:" ? "Secure;" : ""}`;

  return signUpData;
}

export async function signInWithEmail(email: string, password: string) {
  // Step 1: Authenticate via client-side Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Invalid email or password.");
    }
    if (error.message.includes("Email not confirmed")) {
      throw new Error("Please confirm your email address first.");
    }
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error("Login failed. Please try again.");
  }

  // Step 2: Set session cookie for middleware route protection
  document.cookie = `ctms_session=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; ${window.location.protocol === "https:" ? "Secure;" : ""}`;

  // Step 3: Get profile from server
  try {
    const profile = await apiCall("getUser");
    return profile;
  } catch {
    // Profile fetch failed but auth succeeded — still allow login
    return data.user;
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  // Clear session cookie for middleware
  document.cookie = "ctms_session=; path=/; max-age=0";
  try {
    await apiCall("signOut");
  } catch { /* no-op */ }
}

export async function getCurrentUser() {
  // Check client-side session first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Get profile from server
  try {
    return await apiCall("getUser");
  } catch {
    return null;
  }
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  return await apiCall("getUserProfile", { userId: user.id });
}

export async function getUserProfile(userId: string) {
  return await apiCall("getUserProfile", { userId });
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  });
  if (error) throw new Error(error.message);
}

// ============================================================
// DEPARTMENTS
// ============================================================

export async function getDepartments() {
  const data = await apiCall("getDepartments", { activeOnly: true });
  return Array.isArray(data) ? data : [];
}

export async function getAllDepartments() {
  const data = await apiCall("getDepartments", { activeOnly: false });
  return Array.isArray(data) ? data : [];
}

export async function createDepartment(dept: { name: string; description?: string }) {
  return await apiCall("createDepartment", { name: dept.name, description: dept.description });
}

export async function updateDepartment(id: string, updates: { name?: string; description?: string; is_active?: boolean; manager_id?: string }) {
  return await apiCall("updateDepartment", { id, updates });
}

export async function deleteDepartment(id: string) {
  await apiCall("deleteDepartment", { id });
}

// ============================================================
// USERS
// ============================================================

export async function getUsers() {
  return await apiCall("getUsers");
}

export async function updateUser(id: string, updates: Record<string, unknown>) {
  return await apiCall("updateUser", { id, updates });
}

// ============================================================
// TICKETS
// ============================================================

export async function getTickets(filters?: { status?: string; priority?: string; department_id?: string; created_by?: string; assigned_to?: string }) {
  return await apiCall("getTickets", filters || {});
}

export async function getTicketById(id: string) {
  return await apiCall("getTicketById", { id });
}

export async function createTicket(ticket: { title: string; description: string; category?: string; sub_category?: string; priority?: string; department_id?: string; created_by?: string }) {
  return await apiCall("createTicket", ticket);
}

export async function updateTicketStatus(id: string, newStatus: string, changedBy: string, notes?: string) {
  return await apiCall("updateTicketStatus", { id, newStatus, changedBy, notes });
}

export async function assignTicket(id: string, assignedTo: string, assignedBy: string) {
  return await apiCall("assignTicket", { id, assignedTo, assignedBy });
}

export async function escalateTicket(id: string, escalatedBy: string, reason: string) {
  return await apiCall("escalateTicket", { id, escalatedBy, reason });
}

// ============================================================
// TICKET COMMENTS
// ============================================================

export async function getTicketComments(ticketId: string) {
  return await apiCall("getTicketComments", { ticketId });
}

export async function addTicketComment(ticketId: string, userId: string, content: string, isInternal: boolean = false) {
  return await apiCall("addTicketComment", { ticketId, userId, content, isInternal });
}

export const addComment = addTicketComment;

// ============================================================
// TICKET STATUS HISTORY
// ============================================================

export async function getTicketHistory(ticketId: string) {
  return await apiCall("getTicketHistory", { ticketId });
}

// ============================================================
// TICKET ATTACHMENTS
// ============================================================

export async function uploadAttachment(ticketId: string, file: File, uploadedBy: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("ticketId", ticketId);
  formData.append("uploadedBy", uploadedBy);
  const res = await fetch("/api/supabase/upload", { method: "POST", body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export async function getTicketAttachments(ticketId: string) {
  return await apiCall("getTicketAttachments", { ticketId });
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getNotifications(userId: string) {
  const data = await apiCall("getNotifications", { userId });
  return Array.isArray(data) ? data : [];
}

export async function markNotificationRead(id: string) {
  await apiCall("markNotificationRead", { id });
}

export async function markAllNotificationsRead(userId: string) {
  await apiCall("markAllNotificationsRead", { userId });
}

export async function deleteNotification(id: string) {
  await apiCall("deleteNotification", { id });
}

// ============================================================
// AUDIT LOGS
// ============================================================

export async function createAuditLog(userId: string | null, action: string, module: string, details: string) {
  try {
    await apiCall("createAuditLog", { userId, action, module, details });
  } catch { /* no-op */ }
}

export async function getAuditLogs(filters?: { action?: string; module?: string; user_id?: string }) {
  return await apiCall("getAuditLogs", filters || {});
}

// ============================================================
// REPORTS
// ============================================================

export async function getTicketReport(filters?: { start_date?: string; end_date?: string; department_id?: string; status?: string; priority?: string }) {
  return getTickets(filters);
}

export async function getDepartmentReport() {
  return await apiCall("getDepartmentReport");
}

export async function getUserReport() {
  return await apiCall("getUserReport");
}

// ============================================================
// REAL-TIME SUBSCRIPTIONS (polling fallback)
// ============================================================

let pollingIntervals: NodeJS.Timeout[] = [];

export function subscribeToTickets(callback: (payload: unknown) => void) {
  const interval = setInterval(async () => {
    try { await getTickets(); callback({ event: "REFRESH" }); } catch { /* no-op */ }
  }, 10000);
  pollingIntervals.push(interval);
  return { unsubscribe: () => { clearInterval(interval); pollingIntervals = pollingIntervals.filter((i) => i !== interval); } };
}

export function subscribeToNotifications(userId: string, callback: (payload: unknown) => void) {
  const interval = setInterval(async () => {
    try { await getNotifications(userId); callback({ event: "REFRESH" }); } catch { /* no-op */ }
  }, 10000);
  pollingIntervals.push(interval);
  return { unsubscribe: () => { clearInterval(interval); pollingIntervals = pollingIntervals.filter((i) => i !== interval); } };
}

export function subscribeToComments(ticketId: string, callback: (payload: unknown) => void) {
  const interval = setInterval(async () => {
    try { await getTicketComments(ticketId); callback({ event: "REFRESH" }); } catch { /* no-op */ }
  }, 10000);
  pollingIntervals.push(interval);
  return { unsubscribe: () => { clearInterval(interval); pollingIntervals = pollingIntervals.filter((i) => i !== interval); } };
}

// ============================================================
// AUTO-CLOSE TICKETS (72 hours)
// ============================================================

export async function autoCloseExpiredTickets() {
  try {
    const tickets = await getTickets({ status: "Pending User Response" });
    const now = new Date();
    for (const t of tickets) {
      if (t.auto_close_at && new Date(t.auto_close_at) <= now) {
        await updateTicketStatus(t.id, "Closed", "system", "Auto-closed: No user response after 72 hours");
      }
    }
  } catch { /* no-op */ }
}

// ============================================================
// DIAGNOSTICS
// ============================================================

export async function diagnose() {
  return await apiCall("diagnose");
}
