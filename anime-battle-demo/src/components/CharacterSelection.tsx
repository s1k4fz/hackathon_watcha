import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Character } from '../types/game';
import { availableCharacters as defaultChars } from '../data/characters';
import { UserCreationModal } from './UserCreationModal';

interface CharacterSelectionProps {
  apiKey: string;
  onSelect: (character: Character) => void;
  customCharacters: Character[];
  onCharacterCreated: (character: Character) => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  apiKey, 
  onSelect, 
  customCharacters,
  onCharacterCreated 
}) => {
  const [showCreationModal, setShowCreationModal] = React.useState(false);
  
  // Combine default and custom characters
  const allCharacters = [...defaultChars, ...customCharacters];

  return (
    <div className="w-full h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-black mb-12 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400"
      >
        CHOOSE YOUR PARTNER
      </motion.h1>

      <div className="flex flex-wrap justify-center gap-8 z-10 max-w-6xl">
        {allCharacters.map((char, index) => (
          <motion.div
            key={char.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            onClick={() => onSelect(char)}
            className="group cursor-pointer relative w-80 bg-gray-900/50 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl hover:shadow-pink-500/20 transition-all duration-300"
          >
            {/* Card Header (Image Placeholder) */}
            <div className={`h-48 w-full ${char.id.includes('user') ? 'bg-indigo-900/40' : char.id === 'elysia' ? 'bg-pink-900/40' : 'bg-purple-900/40'} flex items-center justify-center relative overflow-hidden group-hover:bg-opacity-60 transition-all`}>
              <div className="text-8xl select-none filter blur-sm opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                {char.id.includes('user') ? '👤' : char.id === 'elysia' ? '🌸' : char.id === 'kiana' ? '🔥' : '⚡️'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 relative">
              <h2 className="text-2xl font-bold mb-1 text-white group-hover:text-pink-300 transition-colors truncate">
                {char.name}
              </h2>
              <div className="text-xs font-mono text-gray-400 mb-4 uppercase tracking-widest truncate">
                {char.id}
              </div>
              
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-4 h-16">
                {char.personality.split('\n')[0] || char.personality}
              </p>

              <div className="flex gap-2 mb-4">
                {char.skills.slice(0, 3).map(skill => (
                  <span key={skill.id} className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                    {/* Simplified type check */}
                    {skill.effects[0]?.type === 'damage' ? '⚔️' : skill.effects[0]?.type === 'defense' ? '🛡️' : '❤️'}
                  </span>
                ))}
                <span className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                  +{Math.max(0, char.skills.length - 3)}
                </span>
              </div>

              <button className="w-full py-3 mt-2 bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-bold uppercase tracking-wider transition-all">
                Select
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add New Character Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: allCharacters.length * 0.1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowCreationModal(true)}
          className="group cursor-pointer relative w-80 bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:bg-indigo-900/20 hover:border-indigo-500/50 transition-all duration-300"
        >
          <div className="p-4 rounded-full bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
            <Plus className="w-12 h-12 text-gray-500 group-hover:text-indigo-400" />
          </div>
          <span className="text-gray-500 font-bold tracking-widest group-hover:text-indigo-300">CREATE NEW</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCreationModal && (
          <UserCreationModal 
            apiKey={apiKey}
            onCharacterCreated={onCharacterCreated}
            onClose={() => setShowCreationModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
