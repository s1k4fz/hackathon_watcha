import React from 'react';
import { motion } from 'framer-motion';
import type { Character } from '../types/game';
import { HealthBar } from './HealthBar';
import clsx from 'clsx';

interface CharacterDisplayProps {
  character: Character;
  isPlayer: boolean;
  isActive: boolean; // Is it this character's turn to act?
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, isPlayer, isActive }) => {
  return (
    <div className={clsx(
      "flex flex-col gap-4 relative z-10", 
      isPlayer ? "items-start" : "items-end"
    )}>
      {/* Name and HP */}
      <div className="w-64">
         <HealthBar 
           current={character.currentHp} 
           max={character.maxHp} 
           label={character.name}
           isPlayer={isPlayer}
         />
      </div>

      {/* Character Sprite Placeholder */}
      <motion.div 
        className={clsx(
          "w-48 h-64 rounded-xl border-4 shadow-2xl relative overflow-hidden transition-all duration-300",
          isPlayer ? "bg-indigo-900/50 border-indigo-400" : "bg-red-900/50 border-red-400",
          isActive && "ring-4 ring-yellow-400 scale-105"
        )}
        animate={{ 
          y: isActive ? [0, -10, 0] : 0,
        }}
        transition={{ 
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
        }}
      >
        {/* Avatar Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50 select-none">
          {isPlayer ? "🦸‍♀️" : "🦹‍♂️"}
        </div>
        
        {/* Status Effect Indicators could go here */}
        
      </motion.div>
      
      {/* Action Indicator */}
      {isActive && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 py-1 bg-yellow-500 text-black font-bold text-xs rounded-full uppercase tracking-widest absolute -bottom-3 left-1/2 -translate-x-1/2 shadow-lg"
        >
          Active
        </motion.div>
      )}
    </div>
  );
};
