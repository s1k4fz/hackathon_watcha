import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skills: Skill[] = [
  {
    id: 'skill_basic',
    name: '普通射击',
    description: '快速的双枪射击。',
    risk: 'low',
    effects: [
      { type: 'damage', value: 1.0, target: 'enemy' }
    ]
  },
  {
    id: 'skill_strong',
    name: '猫猫回旋踢',
    description: '强力的近身格斗技。',
    risk: 'medium',
    effects: [
      { type: 'damage', value: 2.2, target: 'enemy' }
    ]
  },
  {
    id: 'skill_ult',
    name: '冈格尼尔·爆裂',
    description: '孤注一掷的全力炮击。',
    risk: 'high',
    effects: [
      { type: 'damage', value: 3.5, target: 'enemy' }
    ]
  },
  {
    id: 'skill_def',
    name: '虚数屏障',
    description: '展开护盾，防御并恢复少量体力。',
    risk: 'low',
    effects: [
      { type: 'defense', value: 0.5, target: 'self' }, // 50% 减伤
      { type: 'heal', value: 0.05, target: 'self' }    // 额外回 5% 血
    ]
  },
  {
    id: 'skill_heal',
    name: '应急食品',
    description: '吃掉藏在身上的零食。',
    risk: 'low',
    effects: [
      { type: 'heal', value: 0.3, target: 'self' }
    ]
  }
];

export const charKiana: Character = {
  id: 'kiana',
  name: '琪亚娜',
  maxHp: 1200,
  currentHp: 1200,
  stats: {
    level: 50,
    attack: 300,
    defense: 200,
    critRate: 0.15,   
    critDamage: 0.50, 
    speed: 115
  },
  skills: skills,
  ttsModelId: TTS_CONFIG.kiana,
  faction: 'other',
  personality: '热血、冲动、重视同伴、乐观。',
  speakingStyle: '充满活力，喜欢用感叹号。称呼玩家为"舰长"。'
};
