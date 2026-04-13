import React from 'react';

export const QRBlock: React.FC<{ value?: string }> = ({ value }) => (
  <div className="rounded-lg border p-2 text-xs">QR: {value ?? 'link-eklenmedi'}</div>
);
