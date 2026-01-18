/**
 * 角色立绘资源加载器
 * 
 * 支持三种立绘类型：
 * 1. portraits (全身立绘) - 用于战斗场景右侧大立绘、对话场景
 * 2. avatars (小头像) - 用于战斗行动轴
 * 3. cards (卡片立绘) - 用于角色选择页面
 * 
 * 文件夹结构：
 * src/assets/
 * ├── characters/   <- 全身立绘 (portraits)
 * │   ├── linque.png
 * │   ├── kiana.png
 * │   └── enemy_shadow_knight.png
 * ├── avatars/      <- 行动轴小头像
 * │   ├── linque.png
 * │   ├── kiana.png
 * │   └── enemy_shadow_knight.png
 * └── cards/        <- 角色选择卡片立绘
 *     ├── linque.png
 *     ├── kiana.png
 *     └── ...
 * 
 * 命名规则：
 * - 文件名 = 角色ID (不含扩展名)
 * - 支持格式: png, jpg, jpeg, webp
 * - 特殊ID: user_default (用户创建角色的默认图), enemy_default (敌人默认图)
 */

// 自动加载全身立绘 (战斗场景右侧、对话场景)
const portraitModules = import.meta.glob('../assets/characters/*.{png,jpg,jpeg,webp}', { eager: true });

// 自动加载行动轴小头像
const avatarModules = import.meta.glob('../assets/avatars/*.{png,jpg,jpeg,webp}', { eager: true });

// 自动加载角色选择卡片立绘
const cardModules = import.meta.glob('../assets/cards/*.{png,jpg,jpeg,webp}', { eager: true });

// 自动加载背景图片
const backgroundModules = import.meta.glob('../assets/backgrounds/*.{png,jpg,jpeg,webp}', { eager: true });

export const characterPortraits: Record<string, string> = {};
export const characterAvatars: Record<string, string> = {};
export const characterCards: Record<string, string> = {};
export const backgrounds: Record<string, string> = {};

// Load Portraits
for (const path in portraitModules) {
  const fileName = path.split('/').pop()?.split('.')[0];
  if (fileName) {
    characterPortraits[fileName] = (portraitModules[path] as { default: string }).default;
  }
}

// Load Avatars
for (const path in avatarModules) {
  const fileName = path.split('/').pop()?.split('.')[0];
  if (fileName) {
    characterAvatars[fileName] = (avatarModules[path] as { default: string }).default;
  }
}

// Load Cards
for (const path in cardModules) {
  const fileName = path.split('/').pop()?.split('.')[0];
  if (fileName) {
    characterCards[fileName] = (cardModules[path] as { default: string }).default;
  }
}

// Load Backgrounds
for (const path in backgroundModules) {
  const fileName = path.split('/').pop()?.split('.')[0];
  if (fileName) {
    backgrounds[fileName] = (backgroundModules[path] as { default: string }).default;
  }
}

/**
 * 获取全身立绘 (战斗场景右侧、对话场景)
 * @param characterId 角色ID
 * @returns 图片URL或undefined
 */
export const getCharacterPortrait = (characterId: string): string | undefined => {
  if (characterPortraits[characterId]) return characterPortraits[characterId];
  
  // 用户创建角色的默认图
  if (characterId.startsWith('user_') && characterPortraits['user_default']) {
    return characterPortraits['user_default'];
  }
  
  // 敌人默认图
  if (characterId.startsWith('enemy_')) {
    if (characterPortraits[characterId]) return characterPortraits[characterId];
    if (characterPortraits['enemy_default']) return characterPortraits['enemy_default'];
  }
  
  return undefined;
};

/**
 * 获取行动轴小头像
 * @param characterId 角色ID
 * @returns 图片URL或undefined
 */
export const getCharacterAvatar = (characterId: string): string | undefined => {
  // 1. 优先使用专用头像
  if (characterAvatars[characterId]) return characterAvatars[characterId];

  // 2. 回退到全身立绘
  if (characterPortraits[characterId]) return characterPortraits[characterId];

  // 3. 特殊情况
  if (characterId.startsWith('user_')) {
    if (characterAvatars['user_default']) return characterAvatars['user_default'];
    if (characterPortraits['user_default']) return characterPortraits['user_default'];
  }
  
  if (characterId.startsWith('enemy_')) {
    if (characterAvatars[characterId]) return characterAvatars[characterId];
    if (characterAvatars['enemy_default']) return characterAvatars['enemy_default'];
    if (characterPortraits[characterId]) return characterPortraits[characterId];
  }

  return undefined;
};

/**
 * 获取角色选择卡片立绘
 * @param characterId 角色ID
 * @returns 图片URL或undefined
 */
export const getCharacterCard = (characterId: string): string | undefined => {
  // 1. 优先使用专用卡片立绘
  if (characterCards[characterId]) return characterCards[characterId];

  // 2. 回退到全身立绘
  if (characterPortraits[characterId]) return characterPortraits[characterId];

  // 3. 特殊情况
  if (characterId.startsWith('user_')) {
    if (characterCards['user_default']) return characterCards['user_default'];
    if (characterPortraits['user_default']) return characterPortraits['user_default'];
  }
  
  if (characterId.startsWith('enemy_')) {
    if (characterCards[characterId]) return characterCards[characterId];
    if (characterCards['enemy_default']) return characterCards['enemy_default'];
    if (characterPortraits[characterId]) return characterPortraits[characterId];
  }

  return undefined;
};

/**
 * 获取背景图片
 * @param backgroundId 背景ID (例如: 'dialogue_bg', 'battle_bg')
 * @returns 图片URL或undefined
 */
export const getBackground = (backgroundId: string): string | undefined => {
  return backgrounds[backgroundId];
};
