import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Character } from '../types/game';
import { useNarrative } from '../hooks/useNarrative';
import { getCharacterPortrait, getBackground } from '../utils/assetLoader';
import { stripEmotionTags } from '../services/emotionTags';
import { generateUserCharacter } from '../services/ai';
import { queueCharacterSpeech, resetTTSQueue } from '../services/tts';

// Types for Narrative
export type NarrativePhase = 'CG_TEXT' | 'DIALOGUE';

export interface NarrativeScript {
  id: string;
  type: NarrativePhase;
  lines?: string[]; // For CG_TEXT
  character?: Character; // For DIALOGUE
  initialMessage?: string; // AI opens the convo
  systemPrompt?: string; // AI personality context
  background?: string; // CSS class or image url
  onComplete?: () => void;
  // NEW: For character generation during dialogue
  enableCharacterGeneration?: boolean;
  onCharacterGenerated?: (char: Character) => void;
  hideContinueButton?: boolean;
}

interface NarrativeSceneProps {
  apiKey: string;
  script: NarrativeScript;
}

export const NarrativeScene: React.FC<NarrativeSceneProps> = ({ apiKey, script }) => {
  // --- CG Text Logic ---
  const [cgIndex, setCgIndex] = useState(0);
  
  // --- Dialogue Logic ---
  const { 
    messages, 
    isProcessing, 
    currentStreamingContent, 
    sendUserMessage,
    setMessages
  } = useNarrative(apiKey, script.character || {} as Character);

  const [userInput, setUserInput] = useState('');
  
  // --- Character Generation State ---
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [generatedCharacter, setGeneratedCharacter] = useState<Character | null>(null);
  const [showCharacterCard, setShowCharacterCard] = useState(false);
  const [isBattleReady, setIsBattleReady] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false); // Delayed modal display
  const hasTriggeredGeneration = useRef(false);
  const lastScriptId = useRef<string>('');

  // Reset state when script.id changes (NOT the whole script object, which changes every render)
  useEffect(() => {
    if (script.id === lastScriptId.current) return; // Skip if same script
    lastScriptId.current = script.id;
    
    if (script.type === 'CG_TEXT') {
        setCgIndex(0);
    } else if (script.type === 'DIALOGUE') {
        setMessages([]); 
        hasTriggeredGeneration.current = false;
        setIsGeneratingCharacter(false);
        setGenerationStatus('');
        setGeneratedCharacter(null);
        setShowCharacterCard(false);
        setIsBattleReady(false);
        setShowBattleModal(false);
        
        if (script.initialMessage) {
            setMessages([{ role: 'assistant', content: script.initialMessage }]);
            
            // Trigger TTS for initial message
            const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
            const fishRefId = script.character?.ttsModelId;
            if (fishApiKey && fishRefId) {
                resetTTSQueue();
                const cleanedText = stripEmotionTags(script.initialMessage);
                if (cleanedText.trim()) {
                    queueCharacterSpeech(cleanedText, fishApiKey, fishRefId, 0);
                }
            }
        }
    }
  }, [script.id, script.type, script.initialMessage, script.character?.ttsModelId]);

  // --- Detect [READY_FOR_BATTLE] tag ---
  useEffect(() => {
    if (hasTriggeredGeneration.current || isGeneratingCharacter || isBattleReady) return;
    
    // Check the latest assistant message for the trigger tag
    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMsg) {
        if (lastAssistantMsg.content.includes('[READY_FOR_BATTLE]')) {
            hasTriggeredGeneration.current = true;
            if (script.enableCharacterGeneration) {
                triggerCharacterGeneration();
            } else {
                setIsBattleReady(true);
            }
        }
    }
  }, [messages, script.enableCharacterGeneration, isBattleReady]);

  // --- Detect [THE_END] tag (separate effect to ensure it always runs) ---
  useEffect(() => {
    const lastAssistantMsg = messages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMsg && lastAssistantMsg.content.includes('[THE_END]')) {
      // Small delay to let user read the final message
      const timer = setTimeout(() => {
        script.onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages, script.onComplete]);

  // --- Fallback: Force end after too many exchanges (prevents infinite loops) ---
  useEffect(() => {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    // If user has sent 6+ messages and we're in a dialogue that should end, force it
    if (userMessageCount >= 6 && script.id === 'outro_dialogue') {
      console.warn('Forcing dialogue end due to message limit');
      const timer = setTimeout(() => {
        script.onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [messages, script.id, script.onComplete]);

  // Delay showing battle modal by 5 seconds
  useEffect(() => {
    if (isBattleReady && !script.enableCharacterGeneration) {
      const timer = setTimeout(() => {
        setShowBattleModal(true);
      }, 5000); // 5 second delay
      return () => clearTimeout(timer);
    }
  }, [isBattleReady, script.enableCharacterGeneration]);

  const triggerCharacterGeneration = async () => {
    setIsGeneratingCharacter(true);
    setGenerationStatus('正在分析你的信息...');

    // Extract user info from conversation
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');

    if (!userMessages.trim()) {
      setGenerationStatus('信息不足，请继续对话...');
      setIsGeneratingCharacter(false);
      hasTriggeredGeneration.current = false;
      return;
    }

    try {
      setGenerationStatus('正在构建你的战斗档案...');
      
      const newChar = await generateUserCharacter(apiKey, userMessages);
      
      setGeneratedCharacter(newChar);
      setGenerationStatus('');
      setIsGeneratingCharacter(false);
      setShowCharacterCard(true);
      
      // Notify parent (but don't proceed yet - wait for user confirmation)
      script.onCharacterGenerated?.(newChar);
      
    } catch (error) {
      console.error('Character generation failed:', error);
      setGenerationStatus('角色生成失败，正在重试...');
      hasTriggeredGeneration.current = false;
      setIsGeneratingCharacter(false);
    }
  };

  const handleConfirmCharacter = () => {
    setShowCharacterCard(false);
    script.onComplete?.();
  };

  // CG Advancement
  const handleCgClick = () => {
    if (script.lines && cgIndex < script.lines.length - 1) {
      setCgIndex(prev => prev + 1);
    } else {
      script.onComplete?.();
    }
  };

  // Dialogue Submission
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isProcessing || isGeneratingCharacter || showCharacterCard) return;
    
    const input = userInput;
    setUserInput('');
    await sendUserMessage(input, script.systemPrompt);
  };
  
  // Allow skipping dialogue phase or proceeding manually
  const handleDialogueNext = () => {
     script.onComplete?.();
  };

  if (script.type === 'CG_TEXT') {
    return (
      <div 
        onClick={handleCgClick}
        className="w-full h-screen bg-black text-white flex items-center justify-center cursor-pointer p-8 select-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-2xl md:text-4xl font-light tracking-widest text-center leading-relaxed"
          >
            {script.lines?.[cgIndex]}
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-8 text-gray-600 text-xs animate-pulse">点击继续</div>
      </div>
    );
  }

  // DIALOGUE MODE
  const portrait = script.character ? getCharacterPortrait(script.character.id) : undefined;
  const dialogueBg = getBackground('dialogue_bg');
  
  // Determine active message for display
  let rawMessage = "";
  if (isProcessing && currentStreamingContent) {
      rawMessage = currentStreamingContent;
  } else {
      const lastMsg = messages.filter(m => m.role === 'assistant').pop();
      if (lastMsg) rawMessage = lastMsg.content;
  }
  // Strip emotion tags AND the [READY_FOR_BATTLE] tag for display
  let activeMessage = stripEmotionTags(rawMessage);
  activeMessage = activeMessage.replace(/\[READY_FOR_BATTLE\]/g, '').replace(/\[THE_END\]/g, '').trim();

  return (
    <div 
      className="w-full h-screen relative overflow-hidden flex flex-col"
      style={dialogueBg ? {
        backgroundImage: `url(${dialogueBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {
        backgroundColor: script.background || '#111827' // bg-gray-900 equivalent
      }}
    >
      
      {/* Character Portrait Layer - Centered, behind dialogue box */}
      <div className="absolute inset-0 pointer-events-none flex items-end justify-center translate-y-56">
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="h-[120%] w-auto"
         >
            {portrait ? (
                <img src={portrait} alt="char" className="h-full w-auto object-contain drop-shadow-2xl" />
            ) : (
                <div className="h-full w-96 bg-gray-700/50 flex items-center justify-center text-white text-9xl font-black">
                    {script.character?.name[0]}
                </div>
            )}
         </motion.div>
      </div>

      {/* Generation Status (Non-blocking, bottom notification) */}
      <AnimatePresence>
        {isGeneratingCharacter && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-4">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
              <div>
                <p className="text-sm font-bold text-gray-800">正在生成战斗档案</p>
                <p className="text-xs text-gray-500">{generationStatus}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Character Card (Full overlay with details) */}
      <AnimatePresence>
        {showCharacterCard && generatedCharacter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 p-6 text-white">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">战斗档案生成完毕</p>
                <h2 className="text-3xl font-black">{generatedCharacter.name}</h2>
                <p className="text-sm text-gray-300 mt-1">{generatedCharacter.personality}</p>
              </div>

              {/* Stats */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">基础属性</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-black text-gray-800">{generatedCharacter.maxHp}</p>
                    <p className="text-xs text-gray-500">HP</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-black text-gray-800">{generatedCharacter.stats.attack}</p>
                    <p className="text-xs text-gray-500">ATK</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-black text-gray-800">{generatedCharacter.stats.defense}</p>
                    <p className="text-xs text-gray-500">DEF</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-black text-gray-800">{generatedCharacter.stats.speed}</p>
                    <p className="text-xs text-gray-500">SPD</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-black text-gray-800">{Math.round(generatedCharacter.stats.critRate * 100)}%</p>
                    <p className="text-xs text-gray-500">暴击率</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-black text-gray-800">{Math.round(generatedCharacter.stats.critDamage * 100)}%</p>
                    <p className="text-xs text-gray-500">暴击伤害</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="p-6">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">技能列表</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generatedCharacter.skills.map((skill, i) => (
                    <div key={skill.id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{skill.name}</p>
                        <p className="text-xs text-gray-500 truncate">{skill.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <div className="p-6 bg-gray-50">
                <button
                  onClick={handleConfirmCharacter}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors"
                >
                  确认，进入战斗！
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Ready Modal - For Non-Generation Scripts (like Interlude) */}
      <AnimatePresence>
        {showBattleModal && !script.enableCharacterGeneration && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-8 text-center"
           >
              <motion.div 
                 initial={{ scale: 0.8, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 className="bg-red-900/20 border border-red-500/50 p-12 rounded-2xl max-w-lg w-full"
              >
                  <div className="text-red-500 font-black tracking-[0.3em] uppercase text-sm mb-4">Warning: High Threat Level</div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6 italic">遭遇强敌</h2>
                  <p className="text-gray-300 mb-8 leading-relaxed">
                     前方检测到高能反应。<br/>
                     这是不同于之前的压迫感……准备好了吗？
                  </p>
                  
                  <button 
                    onClick={() => script.onComplete?.()}
                    className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full font-bold text-xl tracking-widest transition-all hover:scale-105 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                  >
                    开始战斗
                  </button>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Galgame-style Dialogue Box - Fixed at bottom */}
      {!showCharacterCard && !showBattleModal && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center">
          {/* Dialogue Box */}
          <div className="w-[92%] max-w-2xl mb-8 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Character Name Tag */}
            <div className="px-6 pt-4 pb-1">
              <span className="inline-block px-3 py-0.5 bg-white/10 text-white text-sm font-bold tracking-wider rounded">
                {script.character?.name}
              </span>
            </div>
            
            {/* Dialogue Content */}
            <div className="px-6 pb-4 min-h-[80px]">
              <p className="text-white text-lg md:text-xl leading-relaxed font-medium tracking-wide">
                {activeMessage || (isProcessing ? "..." : "")}
              </p>
            </div>

            {/* Input Area - Compact */}
            <div className="px-6 pb-4 border-t border-white/10 pt-3">
              <div className="flex gap-3 items-center">
                <form onSubmit={handleSendMessage} className="flex-1 flex gap-3">
                  <input 
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    placeholder={isBattleReady ? "准备战斗中..." : "输入回应..."}
                    disabled={isProcessing || isGeneratingCharacter || showCharacterCard || isBattleReady}
                    className="flex-1 bg-white/10 text-white text-base border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-white/40 transition-all placeholder-white/40"
                  />
                  <button 
                    type="submit" 
                    disabled={!userInput.trim() || isProcessing || isGeneratingCharacter || showCharacterCard || isBattleReady}
                    className="bg-white text-black px-5 py-2 rounded-lg text-base font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    发送
                  </button>
                </form>

                {/* Continue Button */}
                {!script.enableCharacterGeneration && !script.hideContinueButton && (
                  <button 
                    onClick={handleDialogueNext}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-base font-bold hover:bg-green-500 transition-colors"
                  >
                    继续 →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
