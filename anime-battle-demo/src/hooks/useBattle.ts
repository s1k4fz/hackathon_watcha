import { useState, useEffect, useCallback, useRef } from 'react';
import type { BattleState, Character, Skill, AIActionResponse, BattleLog } from '../types/game';
import { initialPlayer, initialEnemy, availableCharacters } from '../data/characters';
import { analyzeCommandStream } from '../services/ai';
import { queueCharacterSpeech, resetTTSQueue } from '../services/tts';

const createLogId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useBattle = (apiKey: string, initialPlayerChar: Character) => {
  // Initialize Party with independent objects to avoid reference issues
  const initialParty = availableCharacters.map(c => ({ ...c })); 
  // Ensure the selected initial char is synchronized with the party version
  const startChar = initialParty.find(c => c.id === initialPlayerChar.id) || initialParty[0];

  const [battleState, setBattleState] = useState<BattleState>({
    turn: 1,
    phase: 'start',
    player: startChar,
    party: initialParty, // Persist full party state
    enemy: { ...initialEnemy },
    logs: [{ id: createLogId(), turn: 0, message: '战斗开始！遭遇暗影骑士！', speaker: 'system' }],
    isProcessing: false
  });

  const speechBuffer = useRef<string>("");
  const speechSequence = useRef<number>(0); 

  const addLog = (message: string, speaker: 'system' | 'player' | 'enemy' = 'system', isCrit = false) => {
    const id = createLogId();
    setBattleState(prev => ({
      ...prev,
      logs: [...prev.logs, { id, turn: prev.turn, message, speaker, isCrit }]
    }));
    return id;
  };

  const updateLog = (id: string, message: string, isStreaming = false) => {
    setBattleState(prev => ({
      ...prev,
      logs: prev.logs.map(log => (log.id === id ? { ...log, message, isStreaming } : log))
    }));
  };

  // Switch Character: Load from Party State
  const switchCharacter = (targetCharId: string) => {
    setBattleState(prev => {
      // Find the character in the persisted party array
      const nextChar = prev.party.find(c => c.id === targetCharId);
      if (!nextChar) return prev;

      addLog(`👉 切换角色：${nextChar.name} 加入战斗！(HP: ${nextChar.currentHp}/${nextChar.maxHp})`, 'system');
      resetTTSQueue();

      return {
        ...prev,
        player: nextChar // Swap active player
      };
    });
  };

  const processSpeechChunk = (textChunk: string) => {
    const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
    const fishRefId = battleState.player.ttsModelId;
    if (!fishApiKey || !fishRefId) return;

    speechBuffer.current += textChunk;
    const delimiters = /[，。！？,.!?；;…]/;
    const minSpeakChars = Number(import.meta.env.VITE_TTS_MIN_CHARS || 4);
    
    while (delimiters.test(speechBuffer.current)) {
      let splitIndex = -1;
      const chars = speechBuffer.current.split('');
      for (let i = 0; i < chars.length; i++) {
        if (delimiters.test(chars[i])) { splitIndex = i; break; }
      }

      if (splitIndex !== -1) {
        const sentenceToSpeak = speechBuffer.current.substring(0, splitIndex + 1);
        const remaining = speechBuffer.current.substring(splitIndex + 1);
        const cleaned = sentenceToSpeak.replace(/[，。！？,.!?；;…\s]/g, '');

        if (cleaned.length === 0) {
          speechBuffer.current = remaining;
          continue;
        }

        if (cleaned.length < minSpeakChars && remaining.trim().length > 0) {
          const merged = sentenceToSpeak.replace(/[，。！？,.!?；;…]+$/g, '') + remaining;
          speechBuffer.current = merged;
          continue;
        }

        queueCharacterSpeech(sentenceToSpeak, fishApiKey, fishRefId, speechSequence.current);
        speechSequence.current++;
        speechBuffer.current = remaining;
      } else { break; }
    }
  };

  const calculateDamage = (attacker: Character, defender: Character, skill: Skill) => {
    const baseDamage = attacker.stats.attack * skill.value;
    const dmgBonusMultiplier = 1.0; 
    const defDenominator = defender.stats.defense + 200 + (10 * attacker.stats.level);
    const defMultiplier = 1 - (defender.stats.defense / defDenominator);
    const isCrit = Math.random() < attacker.stats.critRate;
    const critMultiplier = isCrit ? (1 + attacker.stats.critDamage) : 1.0;
    const variance = 0.95 + Math.random() * 0.1;
    
    let finalDamage = baseDamage * dmgBonusMultiplier * defMultiplier * critMultiplier * variance;
    finalDamage = Math.floor(finalDamage);
    const debugInfo = `[公式] 攻${attacker.stats.attack}×倍率${skill.value} = 基伤${baseDamage.toFixed(0)} | 防御区${defMultiplier.toFixed(2)} | 暴击区${critMultiplier} | 最终${finalDamage}`;

    return { finalDamage, isCrit, debugInfo };
  };

  const executeSkill = useCallback((user: Character, target: Character, skill: Skill) => {
    let damage = 0;
    let heal = 0;
    let logMsg = '';
    let isCrit = false;
    let debugInfo = '';

    if (skill.type === 'attack') {
      const result = calculateDamage(user, target, skill);
      damage = result.finalDamage;
      isCrit = result.isCrit;
      debugInfo = result.debugInfo;
      const critText = isCrit ? ' (CRITICAL!)' : '';
      logMsg = `${user.name} 使用【${skill.name}】${critText}，造成 ${damage} 点伤害！\n${debugInfo}`;
    } else if (skill.type === 'heal') {
      heal = Math.floor(user.maxHp * skill.value);
      logMsg = `${user.name} 使用【${skill.name}】，恢复了 ${heal} 点生命！`;
    } else if (skill.type === 'defense') {
      logMsg = `${user.name} 采取防御姿态，准备迎接冲击。`;
    }
    return { damage, heal, logMsg, isCrit };
  }, []);

  // Enemy Turn Logic
  const processEnemyTurn = useCallback(async () => {
    setBattleState(prev => ({ ...prev, phase: 'enemy_action' }));
    await new Promise(resolve => setTimeout(resolve, 1000));

    setBattleState(prev => {
      const enemySkill = prev.enemy.skills[Math.floor(Math.random() * prev.enemy.skills.length)];
      
      // Enemy attacks CURRENT active player
      const result = executeSkill(prev.enemy, prev.player, enemySkill);
      
      const newPlayerHp = Math.max(0, prev.player.currentHp - result.damage);
      const newEnemyHp = Math.min(prev.enemy.maxHp, prev.enemy.currentHp + result.heal);

      // Update Party State
      const updatedParty = prev.party.map(c => 
        c.id === prev.player.id ? { ...c, currentHp: newPlayerHp } : c
      );

      const newLogs = [
        ...prev.logs,
        { 
          id: createLogId(), 
          turn: prev.turn, 
          message: result.logMsg, 
          speaker: 'enemy' as const,
          isCrit: result.isCrit
        }
      ];
      
      if (newPlayerHp <= 0) {
        newLogs.push({ id: createLogId(), turn: prev.turn, message: `${prev.player.name} 倒下了... 战斗失败。`, speaker: 'system' });
        // Update both player ref and party ref
        return { 
            ...prev, 
            player: { ...prev.player, currentHp: newPlayerHp }, 
            party: updatedParty,
            enemy: { ...prev.enemy, currentHp: newEnemyHp }, 
            logs: newLogs, 
            phase: 'defeat' 
        };
      }

      return { 
          ...prev, 
          player: { ...prev.player, currentHp: newPlayerHp }, 
          party: updatedParty,
          enemy: { ...prev.enemy, currentHp: newEnemyHp }, 
          logs: newLogs, 
          phase: 'player_input', 
          turn: prev.turn + 1 
      };
    });
  }, []); 

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
        
        // Update Party State
        const updatedParty = prev.party.map(c => 
            c.id === prev.player.id ? { ...c, currentHp: newPlayerHp } : c
        );

        const newLogs = [...prev.logs, { 
          id: createLogId(), 
          turn: prev.turn, 
          message: result.logMsg, 
          speaker: 'system' as const,
          isCrit: result.isCrit
        }];

        if (newEnemyHp <= 0) {
           newLogs.push({ id: createLogId(), turn: prev.turn, message: `${prev.enemy.name} 被击败了！战斗胜利！`, speaker: 'system' });
           return { 
               ...prev, 
               player: { ...prev.player, currentHp: newPlayerHp }, 
               party: updatedParty,
               enemy: { ...prev.enemy, currentHp: newEnemyHp }, 
               logs: newLogs, 
               isProcessing: false, 
               phase: 'victory' 
            };
        }

        return { 
            ...prev, 
            player: { ...prev.player, currentHp: newPlayerHp }, 
            party: updatedParty,
            enemy: { ...prev.enemy, currentHp: newEnemyHp }, 
            logs: newLogs, 
            isProcessing: false, 
            phase: 'enemy_action' 
        };
      });

    } catch (error) {
      console.error(error);
      updateLog(streamingLogId, "通讯故障...", false);
      setBattleState(prev => ({ ...prev, isProcessing: false, phase: 'player_input' }));
    }
  };

  useEffect(() => { if (battleState.phase === 'enemy_action') processEnemyTurn(); }, [battleState.phase, processEnemyTurn]);
  useEffect(() => { if (battleState.phase === 'start') setTimeout(() => setBattleState(prev => ({ ...prev, phase: 'player_input' })), 1000); }, [battleState.phase]);

  return {
    battleState,
    handleCommand,
    switchCharacter
  };
};
