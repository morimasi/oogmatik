import React from 'react';
import { AdFormat } from '../../../types/adStudio';

interface FormatPickerProps {
  format: AdFormat;
  duration: number;
  onFormatChange: (format: AdFormat) => void;
  onDurationChange: (duration: number) => void;
}

const FORMAT_OPTIONS: { key: AdFormat; label: string; desc: string; icon: string }[] = [
  { key: 'storyboard', label: 'Storyboard', desc: 'Sahne-sahne görsel senaryo', icon: 'fa-clapperboard' },
  { key: 'video_script', label: 'Video Script', desc: 'Tam video senaryo metni', icon: 'fa-scroll' },
  { key: 'social_media', label: 'Sosyal Medya', desc: 'Instagram, LinkedIn, X postu', icon: 'fa-hashtag' },
  { key: 'email', label: 'E-posta', desc: 'Kampanya e-posta metni', icon: 'fa-envelope' },
  { key: 'press_release', label: 'Basın Bülteni', desc: 'Resmi basın açıklaması', icon: 'fa-newspaper' },
  { key: 'brochure', label: 'Broşür', desc: 'Tanıtım broşür metni', icon: 'fa-book-open' },
  { key: 'web_copy', label: 'Web Metni', desc: 'Landing page ve ürün açıklaması', icon: 'fa-globe' },
];

export const FormatPicker: React.FC<FormatPickerProps> = ({ format, duration, onFormatChange, onDurationChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Format Seç</p>
        <div className="grid grid-cols-2 gap-2">
          {FORMAT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => onFormatChange(opt.key)}
              className={`text-left p-4 rounded-xl border transition-all ${
                format === opt.key
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  format === opt.key ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <i className={`fa-solid ${opt.icon}`} />
                </div>
                <div>
                  <span className="text-[12px] font-bold block">{opt.label}</span>
                  <span className="text-[8px] text-zinc-500">{opt.desc}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {(format === 'storyboard' || format === 'video_script') && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Video Süresi: <span className="text-indigo-400">{duration}s</span>
          </p>
          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={duration}
            onChange={e => onDurationChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-[8px] text-zinc-600 mt-1">
            <span>15sn (Kısa)</span>
            <span>60sn (Standart)</span>
            <span>120sn (Uzun)</span>
          </div>
        </div>
      )}
    </div>
  );
};
