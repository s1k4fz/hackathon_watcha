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

// Rate limiting: Track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 800; // Minimum 800ms between requests (Fish Audio free tier limit)

// Request queue for rate limiting
let requestQueue: Array<() => Promise<void>> = [];
let isProcessingRequests = false;

const processRequestQueue = async () => {
  if (isProcessingRequests || requestQueue.length === 0) return;
  
  isProcessingRequests = true;
  
  while (requestQueue.length > 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      // Wait before next request
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    const request = requestQueue.shift();
    if (request) {
      lastRequestTime = Date.now();
      await request();
    }
  }
  
  isProcessingRequests = false;
};

// Reset queue for a new turn
export const resetTTSQueue = () => {
  // Cleanup existing URLs
  playbackQueue.forEach(task => {
    if (task.url) URL.revokeObjectURL(task.url);
  });
  playbackQueue.clear();
  currentPlayIndex = 0;
  isPlaying = false;
  // Also clear pending requests
  requestQueue = [];
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

const makeTTSRequest = async (
  text: string, 
  apiKey: string, 
  referenceId: string,
  index: number,
  retryCount = 0
): Promise<void> => {
  const MAX_RETRIES = 2;
  
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
      
      // Handle rate limit with retry
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        console.warn(`TTS Rate limited (Index ${index}), retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return makeTTSRequest(text, apiKey, referenceId, index, retryCount + 1);
      }
      
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

  // 3. Add to rate-limited request queue
  requestQueue.push(() => makeTTSRequest(text, apiKey, referenceId, index));
  processRequestQueue();
};
