import React from 'react';

interface ApprovalTimelineProps {
  status: 'draft' | 'review' | 'approved';
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ status }) => {
  const labels = ['draft', 'review', 'approved'];

  return (
    <div className="flex items-center gap-3">
      {labels.map((label, index) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${label === status ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-zinc-700'}`}></div>
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${label === status ? 'text-amber-400' : 'text-zinc-600'}`}
            >
              {label === 'draft' ? 'Taslak' : label === 'review' ? 'İnceleme' : 'Yayında'}
            </span>
          </div>
          {index < labels.length - 1 && (
            <div className="h-px w-8 bg-zinc-800"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
