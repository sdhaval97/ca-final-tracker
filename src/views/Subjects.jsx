import React from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export function Subjects({ setTab }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      <div>
        <div className="text-lg font-extrabold text-b9 mb-1">📚 Chapter-wise Tracking</div>
        <p className="text-xs text-txM font-bold">Tick chapters · Use R1/R2/R3 badges for revision tracking</p>
      </div>

      <div>
        <h3 className="text-[11px] font-black uppercase tracking-[1.5px] text-b7 mb-3">Group I</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {SUBS.filter(s => s.group === 1).map(s => <SubjectCard key={s.id} sub={s} setTab={setTab} />)}
        </div>

        <h3 className="text-[11px] font-black uppercase tracking-[1.5px] text-ind mb-3">Group II</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {SUBS.filter(s => s.group === 2).map(s => <SubjectCard key={s.id} sub={s} setTab={setTab} />)}
        </div>
      </div>
    </motion.div>
  );
}

function SubjectCard({ sub, setTab }) {
  const { chS, setChS, rvS, setRvS, setTSubId } = useStudy();
  
  const total = sub.ch.length;
  const done = sub.ch.filter((_, i) => chS[`${sub.id}_${i}`]).length;
  const pct = Math.round((done / total) * 100);

  const toggleCh = (e, key) => {
    e.stopPropagation();
    const isDone = !chS[key];
    setChS({ ...chS, [key]: isDone });
    if (isDone) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.75 }, colors: ['#3b82f6','#6366f1','#0ea5e9','#10b981','#60a5fa'] });
    }
  };

  const toggleRv = (e, key, lv) => {
    e.stopPropagation();
    const cur = rvS[key] || 0;
    setRvS({ ...rvS, [key]: cur >= lv ? lv - 1 : lv });
  };

  const bColors = {
    fr: { text: "text-b6", bg: "bg-b5", grd: "from-b5 to-b4" },
    afm: { text: "text-ind", bg: "bg-ind", grd: "from-ind to-indigo-400" },
    aud: { text: "text-sky", bg: "bg-sky", grd: "from-sky to-cyan-400" },
    dt: { text: "text-vio", bg: "bg-vio", grd: "from-vio to-purple-400" },
    idt: { text: "text-cyn", bg: "bg-cyn", grd: "from-cyn to-cyan-400" },
    ibs: { text: "text-teal", bg: "bg-teal", grd: "from-teal to-teal-400" }
  };
  const theme = bColors[sub.id] || bColors.fr;

  return (
    <Card className="flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className={`text-sm font-black mb-1 ${theme.text}`}>{sub.name}</div>
          <div className="text-[11px] text-txM font-bold">{sub.code} · {total} chapters</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${sub.group === 1 ? 'bg-b1 text-b7' : 'bg-indBg text-ind'}`}>
            G{sub.group}
          </span>
          {setTab && (
            <button
              onClick={() => { setTSubId(sub.id); setTab('tmr'); }}
              className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wide ${theme.bg} text-white hover:opacity-80 transition-opacity`}
            >
              ▶ Start
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-[11px] text-txM font-bold">{done}/{total}</span>
          <span className={`text-[11px] font-black ${theme.text}`}>{pct}%</span>
        </div>
        <ProgressBar progress={pct} colorClass={theme.grd} />
      </div>

      <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex-1 border-t border-brd pt-2">
        {sub.sections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div className="text-[10px] uppercase tracking-[1.2px] text-txM px-3 pt-3 pb-1 font-black mt-1">
              {sec.title}
            </div>
            {sec.items.map((ch, cIdx) => {
              // Calculate global index logically or just keep a flat counter. 
              // Wait, in my original logic it was a flat index. Let me find the flat index:
              let globalIdx = 0;
              for (let i = 0; i < sIdx; i++) globalIdx += sub.sections[i].items.length;
              globalIdx += cIdx;
              
              const k = `${sub.id}_${globalIdx}`;
              const dn = chS[k];
              const rv = rvS[k] || 0;

              return (
                <div key={k} onClick={(e) => toggleCh(e, k)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 cursor-pointer transition-colors hover:bg-bg3 group">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${dn ? `bg-gradient-to-br ${theme.grd} border-transparent shadow-sm` : 'border-brd group-hover:border-b4'}`}>
                    {dn && <Check size={12} strokeWidth={4} color="white" />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className={`text-xs font-bold leading-tight truncate ${dn ? 'line-through text-txM' : 'text-tx'}`}>{ch}</div>
                    {rv > 0 && <div className="text-[10px] text-txM font-bold mt-0.5">Revised {rv}x</div>}
                  </div>
                  <div className="flex gap-1 ml-auto shrink-0">
                    {[1, 2, 3].map(r => (
                      <button
                        key={r}
                        onClick={(e) => toggleRv(e, k, r)}
                        title={`Mark ${r} revision${r > 1 ? 's' : ''}`}
                        className={`w-6 h-6 rounded text-[9px] font-black cursor-pointer transition-all border ${
                          r <= rv
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                            : 'border-brd text-txM hover:border-emerald-400 hover:text-emerald-500'
                        }`}
                      >
                        R{r}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
