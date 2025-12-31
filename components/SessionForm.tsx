import React, { useState } from 'react';
import { SessionConfig, ImageSize, VoiceName } from '../types';
import Button from './Button';
import { Wand2, Mic, ImageIcon, Clock, Type } from 'lucide-react';

interface SessionFormProps {
  onGenerate: (config: SessionConfig) => void;
  isGenerating: boolean;
}

const SessionForm: React.FC<SessionFormProps> = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(3);
  const [style, setStyle] = useState('Abstract Aura');
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.OneK);
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      topic,
      durationMinutes: duration,
      imageStyle: style,
      imageSize,
      voice,
    });
  };

  const topicSuggestions = ["Anxiety Relief", "Morning Energy", "Deep Sleep", "Focus Flow"];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-indigo-200">Craft Your Session</h2>
        <p className="text-slate-400">Customize every aspect of your meditation experience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Topic Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Type className="w-4 h-4 text-violet-400" />
            Intention or Topic
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Walking in a rainy forest..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {topicSuggestions.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t)}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid for settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Duration */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Clock className="w-4 h-4 text-emerald-400" />
              Duration (Minutes)
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="text-right text-xs text-slate-400">{duration} minutes</div>
          </div>

          {/* Voice Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Mic className="w-4 h-4 text-rose-400" />
              Guide Voice
            </label>
            <select
              value={voice}
              onChange={(e) => setVoice(e.target.value as VoiceName)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
            >
              {Object.values(VoiceName).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Visual Style */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              Visual Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
            >
              <option value="Abstract Aura">Abstract Aura</option>
              <option value="Watercolor Dream">Watercolor Dream</option>
              <option value="Nature Photography">Nature Photography</option>
              <option value="Cosmic Space">Cosmic Space</option>
              <option value="Minimalist Line Art">Minimalist Line Art</option>
            </select>
          </div>

          {/* Image Size (Requirement Feature) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Wand2 className="w-4 h-4 text-amber-400" />
              Visual Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ImageSize).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`px-2 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                    imageSize === size
                      ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/20'
                      : 'bg-slate-900/30 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" isLoading={isGenerating} className="w-full text-lg h-14 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-size-200 animate-gradient">
            {isGenerating ? 'Weaving Magic...' : 'Begin Journey'}
          </Button>
          <p className="text-center text-xs text-slate-500 mt-4">
            Generates a custom script, voiceover, and high-resolution visual using Gemini AI.
          </p>
        </div>
      </form>
    </div>
  );
};

export default SessionForm;