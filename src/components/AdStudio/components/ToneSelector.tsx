import React from 'react';
import { AdTone } from '../../../types/adStudio';

interface ToneSelectorProps {
  tone: AdTone;
  toneMix: Record<AdTone, number>;
  onToneChange: (tone: AdTone) => void;
  onMixChange: (tone: AdTone, value: number) => void;
}

const TONE_OPTIONS: { key: AdTone; label: string; desc: string; icon: string; color: string }[] = [
  { key: 'corporate', label: 'Kurumsal', desc: 'Resmi, güven verici, profesyonel', icon: 'fa-briefcase', color: 'from-blue-500 to-blue-700' },
  { key: 'emotional', label: 'Duygusal', desc: 'Sıcak, samimi, ilham verici', icon: 'fa-heart', color: 'from-rose-500 to-rose-700' },
  { key: 'scientific', label: 'Bilimsel', desc: 'Veri odaklı, akademik, güvenilir', icon: 'fa-flask', color: 'from-emerald-500 to-emerald-700' },
  { key: 'playful', label: 'Eğlenceli', desc: 'Yaratıcı, renkli, dikkat çekici', icon: 'fa-face-smile', color: 'from-amber-500 to-amber-700' },
  { key: 'urgent', label: 'Acil', desc: 'Hızlı karar aldıran, FOMO, sınırlı zaman', icon: 'fa-bolt', color: 'from-red-500 to-red-700' },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ tone, toneMix, onToneChange, onMixChange }) => {
  return (
    <div className="space-y-6">
      {/* Main Tone Selection */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Ana Ton</p>
        <div className="grid grid-cols-3 gap-2">
          {TONE_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => onToneChange(opt.key)}
              className={`text-left p-3 rounded-xl border transition-all ${
                tone === opt.key
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center text-white text-xs mb-2`}>
                <i className={`fa-solid ${opt.icon}`} />
              </div>
              <span className="text-[11px] font-bold block">{opt.label}</span>
              <span className="text-[8px] text-zinc-500">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Mix Sliders */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
          Ton Karışımı <span className="text-zinc-600 font-normal normal-case tracking-normal">(yüzdeler toplamı 100 olmalı)</span>
        </p>
        <div className="space-y-3">
          {TONE_OPTIONS.map(opt => (
            <div key={opt.key} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${opt.color} flex items-center justify-center text-white text-[8px]`}>
                <i className={`fa-solid ${opt.icon}`} />
              </div>
              <span className="text-[11px] font-bold text-zinc-400 w-20">{opt.label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={toneMix[opt.key]}
                onChange={e => onMixChange(opt.key, Number(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none bg-zinc-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[11px] font-mono text-zinc-400 w-8 text-right">{toneMix[opt.key]}%</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-right">
          <span className={`text-[9px] font-mono ${
            Object.values(toneMix).reduce((a, b) => a + b, 0) === 100 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            Toplam: {Object.values(toneMix).reduce((a, b) => a + b, 0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
