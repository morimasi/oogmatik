import React from 'react';
import { GeneratorOptions } from '../../types';

export const DirectionalTrackingConfig: React.FC<{
  options: GeneratorOptions;
  onChange: (k: keyof GeneratorOptions, v: unknown) => void;
}> = ({ options, onChange }) => {
  const currentRows = options.gridRows || options.gridSize || 8;
  const currentCols = options.gridCols || options.gridSize || 8;
  const currentLength = options.codeLength || 8;
  const itemCount = options.itemCount || 1;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Sayfa Yapısı Konfigürasyonu */}
      <div className="p-5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/30 space-y-5">
        <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-indigo-800/20 pb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Sayfa Kompozisyonu</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">
                    <span>Varyasyon Sayısı</span>
                    <span className="text-indigo-600">{itemCount} Adet</span>
                </div>
                <div className="flex gap-1.5">
                    {[1, 2, 4].map(num => (
                        <button
                            key={num}
                            onClick={() => onChange('itemCount', num)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${itemCount === num ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                        >
                            {num === 4 ? 'GRID' : num}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">
                    <span>Zorluk</span>
                    <span className="text-violet-600">{options.difficulty || 'Orta'}</span>
                </div>
                <select 
                    value={options.difficulty || 'Orta'}
                    onChange={(e) => onChange('difficulty', e.target.value)}
                    className="w-full p-2 bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase text-zinc-600 focus:border-indigo-500 outline-none"
                >
                    {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">
              <span>Satır/Sütun</span>
              <span className="text-emerald-600">{currentRows}x{currentCols}</span>
            </div>
            <input
              type="range" min="4" max="12"
              value={currentRows}
              onChange={e => {
                  onChange('gridRows', parseInt(e.target.value));
                  onChange('gridCols', parseInt(e.target.value));
              }}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase tracking-widest px-1">
              <span>Şifre Boyu</span>
              <span className="text-amber-600">{currentLength} Harf</span>
            </div>
            <input
              type="range" min="3" max="15"
              value={currentLength}
              onChange={e => onChange('codeLength', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Görsel Temalar */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
        <label className="text-[10px] font-black text-zinc-400 uppercase block tracking-widest text-center">Görsel Stil ve Hikayeleştirme</label>
        <div className="grid grid-cols-2 gap-2">
            {[
                { id: 'standard', label: 'Klasik', icon: 'fa-box' },
                { id: 'premium', label: 'Premium', icon: 'fa-crown text-amber-500' },
                { id: 'uzay', label: 'Uzay Üssü', icon: 'fa-rocket text-indigo-500' },
                { id: 'hazine', label: 'Hazine Avı', icon: 'fa-gem text-emerald-500' },
                { id: 'gizli', label: 'Gizli Ajan', icon: 'fa-user-secret' },
                { id: 'ultra-compact', label: 'Yoğun', icon: 'fa-compress' },
            ].map(t => (
                <button
                    key={t.id}
                    onClick={() => onChange('aestheticMode', t.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${((options as any).aestheticMode || 'standard') === t.id ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl scale-105' : 'bg-white dark:bg-zinc-900 border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}
                >
                    <i className={`fa-solid ${t.icon} text-xs`}></i>
                    <span className="text-[9px] font-black uppercase whitespace-nowrap">{t.label}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="p-4 bg-indigo-900 text-white rounded-2xl flex items-center justify-between group overflow-hidden relative">
          <div className="relative z-10">
              <p className="text-[11px] font-black uppercase tracking-tight">V2 Professional</p>
              <p className="text-[8px] font-bold text-indigo-300 uppercase opacity-70">A4 Algoritmik Yerleşim Aktif</p>
          </div>
          <i className="fa-solid fa-code-branch text-indigo-400/20 text-4xl absolute -right-2 -bottom-2 group-hover:rotate-12 transition-transform"></i>
      </div>
    </div>
  );
};
