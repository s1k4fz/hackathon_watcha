import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import type { BattleLog } from '../types/game';

interface GameConsoleProps {
  logs: BattleLog[];
  onCommandSubmit: (command: string) => void;
  isProcessing: boolean;
  phase: string;
}

export const GameConsole: React.FC<GameConsoleProps> = ({ logs, onCommandSubmit, isProcessing, phase }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]); // Scroll whenever logs change (including streaming updates)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onCommandSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/80 backdrop-blur-md rounded-t-xl border-t border-indigo-500/30 overflow-hidden flex flex-col h-[300px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      {/* Log Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent">
        {logs.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic">
            等待指令... 试着输入 "先试探一下" 或 "全力进攻！"
          </div>
        )}
        
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={log.id || index} // Use ID if available for stable keys during updates
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-2 rounded border-l-2 ${
                log.speaker === 'player' 
                  ? 'bg-blue-900/20 border-blue-500 text-blue-200 ml-10' 
                  : log.speaker === 'enemy'
                  ? 'bg-red-900/20 border-red-500 text-red-200 mr-10'
                  : 'bg-gray-800/40 border-gray-500 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                 <span className="font-bold opacity-70 uppercase text-xs tracking-wider">
                  {log.speaker === 'system' ? 'SYSTEM' : log.speaker === 'player' ? 'COMMAND' : 'CHAR'}
                </span>
                {log.isStreaming && (
                   <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"/>
                )}
              </div>
             
              <div className="whitespace-pre-wrap leading-relaxed">
                {log.message}
                {log.isStreaming && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse align-middle" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-900/90 border-t border-gray-700 flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing || phase === 'enemy_action'}
            placeholder={isProcessing ? "正在联络琪亚娜..." : "输入战术指令 (例如: '小心点打', '全力进攻')"}
            className="w-full bg-gray-800 text-white rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4 opacity-50" />
        </div>
        
        <button
          type="submit"
          disabled={!input.trim() || isProcessing || phase === 'enemy_action'}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
