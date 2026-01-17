import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skills: Skill[] = [
  {
    id: 'elysia_atk',
    name: '沉醉之矢',
    description: '爱莉希雅轻盈地射出水晶箭矢。',
    risk: 'low',
    effects: [
      { type: 'damage', value: 1.2, target: 'enemy' }
    ]
  },
  {
    id: 'elysia_strong',
    name: '爱之初源',
    description: '在敌人周围生成水晶花种并引爆。',
    risk: 'medium',
    effects: [
      { type: 'damage', value: 2.5, target: 'enemy' }
    ]
  },
  {
    id: 'elysia_ult',
    name: '无瑕·圣域',
    description: '展开巨大的水晶穹顶，万箭齐发。',
    risk: 'high',
    effects: [
      { type: 'damage', value: 4.0, target: 'enemy' }
    ]
  },
  {
    id: 'elysia_def',
    name: '水晶屏障',
    description: '凝聚水晶保护自己。',
    risk: 'low',
    effects: [
      { type: 'defense', value: 0.4, target: 'self' }
    ]
  },
  {
    id: 'elysia_heal',
    name: '治愈时刻',
    description: '哼着歌稍作休息。',
    risk: 'low',
    effects: [
      { type: 'heal', value: 0.35, target: 'self' }
    ]
  }
];

export const charElysia: Character = {
  id: 'elysia',
  name: '爱莉希雅',
  maxHp: 1000,
  currentHp: 1000,
  stats: {
    level: 50,
    attack: 350,       
    defense: 150,      
    critRate: 0.30,    
    critDamage: 0.80,  
    speed: 125
  },
  skills: skills,
  ttsModelId: TTS_CONFIG.elysia,
  faction: 'other',
  personality: '极致的自信与自恋，热情奔放。',
  speakingStyle: '轻快、甜美、带有撒娇的尾音（~♪）。'
};
