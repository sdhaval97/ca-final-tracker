import React from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { Book, CheckCircle2, Clock, Activity, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const QTS=[
  "The pain of studying is temporary. The pain of failing is permanent.",
  "6 months of focus → rest of your life as a CA.",
  "Your future self is watching you right now.",
  "Everyone wants to be a CA. Very few put in the work.",
  "Consistency beats intensity. Show up every single day.",
  "One day all these late nights will make sense.",
  "Scoring 40 gets the same prefix as 75. Just clear it.",
  "You didn't come this far to only come this far.",
  "Make your parents' sacrifices worth it.",
  "Discipline is doing what needs to be done even when you don't feel like it.",
  "Nobody is coming to save you. This is your fight.",
  "Imagine the SMS — Both Groups Cleared."
];

function fH(m) {
  const h = Math.floor(m / 60);
  const mn = Math.round(m % 60);
  return h === 0 ? mn + 'm' : mn === 0 ? h + 'h' : h + 'h ' + mn + 'm';
}

function get7dHours(log) {
  const r = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const mins = log.filter(l => l.date === dateStr).reduce((s, l) => s + l.minutes, 0);
    r.push({ date: d, hrs: mins / 60 });
  }
  return r;
}

export function Dashboard() {
  const { log, chS, rvS, uName, examDt, setExamDt, buddy } = useStudy();
  
  const totalMins = log.reduce((s,l) => s + l.minutes, 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMins = log.filter(l => l.date === todayStr).reduce((s,l) => s + l.minutes, 0);
  
  let totalCh = 0; let doneCh = 0;
  SUBS.forEach(s => {
    totalCh += s.ch.length;
    s.ch.forEach((_, i) => { if (chS[`${s.id}_${i}`]) doneCh++; });
  });
  
  const pct = totalCh > 0 ? Math.round((doneCh / totalCh) * 100) : 0;
  const rad = 52;
  const circ = 2 * Math.PI * rad;
  const offset = circ - (pct / 100) * circ;

  const w7 = get7dHours(log);
  const w7Avg = w7.reduce((s, d) => s + d.hrs, 0) / 7;

  let totalRevs = 0;
  Object.values(rvS).forEach(v => totalRevs += v);

  let days = '--', hours = '--', mins = '--';
  if (examDt) {
    const diff = new Date(examDt + 'T09:00:00') - new Date();
    if (diff > 0) {
      days = Math.floor(diff / 864e5);
      hours = Math.floor((diff % 864e5) / 36e5);
      mins = Math.floor((diff % 36e5) / 6e4);
    } else {
      days = '0'; hours = '0'; mins = '0';
    }
  }

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const quote = React.useMemo(() => QTS[Math.floor(Math.random() * QTS.length)], []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-b9 via-b7 to-b6 rounded-[24px] p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_32px_rgba(29,78,216,0.25)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.25)_0%,transparent_50%),radial-gradient(circle_at_85%_30%,rgba(14,165,233,0.2)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="flex-1 relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-black mb-2">{greeting} 👋</h2>
          <p className="text-sm italic text-white/80 max-w-sm mb-3">"{quote}"</p>
          <div className="text-xs font-bold text-white/50 bg-white/10 w-max px-3 py-1 rounded-full mx-auto md:mx-0">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="relative z-10 scale-110">
          <svg viewBox="0 0 120 120" width="130" height="130">
            <defs>
              <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa"/>
                <stop offset="100%" stopColor="#818cf8"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={rad} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8"/>
            <circle 
              cx="60" cy="60" r={rad} fill="none" 
              stroke="url(#rg)" strokeWidth="8" strokeLinecap="round" 
              strokeDasharray={circ} strokeDashoffset={offset}
              transform="rotate(-90 60 60)" 
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <text x="60" y="55" textAnchor="middle" fontSize="26" fontWeight="900" fill="white">{pct}%</text>
            <text x="60" y="72" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.6)" fontWeight="700" letterSpacing=".5">SYLLABUS</text>
          </svg>
        </div>

        <div className="flex-1 relative z-10 text-center md:text-right">
          <div className="text-[11px] uppercase tracking-widest text-white/60 font-bold mb-3">⏰ Exam Countdown</div>
          <div className="flex gap-4 justify-center md:justify-end mb-4">
            <div className="text-center"><div className="text-3xl font-black leading-none">{days}</div><div className="text-[9px] uppercase tracking-wider text-white/55 mt-1 font-bold">Days</div></div>
            <div className="text-center"><div className="text-3xl font-black leading-none">{hours}</div><div className="text-[9px] uppercase tracking-wider text-white/55 mt-1 font-bold">Hours</div></div>
            <div className="text-center"><div className="text-3xl font-black leading-none">{mins}</div><div className="text-[9px] uppercase tracking-wider text-white/55 mt-1 font-bold">Min</div></div>
          </div>
          <input 
            type="date" value={examDt} onChange={e => setExamDt(e.target.value)} 
            className="bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs outline-none focus:border-white/50 transition-colors bg-transparent color-scheme-dark"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={<Book className="text-b5"/>} color="from-b5 to-b4" val={fH(totalMins)} lbl="Total Hours" />
        <StatCard icon={<CheckCircle2 className="text-em"/>} color="from-em to-teal" val={`${doneCh}/${totalCh}`} lbl="Chapters Done" />
        <StatCard icon={<Clock className="text-sky"/>} color="from-sky to-cyn" val={fH(todayMins)} lbl="Today" />
        <StatCard icon={<Activity className="text-ind"/>} color="from-ind to-vio" val={fH(w7Avg*60)} lbl="7-Day Avg" />
        <StatCard icon={<RotateCcw className="text-amb-500"/>} color="from-amb to-amber-400" val={totalRevs} lbl="Revisions" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="text-[15px] font-extrabold flex items-center gap-2 text-b9 mb-4">📊 Last 7 Days</div>
          <div className="flex items-end gap-2 h-44 py-2">
            {w7.map((d, i) => {
              const max = Math.max(...w7.map(w => w.hrs), 0.5);
              const ht = (d.hrs / max) * 150;
              const isT = i === 6;
              const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.date.getDay()];
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="text-[10px] font-black text-b9 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.hrs.toFixed(1)}h</div>
                  <div 
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-500 ${isT ? 'bg-gradient-to-b from-b7 to-b4' : 'bg-gradient-to-b from-b4 to-b2 opacity-60 group-hover:opacity-100'}`}
                    style={{ height: Math.max(ht, 4) + 'px' }}
                  />
                  <div className={`text-[10px] mt-2 font-bold ${isT ? 'text-b6' : 'text-txM'}`}>{dn}{isT ? ' ●' : ''}</div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <div className="text-[15px] font-extrabold flex items-center gap-2 text-b9 mb-4">☀️ Today's Breakdown</div>
          {todayMins === 0 ? (
            <div className="text-center text-txM font-medium text-sm py-10 bg-bg3 rounded-xl">No study sessions today yet.<br/>Start the timer! ⏱️</div>
          ) : (
            <div>
              <div className="text-2xl font-black text-b9 leading-none mb-1">{fH(todayMins)}</div>
              <div className="text-xs text-txM font-bold mb-5">studied today</div>
              <div className="space-y-3">
                {Object.entries(
                  log.filter(l => l.date === todayStr).reduce((acc, l) => {
                    acc[l.subjectId] = (acc[l.subjectId] || 0) + l.minutes;
                    return acc;
                  }, {})
                ).sort((a,b) => b[1]-a[1]).map(([sid, mins]) => {
                  const sub = SUBS.find(s => s.id === sid);
                  const pct = Math.round((mins / todayMins) * 100);
                  const colors = {fr:'bg-b5',afm:'bg-ind',aud:'bg-sky',dt:'bg-vio',idt:'bg-cyn',ibs:'bg-teal'};
                  const cColor = colors[sid] || 'bg-b5';
                  return (
                    <div key={sid} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${cColor}`} />
                      <div className="text-xs font-bold w-24 truncate">{sub?.name.split(' ').slice(0,2).join(' ') || sid}</div>
                      <div className="flex-1 h-1.5 bg-b0 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-xs font-black w-12 text-right">{fH(mins)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="text-[15px] font-extrabold flex items-center gap-2 text-b9 mb-4">📚 Subject Progress</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SUBS.map(s => {
            const t = s.ch.length;
            const d = s.ch.filter((_,i) => chS[`${s.id}_${i}`]).length;
            const p = Math.round((d/t)*100);
            const hrs = log.filter(l => l.subjectId === s.id).reduce((sm,l)=>sm+l.minutes,0);
            return (
              <div key={s.id} className="bg-bg3 border-[1.5px] border-brd rounded-xl p-4 transition-all hover:border-b3 hover:shadow-s2 hover:-translate-y-0.5 cursor-pointer">
                <div className="text-xs font-black mb-2">{s.name}</div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-[11px] text-txM font-bold">{d}/{t} ch · {fH(hrs)}</div>
                  <div className="text-lg font-black">{p}%</div>
                </div>
                <ProgressBar progress={p} colorClass={s.id === 'fr' ? 'from-b5 to-b4' : 
                                                    s.id === 'afm' ? 'from-ind to-indigo-400' :
                                                    s.id === 'aud' ? 'from-sky to-sky-400' :
                                                    s.id === 'dt' ? 'from-vio to-purple-400' :
                                                    s.id === 'idt' ? 'from-cyn to-cyan-400' :
                                                    'from-teal to-teal-400'} />
              </div>
            );
          })}
        </div>
      </Card>

      {buddy && (
        <Card>
          <div className="text-[15px] font-extrabold flex items-center gap-2 text-b9 mb-4">👯 Buddy's Progress</div>
          <div className="text-xs text-tx2 font-bold mb-4">
            CA {buddy.name} · Total: <span className="font-black text-b9">{buddy.totalHrs}h</span> · Today: <span className="font-black text-b9">{buddy.todayHrs}h</span> · 🔥 {buddy.streak} day streak
          </div>
          <div className="space-y-4">
            {SUBS.map(s => {
              const bd = buddy.subjects?.[s.id];
              const bp = bd && bd.total > 0 ? Math.round((bd.done/bd.total)*100) : 0;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span>{s.name}</span>
                    <span className="opacity-70">{bp}%</span>
                  </div>
                  <ProgressBar progress={bp} colorClass="from-txM to-slate-300" className="opacity-50 h-1.5" />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

function StatCard({ icon, color, val, lbl }) {
  return (
    <div className="bg-bg2 border border-brd rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-s2 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${color}`} />
      <div className="w-8 h-8 rounded-lg bg-bg3 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-2xl font-black text-b9 leading-none mb-1">{val}</div>
      <div className="text-[10px] text-txM uppercase tracking-wider font-bold">{lbl}</div>
    </div>
  );
}
