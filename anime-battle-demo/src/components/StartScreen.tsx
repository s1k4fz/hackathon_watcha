import React, { useState, useRef } from 'react';

interface StartScreenProps {
  onStart: () => void;
  videoSrc?: string; // 视频文件路径，如果没有则显示纯黑背景
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, videoSrc }) => {
  const [isReady, setIsReady] = useState(!videoSrc); // 如果没有视频，直接就绪
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleClick = () => {
    onStart();
  };

  const handleVideoReady = () => {
    setIsReady(true);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative w-full h-screen bg-black cursor-pointer overflow-hidden select-none"
    >
      {/* 视频背景 */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={handleVideoReady}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 渐变遮罩 - 底部加深以突出文字 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* 游戏标题 */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-[0.3em] drop-shadow-2xl mb-4">
          残响
        </h1>
        <p className="text-xl md:text-2xl text-white/60 tracking-[0.5em] font-light">
          叙语连接
        </p>
        <p className="text-xs text-white/30 tracking-widest mt-4 uppercase">
          Echoes: Narrative Link
        </p>
      </div>

      {/* 点击提示 */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-10">
        <p 
          className={`
            text-lg md:text-xl text-white/70 tracking-widest font-light
            animate-pulse transition-opacity duration-1000
            ${isReady ? 'opacity-100' : 'opacity-0'}
          `}
        >
          — 点击任意位置开始 —
        </p>
        <p className="text-xs text-white/30 mt-2">Click anywhere to start</p>
      </div>

      {/* 版本信息 */}
      <div className="absolute bottom-4 right-4 text-xs text-white/20 z-10">
        Demo v0.1
      </div>

      {/* 加载指示（如果视频还没准备好） */}
      {videoSrc && !isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-white/50 text-sm animate-pulse">Loading...</div>
        </div>
      )}
    </div>
  );
};
