import { BarChart3, BookOpen, Clock, Target, Gift, FileText, CheckSquare, User } from 'lucide-react';

const tabs = [
  { id: 'dash',    label: 'Dashboard', icon: BarChart3 },
  { id: 'sub',     label: 'Subjects',  icon: BookOpen },
  { id: 'tmr',     label: 'Timer',     icon: Clock },
  { id: 'tgt',     label: 'Targets',   icon: Target },
  { id: 'rw',      label: 'Rewards',   icon: Gift },
  { id: 'lg',      label: 'Log',       icon: FileText },
  { id: 'td',      label: 'Tasks',     icon: CheckSquare },
  { id: 'profile', label: 'Profile',   icon: User },
];

export function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bg-bg2 border-b border-brd px-4 md:px-8 py-2 flex gap-1 overflow-x-auto shadow-s1 no-scrollbar items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap outline-none flex-shrink-0 ${
              isActive
                ? 'bg-gradient-to-br from-b6 to-ind text-white shadow-sB'
                : 'text-txM hover:text-b6 hover:bg-b0'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
