import React, { ChangeEvent } from 'react';
import { HiddenPicturesSettings } from '../types';

interface ConfigPanelProps {
  settings: HiddenPicturesSettings;
  onChange: (s: HiddenPicturesSettings) => void;
}

export const ConfigPanel = ({ settings, onChange }: ConfigPanelProps) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-teal-900/40 border border-teal-500/20 rounded-2xl flex items-center gap-3 shadow-lg">
        <i className="fa-solid fa-magnifying-glass text-teal-400 text-xl animate-pulse"></i>
        <div>
          <h4 className="text-xs font-black text-teal-100 uppercase tracking-widest">Gizli Nesne Kontrolü</h4>
          <p className="text-[10px] text-teal-300">Resim karmaşıklığı ve hedefleri belirleyin.</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Zorluk */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Gizlenme Zorluğu</label>
          <select 
            value={settings.difficulty || 'Orta'}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange({...settings, difficulty: e.target.value as any})}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 font-bold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="Kolay">Kolay (Büyük ve Belirgin)</option>
            <option value="Orta">Orta (Zemin Rengine Yakın)</option>
            <option value="Zor">Zor (Çizgilere Kamufle)</option>
          </select>
        </div>

        {/* Nesne Sayısı */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Aranacak Nesne Adedi</label>
          <input 
            type="number"
            min="4" max="20"
            value={settings.hiddenItemCount || 8}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({...settings, hiddenItemCount: Number(e.target.value)})}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 font-bold focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Tema */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Resim Teması (AI İçin)</label>
          <input 
            type="text"
            placeholder="Örn: Uzay, Orman, Basketbol Sahası"
            value={settings.theme || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({...settings, theme: e.target.value})}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 font-bold focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
