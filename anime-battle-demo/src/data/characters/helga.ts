import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillBasic: Skill = {
  id: 'helga_slash',
  name: '爆裂重斩',
  description: '挥舞巨剑重击，概率造成燃烧。',
  risk: 'medium',
  effects: [
    { type: 'damage', value: 1.5, target: 'enemy' }
  ]
};

const skillBurst: Skill = {
  id: 'helga_full_burst',
  name: '全弹发射',
  description: '倾泻外骨骼内的所有弹药。',
  risk: 'high',
  effects: [
    { type: 'damage', value: 2.0, target: 'enemy' }
  ]
};

const skillBuff: Skill = {
  id: 'helga_overload',
  name: '过载模式',
  description: '解除出力限制，进入狂暴状态，大幅提升攻击但降低防御。',
  risk: 'high',
  effects: [
    { type: 'buff_atk', value: 0.5, target: 'self' }
  ]
};

const skillExecute: Skill = {
  id: 'helga_execute',
  name: '处决',
  description: '对低血量敌人造成巨额伤害。',
  risk: 'medium',
  effects: [
    { type: 'damage', value: 2.8, target: 'enemy' }
  ]
};

export const charHelga: Character = {
  id: 'helga',
  name: '赫尔加',
  maxHp: 1300,
  currentHp: 1300,
  stats: {
    level: 50,
    attack: 350,
    defense: 150,
    critRate: 0.25,
    critDamage: 0.6,
    speed: 105
  },
  skills: [skillBasic, skillBurst, skillBuff, skillExecute],
  ttsModelId: TTS_CONFIG.helga,
  faction: 'crimson_heavy',
  personality: '豪爽好战的战斗狂，信奉力量，但极重义气。热血大姐头。',
  speakingStyle: '声音洪亮，喜欢用命令口吻，充满自信。口癖：“哈！”、“给老娘炸！”。'
};
