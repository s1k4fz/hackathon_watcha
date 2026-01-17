import React, { useState } from 'react';
import { useBattle } from '../hooks/useBattle';
import { CharacterDisplay } from './CharacterDisplay';
import { GameConsole } from './GameConsole';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../types/game';
import { Users, Link, Zap } from 'lucide-react';

interface BattleSceneProps {
  apiKey: string;
  initialParty: Character[];
}

export const BattleScene: React.FC<BattleSceneProps> = ({ apiKey, initialParty }) => {
  const { battleState, handleCommand, handleSkillSelection, switchCharacter } = useBattle(apiKey, initialParty);
  const { player, enemy, phase, logs, isProcessing, activeBonds, actionQueue } = battleState;
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showBonds, setShowBonds] = useState(false);

  return (
    <div className="relative w-full max-w-6xl mx-auto h-screen max-h-[900px] flex flex-col p-4">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-indigo-950/40">
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Header */}
      <header className="flex justify-between items-center py-4 px-6 bg-black/30 rounded-full mb-8 backdrop-blur-sm border border-white/10 relative">
        <div className="text-xl font-bold text-white tracking-widest flex items-center gap-4">
          <span>BATTLE SYSTEM <span className="text-yellow-500 text-xs ml-2">DEMO VER.</span></span>
          
          {/* Active Bonds Badge */}
          {activeBonds.length > 0 && (
            <button 
              onClick={() => setShowBonds(!showBonds)}
              className="group relative flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-500 hover:bg-yellow-500/20 transition-all cursor-pointer"
            >
              <Link size={14} />
              <span className="font-bold">{activeBonds.length} 羁绊生效</span>
              
              {/* Tooltip for Bonds */}
              <AnimatePresence>
                {showBonds && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-3 w-64 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-xl z-50 text-left"
                  >
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Active Resonance</h4>
                    <div className="space-y-3">
                      {activeBonds.map(bond => (
                        <div key={bond.id} className="text-sm">
                          <div className="font-bold text-yellow-400">{bond.name}</div>
                          <div className="text-gray-300 text-xs">{bond.description}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
        
        {/* Switch Character Button */}
        <button 
          onClick={() => setShowCharSelect(!showCharSelect)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 rounded-lg text-sm text-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Users className="w-4 h-4" />
          <span>查看状态</span>
        </button>

        <div className="text-sm font-mono text-gray-400">
          TURN: <span className="text-white text-lg">{battleState.turn}</span>
        </div>
      </header>

      {/* Action Bar (Speed System UI) */}
      {actionQueue && actionQueue.length > 0 && (
        <div className="absolute left-6 top-24 bottom-24 w-16 z-30 flex flex-col items-center pointer-events-none">
            <div className="text-[10px] text-gray-500 font-bold mb-2 tracking-widest uppercase rotate-90 origin-bottom translate-x-4">Action Order</div>
            <div className="flex-1 flex flex-col gap-2 w-full">
                {actionQueue.map((char, i) => (
                    <motion.div 
                        key={`${char.id}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden shadow-lg ${i === 0 ? 'scale-110 border-yellow-400 ring-2 ring-yellow-400/30' : 'border-gray-600 opacity-80'}`}
                    >
                        <div className={`absolute inset-0 ${char.id.startsWith('enemy') ? 'bg-red-900' : 'bg-indigo-900'}`} />
                        <div className="absolute inset-0 flex items-center justify-center text-xl">
                            {(() => {
                                if (char.id.includes('user')) return '👤';
                                if (char.id.startsWith('enemy')) return '💀';
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
                        {i === 0 && (
                            <div className="absolute -right-1 -top-1 bg-yellow-500 text-black text-[8px] font-bold px-1 rounded">NEXT</div>
                        )}
                    </motion.div>
                ))}
                <div className="flex-1 w-0.5 bg-gradient-to-b from-gray-700 to-transparent mx-auto opacity-30 my-2" />
            </div>
        </div>
      )}

      {/* Character Switch Overlay */}
      <AnimatePresence>
        {showCharSelect && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-0 right-0 z-50 flex justify-center gap-4 p-4 pointer-events-none"
          >
            <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-2xl flex gap-4 pointer-events-auto">
              {/* Iterate over PARTY state instead of static list to show current HP */}
              {battleState.party.map(char => (
                <button
                  key={char.id}
                  onClick={() => {
                    if (char.id !== player.id) {
                      switchCharacter(char.id); // Pass ID instead of object
                      setShowCharSelect(false);
                    }
                  }}
                  className={`relative w-24 h-32 rounded-lg border-2 overflow-hidden transition-all ${char.id === player.id ? 'border-yellow-500 ring-2 ring-yellow-500/50' : 'border-gray-600 hover:border-white'}`}
                >
                  <div className={`absolute inset-0 ${char.id === 'kiana' ? 'bg-orange-500/20' : char.id === 'elysia' ? 'bg-pink-500/20' : 'bg-purple-500/20'}`} />
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">
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
                  <div className="absolute bottom-0 w-full bg-black/60 text-[10px] py-1 text-center font-bold truncate px-1 flex flex-col">
                    <span>{char.name}</span>
                    <span className={`text-[8px] ${char.currentHp <= 0 ? 'text-red-500' : 'text-green-400'}`}>
                       HP: {char.currentHp}/{char.maxHp}
                    </span>
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
          onSkillSelect={handleSkillSelection}
          isProcessing={isProcessing}
          phase={phase}
          currentPlayer={player}
        />
      </div>

    </div>
  );
};
