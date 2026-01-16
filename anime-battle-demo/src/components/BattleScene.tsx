import React from 'react';
import { useBattle } from '../hooks/useBattle';
import { CharacterDisplay } from './CharacterDisplay';
import { GameConsole } from './GameConsole';
import { motion } from 'framer-motion';

interface BattleSceneProps {
  apiKey: string;
}

export const BattleScene: React.FC<BattleSceneProps> = ({ apiKey }) => {
  const { battleState, handleCommand } = useBattle(apiKey);
  const { player, enemy, phase, logs, isProcessing } = battleState;

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
        <div className="text-sm font-mono text-gray-400">
          TURN: <span className="text-white text-lg">{battleState.turn}</span>
        </div>
      </header>

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
