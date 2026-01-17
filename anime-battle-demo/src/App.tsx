import { useState } from 'react';
import { BattleScene } from './components/BattleScene';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CharacterSelection } from './components/CharacterSelection';
import type { Character } from './types/game';

function App() {
  // Try to get key from environment variables first
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [selectedParty, setSelectedParty] = useState<Character[]>([]);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);

  const handleCharacterCreated = (newChar: Character) => {
    console.log("Character Created:", newChar);
    setCustomCharacters(prev => {
      const newList = [...prev, newChar];
      console.log("Updated Custom Characters:", newList);
      return newList;
    });
    // Don't auto-select into battle anymore, let user choose in squad selection
    // But we might want to toggle it as selected in the UI? 
    // For now, just add to list and user picks.
  };

  const handleStartBattle = (party: Character[]) => {
    setSelectedParty(party);
  };

  if (!apiKey) {
    return (
      <div className="w-full h-screen bg-gray-950 text-white flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        <ApiKeyModal onSubmit={setApiKey} />
      </div>
    );
  }

  if (selectedParty.length === 0) {
    return (
      <CharacterSelection 
        apiKey={apiKey} 
        onStart={handleStartBattle} 
        customCharacters={customCharacters}
        onCharacterCreated={handleCharacterCreated}
      />
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center">
       <BattleScene 
         apiKey={apiKey} 
         initialParty={selectedParty}
       />
    </div>
  );
}

export default App;
