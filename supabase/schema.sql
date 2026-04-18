-- ─────────────────────────────────────────────────────────────────────────────
-- CA Final Tracker — Supabase Schema
-- Run this once in the Supabase SQL Editor (supabase.com → your project → SQL)
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Profiles ───────────────────────────────────────────────────────────────
-- Stores user display info. One row per authenticated user.

CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name        TEXT,
  exam_date   TEXT DEFAULT '',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);


-- ── 2. User data ──────────────────────────────────────────────────────────────
-- Stores all study data as JSONB — mirrors the existing localStorage structure.
-- One row per user; upserted on every sync.

CREATE TABLE IF NOT EXISTS user_data (
  user_id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  log              JSONB    DEFAULT '[]',
  ch_states        JSONB    DEFAULT '{}',
  rv_states        JSONB    DEFAULT '{}',
  todos            JSONB    DEFAULT '[]',
  targets          JSONB    DEFAULT '{}',
  rewards          JSONB    DEFAULT '[]',
  streak           INTEGER  DEFAULT 0,
  last_study_date  TEXT     DEFAULT '',
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data"
  ON user_data FOR ALL
  USING (auth.uid() = user_id);


-- ── 3. Auth events ────────────────────────────────────────────────────────────
-- Records every sign-up and sign-in for analytics.
-- event_type is either 'sign_up' or 'sign_in'.

CREATE TABLE IF NOT EXISTS auth_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users (id) ON DELETE SET NULL,
  event_type  TEXT        NOT NULL CHECK (event_type IN ('sign_up', 'sign_in')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  metadata    JSONB       DEFAULT '{}'
);

ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON auth_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
  ON auth_events FOR SELECT
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- Analytics queries (run in Supabase SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Daily sign-up and sign-in counts:
--
-- SELECT
--   event_type,
--   DATE(created_at) AS date,
--   COUNT(*)         AS total
-- FROM auth_events
-- GROUP BY event_type, date
-- ORDER BY date DESC;

-- Total unique users:
--
-- SELECT COUNT(*) FROM auth.users;

-- Most recently active users:
--
-- SELECT u.email, MAX(e.created_at) AS last_seen
-- FROM auth_events e
-- JOIN auth.users u ON u.id = e.user_id
-- GROUP BY u.email
-- ORDER BY last_seen DESC;
