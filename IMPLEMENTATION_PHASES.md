# Backend Implementation — Phase by Phase Plan

Reference: `BACKEND_PLAN.md` for full architecture details.

---

## Phase 1 — Foundation: Supabase Project & Database

**Objective:** Get the database live and the SDK wired up. No UI changes — the
app still runs exactly as today. This phase is purely infrastructure.

**Prerequisites:** Supabase account created at supabase.com.

### Tasks

1. Create a new Supabase project (choose a region closest to your users, e.g.
   South Asia / Singapore)
2. Open the Supabase SQL Editor and run the full `supabase/schema.sql` script:
   - Creates `profiles` table
   - Creates `user_data` table
   - Creates `auth_events` table
   - Enables Row Level Security on all three tables
   - Applies access policies (users can only read/write their own rows)
3. Verify tables and policies exist in Supabase → Table Editor
4. Copy **Project URL** and **Anon Key** from Supabase → Project Settings → API
5. Create `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
6. Add `.env.local` to `.gitignore` (prevent keys being committed)
7. Run `npm install @supabase/supabase-js`
8. Create `src/lib/supabase.js` — initialises the Supabase client
9. Create `src/lib/sync.js` — helper functions:
   - `fetchUserData(userId)` — reads profile + user_data from Supabase
   - `upsertProfile(userId, data)` — saves name and exam date
   - `upsertUserData(userId, data)` — saves all study data
   - `logAuthEvent(userId, eventType)` — inserts a row into auth_events
10. Create `supabase/schema.sql` in the repo for documentation and future use

### Files Touched
- `src/lib/supabase.js` ← new
- `src/lib/sync.js` ← new
- `supabase/schema.sql` ← new
- `.env.local` ← new (git-ignored)
- `.gitignore` ← add `.env.local`
- `package.json` / `package-lock.json` ← new dependency

### Acceptance Criteria
- App runs with no errors after installing the SDK
- Supabase dashboard shows all 3 tables with correct columns and RLS enabled
- `src/lib/supabase.js` can be imported without throwing (verify in browser console)
- `.env.local` is confirmed absent from git history

---

## Phase 2 — Authentication: Magic Link Sign-In / Sign-Up

**Objective:** Users can create an account and sign back in via email magic link.
The app gates access behind authentication — no session means no app.

**Prerequisites:** Phase 1 complete.

### Tasks

1. Configure Supabase Auth redirect URLs:
   - Supabase → Authentication → URL Configuration
   - Add `http://localhost:5173` (local dev)
   - Add the production Vercel URL (e.g. `https://your-app.vercel.app`)
2. Build `AuthModal` component in `src/components/modals/Modals.jsx`:
   - **Step 1 view:** Email input field + "Send Magic Link" button
   - **Loading view:** Spinner while the request is in flight
   - **Sent view:** "Check your inbox" confirmation message with the email shown
   - No close button — auth is required to use the app
3. Update `src/context/StudyContext.jsx`:
   - Add `authUser` state (null when signed out)
   - Add `authLoading` state (true while checking existing session on load)
   - Add `signIn(email)` function — calls `supabase.auth.signInWithOtp()`
   - Add `signOut()` function — calls `supabase.auth.signOut()`
   - Add `onAuthStateChange` listener:
     - `INITIAL_SESSION` event → set authUser, set authLoading false
     - `SIGNED_IN` event → set authUser (magic link was just clicked)
     - `SIGNED_OUT` event → clear authUser
4. Update `src/App.jsx`:
   - Show a full-screen loading spinner while `authLoading` is true
   - Show `AuthModal` when `authLoading` is false and `authUser` is null
   - Render normal app when `authUser` is set
5. Update `WelcomeModal` — it currently fires when `!uName`. After auth, it
   should fire when the user is authenticated but has no name saved yet (new
   user). The name they enter will be saved to `profiles` (handled in Phase 3).

### Files Touched
- `src/components/modals/Modals.jsx` ← add AuthModal
- `src/context/StudyContext.jsx` ← add auth state + functions
- `src/App.jsx` ← add auth gating + loading state

### Acceptance Criteria
- Visiting the app unauthenticated shows the AuthModal
- Entering an email and clicking "Send Magic Link" shows the confirmation view
- A real email is received with a working magic link
- Clicking the magic link redirects back to the app and the AuthModal is gone
- Refreshing the page keeps the user signed in (session persists)
- Signing out returns to the AuthModal

