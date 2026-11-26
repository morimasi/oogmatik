import React from 'react';
import { WHITEBOARD_WIDTH, WHITEBOARD_HEIGHT, type LayerInfo } from '../types/editor.types';

interface WhiteboardMinimapProps {
  layers: LayerInfo[];
  zoom: number;
  onClose?: () => void;
}

/**
 * Sınırsız Tahta Canlı Mini Haritası (Miro / Figma Style Minimap).
 *
 * 3000×2000 piksellik tahta üzerindeki tüm nesnelerin (kartlar, notlar,
 * şekiller, çizimler) konumlarını minyatür olarak gösterir.
 */
export const WhiteboardMinimap: React.FC<WhiteboardMinimapProps> = ({
  layers,
  zoom,
}) => {
  const mapWidth = 150;
  const mapHeight = (mapWidth * WHITEBOARD_HEIGHT) / WHITEBOARD_WIDTH; // 100px
  const scaleX = mapWidth / WHITEBOARD_WIDTH;
  const scaleY = mapHeight / WHITEBOARD_HEIGHT;

  return (
    <div
      className="pointer-events-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)]/90 p-1.5 shadow-xl backdrop-blur select-none"
      aria-label="Tahta mini haritası"
    >
      <div className="flex items-center justify-between pb-1 px-0.5 text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)]">
        <span>Harita</span>
        <span>%{Math.round(zoom * 100)}</span>
      </div>
      <div
        className="relative overflow-hidden rounded-lg border border-[var(--border-color)] bg-slate-100"
        style={{ width: mapWidth, height: mapHeight }}
      >
        {/* Nesnelerin minyatürleri */}
        {layers.map((layer) => {
          const x = Math.max(0, Math.min(mapWidth, layer.x * scaleX));
          const y = Math.max(0, Math.min(mapHeight, layer.y * scaleY));
          const w = Math.max(2, Math.min(mapWidth, layer.width * scaleX));
          const h = Math.max(2, Math.min(mapHeight, layer.height * scaleY));

          return (
            <div
              key={layer.id}
              className="absolute rounded-[1px] bg-indigo-500/60"
              style={{
                left: x,
                top: y,
                width: w,
                height: h,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
