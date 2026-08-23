// ============================================================
// EXTRACTLY  ·  seed.js
// Inserts 5 sample Mumbai events into the "events" table
// ============================================================
// Usage:
//   1. Copy .env.example → .env and fill in your Supabase creds
//   2. npm install
//   3. node seed.js
// ============================================================

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "❌  Missing SUPABASE_URL or SUPABASE_KEY in .env — see .env.example"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Sample Mumbai events (demo/seed data) ───────────────────
const events = [
  {
    event_name: "Stand-Up Saturday ft. Biswa Kalyan Rath",
    event_date: "2026-09-05",
    event_time: "20:00",
    venue_name: "The Habitat, Khar",
    category: "Comedy",
    description:
      "A night of stand-up comedy featuring Biswa Kalyan Rath with special guest appearances from rising Mumbai comics.",
    image_url:
      "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600",
    ticket_link: "https://insider.in/standupsat-sep2026",
    source_url: "https://insider.in",
    lat: 19.0707,
    lng: 72.8346,
  },
  {
    event_name: "Jazz & Blues Night",
    event_date: "2026-09-12",
    event_time: "19:30",
    venue_name: "G5A Foundation for Contemporary Culture",
    category: "Music",
    description:
      "An intimate evening of jazz and blues performances in one of Mumbai's most iconic cultural spaces.",
    image_url:
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
    ticket_link: "https://insider.in/jazznblues-sep2026",
    source_url: "https://insider.in",
    lat: 19.0048,
    lng: 72.8226,
  },
  {
    event_name: "NCPA International Music Festival",
    event_date: "2026-09-20",
    event_time: "18:00",
    venue_name: "NCPA, Nariman Point",
    category: "Music",
    description:
      "The annual international music festival at NCPA showcasing classical and contemporary performances from around the world.",
    image_url:
      "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600",
    ticket_link: "https://ncpamumbai.com/intl-music-fest",
    source_url: "https://ncpamumbai.com",
    lat: 18.9256,
    lng: 72.8215,
  },
  {
    event_name: "Indie Film Screening — Lunchbox Redux",
    event_date: "2026-09-28",
    event_time: "17:00",
    venue_name: "Prithvi Theatre, Juhu",
    category: "Film",
    description:
      "A special screening of the restored director's cut followed by a Q&A with the cast and crew.",
    image_url:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
    ticket_link: "https://bookmyshow.com/lunchbox-redux",
    source_url: "https://bookmyshow.com",
    lat: 19.1035,
    lng: 72.8283,
  },
  {
    event_name: "Open-Mic Poetry Slam",
    event_date: "2026-10-03",
    event_time: "21:00",
    venue_name: "antiSOCIAL, Lower Parel",
    category: "Literature",
    description:
      "Mumbai's biggest open-mic poetry slam — sign up on the spot or just come to watch spoken word performances.",
    image_url:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600",
    ticket_link: "https://insider.in/poetryslam-oct2026",
    source_url: "https://insider.in",
    lat: 18.9933,
    lng: 72.8309,
  },
];

// ── Idempotent seed: delete existing seed data, then re-insert ──
async function seed() {
  console.log("⏳  Seeding 'events' table with 5 sample Mumbai events...\n");

  // Clear any previously seeded rows to avoid duplicates on re-run
  const { error: deleteErr } = await supabase
    .from("events")
    .delete()
    .in(
      "event_name",
      events.map((e) => e.event_name)
    );

  if (deleteErr) {
    console.warn("⚠️  Could not clear previous seed data:", deleteErr.message);
    console.warn("   Continuing with insert...\n");
  }

  // Insert
  const { data: inserted, error: insertErr } = await supabase
    .from("events")
    .insert(events)
    .select();

  if (insertErr) {
    console.error("❌  Insert failed:", insertErr.message);
    process.exit(1);
  }

  console.log(`✅  Inserted ${inserted.length} rows.\n`);

  // Verify by querying back
  const { data: rows, error: queryErr } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (queryErr) {
    console.error("❌  Verification query failed:", queryErr.message);
    process.exit(1);
  }

  console.log(`📋  Verification — ${rows.length} total rows in 'events':\n`);
  console.log(
    "  #  | Event Name                                  | Date       | Venue"
  );
  console.log("  " + "-".repeat(90));
  rows.forEach((r, i) => {
    const name = r.event_name.padEnd(43);
    console.log(
      `  ${String(i + 1).padStart(2)} | ${name} | ${r.event_date} | ${r.venue_name}`
    );
  });

  console.log("\n🎉  Seed complete!");
}

seed();
