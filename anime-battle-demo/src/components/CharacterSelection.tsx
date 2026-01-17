import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Play } from 'lucide-react';
import type { Character } from '../types/game';
import { availableCharacters as defaultChars } from '../data/characters';
import { UserCreationModal } from './UserCreationModal';

interface CharacterSelectionProps {
  apiKey: string;
  onStart: (selectedParty: Character[]) => void;
  customCharacters: Character[];
  onCharacterCreated: (character: Character) => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  apiKey, 
  onStart, 
  customCharacters,
  onCharacterCreated 
}) => {
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  
  // Combine default and custom characters
  const allCharacters = [...defaultChars, ...customCharacters];

  const handleToggleChar = (char: Character) => {
    setSelectedCharIds(prev => {
      if (prev.includes(char.id)) {
        return prev.filter(id => id !== char.id);
      } else {
        if (prev.length >= 4) return prev; // Max 4
        return [...prev, char.id];
      }
    });
  };

  const handleStartGame = () => {
    const selectedParty = allCharacters.filter(c => selectedCharIds.includes(c.id));
    if (selectedParty.length > 0) {
      onStart(selectedParty);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-950 text-white flex flex-col items-center justify-start p-8 relative overflow-y-auto">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none fixed" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none fixed" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 blur-[120px] rounded-full pointer-events-none fixed" />

      <div className="flex flex-col items-center mb-10 mt-8 z-10">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 text-center"
        >
          ASSEMBLE YOUR TEAM
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-2 font-mono text-sm"
        >
          SELECT UP TO 4 MEMBERS ({selectedCharIds.length}/4)
        </motion.p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 z-10 max-w-7xl pb-32">
        {allCharacters.map((char, index) => {
          const isSelected = selectedCharIds.includes(char.id);
          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleToggleChar(char)}
              className={`group cursor-pointer relative w-72 bg-gray-900/50 backdrop-blur-md rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 flex flex-col ${
                isSelected 
                  ? 'border-pink-500 ring-2 ring-pink-500/50 scale-105' 
                  : 'border-white/10 hover:border-pink-500/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 z-20 bg-pink-500 text-white rounded-full p-1 shadow-lg">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}

              {/* Card Header (Image Placeholder) */}
              <div className={`h-40 w-full ${char.id.includes('user') ? 'bg-indigo-900/40' : char.id === 'elysia' ? 'bg-pink-900/40' : 'bg-purple-900/40'} flex items-center justify-center relative overflow-hidden group-hover:bg-opacity-60 transition-all`}>
                <div className="text-7xl select-none filter blur-sm opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                  {(() => {
                    if (char.id.includes('user')) return '👤';
                    if (char.id === 'elysia') return '🌸';
                    if (char.id === 'kiana') return '🔥';
                    if (char.id === 'mei') return '⚡️';
                    if (char.id === 'linque') return '🐦';
                    if (char.id === 'luoshu') return '📘';
                    if (char.id === 'helga') return '⚔️';
                    if (char.id === 'zizhi') return '🐭';
                    if (char.id === 'simon') return '👁️';
                    if (char.id === 'uni') return '🎤';
                    return '✨';
                  })()}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5 relative flex-1 flex flex-col">
                <h2 className="text-xl font-bold mb-1 text-white group-hover:text-pink-300 transition-colors truncate">
                  {char.name}
                </h2>
                <div className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-widest truncate flex items-center justify-between">
                  <span>{char.id}</span>
                  {char.faction && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700">
                      {char.faction === 'dawn_legacy' ? '晓光' : 
                       char.faction === 'crimson_heavy' ? '绯红' :
                       char.faction === 'wasteland_drifters' ? '荒原' :
                       char.faction === 'deep_dive' ? '深潜' : '其他'}
                    </span>
                  )}
                </div>
                
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4 h-12">
                  {char.personality.split('\n')[0] || char.personality}
                </p>

                <div className="flex gap-2 mb-4 mt-auto">
                  {char.skills.slice(0, 3).map(skill => (
                    <span key={skill.id} className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                      {skill.effects[0]?.type === 'damage' ? '⚔️' : skill.effects[0]?.type === 'defense' ? '🛡️' : '❤️'}
                    </span>
                  ))}
                  <span className="text-[10px] px-2 py-1 bg-white/5 rounded border border-white/10 text-gray-400">
                    +{Math.max(0, char.skills.length - 3)}
                  </span>
                </div>

                <div className={`w-full py-2 mt-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center transition-all ${
                  isSelected ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400'
                }`}>
                  {isSelected ? 'SELECTED' : 'SELECT'}
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Add New Character Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: allCharacters.length * 0.1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowCreationModal(true)}
          className="group cursor-pointer relative w-72 h-[340px] bg-gray-900/30 backdrop-blur-sm rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:bg-indigo-900/20 hover:border-indigo-500/50 transition-all duration-300"
        >
          <div className="p-4 rounded-full bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
            <Plus className="w-12 h-12 text-gray-500 group-hover:text-indigo-400" />
          </div>
          <span className="text-gray-500 font-bold tracking-widest group-hover:text-indigo-300">CREATE NEW</span>
        </motion.div>
      </div>

      {/* Floating Start Button */}
      <AnimatePresence>
        {selectedCharIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 z-50"
          >
            <button
              onClick={handleStartGame}
              className="px-12 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-black text-xl shadow-lg hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/20"
            >
              <span>DEPLOY SQUAD</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{selectedCharIds.length}/4</span>
              <Play fill="currentColor" size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
