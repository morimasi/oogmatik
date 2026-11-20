import React, { useState, useEffect, useRef, useCallback } from 'react';

interface AdVoicePlayerProps {
  textToSpeak: string;
  label?: string;
}

export const AdVoicePlayer: React.FC<AdVoicePlayerProps> = ({ textToSpeak, label = 'Seslendirme Önizleme' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(0.9); // Disleksi dostu sakin tempo (0.9x)
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const speak = useCallback(() => {
    if (!isSupported || !textToSpeak) return;

    window.speechSynthesis.cancel();

    const cleanText = textToSpeak
      .replace(/\[\d+:\d+\s*-\s*\d+:\d+\]/g, '')
      .replace(/GİRİŞ|PROBLEM|ÇÖZÜM|EYLEME ÇAĞRI|SESLENDİRME:|GÖRSEL:/gi, '')
      .replace(/[#*_~`]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'tr-TR';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Türkçe ses bulmaya çalış
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, textToSpeak, rate]);

  const togglePause = useCallback(() => {
    if (!isPlaying) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying, isPaused]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mt-2">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPlaying && !isPaused ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white/10 text-zinc-400'}`}>
          <i className="fa-solid fa-microphone-lines text-xs" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-zinc-300 block">{label}</span>
          <span className="text-[8px] text-zinc-500">Web Speech API · Disleksi Dostu Tempo</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Hız Seçici */}
        <select
          value={rate}
          onChange={e => {
            const newRate = Number(e.target.value);
            setRate(newRate);
            if (isPlaying) {
              stop();
            }
          }}
          className="py-1 px-2 rounded-lg bg-black/40 border border-white/10 text-zinc-300 text-[9px] font-bold focus:outline-none cursor-pointer"
        >
          <option value="0.8">0.8x Sakin</option>
          <option value="0.9">0.9x Önerilen</option>
          <option value="1.0">1.0x Normal</option>
          <option value="1.15">1.15x Dinamik</option>
        </select>

        {/* Oynat / Durdur Butonları */}
        {!isPlaying ? (
          <button
            onClick={speak}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-bold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md"
          >
            <i className="fa-solid fa-play text-[8px]" />
            Dinle
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={togglePause}
              className="p-1.5 rounded-lg bg-white/10 text-zinc-200 hover:bg-white/20 text-[9px]"
              title={isPaused ? 'Devam Et' : 'Duraklat'}
            >
              <i className={`fa-solid ${isPaused ? 'fa-play' : 'fa-pause'}`} />
            </button>
            <button
              onClick={stop}
              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-[9px]"
              title="Durdur"
            >
              <i className="fa-solid fa-stop" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
