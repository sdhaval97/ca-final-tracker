import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { FloatingTimer } from './components/layout/FloatingTimer';

import { Dashboard } from './views/Dashboard';
import { Subjects } from './views/Subjects';
import { Timer } from './views/Timer';
import { TargetsView } from './views/TargetsView';
import { Rewards } from './views/Rewards';
import { StudyLog } from './views/StudyLog';
import { TasksView } from './views/TasksView';
import { Profile } from './views/Profile';

import {
  AuthModal,
  SetPasswordModal,
  WelcomeModal,
  DailyQuoteModal,
  BuddyModal,
  ManualEntryModal,
} from './components/modals/Modals';
import { useStudy } from './context/StudyContext';

function AppContent() {
  const { authUser, authLoading, uName, isPasswordRecovery } = useStudy();
  const [activeTab, setActiveTab] = useState('dash');

  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showBuddy, setShowBuddy] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Show welcome (name prompt) for new users, daily quote for returning users
  useEffect(() => {
    if (!authUser) return;
    if (!uName) {
      setShowWelcome(true);
    } else if (!sessionStorage.getItem('quoteShown')) {
      setShowQuote(true);
      sessionStorage.setItem('quoteShown', 'true');
    }
  }, [authUser, uName]);

  // Full-screen loader while checking existing session
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-b6 to-ind rounded-xl flex items-center justify-center text-white font-black text-lg animate-pulse">
            CA
          </div>
          <p className="text-xs text-txM font-bold tracking-wider uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  if (!authUser) return <AuthModal isOpen={true} />;
  if (isPasswordRecovery) return <SetPasswordModal isOpen={true} />;

  return (
    <div className="flex flex-col min-h-screen">
      <Header openBuddyModal={() => setShowBuddy(true)} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto relative overflow-hidden pb-20 md:pb-8">
        {activeTab === 'dash'    && <Dashboard />}
        {activeTab === 'sub'     && <Subjects setTab={setActiveTab} />}
        {activeTab === 'tmr'     && <Timer openManualMod={() => setShowManual(true)} />}
        {activeTab === 'tgt'     && <TargetsView />}
        {activeTab === 'rw'      && <Rewards />}
        {activeTab === 'lg'      && <StudyLog openManualMod={() => setShowManual(true)} />}
        {activeTab === 'td'      && <TasksView />}
        {activeTab === 'profile' && <Profile />}
      </main>

      <FloatingTimer setTab={setActiveTab} />

      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => {
          setShowWelcome(false);
          if (!sessionStorage.getItem('quoteShown')) {
            setShowQuote(true);
            sessionStorage.setItem('quoteShown', 'true');
          }
        }}
      />
      <DailyQuoteModal isOpen={showQuote} onClose={() => setShowQuote(false)} />
      <BuddyModal isOpen={showBuddy} onClose={() => setShowBuddy(false)} />
      <ManualEntryModal isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
}

export default AppContent;
