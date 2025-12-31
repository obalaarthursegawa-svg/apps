import { GoogleGenAI, Modality } from "@google/genai";
import { ImageSize, VoiceName } from "../types";
import { decodeAudioData } from "./audioUtils";

// We'll create the client inside functions to ensure we capture the latest API key if it changes (though usually env is static, but for the key selector it might matter).
// However, the instructions say process.env.API_KEY is injected. 
// For the `gemini-3-pro-image-preview` specific requirement of user-selected keys,
// we rely on the window.aistudio mechanism which updates the environment implicitly or we might need to re-instantiate.

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMeditationScript = async (topic: string, durationMinutes: number): Promise<string> => {
  const ai = getClient();
  const prompt = `
    Write a soothing, guided meditation script about "${topic}".
    The meditation should last approximately ${durationMinutes} minutes when read aloud slowly.
    Do not include any scene descriptions or stage directions (like [pause] or *soft music*). 
    Just return the spoken words for the guide.
    Keep the tone gentle, welcoming, and calm.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview', // Good enough for text
    contents: prompt,
  });

  return response.text || "Breathe in... Breathe out...";
};

export const generateMeditationAudio = async (text: string, voice: VoiceName, audioContext: AudioContext): Promise<AudioBuffer> => {
  const ai = getClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data returned from API");
  }

  return await decodeAudioData(base64Audio, audioContext);
};

export const generateMeditationImage = async (topic: string, style: string, size: ImageSize): Promise<string> => {
  const ai = getClient();
  
  // High quality prompt
  const prompt = `A high-quality, serene, ${style} style image representing "${topic}". 
  The image should be abstract and suitable for a meditation background. 
  Soft lighting, calming colors, no text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview', // Nano Banana Pro
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9", // Better for screens
        imageSize: size, // 1K, 2K, 4K
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};

export const createChatSession = () => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a wise, calming, and empathetic meditation guide. Help the user find peace and answer their questions about mindfulness.",
    },
  });
};
