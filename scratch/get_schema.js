import { createClient } from "@supabase/supabase-js";
const SUPA_URL = "https://afftspqsbojqvjidpidz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZnRzcHFzYm9qcXZqaWRwaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDQ2OTQsImV4cCI6MjA4OTg4MDY5NH0.Rpyz7l7YQjm5wNsBMiKwotozMgLIoWGdrPGE2lD8RoM";
const db = createClient(SUPA_URL, SUPA_KEY);

async function run() {
  const { data, error } = await db.from("return_cases").select("*").limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Keys in return_cases:", data.length > 0 ? Object.keys(data[0]) : "No data");
    console.log("Sample row:", data[0]);
  }
}
run();
