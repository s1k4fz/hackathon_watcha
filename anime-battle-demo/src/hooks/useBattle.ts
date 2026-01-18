import { useState, useEffect, useCallback, useRef } from 'react';
import type { BattleState, Character, Skill, ActiveBond } from '../types/game';
import { initialEnemy } from '../data/characters';
import { analyzeCommandStream } from '../services/ai';
import { queueCharacterSpeech, resetTTSQueue } from '../services/tts';
import { stripEmotionTags } from '../services/emotionTags';

const createLogId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useBattle = (apiKey: string, initialParty: Character[], initialEnemyData?: Character) => {
  
  // Helper to check bonds based on current party
  const checkBonds = (party: Character[]): ActiveBond[] => {
    const bonds: ActiveBond[] = [];
    const factionCounts: Record<string, number> = {};
    const charIds = party.map(c => c.id);

    party.forEach(c => {
      if (c.faction && c.faction !== 'other') {
        factionCounts[c.faction] = (factionCounts[c.faction] || 0) + 1;
      }
    });

    // Faction Bonds
    if ((factionCounts['dawn_legacy'] || 0) >= 2) {
      bonds.push({ id: 'dawn_protocol', name: '晓光协议', description: '晓光阵营成员≥2：全队防御力 +15%', active: true, characters: party.filter(c => c.faction === 'dawn_legacy').map(c => c.id) });
    }
    if ((factionCounts['crimson_heavy'] || 0) >= 2) {
      bonds.push({ id: 'heavy_fire', name: '重火倾泻', description: '绯红阵营成员≥2：全队暴击率 +10%', active: true, characters: party.filter(c => c.faction === 'crimson_heavy').map(c => c.id) });
    }
    if ((factionCounts['wasteland_drifters'] || 0) >= 2) {
      bonds.push({ id: 'survival_rule', name: '生存法则', description: '荒原阵营成员≥2：全队闪避率 +15%', active: true, characters: party.filter(c => c.faction === 'wasteland_drifters').map(c => c.id) });
    }
    if ((factionCounts['deep_dive'] || 0) >= 2) {
      bonds.push({ id: 'abyss_whisper', name: '深渊低语', description: '深潜阵营成员≥2：敌方抗性 -10%', active: true, characters: party.filter(c => c.faction === 'deep_dive').map(c => c.id) });
    }

    // Special Bonds
    if (charIds.includes('luoshu') && charIds.includes('linque')) {
      bonds.push({ id: 'echo_twins', name: '残响双子', description: '洛书与绫雀同时在场：攻击力 +20%', active: true, characters: ['luoshu', 'linque'] });
    }
    if (charIds.includes('helga') && charIds.includes('zizhi')) {
      bonds.push({ id: 'cat_mouse', name: '猫鼠游戏', description: '赫尔加爆伤+30%，吱吱减伤30%', active: true, characters: ['helga', 'zizhi'] });
    }
    if (charIds.includes('luoshu') && charIds.includes('simon')) {
      bonds.push({ id: 'reason_madness', name: '理智与疯狂', description: '洛书易伤+20%，西蒙伤害+30%', active: true, characters: ['luoshu', 'simon'] });
    }
    if (charIds.includes('uni') && charIds.includes('linque')) {
      bonds.push({ id: 'inter_dim_song', name: '跨越维度的歌', description: '尤尼与绫雀同时在场：每回合回血 5%', active: true, characters: ['uni', 'linque'] });
    }

    return bonds;
  };

  // Helper to initialize Action Values
  const initializeAV = (chars: Character[]) => {
    return chars.map(c => ({
      ...c,
      currentActionValue: c.currentActionValue ?? (10000 / (c.stats.speed || 100))
    }));
  };

  const initialBonds = checkBonds(initialParty);
  
  // Use provided enemy or default
  const targetEnemy = initialEnemyData || initialEnemy;

  // Combine all combatants for speed calculation
  const initialCombatants = [
      ...initializeAV(initialParty), 
      ...initializeAV([{ ...targetEnemy, stats: { ...targetEnemy.stats, speed: targetEnemy.stats.speed || 100 } }])
  ];
  
  // Robust AV Simulation Logic (Honkai: Star Rail Style)
  const getNextActiveState = (combatants: Character[]) => {
    // 1. Normalize AVs so the fastest (lowest AV) becomes 0
    const minAV = Math.min(...combatants.map(c => c.currentActionValue || 0));
    const updatedCombatants = combatants.map(c => ({
      ...c,
      currentActionValue: (c.currentActionValue || 0) - minAV
    }));

    // 2. Identify active character(s) (AV <= 0)
    // In rare case of tie, we pick the first one (usually player if array order is [party, enemy])
    const activeChar = updatedCombatants.find(c => (c.currentActionValue || 0) <= 0.01);
    
    // 3. Simulate Action Queue
    const actionQueue: Character[] = [];
    
    // Create simulation clones with independent AV tracking
    // If a character is ACTIVE (AV <= 0), their 'next' action is at 10000/Speed.
    // Others are at their current AV.
    // We want to simulate the 'Race' to 0.
    // Actually, simpler model:
    // We treat everyone's position on a timeline.
    // Active char is at 0. They act, then move to +10000/Speed.
    // Others are at their current AV (e.g. 50).
    // We just pick whoever has the lowest total AV on this timeline.
    
    let simState = updatedCombatants.map(c => {
        const speed = c.stats.speed || 100;
        const baseInterval = 10000 / speed;
        // If this is the active char, they 'just acted' in the simulation start, so they are at baseInterval.
        // Wait, if we want to show the Active Char as #1 in queue, we shouldn't advance them yet.
        // But the queue shows UPCOMING actions.
        // Usually #1 is "Current Action".
        // So:
        if (c.id === activeChar?.id) {
            return { ...c, simTotalAV: 0, baseInterval, isCurrent: true };
        }
        return { ...c, simTotalAV: c.currentActionValue || 0, baseInterval, isCurrent: false };
    });

    // Generate 6 steps (Current + 5 Future)
    for (let i = 0; i < 6; i++) {
        // Sort by simTotalAV
        simState.sort((a, b) => a.simTotalAV - b.simTotalAV);
        
        const winner = simState[0];
        
        // Push to queue
        // For display: The AV shown is the relative AV from 'now'. 
        // Since 'now' is 0 (relative to active char), simTotalAV is exactly what we want to display.
        actionQueue.push({
            ...winner,
            currentActionValue: Math.floor(winner.simTotalAV)
        });
        
        // Advance the winner for next loop
        winner.simTotalAV += winner.baseInterval;
    }

    return { updatedCombatants, activeChar, actionQueue };
  };

  const { updatedCombatants, actionQueue } = getNextActiveState(initialCombatants);
  const initialPlayerState = updatedCombatants.find(c => c.id === initialParty[0].id) || updatedCombatants[0]; // Fallback

  const [battleState, setBattleState] = useState<BattleState>({
    turn: 1,
    phase: 'start',
    player: initialPlayerState, // In new system, this is just the "UI Focus" until turn starts
    party: updatedCombatants.filter(c => !c.id.startsWith('enemy')),
    enemy: updatedCombatants.find(c => c.id.startsWith('enemy')) || initialEnemy,
    logs: [{ id: createLogId(), turn: 0, message: '战斗开始！遭遇暗影骑士！', speaker: 'system' }],
    isProcessing: false,
    activeBonds: initialBonds,
    actionQueue: actionQueue
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

  const switchCharacter = () => {
    // In strict Speed System, manual switching is disabled to prevent timeline conflicts.
    // This function is now deprecated or could be used for "swapping position" skills in future.
    console.warn("Manual switching is disabled in Speed Mode.");
    return; 
  };

  const processSpeechChunk = (textChunk: string) => {
    const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
    const fishRefId = battleState.player.ttsModelId;
    if (!fishApiKey || !fishRefId) return;

    speechBuffer.current += textChunk;
    const delimiters = /[，。！？,.!?；;…]/;
    const minSpeakChars = Number(import.meta.env.VITE_TTS_MIN_CHARS || 6); 
    
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

        if (cleaned.length < minSpeakChars) {
          if (remaining.trim().length > 0) {
            const merged = sentenceToSpeak.replace(/[，。！？,.!?；;…]+$/g, '') + remaining;
            speechBuffer.current = merged;
            continue;
          } else {
            speechBuffer.current = sentenceToSpeak;
            break; 
          }
        }

        // Strip emotion tags before sending to TTS
        const cleanedForTTS = stripEmotionTags(sentenceToSpeak);
        if (cleanedForTTS.trim()) {
          queueCharacterSpeech(cleanedForTTS, fishApiKey, fishRefId, speechSequence.current);
          speechSequence.current++;
        }
        speechBuffer.current = remaining;
      } else { break; }
    }
  };

  // Reusable Damage Calc
  const calculateDamage = (attacker: Character, defender: Character, valueMultiplier: number, bonds: ActiveBond[]) => {
    let baseAttack = attacker.stats.attack;
    let critRate = attacker.stats.critRate;
    let critDamage = attacker.stats.critDamage;
    let defense = defender.stats.defense;
    let dmgMultiplier = 1.0;
    
    // --- Apply Bond Buffs ---
    if (bonds.some(b => b.id === 'heavy_fire')) critRate += 0.10;
    if (bonds.some(b => b.id === 'echo_twins') && (attacker.id === 'luoshu' || attacker.id === 'linque')) baseAttack *= 1.2;
    if (bonds.some(b => b.id === 'cat_mouse') && attacker.id === 'helga') critDamage += 0.30;
    if (bonds.some(b => b.id === 'reason_madness') && attacker.id === 'simon') dmgMultiplier += 0.30;

    const isPlayerTeam = (charId: string) => !charId.startsWith('enemy');

    if (isPlayerTeam(defender.id)) {
      if (bonds.some(b => b.id === 'dawn_protocol')) defense *= 1.15;
      if (bonds.some(b => b.id === 'cat_mouse') && defender.id === 'zizhi') dmgMultiplier *= 0.7;
      if (bonds.some(b => b.id === 'reason_madness') && defender.id === 'luoshu') dmgMultiplier *= 1.2;
    } else {
      if (bonds.some(b => b.id === 'abyss_whisper')) defense *= 0.9;
    }

    if (isPlayerTeam(defender.id) && bonds.some(b => b.id === 'survival_rule')) {
        if (Math.random() < 0.15) {
            return { finalDamage: 0, isCrit: false, debugInfo: "闪避成功 (生存法则)", isDodge: true };
        }
    }

    const baseDamage = baseAttack * valueMultiplier;
    const defDenominator = defense + 200 + (10 * attacker.stats.level);
    const defMultiplier = 1 - (defense / defDenominator);
    
    const isCrit = Math.random() < critRate;
    const critMultiplier = isCrit ? (1 + critDamage) : 1.0;
    const variance = 0.95 + Math.random() * 0.1;
    
    let finalDamage = baseDamage * dmgMultiplier * defMultiplier * critMultiplier * variance;
    finalDamage = Math.floor(finalDamage);
    const debugInfo = `[公式] 攻${baseAttack.toFixed(0)}×倍率${valueMultiplier} | 防${defense.toFixed(0)}->免${((1-defMultiplier)*100).toFixed(1)}% | 暴${(critRate*100).toFixed(0)}%×${critMultiplier.toFixed(1)} | 最终${finalDamage}`;

    return { finalDamage, isCrit, debugInfo, isDodge: false };
  };

  const executeSkill = useCallback((user: Character, target: Character, skill: Skill, currentBonds: ActiveBond[]) => {
    let totalDamage = 0;
    let totalHeal = 0;
    let logMsg = `${user.name} 使用了【${skill.name}】！`;
    let isCritGlobal = false;
    let debugInfos: string[] = [];

    skill.effects.forEach(effect => {
      if (effect.type === 'damage') {
        const res = calculateDamage(user, target, effect.value, currentBonds);
        if (res.isDodge) {
            logMsg += " (但是被闪避了！)";
            debugInfos.push(res.debugInfo);
        } else {
            totalDamage += res.finalDamage;
            if (res.isCrit) isCritGlobal = true;
            debugInfos.push(res.debugInfo);
        }
      } 
      else if (effect.type === 'heal') {
        const amount = Math.floor(user.maxHp * effect.value);
        totalHeal += amount;
      }
      else if (effect.type === 'defense') {
        logMsg += ` (防御姿态)`;
      }
      else if (effect.type === 'buff_atk') {
        logMsg += ` (攻击力提升)`;
      }
      else if (effect.type === 'self_damage') {
        const selfDmg = Math.floor(user.maxHp * effect.value);
        totalHeal -= selfDmg;
        logMsg += ` (受到反噬 ${selfDmg})`;
      }
    });

    if (totalDamage > 0) {
      logMsg += ` 造成了 ${totalDamage} 点伤害！`;
      if (isCritGlobal) logMsg += ' (CRITICAL!)';
    }
    if (totalHeal > 0) {
      logMsg += ` 恢复了 ${totalHeal} 点生命！`;
    }

    if (debugInfos.length > 0) {
      logMsg += `\n${debugInfos.join('\n')}`;
    }

    return { damage: totalDamage, heal: totalHeal, logMsg, isCrit: isCritGlobal };
  }, []);

  // --- Main Turn Loop / State Machine ---
  
  // This effect manages the turn flow based on Action Values
  useEffect(() => {
    if (battleState.phase === 'victory' || battleState.phase === 'defeat' || battleState.phase === 'ai_processing' || battleState.phase === 'player_action') return;

    // "next_turn_calc" logic (inside the effect)
    if (battleState.phase === 'start' || battleState.phase === 'enemy_action' || battleState.phase === 'player_input') {
        
        // Check if we need to proceed to next turn?
        // If phase is 'player_input', we WAIT for user.
        if (battleState.phase === 'player_input') return;

        // If phase is 'start' or 'enemy_action' (finished), we calculate next active unit.
        
        const allChars = [...battleState.party, battleState.enemy];
        const { updatedCombatants, activeChar, actionQueue } = getNextActiveState(allChars);
        
        if (!activeChar) {
            // Should theoretically not happen if we reduce AV correctly
            // Force a small tick if logic fails?
            return;
        }

        const nextParty = updatedCombatants.filter(c => !c.id.startsWith('enemy'));
        const nextEnemy = updatedCombatants.find(c => c.id.startsWith('enemy')) || battleState.enemy;

        // Determine phase
        let nextPhase: BattleState['phase'] = activeChar.id.startsWith('enemy') ? 'enemy_action' : 'player_input';
        
        // Update State
        setBattleState(prev => ({
            ...prev,
            party: nextParty,
            enemy: nextEnemy,
            player: activeChar.id.startsWith('enemy') ? prev.player : (nextParty.find(c => c.id === activeChar.id) || prev.player),
            phase: nextPhase,
            actionQueue: actionQueue
        }));
    }
  }, [battleState.phase]); // Dependencies need care to avoid infinite loops

  // Separate effect to trigger Enemy Action logic when phase becomes 'enemy_action'
  useEffect(() => {
    if (battleState.phase === 'enemy_action') {
        processEnemyTurn();
    }
  }, [battleState.phase]);


  const processEnemyTurn = useCallback(async () => {
    // Wait a bit for visual clarity
    await new Promise(resolve => setTimeout(resolve, 800));

    setBattleState(prev => {
      const enemySkill = prev.enemy.skills[Math.floor(Math.random() * prev.enemy.skills.length)];
      // Target random player? Or active player? Or lowest HP?
      // For now, target the "player" reference (which might be the last active one or random)
      // Better: Target random living party member
      const livingParty = prev.party.filter(c => c.currentHp > 0);
      const target = livingParty[Math.floor(Math.random() * livingParty.length)] || prev.player;

      const result = executeSkill(prev.enemy, target, enemySkill, prev.activeBonds);
      
      const newTargetHp = Math.max(0, target.currentHp - result.damage);
      const newEnemyHp = Math.min(prev.enemy.maxHp, prev.enemy.currentHp + result.heal);

      // Reset Enemy AV
      const newEnemyAV = 10000 / prev.enemy.stats.speed;

      const updatedParty = prev.party.map(c => 
        c.id === target.id ? { ...c, currentHp: newTargetHp } : c
      );
      
      const updatedEnemy = { ...prev.enemy, currentHp: newEnemyHp, currentActionValue: newEnemyAV };

      // --- Enemy Speech Logic ---
      let speechLog = null;
      let speechText = "";

      // 1. Prioritize specific skill line (Always trigger if exists)
      if (enemySkill.battleLine) {
         speechText = enemySkill.battleLine;
      }
      // 2. Fallback to random generic skill line (60% chance)
      else if (prev.enemy.battleLines?.skill && Math.random() < 0.6) {
        const lines = prev.enemy.battleLines.skill;
        speechText = lines[Math.floor(Math.random() * lines.length)];
      }

      if (speechText) {
        speechLog = {
            id: createLogId(),
            turn: prev.turn,
            message: speechText,
            speaker: 'enemy' as const
        };

        // Queue TTS
        const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
        const fishRefId = prev.enemy.ttsModelId;
        if (fishApiKey && fishRefId) {
            resetTTSQueue(); // Clear previous player speech if any
            queueCharacterSpeech(stripEmotionTags(speechText), fishApiKey, fishRefId, 0);
        }
      }

      const newLogs = [...prev.logs];
      if (speechLog) newLogs.push(speechLog);

      newLogs.push({ 
          id: createLogId(), 
          turn: prev.turn, 
          message: result.logMsg, 
          speaker: 'enemy' as const,
          isCrit: result.isCrit
      });
      
      // Check Defeat (All party dead)
      const allDead = updatedParty.every(c => c.currentHp <= 0);

      if (allDead) {
        newLogs.push({ id: createLogId(), turn: prev.turn, message: `全员阵亡... 战斗失败。`, speaker: 'system' });
        return { 
            ...prev, 
            party: updatedParty,
            enemy: updatedEnemy, 
            logs: newLogs, 
            phase: 'defeat' 
        };
      }

      // Loop back to calc next turn
      return { 
          ...prev, 
          party: updatedParty,
          enemy: updatedEnemy, 
          logs: newLogs, 
          phase: 'start', // Triggers next turn calc
          turn: prev.turn + 1 
      };
    });
  }, [executeSkill]); 

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
      const userPersona = battleState.party.find(c => c.id.startsWith('user_'));

      const aiResponse = await analyzeCommandStream(
        apiKey, command, currentLogs, battleState.player, battleState.enemy, battleState.turn,
        (fullDisplayContent) => {
          updateLog(streamingLogId, fullDisplayContent, true);
          const newContent = fullDisplayContent.slice(lastProcessedLength);
          if (newContent) {
            processSpeechChunk(newContent); 
            lastProcessedLength = fullDisplayContent.length;
          }
        },
        userPersona
      );

      updateLog(streamingLogId, aiResponse.character_response, false);
      const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
      const fishRefId = battleState.player.ttsModelId;
      if (speechBuffer.current.trim() && fishApiKey && fishRefId) {
         // Strip emotion tags before TTS
         const cleanedForTTS = stripEmotionTags(speechBuffer.current);
         if (cleanedForTTS.trim()) {
           queueCharacterSpeech(cleanedForTTS, fishApiKey, fishRefId, speechSequence.current);
         }
      }
      speechBuffer.current = ""; 

      await new Promise(resolve => setTimeout(resolve, 500));

      setBattleState(prev => {
        const skill = prev.player.skills.find(s => s.id === aiResponse.chosen_skill_id);
        if (!skill) return prev;

        const result = executeSkill(prev.player, prev.enemy, skill, prev.activeBonds);
        const newEnemyHp = Math.max(0, prev.enemy.currentHp - result.damage);
        const newPlayerHp = Math.min(prev.player.maxHp, prev.player.currentHp + result.heal);
        
        // Reset Player AV
        const newPlayerAV = 10000 / prev.player.stats.speed;

        const updatedParty = prev.party.map(c => 
            c.id === prev.player.id ? { ...c, currentHp: newPlayerHp, currentActionValue: newPlayerAV } : c
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
            player: { ...prev.player, currentHp: newPlayerHp }, // active player remains until next calc
            party: updatedParty,
            enemy: { ...prev.enemy, currentHp: newEnemyHp }, 
            logs: newLogs, 
            isProcessing: false, 
            phase: 'start' // Trigger next turn calc
        };
      });

    } catch (error) {
      console.error(error);
      updateLog(streamingLogId, "通讯故障...", false);
      setBattleState(prev => ({ ...prev, isProcessing: false, phase: 'player_input' }));
    }
  };

  const handleSkillSelection = async (skillId: string) => {
    if (battleState.phase !== 'player_input') return;

    const skill = battleState.player.skills.find(s => s.id === skillId);
    if (!skill) return;

    setBattleState(prev => ({ 
      ...prev, isProcessing: true, phase: 'player_action' 
    }));

    await new Promise(resolve => setTimeout(resolve, 600));

    setBattleState(prev => {
      const result = executeSkill(prev.player, prev.enemy, skill, prev.activeBonds);
      const newEnemyHp = Math.max(0, prev.enemy.currentHp - result.damage);
      const newPlayerHp = Math.min(prev.player.maxHp, prev.player.currentHp + result.heal);

      // Reset Player AV
      const speed = prev.player.stats.speed || 100;
      const newPlayerAV = 10000 / speed;

      const updatedParty = prev.party.map(char => 
        char.id === prev.player.id ? { ...prev.player, currentHp: newPlayerHp, currentActionValue: newPlayerAV } : char
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
         return { ...prev, player: { ...prev.player, currentHp: newPlayerHp }, enemy: { ...prev.enemy, currentHp: newEnemyHp }, logs: newLogs, isProcessing: false, phase: 'victory', party: updatedParty };
      }

      return { ...prev, player: { ...prev.player, currentHp: newPlayerHp }, enemy: { ...prev.enemy, currentHp: newEnemyHp }, logs: newLogs, isProcessing: false, phase: 'start', party: updatedParty };
    });
  };

  return {
    battleState,
    handleCommand,
    handleSkillSelection, 
    switchCharacter
  };
};
