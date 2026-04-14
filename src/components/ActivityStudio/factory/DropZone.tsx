import React from 'react';
import type { FactoryComponent } from '@/types/activityStudio';

interface DropZoneProps {
  components: FactoryComponent[];
  onRemove: (id: string) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ components, onRemove }) => {
  return (
    <div className="min-h-40 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 transition-all hover:bg-zinc-950/40">
      {components.length === 0 ? (
        <div className="flex h-full min-h-[140px] items-center justify-center p-4 text-center">
          <p className="text-sm font-medium text-zinc-500 font-['Lexend'] leading-relaxed">
            Bileşen eklemek için soldaki paleti kullanın.<br/>
            <span className="text-xs text-zinc-600">(İçerik buraya eklenecektir)</span>
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {components.map((component) => (
            <li key={component.id} className="group/item flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-800/50 p-3 shadow-lg shadow-black/10 transition-all hover:border-amber-500/20">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 flex items-center justify-center rounded-lg bg-zinc-700 text-[10px] font-bold text-zinc-400 capitalize">{component.type[0]}</span>
                <span className="text-sm font-semibold text-zinc-200 capitalize">{component.type}</span>
              </div>
              <button 
                type="button" 
                onClick={() => onRemove(component.id)} 
                className="rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                Kaldır
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