---

## Phase 3 — Data Sync: Cloud Persistence & Cross-Device

**Objective:** Study data is saved to Supabase and loaded back on sign-in.
Users switching between devices see their latest data everywhere.

**Prerequisites:** Phase 2 complete.

### Tasks

1. Add `loadCloudData(user)` function to `StudyContext.jsx`:
   - Calls `fetchUserData(userId)` from `sync.js`
   - If `profile.name` exists → set name state (returning user)
   - If `profile.exam_date` exists → set exam date state
   - If `userData` exists → overwrite all local state with cloud values:
     - log, ch_states, rv_states, todos, targets, rewards, streak, last_study_date
   - Cloud data always wins on conflict (prevents stale local data overriding
     newer cloud data)
2. Call `loadCloudData` inside the `INITIAL_SESSION` and `SIGNED_IN` handlers
   in `onAuthStateChange`
3. Add debounced `syncToCloud()` to `StudyContext.jsx`:
   - Watches all data state with a `useEffect`
   - Skips if `authUser` is null (not signed in)
   - Debounces 5 seconds from the last change
   - Calls `upsertUserData()` with the full current state
4. Update `WelcomeModal` `handleSave` to call `upsertProfile()` with the name
   (and exam date if present) after setting local state
5. Update anywhere `setExamDt` / `setUName` is called to also persist to
   `profiles` table via `upsertProfile()`
6. Add a `useEffect` that flushes any pending sync on `beforeunload`
   (tab/browser close) so the last change is never lost

### Files Touched
- `src/context/StudyContext.jsx` ← loadCloudData, syncToCloud, beforeunload flush
- `src/components/modals/Modals.jsx` ← WelcomeModal saves profile on name submit

### Acceptance Criteria
- Signing in on a new device shows the same study data as the original device
- Adding a log entry or completing a chapter syncs to Supabase within ~5 seconds
  (verify in Supabase → Table Editor → user_data)
- Signing out and back in restores all data correctly
- App works fully offline; sync resumes when back online

---

## Phase 4 — Auth Event Tracking: Sign-Up / Sign-In Analytics

**Objective:** Every sign-up and sign-in is recorded in the `auth_events` table
so the product owner can see user acquisition and retention data.

**Prerequisites:** Phase 2 complete (auth working).

### Tasks

1. In the `SIGNED_IN` handler inside `onAuthStateChange`:
   - Check if this is a brand-new user by comparing `user.created_at` to
     current time. If within 60 seconds → `event_type = 'sign_up'`, otherwise
     → `event_type = 'sign_in'`
   - Call `logAuthEvent(user.id, eventType)` from `sync.js`
   - Include browser metadata in the `metadata` JSONB field:
     `{ ua: navigator.userAgent, ts: Date.now() }`
2. Do NOT log events on `INITIAL_SESSION` — this fires on every page load for
   existing sessions and would inflate sign-in counts
3. Verify events appear correctly in Supabase → Table Editor → auth_events
4. Document the analytics queries in `supabase/schema.sql` comments:
   - Daily sign-up / sign-in counts
   - Total unique users
   - Most recently active users

### Files Touched
- `src/context/StudyContext.jsx` ← logAuthEvent call in SIGNED_IN handler
- `supabase/schema.sql` ← add analytics query examples as comments

### Acceptance Criteria
- A new sign-up inserts a row with `event_type = 'sign_up'`
- A returning sign-in inserts a row with `event_type = 'sign_in'`
- Page refreshes do NOT create duplicate sign-in rows
- Supabase dashboard query shows correct daily counts

---

## Phase 5 — User Profile Page

**Objective:** Add a Profile tab to the navigation with 5 sections: user card,
study stats, subject progress, recent activity, and account actions.

**Prerequisites:** Phases 2 and 3 complete (auth + sync working).

### Tasks

