import React, { useState } from 'react';
import { BattleScene } from './components/BattleScene';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CharacterSelection } from './components/CharacterSelection';
import type { Character } from './types/game';

function App() {
  // Try to get key from environment variables first
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  if (!apiKey) {
    return (
      <div className="w-full h-screen bg-gray-950 text-white flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        <ApiKeyModal onSubmit={setApiKey} />
      </div>
    );
  }

  if (!selectedChar) {
    return <CharacterSelection onSelect={setSelectedChar} />;
  }

  return (
    <div className="w-full h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center">
       <BattleScene apiKey={apiKey} playerCharacter={selectedChar} />
    </div>
  );
}

export default App;
