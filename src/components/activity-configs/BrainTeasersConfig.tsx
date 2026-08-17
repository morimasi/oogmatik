import React from 'react';
import { GeneratorOptions } from '../../types';

interface BrainTeasersConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

const CATEGORIES = ['Dil', 'Mantık', 'Sayı', 'Görsel', 'Kibrit', 'Şifre'] as const;
type CategoryName = (typeof CATEGORIES)[number];

export const BrainTeasersConfig: React.FC<BrainTeasersConfigProps> = ({ options, onChange }) => {
  const o = (options as any).brainTeasers || {};

  const update = (updates: Record<string, unknown>) => {
    onChange('brainTeasers' as any, { ...o, ...updates });
  };

  const selectedCategories: CategoryName[] = Array.isArray(o.selectedCategories)
    ? (o.selectedCategories as CategoryName[])
    : [...CATEGORIES];

  const toggleCategory = (cat: CategoryName) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    if (next.length > 0) update({ selectedCategories: next });
  };

  const puzzleCount = typeof o.puzzleCount === 'number' ? o.puzzleCount : 8;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
        <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3">
          <i className="fa-solid fa-brain mr-1 text-indigo-600"></i> Zeka Atölyesi Ayarları
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Kolon Düzeni */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              A4 Kart Düzeni
            </label>
            <select
              value={o.layoutCols || 2}
              onChange={(e) => update({ layoutCols: parseInt(e.target.value) })}
              className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value={2}>2 Kolon (Büyük Okunaklı Kartlar)</option>
              <option value={3}>3 Kolon (Kompakt Zengin Dolgu)</option>
            </select>
          </div>

          {/* Zorluk */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Zorluk Derecesi
            </label>
            <select
              value={options.difficulty || 'Orta'}
              onChange={(e) => onChange('difficulty', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Başlangıç">Başlangıç (Kolay)</option>
              <option value="Orta">Orta (Düşündürücü)</option>
              <option value="Zor">Zor (Zihin Zorlayıcı)</option>
            </select>
          </div>
        </div>

        {/* Bulmaca Sayısı — slider */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
            <span>A4 Bulmaca Miktarı</span>
            <span className="text-indigo-600 font-black">{puzzleCount} Soru</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={2}
            value={puzzleCount}
            onChange={(e) => update({ puzzleCount: parseInt(e.target.value) })}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Kategoriler */}
      <div>
        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
          Zeka Oyun Kategori Seçimi
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer text-xs font-bold ${selectedCategories.includes(cat)
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 border-zinc-200 dark:border-zinc-700'
                }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="hidden"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* İpucu Göster */}
      <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">İpuçlarını Karta Ekle</span>
          <span className="text-[9px] text-zinc-400">Çözüme rehberlik eden ipucu satırı</span>
        </div>
        <button
          onClick={() => update({ showHints: !o.showHints })}
          className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${o.showHints !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${o.showHints !== false ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
};