1. Create `src/views/Profile.jsx` with five sections:

   **Section 1 — User Card**
   - Initials avatar (e.g. "DS") in a coloured circle — generated from name
   - Display name and email (from `authUser`)
   - "Member since" date (from `authUser.created_at`, formatted)
   - Inline edit form for name and exam date — saves to `profiles` on submit

   **Section 2 — Study Stats**
   - Four stat cards in a 2×2 grid:
     - Total study hours (sum of all log entries ÷ 60)
     - Current streak (from context)
     - Days active (count of distinct dates in log)
     - Sessions logged (count of log entries)

   **Section 3 — Subject Progress**
   - One row per CA Final subject (8 subjects)
   - Progress bar: chapters completed / total chapters
   - Percentage label
   - Colour: green ≥80%, amber ≥50%, default otherwise

   **Section 4 — Recent Sign-In Activity**
   - Fetch last 5 rows from `auth_events` for the current user
   - Show event type badge (Sign Up / Sign In), date, time, and browser
   - Empty state if no events yet

   **Section 5 — Account Actions**
   - "Sign Out" button — calls `signOut()` from context
   - Danger Zone: "Reset All Data" button
     - Requires user to type "RESET" in a confirmation input before enabling
     - On confirm: clears localStorage, deletes `user_data` row in Supabase,
       signs out user

2. Add Profile tab to `src/components/layout/Navigation.jsx`:
   - Icon: `User` from lucide-react
   - Tab id: `profile`
   - Appears as the last item in the nav

3. Remove the Reset button from `src/components/layout/Header.jsx`
   (it is now in the Profile page Danger Zone with better confirmation UX)

4. Add `{ id: 'profile' }` case to the tab renderer in `src/App.jsx`

### Files Touched
- `src/views/Profile.jsx` ← new
- `src/components/layout/Navigation.jsx` ← add Profile tab
- `src/components/layout/Header.jsx` ← remove Reset button
- `src/App.jsx` ← add profile tab case

### Acceptance Criteria
- Profile tab is visible in the nav and renders without errors
- User card shows correct name, email, and member since date
- Editing name and exam date saves correctly and reflects immediately
- Stats match what is shown on the Dashboard view
- Subject progress bars match the Subjects view
- Recent activity shows real sign-in events from the database
- Sign out works and returns to AuthModal
- Reset requires typing "RESET" and deletes all data on confirm

---

## Phase 6 — Production Deployment & Hardening

**Objective:** The full feature set is live in production on Vercel, tested
end-to-end, with error handling and edge cases covered.

**Prerequisites:** All previous phases complete and working locally.

### Tasks

1. Add environment variables to Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Settings → Environment Variables → add for Production + Preview
2. Confirm production redirect URL is in Supabase Auth → URL Configuration
3. Trigger a Vercel deployment and test the full magic link flow in production
4. Add error handling for network failures:
   - `signIn()` error → show user-friendly message in AuthModal
   - `loadCloudData()` error → fall back to localStorage silently, log to console
   - `syncToCloud()` error → retry once after 10 seconds, then fail silently
5. Add loading states:
   - Skeleton/spinner while Profile page fetches auth_events
   - Disabled state on Edit form submit button while saving
6. Handle the case where a user opens the app on a new device before their
   existing device has synced (last-write-wins via `updated_at` timestamp)
7. Run a full regression test:
   - Sign up as a new user → name prompt shown → data saves
   - Log study time → sync appears in Supabase within 5 seconds
   - Sign in on a second device → data loads correctly
   - Profile page stats match Dashboard stats
   - Sign out → app shows AuthModal → sign back in → all data intact
   - Reset All Data → user signed out → database row deleted → clean state

### Files Touched
- `src/context/StudyContext.jsx` ← error handling in sync functions
- `src/components/modals/Modals.jsx` ← error message in AuthModal
- `src/views/Profile.jsx` ← loading state for auth_events fetch

### Acceptance Criteria
- Magic link works in production (not just localhost)
- All 6 regression test scenarios pass
- No console errors during normal usage
- Supabase dashboard shows correct sign-up/sign-in events from production

---

## Phase Summary

| Phase | Focus                         | App State After Completion                        |
|-------|-------------------------------|---------------------------------------------------|
| 1     | Foundation & DB setup         | No UI change; SDK wired up; DB live               |
| 2     | Authentication                | Users can sign up / sign in via magic link        |
| 3     | Data sync                     | Data persists in cloud; cross-device works        |
| 4     | Auth event tracking           | Sign-up/sign-in analytics visible in dashboard    |
| 5     | User profile page             | Profile tab with stats, progress, activity        |
| 6     | Production deployment         | Everything live, tested, and hardened             |

Each phase is independently deployable — the app remains functional and
shippable at the end of every phase.
