# Backend Implementation Plan — CA Final Tracker

## Overview

Add a cloud backend to the CA Final Tracker to support user sign-up/sign-in,
cross-device data sync, user analytics, and a profile dashboard — while keeping
the app fully functional offline.

---

## Technology: Supabase

**Why Supabase:**
- Free tier (50,000 monthly active users, 500 MB storage)
- PostgreSQL database — structured, queryable data
- Built-in Authentication — no separate auth service needed
- Row Level Security — each user can only access their own data
- JavaScript SDK works directly with Vite/React
- Vercel + Supabase is a standard, well-documented production stack

---

## Authentication: Magic Link (Email OTP)

Users enter their email → receive a one-click login link → instantly signed in.
No passwords to manage or forget.

Optional upgrade path: add Google OAuth with one additional toggle in Supabase.

### Sign-up flow (new user)
1. Enter email → magic link sent to inbox
2. Click link → account created, redirected back to app
3. Prompted to enter their display name (same as today's welcome screen)

### Sign-in flow (returning user)
1. Enter email → magic link sent to inbox
2. Click link → study data loaded from cloud, continue where they left off

---

## Database Schema

### `profiles` — User display info
| Column       | Type      | Description                      |
|--------------|-----------|----------------------------------|
| id           | UUID      | Matches auth user ID (primary)   |
| name         | text      | Display name (e.g. "Dhaval")     |
| exam_date    | text      | Target exam date                 |
| updated_at   | timestamp | Last updated                     |

### `user_data` — All study data (migrated from localStorage)
| Column           | Type      | Description                  |
|------------------|-----------|------------------------------|
| user_id          | UUID      | Matches auth user ID         |
| log              | JSONB     | Study log entries            |
| ch_states        | JSONB     | Chapter completion state     |
| rv_states        | JSONB     | Revision states              |
| todos            | JSONB     | Task list                    |
| targets          | JSONB     | Study targets                |
| rewards          | JSONB     | Earned rewards               |
| streak           | integer   | Current streak count         |
| last_study_date  | text      | Last active date             |
| updated_at       | timestamp | Last sync timestamp          |

### `auth_events` — Sign-in/sign-up analytics
| Column      | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | UUID      | Event ID                             |
| user_id     | UUID      | Which user                           |
| event_type  | text      | `sign_up` or `sign_in`              |
| created_at  | timestamp | When it happened                     |
| metadata    | JSONB     | Browser/device info (user agent)     |

**Sample analytics query:**
```sql
SELECT event_type, DATE(created_at) AS date, COUNT(*)
FROM auth_events
GROUP BY event_type, date
ORDER BY date DESC;
```
This gives a daily breakdown of new sign-ups vs. returning sign-ins, visible
directly in the Supabase dashboard.

---

## Data Sync Strategy

- **localStorage** stays as the immediate, offline-first cache (existing
  behaviour fully preserved)
- On **sign-in**: cloud data is fetched and merged into local state (cloud wins
  on conflicts, so data is never lost when switching devices)
- On **any data change**: changes are debounced 5 seconds, then pushed to
  Supabase silently in the background
- If the user is **offline**: the app works exactly as it does today, and syncs
  automatically when connectivity returns

No data loss. No visible performance impact on the UI.

---

## User Profile Page

A new **Profile** tab added to the navigation bar (User icon, id: `profile`).

### Section 1 — User Card
- Avatar: initials-based circle (e.g. "DS" for Dhaval Shah), generated from name
- Display name and email address
- Member since date (from `auth.users.created_at`)
- **Edit** button → inline form to update name and exam date
  - Saves to `profiles` table in Supabase + updates local state instantly

### Section 2 — Study Stats (read from `user_data`)
Four stat cards in a 2×2 grid:
| Stat            | Source                         |
|-----------------|--------------------------------|
| Total hours     | Sum of all `log.minutes / 60`  |
| Current streak  | `streak` field                 |
| Days active     | Distinct dates in `log`        |
| Sessions logged | Count of `log` entries         |

### Section 3 — Subject Progress
Progress bars for each of the 8 CA Final subjects showing:
- Chapters completed / total chapters
- Percentage complete
- Colour-coded (green when 100%, amber when ≥50%, default otherwise)

Data source: `ch_states` from `user_data` (already exists in the app today).

### Section 4 — Recent Sign-in Activity
A simple list of the last 5 sign-in events from `auth_events`, showing:
- Event type (Sign Up / Sign In)
- Date and time
- Device info (browser, from metadata)

Gives the user visibility into their own account activity.

### Section 5 — Account Actions
- **Sign Out** button — clears session, returns to auth screen
- **Danger Zone** — "Reset All Data" (currently in the Header; moved here to
  reduce accidental clicks). Requires typed confirmation.

---

## Files — New

| File                    | Purpose                                          |
|-------------------------|--------------------------------------------------|
| `src/lib/supabase.js`   | Initialises Supabase client from env vars        |
| `src/lib/sync.js`       | Load/save user data + profile, log auth events   |
| `src/views/Profile.jsx` | The profile page component (all 5 sections)      |
| `supabase/schema.sql`   | SQL to run once in Supabase dashboard            |
| `.env.local`            | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |

## Files — Modified

| File                                    | Change                                                         |
|-----------------------------------------|----------------------------------------------------------------|
| `src/context/StudyContext.jsx`          | Add auth state, sign-in/out, cloud sync (debounced)           |
| `src/components/modals/Modals.jsx`      | Add `AuthModal` (email input → "check your email" screen)     |
| `src/App.jsx`                           | Show `AuthModal` when no session; handle auth state changes   |
| `src/components/layout/Navigation.jsx` | Add Profile tab with User icon                                |
| `src/components/layout/Header.jsx`     | Remove Reset button (moved to Profile page Danger Zone)       |

---

## Setup Steps (for developer)

1. Create a free project at supabase.com
2. Run `supabase/schema.sql` in the Supabase SQL Editor to create the tables
3. In Supabase → Authentication → URL Configuration:
   - Add the production domain (e.g. `https://your-app.vercel.app`) to **Redirect URLs**
   - Add `http://localhost:5173` for local development
4. Copy the **Project URL** and **Anon Key** from Supabase → Project Settings → API
5. Add them to `.env.local` locally and to Vercel Environment Variables for production
6. Run `npm install @supabase/supabase-js`
7. Implement the code changes listed above

---

## What the Client Gets

| Feature                        | Detail                                                            |
|--------------------------------|-------------------------------------------------------------------|
| Passwordless auth              | Magic link — users just enter email, no passwords                 |
| Cross-device sync              | Study data syncs silently across phone and laptop                 |
| Sign-up / sign-in analytics    | Live table in Supabase dashboard with daily counts                |
| Profile page                   | Avatar, stats, subject progress, recent activity, sign out        |
| Offline support                | App works fully offline; syncs when back online                   |
| Data security                  | Row Level Security — users cannot access each other's data        |
| Zero cost                      | Free tier covers ~50,000 MAU — no infrastructure cost to start   |
