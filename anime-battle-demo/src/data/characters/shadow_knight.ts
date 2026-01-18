import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const enemyAttack: Skill = {
  id: 'enemy_atk',
  name: '暗影斩',
  description: '汇聚暗影能量的斩击，切割空气发出尖啸。',
  effects: [
    { type: 'damage', value: 1.2, target: 'enemy' }
  ],
  battleLine: "暗影... 斩！"
};

const enemyStrong: Skill = {
  id: 'enemy_strong',
  name: '深渊突刺',
  description: '致命的突进攻击，仿佛要贯穿灵魂。',
  effects: [
    { type: 'damage', value: 1.8, target: 'enemy' }
  ],
  battleLine: "深渊... 会吞噬你！"
};

const enemyDefense: Skill = {
  id: 'enemy_def',
  name: '虚空护甲',
  description: '召唤虚空能量硬化铠甲。',
  effects: [
    { type: 'buff_def', value: 0.3, target: 'self' },
    { type: 'heal', value: 0.05, target: 'self' }
  ],
  battleLine: "虚空... 护佑！"
};

export const enemyShadowKnight: Character = {
  id: 'enemy_shadow_knight',
  name: '暗影骑士',
  maxHp: 1500, 
  currentHp: 1500,
  stats: {
    level: 55,       
    attack: 160, 
    defense: 100, 
    critRate: 0.15,
    critDamage: 0.50,
    speed: 110
  },
  skills: [enemyAttack, enemyStrong, enemyDefense],
  personality: '曾经是光辉的圣骑士，如今被深渊侵蚀，成为了沉默的守门人。它们没有痛觉，没有恐惧，只有对入侵者的无尽杀意。',
  speakingStyle: '......(沉重的铠甲摩擦声)',
  faction: 'other',
  ttsModelId: TTS_CONFIG.shadow_knight,
  battleLines: {
    start: ["......(剑锋指向你)", "......入侵者......清除......", "......为了......荣耀......？"],
    skill: ["......喝！", "......斩！", "......绝望吧。", "......死！"],
    hit: ["......没用的。", "......(铠甲弹开了攻击)", "......太弱了。"],
    defeat: ["......终于......解脱了......", "......光......好刺眼......"]
  }
};
