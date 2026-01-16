import OpenAI from 'openai';
import type { Character, Skill, AIActionResponse, BattleLog } from '../types/game';

// System Prompt Template
const generateSystemPrompt = (character: Character, battleContext: string, userPersona?: Character) => `
你现在正在扮演二次元游戏角色"${character.name}"进行一场回合制战斗。
你的性格设定：${character.personality}
你的说话风格：${character.speakingStyle}

${userPersona ? `当前与你并肩作战的 玩家是：
- 姓名：${userPersona.name}
- 性格：${userPersona.personality}
请在对话中适时提及指挥官，根据他的性格进行互动（例如称呼他为${userPersona.name}）。` : ''}

当前战斗状态：
${battleContext}

可用技能列表：
${character.skills.map(s => `- ID: ${s.id} | 名称: ${s.name} | 描述: ${s.description}`).join('\n')}

你的任务：
1. 像人类一样自然地回复玩家，表达你的战术想法或情感。
2. 决定使用哪个技能。
3. 参考之前的对话历史，保持连贯性。
4. **重要：战斗紧张激烈，请务必将回复控制在 80 字以内！**

输出格式要求：
请直接输出对话内容，不要使用 JSON。
在回复的最后，必须换行并加上技能指令，格式严格如下：
[SKILL:技能ID]

示例：
指挥官，看我的吧！这招一定能行！
[SKILL:skill_strong]
`;

export const analyzeCommandStream = async (
  apiKey: string,
  playerInput: string,
  history: BattleLog[], // New: Receive history
  character: Character,
  enemy: Character,
  turn: number,
  onStream: (text: string) => void,
  userPersona?: Character
): Promise<AIActionResponse> => {
  
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": window.location.href,
      "X-Title": "Anime Battle Demo",
    },
  });

  const battleContext = `
  - 回合数: ${turn}
  - 你的HP: ${character.currentHp}/${character.maxHp}
  - 敌人(${enemy.name})HP: ${enemy.currentHp}/${enemy.maxHp}
  `;

  // Convert BattleLog[] to OpenAI Message[]
  const conversationHistory = history
    .filter(log => log.speaker === 'player' || (log.speaker === 'system' && !log.message.includes('使用了'))) // Filter out battle system notifications, keep dialogue
    .map(log => ({
      role: log.speaker === 'player' ? 'user' : 'assistant',
      content: log.message
    } as const));

  // Limit history to last 10 messages to save context window
  const recentHistory = conversationHistory.slice(-10);

  try {
    const stream = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: generateSystemPrompt(character, battleContext, userPersona) 
        },
        ...recentHistory, // Insert History
        { 
          role: "user", 
          content: `玩家指令: "${playerInput}"` 
        }
      ],
      model: import.meta.env.VITE_AI_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free", 
      temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || "0.7"),
      stream: true, 
    });

    let fullContent = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullContent += content;
      
      // Clean up the skill tag from display
      const displayContent = fullContent.replace(/\[SKILL:.*?\]/g, '').trim();
      onStream(displayContent);
    }

    // Parse the final result
    const skillMatch = fullContent.match(/\[SKILL:(.*?)\]/);
    const chosenSkillId = skillMatch ? skillMatch[1].trim() : character.skills[0].id; 
    const finalResponse = fullContent.replace(/\[SKILL:.*?\]/g, '').trim();

    return {
      interpretation: "streaming",
      chosen_skill_id: chosenSkillId,
      character_response: finalResponse,
      confidence: 'high'
    };

  } catch (error) {
    console.error("AI Stream Error:", error);
    return {
      interpretation: "error",
      chosen_skill_id: character.skills[0].id,
      character_response: "（通讯信号受到强烈干扰...）",
      confidence: "low"
    };
  }
};

// ----------------------------------------------------------------
// NEW: User Character Generation
// ----------------------------------------------------------------
export const generateUserCharacter = async (
  apiKey: string,
  userDescription: string
): Promise<Character> => {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "HTTP-Referer": window.location.href,
      "X-Title": "Anime Battle Demo",
    },
  });

  const prompt = `
  You are a Game Designer. Based on the user's description, create a playable anime character JSON.
  
  User Description: "${userDescription}"

  Requirements:
  1. Create a character profile (name, personality, speaking style). **IMPORTANT: All text (name, personality, descriptions) MUST be in CHINESE (Simplified Chinese).**
  2. Assign balanced stats (Level 1 base):
     - HP: 800 - 1500
     - Attack: 200 - 400
     - Defense: 100 - 300
     - CritRate: 0.05 - 0.40
     - CritDamage: 0.50 - 1.50
  3. Create 3-4 unique skills using ONLY these effect types: 
     - 'damage' (value: 1.0-4.0 multiplier)
     - 'heal' (value: 0.1-0.5 maxHP %)
     - 'defense' (value: 0.1-0.8 reduction)
     - 'buff_atk' (value: 0.1-0.5 multiplier)
  
  Output Schema (JSON ONLY):
  {
    "name": "String (Chinese)",
    "personality": "String (short, Chinese)",
    "speakingStyle": "String (short, Chinese)",
    "stats": { "level": 1, "attack": Int, "defense": Int, "critRate": Float, "critDamage": Float },
    "skills": [
      {
        "id": "skill_1",
        "name": "String (Chinese)",
        "description": "String (Chinese)",
        "risk": "low" | "medium" | "high",
        "effects": [
          { "type": "damage" | "heal" | "defense", "value": Float, "target": "enemy" | "self" }
        ]
      }
    ]
  }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_AI_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free", 
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");

    const data = JSON.parse(content);
    
    // Hydrate with client-side required fields
    return {
      id: `user_${Date.now()}`,
      maxHp: data.stats.hp || 1000, // Fallback if AI hallucinates key
      currentHp: data.stats.hp || 1000,
      avatarUrl: undefined,
      trust: 50,
      ttsModelId: import.meta.env.VITE_TTS_KIANA, // Default voice
      ...data
    };

  } catch (error) {
    console.error("Character Gen Error:", error);
    throw error;
  }
};
