import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SEED_EVENT_NAMES = [
  "Stand-Up Saturday ft. Biswa Kalyan Rath",
  "Jazz & Blues Night",
  "NCPA International Music Festival",
  "Indie Film Screening — Lunchbox Redux",
  "Open-Mic Poetry Slam",
];

async function cleanup() {
  console.log("🧹  Deleting 5 fake demo seed rows from 'events' table...");
  const { data: deleted, error } = await supabase
    .from("events")
    .delete()
    .in("event_name", SEED_EVENT_NAMES)
    .select("id, event_name");

  if (error) {
    console.error("❌  Failed to delete fake seed rows:", error.message);
    process.exit(1);
  }

  console.log(`✅  Successfully removed ${deleted?.length || 0} fake seed rows.`);

  const { data: remaining, error: queryErr } = await supabase
    .from("events")
    .select("id, event_name, event_date, venue_name, category")
    .order("event_date", { ascending: true });

  if (queryErr) {
    console.error("❌  Verification query failed:", queryErr.message);
  } else {
    console.log(`\n📋  Remaining events in database: ${remaining.length} rows`);
    remaining.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.event_date}] ${r.event_name} @ ${r.venue_name}`);
    });
  }
}

cleanup();
