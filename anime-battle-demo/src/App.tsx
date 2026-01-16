import React, { useState } from 'react';
import { BattleScene } from './components/BattleScene';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CharacterSelection } from './components/CharacterSelection';
import type { Character } from './types/game';

function App() {
  // Try to get key from environment variables first
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);

  const handleCharacterCreated = (newChar: Character) => {
    console.log("Character Created:", newChar);
    // Use functional update to ensure we have the latest state, 
    // AND explicitly pass the new list to BattleScene via state to avoid race conditions
    setCustomCharacters(prev => {
      const newList = [...prev, newChar];
      console.log("Updated Custom Characters:", newList);
      return newList;
    });
    setSelectedChar(newChar); 
  };

  if (!apiKey) {
    return (
      <div className="w-full h-screen bg-gray-950 text-white flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        <ApiKeyModal onSubmit={setApiKey} />
      </div>
    );
  }

  if (!selectedChar) {
    return (
      <CharacterSelection 
        apiKey={apiKey} 
        onSelect={setSelectedChar} 
        customCharacters={customCharacters}
        onCharacterCreated={handleCharacterCreated}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center">
       <BattleScene 
         apiKey={apiKey} 
         playerCharacter={selectedChar} 
         customCharacters={customCharacters}
       />
    </div>
  );
}

export default App;
