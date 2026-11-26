import React from 'react';
import { A4_WIDTH, A4_HEIGHT } from '../types/editor.types';

interface A4RulerProps {
  scale?: number;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * A4 Milimetrik & Piksel Cetveli.
 * Öğretmen ve içerik üreticilerinin A4 baskı sınırlarını, kenar boşluklarını
 * ve öğelerin hizasını hassas şekilde takip etmesini sağlar.
 */
export const A4Ruler: React.FC<A4RulerProps> = ({
  scale = 1,
  orientation = 'horizontal',
}) => {
  const isHorizontal = orientation === 'horizontal';
  const length = isHorizontal ? A4_WIDTH : A4_HEIGHT;
  const step = 50; // her 50px'de bir ana çizgi (~13mm)
  const ticksCount = Math.floor(length / step);

  const ticks = Array.from({ length: ticksCount + 1 }, (_, i) => i * step);

  if (isHorizontal) {
    return (
      <div
        className="pointer-events-none relative h-5 select-none border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80 text-[7px] font-mono text-[var(--text-muted)] backdrop-blur"
        style={{ width: length * scale }}
        aria-hidden
      >
        {ticks.map((val) => (
          <div
            key={val}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: val * scale }}
          >
            <span className="-translate-x-1/2 leading-none pb-0.5">{val}</span>
            <div className="h-2 w-px bg-[var(--text-muted)]/50" />
          </div>
        ))}
        {/* Ara 10px çizgileri */}
        {Array.from({ length: Math.floor(length / 10) }, (_, i) => i * 10)
          .filter((v) => v % step !== 0)
          .map((val) => (
            <div
              key={val}
              className="absolute bottom-0 h-1 w-px bg-[var(--text-muted)]/25"
              style={{ left: val * scale }}
            />
          ))}
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none relative w-5 select-none border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/80 text-[7px] font-mono text-[var(--text-muted)] backdrop-blur"
      style={{ height: length * scale }}
      aria-hidden
    >
      {ticks.map((val) => (
        <div
          key={val}
          className="absolute right-0 flex items-center"
          style={{ top: val * scale }}
        >
          <span className="-translate-y-1/2 leading-none pr-0.5">{val}</span>
          <div className="h-px w-2 bg-[var(--text-muted)]/50" />
        </div>
      ))}
      {/* Ara 10px çizgileri */}
      {Array.from({ length: Math.floor(length / 10) }, (_, i) => i * 10)
        .filter((v) => v % step !== 0)
        .map((val) => (
          <div
            key={val}
            className="absolute right-0 h-px w-1 bg-[var(--text-muted)]/25"
            style={{ top: val * scale }}
          />
        ))}
    </div>
  );
};
