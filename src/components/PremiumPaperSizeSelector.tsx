import React from 'react';
import { PaperSize } from '../utils/printService';
import { useToastStore } from '../store/useToastStore';

export const PremiumPaperSizeSelector = ({
  value,
  onChange,
}: {
  value: PaperSize;
  onChange: (p: PaperSize) => void;
}) => {
  const toast = useToastStore();

  return (
    <div
      className="flex items-center bg-white/50 backdrop-blur-sm rounded-xl px-2 py-1.5 border border-white/50 shadow-sm transition-all hover:bg-white/80 group"
      aria-label="Kağıt Boyutu"
    >
      <span
        className="mr-2 text-[10px] font-black text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors"
        title="Kağıt Boyutu"
      >
        <i className="fa-solid fa-ruler-vertical"></i>
      </span>
      <select
        value={value}
        onChange={(e) => {
          const newSize = e.target.value as PaperSize;
          onChange(newSize);
          toast.info(`Kağıt boyutu ${newSize} olarak değiştirildi.`);
        }}
        className="bg-transparent border-none text-[11px] font-black text-[var(--text-primary)] focus:ring-0 cursor-pointer outline-none appearance-none pr-4"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
          backgroundPosition: 'right -4px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.2em 1.2em',
        }}
      >
        <option value="A4">A4</option>
        <option value="Letter">LETTER</option>
        <option value="Legal">LEGAL</option>
      </select>
    </div>
  );
};
