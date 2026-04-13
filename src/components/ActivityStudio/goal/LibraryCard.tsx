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
      className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--surface-secondary)] p-4 text-left transition hover:border-[var(--accent-color)] hover:shadow-lg"
    >
      <div className="space-y-2">
        {item.featured && (
          <div className="inline-block rounded-full bg-[var(--accent-color)] px-2 py-1 text-xs font-semibold text-white">
            Öne Çıkan
          </div>
        )}

        <h4 className="font-semibold text-[var(--text-primary)]">{item.title}</h4>
        <p className="text-xs text-[var(--text-secondary)]">{item.shortDescription}</p>

        <div className="flex flex-wrap gap-2 pt-2">
          <span className="inline-block rounded-full bg-[var(--accent-color)]/10 px-2 py-1 text-xs text-[var(--accent-color)]">
            {item.category}
          </span>
          <span className="inline-block rounded-full bg-[var(--accent-color)]/10 px-2 py-1 text-xs text-[var(--accent-color)]">
            {item.profiles.join(', ')}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2">
          <span className="text-xs text-[var(--text-secondary)]">{item.suggestedDuration} dk</span>
          <span className="text-xs font-medium text-[var(--accent-color)]">Seç</span>
        </div>
      </div>
    </button>
  );
};
