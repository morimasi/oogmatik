import React from 'react';

interface RevisionNotesProps {
  notes: string;
  onChange: (value: string) => void;
}

export const RevisionNotes: React.FC<RevisionNotesProps> = ({ notes, onChange }) => {
  return (
    <textarea
      value={notes}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Revizyon notu yazın..."
      className="min-h-28 w-full rounded-xl border border-zinc-700 bg-zinc-800/40 p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-['Lexend']"
    />
  );
};
