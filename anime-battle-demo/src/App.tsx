import React, { useState } from 'react';
import { BattleScene } from './components/BattleScene';
import { ApiKeyModal } from './components/ApiKeyModal';

function App() {
  // Try to get key from environment variables first
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENROUTER_API_KEY || '');

  if (!apiKey) {
    return (
      <div className="w-full h-screen bg-gray-950 text-white flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
        <ApiKeyModal onSubmit={setApiKey} />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center">
       <BattleScene apiKey={apiKey} />
    </div>
  );
}

export default App;
