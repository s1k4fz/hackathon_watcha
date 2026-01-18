import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().startsWith('sk-')) {
      onSubmit(key.trim());
    } else {
      alert("请输入有效的 OpenAI API Key (以 sk- 开头)");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-100 text-gray-900 p-4">
      <div className="border rounded-md bg-white p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">需要 API Key</h2>
        <p className="text-sm text-gray-600 mb-4">
          输入 OpenAI/OpenRouter API Key 后继续。
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="password" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="w-full border rounded px-3 py-2 text-sm"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!key}
            className="border rounded px-3 py-2 text-sm disabled:opacity-50"
          >
            确认
          </button>
        </form>
      </div>
    </div>
  );
};
