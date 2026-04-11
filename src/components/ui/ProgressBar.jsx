import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({ progress, colorClass = 'from-b5 to-b4', className = '' }) {
  return (
    <div className={`w-full h-2 bg-b0 rounded-full overflow-hidden ${className}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
      />
    </div>
  );
}
