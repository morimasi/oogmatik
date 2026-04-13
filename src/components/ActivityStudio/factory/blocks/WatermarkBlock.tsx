import React from 'react';

export const WatermarkBlock: React.FC<{ text?: string }> = ({ text = 'OOGMATIK' }) => (
  <div className="rounded-lg border p-2 text-xs">Filigran: {text}</div>
);
