import React, { useMemo } from 'react';
import { KavramHaritasiNode, KavramHaritasiEdge } from '../../../types/verbal';
import { PedagogicalHeader } from '../common';

interface KavramHaritasiSheetData {
  title?: string;
  instruction?: string;
  pedagogicalNote?: string;
  nodes?: KavramHaritasiNode[];
  edges?: KavramHaritasiEdge[];
  examples?: string[];
  settings?: {
    concept?: string;
    layout?: string;
  };
}

interface Props {
  data: KavramHaritasiSheetData | KavramHaritasiSheetData[] | null;
}

function calcPositions(nodes: KavramHaritasiNode[]): Record<string, { x: number; y: number }> {
  const cx = 390;
  const cy = 270;
  const r1 = 150;
  const r2 = 255;
  const positions: Record<string, { x: number; y: number }> = {};

  const center = nodes.find(n => n.level === 0);
  if (center) positions[center.id] = { x: cx, y: cy };

  const l1 = nodes.filter(n => n.level === 1);
  l1.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(l1.length, 1) - Math.PI / 2;
    positions[n.id] = { x: cx + r1 * Math.cos(angle), y: cy + r1 * Math.sin(angle) };
  });

  const l2 = nodes.filter(n => n.level === 2);
  l2.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(l2.length, 1) - Math.PI / 2;
    positions[n.id] = { x: cx + r2 * Math.cos(angle), y: cy + r2 * Math.sin(angle) };
  });

  return positions;
}

interface NodeBoxProps {
  node: KavramHaritasiNode;
  x: number;
  y: number;
}

const NodeBox: React.FC<NodeBoxProps> = ({ node, x, y }) => {
  const isCenter = node.level === 0;
  const isMain = node.level === 1;
  const w = isCenter ? 110 : isMain ? 90 : 75;
  const h = isCenter ? 40 : isMain ? 32 : 26;

  if (node.isEmpty) {
    return (
      <g>
        <rect
          x={x - w / 2}
          y={y - h / 2}
          width={w}
          height={h}
          rx={isCenter ? 20 : 12}
          fill="white"
          stroke="#6366f1"
          strokeWidth={2}
          strokeDasharray="6 3"
        />
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize={isCenter ? 11 : 9}
          fill="#a5b4fc"
          fontFamily="Lexend"
          fontWeight="700"
        >
          ?
        </text>
      </g>
    );
  }

  const fill = isCenter ? '#1e1b4b' : isMain ? '#3730a3' : '#eff6ff';
  const textColor = isCenter || isMain ? 'white' : '#1e1b4b';

  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={isCenter ? 20 : 12}
        fill={fill}
        stroke={isMain ? '#4338ca' : '#c7d2fe'}
        strokeWidth={isCenter ? 3 : 1.5}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize={isCenter ? 11 : isMain ? 9 : 8}
        fill={textColor}
        fontFamily="Lexend"
        fontWeight={isCenter ? '900' : '700'}
      >
        {node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label}
      </text>
    </g>
  );
};

export const KavramHaritasiSheet: React.FC<Props> = ({ data }) => {
  const activity = Array.isArray(data) ? data[0] : data;
  if (!activity) return null;

  const nodes: KavramHaritasiNode[] = activity.nodes || [];
  const edges: KavramHaritasiEdge[] = activity.edges || [];
  const positions = useMemo(() => calcPositions(nodes), [nodes]);

  return (
    <div className="w-full h-full p-4 print:p-2 flex flex-col bg-white font-['Lexend'] text-zinc-900 gap-3 print:gap-2">
      <PedagogicalHeader
        title={activity.title || 'KAVRAM HARİTASI'}
        instruction={activity.instruction || 'Boş kutulara uygun kavramları yazarak haritayı tamamla.'}
        note={activity.pedagogicalNote}
      />

      <div className="flex-1 flex items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-200 overflow-hidden">
        <svg viewBox="0 0 780 540" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#6366f1" />
            </marker>
          </defs>

          {edges.map((edge, i) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            if (!from || !to) return null;
            return (
              <g key={i}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#c7d2fe"
                  strokeWidth={2}
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 4}
                    textAnchor="middle"
                    fontSize={7}
                    fill="#818cf8"
                    fontFamily="Lexend"
                    fontStyle="italic"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;
            return <NodeBox key={node.id} node={node} x={pos.x} y={pos.y} />;
          })}
        </svg>
      </div>

      {activity.examples && activity.examples.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Örnekler:</span>
          {activity.examples.map((ex, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold text-indigo-700"
            >
              {ex}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-[8px] text-zinc-400 font-bold uppercase tracking-widest border-t border-zinc-100 pt-2 print:pt-1">
        <span>{activity.settings?.concept || 'Kavram Haritası'}</span>
        <span>Ad: _________________ | Tarih: _________</span>
      </div>
    </div>
  );
};
