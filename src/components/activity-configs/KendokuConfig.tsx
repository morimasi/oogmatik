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
  const puzzleCount = o.puzzleCount || options.puzzleCount || (gridSize >= 5 ? 2 : 4);
  const operationSet = o.operationSet || 'add_sub'; // 'add_only' | 'add_sub' | 'all_ops'
  const cageComplexity = o.cageComplexity || 'medium'; // 'simple' | 'medium' | 'complex'
  const hintRatio = o.hintRatio !== undefined ? o.hintRatio : 15; // 0, 15, 30 percentage of pre-filled cells
  const showOperators = o.showOperators !== false;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-[2rem] border border-purple-100 dark:border-purple-800/30 space-y-4">
        <h4 className="text-xs font-black text-purple-900 dark:text-purple-300 uppercase tracking-widest flex items-center justify-between">
          <span><i className="fa-solid fa-puzzle-piece mr-1 text-purple-600"></i> Kendoku Ultra Yapılandırma</span>
          <span className="text-[9px] bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full font-bold">
            v2.5 Premium
          </span>
        </h4>

        {/* 1. ROW: GRID SIZE & OPERATION SET */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Izgara Matris Boyutu
            </label>
            <select
              value={gridSize}
              onChange={(e) => update('gridSize', parseInt(e.target.value))}
              className="w-full bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value={3}>3×3 (Kolay - 1..3)</option>
              <option value={4}>4×4 (Standart - 1..4)</option>
              <option value={5}>5×5 (Zorlu - 1..5)</option>
              <option value={6}>6×6 (Uzman - 1..6)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Matematiksel İşlem Kümesi
            </label>
            <select
              value={operationSet}
              onChange={(e) => update('operationSet', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="add_only">Sadece Toplama (+)</option>
              <option value="add_sub">Toplama & Çıkarma (+, -)</option>
              <option value="all_ops">Tüm Dört İşlem (+, -, ×, ÷)</option>
            </select>
          </div>
        </div>

        {/* 2. ROW: CAGE COMPLEXITY & HINT CELL RATIO */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Kafes (Cage) Yapısı
            </label>
            <select
              value={cageComplexity}
              onChange={(e) => update('cageComplexity', e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value="simple">Basit 2'li Bloklar</option>
              <option value="medium">Karma (2'li & 3'lü Bloklar)</option>
              <option value="complex">Karmaşık L-Şekilli Bloklar</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Hazır İpucu Rakam Oranı
            </label>
            <select
              value={hintRatio}
              onChange={(e) => update('hintRatio', parseInt(e.target.value))}
              className="w-full bg-white dark:bg-zinc-800 border border-purple-200 dark:border-zinc-700 rounded-xl p-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>%0 (Hiç İpucu Rakam Yok)</option>
              <option value={15}>%15 İpucu Rakam Açık</option>
              <option value={30}>%30 İpucu Rakam Açık (Kolaylaştırılmış)</option>
            </select>
          </div>
        </div>

        {/* 3. ROW: TOGGLES */}
        <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-800/80 rounded-xl border border-purple-100 dark:border-zinc-700">
          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
            Kafes Operatör Sembolünü Göster (+, -, ×, ÷)
          </span>
          <input
            type="checkbox"
            checked={showOperators}
            onChange={(e) => update('showOperators', e.target.checked)}
            className="w-4 h-4 accent-purple-600 cursor-pointer"
          />
        </div>

        {/* 4. ROW: PUZZLE COUNT SLIDER */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase mb-1">
            <span>A4 Sayfa Bulmaca Sayısı</span>
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
