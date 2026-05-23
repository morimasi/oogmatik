import React from 'react';
import { AdStudioTarget, AD_TARGET_LABELS, AD_TARGET_DESCRIPTIONS } from '../../../types/adStudio';

interface TargetSelectorProps {
  target: AdStudioTarget;
  onChange: (target: AdStudioTarget) => void;
}

const CATEGORIES: { label: string; keys: AdStudioTarget[] }[] = [
  {
    label: 'Tümü',
    keys: ['all_modules'],
  },
  {
    label: 'Stüdyolar',
    keys: ['math_studio', 'reading_studio', 'writing_studio', 'super_studio', 'sari_kitap', 'infographic_studio'],
  },
  {
    label: 'Değerlendirme',
    keys: ['screening_assessment'],
  },
  {
    label: 'Admin',
    keys: ['dashboard', 'activities', 'prompts', 'approvals', 'static_content', 'drafts', 'content_engine', 'users', 'teachers', 'students', 'feedbacks', 'permissions'],
  },
];

export const TargetSelector: React.FC<TargetSelectorProps> = ({ target, onChange }) => {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
        Reklamı yapılacak modülü veya stüdyoyu seç
      </p>
      {CATEGORIES.map(cat => (
        <div key={cat.label}>
          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">{cat.label}</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.keys.map(key => (
              <button
                key={key}
                onClick={() => onChange(key)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  target === key
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                <span className="text-[11px] font-bold block">{AD_TARGET_LABELS[key]}</span>
                <span className="text-[8px] text-zinc-500 mt-0.5 block leading-tight">{AD_TARGET_DESCRIPTIONS[key]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
