import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

export function Rewards() {
  const { rws, setRws, log, uName } = useStudy();
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');

  const totalHrs = log.reduce((s,l) => s + l.minutes, 0) / 60;

  const addRw = () => {
    if(!name || !target) return;
    setRws([...rws, { id: Date.now(), name, target: parseFloat(target), unlocked: false, claimed: false }]);
    setName('');
    setTarget('');
  };

  const claimRw = (id) => {
    const updated = rws.map(r => r.id === id ? { ...r, claimed: true } : r);
    setRws(updated);
    confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 }, colors: ['#3b82f6','#6366f1','#0ea5e9','#10b981','#14b8a6'] });
    alert(`🎉 Go enjoy: "${updated.find(r=>r.id===id).name}"\nYou earned it, CA ${uName}!`);
  };

  const delRw = (id) => setRws(rws.filter(r => r.id !== id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
      <Card>
        <div className="text-[15px] font-extrabold text-b9 mb-2">🎁 Reward System</div>
        <p className="text-xs text-txM font-bold mb-6">Set a reward + hours needed to unlock it. You earn it, you take it.</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <input 
            type="text" value={name} onChange={e=>setName(e.target.value)}
            className="flex-1 bg-bg3 border-[1.5px] border-brd text-tx px-4 py-2.5 rounded-lg text-xs font-bold outline-none focus:border-b4 transition-colors min-w-[200px]"
            placeholder="e.g. Movie night, Biryani..."
          />
          <input 
            type="number" value={target} onChange={e=>setTarget(e.target.value)} min="1"
            className="w-[110px] bg-bg3 border-[1.5px] border-brd text-tx px-4 py-2.5 rounded-lg text-xs font-bold outline-none focus:border-b4 transition-colors"
            placeholder="Hours"
          />
          <Button onClick={addRw}>Add Reward</Button>
        </div>

        <div className="space-y-2">
          {rws.length === 0 ? (
            <div className="text-center text-txM font-medium text-sm py-8 bg-bg3 rounded-xl border border-dashed border-brd">No rewards yet. Add one above! 🎁</div>
          ) : (
            rws.map(r => {
              const p = Math.min((totalHrs / r.target) * 100, 100);
              const ul = totalHrs >= r.target;
              return (
                <div key={r.id} className={`p-4 rounded-xl border-[1.5px] border-l-4 transition-all ${ul ? 'bg-emBg border-brd border-l-em' : 'bg-bg3 border-brd border-l-brd'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-tx">{ul ? '🎉' : '🔒'} {r.name}</div>
                      <div className="text-xs text-txM font-bold mt-1">{totalHrs.toFixed(1)}h / {r.target}h</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ul && !r.claimed && <Button variant="success" className="px-4 py-2 text-[11px]" onClick={()=>claimRw(r.id)}>Claim</Button>}
                      {r.claimed && <span className="text-em font-black text-[11px]">Claimed ✅</span>}
                      <button onClick={()=>delRw(r.id)} className="text-txM hover:text-rose transition-colors text-sm font-black w-6 h-6 flex justify-center items-center rounded-full hover:bg-rose/10">✕</button>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-b0 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${ul ? 'bg-gradient-to-r from-em to-teal' : 'bg-gradient-to-r from-b5 to-ind'}`} style={{ width: `${p}%` }}/>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </motion.div>
  );
}
