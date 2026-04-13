import React, { useMemo, useState } from 'react';
import type { ActivityLibraryQuery } from '@/types/activityStudio';
import { getLibraryActivities } from '@/services/activityStudioLibraryService';
import { LibraryFilters } from './LibraryFilters';
import { LibraryCard } from './LibraryCard';

export const LibraryExplorer: React.FC<{
  onSelectItem: (id: string) => void;
}> = ({ onSelectItem }) => {
  const [query, setQuery] = useState<ActivityLibraryQuery>({});

  const results = useMemo(() => getLibraryActivities(query), [query]);

  return (
    <div className="space-y-4">
      <LibraryFilters query={query} onQueryChange={setQuery} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {results.map((item) => (
          <LibraryCard key={item.id} item={item} onSelect={onSelectItem} />
        ))}
      </div>
      {results.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--border-color)] p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">Uygun etkinlik bulunamadı. Filtreleri değiştirmeyi deneyin.</p>
        </div>
      )}
    </div>
  );
};
