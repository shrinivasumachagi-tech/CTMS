-- Diagnostic function: returns auth.uid() so we can call it via supabase.rpc('auth_uid')
-- from the API. Run this once in Supabase SQL Editor, then check Netlify function logs
-- for "auth_uid() RPC result".
CREATE OR REPLACE FUNCTION public.auth_uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;
