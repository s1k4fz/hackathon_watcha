import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillQuick: Skill = {
  id: 'vs_quick',
  name: '瞬影杀',
  description: '快如闪电的一击，难以捕捉。',
  effects: [
    { type: 'damage', value: 0.8, target: 'enemy' }
  ],
  battleLine: "太慢了..."
};

const skillCrit: Skill = {
  id: 'vs_crit',
  name: '弱点洞察',
  description: '找出敌人的致命弱点并发起猛攻。',
  effects: [
    { type: 'damage', value: 1.5, target: 'enemy' },
    { type: 'buff_atk', value: 0.2, target: 'self' }
  ],
  battleLine: "找到你了... 弱点！"
};

export const enemyVoidStalker: Character = {
  id: 'enemy_void_stalker',
  name: '虚空潜行者',
  maxHp: 1800, 
  currentHp: 1800,
  stats: {
    level: 50,       
    attack: 220,    
    defense: 80,   
    critRate: 0.35,
    critDamage: 0.60,
    speed: 135
  },
  skills: [skillQuick, skillCrit],
  personality: '虚空中凝结而成的杀手，它们如同影子般在战场上穿梭，专门猎杀落单的猎物。它们喜欢玩弄猎物，在恐惧中给予最后一击。',
  speakingStyle: '嘶... 你的恐惧... 很美味...',
  faction: 'other',
  ttsModelId: TTS_CONFIG.void_stalker,
  battleLines: {
    start: ["嘶... 鲜活的... 生命...", "我看得到... 你的恐惧...", "猎杀... 开始..."],
    skill: ["在这里...", "别想跑...", "太慢了！", "嘶... 撕碎你！"],
    hit: ["嘶... 痛...", "别得意...", "我会... 报复..."],
    defeat: ["回归... 虚空...", "不... 还没有... 结束...", "嘶......"]
  }
};
