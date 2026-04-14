import React from 'react';
import type { ActivityLibraryItem } from '@/types/activityStudio';

export const LibraryCard: React.FC<{
  item: ActivityLibraryItem;
  onSelect: (id: string) => void;
}> = ({ item, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left transition-all hover:border-amber-500/50 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98]"
    >
      <div className="space-y-2">
        {item.featured && (
          <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-lg">
            Öne Çıkan
          </div>
        )}

        <h4 className="text-lg font-bold text-zinc-100 font-['Lexend'] group-hover:text-amber-400 transition-colors">{item.title}</h4>
        <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">{item.shortDescription}</p>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-block rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-500">
            {item.category}
          </span>
          <span className="inline-block rounded-lg bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
            {item.profiles.join(', ')}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3 mt-2">
          <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber-500/50"></span>
            {item.suggestedDuration} dk
          </span>
          <span className="text-xs font-black text-amber-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all uppercase tracking-tighter">Seç +</span>
        </div>
      </div>
    </button>
  );
};
