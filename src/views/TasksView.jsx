import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStudy } from '../context/StudyContext';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function TasksView() {
  const { todos, setTodos } = useStudy();
  const [task, setTask] = useState('');
  const [prio, setPrio] = useState('medium');

  const addTd = () => {
    if(!task.trim()) return;
    setTodos([...todos, { id: Date.now(), text: task.trim(), priority: prio, done: false }]);
    setTask('');
  };

  const togTd = (id) => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const delTd = (id) => setTodos(todos.filter(t => t.id !== id));

  const sorted = [...todos].sort((a,b) => {
    const o = {high: 0, medium: 1, low: 2};
    return (a.done - b.done) || (o[a.priority] - o[b.priority]);
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl mx-auto">
      <Card>
        <div className="text-[15px] font-extrabold text-b9 mb-4">✅ Study Tasks</div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <input 
            type="text" value={task} onChange={e=>setTask(e.target.value)} onKeyDown={e=>e.key==='Enter' && addTd()}
            className="flex-1 bg-bg3 border-[1.5px] border-brd text-tx px-4 py-2.5 rounded-lg text-sm font-bold outline-none focus:border-b4 transition-colors min-w-[200px]"
            placeholder="Add a task..."
          />
          <select 
            value={prio} onChange={e=>setPrio(e.target.value)}
            className="w-[110px] bg-bg3 border-[1.5px] border-brd text-tx px-3 py-2.5 rounded-lg text-sm font-bold outline-none focus:border-b4 transition-colors"
          >
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Med</option>
            <option value="low">🟢 Low</option>
          </select>
          <Button onClick={addTd}>Add</Button>
        </div>

        <div className="space-y-1.5">
          {sorted.length === 0 ? (
            <div className="text-center text-txM font-medium text-sm py-8 bg-bg3 rounded-xl border border-dashed border-brd">No tasks yet!</div>
          ) : (
            sorted.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-bg3 rounded-xl hover:bg-bgH transition-colors group">
                <div 
                  onClick={() => togTd(t.id)} 
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${t.done ? 'bg-em border-em shadow-sm' : 'border-brd hover:border-b4'}`}
                >
                  {t.done && <Check size={12} strokeWidth={4} color="white" />}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${t.priority==='high' ? 'bg-rose' : t.priority==='medium' ? 'bg-amb' : 'bg-em'}`} />
                <span className={`flex-1 text-sm font-bold truncate ${t.done ? 'line-through text-txM' : 'text-tx'}`}>
                  {t.text}
                </span>
                <button onClick={() => delTd(t.id)} className="text-txM opacity-0 md:opacity-100 md:invisible group-hover:visible hover:text-rose transition-all font-black text-sm w-6 h-6 rounded-full hover:bg-rose/10 flex items-center justify-center">✕</button>
              </div>
            ))
          )}
        </div>
      </Card>
    </motion.div>
  );
}
