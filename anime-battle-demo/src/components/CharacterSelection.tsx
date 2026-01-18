import React, { useState } from 'react';
import type { Character } from '../types/game';
import { availableCharacters as defaultChars, initialEnemy } from '../data/characters';
import { UserCreationModal } from './UserCreationModal';
import { getCharacterPortrait, getCharacterCard } from '../utils/assetLoader';

interface CharacterSelectionProps {
  apiKey: string;
  onStart: (selectedParty: Character[]) => void;
  customCharacters: Character[];
  onCharacterCreated: (character: Character) => void;
  enemy?: Character;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({ 
  apiKey, 
  onStart, 
  customCharacters,
  onCharacterCreated,
  enemy
}) => {
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  
  // Combine default and custom characters
  const allCharacters = [...defaultChars, ...customCharacters];
  const targetEnemy = enemy || initialEnemy;

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

  const enemyPortrait = getCharacterPortrait(targetEnemy.id);

  return (
    <div className="w-full h-screen bg-gray-50 flex overflow-hidden font-sans">
      {/* Left Panel: Character Selection */}
      <div className="flex-1 flex flex-col p-8 gap-6 overflow-y-auto border-r border-gray-200">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Squad Selection</h1>
            <p className="text-gray-400 text-sm mt-1 tracking-wide">
              SELECT UP TO 4 AGENTS // CURRENT: <span className="text-gray-900 font-bold">{selectedCharIds.length}</span>/4
            </p>
          </div>
          
          <button
             onClick={() => setShowCreationModal(true)}
             className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold tracking-wider hover:bg-gray-50 transition-colors uppercase"
          >
            + Create Agent
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {allCharacters.map(char => {
            const isSelected = selectedCharIds.includes(char.id);
            // 联动角色(kiana, elysia, mei)和用户创建角色都算作 Custom
            const isUserCreated = char.id.startsWith('user_') || ['kiana', 'elysia', 'mei'].includes(char.id);
            
            // 使用专用卡片立绘，如果没有则回退到全身立绘
            const cardImage = getCharacterCard(char.id);
            
            return (
              <button
                key={char.id}
                onClick={() => handleToggleChar(char)}
                className={`
                  group relative flex flex-col text-left transition-all duration-300 border overflow-hidden
                  aspect-[3/5]
                  ${isSelected 
                    ? `bg-gray-900 text-white shadow-xl scale-105 z-10 ${isUserCreated ? 'border-gray-900 ring-2 ring-white/50' : 'border-gray-900'}`
                    : `bg-white hover:shadow-md ${isUserCreated ? 'border-2 border-gray-800 text-gray-900' : 'border border-gray-200 hover:border-gray-400 text-gray-500 hover:text-gray-700'}`
                  }
                `}
              >
                {/* User Tag */}
                {isUserCreated && (
                  <div className={`
                    absolute top-2 left-2 z-20 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm
                    ${isSelected ? 'bg-white text-black' : 'bg-gray-900 text-white'}
                  `}>
                    CUSTOM
                  </div>
                )}

                {/* Card Image Area */}
                <div className={`flex-1 w-full relative overflow-hidden ${isSelected ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    {cardImage ? (
                      <img 
                        src={cardImage} 
                        alt={char.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 text-6xl font-black select-none">
                          {char.name[0]}
                      </div>
                    )}
                </div>

                {/* Info Area */}
                <div className="p-3 flex flex-col gap-1 border-t border-white/10 z-10 bg-inherit">
                   <div className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                      {char.faction || 'UNKNOWN'}
                   </div>
                   <div className={`text-lg font-bold leading-none truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                      {char.name}
                   </div>
                   
                   <div className={`flex justify-between items-center mt-2 pt-2 border-t border-dashed ${isSelected ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>SPD {char.stats.speed}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>ATK {char.stats.attack}</div>
                   </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)] z-20"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-8">
           <button
            onClick={handleStartGame}
            disabled={selectedCharIds.length === 0}
            className="
              w-full py-4 bg-gray-900 text-white font-black text-xl tracking-widest uppercase
              disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gray-800 transition-all
            "
          >
            Deploy Squad
          </button>
        </div>
      </div>

      {/* Right Panel: Enemy Preview */}
      <div className="w-[40%] bg-gray-100 p-8 flex flex-col justify-center items-center relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 text-[200px] font-black text-gray-200 leading-none select-none opacity-50">
            VS
         </div>

         <div className="z-10 w-full max-w-md">
            <div className="text-center mb-8">
               <h2 className="text-xs font-bold text-red-500 tracking-[0.2em] mb-2 uppercase">Target Identified</h2>
               <div className="text-5xl font-black text-gray-900 mb-4">{targetEnemy.name}</div>
               <div className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-mono font-bold uppercase tracking-wide">
                  Level {targetEnemy.stats.level} Threat
               </div>
            </div>

            {/* Enemy Card / Visual */}
            <div className="aspect-[3/4] bg-white border border-gray-200 shadow-xl relative group overflow-hidden">
               {/* Placeholder for Enemy Art */}
               <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  {enemyPortrait ? (
                      <img src={enemyPortrait} alt={targetEnemy.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-9xl font-black text-gray-200 select-none">
                      {targetEnemy.name[0]}
                    </span>
                  )}
               </div>
               
               {/* Stats Overlay */}
               <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div>
                        <div className="text-gray-400 text-[10px] uppercase tracking-wider">HP</div>
                        <div className="font-mono font-bold text-gray-800">{targetEnemy.maxHp}</div>
                     </div>
                     <div>
                        <div className="text-gray-400 text-[10px] uppercase tracking-wider">ATK</div>
                        <div className="font-mono font-bold text-gray-800">{targetEnemy.stats.attack}</div>
                     </div>
                     <div className="col-span-2">
                        <div className="text-gray-400 text-[10px] uppercase tracking-wider">Description</div>
                        <div className="text-gray-600 text-xs mt-1 leading-relaxed">
                           {targetEnemy.personality}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showCreationModal && (
        <UserCreationModal 
          apiKey={apiKey}
          onCharacterCreated={onCharacterCreated}
          onClose={() => setShowCreationModal(false)}
        />
      )}
    </div>
  );
};