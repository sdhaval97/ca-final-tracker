import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { motion } from 'framer-motion';

const colorMap = {
  fr:  { text: 'text-b5',   bar: 'from-b5 to-b4',            bg: 'bg-b5'   },
  afm: { text: 'text-ind',  bar: 'from-ind to-indigo-400',   bg: 'bg-ind'  },
  aud: { text: 'text-sky',  bar: 'from-sky to-sky-400',      bg: 'bg-sky'  },
  dt:  { text: 'text-vio',  bar: 'from-vio to-purple-400',   bg: 'bg-vio'  },
  idt: { text: 'text-cyn',  bar: 'from-cyn to-cyan-400',     bg: 'bg-cyn'  },
  ibs: { text: 'text-teal', bar: 'from-teal to-teal-400',    bg: 'bg-teal' },
};

function fH(mins) {
  const h = Math.floor(mins / 60), m = Math.round(mins % 60);
  return h === 0 ? m + 'm' : m === 0 ? h + 'h' : h + 'h ' + m + 'm';
}

const TABS = [
  { id: 'overview',  label: 'Subject Overview' },
  { id: 'targets',   label: 'Set Targets'      },
  { id: 'progress',  label: 'Progress'         },
];

export function TargetsView() {
  const { tgs, setTgs, log } = useStudy();
  const [activeTab, setActiveTab] = useState('overview');

  const getTotalMins = (subId) =>
    log.filter(l => l.subjectId === subId).reduce((s, l) => s + l.minutes, 0);

  const setTarget = (id, val) =>
    setTgs({ ...tgs, [id]: parseFloat(val) || 0 });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto">

      <div>
        <div className="text-lg font-extrabold text-b9 mb-1">🎯 Subject Targets</div>
        <p className="text-xs text-txM font-bold">Track target vs completed hours per subject</p>
      </div>

      <nav className="flex gap-1 bg-bg3 border border-brd rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${
              activeTab === t.id
                ? 'bg-b6 text-white shadow-sm'
                : 'text-txM hover:text-tx'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <Card>
          <div className="text-[15px] font-extrabold text-b9 mb-5">📊 Subject Overview</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate" style={{ borderSpacing: '0 4px' }}>
              <thead>
                <tr>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-4 py-2 font-black">Subject</th>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-4 py-2 font-black text-center">Target Hours</th>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-4 py-2 font-black text-center">Completed Hours</th>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-4 py-2 font-black text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {SUBS.map(s => {
                  const tg = tgs[s.id] || 0;
                  const completedMins = getTotalMins(s.id);
                  const completedHrs = completedMins / 60;
                  const pct = tg > 0 ? Math.min((completedHrs / tg) * 100, 100) : 0;
                  const theme = colorMap[s.id] || colorMap.fr;
                  const statusLabel = tg <= 0 ? 'No target set' : completedHrs >= tg ? 'Completed' : pct >= 50 ? 'In Progress' : 'Not Started';
                  const statusStyle = tg <= 0 ? 'text-txM bg-bg3' : completedHrs >= tg ? 'text-emerald-600 bg-emerald-50' : pct >= 50 ? 'text-amber-600 bg-amber-50' : 'text-rose-500 bg-rose-50';
                  return (
                    <tr key={s.id}>
                      <td className="bg-bg3 px-4 py-3 rounded-l-xl">
                        <div className={`text-xs font-black ${theme.text}`}>{s.name}</div>
                        <div className="text-[10px] text-txM font-bold mt-0.5">{s.code}</div>
                      </td>
                      <td className="bg-bg3 px-4 py-3 text-center">
                        <span className="text-sm font-black text-tx">{tg > 0 ? tg + 'h' : '—'}</span>
                      </td>
                      <td className="bg-bg3 px-4 py-3 text-center">
                        <span className={`text-sm font-black ${theme.text}`}>{fH(completedMins)}</span>
                      </td>
                      <td className="bg-bg3 px-4 py-3 rounded-r-xl text-center">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${statusStyle}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'targets' && (
        <Card>
          <div className="text-[15px] font-extrabold text-b9 mb-2">✏️ Set Target Hours</div>
          <p className="text-xs text-txM font-bold mb-6">How many total hours do you want to study per subject?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SUBS.map(s => {
              const tg = tgs[s.id] || 0;
              const completedHrs = getTotalMins(s.id) / 60;
              const theme = colorMap[s.id] || colorMap.fr;
              return (
                <article key={s.id} className="bg-bg3 border-[1.5px] border-brd rounded-xl p-4 transition-all hover:border-b3 hover:shadow-s1">
                  <header>
                    <div className={`text-[11px] font-black uppercase tracking-wider mb-1 truncate ${theme.text}`}>{s.name}</div>
                    <div className="text-[10px] text-txM font-bold mb-3">{s.code}</div>
                  </header>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] text-txM font-bold">Completed</span>
                    <span className={`text-base font-black ${theme.text}`}>{completedHrs.toFixed(1)}h</span>
                  </div>
                  <input
                    type="number"
                    className="w-full bg-bg2 border-[1.5px] border-brd text-tx px-3 py-2 rounded-lg text-xs text-center font-bold outline-none focus:border-b4 transition-colors mt-2"
                    placeholder="Target hours"
                    value={tg || ''}
                    min="0"
                    step="1"
                    onChange={(e) => setTarget(s.id, e.target.value)}
                  />
                </article>
              );
            })}
          </div>
        </Card>
      )}

      {activeTab === 'progress' && (
        <Card>
          <div className="text-[15px] font-extrabold text-b9 mb-6">📈 Target vs Completed</div>
          <div className="space-y-5">
            {SUBS.map(s => {
              const tg = tgs[s.id] || 0;
              const completedMins = getTotalMins(s.id);
              const completedHrs = completedMins / 60;
              const pct = tg > 0 ? Math.min((completedHrs / tg) * 100, 100) : 0;
              const theme = colorMap[s.id] || colorMap.fr;
              const icon = tg <= 0 ? '○' : completedHrs >= tg ? '✅' : pct >= 50 ? '🟡' : '🔴';
              return (
                <div key={s.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xs font-black text-tx">{icon} {s.name}</span>
                      <span className="text-[10px] text-txM font-bold ml-2">{s.code}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black ${theme.text}`}>{fH(completedMins)}</span>
                      {tg > 0 && <span className="text-[10px] text-txM font-bold"> / {tg}h target</span>}
                    </div>
                  </div>
                  {tg > 0 ? (
                    <ProgressBar progress={pct} colorClass={theme.bar} className="h-2" />
                  ) : (
                    <div className="h-2 bg-bg3 rounded-full border border-dashed border-brd" />
                  )}
                </div>
              );
            })}
          </div>
          {SUBS.every(s => !tgs[s.id]) && (
            <div className="text-center text-txM font-medium text-sm pt-6">
              Set targets in the "Set Targets" tab to see progress 🎯
            </div>
          )}
        </Card>
      )}
    </motion.div>
  );
}
