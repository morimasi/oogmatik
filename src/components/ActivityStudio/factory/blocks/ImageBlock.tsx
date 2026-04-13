import React from 'react';

export const ImageBlock: React.FC<{ src?: string }> = ({ src }) => (
  <div className="rounded-lg border p-2 text-xs">{src ? `Gorsel: ${src}` : 'Gorsel Blogu'}</div>
);
