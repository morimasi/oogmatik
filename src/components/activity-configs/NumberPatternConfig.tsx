import React from 'react';
import { GeneratorOptions } from '../../types';

interface ConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const NumberPatternConfig = ({ options, onChange }: ConfigProps) => {
  const o = (options as any).numberPattern || {};

  const update = (key: string, val: unknown) => {
    onChange('numberPattern' as any, { ...o, [key]: val });
    onChange(key as any, val);
  };

  const problemCount = o.problemCount || options.problemCount || 8;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
        <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3">
          <i className="fa-solid fa-arrow-trend-up mr-1 text-indigo-600"></i> Sayı Örüntü Ayarları
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Örüntü Türü */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Örüntü Kuralları
            </label>
            <select
              value={o.patternKind || options.patternKind || 'mixed'}
              onChange={(e) => update('patternKind', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="mixed">Karma Örüntüler (Tümü)</option>
              <option value="add">Artan (+N Adımlar)</option>
              <option value="subtract">Azalan (-N Adımlar)</option>
              <option value="multiply">Katlı (×N Çarpanlı)</option>
              <option value="fibonacci">Fibonacci (Toplamlı)</option>
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
              className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Kolay">Kolay (Küçük Adımlar)</option>
              <option value="Orta">Orta (Dengeli Adımlar)</option>
              <option value="Zor">Zor (Büyük Sayılar/Katlar)</option>
            </select>
          </div>
        </div>

        {/* Soru Miktarı Slider */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
            <span>A4 Dizi Miktarı</span>
            <span className="text-indigo-600 font-black">{problemCount} Örüntü</span>
          </div>
          <input
            type="range"
            min={4}
            max={12}
            step={2}
            value={problemCount}
            onChange={(e) => update('problemCount', parseInt(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* İpucu Gösterim Seçenekleri */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer"
          onClick={() => update('showRuleClue', o.showRuleClue === false ? true : false)}
        >
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Örüntü İpucu Çizgisi</span>
            <span className="text-[9px] text-zinc-400">Örüntü altında kural yazma çizgisini göster</span>
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${o.showRuleClue !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${o.showRuleClue !== false ? 'left-5.5' : 'left-0.75'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
