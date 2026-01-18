import { useState, useRef } from 'react';
import type { Character } from '../types/game';
import { queueCharacterSpeech, resetTTSQueue } from '../services/tts';
import { getEmotionPromptGuide, getEmotionSuggestions, stripEmotionTags } from '../services/emotionTags';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useNarrative = (apiKey: string, character: Character) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStreamingContent, setCurrentStreamingContent] = useState('');

  const speechBuffer = useRef<string>("");
  const speechSequence = useRef<number>(0);

  const processSpeechChunk = (textChunk: string) => {
    const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
    const fishRefId = character.ttsModelId;
    if (!fishApiKey || !fishRefId) return;

    speechBuffer.current += textChunk;
    const delimiters = /[，。！？,.!?；;…]/;
    const minSpeakChars = Number(import.meta.env.VITE_TTS_MIN_CHARS || 6);

    while (delimiters.test(speechBuffer.current)) {
      let splitIndex = -1;
      const chars = speechBuffer.current.split('');
      for (let i = 0; i < chars.length; i++) {
        if (delimiters.test(chars[i])) { splitIndex = i; break; }
      }

      if (splitIndex !== -1) {
        const sentenceToSpeak = speechBuffer.current.substring(0, splitIndex + 1);
        const remaining = speechBuffer.current.substring(splitIndex + 1);
        const cleaned = sentenceToSpeak.replace(/[，。！？,.!?；;…\s]/g, '');

        if (cleaned.length === 0) {
          speechBuffer.current = remaining;
          continue;
        }

        if (cleaned.length < minSpeakChars) {
          if (remaining.trim().length > 0) {
            const merged = sentenceToSpeak.replace(/[，。！？,.!?；;…]+$/g, '') + remaining;
            speechBuffer.current = merged;
            continue;
          } else {
            speechBuffer.current = sentenceToSpeak;
            break;
          }
        }

        // Strip emotion tags before sending to TTS (so it doesn't read "(happy)" etc.)
        const cleanedForTTS = stripEmotionTags(sentenceToSpeak);
        if (cleanedForTTS.trim()) {
          queueCharacterSpeech(cleanedForTTS, fishApiKey, fishRefId, speechSequence.current);
        }
        speechSequence.current++;
        speechBuffer.current = remaining;
      } else { break; }
    }
  };

  const sendUserMessage = async (userInput: string, systemPrompt?: string) => {
    if (!userInput.trim() || isProcessing) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsProcessing(true);
    setCurrentStreamingContent('');

    resetTTSQueue();
    speechSequence.current = 0;
    speechBuffer.current = "";

    let lastProcessedLength = 0;

    try {
      const model = import.meta.env.VITE_AI_MODEL || 'google/gemini-2.0-flash-exp:free';
      const temperature = parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.9');

      const emotionSuggestions = getEmotionSuggestions(character.personality || '');
      
      const basePrompt = systemPrompt || `
你扮演角色"${character.name}"。
性格：${character.personality}
说话风格：${character.speakingStyle}
`;
      
      const systemMessage = `${basePrompt}

推荐使用的情绪标签：${emotionSuggestions}

${getEmotionPromptGuide()}

请用简短、口语化的方式回应。每次回复不超过3句话。
**重要：每句话开头必须添加情绪标签**，如 (calm)、(curious)、(sad) 等。

示例：
(calm) 你终于醒了。(curious) 你还记得自己是谁吗？
(sad)(soft tone) 看来你什么都不记得了……
`;

      const apiMessages = [
        { role: 'system' as const, content: systemMessage },
        ...newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          stream: true
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Narrative AI request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const json = JSON.parse(line.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setCurrentStreamingContent(fullContent);

                const newContent = fullContent.slice(lastProcessedLength);
                if (newContent) {
                  processSpeechChunk(newContent);
                  lastProcessedLength = fullContent.length;
                }
              }
            } catch (e) { /* skip parse errors */ }
          }
        }
      }

      // Flush remaining speech buffer (strip emotion tags)
      const fishApiKey = import.meta.env.VITE_FISH_AUDIO_API_KEY;
      const fishRefId = character.ttsModelId;
      if (speechBuffer.current.trim() && fishApiKey && fishRefId) {
        const cleanedForTTS = stripEmotionTags(speechBuffer.current);
        if (cleanedForTTS.trim()) {
          queueCharacterSpeech(cleanedForTTS, fishApiKey, fishRefId, speechSequence.current);
        }
      }
      speechBuffer.current = "";

      setMessages([...newMessages, { role: 'assistant', content: fullContent }]);
      setCurrentStreamingContent('');

    } catch (error) {
      console.error('Narrative AI Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: '……（通讯中断）' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    messages,
    isProcessing,
    currentStreamingContent,
    sendUserMessage,
    setMessages
  };
};
