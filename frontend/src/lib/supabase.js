// ============================================================
// Supabase client for the EXTRACTLY frontend
// Uses Vite's VITE_ env var convention (safe for browser)
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard: createClient throws a hard error when given empty strings,
// which crashes the entire React tree and produces a blank page.
// When env vars are missing (e.g. Vercel before they are configured),
// export null and let App.jsx fall back to local fake-events data.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
