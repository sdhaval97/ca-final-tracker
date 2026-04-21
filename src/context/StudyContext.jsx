import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../lib/supabase';
import { fetchProfile, fetchUserData, upsertProfile, upsertUserData } from '../lib/sync';

const StudyContext = createContext(null);

const WIPE_KEYS = ['log', 'ch', 'rv', 'td', 'tg', 'rw', 'str', 'ld', 'nm', 'ex', 'bu', 'ph'];

function wipeLocal() {
  WIPE_KEYS.forEach(k => localStorage.removeItem('caf3_' + k));
}

export function StudyProvider({ children }) {
  // ── Auth state ──────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

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
  const [phone, setPhone] = useLocalStorage('ph', '');

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
      wipeLocal();
      const [profile, userData] = await Promise.all([
        fetchProfile(user.id),
        fetchUserData(user.id),
      ]);
      setUName(profile?.name ?? '');
      setExamDt(profile?.exam_date ?? '');
      setPhone(profile?.phone ?? '');
      setLog(userData?.log ?? []);
      setChS(userData?.ch_states ?? {});
      setRvS(userData?.rv_states ?? {});
      setTodos(userData?.todos ?? []);
      setTgs(userData?.targets ?? {});
      setRws(userData?.rewards ?? []);
      setStreak(userData?.streak ?? 0);
      setLastD(userData?.last_study_date ?? '');
      setBuddy(userData?.buddy ?? null);
    } catch (e) {
      console.warn('Could not load cloud data, using local cache:', e.message);
    } finally {
      setTimeout(() => { isLoadingFromCloud.current = false; }, 1000);
    }
  // useState setters are stable refs — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth listener ───────────────────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => setAuthLoading(false), 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        clearTimeout(timeout);
        if (session?.user) {
          // refreshSession requires the refresh token which Supabase revokes on user deletion,
          // catching ghost sessions even when the JWT hasn't expired yet.
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData?.session) {
            try { await supabase.auth.signOut(); } catch { /* stale session */ }
            wipeLocal();
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
      } else if (event === 'PASSWORD_RECOVERY') {
        setAuthUser(session.user);
        setIsPasswordRecovery(true);
        setAuthLoading(false);
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
          log, ch_states: chS, rv_states: rvS, todos,
          targets: tgs, rewards: rws, streak, last_study_date: lastD,
          buddy,
        });
      } catch (e) {
        console.warn('Sync failed:', e.message);
      }
    }, 5000);
  }, [authUser, log, chS, rvS, todos, tgs, rws, streak, lastD, buddy]);

  useEffect(() => { syncToCloud(); }, [syncToCloud]);

  // Re-fetch from cloud when tab regains focus
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
          buddy,
        });
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [authUser, log, chS, rvS, todos, tgs, rws, streak, lastD]);

  // ── Auth functions ──────────────────────────────────────────────────────────

  const signUp = async (email, password, firstName, lastName, phoneNum) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (data.user) {
      try {
        await upsertProfile(data.user.id, { name, examDate: '', phone: phoneNum || null });
        setUName(name);
        if (phoneNum) setPhone(phoneNum);
      } catch (e) {
        console.warn('Profile save after signup:', e.message);
      }
    }
    return data;
  };

  const signInWithPassword = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  const signOut = async () => {
    // Fire-and-forget flush so sign-out is instant; beforeunload also covers this
    clearTimeout(syncDebounceRef.current);
    if (authUser) {
      upsertUserData(authUser.id, {
        log, ch_states: chS, rv_states: rvS, todos,
        targets: tgs, rewards: rws, streak, last_study_date: lastD,
        buddy,
      }).catch(() => {});
    }
    try { await supabase.auth.signOut(); } catch { /* stale session */ }
    wipeLocal();
    setAuthUser(null);
  };

  const saveProfile = useCallback((name, examDate, newPhone) => {
    setUName(name);
    if (examDate !== undefined) setExamDt(examDate);
    if (newPhone !== undefined) setPhone(newPhone);
    if (authUser) {
      upsertProfile(authUser.id, {
        name,
        examDate: examDate ?? examDt,
        phone: newPhone ?? phone,
      }).catch(e => console.warn('Could not save profile:', e.message));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, examDt, phone]);

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
      authUser, authLoading, isPasswordRecovery,
      signUp, signInWithPassword, resetPassword, updatePassword, signOut, saveProfile,
      // Study data
      log, setLog, chS, setChS, rvS, setRvS, todos, setTodos,
      tgs, setTgs, rws, setRws, streak, setStreak, lastD, setLastD,
      uName, setUName, buddy, setBuddy, examDt, setExamDt, phone, setPhone,
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
