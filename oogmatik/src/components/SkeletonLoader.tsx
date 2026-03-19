
import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-[210mm] mx-auto p-8 bg-white dark:bg-zinc-800 shadow-lg rounded-xl border border-zinc-200 dark:border-zinc-700 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center mb-10">
        <div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-4"></div>
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-6"></div>
        <div className="h-32 w-32 bg-zinc-200 dark:bg-zinc-700 rounded-xl"></div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border-2 border-zinc-100 dark:border-zinc-700/50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="mt-10 flex justify-center">
        <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>
    </div>
  );
};
