import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import { EditableElement, EditableText } from '../../Editable';

interface KavramHaritasiData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  nodes: { id: string; label: string; level: number; isEmpty: boolean }[];
  edges: { from: string; to: string }[];
  settings: Record<string, unknown>;
}

export const KavramHaritasiSheet: React.FC<{ data: KavramHaritasiData }> = ({ data }) => {
  const centerNode = data.nodes?.find((n) => n.id === 'center');
  const level1Nodes = data.nodes?.filter((n) => n.level === 1) || [];

  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title || 'Kavram Haritası'}
        instruction={data.instruction || 'Haritayı tamamla!'}
        note={data.pedagogicalNote}
      />
      <div className="mt-12 relative min-h-[500px] flex justify-center">
        {/* Merkez */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-6 py-3 rounded-full font-bold shadow-xl">
          {centerNode?.label || 'Merkez'}
        </div>
        {/* Dallar */}
        {level1Nodes.map((node, i) => {
          const angle = ((i * 360) / level1Nodes.length - 90) * (Math.PI / 180);
          const radius = 180;
          const x = 400 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);
          return (
            <div
              key={node.id}
              className={`absolute px-4 py-2 rounded-xl font-medium ${node.isEmpty ? 'border-2 border-dashed border-indigo-300 bg-white text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}
              style={{ left: x, top: y }}
            >
              {node.isEmpty ? '_____' : node.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KavramHaritasiSheet;
