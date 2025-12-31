export enum ImageSize {
  OneK = '1K',
  TwoK = '2K',
  FourK = '4K',
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}

export interface SessionConfig {
  topic: string;
  durationMinutes: number; // Used for prompt instruction
  imageStyle: string;
  imageSize: ImageSize;
  voice: VoiceName;
}

export interface GeneratedSession {
  id: string;
  script: string;
  imageUrl: string;
  audioBuffer: AudioBuffer | null;
  config: SessionConfig;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

// Augment window for the AI Studio key selection
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}