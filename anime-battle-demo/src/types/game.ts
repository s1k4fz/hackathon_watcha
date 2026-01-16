export type SkillType = 'attack' | 'defense' | 'heal';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  value: number; // Damage or Heal amount
  risk: RiskLevel;
  description: string;
  cooldown?: number;
}

export interface Character {
  id: string;
  name: string;
  avatarUrl?: string; // We can use placeholder images for now
  maxHp: number;
  currentHp: number;
  skills: Skill[];
  personality: string; // Description for the LLM
  speakingStyle: string; // Description for the LLM
  trust?: number; // 0-100, optional
  ttsModelId?: string; // Fish Audio Reference ID
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
  id?: string; // Unique ID for updating logs
  turn: number;
  message: string;
  speaker: 'system' | 'player' | 'enemy';
  isStreaming?: boolean; // New flag for typing effect
}

export interface BattleState {
  turn: number;
  phase: BattlePhase;
  player: Character;
  enemy: Character;
  logs: BattleLog[];
  lastPlayerInput?: string;
  lastAiInterpretation?: string;
  isProcessing: boolean;
}

// AI Response Structure
export interface AIActionResponse {
  interpretation: string; // Understanding of player intent
  chosen_skill_id: string; // Must match one of the character's skill IDs
  character_response: string; // What the character says
  confidence: 'high' | 'medium' | 'low';
}
