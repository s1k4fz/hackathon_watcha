import type { Character, Skill } from '../../types/game';

const enemyAttack: Skill = {
  id: 'enemy_atk',
  name: '暗影斩',
  description: '带着暗影能量的斩击。',
  risk: 'medium',
  effects: [
    { type: 'damage', value: 1.0, target: 'enemy' }
  ]
};

const enemyStrong: Skill = {
  id: 'enemy_strong',
  name: '深渊突刺',
  description: '致命的突进攻击。',
  risk: 'high',
  effects: [
    { type: 'damage', value: 1.8, target: 'enemy' }
  ]
};

export const initialEnemy: Character = {
  id: 'shadow_knight',
  name: '暗影骑士',
  maxHp: 5000, 
  currentHp: 5000,
  stats: {
    level: 55,       
    attack: 280,     
    defense: 400,    
    critRate: 0.10,
    critDamage: 0.50,
    speed: 110
  },
  skills: [enemyAttack, enemyStrong],
  personality: '冷酷无情的战斗机器。',
  speakingStyle: '......'
};
