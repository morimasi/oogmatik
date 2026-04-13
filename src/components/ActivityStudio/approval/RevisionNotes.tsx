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
      placeholder="Revizyon notu yazin"
      className="min-h-28 w-full rounded-xl border border-[var(--border-color)] p-3 text-sm"
    />
  );
};
