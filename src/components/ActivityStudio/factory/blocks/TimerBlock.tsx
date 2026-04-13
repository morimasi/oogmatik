import React from 'react';

export const TimerBlock: React.FC<{ seconds?: number }> = ({ seconds = 120 }) => (
  <div className="rounded-lg border p-2 text-xs">Zamanlayici: {seconds} sn</div>
);
