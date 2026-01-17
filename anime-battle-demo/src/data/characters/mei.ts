import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skills: Skill[] = [
  {
    id: 'mei_atk',
    name: '太刀·连斩',
    description: '迅捷的太刀连击。',
    risk: 'low',
    effects: [
      { type: 'damage', value: 1.1, target: 'enemy' }
    ]
  },
  {
    id: 'mei_strong',
    name: '祸斗·雷闪',
    description: '召唤落雷附着于刀身，发动强力的一闪。',
    risk: 'medium',
    effects: [
      { type: 'damage', value: 2.4, target: 'enemy' }
    ]
  },
  {
    id: 'mei_ult',
    name: '鸣神·俱利伽罗',
    description: '召唤俱利伽罗龙，驾驭巨龙进行轰炸。',
    risk: 'high',
    effects: [
      { type: 'damage', value: 3.8, target: 'enemy' }
    ]
  },
  {
    id: 'mei_def',
    name: '心眼·格挡',
    description: '进入心眼状态。',
    risk: 'low',
    effects: [
      { type: 'defense', value: 0.6, target: 'self' }
    ]
  },
  {
    id: 'mei_heal',
    name: '煮饭时刻',
    description: '拿出一份精心准备的便当。',
    risk: 'low',
    effects: [
      { type: 'heal', value: 0.3, target: 'self' }
    ]
  }
];

export const charMei: Character = {
  id: 'mei',
  name: '雷电芽衣',
  maxHp: 1100,
  currentHp: 1100,
  stats: {
    level: 50,
    attack: 320,
    defense: 220,
    critRate: 0.20,
    critDamage: 0.60,
    speed: 120
  },
  skills: skills,
  ttsModelId: TTS_CONFIG.mei,
  faction: 'other',
  personality: '温柔体贴，坚韧决绝。',
  speakingStyle: '温和稳重，战斗时严厉冷酷。'
};
