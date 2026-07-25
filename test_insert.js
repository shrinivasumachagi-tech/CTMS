const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function test() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const payload = {
    ticket_number: `CMP-TEST-${Date.now()}`,
    title: "Test Ticket",
    description: "Testing RLS",
    category: "IT",
    priority: "Medium",
    status: "Open"
  };

  const { data, error } = await supabase.from("tickets").insert(payload).select();
  if (error) {
    console.error("Service Role Insert Failed:", error.message);
  } else {
    console.log("Service Role Insert Success:", data[0].id);
  }
}

test();
