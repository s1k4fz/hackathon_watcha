import React, { useState, useEffect } from 'react';
import { useBattle } from '../hooks/useBattle';
import { CharacterDisplay } from './CharacterDisplay';
import { GameConsole } from './GameConsole';
import type { Character } from '../types/game';
import { getCharacterAvatar, getBackground } from '../utils/assetLoader';

interface BattleSceneProps {
  apiKey: string;
  initialParty: Character[];
  initialEnemy?: Character;
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
}

export const BattleScene: React.FC<BattleSceneProps> = ({ apiKey, initialParty, initialEnemy, onBattleEnd }) => {
  const { battleState, handleCommand, handleSkillSelection } = useBattle(apiKey, initialParty, initialEnemy);
  const { player, enemy, phase, logs, isProcessing, activeBonds, actionQueue } = battleState;
  const [showCharSelect, setShowCharSelect] = useState(false);
  const [showBonds, setShowBonds] = useState(false);

  // Trigger onBattleEnd callback when battle concludes
  useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') {
      const timer = setTimeout(() => {
        onBattleEnd?.(phase);
      }, 2000); // 2 second delay to let player read the result
      return () => clearTimeout(timer);
    }
  }, [phase, onBattleEnd]);

  const battleBg = getBackground('battle_bg');

  return (
    <div 
      className="relative w-full h-screen overflow-hidden font-sans selection:bg-gray-200"
      style={battleBg ? {
        backgroundImage: `url(${battleBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {
        backgroundColor: '#f9fafb' // bg-gray-50 equivalent
      }}
    >
      
      {/* 1. Action Bar (Top Left) */}
      <div className="absolute left-6 top-6 flex flex-col gap-2 z-30">
        <div className="text-sm font-bold text-gray-400 mb-1 tracking-wider">ACTION ORDER</div>
        {actionQueue.map((char, i) => {
          const avatar = getCharacterAvatar(char.id);
          return (
            <div 
              key={`${char.id}-${i}`} 
              className={`
                relative flex items-center border transition-all duration-300 bg-white overflow-hidden
                ${i === 0 ? 'w-60 h-20 border-gray-800 shadow-lg translate-x-2' : 'w-48 h-12 opacity-60 border-gray-200'}
                ${char.id.startsWith('enemy') ? 'border-red-200' : ''}
              `}
            >
              {/* Background Avatar Image */}
              {avatar && (
                 <img 
                   src={avatar} 
                   alt={char.name} 
                   className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale contrast-125"
                 />
              )}

              {/* Content Overlay */}
              <div className="relative z-10 flex items-center w-full px-4 py-2">
                  <div className={`font-mono mr-4 ${i === 0 ? 'text-2xl font-black text-gray-800' : 'text-sm text-gray-400'}`}>0{i + 1}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`truncate ${i === 0 ? 'text-base font-bold text-gray-900' : 'text-xs text-gray-500'} ${char.id.startsWith('enemy') ? 'text-red-800' : ''}`}>
                      {char.name}
                    </div>
                    {i === 0 && (
                      <div className="text-[10px] text-gray-500 font-mono tracking-tighter font-bold">
                        SPD {char.stats.speed} | AV {char.currentActionValue ? Math.round(char.currentActionValue) : 0}
                      </div>
                    )}
                  </div>

                  {char.id.startsWith('enemy') && (
                    <div className="w-2 h-2 rounded-full bg-red-500 ml-2 animate-pulse"></div>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Main Stage (Active Character Only) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* Render only the active character based on phase */}
        {phase === 'enemy_action' ? (
             /* Enemy Display - Positioned Right */
             <div className="absolute right-0 bottom-0 pointer-events-auto transition-all duration-500 origin-bottom-right">
               <CharacterDisplay 
                 character={enemy} 
                 isPlayer={false} 
                 isActive={true} 
               />
               
               {/* Enemy Speech Bubble (Simulated from last enemy log) */}
               {(() => {
                 const lastEnemyLog = logs.filter(l => l.speaker === 'enemy' && !l.message.includes('使用')).pop();
                 // Show only if it's the very last log or close to it
                 const isRecent = lastEnemyLog && logs.indexOf(lastEnemyLog) >= logs.length - 2;
                 
                 if (isRecent && lastEnemyLog) {
                   return (
                     <div className="absolute top-32 left-0 -translate-x-full bg-black/80 text-white p-6 rounded-xl rounded-tr-none border border-red-500/50 max-w-sm animate-bounce-in z-50">
                        <div className="text-sm text-red-400 font-bold mb-2 uppercase tracking-wider">{enemy.name}</div>
                        <div className="text-lg font-medium leading-relaxed">{lastEnemyLog.message}</div>
                     </div>
                   );
                 }
                 return null;
               })()}
             </div>
        ) : (
             /* Player Display - Positioned Right */
             <div className="absolute right-0 bottom-0 pointer-events-auto transition-all duration-500 origin-bottom-right">
               <CharacterDisplay 
                 character={player} 
                 isPlayer={true} 
                 isActive={true} 
               />
             </div>
        )}
      </div>

      {/* 3. Dialogue Box (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[800px] max-w-[90%] z-40">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-xl overflow-hidden h-64 flex flex-col">
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

      {/* 4. Top Controls -> Moved to Bottom Left (except Bonds) */}
      <div className="absolute bottom-6 left-6 flex flex-col-reverse gap-4 z-50">
         <div className="text-left">
             <div className="text-6xl font-black text-gray-200 tracking-tighter opacity-80 select-none">TURN {battleState.turn}</div>
         </div>
         
         <div className="flex justify-start gap-2">
            <button
                onClick={() => setShowCharSelect(!showCharSelect)}
                className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                title="Switch Character"
            >
                <span className="text-gray-600 text-[10px] font-bold tracking-widest">TEAM</span>
            </button>

            <button
              onClick={() => setShowBonds(!showBonds)}
              className={`
                w-12 h-12 border rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm
                ${showBonds ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-200 text-gray-600'}
                ${activeBonds.length === 0 ? 'opacity-50 grayscale' : ''}
              `}
              title="View Bonds"
            >
               <span className="text-[10px] font-bold tracking-widest">BOND</span>
            </button>
         </div>
      </div>

      {/* Bond Popover - Moved to Bottom Left (Opening Upwards) */}
      {showBonds && (
        <div className="absolute bottom-24 left-20 bg-white border border-gray-200 rounded-xl p-5 shadow-xl w-72 animate-in fade-in slide-in-from-bottom-2 z-50 origin-bottom-left">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Combat Links</h3>
            <button 
              onClick={() => setShowBonds(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {activeBonds.length > 0 ? (
              activeBonds.map(bond => (
                <div key={bond.id} className="group">
                  <div className="font-bold text-indigo-900 text-sm mb-0.5">{bond.name}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{bond.description}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-xs italic text-center py-4">No active combat links</div>
            )}
          </div>
        </div>
      )}

      {/* Popovers - Team Select */}
      {showCharSelect && (
        <div className="absolute bottom-24 left-6 bg-white border border-gray-200 rounded-lg p-4 shadow-xl z-50 w-64 origin-bottom-left animate-in zoom-in-95">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Squad Status</h3>
             <button 
               onClick={() => setShowCharSelect(false)}
               className="text-gray-400 hover:text-gray-600 transition-colors"
             >
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
           </div>
           <div className="flex flex-col gap-2">
            {battleState.party.map(char => (
              <div
                key={char.id}
                className={`
                   flex items-center justify-between p-2 rounded border transition-colors
                   ${char.id === player.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-100 text-gray-500'}
                `}
              >
                <div className="flex flex-col">
                   <span className="text-sm font-bold">{char.name}</span>
                   {char.id === player.id && <span className="text-[9px] uppercase tracking-widest text-gray-400">Active</span>}
                </div>
                <span className="text-xs font-mono">{char.currentHp}/{char.maxHp} HP</span>
              </div>
            ))}
           </div>
        </div>
      )}

       {/* Turn/Phase Indicator (Top Left) - REMOVED as it is now in Top Right */}
       
    </div>
  );
};
