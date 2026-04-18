import { supabase } from './supabase';

// ── Profiles ──────────────────────────────────────────────────────────────────

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, { name, examDate }) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name, exam_date: examDate ?? '', updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ── Study data ────────────────────────────────────────────────────────────────

export async function fetchUserData(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertUserData(userId, payload) {
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, ...payload, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ── Auth events ───────────────────────────────────────────────────────────────

export async function logAuthEvent(userId, eventType) {
  const { error } = await supabase
    .from('auth_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      metadata: { ua: navigator.userAgent, ts: Date.now() },
    });
  if (error) console.warn('Failed to log auth event:', error.message);
}

export async function fetchRecentAuthEvents(userId, limit = 5) {
  const { data, error } = await supabase
    .from('auth_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
