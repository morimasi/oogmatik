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
    <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
        <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500">Onay İşlemleri</h4>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] font-bold text-zinc-400 capitalize">Durum: {status}</span>
      </div>
      <ApprovalTimeline status={status} />
      <DiagnosticLanguageChecker text={sourceText} />
      <RevisionNotes notes={notes} onChange={setNotes} />

      <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-800/50">
        <button
          type="button"
          onClick={() => {
            setStatus('approved');
            onSubmit('approve', notes);
          }}
          className="flex-1 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
        >
          Onayla ve Yayınla
        </button>
        <button
          type="button"
          onClick={() => onSubmit('revise', notes)}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-all active:scale-95"
        >
          Revize İste
        </button>
        <button
          type="button"
          onClick={() => onSubmit('reject', notes)}
          className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
        >
          Reddet
        </button>
      </div>
    </div>
  );
};
