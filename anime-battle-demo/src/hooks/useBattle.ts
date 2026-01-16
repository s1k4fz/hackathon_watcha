import { useState, useEffect, useCallback, useRef } from 'react';
import type { BattleState, Character, Skill, AIActionResponse, BattleLog } from '../types/game';
import { initialPlayer, initialEnemy } from '../data/characters';
import { analyzeCommandStream } from '../services/ai';
import { queueCharacterSpeech, resetTTSQueue } from '../services/tts';

const createLogId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useBattle = (apiKey: string, initialPlayerChar: Character) => {
  const [battleState, setBattleState] = useState<BattleState>({
    turn: 1,
    phase: 'start',
    player: { ...initialPlayerChar },
    enemy: { ...initialEnemy },
    logs: [{ id: createLogId(), turn: 0, message: '战斗开始！遭遇暗影骑士！', speaker: 'system' }],
    isProcessing: false
  });

  // Ref to hold the current speech sentence buffer
  const speechBuffer = useRef<string>("");
  const speechSequence = useRef<number>(0); 

  const addLog = (message: string, speaker: 'system' | 'player' | 'enemy' = 'system') => {
    const id = createLogId();
    setBattleState(prev => ({
      ...prev,
      logs: [...prev.logs, { id, turn: prev.turn, message, speaker }]
    }));
    return id;
  };

  const updateLog = (id: string, message: string, isStreaming = false) => {
    setBattleState(prev => ({
      ...prev,
      logs: prev.logs.map(log => (log.id === id ? { ...log, message, isStreaming } : log))
    }));
  };

  // Helper to switch character (New Feature)
  const switchCharacter = (newChar: Character) => {
    // We retain current HP percentage or reset? For MVP, let's keep HP percentage roughly or just swap
    // Swapping directly resets that char's state to full HP if we use the template.
    // Let's just swap directly for full "Tag Team" feel (fresh character enters)
    setBattleState(prev => ({
      ...prev,
      player: {
        ...newChar,
        currentHp: newChar.maxHp // Or prev.player.currentHp if you want to inherit damage
      }
    }));
    
    addLog(`👉 切换角色：${newChar.name} 加入战斗！`, 'system');
    resetTTSQueue(); // Stop previous char speaking
  };

  // ... (previous processSpeechChunk function) ...
  const processSpeechChunk = (textChunk: string) => {
    const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
    const fishRefId = battleState.player.ttsModelId;
    
    if (!fishApiKey || !fishRefId) return;

    speechBuffer.current += textChunk;
    const delimiters = /[，。！？,.!?；;…]/;
    const minSpeakChars = Number(import.meta.env.VITE_TTS_MIN_CHARS || 4);
    
    // Process ALL complete sentences in the buffer
    while (delimiters.test(speechBuffer.current)) {
      let splitIndex = -1;
      const chars = speechBuffer.current.split('');
      
      // Find the FIRST delimiter to split sentences one by one for smoother flow
      for (let i = 0; i < chars.length; i++) {
        if (delimiters.test(chars[i])) {
          splitIndex = i;
          break; // Stop at first delimiter
        }
      }

      if (splitIndex !== -1) {
        const sentenceToSpeak = speechBuffer.current.substring(0, splitIndex + 1);
        const remaining = speechBuffer.current.substring(splitIndex + 1);

        const cleaned = sentenceToSpeak.replace(/[，。！？,.!?；;…\s]/g, '');

        // Drop pure punctuation (e.g. "..." or "！！")
        if (cleaned.length === 0) {
          speechBuffer.current = remaining;
          continue;
        }

        // If sentence is too short, merge it with the next one to avoid TTS failures
        if (cleaned.length < minSpeakChars && remaining.trim().length > 0) {
          const merged = sentenceToSpeak.replace(/[，。！？,.!?；;…]+$/g, '') + remaining;
          speechBuffer.current = merged;
          continue;
        }

        queueCharacterSpeech(sentenceToSpeak, fishApiKey, fishRefId, speechSequence.current);
        speechSequence.current++;
        speechBuffer.current = remaining;
      } else {
        break; // Should not happen given while condition, but safety break
      }
    }
  };

  // Execute a skill
  const executeSkill = useCallback((user: Character, target: Character, skill: Skill) => {
    let damage = 0;
    let heal = 0;
    let logMsg = '';

    if (skill.type === 'attack') {
      const variance = Math.random() * 0.2 + 0.9; 
      damage = Math.floor(skill.value * variance);
      logMsg = `${user.name} 使用了【${skill.name}】，造成了 ${damage} 点伤害！`;
    } else if (skill.type === 'heal') {
      heal = skill.value;
      logMsg = `${user.name} 使用了【${skill.name}】，恢复了 ${heal} 点生命！`;
    } else if (skill.type === 'defense') {
      logMsg = `${user.name} 采取了防御姿态，警惕着对方的攻击。`;
    }

    return { damage, heal, logMsg };
  }, []);

  // Enemy Turn Logic
  const processEnemyTurn = useCallback(async () => {
    setBattleState(prev => ({ ...prev, phase: 'enemy_action' }));
    await new Promise(resolve => setTimeout(resolve, 1000));

    setBattleState(prev => {
      const enemySkill = prev.enemy.skills[Math.floor(Math.random() * prev.enemy.skills.length)];
      const result = executeSkill(prev.enemy, prev.player, enemySkill);
      const newPlayerHp = Math.max(0, prev.player.currentHp - result.damage);
      const newEnemyHp = Math.min(prev.enemy.maxHp, prev.enemy.currentHp + result.heal);

      const newLogs = [
        ...prev.logs,
        { id: createLogId(), turn: prev.turn, message: result.logMsg, speaker: 'enemy' as const }
      ];
      
      if (newPlayerHp <= 0) {
        newLogs.push({ id: createLogId(), turn: prev.turn, message: `${prev.player.name} 倒下了... 战斗失败。`, speaker: 'system' });
        return { ...prev, player: { ...prev.player, currentHp: newPlayerHp }, enemy: { ...prev.enemy, currentHp: newEnemyHp }, logs: newLogs, phase: 'defeat' };
      }

      return { ...prev, player: { ...prev.player, currentHp: newPlayerHp }, enemy: { ...prev.enemy, currentHp: newEnemyHp }, logs: newLogs, phase: 'player_input', turn: prev.turn + 1 };
    });
  }, [executeSkill]);

  // Player Command Handler
  const handleCommand = async (command: string) => {
    if (battleState.phase !== 'player_input') return;

    addLog(`"${command}"`, 'player');
    resetTTSQueue();
    speechSequence.current = 0;
    speechBuffer.current = ""; 
    const streamingLogId = createLogId();
    let lastProcessedLength = 0; 

    setBattleState(prev => ({ 
      ...prev, isProcessing: true, phase: 'ai_processing',
      logs: [...prev.logs, { id: streamingLogId, turn: prev.turn, message: '...', speaker: 'system', isStreaming: true }]
    }));

    try {
      const currentLogs = battleState.logs; 
      const aiResponse = await analyzeCommandStream(
        apiKey, command, currentLogs, battleState.player, battleState.enemy, battleState.turn,
        (fullDisplayContent) => {
          updateLog(streamingLogId, fullDisplayContent, true);
          const newContent = fullDisplayContent.slice(lastProcessedLength);
          if (newContent) {
            processSpeechChunk(newContent); 
            lastProcessedLength = fullDisplayContent.length;
          }
        }
      );

      updateLog(streamingLogId, aiResponse.character_response, false);
      const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
      const fishRefId = battleState.player.ttsModelId;
      if (speechBuffer.current.trim() && fishApiKey && fishRefId) {
         queueCharacterSpeech(speechBuffer.current, fishApiKey, fishRefId, speechSequence.current);
      }
      speechBuffer.current = ""; 

      await new Promise(resolve => setTimeout(resolve, 500));

      setBattleState(prev => {
        const skill = prev.player.skills.find(s => s.id === aiResponse.chosen_skill_id);
        if (!skill) return prev;

        const result = executeSkill(prev.player, prev.enemy, skill);
        const newEnemyHp = Math.max(0, prev.enemy.currentHp - result.damage);
        const newPlayerHp = Math.min(prev.player.maxHp, prev.player.currentHp + result.heal);
        const newLogs = [...prev.logs, { id: createLogId(), turn: prev.turn, message: result.logMsg, speaker: 'system' as const }];

        if (newEnemyHp <= 0) {
           newLogs.push({ id: createLogId(), turn: prev.turn, message: `${prev.enemy.name} 被击败了！战斗胜利！`, speaker: 'system' });
           return { ...prev, player: { ...prev.player, currentHp: newPlayerHp }, enemy: { ...prev.enemy, currentHp: newEnemyHp }, logs: newLogs, isProcessing: false, phase: 'victory' };
        }

        return { ...prev, player: { ...prev.player, currentHp: newPlayerHp }, enemy: { ...prev.enemy, currentHp: newEnemyHp }, logs: newLogs, isProcessing: false, phase: 'enemy_action' };
      });

    } catch (error) {
      console.error(error);
      updateLog(streamingLogId, "通讯故障...", false);
      setBattleState(prev => ({ ...prev, isProcessing: false, phase: 'player_input' }));
    }
  };

  // Lifecycle
  useEffect(() => { if (battleState.phase === 'enemy_action') processEnemyTurn(); }, [battleState.phase, processEnemyTurn]);
  useEffect(() => { if (battleState.phase === 'start') setTimeout(() => setBattleState(prev => ({ ...prev, phase: 'player_input' })), 1000); }, [battleState.phase]);

  return {
    battleState,
    handleCommand,
    switchCharacter // Export this
  };
};
