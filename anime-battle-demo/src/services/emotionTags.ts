/**
 * Fish Audio 情绪标签辅助模块
 * 参考文档: https://docs.fish.audio/developer-guide/core-features/emotions
 * 
 * 支持 64+ 种情绪表达，通过在文本开头添加情绪标签来控制语音情感
 */

// 基础情绪标签（24种）
export const BASIC_EMOTIONS = [
  'happy', 'sad', 'angry', 'excited', 'calm', 'nervous', 'confident', 
  'surprised', 'satisfied', 'delighted', 'scared', 'worried', 'upset',
  'frustrated', 'depressed', 'empathetic', 'embarrassed', 'disgusted',
  'moved', 'proud', 'relaxed', 'grateful', 'curious', 'sarcastic'
] as const;

// 高级情绪标签（25种）
export const ADVANCED_EMOTIONS = [
  'disdainful', 'unhappy', 'anxious', 'hysterical', 'indifferent',
  'uncertain', 'doubtful', 'confused', 'disappointed', 'regretful',
  'guilty', 'ashamed', 'jealous', 'envious', 'hopeful', 'optimistic',
  'pessimistic', 'nostalgic', 'lonely', 'bored', 'contemptuous',
  'sympathetic', 'compassionate', 'determined', 'resigned'
] as const;

// 语气标签（5种）
export const TONE_MARKERS = [
  'in a hurry tone', 'shouting', 'screaming', 'whispering', 'soft tone'
] as const;

// 音效标签（10种）
export const AUDIO_EFFECTS = [
  'laughing', 'chuckling', 'sobbing', 'crying loudly', 'sighing',
  'groaning', 'panting', 'gasping', 'yawning', 'snoring'
] as const;

// 特殊效果
export const SPECIAL_EFFECTS = [
  'audience laughing', 'background laughter', 'crowd laughing',
  'break', 'long-break'
] as const;

// 所有支持的标签
export const ALL_EMOTION_TAGS = [
  ...BASIC_EMOTIONS,
  ...ADVANCED_EMOTIONS,
  ...TONE_MARKERS,
  ...AUDIO_EFFECTS,
  ...SPECIAL_EFFECTS
] as const;

export type EmotionTag = typeof ALL_EMOTION_TAGS[number];

/**
 * 根据角色性格和战斗情境推荐情绪
 */
export const getEmotionSuggestions = (personality: string): string => {
  // 基于角色性格的情绪建议
  const suggestions: Record<string, string[]> = {
    '热血': ['excited', 'confident', 'determined', 'happy'],
    '冷淡': ['calm', 'indifferent', 'soft tone'],
    '傲娇': ['frustrated', 'embarrassed', 'sarcastic', 'soft tone'],
    '温柔': ['calm', 'empathetic', 'soft tone', 'happy'],
    '疯狂': ['excited', 'hysterical', 'laughing', 'sarcastic'],
    '理性': ['calm', 'confident', 'determined'],
    '可爱': ['happy', 'excited', 'curious', 'whispering'],
    '冷静': ['calm', 'confident', 'determined'],
    '活泼': ['excited', 'happy', 'laughing', 'curious']
  };

  // 匹配性格关键词
  for (const [key, emotions] of Object.entries(suggestions)) {
    if (personality.includes(key)) {
      return emotions.join(', ');
    }
  }

  return 'calm, confident, happy, sad, excited';
};

/**
 * 生成用于 AI 提示词的情绪使用说明
 */
export const getEmotionPromptGuide = (): string => `
【语音情绪控制说明】
为了让角色语音更生动，请在每句话开头添加情绪标签。格式：(emotion)

常用情绪标签：
- 正面情绪: (happy), (excited), (confident), (proud), (grateful)
- 负面情绪: (sad), (angry), (frustrated), (worried), (scared)
- 中性情绪: (calm), (curious), (determined), (surprised)
- 特殊语气: (whispering), (shouting), (soft tone)
- 音效: (laughing), (sighing), (chuckling)

规则：
1. 情绪标签必须放在句子最开头
2. 可以组合使用，如: (angry)(shouting) 站住！
3. 根据对话内容选择合适的情绪
4. 战斗中紧张时刻可用 (determined), (excited)
5. 受伤或劣势时可用 (worried), (nervous)
6. 胜利或得意时可用 (proud), (confident)
7. 吐槽或调侃时可用 (sarcastic), (chuckling)

示例：
(excited) 太好了，就是现在！
(worried) 这次的敌人有点棘手……
(confident)(chuckling) 哼，小意思！
(sad)(soft tone) 抱歉，我没能保护好你……
(angry)(shouting) 绝不原谅你！
`;

/**
 * 验证文本是否包含有效的情绪标签
 */
export const hasEmotionTag = (text: string): boolean => {
  const tagPattern = /^\s*\([a-zA-Z\s]+\)/;
  return tagPattern.test(text);
};

/**
 * 从文本中提取情绪标签
 */
export const extractEmotionTags = (text: string): string[] => {
  const matches = text.match(/\(([a-zA-Z\s]+)\)/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/[()]/g, '').trim());
};

/**
 * 清理文本中的情绪标签（如果需要显示纯文本）
 */
export const stripEmotionTags = (text: string): string => {
  return text.replace(/\([a-zA-Z\s]+\)\s*/g, '').trim();
};
