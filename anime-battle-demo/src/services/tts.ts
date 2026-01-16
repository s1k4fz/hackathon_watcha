// Service for Fish Audio TTS
// Docs: https://docs.fish.audio/developer-guide/getting-started/quickstart

interface AudioTask {
  index: number;
  url: string | null;
  status: 'pending' | 'ready' | 'played' | 'failed';
}

// Global state for sequence management
let playbackQueue: Map<number, AudioTask> = new Map();
let currentPlayIndex = 0;
let isPlaying = false;

// Reset queue for a new turn
export const resetTTSQueue = () => {
  // Cleanup existing URLs
  playbackQueue.forEach(task => {
    if (task.url) URL.revokeObjectURL(task.url);
  });
  playbackQueue.clear();
  currentPlayIndex = 0;
  isPlaying = false;
};

const processQueue = async () => {
  if (isPlaying) return;

  // Check if the NEXT expected sequence is ready
  const task = playbackQueue.get(currentPlayIndex);

  if (task && task.status === 'ready' && task.url) {
    isPlaying = true;
    
    const audio = new Audio(task.url);
    
    await new Promise<void>((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(task.url!); // Cleanup
        task.status = 'played';
        resolve();
      };
      audio.onerror = () => {
        console.error(`Audio playback failed for index ${task.index}`);
        task.status = 'failed';
        resolve();
      };
      audio.play().catch(e => {
        console.error("Play failed", e);
        task.status = 'failed';
        resolve();
      });
    });

    currentPlayIndex++;
    isPlaying = false;
    processQueue(); // Try next immediately
  } 
  // If next task is pending, we wait.
  // If next task failed, we skip it.
  else if (task && task.status === 'failed') {
    currentPlayIndex++;
    processQueue();
  }
};

export const queueCharacterSpeech = async (
  text: string, 
  apiKey: string, 
  referenceId: string,
  index: number // New: Sequence Index
) => {
  // 1. Always register the task first to prevent sequence gaps
  playbackQueue.set(index, { index, url: null, status: 'pending' });

  // 2. Handle empty/invalid text gracefully
  if (!text || !text.trim()) {
    const task = playbackQueue.get(index);
    if (task) task.status = 'played'; // Treat as skipped/played
    processQueue();
    return;
  }

  try {
    const response = await fetch("/api/fish/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        reference_id: referenceId,
        format: "mp3",
        normalize: true, 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TTS API Error (Index ${index}):`, response.status, errorText);
      const task = playbackQueue.get(index);
      if (task) task.status = 'failed';
      processQueue(); 
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Update task with audio
    const task = playbackQueue.get(index);
    if (task) {
      task.url = audioUrl;
      task.status = 'ready';
      processQueue(); // Trigger playback check
    }

  } catch (error) {
    console.error("Failed to queue speech:", error);
    const task = playbackQueue.get(index);
    if (task) task.status = 'failed';
    processQueue();
  }
};
