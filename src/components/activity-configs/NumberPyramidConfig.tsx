import React from 'react';
import { GeneratorOptions } from '../../types';

interface ConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const NumberPyramidConfig = ({ options, onChange }: ConfigProps) => {
  const o = (options as any).numberPyramid || {};

  const update = (key: string, val: unknown) => {
    onChange('numberPyramid' as any, { ...o, [key]: val });
    onChange(key as any, val);
  };

  const pyramidHeight = o.pyramidHeight || options.pyramidHeight || 4;
  const puzzleCount = o.puzzleCount || options.puzzleCount || (pyramidHeight >= 5 ? 2 : 4);
  const operation = o.operation || options.operation || 'addition';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
        <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-3">
          <i className="fa-solid fa-shapes mr-1 text-amber-600"></i> Sayı Piramidi Yapılandırması
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Piramit Yüksekliği */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Katman Yüksekliği
            </label>
            <select
              value={pyramidHeight}
              onChange={(e) => update('pyramidHeight', parseInt(e.target.value))}
              className="w-full bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-amber-500"
            >
              <option value={3}>3 Katlı Piramit</option>
              <option value={4}>4 Katlı Piramit</option>
              <option value={5}>5 Katlı Piramit</option>
            </select>
          </div>

          {/* İşlem Türü */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Piramit İşlem Kuralı
            </label>
            <select
              value={operation}
              onChange={(e) => update('operation', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-amber-500"
            >
              <option value="addition">Toplama (+)</option>
              <option value="subtraction">Fark / Çıkarma (-)</option>
              <option value="multiplication">Çarpma (×)</option>
            </select>
          </div>
        </div>

        {/* Bulmaca Adedi Slider */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
            <span>A4 Piramit Miktarı</span>
            <span className="text-amber-600 font-black">{puzzleCount} Piramit</span>
          </div>
          <input
            type="range"
            min={1}
            max={6}
            step={1}
            value={puzzleCount}
            onChange={(e) => update('puzzleCount', parseInt(e.target.value))}
            className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
