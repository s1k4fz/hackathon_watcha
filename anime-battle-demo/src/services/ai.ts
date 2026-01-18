import OpenAI from 'openai';
import type { Character, AIActionResponse, BattleLog } from '../types/game';
import { getEmotionPromptGuide, getEmotionSuggestions } from './emotionTags';

// System Prompt Template
const generateSystemPrompt = (character: Character, battleContext: string, userPersona?: Character) => {
  const emotionSuggestions = getEmotionSuggestions(character.personality);
  
  return `
你现在正在扮演二次元游戏角色"${character.name}"进行一场回合制战斗。
你的性格设定：${character.personality}
你的说话风格：${character.speakingStyle}
推荐使用的情绪标签：${emotionSuggestions}

${userPersona ? `当前与你并肩作战的玩家是：
- 姓名：${userPersona.name}
- 性格：${userPersona.personality}
请在对话中适时提及指挥官，根据他的性格进行互动（例如称呼他为${userPersona.name}）。` : ''}

当前战斗状态：
${battleContext}

可用技能列表：
${character.skills.map(s => `- ID: ${s.id} | 名称: ${s.name} | 描述: ${s.description}`).join('\n')}

${getEmotionPromptGuide()}

你的任务：
1. 像人类一样自然地回复玩家，表达你的战术想法或情感。
2. **每句话开头必须添加情绪标签**，如 (excited)、(confident)、(worried) 等。
3. 决定使用哪个技能。
4. 参考之前的对话历史，保持连贯性。
5. **重要：战斗紧张激烈，请务必将回复控制在 80 字以内！**

输出格式要求：
请直接输出对话内容（含情绪标签），不要使用 JSON。
在回复的最后，必须换行并加上技能指令，格式严格如下：
[SKILL:技能ID]

示例（注意情绪标签的使用）：
(excited) 指挥官，看我的吧！(confident) 这招一定能行！
[SKILL:skill_strong]

(worried) 敌人好强……(determined) 但我不会放弃！
[SKILL:skill_defense]
`;
};

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
你是一名游戏角色设计师。根据玩家在对话中透露的信息，为他们创建一个独特的战斗角色。

【玩家对话记录】
${userDescription}

【分析任务】
1. 从对话中提取玩家的：
   - 名字或称呼（如果没有明确说，根据对话风格起一个合适的名字）
   - 性格特点（勇敢/谨慎/热血/冷静/狂野/温和等）
   - 战斗风格偏好（进攻型/防守型/平衡型/辅助型）

2. 根据分析结果设计角色：
   - 进攻型：高攻击、高暴击，技能偏向伤害
   - 防守型：高防御、高HP，技能偏向防守和回复
   - 平衡型：属性均衡，技能多样
   - 辅助型：高速度，技能带buff效果

【属性范围】（Level 1 基础值）
- HP: 800 - 1500
- Attack: 200 - 400
- Defense: 100 - 300
- Speed: 90 - 160（越高越快）
- CritRate: 0.05 - 0.40
- CritDamage: 0.50 - 1.50

【技能效果类型】（只能使用这些）
- 'damage': 造成伤害（value: 1.0-4.0 倍率）
- 'heal': 回复生命（value: 0.1-0.5 最大HP百分比）
- 'defense': 防御姿态（value: 0.1-0.8 减伤）
- 'buff_atk': 攻击增强（value: 0.1-0.5 倍率）
- 'self_damage': 自伤（value: 0.05-0.2 最大HP百分比）

【输出格式】（纯JSON，所有文本必须是中文）
{
  "name": "角色名（中文）",
  "personality": "性格描述（简短，中文）",
  "speakingStyle": "说话风格（简短，中文）",
  "stats": { 
    "level": 1, 
    "hp": 1000,
    "attack": 300, 
    "defense": 150, 
    "speed": 110, 
    "critRate": 0.15, 
    "critDamage": 0.8 
  },
  "skills": [
    {
      "id": "user_skill_1",
      "name": "技能名（中文）",
      "description": "技能描述（中文）",
      "risk": "low" | "medium" | "high",
      "effects": [
        { "type": "damage", "value": 1.5, "target": "enemy" }
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
    
    // Extract HP from stats (AI outputs it there)
    const hp = data.stats?.hp || data.hp || 1000;
    
    // Hydrate with client-side required fields
    return {
      id: `user_${Date.now()}`,
      maxHp: hp,
      currentHp: hp,
      avatarUrl: undefined,
      trust: 50,
      ttsModelId: import.meta.env.VITE_TTS_KIANA, // Default voice for user character
      faction: 'other' as const,
      ...data,
      stats: {
        level: data.stats?.level || 1,
        attack: data.stats?.attack || 300,
        defense: data.stats?.defense || 150,
        speed: data.stats?.speed || 110,
        critRate: data.stats?.critRate || 0.15,
        critDamage: data.stats?.critDamage || 0.8,
        dodgeRate: 0
      }
    };

  } catch (error) {
    console.error("Character Gen Error:", error);
    throw error;
  }
};
