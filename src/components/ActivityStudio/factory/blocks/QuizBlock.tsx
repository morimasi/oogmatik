import React from 'react';

export const QuizBlock: React.FC<{ question?: string }> = ({ question }) => (
  <div className="rounded-lg border p-2 text-xs">{question ?? 'Soru Blogu'}</div>
);
