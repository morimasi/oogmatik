import React, { useState } from 'react';

/**
 * Harf Bağlama — Ayar Paneli
 * Otonom scaffold tarafından üretildi.
 * 
 * Tasarım: Dark Glassmorphism, Tailwind CSS
 */
interface LetterConnectConfigProps {
  value: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}

export const LetterConnectConfig: React.FC<LetterConnectConfigProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4 p-4 bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800/50">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <i className="fa-solid fa-link text-indigo-400" />
        Harf Bağlama Ayarları
      </h3>

      
      <div className="space-y-1">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">
          Eşleşme Çifti
        </label>
        <input
          type="number"
          min={3}
          max={10}
          value={String(value['pairCount'] ?? '5')}
          onChange={(e) => onChange('pairCount', e.target.value)}
          className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors"
        />
      </div>
      

      <div className="pt-2 border-t border-zinc-800/50">
        <p className="text-[9px] text-zinc-600 italic">
          Zorluk ve içerik ayarları üretim kalitesini doğrudan etkiler.
        </p>
      </div>
    </div>
  );
};
