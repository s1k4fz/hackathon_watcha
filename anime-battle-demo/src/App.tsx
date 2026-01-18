import { useState } from 'react';
import { BattleScene } from './components/BattleScene';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CharacterSelection } from './components/CharacterSelection';
import { NarrativeScene, type NarrativeScript } from './components/NarrativeScene';
import { StartScreen } from './components/StartScreen';
import type { Character } from './types/game';
import { availableCharacters, enemies } from './data/characters';

// Define Game Stages
type GameStage = 
  | 'INIT' 
  | 'START'
  | 'INTRO_CG' 
  | 'MEETING_DIALOGUE' 
  | 'SELECTION_TUTORIAL' 
  | 'BATTLE_TUTORIAL' 
  | 'INTERLUDE_DIALOGUE' 
  | 'SELECTION_BOSS' 
  | 'BATTLE_BOSS' 
  | 'OUTRO_DIALOGUE'
  | 'OUTRO_CG';

function App() {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENROUTER_API_KEY || '');
  const [stage, setStage] = useState<GameStage>('INIT');
  const [selectedParty, setSelectedParty] = useState<Character[]>([]);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  
  // 主角绫雀
  const protagonist = availableCharacters.find(c => c.id === 'linque') || availableCharacters[0];

  const nextStage = (next: GameStage) => setStage(next);

  const handleCharacterCreated = (newChar: Character) => {
    console.log("Character Created:", newChar);
    setCustomCharacters(prev => [...prev, newChar]);
  };

  // === SCRIPTS ===

  const introScript: NarrativeScript = {
    id: 'intro',
    type: 'CG_TEXT',
    lines: [
      "2087年，静默灾厄后的第三年。",
      "你是一名拾荒者，在废墟深处发现了一个沉睡的身影——",
      "……",
      "……能听到吗？",
      "喂，醒醒。"
    ],
    onComplete: () => nextStage('MEETING_DIALOGUE')
  };

  const meetingScript: NarrativeScript = {
    id: 'meeting',
    type: 'DIALOGUE',
    character: protagonist,
    initialMessage: "终于醒了？还以为你要这样睡过去了。你的意识波动很微弱，但……居然还活着。运气不错。",
    systemPrompt: `你现在扮演"${protagonist.name}"。
场景：废墟中，你刚刚唤醒了玩家（一名失忆的拾荒者/指挥官）。
性格：${protagonist.personality}。
说话风格：${protagonist.speakingStyle}。

【核心任务 - 收集玩家信息】
你需要通过自然对话引导玩家透露以下信息：
1. 他们的名字或称呼
2. 他们的性格特点（勇敢？谨慎？热血？冷静？）
3. 他们擅长的战斗风格（进攻型？防守型？平衡型？支援型？）

【对话引导技巧】
- 第1-2轮：询问玩家是谁、记不记得自己的名字
- 第3-4轮：观察玩家的回答，评论他们的性格（"你倒是挺冷静的"或"看来是个急性子"）
- 第5轮+：如果收集到足够信息（名字+性格特点+战斗倾向），在回复末尾添加标记 [READY_FOR_BATTLE]

【信息收集判断标准】
当玩家透露了以下任意组合时，视为"信息足够"：
- 名字/称呼 + 任意性格描述
- 2条以上关于自己特点的描述
- 明确表达了战斗意愿

【重要规则】
- 保持冷淡但不敌意的态度
- 每次回复不超过3句话
- 只有在信息收集充分后才添加 [READY_FOR_BATTLE] 标记
- [READY_FOR_BATTLE] 标记要放在回复的最末尾，并且只添加一次
- 添加标记时，同时说一句类似"好，既然如此，让我看看你的本事"的过渡语

示例（当信息足够时）：
(confident) 叫你小狼是吧，看起来是个冲动的家伙。(curious) 既然你说自己擅长进攻，那就让我看看你的本事吧。[READY_FOR_BATTLE]`,
    enableCharacterGeneration: true,
    onCharacterGenerated: (newChar) => {
      handleCharacterCreated(newChar);
    },
    onComplete: () => nextStage('SELECTION_TUTORIAL')
  };

  const interludeScript: NarrativeScript = {
    id: 'interlude',
    type: 'DIALOGUE',
    character: protagonist,
    initialMessage: "……成功了。看来你真的是协调者。这种模糊的指令我居然能理解……有意思。",
    systemPrompt: `你现在扮演"${protagonist.name}"。
场景：刚刚经历了一场战斗，玩家证明了自己能指挥你。你们正在废墟中暂歇。
性格：${protagonist.personality}。

【核心任务】
引导剧情进入下一场战斗。

【对话流程】
1. 前1-2轮：认可玩家的能力，稍微缓和态度。
2. 第3轮左右：突然感应到强敌信号（'暗影骑士'级别的战斗单位），表示警惕。
3. 当玩家表示"一起战斗"或"准备好了"时，在回复末尾添加标记 [READY_FOR_BATTLE]

【重要规则】
- 每次回复不超过3句话。
- [READY_FOR_BATTLE] 标记要放在回复的最末尾。
- 只有当玩家明确表达战斗意愿后才添加标记。
- 在添加标记的那句回复中，要表现出"好，那就来看看你的本事"或"别拖后腿"的态度。

示例：
(smirk) 哼，第一天就想当英雄？行吧，别死太快。[READY_FOR_BATTLE]`,
    enableCharacterGeneration: false, // 第二阶段不再生成角色
    hideContinueButton: true, // 隐藏继续按钮
    onComplete: () => nextStage('SELECTION_BOSS')
  };

  const outroDialogueScript: NarrativeScript = {
    id: 'outro_dialogue',
    type: 'DIALOGUE',
    character: protagonist,
    initialMessage: "这附近应该暂时安全了……我们需要离开这片废墟，找到补给和情报。",
    systemPrompt: `你现在扮演"${protagonist.name}"。
场景：刚刚击败了强大的深渊君主。你和玩家正在修整。
性格：${protagonist.personality}。
心情：松了一口气，对玩家产生了一些信任和好奇。

【核心任务】
与玩家进行简短的战后对话（最多3-4轮），然后结束章节。

【对话流程 - 严格按照轮次执行】
第1轮：确认环境安全，提到感应到了其他残响体的信号。
第2轮：建议去寻找她们，也许能找回玩家的记忆。
第3轮：如果玩家问为什么帮忙，回答那句关键台词："也许只是因为，你是第一个把我当'绫雀'而不是'LQ-07'的人。"然后添加 [THE_END]
第4轮（如果还没结束）：无论玩家说什么，直接说"走吧，路还很长。"然后强制添加 [THE_END]

【重要规则 - 必须遵守】
- 每次回复不超过2句话
- 第3轮或第4轮必须添加 [THE_END] 标记结束对话
- [THE_END] 放在回复最末尾
- 不要让对话拖延超过4轮

示例结束语：
(soft) 走吧，路还很长。也许……能找到更多答案。[THE_END]`,
    enableCharacterGeneration: false,
    hideContinueButton: true,
    onComplete: () => nextStage('OUTRO_CG')
  };

  const outroCgScript: NarrativeScript = {
    id: 'outro_cg',
    type: 'CG_TEXT',
    lines: [
      "—— Chapter 1: Awakening ——",
      "—— 第一章：醒来 ——",
      "感谢体验「残响：叙语连接」Demo",
      "完整版敬请期待"
    ],
    onComplete: () => {
      // Loop back to start or show credits
      window.location.reload();
    }
  };

  // === API KEY CHECK ===
  if (!apiKey) {
  return (
      <div className="w-full h-screen bg-gray-100 text-gray-900 flex items-center justify-center">
        <ApiKeyModal onSubmit={(key) => {
          setApiKey(key);
          nextStage('START');
        }} />
      </div>
    );
  }

  // If we're in INIT after API key is set, move to start screen
  if (stage === 'INIT') {
    nextStage('START');
    return null;
  }

  // === STAGE RENDERER ===
  switch (stage) {
    case 'START':
      return (
        <StartScreen 
          onStart={() => nextStage('INTRO_CG')}
          videoSrc="/videos/opening.mp4"
        />
      );

    case 'INTRO_CG':
      return <NarrativeScene apiKey={apiKey} script={introScript} />;

    case 'MEETING_DIALOGUE':
      return <NarrativeScene apiKey={apiKey} script={meetingScript} />;

    case 'SELECTION_TUTORIAL':
      return (
        <CharacterSelection 
          apiKey={apiKey} 
          onStart={(party) => {
            setSelectedParty(party);
            nextStage('BATTLE_TUTORIAL');
          }} 
          customCharacters={customCharacters}
          onCharacterCreated={handleCharacterCreated}
          enemy={enemies.shadowKnight}
        />
      );

    case 'BATTLE_TUTORIAL':
      return (
        <BattleScene 
          apiKey={apiKey} 
          initialParty={selectedParty} 
          initialEnemy={enemies.shadowKnight}
          onBattleEnd={(result) => {
            if (result === 'victory') {
              nextStage('INTERLUDE_DIALOGUE');
            } else {
              // Retry on defeat
              window.location.reload();
            }
          }}
        />
      );

    case 'INTERLUDE_DIALOGUE':
      return <NarrativeScene apiKey={apiKey} script={interludeScript} />;

    case 'SELECTION_BOSS':
      // Heal party before boss
      return (
        <CharacterSelection 
          apiKey={apiKey} 
          onStart={(party) => {
            // Full heal for boss fight
            const healedParty = party.map(c => ({ ...c, currentHp: c.maxHp }));
            setSelectedParty(healedParty);
            nextStage('BATTLE_BOSS');
          }} 
          customCharacters={customCharacters}
          onCharacterCreated={handleCharacterCreated}
          enemy={enemies.abyssalMonarch}
        />
      );

    case 'BATTLE_BOSS':
      return (
        <BattleScene 
          apiKey={apiKey} 
          initialParty={selectedParty}
          initialEnemy={enemies.abyssalMonarch}
          onBattleEnd={(result) => {
            if (result === 'victory') {
              nextStage('OUTRO_DIALOGUE');
            } else {
              window.location.reload();
            }
          }}
        />
      );

    case 'OUTRO_DIALOGUE':
      return <NarrativeScene apiKey={apiKey} script={outroDialogueScript} />;

    case 'OUTRO_CG':
      return <NarrativeScene apiKey={apiKey} script={outroCgScript} />;

    default:
      return <div>Loading...</div>;
  }
}

export default App;
