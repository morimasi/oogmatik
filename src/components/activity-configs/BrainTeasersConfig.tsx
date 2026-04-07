import React from 'react';
import { GeneratorOptions } from '../../types';

interface BrainTeasersConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

const CATEGORIES = ['Dil', 'Mantık', 'Sayı', 'Görsel'] as const;
type CategoryName = (typeof CATEGORIES)[number];

export const BrainTeasersConfig: React.FC<BrainTeasersConfigProps> = ({ options, onChange }) => {
  const selectedCategories: CategoryName[] = Array.isArray(options.selectedCategories)
    ? (options.selectedCategories as CategoryName[])
    : [...CATEGORIES];

  const toggleCategory = (cat: CategoryName) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    if (next.length > 0) onChange('selectedCategories' as keyof GeneratorOptions, next);
  };

  const puzzleCount = typeof options.puzzleCount === 'number' ? options.puzzleCount : 6;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Soru Türü */}
        <div className="col-span-2">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Zeka Sorusu Türü
          </label>
          <select
            value={options.topic || 'mixed'}
            onChange={(e) => onChange('topic', e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="mixed">Karışık (Önerilen)</option>
            <option value="riddles">Bilmeceler ve Kelime Oyunları</option>
            <option value="logic_grid">Mantık Kareleri ve Çıkarım</option>
            <option value="pattern">Görsel Desen Tamamlama</option>
            <option value="math_trick">Matematik Hileleri</option>
            <option value="lateral_thinking">Yanal Düşünme (Lateral Thinking)</option>
          </select>
        </div>

        {/* Zorluk Seviyesi */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Zorluk Seviyesi
          </label>
          <select
            value={options.difficulty || 'Orta'}
            onChange={(e) => onChange('difficulty', e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Başlangıç">Başlangıç (Kolay)</option>
            <option value="Orta">Orta (Düşündürücü)</option>
            <option value="Zor">Zor (Zihin Zorlayıcı)</option>
            <option value="Uzman">Uzman (Dahi Seviyesi)</option>
          </select>
        </div>

        {/* Bulmaca Sayısı — slider */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Bulmaca Sayısı: <span className="text-indigo-600">{puzzleCount}</span>
          </label>
          <input
            type="range"
            min={3}
            max={8}
            step={1}
            value={puzzleCount}
            onChange={(e) => onChange('puzzleCount', parseInt(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
            <span>3</span><span>8</span>
          </div>
        </div>
      </div>

      {/* Kategoriler */}
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
          Kategoriler
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ekstra Seçenekler */}
      <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        {/* İpuçlarını Göster */}
        <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(options.showHints)}
            onChange={(e) => onChange('showHints' as keyof GeneratorOptions, e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            İpuçlarını Göster
            <span className="block text-xs text-zinc-400 font-normal">
              Her bulmaca altında küçük bir ipucu gösterir.
            </span>
          </span>
        </label>

        <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <input
            type="checkbox"
            checked={Boolean(options.includeCreativeTask)}
            onChange={(e) => onChange('includeCreativeTask', e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Yaratıcı Düşünme Görevi Ekle
            <span className="block text-xs text-zinc-400 font-normal">
              Çocuğun kendi sorusunu üretmesi için alan bırakır.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};
