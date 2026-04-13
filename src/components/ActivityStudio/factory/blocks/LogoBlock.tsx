import React from 'react';

export const LogoBlock: React.FC<{ brand?: string }> = ({ brand = 'OOGMATIK' }) => (
  <div className="rounded-lg border p-2 text-xs">Logo: {brand}</div>
);
