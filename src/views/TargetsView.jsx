import React from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { motion } from 'framer-motion';

export function TargetsView() {
  const { tgs, setTgs, log } = useStudy();

  const getWkM = (subId) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0,0,0,0);
    const startOfWeek = d.toISOString().split('T')[0];
    return log.filter(l => l.subjectId === subId && l.date >= startOfWeek).reduce((s,l) => s + l.minutes, 0);
  };

  const setTarget = (id, val) => {
    setTgs({ ...tgs, [id]: parseFloat(val) || 0 });
  };

  let hasTargets = false;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto">
      <Card>
        <div className="text-[15px] font-extrabold text-b9 mb-2">🎯 Weekly Hour Targets</div>
        <p className="text-xs text-txM font-bold mb-6">How many hours per subject this week?</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SUBS.map(s => {
            const tg = tgs[s.id] || 0;
            const ac = getWkM(s.id) / 60;
            const pct = tg > 0 ? Math.min((ac / tg) * 100, 100) : 0;
            const status = tg <= 0 ? '' : ac >= tg ? ' ✅' : pct >= 60 ? ' 🟡' : ' 🔴';
            const colors = {fr:'text-b5',afm:'text-ind',aud:'text-sky',dt:'text-vio',idt:'text-cyn',ibs:'text-teal'};
            return (
              <div key={s.id} className="bg-bg3 border-[1.5px] border-brd rounded-xl p-4 text-center transition-all hover:border-b3 hover:shadow-s1">
                <div className={`text-[10px] font-black uppercase tracking-wider mb-2 truncate ${colors[s.id] || 'text-b5'}`}>{s.name}</div>
                <div className={`text-2xl font-black mb-1 ${colors[s.id] || 'text-b5'}`}>{ac.toFixed(1)}h</div>
                <div className="text-[10px] text-txM font-bold mb-3">/ {tg}h target{status}</div>
                <ProgressBar progress={pct} colorClass={s.id === 'fr' ? 'from-b5 to-b4' : 
                                                    s.id === 'afm' ? 'from-ind to-indigo-400' :
                                                    s.id === 'aud' ? 'from-sky to-sky-400' :
                                                    s.id === 'dt' ? 'from-vio to-purple-400' :
                                                    s.id === 'idt' ? 'from-cyn to-cyan-400' :
                                                    'from-teal to-teal-400'} className="mb-4 bg-b0 h-1.5" />
                <input 
                  type="number" 
                  className="w-full bg-bg2 border-[1.5px] border-brd text-tx px-3 py-2 rounded-lg text-xs text-center font-bold outline-none focus:border-b4 transition-colors" 
                  placeholder="Target (h)" 
                  value={tg || ''} 
                  min="0" step="1" 
                  onChange={(e) => setTarget(s.id, e.target.value)} 
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="text-[15px] font-extrabold text-b9 mb-4">📊 Target vs Actual</div>
        <div className="space-y-4">
          {SUBS.map(s => {
            const tg = tgs[s.id] || 0;
            if (tg <= 0) return null;
            hasTargets = true;
            const ac = getWkM(s.id) / 60;
            const pct = Math.min((ac / tg) * 100, 100);
            const icon = ac >= tg ? '✅' : pct >= 60 ? '🟡' : '🔴';
            const colors = {fr:'text-b5 bg-b5',afm:'text-ind bg-ind',aud:'text-sky bg-sky',dt:'text-vio bg-vio',idt:'text-cyn bg-cyn',ibs:'text-teal bg-teal'};
            const theme = colors[s.id]?.split(' ')[0] || 'text-b5';
            const bgTheme = colors[s.id]?.split(' ')[1] || 'bg-b5';
            return (
              <div key={s.id}>
                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                  <span>{icon} {s.name}</span>
                  <span className={`${theme} font-black`}>{ac.toFixed(1)}h / {tg}h</span>
                </div>
                <div className="w-full h-1.5 bg-b0 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bgTheme}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {!hasTargets && <div className="text-center text-txM font-medium text-sm py-4">Set targets above to track progress 🎯</div>}
        </div>
      </Card>
    </motion.div>
  );
}
