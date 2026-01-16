import React, { useState } from 'react';
import { Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-gray-800 p-8 rounded-2xl border border-indigo-500/50 shadow-2xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/50">
           <Lock className="text-white w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">系统启动需要密钥</h2>
        <p className="text-gray-400 mb-6 text-sm">
          本项目需要调用 OpenAI API 来驱动角色 AI。<br/>
          您的 Key 仅存储在本地内存中，刷新后失效。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-black/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            autoFocus
          />
          <button 
            type="submit"
            disabled={!key}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            启动神经连接
          </button>
        </form>
        
        <p className="mt-4 text-xs text-gray-500">
          如果没有 Key，请联系开发者或使用测试账号。
        </p>
      </div>
    </div>
  );
};
