import React from 'react';

/**
 * ULTRA PROFESYONEL AYARLAR PANELİ
 * - Dark Glassmorphism
 * - Modern Tailwind Form Elemanları
 */
export const ConfigPanel: React.FC<{ settings: any; onChange: (s: any) => void }> = ({ settings, onChange }) => {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="p-4 bg-indigo-900/40 border border-indigo-500/20 rounded-2xl flex items-center gap-3 shadow-lg">
        <i className="fa-solid fa-sliders text-indigo-400 text-xl animate-pulse"></i>
        <div>
          <h4 className="text-xs font-black text-indigo-100 uppercase tracking-widest">Etkinlik Konfigürasyonu</h4>
          <p className="text-[10px] text-indigo-300">A4 sayfasının yoğunluğunu ve pedagojik limitlerini ayarlayın.</p>
        </div>
      </div>

      {/* SETTINGS FORM */}
      <div className="space-y-4">
        {/* Zorluk Ayarı */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Bilişsel Zorluk Kademesi</label>
          <select 
            value={settings.difficulty || 'Orta'}
            onChange={(e) => onChange({...settings, difficulty: e.target.value})}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="Kolay">Kolay (Başlangıç Düzeyi)</option>
            <option value="Orta">Orta (ZPD İdeal)</option>
            <option value="Zor">Zor (Ketleme ve İleri Odak)</option>
          </select>
        </div>

        {/* Yoğunluk Ayarı */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Sayfa Madde Yoğunluğu (Item Count)</label>
          <input 
            type="number"
            min="4" max="24"
            value={settings.itemCount || 8}
            onChange={(e) => onChange({...settings, itemCount: Number(e.target.value)})}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
};
