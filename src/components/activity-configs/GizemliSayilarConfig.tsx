import React from 'react';
import { GeneratorOptions } from '../../types';

interface ConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const GizemliSayilarConfig = ({ options, onChange }: ConfigProps) => {
  const o = (options as any).numberLogicRiddles || {};

  const update = (key: string, val: unknown) => {
    onChange('numberLogicRiddles' as any, { ...o, [key]: val });
    onChange(key as any, val);
  };

  const itemCount = o.itemCount || options.itemCount || 6;
  const aestheticMode = o.aestheticMode || 'standard';

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
        <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3">
          <i className="fa-solid fa-user-secret mr-1 text-indigo-600"></i> Gizemli Sayılar Yapılandırması
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Zorluk / Sayı Aralığı */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Sayı Aralığı (Zorluk)
            </label>
            <select
              value={options.difficulty || 'Orta'}
              onChange={(e) => onChange('difficulty', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Kolay">10 - 50 Arası (Başlangıç)</option>
              <option value="Orta">10 - 100 Arası (Standart)</option>
              <option value="Zor">10 - 200 Arası (Zorlu)</option>
            </select>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Görsel Tema
            </label>
            <select
              value={aestheticMode}
              onChange={(e) => update('aestheticMode', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="standard">Standart Temiz</option>
              <option value="detective">Dedektif Teması</option>
              <option value="neon">Neon Gece</option>
              <option value="cyber">Cyberpunk</option>
            </select>
          </div>
        </div>

        {/* Bulmaca Adedi Slider */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
            <span>A4 Soru Miktarı</span>
            <span className="text-indigo-600 font-black">{itemCount} Gizemli Bulmaca</span>
          </div>
          <input
            type="range"
            min={2}
            max={8}
            step={2}
            value={itemCount}
            onChange={(e) => update('itemCount', parseInt(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
