import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface HealthBarProps {
  current: number;
  max: number;
  label?: string;
  isPlayer?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, label, isPlayer }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className={clsx("w-full max-w-md", isPlayer ? "items-end" : "items-start")}>
      <div className="flex justify-between mb-1 text-sm font-bold tracking-wider text-white uppercase text-shadow">
        <span>{label}</span>
        <span>{current} / {max}</span>
      </div>
      <div className="h-4 bg-gray-800 rounded-full border border-gray-600 overflow-hidden relative shadow-inner">
        {/* Background track pattern */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]" />
        
        {/* Actual Health Fill */}
        <motion.div 
          className={clsx(
            "h-full relative",
            percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-yellow-500" : "bg-red-500"
          )}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-30" />
        </motion.div>
      </div>
    </div>
  );
};
