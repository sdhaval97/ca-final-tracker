import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { Play, Pause, Square, PenLine } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export function Timer({ openManualMod }) {
  const { tRun, tSubId, setTSubId, tSec, startTimer, pauseTimer, stopTimerAndSave, log } = useStudy();

  const h = String(Math.floor(tSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((tSec % 3600) / 60)).padStart(2, '0');
  const s = String(tSec % 60).padStart(2, '0');

  const onStop = () => {
    const saved = stopTimerAndSave();
    if (saved) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, colors: ['#3b82f6','#6366f1','#0ea5e9','#14b8a6'] });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = log.filter(l => l.date === todayStr).reverse();
  const totalToday = todaySessions.reduce((sum, l) => sum + l.minutes, 0);

  function fH(m) {
    const hh = Math.floor(m / 60);
    const mm = Math.round(m % 60);
    return hh === 0 ? mm + 'm' : mm === 0 ? hh + 'h' : hh + 'h ' + mm + 'm';
  }

  const selectedSub = SUBS.find(sub => sub.id === tSubId);
  const isActive = tRun || tSec > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">

      <section className="bg-bg2 border border-brd rounded-2xl overflow-hidden shadow-s2">
        <div className="bg-gradient-to-br from-b9 via-b7 to-b6 px-6 pt-8 pb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.3)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full gap-3">
              <select
                value={tSubId}
                disabled={isActive}
                onChange={e => setTSubId(e.target.value)}
                className="flex-1 bg-white/10 border border-white/25 text-white px-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-white/60 disabled:opacity-50 transition-colors"
              >
                <option value="" className="text-tx bg-bg2">— Select Subject —</option>
                {SUBS.map(sub => (
                  <option key={sub.id} value={sub.id} className="text-tx bg-bg2">{sub.name}</option>
                ))}
              </select>

              {openManualMod && (
                <button
                  onClick={openManualMod}
                  className="flex items-center gap-1.5 bg-white/10 border border-white/25 text-white px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-white/20 transition-colors shrink-0"
                >
                  <PenLine size={13} /> Manual Log
                </button>
              )}
            </div>

            <div
              data-timer-display
              className="text-[72px] md:text-[96px] font-black tabular-nums leading-none tracking-tighter text-white drop-shadow-lg"
            >
              {h}:{m}:{s}
            </div>

            <div className="text-sm font-bold text-white/70 h-5 text-center">
              {tRun
                ? `Studying · ${selectedSub?.name}`
                : tSec > 0
                  ? `Paused · ${selectedSub?.name}`
                  : 'Select a subject and start'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {!tRun ? (
                <button
                  onClick={() => {
                    if (!tSubId) alert('Select a subject first!');
                    else startTimer(tSubId);
                  }}
                  className="flex items-center gap-2 bg-white text-b7 px-8 py-3 rounded-xl text-sm font-black hover:bg-white/90 transition-colors shadow-lg"
                >
                  <Play size={16} fill="currentColor" /> {tSec > 0 ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 bg-white/15 border border-white/30 text-white px-8 py-3 rounded-xl text-sm font-black hover:bg-white/25 transition-colors"
                >
                  <Pause size={16} fill="currentColor" /> Pause
                </button>
              )}

              {tSec > 0 && (
                <button
                  onClick={onStop}
                  className="flex items-center gap-2 bg-rose-500/80 border border-rose-400/50 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-rose-500 transition-colors"
                >
                  <Square size={14} fill="currentColor" /> Stop & Save
                </button>
              )}
            </div>
          </div>
        </div>

        {totalToday > 0 && (
          <div className="px-6 py-3 bg-b1/50 border-t border-brd flex items-center justify-between">
            <span className="text-[11px] text-txM font-bold uppercase tracking-wider">Today's total</span>
            <span className="text-sm font-black text-b7">{fH(totalToday)}</span>
          </div>
        )}
      </section>

      <Card>
        <div className="text-[15px] font-extrabold text-b9 mb-4">📋 Today's Sessions</div>
        {todaySessions.length === 0 ? (
          <div className="text-center text-txM font-medium text-sm py-8 bg-bg3 rounded-xl border border-dashed border-brd">
            No sessions today. Start one above!
          </div>
        ) : (
          <div className="space-y-2">
            {todaySessions.map(l => {
              const sub = SUBS.find(s => s.id === l.subjectId);
              return (
                <div key={l.id} className="flex items-center gap-3 p-3 bg-bg3 rounded-xl hover:bg-bgH transition-colors">
                  <div className="flex-1 text-xs font-bold truncate text-tx">{sub?.name || l.subjectId}</div>
                  <div className="font-black text-xs">{fH(l.minutes)}</div>
                  <div className="text-[10px] text-txM font-bold w-12 text-right">{l.time}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
