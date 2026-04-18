import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useStudy } from '../../context/StudyContext';
import { SUBS } from '../../data/subjects';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

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

// ── Shared input component ────────────────────────────────────────────────────

function Field({ icon: Icon, type = 'text', placeholder, value, onChange, onKeyDown, autoFocus, right }) {
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />}
      <input
        autoFocus={autoFocus}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${right ? 'pr-10' : 'pr-4'} py-3 text-sm font-bold bg-bg3 border-2 border-brd rounded-xl outline-none focus:border-b4 transition-colors`}
      />
      {right}
    </div>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────

export function AuthModal({ isOpen }) {
  const { signUp, signInWithPassword, resetPassword } = useStudy();

  const [tab, setTab] = useState('login'); // login | register | forgot | check-email

  // Login fields
  const [lEmail, setLEmail] = useState('');
  const [lPass, setLPass]   = useState('');
  const [lShowP, setLShowP] = useState(false);

  // Register fields
  const [rFirst, setRFirst] = useState('');
  const [rLast,  setRLast]  = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPass,  setRPass]  = useState('');
  const [rConf,  setRConf]  = useState('');
  const [rPhone, setRPhone] = useState('');
  const [rShowP, setRShowP] = useState(false);

  // Forgot field
  const [fEmail, setFEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Clean URL hash on mount (handles expired-link redirects from old magic-link flow)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('error=')) return;
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  if (!isOpen) return null;

  const err = (msg) => { setError(msg); setLoading(false); };

  const handleLogin = async () => {
    setError('');
    if (!lEmail.trim() || !lEmail.includes('@')) return err('Enter a valid email address.');
    if (!lPass) return err('Enter your password.');
    setLoading(true);
    try {
      await signInWithPassword(lEmail.trim(), lPass);
    } catch (e) {
      err(e.message ?? 'Sign-in failed. Check your email and password.');
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!rFirst.trim()) return err('Enter your first name.');
    if (!rEmail.trim() || !rEmail.includes('@')) return err('Enter a valid email address.');
    if (rPass.length < 8) return err('Password must be at least 8 characters.');
    if (rPass !== rConf) return err('Passwords do not match.');
    setLoading(true);
    try {
      const data = await signUp(rEmail.trim(), rPass, rFirst, rLast, rPhone.trim() || null);
      // If Supabase requires email confirmation, session will be null
      if (data?.user && !data.session) {
        setTab('check-email');
        setLoading(false);
      }
    } catch (e) {
      err(e.message ?? 'Registration failed. Try again.');
    }
  };

  const handleForgot = async () => {
    setError('');
    if (!fEmail.trim() || !fEmail.includes('@')) return err('Enter your email address.');
    setLoading(true);
    try {
      await resetPassword(fEmail.trim());
      setTab('check-email');
      setLoading(false);
    } catch (e) {
      err(e.message ?? 'Could not send reset email. Try again.');
    }
  };

  const inputCls = "w-full py-3 text-sm font-bold bg-bg3 border-2 border-brd rounded-xl outline-none focus:border-b4 transition-colors";
  const tabBtn = (t, label) => (
    <button
      onClick={() => { setTab(t); setError(''); }}
      className={`flex-1 py-2.5 text-sm font-black rounded-xl transition-colors ${tab === t ? 'bg-b6 text-white shadow-sB' : 'text-txM hover:text-tx'}`}
    >{label}</button>
  );

  if (tab === 'check-email') return (
    <ModalWrapper>
      <div className="text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-black text-b9 mb-2">Check your inbox</h2>
        <p className="text-sm text-txM font-medium mb-6">
          We sent an email to <span className="font-black text-b6">{fEmail || rEmail}</span>.<br />
          Follow the link to continue.
        </p>
        <Button variant="secondary" onClick={() => { setTab('login'); setError(''); }} className="w-full py-3 rounded-full text-sm">
          Back to Sign In
        </Button>
      </div>
    </ModalWrapper>
  );

  if (tab === 'forgot') return (
    <ModalWrapper>
      <div className="text-center mb-5">
        <div className="text-4xl mb-3">🔑</div>
        <h2 className="text-xl font-black text-b9 mb-1">Reset Password</h2>
        <p className="text-xs text-txM font-medium">We'll email you a reset link.</p>
      </div>
      <div className="flex flex-col gap-3">
        <Field icon={Mail} type="email" placeholder="your@email.com" value={fEmail}
          onChange={e => { setFEmail(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleForgot()} autoFocus />
        {error && <p className="text-xs text-rose font-bold -mt-1">{error}</p>}
        <Button onClick={handleForgot} disabled={loading} className="w-full py-3.5 rounded-full shadow-sB flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : 'Send Reset Link →'}
        </Button>
        <button onClick={() => { setTab('login'); setError(''); }} className="text-xs text-txM font-bold hover:text-b6 transition-colors mt-1">
          ← Back to Sign In
        </button>
      </div>
    </ModalWrapper>
  );

  return (
    <ModalWrapper>
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🎓</div>
        <h2 className="text-2xl font-black text-b9">CA Final Tracker</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-bg3 rounded-xl p-1 mb-5">
        {tabBtn('login', 'Sign In')}
        {tabBtn('register', 'Create Account')}
      </div>

      {tab === 'login' && (
        <div className="flex flex-col gap-3">
          <Field icon={Mail} type="email" placeholder="your@email.com" value={lEmail}
            onChange={e => { setLEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
            <input type={lShowP ? 'text' : 'password'} placeholder="Password" value={lPass}
              onChange={e => { setLPass(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className={`${inputCls} pl-10 pr-10`} />
            <button type="button" onClick={() => setLShowP(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txM hover:text-b6">
              {lShowP ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-xs text-rose font-bold -mt-1">{error}</p>}
          <Button onClick={handleLogin} disabled={loading} className="w-full py-3.5 rounded-full shadow-sB flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : 'Sign In →'}
          </Button>
          <button onClick={() => { setTab('forgot'); setFEmail(lEmail); setError(''); }}
            className="text-xs text-txM font-bold hover:text-b6 transition-colors text-center mt-1">
            Forgot password?
          </button>
        </div>
      )}

      {tab === 'register' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
              <input type="text" placeholder="First name *" value={rFirst}
                onChange={e => { setRFirst(e.target.value); setError(''); }} autoFocus
                className={`${inputCls} pl-10 pr-4`} />
            </div>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
              <input type="text" placeholder="Last name" value={rLast}
                onChange={e => { setRLast(e.target.value); setError(''); }}
                className={`${inputCls} pl-10 pr-4`} />
            </div>
          </div>
          <Field icon={Mail} type="email" placeholder="Email *" value={rEmail}
            onChange={e => { setREmail(e.target.value); setError(''); }} />
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
            <input type={rShowP ? 'text' : 'password'} placeholder="Password * (min 8 chars)" value={rPass}
              onChange={e => { setRPass(e.target.value); setError(''); }}
              className={`${inputCls} pl-10 pr-10`} />
            <button type="button" onClick={() => setRShowP(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txM hover:text-b6">
              {rShowP ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
            <input type="password" placeholder="Confirm password *" value={rConf}
              onChange={e => { setRConf(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              className={`${inputCls} pl-10 pr-4`} />
          </div>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
            <input type="tel" placeholder="Phone (optional)" value={rPhone}
              onChange={e => { setRPhone(e.target.value); setError(''); }}
              className={`${inputCls} pl-10 pr-4`} />
          </div>
          {error && <p className="text-xs text-rose font-bold -mt-1">{error}</p>}
          <Button onClick={handleRegister} disabled={loading} className="w-full py-3.5 rounded-full shadow-sB flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : 'Create Account →'}
          </Button>
        </div>
      )}
    </ModalWrapper>
  );
}

// ── Set Password Modal (shown after clicking a password-reset email link) ─────

export function SetPasswordModal({ isOpen }) {
  const { updatePassword } = useStudy();
  const [pass,  setPass]  = useState('');
  const [conf,  setConf]  = useState('');
  const [showP, setShowP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleSet = async () => {
    setError('');
    if (pass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (pass !== conf)   { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await updatePassword(pass);
      setDone(true);
    } catch (e) {
      setError(e.message ?? 'Failed to update password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full py-3 text-sm font-bold bg-bg3 border-2 border-brd rounded-xl outline-none focus:border-b4 transition-colors";

  return (
    <ModalWrapper>
      {done ? (
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-black text-b9 mb-2">Password Updated</h2>
          <p className="text-sm text-txM font-medium">You're all set. You can now use your new password to sign in.</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🔐</div>
            <h2 className="text-xl font-black text-b9 mb-1">Set New Password</h2>
            <p className="text-xs text-txM font-medium">Choose a strong password for your account.</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
              <input autoFocus type={showP ? 'text' : 'password'} placeholder="New password" value={pass}
                onChange={e => { setPass(e.target.value); setError(''); }}
                className={`${inputCls} pl-10 pr-10`} />
              <button type="button" onClick={() => setShowP(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-txM hover:text-b6">
                {showP ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txM pointer-events-none" />
              <input type="password" placeholder="Confirm new password" value={conf}
                onChange={e => { setConf(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSet()}
                className={`${inputCls} pl-10 pr-4`} />
            </div>
            {error && <p className="text-xs text-rose font-bold -mt-1">{error}</p>}
            <Button onClick={handleSet} disabled={loading} className="w-full py-3.5 rounded-full shadow-sB flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : 'Update Password →'}
            </Button>
          </div>
        </>
      )}
    </ModalWrapper>
  );
}

// ── Welcome Modal (name prompt after first sign-up) ───────────────────────────

export function WelcomeModal({ isOpen, onClose }) {
  const { saveProfile } = useStudy();
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      saveProfile(name.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper>
      <div className="text-center">
        <div className="text-5xl mb-4">🎓</div>
        <h2 className="text-2xl font-black text-b9 mb-2">Welcome to CA Tracker</h2>
        <p className="text-sm text-txM font-medium mb-6">Enter your name. We'll add the CA prefix — see it daily as motivation.</p>
        <input
          autoFocus
          className="w-full text-center text-lg font-black bg-bg3 border-2 border-brd rounded-xl py-4 mb-4 outline-none focus:border-b4"
          placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
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
    
    const enc = btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(data))));
    let msg = `🎓 CA ${data.name}'s Study Progress\n━━━━━━━━━━━━━━━━━━━━\n📊 Total: ${data.totalHrs}h\n☀️ Today: ${data.todayHrs}h\n🔥 ${data.streak} day streak\n\nCABUDDY:${enc}`;
    
    navigator.clipboard.writeText(msg).then(() => alert('✅ Copied! Send to your buddy via WhatsApp.')).catch(()=>alert('Could not copy automatically.'));
  };

  const loadBu = () => {
    const match = pasteData.match(/CABUDDY:([A-Za-z0-9+/=]+)/);
    if(!match) { alert('Invalid data!'); return; }
    try {
      const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(match[1]), c => c.charCodeAt(0))));
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
