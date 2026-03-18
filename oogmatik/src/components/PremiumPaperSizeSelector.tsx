import React from 'react';
import { PaperSize } from '../utils/printService';

export const PremiumPaperSizeSelector = ({
  value,
  onChange,
}: {
  value: PaperSize;
  onChange: (p: PaperSize) => void;
}) => {
  // Simple in-page toast for feedback
  const toast = (msg: string) => {
    try {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.position = 'fixed';
      el.style.top = '12px';
      el.style.right = '12px';
      el.style.background = 'rgba(0,0,0,0.85)';
      el.style.color = '#fff';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '6px';
      el.style.fontSize = '12px';
      el.style.zIndex = '9999';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      el.style.maxWidth = '260px';
      el.style.whiteSpace = 'nowrap';
      el.style.textOverflow = 'ellipsis';
      el.style.overflow = 'hidden';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center" aria-label="Kağıt Boyutu">
      <span className="mr-1 text-xs text-[var(--text-muted)]" title="Kağıt Boyutu">
        <i className="fa-solid fa-ruler-vertical"></i>
      </span>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value as PaperSize);
          toast(`Paper size: ${e.target.value}`);
        }}
        className="p-1 rounded bg-white border border-zinc-200 text-xs"
      >
        <option value="A4">A4</option>
        <option value="Letter">Letter</option>
        <option value="Legal">Legal</option>
      </select>
    </div>
  );
};
