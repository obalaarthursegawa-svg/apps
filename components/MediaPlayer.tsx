import React, { useEffect, useRef, useState } from 'react';
import { GeneratedSession } from '../types';
import { Play, Pause, X, Volume2, Download } from 'lucide-react';

interface MediaPlayerProps {
  session: GeneratedSession;
  onClose: () => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ session, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Initialize Audio Context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Auto-play on mount
    playAudio();

    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const playAudio = async () => {
    if (!session.audioBuffer || !audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = session.audioBuffer;
    source.connect(audioContextRef.current.destination);
    
    // Handle Pause/Resume logic
    const offset = pauseTimeRef.current;
    source.start(0, offset);
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    
    sourceNodeRef.current = source;
    setIsPlaying(true);
    
    source.onended = () => {
      // Only reset if we reached the end naturally, not if we stopped it manually
      if (audioContextRef.current && audioContextRef.current.currentTime - startTimeRef.current >= session.audioBuffer!.duration) {
         setIsPlaying(false);
         pauseTimeRef.current = 0;
         setProgress(100);
      }
    };

    updateProgress();
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioContextRef.current) {
        pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      }
      stopAudio();
    } else {
      playAudio();
    }
  };

  const updateProgress = () => {
    if (!audioContextRef.current || !session.audioBuffer) return;
    
    const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
    const duration = session.audioBuffer.duration;
    const percent = Math.min((elapsed / duration) * 100, 100);
    
    setProgress(percent);
    
    if (isPlaying && percent < 100) {
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Safe duration display
  const totalDuration = session.audioBuffer?.duration || 0;
  const currentSeconds = (progress / 100) * totalDuration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-in fade-in duration-700">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
        style={{ backgroundImage: `url(${session.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col h-full md:h-auto md:min-h-[600px] justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-start">
           <div className="space-y-1">
             <h2 className="text-4xl font-serif text-white tracking-wide">{session.config.topic}</h2>
             <p className="text-white/60 text-sm uppercase tracking-widest">{session.config.imageStyle} &bull; {session.config.voice}</p>
           </div>
           <button 
             onClick={onClose} 
             className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors"
           >
             <X className="text-white" />
           </button>
        </div>

        {/* Center Visual/Breathing Element (Optional) */}
        <div className="flex-1 flex items-center justify-center my-12">
            <div className={`w-64 h-64 rounded-full border-2 border-white/20 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
               <div className="w-56 h-56 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center">
                  <Play className={`w-12 h-12 text-white/50 ${isPlaying ? 'hidden' : 'block ml-2'}`} />
                  <div className={`w-48 h-48 rounded-full bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 ${isPlaying ? 'animate-ping-slow' : ''}`}></div>
               </div>
            </div>
        </div>

        {/* Controls */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-6">
           {/* Progress Bar */}
           <div className="space-y-2">
             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer">
                <div 
                  className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
             </div>
             <div className="flex justify-between text-xs font-medium text-white/50">
               <span>{formatTime(currentSeconds)}</span>
               <span>{formatTime(totalDuration)}</span>
             </div>
           </div>

           {/* Buttons */}
           <div className="flex items-center justify-center gap-8">
              <button className="text-white/60 hover:text-white transition-colors">
                 <Volume2 className="w-6 h-6" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-indigo-900 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              <button className="text-white/60 hover:text-white transition-colors">
                 <Download className="w-6 h-6" />
              </button>
           </div>
        </div>
        
        {/* Quote/Script Snippet */}
        <div className="mt-8 text-center">
             <p className="text-white/70 italic font-serif text-lg leading-relaxed max-w-2xl mx-auto line-clamp-2 opacity-60">
               "Breathe deeply and let go of the day..."
             </p>
        </div>

      </div>
    </div>
  );
};

export default MediaPlayer;