import React, { useState } from 'react';
import { LAYOUT_PRESETS, A4_SIZES } from '../services/compactA4LayoutService';

export interface CompactA4LayoutPanelProps {
  onLayoutChange?: (itemsPerPage: 4 | 6 | 8) => void;
  onPaperSizeChange?: (size: 'A4' | 'LETTER' | 'B5') => void;
  defaultItemsPerPage?: 4 | 6 | 8;
  defaultPaperSize?: 'A4' | 'LETTER' | 'B5';
}

/**
 * Admin panel for A4 compact layout configuration
 * Glassmorphism dark theme, Lexend typography
 */
export const CompactA4LayoutPanel: React.FC<CompactA4LayoutPanelProps> = ({
  onLayoutChange,
  onPaperSizeChange,
  defaultItemsPerPage = 4,
  defaultPaperSize = 'A4',
}: CompactA4LayoutPanelProps) => {
  const [itemsPerPage, setItemsPerPage] = useState<4 | 6 | 8>(defaultItemsPerPage);
  const [paperSize, setPaperSize] = useState<'A4' | 'LETTER' | 'B5'>(defaultPaperSize);

  const handleLayoutChange = (val: 4 | 6 | 8) => {
    setItemsPerPage(val);
    onLayoutChange?.(val);
  };

  const handlePaperChange = (val: 'A4' | 'LETTER' | 'B5') => {
    setPaperSize(val);
    onPaperSizeChange?.(val);
  };

  return (
    <div className="
      bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6
      font-lexend text-white
      max-w-xs
    ">
      <h3 className="text-lg font-semibold mb-4">A4 Layout</h3>

      {/* Items per page selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Items per Page</label>
        <div className="flex gap-2">
          {[4, 6, 8].map((option) => (
            <button
              key={option}
              onClick={() => handleLayoutChange(option as 4 | 6 | 8)}
              className={`
                flex-1 py-2 px-3 rounded-lg transition-all
                font-semibold text-sm
                ${itemsPerPage === option
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Paper size selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Paper Size</label>
        <div className="space-y-2">
          {Object.entries(A4_SIZES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => handlePaperChange(key as 'A4' | 'LETTER' | 'B5')}
              className={`
                w-full py-2 px-3 rounded-lg transition-all text-left text-sm
                ${paperSize === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }
              `}
            >
              {key} ({val.width}×{val.height}mm)
            </button>
          ))}
        </div>
      </div>

      {/* Current settings display */}
      <div className="text-xs text-gray-300 bg-white/5 rounded-lg p-3">
        <p>Items per page: <strong>{itemsPerPage}</strong></p>
        <p>Paper size: <strong>{paperSize}</strong></p>
        <p className="text-xs mt-2">Preset: {`compact${itemsPerPage}`}</p>
      </div>
    </div>
  );
};

CompactA4LayoutPanel.displayName = 'CompactA4LayoutPanel';
