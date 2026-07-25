import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

export function getSupabaseUrl() { return supabaseUrl; }
export function getSupabaseServiceKey() { return supabaseServiceKey; }
export function getSupabaseAnonKey() { return supabaseAnonKey; }

if (!isSupabaseConfigured) {
  console.warn("[Supabase] Server client not configured. Required env vars: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY). Current:", {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey,
    anonKey: !!supabaseAnonKey,
  });
}

export function getServerSupabase() {
  const key = supabaseServiceKey || supabaseAnonKey;
  const usingServiceRole = !!supabaseServiceKey;
  console.log(`[Supabase] getServerSupabase() using ${usingServiceRole ? "service_role" : "anon"} key`);
  return createClient<Database>(supabaseUrl, key);
}

export function getAuthenticatedSupabase(userAccessToken: string) {
  if (supabaseServiceKey) {
    console.log("[Supabase] getAuthenticatedSupabase() using service_role key (bypasses RLS)");
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
  }
  console.log("[Supabase] getAuthenticatedSupabase() using anon key + user access token");
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    // accessToken callback is the intended way to set the JWT for database operations.
    // fetchWithAuth (SupabaseClient.ts → lib/fetch.ts) calls this on every request and
    // sets Authorization: Bearer <token>. We intentionally do NOT set
    // global.headers.Authorization, because that static header would shadow the
    // dynamic accessToken callback and prevent fetchWithAuth from using it.
    accessToken: async () => userAccessToken,
    global: {
      headers: {
        // apikey is added automatically by fetchWithAuth — no need to set it here.
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
