import React from 'react';
import { GeneratorOptions } from '../../types';

interface ConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const KendokuConfig = ({ options, onChange }: ConfigProps) => {
  const o = (options as any).kendoku || {};

  const update = (key: string, val: unknown) => {
    onChange('kendoku' as any, { ...o, [key]: val });
    onChange(key as any, val);
  };

  const gridSize = o.gridSize || options.gridSize || 4;
  const puzzleCount = o.puzzleCount || options.puzzleCount || (gridSize === 5 ? 2 : 4);
  const operationType = o.operationType || options.operationType || 'toplama';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-800/30">
        <h4 className="text-xs font-black text-purple-900 dark:text-purple-300 uppercase tracking-widest mb-3">
          <i className="fa-solid fa-puzzle-piece mr-1 text-purple-600"></i> Kendoku Yapılandırması
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Izgara Boyutu */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Izgara Boyutu
            </label>
            <select
              value={gridSize}
              onChange={(e) => update('gridSize', parseInt(e.target.value))}
              className="w-full bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value={3}>3×3 (Başlangıç)</option>
              <option value={4}>4×4 (Standart)</option>
              <option value={5}>5×5 (Zorlu)</option>
            </select>
          </div>

          {/* İşlem Türü */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              İşlem Kümesi
            </label>
            <select
              value={operationType}
              onChange={(e) => update('operationType', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="toplama">Sadece Toplama (+)</option>
              <option value="dort_islem">Toplama & Çıkarma (+, -)</option>
            </select>
          </div>
        </div>

        {/* Bulmaca Adedi Slider */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
            <span>A4 Bulmaca Sayısı</span>
            <span className="text-purple-600 font-black">{puzzleCount} Bulmaca</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={puzzleCount}
            onChange={(e) => update('puzzleCount', parseInt(e.target.value))}
            className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
