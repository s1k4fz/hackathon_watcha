import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillBasic: Skill = {
  id: 'luoshu_record',
  name: '数据记录',
  description: '操控浮游盾撞击敌人，并解析弱点。',
  risk: 'low',
  effects: [
    { type: 'damage', value: 0.8, target: 'enemy' }
  ]
};

const skillDef: Skill = {
  id: 'luoshu_threshold',
  name: '绝对阈值',
  description: '展开全方位力场，强制敌人攻击自己。',
  risk: 'medium',
  effects: [
    { type: 'defense', value: 0.6, target: 'self' }
  ]
};

const skillHeal: Skill = {
  id: 'luoshu_rollback',
  name: '回档协议',
  description: '将目标状态“回滚”到受伤前。',
  risk: 'medium',
  effects: [
    { type: 'heal', value: 0.2, target: 'self' }
  ]
};

const skillControl: Skill = {
  id: 'luoshu_stasis',
  name: '静滞力场',
  description: '锁定区域内的时间流速，限制敌人行动。',
  risk: 'high',
  effects: [
    { type: 'damage', value: 1.2, target: 'enemy' }
  ]
};

export const charLuoshu: Character = {
  id: 'luoshu',
  name: '洛书',
  maxHp: 1400,
  currentHp: 1400,
  stats: {
    level: 50,
    attack: 250,
    defense: 250,
    critRate: 0.1,
    critDamage: 0.5,
    speed: 95
  },
  skills: [skillBasic, skillDef, skillHeal, skillControl],
  ttsModelId: TTS_CONFIG.luoshu,
  faction: 'dawn_legacy',
  personality: '绝对理性的观察者，缺乏情感波动，视一切为数据。三无、强迫症、毒舌（无意识）。',
  speakingStyle: '像AI一样精准，喜欢用数据和概率说话。口癖：“根据计算……”、“无意义的行为”。'
};
