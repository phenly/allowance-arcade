-- The Allowance Arcade — Supabase schema
-- Run this in your project's Supabase SQL editor
-- (Dashboard → SQL Editor → New query), then run 002_add_total_override.sql.
--
-- NOTE ON SECURITY: the policies below grant full public read/write with no auth.
-- That's fine for a private, single-family instance whose anon key you don't share.
-- Do NOT point a public deployment at a real backend with these policies — anyone
-- with the anon key could read or overwrite your data. The public demo avoids this
-- entirely by running with no backend at all (see VITE_DEMO_MODE in the README).

-- Tracks each calendar week and payday status
CREATE TABLE IF NOT EXISTS weeks (
  week_start DATE PRIMARY KEY, -- Always a Monday, e.g. '2025-03-03'
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  total_earned DECIMAL(10,2),
  baseline_earned DECIMAL(10,2),
  daily_earned DECIMAL(10,2),
  weekly_earned DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Baseline chore checks
-- chore_id: 'bed' | 'room' | 'laundry'
-- day_index: 0=Mon..6=Sun, use -1 for 'laundry' (weekly)
CREATE TABLE IF NOT EXISTS baseline_checks (
  week_start DATE NOT NULL,
  chore_id TEXT NOT NULL,
  day_index INTEGER NOT NULL DEFAULT -1, -- -1 for laundry (once/week), 0-6 for daily
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (week_start, chore_id, day_index)
);

-- Daily bonus chore checks
-- chore_id: 'poop' | 'dish' | 'table'
-- day_index: 0=Mon..6=Sun
CREATE TABLE IF NOT EXISTS daily_bonus_checks (
  week_start DATE NOT NULL,
  chore_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (week_start, chore_id, day_index)
);

-- Weekly bonus chore checks
-- chore_id: 'mow' | 'trash' | 'tp' | 'groceries'
CREATE TABLE IF NOT EXISTS weekly_bonus_checks (
  week_start DATE NOT NULL,
  chore_id TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (week_start, chore_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bonus_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_bonus_checks ENABLE ROW LEVEL SECURITY;

-- Allow full public access (no auth required for v1)
CREATE POLICY "Public access" ON weeks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON baseline_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON daily_bonus_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON weekly_bonus_checks FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for live family sync
ALTER PUBLICATION supabase_realtime ADD TABLE baseline_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_bonus_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE weekly_bonus_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE weeks;
