import React from 'react';
import type { LayerInfo } from '../types/editor.types';
import type { RemotePeer } from '../collaboration/collabModel';

interface LiveCursorsOverlayProps {
  peers: RemotePeer[];
  /** Etkin yüzey: sayfa kimliği veya `null` (sınırsız tahta). */
  surfaceId: string | null;
  layers: LayerInfo[];
  /** Tahtada Fabric pan/zoom nedeniyle seçim dikdörtgenleri gösterilmez. */
  showSelection: boolean;
}

/**
 * Ortak çalışma katmanı — canlı imleçler ve uzak seçim çerçeveleri.
 *
 * React overlay olarak çizilir; Fabric tuvaline nesne eklenmediği için PDF/PNG
 * çıktıları ve geri alma geçmişi bu katmandan etkilenmez. Tamamen
 * `pointer-events: none` olduğundan düzenlemeyi engellemez.
 */
export const LiveCursorsOverlay = ({
  peers,
  surfaceId,
  layers,
  showSelection,
}: LiveCursorsOverlayProps) => {
  const visiblePeers = peers.filter((peer) => peer.pageId === surfaceId);
  if (!visiblePeers.length) return null;

  const layerMap = new Map(layers.map((layer) => [layer.id, layer]));

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      aria-hidden="true"
      data-testid="hybrid-live-cursors"
    >
      {showSelection &&
        visiblePeers.map((peer) =>
          peer.selectedIds.map((layerId) => {
            const layer = layerMap.get(layerId);
            if (!layer) return null;
            return (
              <div
                key={`${peer.clientId}:${layerId}`}
                className="absolute rounded-[3px] border border-dashed"
                style={{
                  left: layer.x,
                  top: layer.y,
                  width: layer.width,
                  height: layer.height,
                  borderColor: peer.color,
                  transform: layer.angle ? `rotate(${layer.angle}deg)` : undefined,
                }}
              />
            );
          })
        )}

      {visiblePeers.map((peer) => {
        const cursor = peer.cursor;
        if (!cursor) return null;
        return (
          <div
            key={peer.clientId}
            className="absolute flex items-start gap-0.5 transition-[left,top] duration-75 ease-out"
            style={{ left: cursor.x, top: cursor.y, transform: 'translate(-1px, -1px)' }}
          >
            <svg width="13" height="17" viewBox="0 0 14 18" fill="none" aria-hidden="true">
              <path
                d="M1.5 1.2 12 9.1 7.1 10 4.9 16.1z"
                fill={peer.color}
                stroke="#ffffff"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className="max-w-[140px] truncate rounded-md px-1.5 py-0.5 text-[8px] font-black leading-tight text-white shadow-sm"
              style={{ backgroundColor: peer.color }}
            >
              {peer.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LiveCursorsOverlay;
