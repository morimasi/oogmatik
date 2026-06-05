import React from 'react';

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[200px] animate-in fade-in duration-700">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-[var(--accent-muted)] rounded-full"></div>
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fa-solid fa-brain text-[var(--accent-color)] text-xs animate-pulse"></i>
      </div>
    </div>
    <p className="mt-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">
      bdmind Hazırlanıyor
    </p>
  </div>
);
