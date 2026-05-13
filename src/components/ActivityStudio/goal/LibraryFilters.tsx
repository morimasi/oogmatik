import React from 'react';
import type { ActivityLibraryQuery } from '../../../types/activityStudio';

export const LibraryFilters: React.FC<{
  query: ActivityLibraryQuery;
  onQueryChange: (query: ActivityLibraryQuery) => void;
}> = ({ query, onQueryChange }) => {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md">
      <input
        type="text"
        placeholder="Etkinlik ara..."
        value={query.search ?? ''}
        onChange={(event) =>
          onQueryChange({
            ...query,
            search: event.target.value || undefined,
          })
        }
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
      />
    </div>
  );
};
