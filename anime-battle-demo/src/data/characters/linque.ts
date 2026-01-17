import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

// 技能1 - 「棱光斩击」
const skillBasic: Skill = {
  id: 'linque_basic',
  name: '棱光斩击',
  description: '将共鸣棱镜切换为双刃模式，以精准的轻击斩向目标。',
  risk: 'low',
  effects: [
    { type: 'damage', value: 1.1, target: 'enemy' } // 基础伤害
  ]
};

// 技能2 - 「残响・破碎回音」
const skillBurst: Skill = {
  id: 'linque_burst',
  name: '残响・破碎回音',
  description: '超频激活意念链接，以爆发性的能量冲击敌人。伴随轻微反噬。',
  risk: 'high',
  effects: [
    { type: 'damage', value: 2.8, target: 'enemy' },
    { type: 'self_damage', value: 0.05, target: 'self' } // 5% 反噬
  ]
};

// 技能3 - 「棱镜壁障」
const skillDef: Skill = {
  id: 'linque_def',
  name: '棱镜壁障',
  description: '将共鸣棱镜展开为六角形护盾阵列，折射并削弱来袭的攻击。',
  risk: 'low',
  effects: [
    { type: 'defense', value: 0.5, target: 'self' } // 50% 减伤
  ]
};

// 技能4 - 「微光织补」
const skillHeal: Skill = {
  id: 'linque_heal',
  name: '微光织补',
  description: '利用意念链接的微弱共鸣波动，加速自身纳米修复系统的运作。',
  risk: 'low',
  effects: [
    { type: 'heal', value: 0.35, target: 'self' } // 35% 恢复
  ]
};

export const charLinque: Character = {
  id: 'linque',
  name: '绫雀',
  maxHp: 1150,
  currentHp: 1150,
  stats: {
    level: 50,
    attack: 310,
    defense: 180,
    critRate: 0.2,
    critDamage: 0.6,
    speed: 120
  },
  skills: [skillBasic, skillBurst, skillDef, skillHeal],
  ttsModelId: TTS_CONFIG.linque,
  faction: 'dawn_legacy',
  personality: `
    外表高冷毒舌，内心极度重情。
    用故作洒脱掩饰着对"存在意义"的迷茫，却会为了保护认可她的人而燃尽一切。
    对"你只是复制品"这类言论极其敏感。
    喜欢吃灾前时代的老式糖果。
  `.trim(),
  speakingStyle: `
    简洁干脆，带点刺但不伤人。
    常用口癖："……哼"、"真是的"、"别会错意"。
    战斗中沉稳专注。
    面对玩家时会有些别扭的傲娇，称呼玩家为"搭档"或"喂"。
  `.trim()
};
