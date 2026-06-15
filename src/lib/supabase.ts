import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (typeof window !== "undefined" && !isSupabaseConfigured) {
  console.error(
    "[Supabase] CLIENT NOT CONFIGURED! Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify env vars. " +
    "Current values:", { url: supabaseUrl || "(empty)", key: supabaseAnonKey ? "(set)" : "(empty)" }
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || "http://localhost:54321",
  supabaseAnonKey || "placeholder-key"
);
