import { createClient } from "@supabase/supabase-js";
const SUPA_URL = "https://afftspqsbojqvjidpidz.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZnRzcHFzYm9qcXZqaWRwaWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDQ2OTQsImV4cCI6MjA4OTg4MDY5NH0.Rpyz7l7YQjm5wNsBMiKwotozMgLIoWGdrPGE2lD8RoM";
const db = createClient(SUPA_URL, SUPA_KEY);

async function run() {
  // Let's try to run a common SQL execution function if it exists
  try {
    const { data, error } = await db.rpc("exec_sql", { sql: "SELECT 1" });
    console.log("exec_sql exists:", !error, data, error);
  } catch (e) {
    console.log("exec_sql failed:", e);
  }
}
run();
