import { NextResponse } from "next/server";
import { getAuthenticatedSupabase, getSupabaseUrl, getSupabaseAnonKey } from "@/lib/server-supabase";
import type { Database } from "@/lib/database.types";

function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = 4 - (base64.length % 4);
    const padded = pad < 4 ? base64 + "=".repeat(pad) : base64;
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const L: string[] = [];
  const log = (m: string) => { console.log(m); L.push(m); };

  try {
    log("=== DEBUG-TICKET ENDPOINT ===");

    // 1. Authorization header
    const authHeader = request.headers.get("authorization");
    log(`authorization header present: ${!!authHeader}`);
    if (authHeader) log(`authorization header starts with Bearer: ${authHeader.startsWith("Bearer ")}`);

    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    log(`bearer token extracted: ${!!token}`);

    if (!token) {
      return NextResponse.json({
        diagnostics: { authorization: { present: false } },
        logs: L,
      });
    }
    log(`token length: ${token.length}`);
    log(`token first 20: ${token.slice(0, 20)}`);
    log(`token last 5: ${token.slice(-5)}`);

    // 2. Decode JWT payload
    const jwt = decodeJWTPayload(token);
    log(`jwt decoded: ${!!jwt}`);
    if (jwt) {
      for (const [k, v] of Object.entries(jwt)) {
        log(`  jwt.${k}: ${JSON.stringify(v)}`);
      }
    }

    // 3. Authenticated client (same as /api/supabase)
    const client = getAuthenticatedSupabase(token);
    log(`client created: ${!!client}`);

    // 4. supabase.auth.getUser()
    log("--- auth.getUser() ---");
    const { data: gu, error: ge } = await client.auth.getUser();
    log(`getUser user: ${gu?.user ? JSON.stringify({ id: gu.user.id, email: gu.user.email, role: gu.user.role, aud: gu.user.aud }) : "null"}`);
    log(`getUser error: ${ge ? JSON.stringify({ message: ge.message, status: ge.status }) : "null"}`);

    const uid = gu?.user?.id || null;
    const uemail = gu?.user?.email || null;

    // 5. Self-select from users (tests connectivity + basic RLS on SELECT)
    log("--- self-select from users ---");
    if (uid) {
      const { data: sd, error: se } = await client.from("users").select("id, email, role").eq("id", uid).maybeSingle();
      log(`self-select data: ${JSON.stringify(sd)}`);
      log(`self-select error: ${se ? JSON.stringify({ message: se.message, code: se.code, details: se.details, hint: se.hint }) : "null"}`);
    }

    // 6. Minimal ticket insert (via client)
    log("--- ticket insert (via authenticatedClient) ---");
    const ticketNumber = `DBG-${Date.now()}`;
    const payload = {
      ticket_number: ticketNumber,
      title: "Diagnostic insert — see description",
      description: `Created at ${new Date().toISOString()} by uid=${uid}`,
    } as Database["public"]["Tables"]["tickets"]["Insert"];
    if (uid) payload.created_by = uid;

    log(`payload: ${JSON.stringify(payload)}`);

    const { data: idata, error: ierr } = await client.from("tickets").insert(payload).select();
    log(`insert data: ${JSON.stringify(idata)}`);
    log(`insert error message: ${ierr?.message ?? "null"}`);
    log(`insert error code: ${ierr?.code ?? "null"}`);
    log(`insert error details: ${ierr?.details ?? "null"}`);
    log(`insert error hint: ${ierr?.hint ?? "null"}`);

    // 7. Only if client insert failed: raw fetch comparison
    let rawResult: Record<string, unknown> | null = null;
    if (ierr) {
      log("--- ticket insert (via raw fetch, comparison) ---");
      try {
        const restUrl = `${getSupabaseUrl()}/rest/v1/tickets`;
        const rawResp = await fetch(restUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation",
            apikey: getSupabaseAnonKey(),
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const rawBody = await rawResp.json();
        rawResult = {
          status: rawResp.status,
          statusText: rawResp.statusText,
          body: rawBody,
        };
        log(`raw fetch status: ${rawResp.status}`);
        log(`raw fetch body: ${JSON.stringify(rawBody)}`);
        if (!rawResp.ok) {
          log(`raw error message: ${rawBody?.error?.message ?? "null"}`);
          log(`raw error code: ${rawBody?.error?.code ?? "null"}`);
          log(`raw error details: ${rawBody?.error?.details ?? "null"}`);
          log(`raw error hint: ${rawBody?.error?.hint ?? "null"}`);
        }
        log(`raw fetch response headers: ${JSON.stringify(Object.fromEntries(rawResp.headers.entries()))}`);
      } catch (fetchErr) {
        const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
        log(`raw fetch threw: ${msg}`);
        rawResult = { error: msg };
      }
    }

    const diagnostics = {
      authorization: {
        headerPresent: !!authHeader,
        bearerPrefix: authHeader?.startsWith("Bearer "),
        tokenExtracted: !!token,
        tokenLength: token?.length,
      },
      jwtDecoded: jwt,
      getUser: {
        user: gu?.user
          ? { id: gu.user.id, email: gu.user.email, role: gu.user.role, aud: gu.user.aud }
          : null,
        error: ge ? { message: ge.message, status: ge.status } : null,
      },
      selfSelect: uid
        ? null
        : "skipped (no uid from getUser)",
      ticketInsert: {
        authUid: uid,
        authEmail: uemail,
        payload,
        viaClient: {
          data: idata,
          error: ierr
            ? { message: ierr.message, code: ierr.code, details: ierr.details, hint: ierr.hint }
            : null,
        },
        viaRawFetch: rawResult,
      },
      inference: makeInference({ jwt, gu: gu?.user, ge, ierr }),
    };

    return NextResponse.json({ diagnostics, logs: L });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    L.push(`UNEXPECTED ERROR: ${msg}`);
    return NextResponse.json({ error: msg, logs: L }, { status: 500 });
  }
}

