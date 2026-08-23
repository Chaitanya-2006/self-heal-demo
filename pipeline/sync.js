// ============================================================
// EXTRACTLY  ·  sync.js
// Triggers Bright Data scraper, polls results, and upserts events
// ============================================================
// Usage:
//   node sync.js [COLLECTOR_ID_OR_JSON_PATH]
//
// Environment variables (.env):
//   BRIGHTDATA_API_KEY=your-brightdata-api-token
//   BRIGHTDATA_COLLECTOR_ID=your-collector-id  (or pass as CLI arg)
//   SUPABASE_URL=https://your-project.supabase.co
//   SUPABASE_KEY=your-supabase-key
// ============================================================

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from "fs";
import path from "path";
import os from "os";

function getSupabaseConfig() {
  let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  let key = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if ((!url || !key) && fs.existsSync(path.resolve("frontend/.env"))) {
    try {
      const content = fs.readFileSync(path.resolve("frontend/.env"), "utf8");
      content.split("\n").forEach((line) => {
        const [k, ...v] = line.split("=");
        if (k && v.length) {
          const val = v.join("=").trim();
          if (k.trim() === "VITE_SUPABASE_URL" && !url) url = val;
          if (k.trim() === "VITE_SUPABASE_ANON_KEY" && !key) key = val;
        }
      });
    } catch {}
  }
  return { url, key };
}

const { url: SUPABASE_URL, key: SUPABASE_KEY } = getSupabaseConfig();

// Try reading API key from brightdata-cli credentials if not in env
function getBrightDataApiKey() {
  if (
    process.env.BRIGHTDATA_API_KEY ||
    process.env.BRIGHT_DATA_API_KEY ||
    process.env.BRIGHTDATA_TOKEN ||
    process.env.API_KEY
  ) {
    return (
      process.env.BRIGHTDATA_API_KEY ||
      process.env.BRIGHT_DATA_API_KEY ||
      process.env.BRIGHTDATA_TOKEN ||
      process.env.API_KEY
    );
  }
  try {
    const credPath = path.join(
      os.homedir(),
      "AppData",
      "Roaming",
      "brightdata-cli",
      "credentials.json"
    );
    if (fs.existsSync(credPath)) {
      const creds = JSON.parse(fs.readFileSync(credPath, "utf8"));
      return creds.api_token || creds.token || creds.key || null;
    }
  } catch {}
  return null;
}

const BRIGHTDATA_API_KEY = getBrightDataApiKey();

const COLLECTOR_ID =
  process.argv[2] ||
  process.env.BRIGHTDATA_COLLECTOR_ID ||
  process.env.COLLECTOR_ID ||
  process.env.BRIGHT_DATA_COLLECTOR_ID;

// Fake seed event names to clean up after sync
export const SEED_EVENT_NAMES = [
  "Stand-Up Saturday ft. Biswa Kalyan Rath",
  "Jazz & Blues Night",
  "NCPA International Music Festival",
  "Indie Film Screening — Lunchbox Redux",
  "Open-Mic Poetry Slam",
];

// Venue coordinates map
const VENUE_COORDS = {
  "the habitat": { lat: 19.0688, lng: 72.8347 },
  "royal opera house": { lat: 18.9554, lng: 72.8184 },
  "jehangir art gallery": { lat: 18.9275, lng: 72.8322 },
  "g5a foundation": { lat: 18.9986, lng: 72.8257 },
  "ncpa": { lat: 18.926, lng: 72.8205 },
  "harkat studios": { lat: 19.1317, lng: 72.8262 },
};

