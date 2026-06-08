import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/server-supabase";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    const missing = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    console.error("[Supabase] Upload API not configured. Env vars:", missing);
    return NextResponse.json(
      { error: "Supabase not configured", missing },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const ticketId = formData.get("ticketId") as string;
    const uploadedBy = formData.get("uploadedBy") as string;

    if (!file || !ticketId) {
      return NextResponse.json({ error: "Missing file or ticketId" }, { status: 400 });
    }

    const supabase = getServerSupabase();
    const filePath = `ticket-${ticketId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("ticket-attachments")
      .upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("ticket-attachments")
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from("ticket_attachments")
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: urlData.publicUrl,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: uploadedBy,
      action: "Uploaded",
      module: "Tickets",
      details: `Attached ${file.name} to ticket`,
      ip_address: null,
    });

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
