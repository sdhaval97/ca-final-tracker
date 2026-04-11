import React, { useState, useEffect } from 'react';
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

import { WelcomeModal, DailyQuoteModal, BuddyModal, ManualEntryModal } from './components/modals/Modals';
import { useStudy } from './context/StudyContext';

function AppContent() {
  const { uName } = useStudy();
  const [activeTab, setActiveTab] = useState('dash');
  
  // Modals state
  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [showBuddy, setShowBuddy] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!uName) {
      setShowWelcome(true);
    } else {
      // Just check session storage so we only show daily quote once per app load
      if (!sessionStorage.getItem('quoteShown')) {
        setShowQuote(true);
        sessionStorage.setItem('quoteShown', 'true');
      }
    }
  }, [uName]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header openBuddyModal={() => setShowBuddy(true)} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto relative overflow-hidden pb-20 md:pb-8">
        {activeTab === 'dash' && <Dashboard />}
        {activeTab === 'sub' && <Subjects />}
        {activeTab === 'tmr' && <Timer />}
        {activeTab === 'tgt' && <TargetsView />}
        {activeTab === 'rw' && <Rewards />}
        {activeTab === 'lg' && <StudyLog openManualMod={() => setShowManual(true)} />}
        {activeTab === 'td' && <TasksView />}
      </main>

      <FloatingTimer setTab={setActiveTab} />

      {/* Modals */}
      <WelcomeModal isOpen={showWelcome} onClose={() => { setShowWelcome(false); setShowQuote(true); sessionStorage.setItem('quoteShown', 'true'); }} />
      <DailyQuoteModal isOpen={showQuote} onClose={() => setShowQuote(false)} />
      <BuddyModal isOpen={showBuddy} onClose={() => setShowBuddy(false)} />
      <ManualEntryModal isOpen={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
}

export default AppContent;
