import React, { useState } from 'react';
import { useBattle } from '../hooks/useBattle';
import { CharacterDisplay } from './CharacterDisplay';
import { GameConsole } from './GameConsole';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../types/game';
import { availableCharacters } from '../data/characters';
import { Users } from 'lucide-react';

interface BattleSceneProps {
  apiKey: string;
  playerCharacter: Character;
}

export const BattleScene: React.FC<BattleSceneProps> = ({ apiKey, playerCharacter }) => {
  const { battleState, handleCommand, switchCharacter } = useBattle(apiKey, playerCharacter);
  const { player, enemy, phase, logs, isProcessing } = battleState;
  const [showCharSelect, setShowCharSelect] = useState(false);

  return (
    <div className="relative w-full max-w-6xl mx-auto h-screen max-h-[900px] flex flex-col p-4">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-indigo-950/40">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center py-4 px-6 bg-black/30 rounded-full mb-8 backdrop-blur-sm border border-white/10">
        <div className="text-xl font-bold text-white tracking-widest">
          BATTLE SYSTEM <span className="text-yellow-500 text-xs ml-2">DEMO VER.</span>
        </div>
        
        {/* Switch Character Button */}
        <button 
          onClick={() => setShowCharSelect(!showCharSelect)}
          disabled={phase !== 'player_input' || isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 rounded-lg text-sm text-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Users className="w-4 h-4" />
          <span>切换角色</span>
        </button>

        <div className="text-sm font-mono text-gray-400">
          TURN: <span className="text-white text-lg">{battleState.turn}</span>
        </div>
      </header>

      {/* Character Switch Overlay */}
      <AnimatePresence>
        {showCharSelect && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 z-50 flex justify-center gap-4 p-4"
          >
            <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex gap-4">
              {availableCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => {
                    if (char.id !== player.id) {
                      switchCharacter(char);
                      setShowCharSelect(false);
                    }
                  }}
                  className={`relative w-24 h-32 rounded-lg border-2 overflow-hidden transition-all ${char.id === player.id ? 'border-yellow-500 ring-2 ring-yellow-500/50' : 'border-gray-600 hover:border-white'}`}
                >
                  <div className={`absolute inset-0 ${char.id === 'kiana' ? 'bg-orange-500/20' : char.id === 'elysia' ? 'bg-pink-500/20' : 'bg-purple-500/20'}`} />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
                    {char.id === 'kiana' ? '🔥' : char.id === 'elysia' ? '🌸' : '⚡️'}
                  </div>
                  <div className="absolute bottom-0 w-full bg-black/60 text-[10px] py-1 text-center font-bold truncate px-1">
                    {char.name}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Battle Area */}
      <div className="flex-1 flex justify-between items-center px-10 relative">
        
        {/* Player Side */}
        <CharacterDisplay 
          character={player} 
          isPlayer={true} 
          isActive={phase === 'player_action' || phase === 'player_input' || phase === 'ai_processing'}
        />

        {/* VS Badge or Effect */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 italic select-none">
          VS
        </div>

        {/* Enemy Side */}
        <CharacterDisplay 
          character={enemy} 
          isPlayer={false} 
          isActive={phase === 'enemy_action'}
        />

      </div>

      {/* Victory/Defeat Overlay */}
      {(phase === 'victory' || phase === 'defeat') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="text-center p-10 bg-black/80 border-2 border-white rounded-xl">
            <h1 className={`text-6xl font-black mb-4 ${phase === 'victory' ? 'text-yellow-400' : 'text-red-500'}`}>
              {phase === 'victory' ? 'VICTORY' : 'DEFEAT'}
            </h1>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
            >
              再次战斗
            </button>
          </div>
        </motion.div>
      )}

      {/* Console / Controls */}
      <div className="mt-8 relative z-20">
        <GameConsole 
          logs={logs} 
          onCommandSubmit={handleCommand} 
          isProcessing={isProcessing}
          phase={phase}
        />
      </div>

    </div>
  );
};
