import React, { useState } from 'react';

/**
 * Harf Bağlama Etkinliği — Ayar Paneli
 * Otonom scaffold tarafından üretildi.
 * 
 * Tasarım: Dark Glassmorphism, Tailwind CSS
 */
interface HarfBaglamaConfigProps {
  value: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}

export const HarfBaglamaConfig: React.FC<HarfBaglamaConfigProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4 p-4 bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800/50">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <i className="fa-link text-indigo-400" />
        Harf Bağlama Etkinliği Ayarları
      </h3>

      

      <div className="pt-2 border-t border-zinc-800/50">
        <p className="text-[9px] text-zinc-600 italic">
          Zorluk ve içerik ayarları üretim kalitesini doğrudan etkiler.
        </p>
      </div>
    </div>
  );
};
