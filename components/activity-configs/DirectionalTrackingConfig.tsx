import React from 'react';
import { GeneratorOptions } from '../../types';

export const DirectionalTrackingConfig: React.FC<{
  options: GeneratorOptions;
  onChange: (k: any, v: any) => void;
}> = ({ options, onChange }) => {
  // Varsayılan değerleri kontrol et
  const currentRows = options.gridRows || options.gridSize || 6;
  const currentCols = options.gridCols || options.gridSize || 6;
  const currentLength = options.codeLength || 5;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Grid Size Configuration */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
            <i className="fa-solid fa-grid-2"></i>
          </div>
          <label className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">
            Matris Yapısı
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Satır Sayısı */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
              <span>Satır (Y)</span>
              <span className="text-indigo-600 font-black bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                {currentRows}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              value={currentRows}
              onChange={(e) => onChange('gridRows', parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Sütun Sayısı */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
              <span>Sütun (X)</span>
              <span className="text-indigo-600 font-black bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                {currentCols}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              value={currentCols}
              onChange={(e) => onChange('gridCols', parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Path Logic Configuration */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
            <i className="fa-solid fa-route"></i>
          </div>
          <label className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">
            Yörünge & İçerik
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
            <span>Hedef Şifre Uzunluğu</span>
            <span className="text-amber-600 font-black bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg">
              {currentLength} Adım
            </span>
          </div>
          <input
            type="range"
            min={3}
            max={15}
            value={currentLength}
            onChange={(e) => onChange('codeLength', parseInt(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase block">İçerik Tipi</label>
          <div className="grid grid-cols-2 gap-2">
            {['letters', 'numbers'].map((type) => (
              <button
                key={type}
                onClick={() => onChange('concept', type)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${options.concept === type ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:border-zinc-200'}`}
              >
                {type === 'letters' ? 'Harfler (Sözel)' : 'Rakamlar (Sayısal)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Layout Configuration */}
      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            Sayfa Başı Soru (A4)
          </span>
          <div className="flex gap-2">
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                onClick={() => onChange('itemCount', n)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${options.itemCount === n ? 'bg-zinc-900 text-white shadow-lg scale-110' : 'bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
