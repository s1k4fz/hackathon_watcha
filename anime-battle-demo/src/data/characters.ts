import type { Character, Skill } from '../types/game';

// Skills Definitions
const basicAttack: Skill = {
  id: 'skill_basic',
  name: '普通射击',
  type: 'attack',
  value: 15,
  risk: 'low',
  description: '快速的双枪射击，伤害一般但很安全。'
};

const strongAttack: Skill = {
  id: 'skill_strong',
  name: '猫猫回旋踢',
  type: 'attack',
  value: 35,
  risk: 'medium',
  description: '强力的近身格斗技，造成可观伤害。'
};

const ultimateAttack: Skill = {
  id: 'skill_ult',
  name: '冈格尼尔·爆裂',
  type: 'attack',
  value: 70,
  risk: 'high',
  description: '孤注一掷的全力炮击，威力巨大但破绽大。'
};

const defenseSkill: Skill = {
  id: 'skill_def',
  name: '虚数屏障',
  type: 'defense',
  value: 0, // Reduces incoming damage
  risk: 'low',
  description: '展开护盾，大幅减少受到的伤害。'
};

const healSkill: Skill = {
  id: 'skill_heal',
  name: '应急食品',
  type: 'heal',
  value: 30,
  risk: 'low',
  description: '吃掉藏在身上的零食，恢复体力。'
};

// Enemy Skills
const enemyAttack: Skill = {
  id: 'enemy_atk',
  name: '暗影斩',
  type: 'attack',
  value: 20,
  risk: 'medium',
  description: '带着暗影能量的斩击。'
};

const enemyStrong: Skill = {
  id: 'enemy_strong',
  name: '深渊突刺',
  type: 'attack',
  value: 40,
  risk: 'high',
  description: '致命的突进攻击。'
};

// Characters
export const initialPlayer: Character = {
  id: 'kiana',
  name: '琪亚娜',
  maxHp: 100,
  currentHp: 100,
  skills: [basicAttack, strongAttack, ultimateAttack, defenseSkill, healSkill],
  personality: '热血、冲动、重视同伴、乐观、偶尔冒失。虽然有时候不靠谱，但在关键时刻非常值得信赖。',
  speakingStyle: '充满活力，喜欢用感叹号。称呼玩家为"舰长"或"搭档"。语气自信，偶尔会撒娇或抱怨肚子饿。',
  trust: 50
};

export const initialEnemy: Character = {
  id: 'shadow_knight',
  name: '暗影骑士',
  maxHp: 150, // Slightly stronger boss feel
  currentHp: 150,
  skills: [enemyAttack, enemyStrong],
  personality: '冷酷无情的战斗机器，沉默寡言。',
  speakingStyle: '......'
};
