import React from 'react';

interface StudentEyeViewProps {
  title: string;
  scenario: string;
}

export const StudentEyeView: React.FC<StudentEyeViewProps> = ({ title, scenario }) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <h3 className="text-xl font-black text-zinc-100 font-['Lexend'] tracking-tight">{title || 'Etkinlik Başlığı'}</h3>
      </div>
      <div className="relative rounded-xl bg-zinc-800/40 p-4 border border-zinc-700/50">
        <p className="text-sm leading-relaxed text-zinc-300 font-medium">
          {scenario || 'Senaryo henüz hazır değil.'}
        </p>
        <div className="absolute -left-1 top-4 h-8 w-1 rounded-full bg-amber-500/50"></div>
      </div>
    </div>
  );
};
