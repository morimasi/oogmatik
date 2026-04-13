
import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-[210mm] mx-auto p-8 shadow-lg rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
      {/* Header Skeleton */}
      <div className="flex flex-col items-center mb-10">
        <div className="h-8 w-2/3 rounded-lg mb-4" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
        <div className="h-4 w-1/2 rounded-lg mb-6" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
        <div className="h-32 w-32 rounded-xl" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border-2 rounded-xl" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
                <div className="h-3 w-1/2 rounded" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="mt-10 flex justify-center">
        <div className="h-4 w-1/4 rounded" style={{ backgroundColor: 'var(--surface-elevated)' }}></div>
      </div>
    </div>
  );
};
