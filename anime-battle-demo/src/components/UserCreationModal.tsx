import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Loader2, UserPlus } from 'lucide-react';
import { generateUserCharacter } from '../services/ai';
import type { Character } from '../types/game';

interface UserCreationModalProps {
  apiKey: string;
  onCharacterCreated: (character: Character) => void;
  onClose: () => void;
}

export const UserCreationModal: React.FC<UserCreationModalProps> = ({ apiKey, onCharacterCreated, onClose }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedChar, setGeneratedChar] = useState<Character | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    setError('');

    try {
      const newChar = await generateUserCharacter(apiKey, description);
      setGeneratedChar(newChar);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成失败，请重试或检查 API Key。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (generatedChar) {
      onCharacterCreated(generatedChar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg bg-gray-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-indigo-900/20 border-b border-indigo-500/20 flex items-center gap-3 shrink-0">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {generatedChar ? '灵魂构筑完成' : '创造你的角色'}
            </h2>
            <p className="text-xs text-indigo-300">
              {generatedChar ? '请确认角色信息' : 'AI 将根据描述生成专属技能与数值'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {generatedChar ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-3xl border border-indigo-500/50">
                   👤
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white">{generatedChar.name}</h3>
                   <div className="flex gap-2 text-xs text-gray-400">
                     <span>HP: {generatedChar.maxHp}</span>
                     <span>ATK: {generatedChar.stats.attack}</span>
                     <span>DEF: {generatedChar.stats.defense}</span>
                   </div>
                 </div>
              </div>
              
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-300 italic">"{generatedChar.personality}"</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">SKILLS</h4>
                {generatedChar.skills.map(skill => (
                  <div key={skill.id} className="p-2 bg-gray-800 rounded border border-gray-700 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-300 text-sm">{skill.name}</span>
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">{skill.risk} risk</span>
                    </div>
                    <p className="text-xs text-gray-400">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">我是...</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：我是个怕痛的全点防御力的盾娘，喜欢吃甜食..."
                className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                disabled={isGenerating}
              />
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (generatedChar) {
                setGeneratedChar(null); // Reset to allow regeneration
              } else {
                onClose();
              }
            }}
            disabled={isGenerating}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {generatedChar ? '重新生成' : '取消'}
          </button>
          
          {generatedChar ? (
             <button
              type="button"
              onClick={handleConfirm}
              className="flex-[2] py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
            >
              <UserPlus className="w-5 h-5" />
              确认加入
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在构筑灵魂...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  开始生成
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
