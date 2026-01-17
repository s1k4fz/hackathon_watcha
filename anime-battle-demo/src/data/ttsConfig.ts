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

  // 绫雀 (Linque) - 看板娘
  linque: import.meta.env.VITE_TTS_LINQUE || "0fd4eea1d2bd450caabb81b497ef7931", 

  // 洛书 (Luoshu)
  luoshu: "a91caf4b5be3467081c8362c84bb5acf", // Placeholder

  // 赫尔加 (Helga)
  helga: "b60da494fa0c46aebc84529063ff65e5", // Placeholder

  // 吱吱 (Zizhi)
  zizhi: "4b9c370b22914c8498382e57490d337d", // Placeholder

  // 西蒙 (Simon)
  simon: "d19c19dd1e1e4a34b4c9fe8a11abc9b7", // Placeholder (Reuse Mei?) - Let's use a random one. "99c85153e13d467499d3635749372986"

  // 尤尼 (Uni)
  uni: "b8ccd4edf76e4e6481462294618a9ce5", // Placeholder (Reuse Kiana for idol voice)

  // 用户自定义角色默认语音 (如果用户没有指定)
  user_default: import.meta.env.VITE_TTS_USER_DEFAULT || "7f92f8afb8b54e03879433d71c9377a0", 
};
