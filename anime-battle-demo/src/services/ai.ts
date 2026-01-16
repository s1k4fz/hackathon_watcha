import OpenAI from 'openai';
import type { Character, Skill, AIActionResponse, BattleLog } from '../types/game';

// System Prompt Template
const generateSystemPrompt = (character: Character, battleContext: string) => `
你现在正在扮演二次元游戏角色"${character.name}"进行一场回合制战斗。
你的性格设定：${character.personality}
你的说话风格：${character.speakingStyle}

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
  onStream: (text: string) => void
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
          content: generateSystemPrompt(character, battleContext) 
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
