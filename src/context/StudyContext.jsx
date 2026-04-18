import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../lib/supabase';
import { fetchProfile, fetchUserData, upsertProfile, upsertUserData, logAuthEvent } from '../lib/sync';

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Study data (localStorage-backed) ───────────────────────────────────────
  const [log, setLog] = useLocalStorage('log', []);
  const [chS, setChS] = useLocalStorage('ch', {});
  const [rvS, setRvS] = useLocalStorage('rv', {});
  const [todos, setTodos] = useLocalStorage('td', []);
  const [tgs, setTgs] = useLocalStorage('tg', {});
  const [rws, setRws] = useLocalStorage('rw', []);
  const [streak, setStreak] = useLocalStorage('str', 0);
  const [lastD, setLastD] = useLocalStorage('ld', '');
  const [uName, setUName] = useLocalStorage('nm', '');
  const [buddy, setBuddy] = useLocalStorage('bu', null);
  const [examDt, setExamDt] = useLocalStorage('ex', '');

  // ── Timer state ─────────────────────────────────────────────────────────────
  const [tRun, setTRun] = useState(false);
  const [tSubId, setTSubId] = useState('');
  const [tSec, setTSec] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // ── Sync refs ───────────────────────────────────────────────────────────────
  const syncDebounceRef = useRef(null);
  const isLoadingFromCloud = useRef(false);

  // ── Timer tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tRun) {
      timerRef.current = setInterval(() => {
        setTSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [tRun]);

  // ── Document title ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (tRun && tSubId) {
      const h = String(Math.floor(tSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((tSec % 3600) / 60)).padStart(2, '0');
      const s = String(tSec % 60).padStart(2, '0');
      document.title = `${h}:${m}:${s} · CA Tracker`;
    } else {
      document.title = uName ? `CA ${uName}'s Tracker` : 'CA Final Tracker';
    }
  }, [tSec, tRun, tSubId, uName]);

  // ── Load cloud data on sign-in ──────────────────────────────────────────────
  const loadCloudData = useCallback(async (user) => {
    isLoadingFromCloud.current = true;
    try {
      // Wipe stale local data before loading so the cloud is always the source of truth
      ['log', 'ch', 'rv', 'td', 'tg', 'rw', 'str', 'ld', 'nm', 'ex', 'bu'].forEach(k =>
        localStorage.removeItem('caf3_' + k)
      );

      const [profile, userData] = await Promise.all([
        fetchProfile(user.id),
        fetchUserData(user.id),
      ]);

      // Always overwrite — no conditional checks — so stale local data never wins
      setUName(profile?.name ?? '');
      setExamDt(profile?.exam_date ?? '');
      setLog(userData?.log ?? []);
      setChS(userData?.ch_states ?? {});
      setRvS(userData?.rv_states ?? {});
      setTodos(userData?.todos ?? []);
      setTgs(userData?.targets ?? {});
      setRws(userData?.rewards ?? []);
      setStreak(userData?.streak ?? 0);
      setLastD(userData?.last_study_date ?? '');
    } catch (e) {
      console.warn('Could not load cloud data, using local cache:', e.message);
    } finally {
      setTimeout(() => { isLoadingFromCloud.current = false; }, 1000);
    }
  }, []);

  // ── Auth listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Safety net: if Supabase never fires (e.g. lock error, missing env vars), unblock the UI
    const timeout = setTimeout(() => setAuthLoading(false), 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        clearTimeout(timeout);
        if (session?.user) {
          // refreshSession hits the server and requires the refresh token to still be valid.
          // Supabase revokes refresh tokens when a user is deleted, so this catches ghost sessions
          // even when the short-lived access token (JWT) hasn't expired yet.
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData?.session) {
            try { await supabase.auth.signOut(); } catch (_) {}
            ['log', 'ch', 'rv', 'td', 'tg', 'rw', 'str', 'ld', 'nm', 'ex', 'bu'].forEach(k =>
              localStorage.removeItem('caf3_' + k)
            );
            setAuthLoading(false);
            return;
          }
          await loadCloudData(refreshData.session.user);
          setAuthUser(refreshData.session.user);
        }
        setAuthLoading(false);
      } else if (event === 'SIGNED_IN') {
        setAuthUser(session.user);
        await loadCloudData(session.user);
        // Detect sign_up vs sign_in by checking how recently the account was created
        const isNewUser = Date.now() - new Date(session.user.created_at).getTime() < 60_000;
        await logAuthEvent(session.user.id, isNewUser ? 'sign_up' : 'sign_in');
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadCloudData]);

  // ── Debounced cloud sync ────────────────────────────────────────────────────
  const syncToCloud = useCallback(() => {
    if (!authUser || isLoadingFromCloud.current) return;
    clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(async () => {
      try {
        await upsertUserData(authUser.id, {
          log,
          ch_states: chS,
          rv_states: rvS,
          todos,
          targets: tgs,
          rewards: rws,
          streak,
          last_study_date: lastD,
        });
      } catch (e) {
        console.warn('Sync failed:', e.message);
      }
    }, 5000);
  }, [authUser, log, chS, rvS, todos, tgs, rws, streak, lastD]);

  useEffect(() => {
    syncToCloud();
  }, [syncToCloud]);

  // Re-fetch from cloud when tab regains focus (picks up changes from other devices)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authUser && !isLoadingFromCloud.current) {
        loadCloudData(authUser);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authUser, loadCloudData]);

  // Flush on tab/browser close
  useEffect(() => {
    const flush = () => {
      clearTimeout(syncDebounceRef.current);
      if (authUser && !isLoadingFromCloud.current) {
        upsertUserData(authUser.id, {
          log, ch_states: chS, rv_states: rvS, todos,
          targets: tgs, rewards: rws, streak, last_study_date: lastD,
        });
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [authUser, log, chS, rvS, todos, tgs, rws, streak, lastD]);

  // ── Auth functions ──────────────────────────────────────────────────────────
  const signIn = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch (_) { /* stale session — still clear below */ }
    ['log', 'ch', 'rv', 'td', 'tg', 'rw', 'str', 'ld', 'nm', 'ex', 'bu'].forEach(k =>
      localStorage.removeItem('caf3_' + k)
    );
    setAuthUser(null);
  };

  // Saves name (+optional examDate) locally and to Supabase profiles table
  const saveProfile = useCallback(async (name, examDate) => {
    setUName(name);
    if (examDate !== undefined) setExamDt(examDate);
    if (authUser) {
      try {
        await upsertProfile(authUser.id, { name, examDate: examDate ?? examDt });
      } catch (e) {
        console.warn('Could not save profile:', e.message);
      }
    }
  }, [authUser, examDt]);

  // ── Timer functions ─────────────────────────────────────────────────────────
  const startTimer = (subId) => {
    setTSubId(subId);
    startTimeRef.current = Date.now() - tSec * 1000;
    setTRun(true);
  };

  const pauseTimer = () => setTRun(false);

  const stopTimerAndSave = () => {
    setTRun(false);
    const min = tSec / 60;
    if (min >= 1 && tSubId) {
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        subjectId: tSubId,
        minutes: Math.round(min * 10) / 10,
        notes: '',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedLog = [...log, newLog];
      setLog(updatedLog);
      updateStreak(updatedLog);
      return true;
    }
    setTSec(0);
    setTSubId('');
    return false;
  };

  // ── Streak logic ────────────────────────────────────────────────────────────
  const updateStreak = (currentLog = log) => {
    const td = new Date().toISOString().split('T')[0];
    const hasLogToday = currentLog.some(l => l.date === td);
    if (hasLogToday && lastD !== td) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterday = y.toISOString().split('T')[0];
      setStreak(lastD === yesterday ? streak + 1 : 1);
      setLastD(td);
    }
  };

  const addManualLog = (entry) => {
    const updatedLog = [...log, { id: Date.now(), ...entry }];
    setLog(updatedLog);
    updateStreak(updatedLog);
  };

  return (
    <StudyContext.Provider value={{
      // Auth
      authUser, authLoading, signIn, signOut, saveProfile,
      // Study data
      log, setLog, chS, setChS, rvS, setRvS, todos, setTodos,
      tgs, setTgs, rws, setRws, streak, setStreak, lastD, setLastD,
      uName, setUName, buddy, setBuddy, examDt, setExamDt,
      // Timer
      tRun, tSubId, setTSubId, tSec, startTimer, pauseTimer, stopTimerAndSave, addManualLog,
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  return useContext(StudyContext);
}
