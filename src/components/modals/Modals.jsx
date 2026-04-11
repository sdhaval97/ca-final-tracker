import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useStudy } from '../../context/StudyContext';
import { SUBS } from '../../data/subjects';
import { motion } from 'framer-motion';

const overlay = "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4";
const modalPane = "bg-bg2 border border-brd rounded-[24px] p-6 md:p-8 max-w-[460px] w-full shadow-s3 relative";
const closeBtn = "absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-bg3 border-[1.5px] border-brd text-txM rounded-full hover:bg-roseBg hover:text-rose hover:border-rose/20 transition-colors font-black text-sm outline-none";

function ModalWrapper({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={overlay}>
      <motion.div initial={{ scale: 0.93, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 10 }} className={modalPane}>
        {onClose && <button onClick={onClose} className={closeBtn}>✕</button>}
        {children}
      </motion.div>
    </motion.div>
  );
}

export function WelcomeModal({ isOpen, onClose }) {
  const { uName, setUName } = useStudy();
  const [name, setName] = useState('');
  
  const handleSave = () => {
    if(name.trim()) {
      setUName(name.trim());
      onClose();
    }
  };

  if(!isOpen) return null;

  return (
    <ModalWrapper>
      <div className="text-center">
        <div className="text-5xl mb-4">🎓</div>
        <h2 className="text-2xl font-black text-b9 mb-2">Welcome to CA Tracker</h2>
        <p className="text-sm text-txM font-medium mb-6">Enter your name. We'll add the CA prefix — see it daily as motivation.</p>
        <input 
          autoFocus
          className="w-full text-center text-lg font-black bg-bg3 border-2 border-brd rounded-xl py-4 mb-4 outline-none focus:border-b4"
          placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && handleSave()}
        />
        <Button onClick={handleSave} className="w-full py-4 text-base rounded-full shadow-sB">Start My Journey →</Button>
      </div>
    </ModalWrapper>
  );
}

export function DailyQuoteModal({ isOpen, onClose }) {
  const { uName } = useStudy();
  const QTS=["The pain of studying is temporary. The pain of failing is permanent.","6 months of focus → rest of your life as a CA."];
  const quote = React.useMemo(() => QTS[Math.floor(Math.random() * QTS.length)], []);
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';

  if(!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="text-center">
        <div className="text-5xl mb-4">💪</div>
        <h2 className="text-lg font-black text-b9 mb-2">{greeting}, CA {uName}</h2>
        <p className="text-sm italic text-tx2 font-bold mb-6">"{quote}"</p>
        <p className="text-xs text-txM font-medium mb-8">One more day closer to becoming a Chartered Accountant.</p>
        <Button onClick={onClose} className="w-full py-3.5 rounded-full shadow-sB">Let's get to work 🚀</Button>
      </div>
    </ModalWrapper>
  );
}

