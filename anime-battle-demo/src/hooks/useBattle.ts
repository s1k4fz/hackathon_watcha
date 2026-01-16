import { useState, useEffect, useCallback } from 'react';
import type { BattleState, Character, Skill, AIActionResponse } from '../types/game';
import { initialPlayer, initialEnemy } from '../data/characters';
import { analyzeCommand } from '../services/ai';

export const useBattle = (apiKey: string) => {
  const [battleState, setBattleState] = useState<BattleState>({
    turn: 1,
    phase: 'start',
    player: { ...initialPlayer },
    enemy: { ...initialEnemy },
    logs: [{ turn: 0, message: '战斗开始！遭遇暗影骑士！', speaker: 'system' }],
    isProcessing: false
  });

  const addLog = (message: string, speaker: 'system' | 'player' | 'enemy' = 'system') => {
    setBattleState(prev => ({
      ...prev,
      logs: [...prev.logs, { turn: prev.turn, message, speaker }]
    }));
  };

  // Execute a skill
  const executeSkill = useCallback((user: Character, target: Character, skill: Skill) => {
    let damage = 0;
    let heal = 0;
    let logMsg = '';

    if (skill.type === 'attack') {
      // Basic damage calculation with some randomness
      const variance = Math.random() * 0.2 + 0.9; // 0.9 - 1.1
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
      // Simple enemy AI: Random skill
      const enemySkill = prev.enemy.skills[Math.floor(Math.random() * prev.enemy.skills.length)];
      const result = executeSkill(prev.enemy, prev.player, enemySkill);
      
      const newPlayerHp = Math.max(0, prev.player.currentHp - result.damage);
      const newEnemyHp = Math.min(prev.enemy.maxHp, prev.enemy.currentHp + result.heal);

      // FIX: Don't call addLog inside setBattleState, update logs directly
      const newLogs = [...prev.logs, { turn: prev.turn, message: result.logMsg, speaker: 'enemy' as const }];
      
      // Check for defeat
      if (newPlayerHp <= 0) {
        newLogs.push({ turn: prev.turn, message: `${prev.player.name} 倒下了... 战斗失败。`, speaker: 'system' });
        return {
          ...prev,
          player: { ...prev.player, currentHp: newPlayerHp },
          enemy: { ...prev.enemy, currentHp: newEnemyHp },
          logs: newLogs,
          phase: 'defeat'
        };
      }

      return {
        ...prev,
        player: { ...prev.player, currentHp: newPlayerHp },
        enemy: { ...prev.enemy, currentHp: newEnemyHp },
        logs: newLogs,
        phase: 'player_input',
        turn: prev.turn + 1
      };
    });
  }, [executeSkill]);

  // Player Command Handler
  const handleCommand = async (command: string) => {
    if (battleState.phase !== 'player_input') return;

    // 1. Log Command
    addLog(`"${command}"`, 'player');
    setBattleState(prev => ({ ...prev, isProcessing: true, phase: 'ai_processing' }));

    try {
      // 2. AI Interpretation (REAL API CALL)
      const aiResponse = await analyzeCommand(
        apiKey,
        command,
        battleState.player,
        battleState.enemy,
        battleState.turn
      );

      // 3. Character Response Log
      addLog(`${aiResponse.character_response}`, 'system'); 
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // 4. Execute Skill
      setBattleState(prev => {
        const skill = prev.player.skills.find(s => s.id === aiResponse.chosen_skill_id);
        if (!skill) return prev;

        const result = executeSkill(prev.player, prev.enemy, skill);
        const newEnemyHp = Math.max(0, prev.enemy.currentHp - result.damage);
        const newPlayerHp = Math.min(prev.player.maxHp, prev.player.currentHp + result.heal);

        // FIX: Update logs directly in state
        const newLogs = [...prev.logs, { turn: prev.turn, message: result.logMsg, speaker: 'system' as const }];

        // Check Victory
        if (newEnemyHp <= 0) {
           newLogs.push({ turn: prev.turn, message: `${prev.enemy.name} 被击败了！战斗胜利！`, speaker: 'system' });
           return {
             ...prev,
             player: { ...prev.player, currentHp: newPlayerHp },
             enemy: { ...prev.enemy, currentHp: newEnemyHp },
             logs: newLogs,
             isProcessing: false,
             phase: 'victory'
           };
        }

        return {
          ...prev,
          player: { ...prev.player, currentHp: newPlayerHp },
          enemy: { ...prev.enemy, currentHp: newEnemyHp },
          logs: newLogs,
          isProcessing: false,
          phase: 'enemy_action' 
        };
      });

    } catch (error) {
      console.error(error);
      addLog("通讯故障... (AI解析失败)", 'system');
      setBattleState(prev => ({ ...prev, isProcessing: false, phase: 'player_input' }));
    }
  };

  // Trigger Enemy Turn Effect
  useEffect(() => {
    if (battleState.phase === 'enemy_action') {
      processEnemyTurn();
    }
  }, [battleState.phase, processEnemyTurn]);

  // Initial Start
  useEffect(() => {
    if (battleState.phase === 'start') {
      setTimeout(() => {
        setBattleState(prev => ({ ...prev, phase: 'player_input' }));
      }, 1000);
    }
  }, [battleState.phase]);

  return {
    battleState,
    handleCommand
  };
};
