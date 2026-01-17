import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillHeal: Skill = {
  id: 'uni_heal',
  name: '治愈音波',
  description: '唱出治愈的歌声，恢复体力。',
  risk: 'low',
  effects: [
    { type: 'heal', value: 0.3, target: 'self' }
  ]
};

const skillBuff: Skill = {
  id: 'uni_beat',
  name: '激昂节拍',
  description: '切换到摇滚模式，振奋士气，提升攻击。',
  risk: 'medium',
  effects: [
    { type: 'buff_atk', value: 0.2, target: 'self' }
  ]
};

const skillAttack: Skill = {
  id: 'uni_glitch',
  name: '故障干扰',
  description: '发出刺耳的噪音攻击敌人。',
  risk: 'low',
  effects: [
    { type: 'damage', value: 0.8, target: 'enemy' }
  ]
};

const skillUlt: Skill = {
  id: 'uni_encore',
  name: '谢幕演出',
  description: '消耗自身能量，提供大幅治疗和保护。',
  risk: 'high',
  effects: [
    { type: 'heal', value: 0.8, target: 'self' },
    { type: 'self_damage', value: 0.2, target: 'self' }
  ]
};

export const charUni: Character = {
  id: 'uni',
  name: '尤尼',
  maxHp: 1100,
  currentHp: 1100,
  stats: {
    level: 50,
    attack: 260,
    defense: 160,
    critRate: 0.1,
    critDamage: 0.5,
    speed: 100
  },
  skills: [skillHeal, skillBuff, skillAttack, skillUlt],
  ttsModelId: TTS_CONFIG.uni,
  faction: 'ai_awakened',
  personality: '天真烂漫的AI歌姬，缺乏常识的天然黑。元气、电波系、故障艺术。',
  speakingStyle: '歌剧般的咏叹调，夹杂着电子音效。口癖：“Live Start!”、“Biu~”。'
};
