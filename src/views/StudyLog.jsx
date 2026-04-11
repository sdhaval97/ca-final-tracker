import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { motion } from 'framer-motion';

export function StudyLog({ openManualMod }) {
  const { log, setLog } = useStudy();

  const delLog = (id) => {
    if(!window.confirm('Delete this session?')) return;
    setLog(log.filter(l => l.id !== id));
  };

  const fD = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const fH = (m) => {
    const hh = Math.floor(m / 60), mm = Math.round(m % 60);
    return hh === 0 ? mm+'m' : mm === 0 ? hh+'h' : hh+'h '+mm+'m';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="text-[15px] font-extrabold text-b9">📝 Study Log</div>
          <Button onClick={openManualMod}>+ Manual Entry</Button>
        </div>
        
        {log.length === 0 ? (
          <div className="text-center text-txM font-medium text-sm py-8 bg-bg3 rounded-xl border border-dashed border-brd">
            No sessions yet. Start the timer or add manually!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate" style={{borderSpacing: '0 3px'}}>
              <thead>
                <tr>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-3 py-2 font-black">Date</th>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-3 py-2 font-black">Subject</th>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-3 py-2 font-black">Duration</th>
                  <th className="text-[10px] uppercase tracking-wider text-txM px-3 py-2 font-black">Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...log].reverse().slice(0, 50).map(l => {
                  const sub = SUBS.find(s => s.id === l.subjectId);
                  const colors = {fr:'text-b5',afm:'text-ind',aud:'text-sky',dt:'text-vio',idt:'text-cyn',ibs:'text-teal'};
                  return (
                    <tr key={l.id} className="group">
                      <td className="bg-bg3 px-3 py-2.5 text-xs font-bold rounded-l-lg whitespace-nowrap">{fD(l.date)}</td>
                      <td className={`bg-bg3 px-3 py-2.5 text-xs font-black ${colors[l.subjectId] || 'text-tx'}`}>
                        {sub?.name || l.subjectId}
                      </td>
                      <td className="bg-bg3 px-3 py-2.5 text-xs font-black whitespace-nowrap">{fH(l.minutes)}</td>
                      <td className="bg-bg3 px-3 py-2.5 text-xs font-medium text-txM w-full">{l.notes || '—'}</td>
                      <td className="bg-bg3 px-3 py-2.5 text-xs rounded-r-lg text-right">
                        <button onClick={() => delLog(l.id)} className="text-txM opacity-0 group-hover:opacity-100 hover:text-rose transition-all">✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
