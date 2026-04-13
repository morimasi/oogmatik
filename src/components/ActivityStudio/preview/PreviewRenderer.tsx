import React from 'react';
import { StudentEyeView } from './StudentEyeView';

interface PreviewRendererProps {
  title: string;
  scenario: string;
  pedagogicalNote: string;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ title, scenario, pedagogicalNote }) => {
  return (
    <div className="space-y-4">
      <StudentEyeView title={title} scenario={scenario} />
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-4">
        <h4 className="text-sm font-bold">Ogretmen Notu</h4>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{pedagogicalNote}</p>
      </div>
    </div>
  );
};
