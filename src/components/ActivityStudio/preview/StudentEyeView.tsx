import React from 'react';

interface StudentEyeViewProps {
  title: string;
  scenario: string;
}

export const StudentEyeView: React.FC<StudentEyeViewProps> = ({ title, scenario }) => {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-white p-4">
      <h3 className="text-lg font-bold">{title || 'Etkinlik Basligi'}</h3>
      <p className="mt-2 text-sm leading-7">{scenario || 'Senaryo henuz hazir degil.'}</p>
    </div>
  );
};
