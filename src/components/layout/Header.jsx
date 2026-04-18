import { Button } from '../ui/Button';
import { useStudy } from '../../context/StudyContext';
import { Flame, Users } from 'lucide-react';

export function Header({ openBuddyModal }) {
  const { streak, uName } = useStudy();

  return (
    <header className="bg-gradient-to-br from-b9 via-b7 to-b5 px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center sticky top-0 z-50 shadow-[0_4px_20px_rgba(30,58,95,0.3)]">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-inner">
          CA
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">
            {uName ? `CA ${uName}'s Tracker` : 'CA Final Tracker'}
          </h1>
          <p className="text-[11px] text-white/55 font-medium">New Syllabus · May 2024</p>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button variant="glass" onClick={openBuddyModal} className="px-3 py-1.5 text-xs">
          <Users size={14} /> Buddy
        </Button>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-amber-400">
          <Flame size={14} className="text-orange-500" /> {streak}
        </div>
      </div>
    </header>
  );
}