// ── Validation ──────────────────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌  Missing SUPABASE_URL or SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helper: Format Dates to YYYY-MM-DD ───────────────────────
function normalizeDate(rawDate) {
  if (!rawDate) {
    return new Date().toISOString().split("T")[0];
  }
  const str = String(rawDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  // If text like "Daily", "Every Friday", etc., use today's date
  return new Date().toISOString().split("T")[0];
}

// ── Helper: Normalize Event Object ──────────────────────────
function parseEventItem(raw, index) {
  const name =
    raw.event_name ||
    raw.name ||
    raw.title ||
    raw.eventTitle ||
    raw.eventName;

  const venue =
    raw.venue_name ||
    raw.venue ||
    raw.location ||
    raw.venueName ||
    raw.place ||
    "Mumbai Arts Venue";

  const rawDate =
    raw.event_date ||
    raw.date ||
    raw.eventDate ||
    raw.startDate ||
    raw.datetime;

  const date = normalizeDate(rawDate);

  if (!name || !String(name).trim()) {
    return { error: `Item #${index + 1}: Missing event_name/title` };
  }
  if (!venue || !String(venue).trim()) {
    return { error: `Item #${index + 1} ("${name}"): Missing venue_name/location` };
  }

  // Lookup coordinates based on venue name
  let lat = null;
  let lng = null;
  const vLower = venue.toLowerCase();
  for (const [key, coords] of Object.entries(VENUE_COORDS)) {
    if (vLower.includes(key)) {
      lat = coords.lat;
      lng = coords.lng;
      break;
    }
  }

  // Override with raw coords if available
  const rawLat = raw.lat ?? raw.latitude ?? null;
  const rawLng = raw.lng ?? raw.lon ?? raw.longitude ?? null;
  if (rawLat !== null && !isNaN(parseFloat(rawLat))) lat = parseFloat(rawLat);
  if (rawLng !== null && !isNaN(parseFloat(rawLng))) lng = parseFloat(rawLng);

  // Derive category if not provided
  let category = raw.category || raw.genre || raw.niche;
  if (!category) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("comedy") || nameLower.includes("standup") || nameLower.includes("improv")) {
      category = "Comedy";
    } else if (nameLower.includes("music") || nameLower.includes("tribute") || nameLower.includes("acoustic") || nameLower.includes("concert")) {
      category = "Music";
    } else if (nameLower.includes("poetry") || nameLower.includes("spoken word") || nameLower.includes("slam")) {
      category = "Poetry";
    } else if (nameLower.includes("theatre") || nameLower.includes("play") || nameLower.includes("show")) {
      category = "Theatre";
    } else if (nameLower.includes("art") || nameLower.includes("exhibition") || nameLower.includes("gallery")) {
      category = "Exhibitions";
    } else {
      category = "Arts & Culture";
    }
  }

  return {
    data: {
      event_name: String(name).trim(),
      venue_name: String(venue).trim(),
      event_date: date,
      event_time: raw.event_time || raw.time || raw.eventTime || null,
      category,
      description: raw.description || raw.desc || raw.about || null,
      image_url: raw.image_url || raw.image || raw.img || raw.banner || null,
      ticket_link:
        raw.ticket_link ||
        raw.ticket_url ||
        raw.tickets ||
        raw.booking_link ||
        raw.ticketLink ||
        null,
      source_url: raw.source_url || raw.url || raw.link || raw.source || raw.input?.url || null,
      lat,
      lng,
    },
  };
}

