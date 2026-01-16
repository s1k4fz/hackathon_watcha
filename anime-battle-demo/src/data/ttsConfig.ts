// =================================================================
// 🎧 Fish Audio 角色语音模型配置
// =================================================================
// 你可以在这里直接填入 ID，也可以继续使用 .env 环境变量
// 获取 ID 地址: https://fish.audio/

export const TTS_CONFIG = {
  // 琪亚娜·卡斯兰娜
  kiana: import.meta.env.VITE_TTS_KIANA || "a1ae30991487475ababd708ea7a000df", 

  // 爱莉希雅
  elysia: import.meta.env.VITE_TTS_ELYSIA || "d65a7b45827040b19b9d1370a7d27f3c",

  // 雷电芽衣
  mei: import.meta.env.VITE_TTS_MEI || "d09e46ea44a14443be19467ae25e13d5",
};
