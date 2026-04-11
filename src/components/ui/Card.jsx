import React from 'react';
import { motion } from 'framer-motion';

export function Card({ children, className = '', noPadding = false, ...props }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-bg2 border border-brd rounded-[20px] shadow-s1 transition-all hover:-translate-y-1 hover:shadow-s2 hover:border-b3 relative overflow-hidden ${noPadding ? '' : 'p-5'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
