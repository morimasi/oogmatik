import React from 'react';
import type { FactoryBlockType } from '@/types/activityStudio';

const BLOCKS: Array<{ type: FactoryBlockType; label: string }> = [
  { type: 'text', label: 'Metin' },
  { type: 'image', label: 'Gorsel' },
  { type: 'quiz', label: 'Soru' },
  { type: 'timer', label: 'Zamanlayici' },
  { type: 'scoring', label: 'Puan' },
  { type: 'qr', label: 'QR' },
  { type: 'watermark', label: 'Filigran' },
  { type: 'logo', label: 'Logo' },
];

interface ComponentPaletteProps {
  onAdd: (type: FactoryBlockType) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAdd }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {BLOCKS.map((block) => (
        <button
          key={block.type}
          type="button"
          onClick={() => onAdd(block.type)}
          className="rounded-xl border border-zinc-700 bg-zinc-800/40 px-3 py-2.5 text-left text-sm text-zinc-400 hover:border-amber-500/50 hover:bg-zinc-800 hover:text-amber-400 transition-all font-medium active:scale-95"
        >
          <span className="mr-1 text-amber-500/50 group-hover:text-amber-500">+</span> {block.label}
        </button>
      ))}
    </div>
  );
};
