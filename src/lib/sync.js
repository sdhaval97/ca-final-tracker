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

export async function upsertProfile(userId, { name, examDate, phone }) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name, exam_date: examDate ?? '', phone: phone ?? null, updated_at: new Date().toISOString() });
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

