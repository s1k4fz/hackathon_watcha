export type RiskLevel = 'low' | 'medium' | 'high';

export type EffectType = 
  | 'damage'       // 造成伤害 (基于攻击力)
  | 'heal'         // 治疗生命 (基于最大生命)
  | 'defense'      // 防御姿态 (获得减伤buff)
  | 'buff_atk';    // 提升攻击 (下回合生效)

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
  risk: RiskLevel;        // 保留作为 AI 决策参考
  cooldown?: number;
}

export interface CharacterStats {
  level: number;
  attack: number;    
  defense: number;   
  critRate: number;  
  critDamage: number; 
  speed?: number;     
}

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

export interface BattleState {
  turn: number;
  phase: BattlePhase;
  player: Character; 
  party: Character[]; 
  enemy: Character;
  logs: BattleLog[];
  lastPlayerInput?: string;
  lastAiInterpretation?: string;
  isProcessing: boolean;
}

export interface AIActionResponse {
  interpretation: string; 
  chosen_skill_id: string; 
  character_response: string; 
  confidence: 'high' | 'medium' | 'low';
}