export function BuddyModal({ isOpen, onClose }) {
  const { log, streak, chS, buddy, setBuddy, uName } = useStudy();
  const [pasteData, setPasteData] = useState('');

  if(!isOpen) return null;

  const shareProg = () => {
    const data = {
      name: uName || 'Anonymous',
      totalHrs: +(log.reduce((s,l)=>s+l.minutes,0)/60).toFixed(1),
      todayHrs: +(log.filter(l=>l.date === new Date().toISOString().split('T')[0]).reduce((s,l)=>s+l.minutes,0)/60).toFixed(1),
      streak: streak,
      subjects: {}
    };
    SUBS.forEach(s => {
      const d = s.ch.filter((_, i) => chS[`${s.id}_${i}`]).length;
      data.subjects[s.id] = { done: d, total: s.ch.length };
    });
    
    const enc = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    let msg = `🎓 CA ${data.name}'s Study Progress\n━━━━━━━━━━━━━━━━━━━━\n📊 Total: ${data.totalHrs}h\n☀️ Today: ${data.todayHrs}h\n🔥 ${data.streak} day streak\n\nCABUDDY:${enc}`;
    
    navigator.clipboard.writeText(msg).then(() => alert('✅ Copied! Send to your buddy via WhatsApp.')).catch(()=>alert('Could not copy automatically.'));
  };

  const loadBu = () => {
    const match = pasteData.match(/CABUDDY:([A-Za-z0-9+/=]+)/);
    if(!match) { alert('Invalid data!'); return; }
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(match[1]))));
      if(!data.name) throw new Error();
      setBuddy(data);
      setPasteData('');
      alert(`✅ Connected to CA ${data.name}!`);
    } catch(e) {
      alert('Could not read data.');
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-black text-b9 mb-2">👯 Study Buddy</h2>
      <p className="text-[11px] text-txM font-bold mb-6">Share via WhatsApp. Your buddy pastes the data to see your progress.</p>
      
      <Button onClick={shareProg} variant="secondary" className="w-full py-3 rounded-full mb-6 text-sm">
        📤 Copy My Progress
      </Button>

      <div className="text-[10px] uppercase tracking-wider text-txM font-black mb-2">Paste buddy's shared text</div>
      <textarea 
        value={pasteData} onChange={e=>setPasteData(e.target.value)}
        className="w-full bg-bg3 border border-brd rounded-xl p-3 text-xs font-bold min-h-[80px] outline-none focus:border-b4 mb-3"
        placeholder="Paste here..."
      />
      <Button onClick={loadBu} className="w-full py-3 rounded-full shadow-sB mb-4 text-sm">
        📥 Load Buddy Data
      </Button>

      {buddy ? (
        <div className="bg-emBg border-[1.5px] border-em/20 text-em p-3 rounded-xl font-bold text-xs">
          ✅ CA {buddy.name} · {buddy.totalHrs}h total · {buddy.todayHrs}h today · 🔥{buddy.streak}
        </div>
      ) : (
        <div className="bg-bg3 text-txM p-3 rounded-xl text-xs font-medium text-center">No buddy connected</div>
      )}

      {buddy && (
        <Button variant="destructive" onClick={()=>setBuddy(null)} className="w-full mt-4 py-2 text-xs rounded-full">
          Clear Buddy
        </Button>
      )}
    </ModalWrapper>
  );
}

export function ManualEntryModal({ isOpen, onClose }) {
  const { addManualLog } = useStudy();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sub, setSub] = useState('');
  const [hrs, setHrs] = useState('');
  const [notes, setNotes] = useState('');

  if(!isOpen) return null;

  const handleSave = () => {
    if(!date || !sub || !hrs || hrs <= 0) { alert('Fill all required fields!'); return; }
    addManualLog({ date, subjectId: sub, minutes: parseFloat(hrs)*60, notes, time: 'Manual' });
    onClose();
    setHrs(''); setNotes('');
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h2 className="text-xl font-black text-b9 mb-6">📝 Manual Entry</h2>
      <div className="flex flex-col gap-3">
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full bg-bg3 border border-brd rounded-xl p-3 text-sm font-bold text-tx focus:border-b4 outline-none" />
        <select value={sub} onChange={e=>setSub(e.target.value)} className="w-full bg-bg3 border border-brd rounded-xl p-3 text-sm font-bold text-tx focus:border-b4 outline-none">
          <option value="">— Select Subject —</option>
          {SUBS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input type="number" step="0.25" min="0" placeholder="Hours" value={hrs} onChange={e=>setHrs(e.target.value)} className="w-full bg-bg3 border border-brd rounded-xl p-3 text-sm font-bold text-tx focus:border-b4 outline-none" />
        <input placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} className="w-full bg-bg3 border border-brd rounded-xl p-3 text-sm font-bold text-tx focus:border-b4 outline-none" />
        <Button onClick={handleSave} className="w-full py-3.5 mt-2 rounded-full shadow-sB">Save Entry</Button>
      </div>
    </ModalWrapper>
  );
}
