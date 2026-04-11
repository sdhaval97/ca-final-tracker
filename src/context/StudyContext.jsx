import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
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

  // Timer State 
  const [tRun, setTRun] = useState(false);
  const [tSubId, setTSubId] = useState('');
  const [tSec, setTSec] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (tRun) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setTSec(Math.floor((now - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [tRun]);

  // Document Title effect
  useEffect(() => {
    if (tRun && tSubId) {
      const h = String(Math.floor(tSec / 3600)).padStart(2, '0');
      const m = String(Math.floor(tSec % 3600 / 60)).padStart(2, '0');
      const s = String(tSec % 60).padStart(2, '0');
      document.title = `${h}:${m}:${s} · CA Tracker`;
    } else {
      document.title = uName ? `CA ${uName}'s Tracker` : 'CA Final Tracker';
    }
  }, [tSec, tRun, tSubId, uName]);

  const startTimer = (subId) => {
    setTSubId(subId);
    startTimeRef.current = Date.now() - (tSec * 1000);
    setTRun(true);
  };

  const pauseTimer = () => {
    setTRun(false);
  };

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
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      const updatedLog = [...log, newLog];
      setLog(updatedLog);
      updateStreak(updatedLog); // Pass explicitly since state is async
      return true; // Used to trigger confetti
    }
    setTSec(0);
    setTSubId('');
    return false;
  };

  const updateStreak = (currentLog = log) => {
    const td = new Date().toISOString().split('T')[0];
    const hasLogToday = currentLog.some(l => l.date === td);
    if (hasLogToday && lastD !== td) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterday = y.toISOString().split('T')[0];
      if (lastD === yesterday) {
        setStreak(streak + 1);
      } else {
        setStreak(1);
      }
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
      log, setLog, chS, setChS, rvS, setRvS, todos, setTodos,
      tgs, setTgs, rws, setRws, streak, setStreak, lastD, setLastD,
      uName, setUName, buddy, setBuddy, examDt, setExamDt,
      tRun, tSubId, setTSubId, tSec, startTimer, pauseTimer, stopTimerAndSave, addManualLog
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  return useContext(StudyContext);
}
