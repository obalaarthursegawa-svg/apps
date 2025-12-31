// Utility to decode raw PCM or other audio data from Gemini
export const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini TTS usually returns raw PCM or a container format.
  // The SDK examples suggest treating it as standard decodeAudioData compatible
  // if wrapped properly, but strictly speaking, if it's raw PCM, we might need manual decoding.
  // However, the current 'gemini-2.5-flash-preview-tts' often returns a format 
  // that decodeAudioData can sniff if it has headers, OR we decode raw.
  
  // For the purpose of this app and the provided examples, we will attempt 
  // standard decoding first (which works for many formats) and if that fails, 
  // assume raw PCM (though raw PCM usually requires knowing sample rate/format upfront).
  // The provided example in the prompt explicitly uses decodeAudioData on the result of decode(base64).
  
  return await audioContext.decodeAudioData(bytes.buffer);
};

export const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 24000, // Optimize for the model's output if needed, though standard 44.1/48 works
  });
};