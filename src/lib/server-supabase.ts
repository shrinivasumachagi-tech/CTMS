import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

if (!isSupabaseConfigured) {
  console.warn("[Supabase] Server client not configured. Missing:", {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey,
    anonKey: !!supabaseAnonKey,
    envUrl: !!process.env.SUPABASE_URL,
    envNextPublicUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    envServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    envAnonKey: !!process.env.SUPABASE_ANON_KEY,
    envNextPublicAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServerSupabase() {
  const key = supabaseServiceKey || supabaseAnonKey;
  return createClient<Database>(supabaseUrl, key);
}
