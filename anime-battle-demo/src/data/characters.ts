import type { Character, Skill } from '../types/game';
import { TTS_CONFIG } from './ttsConfig';

// ------------------------------------------------------------------
// 琪亚娜 (Kiana)
// ------------------------------------------------------------------
const kianaSkills: Skill[] = [
  {
    id: 'skill_basic',
    name: '普通射击',
    description: '快速的双枪射击。',
    risk: 'low',
    effects: [
      { type: 'damage', value: 1.0, target: 'enemy' }
    ]
  },
  {
    id: 'skill_strong',
    name: '猫猫回旋踢',
    description: '强力的近身格斗技。',
    risk: 'medium',
    effects: [
      { type: 'damage', value: 2.2, target: 'enemy' }
    ]
  },
  {
    id: 'skill_ult',
    name: '冈格尼尔·爆裂',
    description: '孤注一掷的全力炮击。',
    risk: 'high',
    effects: [
      { type: 'damage', value: 3.5, target: 'enemy' }
    ]
  },
  {
    id: 'skill_def',
    name: '虚数屏障',
    description: '展开护盾，防御并恢复少量体力。',
    risk: 'low',
    effects: [
      { type: 'defense', value: 0.5, target: 'self' }, // 50% 减伤
      { type: 'heal', value: 0.05, target: 'self' }    // 额外回 5% 血
    ]
  },
  {
    id: 'skill_heal',
    name: '应急食品',
    description: '吃掉藏在身上的零食。',
    risk: 'low',
    effects: [
      { type: 'heal', value: 0.3, target: 'self' }
    ]
  }
];

export const charKiana: Character = {
  id: 'kiana',
  name: '琪亚娜',
  maxHp: 1200,
  currentHp: 1200,
  stats: {
    level: 50,
    attack: 300,
    defense: 200,
    critRate: 0.15,   
    critDamage: 0.50, 
  },
  skills: kianaSkills,
  ttsModelId: TTS_CONFIG.kiana,
  personality: '热血、冲动、重视同伴、乐观。',
  speakingStyle: '充满活力，喜欢用感叹号。称呼玩家为"舰长"。'
};

// ------------------------------------------------------------------
// 爱莉希雅 (Elysia)
// ------------------------------------------------------------------
const elysiaSkills: Skill[] = [
  {
    id: 'elysia_atk',
    name: '沉醉之矢',
    description: '爱莉希雅轻盈地射出水晶箭矢。',
    risk: 'low',
    effects: [
      { type: 'damage', value: 1.2, target: 'enemy' }
    ]
  },
  {
    id: 'elysia_strong',
    name: '爱之初源',
    description: '在敌人周围生成水晶花种并引爆。',
    risk: 'medium',
    effects: [
      { type: 'damage', value: 2.5, target: 'enemy' }
    ]
  },
  {
    id: 'elysia_ult',
    name: '无瑕·圣域',
    description: '展开巨大的水晶穹顶，万箭齐发。',
    risk: 'high',
    effects: [
      { type: 'damage', value: 4.0, target: 'enemy' }
    ]
  },
  {
    id: 'elysia_def',
    name: '水晶屏障',
    description: '凝聚水晶保护自己。',
    risk: 'low',
    effects: [
      { type: 'defense', value: 0.4, target: 'self' }
    ]
  },
  {
    id: 'elysia_heal',
    name: '治愈时刻',
    description: '哼着歌稍作休息。',
    risk: 'low',
    effects: [
      { type: 'heal', value: 0.35, target: 'self' }
    ]
  }
];

export const charElysia: Character = {
  id: 'elysia',
  name: '爱莉希雅',
  maxHp: 1000,
  currentHp: 1000,
  stats: {
    level: 50,
    attack: 350,       
    defense: 150,      
    critRate: 0.30,    
    critDamage: 0.80,  
  },
  skills: elysiaSkills,
  ttsModelId: TTS_CONFIG.elysia,
  personality: '极致的自信与自恋，热情奔放。',
  speakingStyle: '轻快、甜美、带有撒娇的尾音（~♪）。'
};

// ------------------------------------------------------------------
// 雷电芽衣 (Raiden Mei)
// ------------------------------------------------------------------
const meiSkills: Skill[] = [
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
  },
  skills: meiSkills,
  ttsModelId: TTS_CONFIG.mei,
  personality: '温柔体贴，坚韧决绝。',
  speakingStyle: '温和稳重，战斗时严厉冷酷。'
};

// ------------------------------------------------------------------
// 敌人设定 (Shadow Knight)
// ------------------------------------------------------------------
const enemyAttack: Skill = {
  id: 'enemy_atk',
  name: '暗影斩',
  description: '带着暗影能量的斩击。',
  risk: 'medium',
  effects: [
    { type: 'damage', value: 1.0, target: 'enemy' }
  ]
};

const enemyStrong: Skill = {
  id: 'enemy_strong',
  name: '深渊突刺',
  description: '致命的突进攻击。',
  risk: 'high',
  effects: [
    { type: 'damage', value: 1.8, target: 'enemy' }
  ]
};

export const initialEnemy: Character = {
  id: 'shadow_knight',
  name: '暗影骑士',
  maxHp: 5000, 
  currentHp: 5000,
  stats: {
    level: 55,       
    attack: 280,     
    defense: 400,    
    critRate: 0.10,
    critDamage: 0.50,
  },
  skills: [enemyAttack, enemyStrong],
  personality: '冷酷无情的战斗机器。',
  speakingStyle: '......'
};

export const availableCharacters = [charKiana, charElysia, charMei];
export const initialPlayer = charKiana;
