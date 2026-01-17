import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillPierce: Skill = {
  id: 'simon_pierce',
  name: '精神穿刺',
  description: '投掷手术刀，直接攻击精神。',
  risk: 'low',
  effects: [
    { type: 'damage', value: 1.0, target: 'enemy' }
  ]
};

const skillGaze: Skill = {
  id: 'simon_gaze',
  name: '深渊凝视',
  description: '让敌人看到深渊的幻象，陷入混乱。',
  risk: 'medium',
  effects: [
    { type: 'damage', value: 0.5, target: 'enemy' }
  ]
};

const skillHeal: Skill = {
  id: 'simon_sedation',
  name: '强制镇静',
  description: '给友军注射未知药剂，恢复体力但可能不仅如此。',
  risk: 'high',
  effects: [
    { type: 'heal', value: 0.4, target: 'self' }
  ]
};

const skillAoe: Skill = {
  id: 'simon_hysteria',
  name: '群体歇斯底里',
  description: '引爆全场的恐惧情绪，造成精神伤害。',
  risk: 'high',
  effects: [
    { type: 'damage', value: 2.5, target: 'enemy' }
  ]
};

export const charSimon: Character = {
  id: 'simon',
  name: '西蒙',
  maxHp: 1250,
  currentHp: 1250,
  stats: {
    level: 50,
    attack: 300,
    defense: 180,
    critRate: 0.3,
    critDamage: 0.8,
    speed: 110
  },
  skills: [skillPierce, skillGaze, skillHeal, skillAoe],
  ttsModelId: TTS_CONFIG.simon,
  faction: 'deep_dive',
  personality: '疯狂的虚无主义者，以折磨精神为乐。病娇、优雅、疯狂。',
  speakingStyle: '缓慢、优雅、带有磁性，喜欢用医疗术语比喻杀戮。口癖：“这会有点疼……”、“多美的灵魂”。'
};
