import React from 'react';
import { AdAudience } from '../../../types/adStudio';

interface AudienceSelectorProps {
  audience: AdAudience[];
  onChange: (audience: AdAudience[]) => void;
}

const AUDIENCE_OPTIONS: { key: AdAudience; label: string; desc: string; icon: string }[] = [
  { key: 'teachers', label: 'Öğretmenler', desc: 'Sınıf içi kullanım, BEP uyumu, zaman tasarrufu', icon: 'fa-chalkboard-user' },
  { key: 'parents', label: 'Veliler', desc: 'Çocuğun potansiyeli, umut, fırsat eşitliği', icon: 'fa-heart' },
  { key: 'therapists', label: 'Uzmanlar', desc: 'Klinik doğruluk, değerlendirme araçları', icon: 'fa-briefcase-medical' },
  { key: 'school_admin', label: 'Okul Yöneticileri', desc: 'Toplu lisans, kurumsal fayda, MEB uyumu', icon: 'fa-building-columns' },
  { key: 'investors', label: 'Yatırımcılar', desc: 'Büyüme potansiyeli, pazar, teknoloji', icon: 'fa-chart-line' },
];

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({ audience, onChange }) => {
  const toggle = (key: AdAudience) => {
    if (audience.includes(key)) {
      onChange(audience.filter(a => a !== key));
    } else {
      onChange([...audience, key]);
    }
  };

  const setPriority = (key: AdAudience, priority: number) => {
    const list = audience.filter(a => a !== key);
    list.splice(Math.min(priority, list.length), 0, key);
    onChange(list);
  };

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Hedef kitleni seç (birden çok seçebilirsin — sıralama önceliği belirler)
      </p>
      <div className="grid grid-cols-2 gap-2">
        {AUDIENCE_OPTIONS.map(opt => {
          const idx = audience.indexOf(opt.key);
          const isSelected = idx !== -1;
          return (
            <button
              key={opt.key}
              onClick={() => toggle(opt.key)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <i className={`fa-solid ${opt.icon}`} />
                </div>
                <div className="flex-1">
                  <span className="text-[12px] font-bold block">{opt.label}</span>
                  <span className="text-[8px] text-zinc-500">{opt.desc}</span>
                </div>
                {isSelected && (
                  <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                    #{idx + 1}
                  </span>
                )}
              </div>
              {isSelected && idx > 0 && (
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={e => { e.stopPropagation(); setPriority(opt.key, idx - 1); }}
                    className="text-[8px] px-2 py-0.5 rounded bg-white/5 text-zinc-500 hover:text-zinc-300"
                  >
                    <i className="fa-solid fa-arrow-up mr-1" />Öne Al
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {audience.length === 0 && (
        <p className="text-[10px] text-amber-500 font-medium">En az bir hedef kitle seçmelisin</p>
      )}
    </div>
  );
};
