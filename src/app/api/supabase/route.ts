import { NextResponse } from "next/server";
import { getServerSupabase, getAuthenticatedSupabase, isSupabaseConfigured, getSupabaseUrl, getSupabaseAnonKey, getSupabaseServiceKey } from "@/lib/server-supabase";
import type { Database } from "@/lib/database.types";
import { createClient } from "@supabase/supabase-js";

function serverClient() {
  return getServerSupabase();
}

function anonClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!key) {
    console.error("[anonClient] NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY not set! signInWithPassword will fail. Set these in Netlify env vars.");
  }
  return createClient<Database>(url, key || getSupabaseServiceKey());
}

function authenticatedClient(token: string) {
  return getAuthenticatedSupabase(token);
}

export async function POST(request: Request) {
  const envStatus = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  if (!isSupabaseConfigured) {
    console.error("[Supabase] API not configured. Env vars:", envStatus);
    return NextResponse.json(
      { error: "Supabase not configured. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Netlify environment variables.", envStatus },
      { status: 503 }
    );
  }

  console.log("[API] Env vars:", envStatus, "| Service key available:", !!getSupabaseServiceKey());

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  // Also check cookie for session token (set by signIn)
  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("ctms_session="))
    ?.split("=")
    ?.slice(1)
    ?.join("=");

  // Use bearer token if available, otherwise fall back to session cookie
  const token = bearerToken || sessionCookie || null;

  const body = await request.json();
  const { action, ...params } = body;

  try {
    const supabase = serverClient();

    switch (action) {
      // ==================== AUTH ====================
      case "signUp": {
        // Use admin API — no emails, no rate limits, no email confirmation
        console.log("[signUp] Creating auth user:", params.email);
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: params.email,
          password: params.password,
          email_confirm: true,
          user_metadata: {
            full_name: params.fullName,
            mobile: params.mobile,
            department_id: params.departmentId,
            role: "user",
          },
        });
        if (authError) {
          console.error("[signUp] Auth error:", authError.message);
          throw authError;
        }
        if (!authData.user) throw new Error("Signup failed: no user returned");
        console.log("[signUp] Auth user created:", authData.user.id);

        // Create profile in public.users
        const { error: insertError } = await supabase
          .from("users")
          .upsert({
            id: authData.user.id,
            email: params.email,
            full_name: params.fullName,
            mobile: params.mobile || null,
            department_id: params.departmentId || null,
            role: "user",
          }, { onConflict: "id" });

        if (insertError) {
          console.error("[signUp] Profile insert error:", insertError.message, insertError.details);
          throw new Error(`Registration failed: ${insertError.message}`);
        }

        // Audit log
        await supabase.from("audit_logs").insert({
          user_id: authData.user.id,
          action: "Registered",
          module: "Auth",
          details: `New user registered: ${params.email}`,
          ip_address: null,
        }).then(({ error }) => { if (error) console.error("[signUp] Audit log error:", error.message); });

        console.log("[signUp] Profile created for:", params.email);
        return NextResponse.json({ data: authData });
      }

      case "signIn": {
        console.log("[signIn] Attempting login for:", params.email);

        // 1. Authenticate FIRST via Supabase Auth — no pre-check against public.users
        const authClient = anonClient();
        const { data, error } = await authClient.auth.signInWithPassword({
          email: params.email,
          password: params.password,
        });

        if (error) {
          console.error("[signIn] Auth error:", error.message, error.status);
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password.");
          }
          if (error.message.includes("User not found")) {
            throw new Error("Account not found. Please register.");
          }
          throw new Error(`Authentication failed: ${error.message}`);
        }

        console.log("[signIn] Auth succeeded for user:", data.user.id);

        // 2. Auth succeeded — now load profile from public.users by auth user ID
        const profileClient = authenticatedClient(data.session.access_token);
        const { data: profile, error: profileError } = await profileClient
          .from("users")
          .select("role, full_name, is_active, department_id, departments(name)")
          .eq("id", data.user.id)
          .single();

        console.log("[signIn] Profile query:", { found: !!profile, error: profileError?.message || null });

        // If profile query fails, still allow login — user exists in auth
        if (profileError) {
          console.error("[signIn] Profile query error (non-fatal):", profileError.message);
        }

        if (profile && profile.is_active === false) {
          throw new Error("Your account has been disabled. Contact administrator.");
        }

        await profileClient.from("audit_logs").insert({
          user_id: data.user.id,
          action: "Login",
          module: "Auth",
          details: `User logged in: ${params.email}`,
          ip_address: null,
        });

        // Build response with session tokens
        const response = NextResponse.json({
          data: {
            ...data,
            user: {
              ...data.user,
              role: profile?.role || data.user.user_metadata?.role || "user",
              full_name: profile?.full_name || data.user.user_metadata?.full_name,
              department: profile?.departments?.name,
            },
          },
        });

        // Set session cookie for middleware route protection
        if (data.session) {
          response.cookies.set("ctms_session", data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          });
        }

        return response;
      }

      case "createProfile": {
        // Called after client-side signUp + signIn to create the public.users profile
        const { userId, email, fullName, mobile, departmentId } = params;
        console.log("[createProfile] Creating profile for:", email, "userId:", userId);

        const { error: insertError } = await supabase
          .from("users")
          .upsert({
            id: userId,
            email: email,
            full_name: fullName,
            mobile: mobile || null,
            department_id: departmentId || null,
            role: "user",
          }, { onConflict: "id" });

        if (insertError) {
          console.error("[createProfile] Insert error:", insertError.message, insertError.details);
          throw new Error(`Profile creation failed: ${insertError.message}`);
        }

        // Audit log
        await supabase.from("audit_logs").insert({
          user_id: userId,
          action: "Registered",
          module: "Auth",
          details: `New user registered: ${email}`,
          ip_address: null,
        }).then(({ error }) => { if (error) console.error("[createProfile] Audit log error:", error.message); });

        console.log("[createProfile] Profile created for:", email);
        return NextResponse.json({ data: { id: userId, email } });
      }

      case "signOut": {
        // Audit log before signout
        if (token) {
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) {
            await supabase.from("audit_logs").insert({
              user_id: user.id,
              action: "Logout",
              module: "Auth",
              details: `User logged out: ${user.email}`,
              ip_address: null,
            }).then(({ error }) => { if (error) console.error("[signOut] Audit log error:", error.message); });
          }
        }
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        const response = NextResponse.json({ ok: true });
        response.cookies.delete("ctms_session");
        return response;
      }

      case "getUser": {
        if (!token) return NextResponse.json({ data: null });
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) {
          console.error("[getUser] Auth error:", error.message);
          const response = NextResponse.json({ data: null });
          response.cookies.delete("ctms_session");
          return response;
        }

        if (user) {
          const profileClient = authenticatedClient(token);
          const { data: profile, error: profileError } = await profileClient
            .from("users")
            .select("role, full_name, mobile, department_id, departments(name)")
            .eq("id", user.id)
            .single();
          if (profileError) {
            console.error("[getUser] Profile query error:", profileError.message, profileError.details, profileError.code);
          }
          console.log("[getUser] Profile result:", { found: !!profile, department_id: profile?.department_id, department_name: profile?.departments?.name });
          return NextResponse.json({
            data: {
              ...user,
              role: profile?.role || user.user_metadata?.role || "user",
              full_name: profile?.full_name || user.user_metadata?.full_name,
              mobile: profile?.mobile,
              department_id: profile?.department_id,
              department: profile?.departments?.name,
            },
          });
        }
        return NextResponse.json({ data: user });
      }

      case "getUserProfile": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { data, error } = await uSupabase
          .from("users")
          .select("*, departments(name)")
          .eq("id", params.userId)
          .single();
        if (error) throw new Error(`Failed to load profile: ${error.message}`);
        return NextResponse.json({ data });
      }

      case "resetPassword": {
        const { error } = await supabase.auth.resetPasswordForEmail(params.email, {
          redirectTo: `${params.origin}/auth/callback?type=recovery`,
        });
        if (error) throw error;
        return NextResponse.json({ ok: true });
      }

      // ==================== DEPARTMENTS ====================
      case "getDepartments": {
        let query = supabase.from("departments").select("*").order("name");
        if (params.activeOnly) query = query.eq("is_active", true);
        const { data, error } = await query;
        console.log("[getDepartments] Query result:", { count: data?.length || 0, error: error?.message || null, activeOnly: params.activeOnly });
        if (error) {
          console.error("[getDepartments] Query error:", error.message, error.code, error.details);
          throw new Error(`Failed to load departments: ${error.message}. Check that SUPABASE_SERVICE_ROLE_KEY is set in Netlify env vars.`);
        }
        return NextResponse.json({ data });
      }

      case "createDepartment": {
        const { data, error } = await supabase
          .from("departments")
          .insert({ name: params.name, description: params.description || null })
          .select()
          .single();
        if (error) throw error;
        // Audit log
        await supabase.from("audit_logs").insert({
          user_id: params.userId || null,
          action: "Created",
          module: "Departments",
          details: `Created department: ${params.name}`,
          ip_address: null,
        }).then(({ error }) => { if (error) console.error("[createDepartment] Audit log error:", error.message); });
        return NextResponse.json({ data });
      }

      case "updateDepartment": {
        const { data, error } = await supabase
          .from("departments")
          .update({ ...params.updates, updated_at: new Date().toISOString() })
          .eq("id", params.id)
          .select()
          .single();
        if (error) throw error;
        // Audit log
        await supabase.from("audit_logs").insert({
          user_id: params.userId || null,
          action: "Updated",
          module: "Departments",
          details: `Updated department: ${data?.name || params.id}`,
          ip_address: null,
        }).then(({ error }) => { if (error) console.error("[updateDepartment] Audit log error:", error.message); });
        return NextResponse.json({ data });
      }

      case "deleteDepartment": {
        // Get department name before deletion
        const { data: deptToDelete } = await supabase
          .from("departments")
          .select("name")
          .eq("id", params.id)
          .single();
        const { error } = await supabase
          .from("departments")
          .update({ is_active: false })
          .eq("id", params.id);
        if (error) throw error;
        // Audit log
        await supabase.from("audit_logs").insert({
          user_id: params.userId || null,
          action: "Deleted",
          module: "Departments",
          details: `Disabled department: ${deptToDelete?.name || params.id}`,
          ip_address: null,
        }).then(({ error }) => { if (error) console.error("[deleteDepartment] Audit log error:", error.message); });
        return NextResponse.json({ ok: true });
      }

      // ==================== USERS ====================
      case "getUsers": {
        const { data, error } = await supabase
          .from("users")
          .select("*, departments(name)")
          .order("full_name");
        if (error) throw error;
        return NextResponse.json({ data });
      }

      case "updateUser": {
        const { data, error } = await supabase
          .from("users")
          .update({ ...params.updates, updated_at: new Date().toISOString() })
          .eq("id", params.id)
          .select()
          .single();
        if (error) throw error;
        // Audit log
        await supabase.from("audit_logs").insert({
          user_id: params.adminId || params.id,
          action: "Updated",
          module: "Users",
          details: `Updated user profile: ${data?.full_name || params.id}`,
          ip_address: null,
        }).then(({ error }) => { if (error) console.error("[updateUser] Audit log error:", error.message); });
        return NextResponse.json({ data });
      }

      // ==================== TICKETS ====================
      case "getTickets": {
        const uSupabase = token ? authenticatedClient(token) : supabase;
        let query = uSupabase
          .from("tickets")
          .select(
            `*, departments(name), creator:users!tickets_created_by_fkey(full_name), assignee:users!tickets_assigned_to_fkey(full_name)`
          )
          .order("created_at", { ascending: false });
        if (params.status) query = query.eq("status", params.status);
        if (params.priority) query = query.eq("priority", params.priority);
        if (params.department_id) query = query.eq("department_id", params.department_id);
        if (params.created_by) query = query.eq("created_by", params.created_by);
        if (params.assigned_to) query = query.eq("assigned_to", params.assigned_to);
        const { data, error } = await query;
        if (error) throw new Error(`Failed to load tickets: ${error.message}`);
        return NextResponse.json({ data });
      }

      case "getTicketById": {
        const uSupabase = token ? authenticatedClient(token) : supabase;
        const { data, error } = await uSupabase
          .from("tickets")
          .select(
            `*, departments(name), creator:users!tickets_created_by_fkey(full_name, email), assignee:users!tickets_assigned_to_fkey(full_name, email)`
          )
          .eq("id", params.id)
          .single();
        if (error) throw new Error(`Failed to load ticket: ${error.message}`);
        return NextResponse.json({ data });
      }

      case "createTicket": {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
        const ticket_number = `CMP-${year}-${random}`;
        const slaDeadline = new Date();
        slaDeadline.setHours(slaDeadline.getHours() + 72);

        console.log("[createTicket] Creating ticket:", { title: params.title, department_id: params.department_id, created_by: params.created_by });

        if (!token) {
          throw new Error("Authentication required. No session token provided.");
        }

        // Verify the authenticated user matches created_by
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
        if (authError) {
          console.error("[createTicket] Auth verification error:", authError.message);
          throw new Error("Authentication failed. Please log in again.");
        }
        if (!authUser) {
          throw new Error("Authentication required. Please log in.");
        }
        console.log("[createTicket] Authenticated user:", authUser.id, authUser.email);

        if (params.created_by && params.created_by !== authUser.id) {
          console.error("[createTicket] User mismatch: params.created_by=", params.created_by, "auth.user.id=", authUser.id);
          throw new Error("You do not have permission to create tickets for another user.");
        }

        // Use authenticated client for RLS-aware operations
        const userSupabase = authenticatedClient(token);
        console.log("[createTicket] Using client type:", userSupabase ? "authenticated" : "service");

        const payload = {
          ticket_number,
          title: params.title,
          description: params.description,
          category: params.category || null,
          sub_category: params.sub_category || null,
          priority: params.priority || "Medium",
          status: "Open",
          department_id: params.department_id || null,
          created_by: params.created_by || authUser.id,
          sla_deadline: slaDeadline.toISOString(),
        };

        console.log("===== TICKET PAYLOAD =====");
        console.log(JSON.stringify(payload, null, 2));
        console.log("AUTH USER:", JSON.stringify({ id: authUser.id, email: authUser.email }, null, 2));
        console.log("payload.created_by:", payload.created_by);
        console.log("payload.department_id:", payload.department_id);
        console.log("authUser.id:", authUser.id);
        console.log("created_by === authUser.id:", payload.created_by === authUser.id);

        const { data, error } = await userSupabase
          .from("tickets")
          .insert(payload)
          .select();

        console.log("INSERT DATA:", data);
        console.log("INSERT ERROR:", error);
        console.log("========================");

        if (error) {
          console.error("[createTicket] Insert error:", error.message, error.details, error.hint, error.code);
          throw new Error(`Failed to create ticket: ${error.message}`);
        }
        if (!data || data.length === 0) {
          throw new Error("Ticket insert returned no data. Check RLS SELECT policy on tickets table.");
        }
        const ticket = Array.isArray(data) ? data[0] : data;
        console.log("[createTicket] Ticket created:", ticket.id, ticket_number);

        // Best-effort: log status history, notify, audit — don't fail the ticket creation
        const historyResult = await userSupabase.from("ticket_status_history").insert({
          ticket_id: ticket.id,
          new_status: "Open",
          changed_by: params.created_by || authUser.id,
          notes: "Ticket created",
        });
        if (historyResult.error) console.error("[createTicket] History insert error:", historyResult.error.message);

        if (params.department_id) {
          const { data: deptUsers } = await userSupabase
            .from("users")
            .select("id")
            .eq("department_id", params.department_id)
            .eq("is_active", true);
          if (deptUsers && deptUsers.length > 0) {
            const notificationResult = await userSupabase.from("notifications").insert(
              deptUsers.map((u) => ({
                user_id: u.id,
                title: "New Ticket Assigned",
                message: `Ticket ${ticket_number} has been assigned to your department`,
                type: "info",
                related_ticket_id: ticket.id,
              }))
            );
            if (notificationResult.error) console.error("[createTicket] Notification insert error:", notificationResult.error.message);
          }
        }
        if (params.created_by || authUser) {
          const userNotifResult = await userSupabase.from("notifications").insert({
            user_id: params.created_by || authUser.id,
            title: "Ticket Created",
            message: `Your ticket ${ticket_number} has been created successfully`,
            type: "success",
            related_ticket_id: ticket.id,
          });
          if (userNotifResult.error) console.error("[createTicket] User notification error:", userNotifResult.error.message);
        }
        const auditResult = await userSupabase.from("audit_logs").insert({
          user_id: params.created_by || authUser.id,
          action: "Created",
          module: "Tickets",
          details: `Created ticket ${ticket_number} - ${params.title}`,
          ip_address: null,
        });
        if (auditResult.error) console.error("[createTicket] Audit log error:", auditResult.error.message);
        return NextResponse.json({ data: ticket });
      }

      case "updateTicketStatus": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { data: currentTicket, error: fetchError } = await uSupabase
          .from("tickets")
          .select("status, ticket_number, department_id, created_by, assigned_to")
          .eq("id", params.id)
          .single();
        if (fetchError) throw new Error(`Failed to fetch ticket: ${fetchError.message}`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
          status: params.newStatus,
          updated_at: new Date().toISOString(),
        };
        if (params.newStatus === "Resolved") {
          updateData.resolved_at = new Date().toISOString();
          const autoClose = new Date();
          autoClose.setHours(autoClose.getHours() + 72);
          updateData.auto_close_at = autoClose.toISOString();
        }
        if (params.newStatus === "Closed") {
          updateData.closed_at = new Date().toISOString();
        }

        const { data, error } = await uSupabase
          .from("tickets")
          .update(updateData)
          .eq("id", params.id)
          .select()
          .single();
        if (error) throw new Error(`Failed to update ticket: ${error.message}`);

        const { error: historyError } = await uSupabase.from("ticket_status_history").insert({
          ticket_id: params.id,
          old_status: currentTicket?.status || null,
          new_status: params.newStatus,
          changed_by: params.changedBy,
          notes: params.notes || `Status changed to ${params.newStatus}`,
        });
        if (historyError) console.error("[updateTicketStatus] History insert error:", historyError.message);

        // Notify all relevant users (creator + assignee, excluding the person who made the change)
        const ticketNum = currentTicket?.ticket_number || "";
        const notifyUsers = new Set<string>();
        if (currentTicket?.created_by && currentTicket.created_by !== params.changedBy) {
          notifyUsers.add(currentTicket.created_by);
        }
        if (currentTicket?.assigned_to && currentTicket.assigned_to !== params.changedBy) {
          notifyUsers.add(currentTicket.assigned_to);
        }
        if (notifyUsers.size > 0) {
          const statusLabel = params.newStatus.charAt(0).toUpperCase() + params.newStatus.slice(1).toLowerCase();
          const { error: notifError } = await uSupabase.from("notifications").insert(
            Array.from(notifyUsers).map((uid) => ({
              user_id: uid,
              title: `Ticket ${statusLabel}`,
              message: `Ticket ${ticketNum} status changed to ${params.newStatus}`,
              type: params.newStatus === "Resolved" ? "success" : params.newStatus === "Closed" ? "info" : "info",
              related_ticket_id: params.id,
            }))
          );
          if (notifError) console.error("[updateTicketStatus] Notification error:", notifError.message);
        }
        const { error: auditError } = await uSupabase.from("audit_logs").insert({
          user_id: params.changedBy,
          action: params.newStatus === "Resolved" ? "Resolved" : params.newStatus === "Closed" ? "Closed" : "Updated",
          module: "Tickets",
          details: `Changed status of ${ticketNum} from ${currentTicket?.status} to ${params.newStatus}`,
          ip_address: null,
        });
        if (auditError) console.error("[updateTicketStatus] Audit log error:", auditError.message);
        return NextResponse.json({ data });
      }

      case "assignTicket": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { data: ticket, error: fetchError } = await uSupabase
          .from("tickets")
          .select("ticket_number, created_by")
          .eq("id", params.id)
          .single();
        if (fetchError) throw new Error(`Failed to fetch ticket: ${fetchError.message}`);
        const { data, error } = await uSupabase
          .from("tickets")
          .update({ assigned_to: params.assignedTo, status: "Assigned", updated_at: new Date().toISOString() })
          .eq("id", params.id)
          .select()
          .single();
        if (error) throw new Error(`Failed to assign ticket: ${error.message}`);
        const { error: historyError } = await uSupabase.from("ticket_status_history").insert({ ticket_id: params.id, old_status: "Open", new_status: "Assigned", changed_by: params.assignedBy, notes: "Ticket assigned" });
        if (historyError) console.error("[assignTicket] History error:", historyError.message);
        // Notify assignee
        const { error: notifError1 } = await uSupabase.from("notifications").insert({ user_id: params.assignedTo, title: "Ticket Assigned", message: `Ticket ${ticket?.ticket_number} has been assigned to you`, type: "info", related_ticket_id: params.id });
        if (notifError1) console.error("[assignTicket] Notification error:", notifError1.message);
        // Notify creator if different from assignee
        if (ticket?.created_by && ticket.created_by !== params.assignedTo) {
          const { error: notifError2 } = await uSupabase.from("notifications").insert({ user_id: ticket.created_by, title: "Ticket Assigned", message: `Ticket ${ticket?.ticket_number} has been assigned to a team member`, type: "info", related_ticket_id: params.id });
          if (notifError2) console.error("[assignTicket] Notification error:", notifError2.message);
        }
        const { error: auditError } = await uSupabase.from("audit_logs").insert({ user_id: params.assignedBy, action: "Assigned", module: "Tickets", details: `Assigned ${ticket?.ticket_number} to user`, ip_address: null });
        if (auditError) console.error("[assignTicket] Audit log error:", auditError.message);
        return NextResponse.json({ data });
      }

      case "escalateTicket": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { data: ticket, error: fetchError } = await uSupabase
          .from("tickets")
          .select("ticket_number, created_by, assigned_to")
          .eq("id", params.id)
          .single();
        if (fetchError) throw new Error(`Failed to fetch ticket: ${fetchError.message}`);
        const { data, error } = await uSupabase
          .from("tickets")
          .update({ status: "Escalated", sla_breached: true, updated_at: new Date().toISOString() })
          .eq("id", params.id)
          .select()
          .single();
        if (error) throw new Error(`Failed to escalate ticket: ${error.message}`);
        const { error: historyError } = await uSupabase.from("ticket_status_history").insert({ ticket_id: params.id, new_status: "escalated", changed_by: params.escalatedBy, notes: params.reason });
        if (historyError) console.error("[escalateTicket] History error:", historyError.message);
        // Notify ticket creator and assignee
        const notifyUsers = new Set<string>();
        if (ticket?.created_by) notifyUsers.add(ticket.created_by);
        if (ticket?.assigned_to && ticket.assigned_to !== params.escalatedBy) notifyUsers.add(ticket.assigned_to);
        if (notifyUsers.size > 0) {
          const { error: notifError } = await uSupabase.from("notifications").insert(
            Array.from(notifyUsers).map((uid) => ({
              user_id: uid,
              title: "Ticket Escalated",
              message: `Ticket ${ticket?.ticket_number} has been escalated: ${params.reason}`,
              type: "warning",
              related_ticket_id: params.id,
            }))
          );
          if (notifError) console.error("[escalateTicket] Notification error:", notifError.message);
        }
        const { error: auditError } = await uSupabase.from("audit_logs").insert({ user_id: params.escalatedBy, action: "Escalated", module: "Tickets", details: `Escalated ${ticket?.ticket_number}: ${params.reason}`, ip_address: null });
        if (auditError) console.error("[escalateTicket] Audit log error:", auditError.message);
        return NextResponse.json({ data });
      }

      // ==================== COMMENTS ====================
      case "getTicketComments": {
        const uSupabase = token ? authenticatedClient(token) : supabase;
        const { data, error } = await uSupabase
          .from("ticket_comments")
          .select("*, users(full_name)")
          .eq("ticket_id", params.ticketId)
          .order("created_at");
        if (error) throw new Error(`Failed to load comments: ${error.message}`);
        return NextResponse.json({ data });
      }

      case "addTicketComment": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { data, error } = await uSupabase
          .from("ticket_comments")
          .insert({ ticket_id: params.ticketId, user_id: params.userId, content: params.content, is_internal: params.isInternal || false })
          .select()
          .single();
        if (error) throw new Error(`Failed to add comment: ${error.message}`);
        const { data: user } = await uSupabase.from("users").select("full_name").eq("id", params.userId).single();
        const { data: ticket } = await uSupabase.from("tickets").select("ticket_number").eq("id", params.ticketId).single();
        const { error: auditError } = await uSupabase.from("audit_logs").insert({ user_id: params.userId, action: "Commented", module: "Tickets", details: `Commented on ${ticket?.ticket_number || params.ticketId}`, ip_address: null });
        if (auditError) console.error("[addTicketComment] Audit log error:", auditError.message);
        return NextResponse.json({ data: { ...data, users: { full_name: user?.full_name || "Unknown" } } });
      }

      // ==================== HISTORY ====================
      case "getTicketHistory": {
        const uSupabase = token ? authenticatedClient(token) : supabase;
        const { data, error } = await uSupabase
          .from("ticket_status_history")
          .select("*, users(full_name)")
          .eq("ticket_id", params.ticketId)
          .order("created_at", { ascending: false });
        if (error) throw new Error(`Failed to load history: ${error.message}`);
        return NextResponse.json({ data });
      }

      // ==================== ATTACHMENTS ====================
      case "getTicketAttachments": {
        const uSupabase = token ? authenticatedClient(token) : supabase;
        const { data, error } = await uSupabase
          .from("ticket_attachments")
          .select("*, users(full_name)")
          .eq("ticket_id", params.ticketId)
          .order("created_at", { ascending: false });
        if (error) throw new Error(`Failed to load attachments: ${error.message}`);
        return NextResponse.json({ data });
      }

      // ==================== NOTIFICATIONS ====================
      case "getNotifications": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { data, error } = await uSupabase
          .from("notifications")
          .select("*")
          .eq("user_id", params.userId)
          .order("created_at", { ascending: false });
        if (error) throw new Error(`Failed to load notifications: ${error.message}`);
        return NextResponse.json({ data });
      }

      case "markNotificationRead": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { error } = await uSupabase.from("notifications").update({ is_read: true }).eq("id", params.id);
        if (error) throw new Error(`Failed to update notification: ${error.message}`);
        return NextResponse.json({ ok: true });
      }

      case "markAllNotificationsRead": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { error } = await uSupabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", params.userId)
          .eq("is_read", false);
        if (error) throw new Error(`Failed to update notifications: ${error.message}`);
        return NextResponse.json({ ok: true });
      }

      case "deleteNotification": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { error } = await uSupabase.from("notifications").delete().eq("id", params.id);
        if (error) throw new Error(`Failed to delete notification: ${error.message}`);
        return NextResponse.json({ ok: true });
      }

      // ==================== AUDIT LOGS ====================
      case "createAuditLog": {
        if (!token) throw new Error("Authentication required.");
        const uSupabase = authenticatedClient(token);
        const { error } = await uSupabase.from("audit_logs").insert({
          user_id: params.userId,
          action: params.action,
          module: params.module,
          details: params.details,
          ip_address: null,
        });
        if (error) console.error("[createAuditLog] Error:", error.message);
        return NextResponse.json({ ok: true });
      }

      case "getAuditLogs": {
        const uSupabase = token ? authenticatedClient(token) : supabase;
        let query = uSupabase
          .from("audit_logs")
          .select("*, users(full_name)")
          .order("created_at", { ascending: false });
        if (params.action) query = query.eq("action", params.action);
        if (params.module) query = query.eq("module", params.module);
        if (params.user_id) query = query.eq("user_id", params.user_id);
        const { data, error } = await query;
        if (error) throw new Error(`Failed to load audit logs: ${error.message}`);
        return NextResponse.json({ data });
      }

      // ==================== REPORTS ====================
      case "getDepartmentReport": {
        const { data, error } = await supabase
          .from("departments")
          .select("*, tickets(*)")
          .eq("is_active", true);
        if (error) throw error;
        return NextResponse.json({ data });
      }

      case "getUserReport": {
        const { data, error } = await supabase
          .from("users")
          .select("*, tickets!tickets_created_by_fkey(*)")
          .eq("is_active", true);
        if (error) throw error;
        return NextResponse.json({ data });
      }

      // ==================== DIAGNOSTICS ====================
      case "diagnose": {
        console.log("[diagnose] Running diagnostics...");
        const results: Record<string, unknown> = {
          envVars: envStatus,
          serviceKeyAvailable: !!getSupabaseServiceKey(),
          anonKeyAvailable: !!getSupabaseAnonKey(),
          urlAvailable: !!getSupabaseUrl(),
        };

        // Test users table
        try {
          const { count: userCount, error: userErr } = await supabase
            .from("users")
            .select("id", { count: "exact", head: true });
          results.usersTable = { accessible: !userErr, count: userCount, error: userErr?.message || null };
        } catch (e) {
          results.usersTable = { accessible: false, error: String(e) };
        }

        // Test departments table
        try {
          const { count: deptCount, error: deptErr } = await supabase
            .from("departments")
            .select("id", { count: "exact", head: true });
          results.departmentsTable = { accessible: !deptErr, count: deptCount, error: deptErr?.message || null };
        } catch (e) {
          results.departmentsTable = { accessible: false, error: String(e) };
        }

        // Test auth
        try {
          const { data: authTest, error: authErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
          results.authUsers = { accessible: !authErr, count: authTest?.users?.length ?? "unknown", error: authErr?.message || null };
        } catch (e) {
          results.authUsers = { accessible: false, error: String(e) };
        }

        console.log("[diagnose] Results:", JSON.stringify(results, null, 2));
        return NextResponse.json({ data: results });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error(`[API] Error in action "${action}":`, error);
    let message = "An unexpected error occurred. Please try again.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "object" && error !== null && "message" in error) {
      message = String((error as { message: unknown }).message);
    } else if (typeof error === "string") {
      message = error;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
