-- =============================================================
-- EXTRACTLY  ·  events table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- =============================================================
-- This creates the events table used by the EXTRACTLY
-- Mumbai Events Dashboard. Safe to run multiple times
-- (uses IF NOT EXISTS).
-- =============================================================

CREATE TABLE IF NOT EXISTS events (
    id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name    text         NOT NULL,
    event_date    date         NOT NULL,
    event_time    text,
    venue_name    text         NOT NULL,
    category      text,
    description   text,
    image_url     text,
    ticket_link   text,
    source_url    text,
    lat           float,
    lng           float,
    created_at    timestamptz  DEFAULT now()
);

-- Index on event_date for fast chronological queries
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
