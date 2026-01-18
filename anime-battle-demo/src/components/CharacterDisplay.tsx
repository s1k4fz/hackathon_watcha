import React from 'react';
import type { Character } from '../types/game';
import { HealthBar } from './HealthBar';
import { getCharacterPortrait } from '../utils/assetLoader';

interface CharacterDisplayProps {
  character: Character;
  isPlayer: boolean;
  isActive: boolean;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, isPlayer, isActive }) => {
  const portraitUrl = getCharacterPortrait(character.id);

    return (
      <div className={`relative ${isPlayer ? 'items-end' : 'items-start'}`}>
       {/* Name Tag & Health - Fixed at Top Center */}
       {isActive && (
         <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center w-full max-w-4xl pointer-events-none">
           <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic drop-shadow-2xl mb-2">
             {character.name}
           </h3>
           <div className="w-[400px] shadow-2xl">
             <HealthBar 
               current={character.currentHp} 
               max={character.maxHp} 
               label=""
               isPlayer={isPlayer}
             />
           </div>
         </div>
       )}

        {/* Portrait - No Border, Huge */}
      <div className={`
        relative transition-all duration-500
        ${isActive ? 'scale-110 brightness-110' : 'scale-100 grayscale opacity-60'}
      `}>
        {portraitUrl ? (
          <img 
            src={portraitUrl} 
            alt={character.name} 
            className="h-[85vh] w-auto object-contain drop-shadow-2xl"
          />
        ) : (
          /* Fallback Character Sprite/Placeholder */
          <div className="h-[80vh] w-96 flex items-center justify-center bg-gray-100 rounded-3xl">
            <div className="text-9xl text-gray-300 font-bold select-none">{character.name[0]}</div>
          </div>
        )}
      </div>
    </div>
  );
};
