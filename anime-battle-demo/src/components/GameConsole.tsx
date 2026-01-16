import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Sword, Shield, Heart } from 'lucide-react';
import type { BattleLog, Character, Skill } from '../types/game';
import clsx from 'clsx';

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
// ... existing useEffect ...
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

  const getSkillIcon = (skill: Skill) => {
    if (skill.effects.some(e => e.type === 'heal')) return <Heart className="w-4 h-4 text-pink-400" />;
    if (skill.effects.some(e => e.type === 'defense')) return <Shield className="w-4 h-4 text-blue-400" />;
    return <Sword className="w-4 h-4 text-orange-400" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-black/80 backdrop-blur-md rounded-t-xl border-t border-indigo-500/30 overflow-hidden flex flex-col h-[300px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      
      {/* Log Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent">
        {logs.length === 0 && (
          <div className="text-center text-gray-500 mt-10 italic">
            {isUserCharacter ? '请选择技能开始战斗...' : '等待指令... 试着输入 "先试探一下" 或 "全力进攻！"'}
          </div>
        )}
        
        <AnimatePresence>
          {logs.map((log, index) => (
            <motion.div
              key={log.id || index}
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
                  {log.speaker === 'system' ? 'SYSTEM' : log.speaker === 'player' ? (isUserCharacter ? 'ACTION' : 'COMMAND') : 'CHAR'}
                </span>
                {log.isStreaming && (
                   <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"/>
                )}
              </div>
             
              <div className="whitespace-pre-wrap leading-relaxed">
                {log.message.split('\n').map((line, i) => {
                  if (line.startsWith('[公式]')) {
                    return (
                      <div key={i} className="text-[10px] text-gray-500 mt-1 font-mono border-t border-white/5 pt-1">
                        {line}
                      </div>
                    );
                  }
                  return (
                    <span key={i} className={log.isCrit ? "text-yellow-400 font-bold drop-shadow-md text-lg" : ""}>
                      {line}
                      {log.isCrit && i === 0 && <span className="ml-2 text-red-500 text-sm animate-pulse">💥 CRITICAL HIT!</span>}
                      {i < log.message.split('\n').length - 1 && <br />}
                    </span>
                  );
                })}
                {log.isStreaming && <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse align-middle" />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Switch based on character type) */}
      <div className="min-h-[80px] bg-gray-900/90 border-t border-gray-700 p-4">
        {isUserCharacter ? (
          // Direct Skill Selection for User Character
          <div className="flex gap-4 items-center overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0 mr-2">
              SKILLS
            </span>
            {currentPlayer.skills.map(skill => (
              <button
                key={skill.id}
                onClick={() => onSkillSelect(skill.id)}
                disabled={isProcessing || phase === 'enemy_action'}
                className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-indigo-900/50 border border-gray-700 hover:border-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group shrink-0 min-w-[160px]"
              >
                <div className="p-2 bg-black/30 rounded-md group-hover:bg-indigo-500/20 transition-colors">
                  {getSkillIcon(skill)}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-200 group-hover:text-indigo-300 truncate">{skill.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{skill.description}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Natural Language Input for Preset Characters
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing || phase === 'enemy_action'}
                placeholder={isProcessing ? `正在联络${currentPlayer.name}...` : `输入战术指令给${currentPlayer.name} (例如: '小心点打', '全力进攻')`}
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
        )}
      </div>
    </div>
  );
};
