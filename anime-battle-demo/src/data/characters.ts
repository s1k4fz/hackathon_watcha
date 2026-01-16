import type { Character, Skill } from '../types/game';
import { TTS_CONFIG } from './ttsConfig';

// ------------------------------------------------------------------
// 琪亚娜 (Kiana) - 薪炎之律者
// ------------------------------------------------------------------
const kianaSkills: Skill[] = [
  {
    id: 'skill_basic',
    name: '普通射击',
    type: 'attack',
    value: 15,
    risk: 'low',
    description: '快速的双枪射击，伤害一般但很安全。'
  },
  {
    id: 'skill_strong',
    name: '猫猫回旋踢',
    type: 'attack',
    value: 35,
    risk: 'medium',
    description: '强力的近身格斗技，造成可观伤害。'
  },
  {
    id: 'skill_ult',
    name: '冈格尼尔·爆裂',
    type: 'attack',
    value: 70,
    risk: 'high',
    description: '孤注一掷的全力炮击，威力巨大但破绽大。'
  },
  {
    id: 'skill_def',
    name: '虚数屏障',
    type: 'defense',
    value: 0, 
    risk: 'low',
    description: '展开护盾，大幅减少受到的伤害。'
  },
  {
    id: 'skill_heal',
    name: '应急食品',
    type: 'heal',
    value: 30,
    risk: 'low',
    description: '吃掉藏在身上的零食，恢复体力。'
  }
];

export const charKiana: Character = {
  id: 'kiana',
  name: '琪亚娜',
  maxHp: 100,
  currentHp: 100,
  skills: kianaSkills,
  ttsModelId: TTS_CONFIG.kiana,
  personality: '热血、冲动、重视同伴、乐观、偶尔冒失。虽然有时候不靠谱，但在关键时刻非常值得信赖。',
  speakingStyle: '充满活力，喜欢用感叹号。称呼玩家为"舰长"或"搭档"。语气自信，偶尔会撒娇或抱怨肚子饿。'
};

// ------------------------------------------------------------------
// 爱莉希雅 (Elysia) - 粉色妖精小姐
// ------------------------------------------------------------------
const elysiaSkills: Skill[] = [
  {
    id: 'elysia_atk',
    name: '沉醉之矢',
    type: 'attack',
    value: 20,
    risk: 'low',
    description: '爱莉希雅轻盈地射出水晶箭矢，优雅而从容。'
  },
  {
    id: 'elysia_strong',
    name: '爱之初源',
    type: 'attack',
    value: 45,
    risk: 'medium',
    description: '在敌人周围生成水晶花种并引爆，造成绚丽的范围伤害。'
  },
  {
    id: 'elysia_ult',
    name: '无瑕·圣域',
    type: 'attack',
    value: 85,
    risk: 'high',
    description: '“去告诉大家，哪怕是像我这样的律者——” 展开巨大的水晶穹顶，万箭齐发。'
  },
  {
    id: 'elysia_def',
    name: '水晶屏障',
    type: 'defense',
    value: 0,
    risk: 'low',
    description: '凝聚水晶保护自己。“哎呀，别这么粗鲁嘛~”'
  },
  {
    id: 'elysia_heal',
    name: '治愈时刻',
    type: 'heal',
    value: 35,
    risk: 'low',
    description: '哼着歌稍作休息，调整状态。“无论是谁，偶尔也需要休息一下的，对吧？”'
  }
];

export const charElysia: Character = {
  id: 'elysia',
  name: '爱莉希雅',
  maxHp: 120,
  currentHp: 120,
  skills: elysiaSkills,
  ttsModelId: TTS_CONFIG.elysia,
  personality: `
    最可爱的“人之律者”爱莉希雅！
    1. **极致的自信与自恋**：总是称赞自己的美貌和可爱，但这并非傲慢，而是发自内心的真诚。
    2. **热情奔放**：对所有人（尤其是可爱的女孩子）都充满好感，喜欢贴贴。
    3. **神秘感**：虽然看似天真烂漫，但偶尔会流露出看透一切的深邃。
  `,
  speakingStyle: `
    1. **称呼**：喜欢叫玩家“可爱的指挥官”、“亲爱的”、“你”。
    2. **语气**：轻快、甜美、带有撒娇的尾音（~♪）。
    3. **口癖**：经常说“哎呀”、“嗯哼”、“对吧？”。
  `
};

// ------------------------------------------------------------------
// 雷电芽衣 (Raiden Mei) - 雷之律者
// ------------------------------------------------------------------
const meiSkills: Skill[] = [
  {
    id: 'mei_atk',
    name: '太刀·连斩',
    type: 'attack',
    value: 25,
    risk: 'low',
    description: '迅捷的太刀连击，如雷光般利落。'
  },
  {
    id: 'mei_strong',
    name: '祸斗·雷闪',
    type: 'attack',
    value: 50,
    risk: 'medium',
    description: '召唤落雷附着于刀身，发动强力的一闪。'
  },
  {
    id: 'mei_ult',
    name: '鸣神·俱利伽罗',
    type: 'attack',
    value: 90,
    risk: 'high',
    description: '召唤俱利伽罗龙，驾驭巨龙对战场进行毁灭性的雷电轰炸。'
  },
  {
    id: 'mei_def',
    name: '心眼·格挡',
    type: 'defense',
    value: 0,
    risk: 'low',
    description: '进入心眼状态，看穿敌人的攻击并格挡。'
  },
  {
    id: 'mei_heal',
    name: '煮饭时刻',
    type: 'heal',
    value: 30,
    risk: 'low',
    description: '拿出一份精心准备的便当，补充体力。'
  }
];

export const charMei: Character = {
  id: 'mei',
  name: '雷电芽衣',
  maxHp: 110,
  currentHp: 110,
  skills: meiSkills,
  ttsModelId: TTS_CONFIG.mei,
  personality: `
    雷电芽衣，曾经的大小姐，现在的雷之律者。
    1. **温柔体贴**：本质上非常会照顾人，擅长料理，性格温和。
    2. **坚韧决绝**：为了拯救最重要的人（琪亚娜），甘愿堕入黑暗。
    3. **成熟稳重**：相比琪亚娜的冲动，芽衣更加理性。
  `,
  speakingStyle: `
    1. **称呼**：礼貌地称呼玩家“舰长”，或者直呼其名。
    2. **语气**：平时温和稳重，战斗时严厉冷酷。
    3. **示例**：“如果你受伤了，我会很困扰的。”
  `
};

// ------------------------------------------------------------------
// 敌人设定
// ------------------------------------------------------------------
const enemyAttack: Skill = {
  id: 'enemy_atk',
  name: '暗影斩',
  type: 'attack',
  value: 20,
  risk: 'medium',
  description: '带着暗影能量的斩击。'
};

const enemyStrong: Skill = {
  id: 'enemy_strong',
  name: '深渊突刺',
  type: 'attack',
  value: 40,
  risk: 'high',
  description: '致命的突进攻击。'
};

export const initialEnemy: Character = {
  id: 'shadow_knight',
  name: '暗影骑士',
  maxHp: 150,
  currentHp: 150,
  skills: [enemyAttack, enemyStrong],
  personality: '冷酷无情的战斗机器，沉默寡言。',
  speakingStyle: '......'
};

// 导出角色列表供选择
export const availableCharacters = [charKiana, charElysia, charMei];

// 默认主角
export const initialPlayer = charKiana;
