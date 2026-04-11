import React from 'react';
import { motion } from 'framer-motion';

export function Button({ variant = 'primary', className = '', ...props }) {
  const baseClass = "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap focus:outline-none";
  
  const variants = {
    primary: "bg-gradient-to-br from-b6 to-ind text-white hover:shadow-sB hover:scale-[1.02]",
    secondary: "bg-bg3 border-2 border-brd text-tx hover:bg-bgH",
    glass: "bg-white/15 backdrop-blur-md text-white border border-white/20 hover:bg-white/25",
    glassGold: "bg-white/15 backdrop-blur-md text-amb-400 border border-white/20 hover:bg-white/25",
    glassRose: "bg-rose-500/15 backdrop-blur-md text-rose-300 border border-rose-500/20 hover:bg-rose-500/30",
    destructive: "bg-roseBg text-rose border border-rose/20 hover:bg-rose/20",
    success: "bg-gradient-to-br from-em to-teal text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:scale-[1.02]",
    warning: "bg-gradient-to-br from-amb to-amber-600 text-white hover:scale-[1.02]",
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
