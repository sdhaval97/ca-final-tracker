import { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { SUBS } from '../data/subjects';
import { fetchRecentAuthEvents } from '../lib/sync';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LogOut, Pencil, Check, X, Shield, Smartphone, Monitor } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function deviceIcon(ua = '') {
  if (/mobile|android|iphone/i.test(ua)) return <Smartphone size={13} />;
  return <Monitor size={13} />;
}

function browserName(ua = '') {
  if (ua.includes('Firefox'))     return 'Firefox';
  if (ua.includes('Edg'))         return 'Edge';
  if (ua.includes('OPR'))         return 'Opera';
  if (ua.includes('Chrome'))      return 'Chrome';
  if (ua.includes('Safari'))      return 'Safari';
  return 'Unknown browser';
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="bg-bg3 border border-brd rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-2xl font-black text-b6">{value}</span>
      <span className="text-[11px] text-txM font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Profile() {
  const {
    authUser, signOut, saveProfile,
    uName, examDt,
    log, chS, streak,
  } = useStudy();

  // Edit form
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(uName);
  const [editExam, setEditExam] = useState(examDt);
  // Auth events
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Reset confirmation
  const [resetInput, setResetInput] = useState('');
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    fetchRecentAuthEvents(authUser.id)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [authUser]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalHours = +(log.reduce((s, l) => s + l.minutes, 0) / 60).toFixed(1);
  const daysActive = new Set(log.map(l => l.date)).size;
  const sessions   = log.length;

  // ── Subject progress ───────────────────────────────────────────────────────
  const subjectProgress = SUBS.map(s => {
    const total = s.sections.reduce((n, sec) => n + sec.items.length, 0);
    const done  = s.sections.reduce((n, sec, si) =>
      n + sec.items.filter((_, ii) => {
        // ch key format: subId_globalIndex
        const globalIdx = s.sections.slice(0, si).reduce((x, sec2) => x + sec2.items.length, 0) + ii;
        return chS[`${s.id}_${globalIdx}`];
      }).length, 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { ...s, done, total, pct };
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    setEditing(false);
    saveProfile(editName.trim(), editExam); // state updates synchronously; network call runs in background
  };

  const handleReset = () => {
    Object.keys(localStorage).filter(k => k.startsWith('caf3_')).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto flex flex-col gap-6">

      {/* ── User Card ───────────────────────────────────────────────────── */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-b6 to-ind flex items-center justify-center text-white font-black text-lg flex-shrink-0">
            {initials(uName)}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your name"
                  className="bg-bg3 border border-brd rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-b4 w-full"
                />
                <input
                  type="date"
                  value={editExam}
                  onChange={e => setEditExam(e.target.value)}
                  className="bg-bg3 border border-brd rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-b4 w-full"
                />
                <div className="flex gap-2 mt-1">
                  <Button onClick={handleSaveProfile} className="py-1.5 px-4 text-xs rounded-full shadow-sB flex items-center gap-1.5">
                    <Check size={12} /> Save
                  </Button>
                  <Button variant="secondary" onClick={() => { setEditing(false); setEditName(uName); setEditExam(examDt); }} className="py-1.5 px-4 text-xs rounded-full flex items-center gap-1.5">
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-b9 truncate">
                    {uName ? `CA ${uName}` : 'No name set'}
                  </h2>
                  <button onClick={() => setEditing(true)} className="text-txM hover:text-b6 transition-colors">
                    <Pencil size={14} />
                  </button>
                </div>
                <p className="text-xs text-txM font-medium mt-0.5 truncate">{authUser?.email}</p>
                <p className="text-xs text-txM font-medium mt-0.5">
                  Member since {formatDate(authUser?.created_at)}
                  {examDt && <span className="ml-3">· Exam {formatDate(examDt)}</span>}
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── Study Stats ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-[11px] font-black text-txM uppercase tracking-wider mb-3">Study Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total hours"    value={totalHours} />
          <StatCard label="Current streak" value={`${streak} days`} />
          <StatCard label="Days active"    value={daysActive} />
          <StatCard label="Sessions logged" value={sessions} />
        </div>
      </div>

      {/* ── Subject Progress ─────────────────────────────────────────────── */}
      <div>
        <h3 className="text-[11px] font-black text-txM uppercase tracking-wider mb-3">Subject Progress</h3>
        <Card noPadding>
          <div className="divide-y divide-brd">
            {subjectProgress.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs font-bold text-tx truncate">{s.name}</span>
                    <span className="text-[11px] font-black text-txM ml-2 flex-shrink-0">
                      {s.done}/{s.total}
                    </span>
                  </div>
                  <div className="w-full bg-bg3 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        s.pct >= 80 ? 'bg-em' : s.pct >= 50 ? 'bg-amber-400' : 'bg-b5'
                      }`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-black flex-shrink-0 w-9 text-right ${
                  s.pct >= 80 ? 'text-em' : s.pct >= 50 ? 'text-amber-400' : 'text-txM'
                }`}>
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Recent Sign-in Activity ──────────────────────────────────────── */}
      <div>
        <h3 className="text-[11px] font-black text-txM uppercase tracking-wider mb-3">Recent Activity</h3>
        <Card noPadding>
          {eventsLoading ? (
            <div className="px-5 py-4 text-xs text-txM font-medium">Loading…</div>
          ) : events.length === 0 ? (
            <div className="px-5 py-4 text-xs text-txM font-medium">No activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-brd">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-black flex-shrink-0 ${
                    ev.event_type === 'sign_up'
                      ? 'bg-emBg text-em border border-em/20'
                      : 'bg-b0 text-b6 border border-b3'
                  }`}>
                    {ev.event_type === 'sign_up' ? 'Sign Up' : 'Sign In'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-tx">{formatDateTime(ev.created_at)}</p>
                    {ev.metadata?.ua && (
                      <p className="text-[11px] text-txM font-medium flex items-center gap-1 mt-0.5">
                        {deviceIcon(ev.metadata.ua)} {browserName(ev.metadata.ua)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Account Actions ──────────────────────────────────────────────── */}
      <div>
        <h3 className="text-[11px] font-black text-txM uppercase tracking-wider mb-3">Account</h3>
        <Card>
          <Button
            onClick={signOut}
            variant="secondary"
            className="w-full py-3 rounded-full text-sm flex items-center justify-center gap-2"
          >
            <LogOut size={15} /> Sign Out
          </Button>
        </Card>
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-[11px] font-black text-rose uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield size={12} /> Danger Zone
        </h3>
        <Card className="border-rose/20">
          {!showReset ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-tx">Reset All Data</p>
                <p className="text-xs text-txM font-medium mt-0.5">Permanently deletes all local study data.</p>
              </div>
              <Button variant="destructive" onClick={() => setShowReset(true)} className="py-2 px-4 text-xs rounded-full flex-shrink-0">
                Reset
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-black text-rose">Type RESET to confirm</p>
              <input
                autoFocus
                value={resetInput}
                onChange={e => setResetInput(e.target.value)}
                placeholder="RESET"
                className="bg-bg3 border border-rose/30 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-rose w-full"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={resetInput !== 'RESET'}
                  className="py-2 px-4 text-xs rounded-full"
                >
                  Confirm Reset
                </Button>
                <Button variant="secondary" onClick={() => { setShowReset(false); setResetInput(''); }} className="py-2 px-4 text-xs rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
