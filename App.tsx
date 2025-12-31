import React, { useState, useEffect } from 'react';
import { GeneratedSession, SessionConfig } from './types';
import { generateMeditationScript, generateMeditationAudio, generateMeditationImage } from './services/geminiService';
import { createAudioContext } from './services/audioUtils';
import SessionForm from './components/SessionForm';
import MediaPlayer from './components/MediaPlayer';
import ChatWidget from './components/ChatWidget';
import { Sparkles, Wind } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<GeneratedSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Check for API Key selection (required for gemini-3-pro-image-preview aka Nano Banana Pro)
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for dev/local env if window.aistudio isn't present 
        // We assume valid if process.env.API_KEY is there, but for the specific
        // model requirement, we ideally need the selector.
        // For this demo, we assume true if not in the specific environment that provides the selector,
        // OR we just default to true to allow UI to render (generation might fail if key is missing).
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Re-check
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    }
  };

  const handleGenerate = async (config: SessionConfig) => {
    // Double check key before starting expensive generation
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await handleSelectKey();
        // If still no key, abort
        if (!(await window.aistudio.hasSelectedApiKey())) return;
      }
    }

    setIsGenerating(true);
    setLoadingStep("Connecting to the ether...");

    try {
      const audioCtx = createAudioContext();

      // Parallelize generation where possible, but script is needed for audio.
      // 1. Image and Script can run together.
      
      setLoadingStep("Weaving script and painting visuals...");
      
      const [script, imageUrl] = await Promise.all([
        generateMeditationScript(config.topic, config.durationMinutes),
        generateMeditationImage(config.topic, config.imageStyle, config.imageSize)
      ]);

      setLoadingStep("Composing voice and sound...");
      const audioBuffer = await generateMeditationAudio(script, config.voice, audioCtx);

      const newSession: GeneratedSession = {
        id: Date.now().toString(),
        script,
        imageUrl,
        audioBuffer,
        config
      };

      setSession(newSession);

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Something went wrong while creating your session. Please ensure your API key allows access to these models.");
    } finally {
      setIsGenerating(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-violet-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shadow-lg shadow-violet-500/20">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-semibold tracking-tight">Aura Meditation</h1>
          </div>
          
          {!hasApiKey && (
             <button onClick={handleSelectKey} className="text-sm text-violet-400 hover:text-violet-300 underline underline-offset-4">
               Connect API Key
             </button>
          )}
        </header>

        {/* Hero / Form Area */}
        <main className="flex-1 flex flex-col items-center justify-center mb-12">
           
           {!hasApiKey ? (
             <div className="text-center space-y-6 max-w-md">
                <Sparkles className="w-16 h-16 mx-auto text-slate-600" />
                <h2 className="text-3xl font-serif text-slate-200">Unlock Your Sanctuary</h2>
                <p className="text-slate-400">To generate high-quality 4K visuals and neural voiceovers, please select a valid Google Cloud API key with billing enabled.</p>
                <button 
                  onClick={handleSelectKey}
                  className="px-8 py-4 bg-white text-slate-900 rounded-full font-medium hover:scale-105 transition-transform shadow-xl shadow-white/10"
                >
                  Select API Key
                </button>
                <p className="text-xs text-slate-600">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="hover:text-slate-500">
                    Learn about billing & models
                  </a>
                </p>
             </div>
           ) : (
             <>
               {isGenerating ? (
                  <div className="flex flex-col items-center gap-8 animate-in fade-in duration-1000">
                    <div className="relative w-32 h-32">
                       <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                       <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-violet-400 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-serif text-slate-200">{loadingStep}</h3>
                      <p className="text-slate-500 text-sm">Crafting a unique experience just for you...</p>
                    </div>
                  </div>
               ) : (
                  <SessionForm onGenerate={handleGenerate} isGenerating={isGenerating} />
               )}
             </>
           )}

        </main>
        
        {/* Footer */}
        <footer className="text-center text-slate-600 text-sm py-6">
          <p>&copy; {new Date().getFullYear()} Aura Meditation. Powered by Gemini.</p>
        </footer>

      </div>

      {/* Overlays */}
      {session && (
        <MediaPlayer session={session} onClose={() => setSession(null)} />
      )}

      <ChatWidget />
    </div>
  );
};

export default App;