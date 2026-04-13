import React from 'react';

interface ApprovalTimelineProps {
  status: 'draft' | 'review' | 'approved';
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ status }) => {
  const labels = ['draft', 'review', 'approved'];

  return (
    <div className="flex gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className={`rounded-full px-3 py-1 text-xs ${label === status ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-paper)] text-[var(--text-secondary)]'}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
};
