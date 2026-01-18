export type RiskLevel = 'low' | 'medium' | 'high';

export type EffectType = 
  | 'damage'       // 造成伤害 (基于攻击力)
  | 'heal'         // 治疗生命 (基于最大生命)
  | 'defense'      // 防御姿态 (获得减伤buff)
  | 'buff_atk'     // 提升攻击 (下回合生效)
  | 'buff_def'     // 提升防御 (修正漏掉的类型)
  | 'self_damage'; // 自我伤害

export interface SkillEffect {
  type: EffectType;
  value: number;   // 倍率。例如 damage 1.5 = 150% 攻击力; heal 0.2 = 20% 最大生命
  target: 'enemy' | 'self'; 
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  effects: SkillEffect[]; // 新的核心逻辑：效果词条数组
  risk?: RiskLevel;        // 保留作为 AI 决策参考
  cooldown?: number;
  battleLine?: string;     // 技能释放时的固定台词
}

export interface CharacterStats {
  level: number;
  attack: number;    
  defense: number;   
  critRate: number;  
  critDamage: number; 
  speed: number;      // 基础速度
  dodgeRate?: number; // Added for Wasteland bond
}

export type Faction = 
  | 'dawn_legacy'       // 晓光机关·遗产
  | 'crimson_heavy'     // 绯红重工
  | 'wasteland_drifters'// 荒原流浪者
  | 'deep_dive'         // 深潜结社
  | 'ai_awakened'       // 智械觉醒
  | 'other';            // 其他/联动角色

export interface Character {
  id: string;
  name: string;
  avatarUrl?: string; 
  maxHp: number;
  currentHp: number;
  stats: CharacterStats; 
  skills: Skill[];
  personality: string; 
  speakingStyle: string; 
  trust?: number; 
  ttsModelId?: string;
  faction?: Faction;
  
  // Battle Lines for Enemy (Simple automated speech)
  battleLines?: {
    start?: string[];
    skill?: string[];
    hit?: string[];
    defeat?: string[];
  };

  // Runtime State for Speed System
  currentActionValue?: number; // 当前行动值 (AV)
}

export type BattlePhase = 
  | 'start' 
  | 'player_input' 
  | 'ai_processing' 
  | 'player_action' 
  | 'enemy_action' 
  | 'victory' 
  | 'defeat';

export interface BattleLog {
  id?: string; 
  turn: number;
  message: string;
  speaker: 'system' | 'player' | 'enemy';
  isStreaming?: boolean;
  isCrit?: boolean; 
}

export interface ActiveBond {
  id: string;
  name: string;
  description: string;
  active: boolean;
  characters: string[]; // Character IDs involved
}

export interface BattleState {
  turn: number;
  phase: BattlePhase;
  player: Character; // Note: In speed system, 'player' usually refers to the 'active character' if it's a player unit
  party: Character[]; 
  enemy: Character;
  logs: BattleLog[];
  lastPlayerInput?: string;
  lastAiInterpretation?: string;
  isProcessing: boolean;
  activeBonds: ActiveBond[];
  
  // Speed System State
  actionQueue: Character[]; // Calculated queue of who acts next (for UI display)
}

export interface AIActionResponse {
  interpretation: string; 
  chosen_skill_id: string; 
  character_response: string; 
  confidence: 'high' | 'medium' | 'low';
}
