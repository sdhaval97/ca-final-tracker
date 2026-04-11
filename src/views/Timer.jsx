import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { Play, Pause, Square } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export function Timer() {
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
      <Card className="text-center py-12 px-6">
        <div className="text-lg font-extrabold text-b9 mb-2 flex items-center justify-center gap-2">
          ⏱️ Study Timer
        </div>
        <p className="text-xs text-txM font-bold mb-8">Timer runs in background while you watch lectures</p>
        
        <select 
          value={tSubId} 
          disabled={tRun || tSec > 0} 
          onChange={e => setTSubId(e.target.value)}
          className="bg-bg3 border-2 border-brd text-tx px-5 py-3 rounded-full text-sm font-bold min-w-[300px] mb-8 outline-none focus:border-b4 disabled:opacity-50"
        >
          <option value="">— Select Subject —</option>
          {SUBS.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
        </select>

        <div className="text-[64px] md:text-[84px] font-black tabular-nums bg-gradient-to-br from-b7 to-ind bg-clip-text text-transparent leading-none mb-3 tracking-tighter">
          {h}:{m}:{s}
        </div>
        
        <div className="text-sm text-txM font-bold mb-10 h-5">
          {tRun ? `Studying: ${selectedSub?.name}` : tSec > 0 ? "Paused" : "Select a subject and start"}
        </div>

        <div className="flex justify-center gap-4">
          {!tRun ? (
            <Button variant="success" onClick={() => {
              if(!tSubId) alert('Select a subject first!');
              else startTimer(tSubId);
            }} className="px-8 py-3.5 text-base rounded-full">
              <Play size={18}/> {tSec > 0 ? 'Resume' : 'Start'}
            </Button>
          ) : (
            <Button variant="warning" onClick={pauseTimer} className="px-8 py-3.5 text-base rounded-full">
              <Pause fill="currentColor" size={18}/> Pause
            </Button>
          )}

          {tSec > 0 && (
            <Button variant="destructive" onClick={onStop} className="px-6 py-3.5 text-base rounded-full border-rose-200">
              <Square fill="currentColor" size={16}/> Stop & Save
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-[15px] font-extrabold text-b9 mb-4">📋 Today's Sessions</div>
        {todaySessions.length === 0 ? (
          <div className="text-center text-txM font-medium text-sm py-8 bg-bg3 rounded-xl border border-dashed border-brd">
            No sessions today. Start one above!
          </div>
        ) : (
          <div>
            <div className="text-xs text-tx2 font-bold mb-4">Total: <span className="text-b6 font-black">{fH(totalToday)}</span></div>
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
          </div>
        )}
      </Card>
    </motion.div>
  );
}
