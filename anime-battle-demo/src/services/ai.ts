import OpenAI from 'openai';
import type { Character, Skill, AIActionResponse } from '../types/game';

// System Prompt Template
const generateSystemPrompt = (character: Character, battleContext: string) => `
你现在正在扮演二次元游戏角色"${character.name}"进行一场回合制战斗。
你的性格设定：${character.personality}
你的说话风格：${character.speakingStyle}

当前战斗状态：
${battleContext}

可用技能列表（请严格从这里选择）：
${character.skills.map(s => `- ID: ${s.id} | 名称: ${s.name} | 类型: ${s.type} | 描述: ${s.description}`).join('\n')}

你的任务：
1. 分析玩家输入的自然语言指令（可能是模糊的战术意图）。
2. 根据你的性格和当前战况，决定使用哪个技能。
3. 生成一句符合你性格的台词作为回应。

输出格式要求：
请仅返回一个标准的 JSON 对象，不要包含 markdown 格式或其他废话。格式如下：
{
  "interpretation": "你对玩家指令的战术理解",
  "chosen_skill_id": "选择的技能ID (必须完全匹配)",
  "character_response": "你的台词 (务必符合人设)",
  "confidence": "high" | "medium" | "low"
}
`;

export const analyzeCommand = async (
  apiKey: string,
  playerInput: string,
  character: Character,
  enemy: Character,
  turn: number
): Promise<AIActionResponse> => {
  
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Allowed for Hackathon Demos
    defaultHeaders: {
      "HTTP-Referer": window.location.href, // Site URL
      "X-Title": "Anime Battle Demo", // Site Title
    },
  });

  const battleContext = `
  - 回合数: ${turn}
  - 你的HP: ${character.currentHp}/${character.maxHp}
  - 敌人(${enemy.name})HP: ${enemy.currentHp}/${enemy.maxHp}
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: generateSystemPrompt(character, battleContext) 
        },
        { 
          role: "user", 
          content: `玩家指令: "${playerInput}"` 
        }
      ],
      // Using model from env or default to a free fast model
      model: import.meta.env.VITE_AI_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free", 
      response_format: { type: "json_object" },
      temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || "0.7"),
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content returned");

    const result = JSON.parse(content) as AIActionResponse;
    
    // Validate skill exists
    const skillExists = character.skills.some(s => s.id === result.chosen_skill_id);
    if (!skillExists) {
      console.warn("AI chose invalid skill, defaulting to first skill");
      result.chosen_skill_id = character.skills[0].id;
    }

    return result;

  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback response so the game doesn't crash
    return {
      interpretation: "通讯受到干扰...",
      chosen_skill_id: character.skills[0].id,
      character_response: "指挥官？OpenRouter 信号好像断了... 我先自由行动了！",
      confidence: "low"
    };
  }
};
