import React, { useState } from 'react';
import { ApprovalTimeline } from './ApprovalTimeline';
import { RevisionNotes } from './RevisionNotes';
import { DiagnosticLanguageChecker } from './DiagnosticLanguageChecker';

interface ApprovalPanelProps {
  sourceText: string;
  onSubmit: (action: 'approve' | 'revise' | 'reject', note: string) => void;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({ sourceText, onSubmit }) => {
  const [status, setStatus] = useState<'draft' | 'review' | 'approved'>('review');
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-4">
      <ApprovalTimeline status={status} />
      <DiagnosticLanguageChecker text={sourceText} />
      <RevisionNotes notes={notes} onChange={setNotes} />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setStatus('approved');
            onSubmit('approve', notes);
          }}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Onaya Gonder
        </button>
        <button
          type="button"
          onClick={() => onSubmit('revise', notes)}
          className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white"
        >
          Revize Istegi
        </button>
        <button
          type="button"
          onClick={() => onSubmit('reject', notes)}
          className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Reddet
        </button>
      </div>
    </div>
  );
};
