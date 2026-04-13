import React from 'react';

export const ScoringBlock: React.FC<{ max?: number }> = ({ max = 100 }) => (
  <div className="rounded-lg border p-2 text-xs">Puanlama: /{max}</div>
);
