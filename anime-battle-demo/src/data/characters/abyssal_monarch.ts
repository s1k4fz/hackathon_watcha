import type { Character, Skill } from '../../types/game';
import { TTS_CONFIG } from '../ttsConfig';

const skillSmash: Skill = {
  id: 'boss_smash',
  name: '重力碾压',
  description: '扭曲重力场，将敌人压碎。',
  effects: [
    { type: 'damage', value: 1.5, target: 'enemy' }
  ],
  battleLine: "在重力面前... 跪下！"
};

const skillNuke: Skill = {
  id: 'boss_nuke',
  name: '视界毁灭',
  description: '模拟黑洞边缘的能量爆发，毁灭一切。',
  effects: [
    { type: 'damage', value: 2.5, target: 'enemy' },
    { type: 'self_damage', value: 0.05, target: 'self' } // 消耗自身能量
  ],
  battleLine: "视界... 毁灭！"
};

const skillRecover: Skill = {
  id: 'boss_recover',
  name: '吞噬星辰',
  description: '吞噬周围的光芒以修复自身。',
  effects: [
    { type: 'heal', value: 0.1, target: 'self' },
    { type: 'buff_def', value: 0.2, target: 'self' }
  ],
  battleLine: "星辰... 归于吾身..."
};

export const enemyAbyssalMonarch: Character = {
  id: 'enemy_abyssal_monarch',
  name: '深渊君主',
  maxHp: 2500, 
  currentHp: 2500,
  stats: {
    level: 70,       
    attack: 200,     
    defense: 150,    
    critRate: 0.05,
    critDamage: 0.50,
    speed: 85
  },
  skills: [skillSmash, skillNuke, skillRecover],
  personality: '古老而不可名状的恐怖存在，它的思维早已超越了凡人的理解。它视万物为蝼蚁，只想将整个世界拉入永恒的寂静。',
  speakingStyle: '归于... 虚无...',
  faction: 'other',
  ttsModelId: TTS_CONFIG.abyssal_monarch,
  battleLines: {
    start: ["蝼蚁... 竟敢直视深渊...", "光芒... 终将熄灭...", "吾即是... 终焉..."],
    skill: ["跪下...", "粉碎吧...", "感受... 这种重量...", "归零..."],
    hit: ["微不足道...", "这就是... 你们的全力？", "徒劳..."],
    defeat: ["深渊... 不会... 消亡...", "吾... 只是... 暂且沉睡...", "不可能......"]
  }
};
