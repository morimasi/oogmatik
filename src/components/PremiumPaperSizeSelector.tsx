import React from 'react';
import { PaperSize } from '../utils/printService';

export const PremiumPaperSizeSelector = ({
  value,
  onChange,
}: {
  value: PaperSize;
  onChange: (p: PaperSize) => void;
}) => {
  return (
    <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl shadow-inner border border-zinc-200 dark:border-zinc-700 backdrop-blur-md transition-all">
      <button
        onClick={() => onChange('Extreme_Dikey')}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
          value === 'Extreme_Dikey'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600'
        }`}
        title="Zenginlik Dikey Düzen"
      >
        <i className="fa-solid fa-file-lines"></i> Dikey
      </button>
      <button
        onClick={() => onChange('Extreme_Yatay')}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
          value === 'Extreme_Yatay'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600'
        }`}
        title="Zenginlik Yatay Düzen"
      >
        <i className="fa-solid fa-file-code"></i> Yatay
      </button>
    </div>
  );
};