function makeInference(opts: {
  jwt: Record<string, unknown> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gu: any;
  ge: { message: string } | null;
  ierr: { message: string; code: string; details: string; hint: string } | null;
}): string[] {
  const lines: string[] = [];
  const { jwt, gu, ge, ierr } = opts;

  const role = (jwt?.role as string) ?? null;
  const iss = (jwt?.iss as string) ?? null;

  if (!jwt) lines.push("FAIL: JWT could not be decoded — is the token malformed?");
  else {
    if (role === "authenticated") lines.push("OK: JWT role claim is 'authenticated' (auth.uid() should work)");
    else lines.push(`SUSPECT: JWT role claim is '${role}' — should be 'authenticated' for auth.uid() to populate`);
    if (iss) lines.push(`JWT issuer: ${iss}`);
  }

  if (ge) lines.push(`FAIL: auth.getUser() returned error — JWT rejected by Supabase Auth: ${ge.message}`);
  else if (gu) lines.push(`OK: auth.getUser() succeeded for user ${gu.id} (role=${gu.role})`);
  else lines.push("WARN: auth.getUser() returned null user with no error?");

  if (ierr) {
    lines.push(`FAIL: INSERT rejected — code=${ierr.code}, message=${ierr.message}`);
    if (ierr.details) lines.push(`  details: ${ierr.details}`);
    if (ierr.hint) lines.push(`  hint: ${ierr.hint}`);

    if (ierr.code === "42501" || ierr.message?.toLowerCase().includes("row-level security") || ierr.message?.toLowerCase().includes("policy")) {
      if (role !== "authenticated") {
        lines.push("ROOT CAUSE: JWT role claim mismatch — role is '${role}', expected 'authenticated'. Check SUPABASE_JWT_SECRET matches the project's JWT secret in Supabase dashboard > Settings > API > JWT Secret.");
      } else if (iss) {
        const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        if (iss !== url.replace(/\/$/, "")) {
          lines.push("ROOT CAUSE: JWT issuer (iss) does not match SUPABASE_URL — the JWT was issued by a different Supabase project than the one being queried.");
        } else {
          lines.push("POSSIBLE: JWT role is correct and issuer matches, but auth.uid() still NULL. Check if request.jwt-claim-role is being mapped correctly by PostgREST. See Supabase docs on JWT verification.");
        }
      } else {
        lines.push("SUSPECT: Cannot determine issuer from JWT — check SUPABASE_JWT_SECRET and project configuration.");
      }
    } else if (ierr.code === "23503") {
      lines.push("NOTE: Foreign key violation (not an RLS issue). The created_by or department_id reference may not exist.");
    } else if (ierr.code === "23505") {
      lines.push("NOTE: Unique constraint violation (duplicate ticket_number). Not an RLS issue.");
    }
  } else {
    lines.push("OK: INSERT succeeded — auth.uid() was populated and RLS allowed the write.");
  }

  return lines;
}
