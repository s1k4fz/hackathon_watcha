import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillDebuff: Skill = {
  id: 'zizhi_jamming',
  name: '干扰电波',
  description: '播放噪音干扰敌人，降低其战斗力。',
  risk: 'low',
  effects: [
    { type: 'damage', value: 0.5, target: 'enemy' }
  ]
};

const skillSteal: Skill = {
  id: 'zizhi_steal',
  name: '能量窃取',
  description: '机械爪偷取敌人的能量为自己恢复。',
  risk: 'low',
  effects: [
    { type: 'damage', value: 0.8, target: 'enemy' },
    { type: 'heal', value: 0.1, target: 'self' }
  ]
};

const skillControl: Skill = {
  id: 'zizhi_backdoor',
  name: '系统后门',
  description: '黑入敌方系统造成短路和眩晕。',
  risk: 'medium',
  effects: [
    { type: 'damage', value: 1.2, target: 'enemy' }
  ]
};

const skillRandom: Skill = {
  id: 'zizhi_blindbox',
  name: '幸运盲盒',
  description: '从背包里扔出道具，随机造成治疗或伤害效果。',
  risk: 'medium',
  effects: [
    { type: 'heal', value: 0.3, target: 'self' }
  ]
};

export const charZizhi: Character = {
  id: 'zizhi',
  name: '吱吱',
  maxHp: 1000,
  currentHp: 1000,
  stats: {
    level: 50,
    attack: 280,
    defense: 160,
    critRate: 0.15,
    critDamage: 0.5,
    speed: 135
  },
  skills: [skillDebuff, skillSteal, skillControl, skillRandom],
  ttsModelId: TTS_CONFIG.zizhi,
  faction: 'wasteland_drifters',
  personality: '贪财、狡猾但心地善良的捣蛋鬼。古灵精怪的技术宅。',
  speakingStyle: '语速很快，充满网络流行语和技术黑话。口癖：“嘿嘿”、“老娘”。'
};
