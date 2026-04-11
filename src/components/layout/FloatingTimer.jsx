import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { SUBS } from '../../data/subjects';

export function FloatingTimer({ setTab }) {
  const { tRun, tSubId, tSec } = useStudy();

  if (!tRun && tSec === 0) return null;

  const h = String(Math.floor(tSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((tSec % 3600) / 60)).padStart(2, '0');
  const s = String(tSec % 60).padStart(2, '0');

  const sub = SUBS.find(s => s.id === tSubId);

  return (
    <div 
      onClick={() => setTab('tmr')}
      className="fixed bottom-6 right-6 bg-gradient-to-br from-b9 to-b6 text-white px-5 py-3 rounded-full shadow-[0_6px_24px_rgba(37,99,235,0.4)] flex items-center gap-3 cursor-pointer z-50 animate-pulse-shadow hover:scale-105 transition-transform"
    >
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="font-bold text-sm max-w-[100px] truncate">{sub?.name.split(' ').slice(0,2).join(' ') || tSubId}</span>
      <span className="font-black tabular-nums text-sm">{h}:{m}:{s}</span>
    </div>
  );
}
