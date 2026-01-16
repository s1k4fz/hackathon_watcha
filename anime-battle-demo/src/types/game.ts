export type SkillType = 'attack' | 'defense' | 'heal';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  value: number; 
  risk: RiskLevel;
  description: string;
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
  player: Character; // Currently active player character
  party: Character[]; // New: Full party state to persist HP
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
