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
          className="rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:border-[var(--accent-color)]"
        >
          + {block.label}
        </button>
      ))}
    </div>
  );
};
