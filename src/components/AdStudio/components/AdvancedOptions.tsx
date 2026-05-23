import React, { useState } from 'react';
import { AdStudioSettings } from '../../../types/adStudio';

interface AdvancedOptionsProps {
  settings: AdStudioSettings;
  onChange: <K extends keyof AdStudioSettings>(key: K, value: AdStudioSettings[K]) => void;
}

const SEASON_OPTIONS = [
  { value: '', label: 'Genel' },
  { value: 'back_to_school', label: 'Okula Dönüş' },
  { value: 'new_year', label: 'Yılbaşı' },
  { value: 'spring', label: 'Bahar Dönemi' },
  { value: 'summer', label: 'Yaz Okulu' },
  { value: 'private', label: 'Özel Etkinlik' },
];

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ settings, onChange }) => {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !settings.tags.includes(trimmed)) {
      onChange('tags', [...settings.tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onChange('tags', settings.tags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Gelişmiş Ayarlar</p>

      <div className="grid grid-cols-3 gap-4">
        {/* Language */}
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Dil</label>
          <div className="flex gap-1">
            {(['tr', 'en'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => onChange('language', lang)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  settings.language === lang
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-white/5 text-zinc-500 border border-white/5 hover:text-zinc-300'
                }`}
              >
                {lang === 'tr' ? 'Türkçe' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Aciliyet</label>
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as const).map(urg => (
              <button
                key={urg}
                onClick={() => onChange('urgency', urg)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                  settings.urgency === urg
                    ? urg === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : urg === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-zinc-500 border border-white/5 hover:text-zinc-300'
                }`}
              >
                {urg === 'low' ? 'Düşük' : urg === 'medium' ? 'Orta' : 'Yüksek'}
              </button>
            ))}
          </div>
        </div>

        {/* Season */}
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Sezon / Etkinlik</label>
          <select
            value={settings.season}
            onChange={e => onChange('season', e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-[11px] font-medium focus:outline-none focus:border-indigo-500/30 appearance-none cursor-pointer"
          >
            {SEASON_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Call to Action */}
      <div>
        <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Çağrı Metni (CTA)</label>
        <input
          type="text"
          value={settings.callToAction}
          onChange={e => onChange('callToAction', e.target.value)}
          placeholder="Örn: Hemen keşfet, Ücretsiz dene, Bilgi al"
          className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/5 text-zinc-300 text-[12px] font-medium focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider block mb-2">Etiketler</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Etiket ekle ve Enter'a bas"
            className="flex-1 py-2 px-3 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30 placeholder:text-zinc-600"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-bold hover:bg-indigo-500/30 transition-all"
          >
            Ekle
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {settings.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[9px] font-medium">
              <i className="fa-solid fa-tag text-[7px]" />
              {tag}
              <button onClick={() => removeTag(tag)} className="text-indigo-500 hover:text-red-400 ml-0.5">
                <i className="fa-solid fa-xmark text-[8px]" />
              </button>
            </span>
          ))}
          {settings.tags.length === 0 && (
            <span className="text-[9px] text-zinc-600">Henüz etiket eklenmedi</span>
          )}
        </div>
      </div>
    </div>
  );
};
