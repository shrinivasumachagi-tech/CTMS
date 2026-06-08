import { NextResponse } from "next/server";
import { getServerSupabase, isSupabaseConfigured } from "@/lib/server-supabase";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
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
