import type { Skill } from '../../types/game';

// 通用防御技能
export const commonDefense: Skill = {
  id: 'common_defense',
  name: '防御姿态',
  description: '采取防御姿态，减少受到的伤害。',
  risk: 'low',
  effects: [
    { type: 'defense', value: 0.5, target: 'self' }
  ]
};

// 通用治疗技能 (小幅)
export const commonHealSmall: Skill = {
  id: 'common_heal_small',
  name: '应急处理',
  description: '简单的伤口处理。',
  risk: 'low',
  effects: [
    { type: 'heal', value: 0.15, target: 'self' }
  ]
};
