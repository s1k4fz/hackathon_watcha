import React, { useRef, useEffect } from 'react';
import type { BattleLog, Character } from '../types/game';
import { stripEmotionTags } from '../services/emotionTags';

interface GameConsoleProps {
  logs: BattleLog[];
  onCommandSubmit: (command: string) => void;
  onSkillSelect: (skillId: string) => void;
  isProcessing: boolean;
  phase: string;
  currentPlayer: Character;
}

export const GameConsole: React.FC<GameConsoleProps> = ({ 
  logs, 
  onCommandSubmit, 
  onSkillSelect,
  isProcessing, 
  phase,
  currentPlayer
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isUserCharacter = currentPlayer.id.startsWith('user_');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onCommandSubmit(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Log Area - Expanded to fill available space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-gray-400 text-center mt-8 text-sm tracking-wide">
            {isUserCharacter ? 'AWAITING COMMAND...' : 'SYSTEM READY...'}
          </div>
        )}
        {logs.map((log, index) => (
          <div key={log.id || index} className={`flex ${log.speaker === 'player' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
             <div className={`
               max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
               ${log.speaker === 'player' 
                 ? 'bg-gray-100 text-gray-800 rounded-br-none' 
                 : 'bg-white border border-gray-100 text-gray-600 shadow-sm rounded-bl-none'}
             `}>
                <div className="text-[10px] font-bold mb-1 opacity-40 uppercase tracking-widest">
                  {log.speaker === 'system' ? 'SYSTEM' : log.speaker === 'player' ? currentPlayer.name : 'ENEMY'}
                </div>
                <div className="whitespace-pre-wrap">
                  {log.message.split('\n').map((line, i) => {
                    // Hide debug formulas in this clean view
                    if (line.startsWith('[公式]')) return null;
                    // Strip emotion tags like (happy), (sad) from display
                    const cleanLine = stripEmotionTags(line);
                    if (!cleanLine) return null;
                    return (
                      <span key={i}>
                        {cleanLine}
                        {i < log.message.split('\n').length - 1 && <br />}
                      </span>
                    );
                  })}
                </div>
             </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Clean Bar */}
      <div className="p-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100">
        {isUserCharacter ? (
          <div className="flex flex-wrap gap-2 justify-center">
            {currentPlayer.skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => onSkillSelect(skill.id)}
                disabled={isProcessing || phase === 'enemy_action'}
                className="
                  bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg 
                  shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none
                  transition-all duration-200 text-sm font-medium tracking-wide
                "
              >
                {skill.name}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing || phase === 'enemy_action'}
              placeholder={isProcessing ? `Connecting to ${currentPlayer.name}...` : `Enter command for ${currentPlayer.name}...`}
              className="
                w-full bg-white border border-gray-200 rounded-full pl-6 pr-24 py-3 text-sm 
                focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all
                placeholder-gray-400
              "
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing || phase === 'enemy_action'}
              className="
                absolute right-1 top-1 bottom-1 bg-gray-900 text-white px-6 rounded-full 
                text-xs font-bold tracking-wider disabled:opacity-50 hover:bg-gray-800 transition-colors
              "
            >
              SEND
            </button>
          </form>
        )}
      </div>
    </div>
  );
};