// ── Step 1: Trigger Bright Data Scraper ──────────────────────
async function triggerScraper(collectorId, apiKey) {
  console.log(`🚀  Triggering Bright Data Collector ID: ${collectorId}...`);

  const triggerUrl = `https://api.brightdata.com/dca/trigger?collector=${encodeURIComponent(
    collectorId
  )}&queue_next=1`;

  const response = await fetch(triggerUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{}]),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Bright Data trigger failed with HTTP ${response.status}: ${errText}`
    );
  }

  const result = await response.json();
  const responseId =
    result.response_id || result.collection_id || result.snapshot_id || result.id;

  if (!responseId) {
    throw new Error(
      `No response_id returned from Bright Data trigger: ${JSON.stringify(result)}`
    );
  }

  console.log(`✅  Triggered successfully. Response ID: ${responseId}`);
  return responseId;
}

// ── Step 2: Poll Bright Data Results with 2-Minute Timeout ────
async function pollResults(responseId, apiKey) {
  console.log(`⏳  Polling scraper results for Response ID: ${responseId}...`);

  const startTime = Date.now();
  const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes timeout
  const POLL_INTERVAL_MS = 5000; // 5 seconds interval

  const getResultUrl = `https://api.brightdata.com/dca/get_result?response_id=${encodeURIComponent(
    responseId
  )}`;

  while (Date.now() - startTime < TIMEOUT_MS) {
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);

    const response = await fetch(getResultUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.status === 202) {
      console.log(`   Scraping in progress... (${elapsedSec}s elapsed)`);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }

    if (response.status === 200) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => JSON.parse(line));
      }

      if (
        data &&
        !Array.isArray(data) &&
        (data.status === "building" || data.status === "running" || data.status === "pending")
      ) {
        console.log(
          `   Scraper status: ${data.status}... (${elapsedSec}s elapsed)`
        );
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        continue;
      }

      const resultsArray = Array.isArray(data) ? data : [data];
      console.log(`✅  Scraping complete! Received ${resultsArray.length} items.\n`);
      return resultsArray;
    }

    const errBody = await response.text();
    throw new Error(
      `Bright Data get_result failed with HTTP ${response.status}: ${errBody}`
    );
  }

  throw new Error(
    "❌  Scraping timed out after 2 minutes. Bright Data collector did not finish in time."
  );
}

// ── Step 3 & 4: Upsert Events into Supabase ──────────────────
export async function upsertEvents(rawItems) {
  console.log(`💾  Upserting events into Supabase 'events' table...`);

  // Flatten nested event lists if any
  const flatItems = [];
  rawItems.forEach((item) => {
    if (Array.isArray(item.events)) {
      item.events.forEach((nested) => {
        flatItems.push({ ...nested, input: item.input || nested.input });
      });
    } else {
      flatItems.push(item);
    }
  });

  // Fetch existing events to match on event_name + venue_name + event_date
  const { data: existingRows, error: fetchErr } = await supabase
    .from("events")
    .select("id, event_name, venue_name, event_date");

  if (fetchErr) {
    throw new Error(`Failed to query existing events: ${fetchErr.message}`);
  }

  // Create lookup map: "name|venue|date" -> existing id
  const existingMap = new Map();
  (existingRows || []).forEach((row) => {
    const key = `${row.event_name.toLowerCase().trim()}|${row.venue_name
      .toLowerCase()
      .trim()}|${row.event_date}`;
    existingMap.set(key, row.id);
  });

  let insertedCount = 0;
  let updatedCount = 0;
  const failedRows = [];

  for (let i = 0; i < flatItems.length; i++) {
    const parsed = parseEventItem(flatItems[i], i);

    if (parsed.error) {
      failedRows.push(parsed.error);
      continue;
    }

    const event = parsed.data;
    const lookupKey = `${event.event_name.toLowerCase()}|${event.venue_name.toLowerCase()}|${event.event_date}`;
    const existingId = existingMap.get(lookupKey);

    if (existingId) {
      const { error: updateErr } = await supabase
        .from("events")
        .update(event)
        .eq("id", existingId);

      if (updateErr) {
        failedRows.push(
          `Update failed for "${event.event_name}": ${updateErr.message}`
        );
      } else {
        updatedCount++;
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("events")
        .insert([event])
        .select("id");

      if (insertErr) {
        failedRows.push(
          `Insert failed for "${event.event_name}": ${insertErr.message}`
        );
      } else {
        insertedCount++;
        if (inserted && inserted[0]) {
          existingMap.set(lookupKey, inserted[0].id);
        }
      }
    }
  }

  return { insertedCount, updatedCount, failedRows };
}

// ── Clean Up Fake Seed Rows ──────────────────────────────────
export async function deleteSeedRows() {
  console.log(`\n🧹  Deleting 5 fake demo seed rows from 'events' table...`);
  const { data: deleted, error } = await supabase
    .from("events")
    .delete()
    .in("event_name", SEED_EVENT_NAMES)
    .select("id, event_name");

  if (error) {
    console.error("⚠️  Failed to delete fake seed rows:", error.message);
  } else {
    console.log(`✅  Deleted ${deleted?.length || 0} fake seed rows.`);
  }

  // Verification query
  const { data: remaining, error: queryErr } = await supabase
    .from("events")
    .select("id, event_name, event_date, venue_name, category")
    .order("event_date", { ascending: true });

  if (queryErr) {
    console.error("❌  Verification query failed:", queryErr.message);
  } else {
    console.log(`\n📋  Current Table State (${remaining.length} live events):`);
    console.log(
      "  #  | Event Name                                  | Date       | Venue"
    );
    console.log("  " + "-".repeat(90));
    remaining.forEach((r, i) => {
      const name = r.event_name.padEnd(43).substring(0, 43);
      console.log(
        `  ${String(i + 1).padStart(2)} | ${name} | ${r.event_date} | ${r.venue_name}`
      );
    });
  }
}

// ── Main Orchestrator ────────────────────────────────────────
async function main() {
  console.log("============================================================");
  console.log("  EXTRACTLY · Live Event Scraper & Database Sync Pipeline   ");
  console.log("============================================================\n");

  const target = COLLECTOR_ID;

  let rawItems;

  if (target && (target.endsWith(".json") || fs.existsSync(target))) {
    console.log(`📂  Loading events from local JSON file: ${target}...`);
    rawItems = JSON.parse(fs.readFileSync(target, "utf8"));
  } else if (target && target.startsWith("c_")) {
    if (!BRIGHTDATA_API_KEY) {
      console.error("❌  BRIGHTDATA_API_KEY is not configured in .env or brightdata-cli");
      process.exit(1);
    }
    const responseId = await triggerScraper(target, BRIGHTDATA_API_KEY);
    rawItems = await pollResults(responseId, BRIGHTDATA_API_KEY);
  } else {
    // Default to syncing all clean verified outputs
    const allVenuesPath = path.resolve("docs/all-venues-final.json");
    if (fs.existsSync(allVenuesPath)) {
      console.log(`📂  Syncing all verified venues from: ${allVenuesPath}...`);
      rawItems = JSON.parse(fs.readFileSync(allVenuesPath, "utf8"));
    } else {
      console.error("❌  Please provide a Collector ID or path to JSON file.");
      process.exit(1);
    }
  }

  try {
    const summary = await upsertEvents(rawItems);

    console.log("\n============================================================");
    console.log("📊  SYNC SUMMARY");
    console.log("============================================================");
    console.log(`✅  Rows Inserted: ${summary.insertedCount}`);
    console.log(`🔄  Rows Updated:  ${summary.updatedCount}`);
    console.log(`⚠️  Rows Failed:   ${summary.failedRows.length}`);

    if (summary.failedRows.length > 0) {
      console.log("\nFailed Items Details:");
      summary.failedRows.forEach((msg, idx) => {
        console.log(`  ${idx + 1}. ${msg}`);
      });
    }
    console.log("============================================================\n");

    await deleteSeedRows();

    console.log("\n🎉  Sync and database cleanup completed successfully!");
  } catch (err) {
    console.error("\n❌  Sync Pipeline Error:", err.message);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith("sync.js")) {
  main();
}
