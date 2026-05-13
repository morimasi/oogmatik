import { MessageSquare, ChevronRight } from 'lucide-react';
import type { Message } from '../../../types';

interface ReplyThreadProps {
  replyToMessageId?: string;
  messages: Message[];
  onMessageClick: (msg: Message) => void;
}

export const ReplyThread: React.FC<ReplyThreadProps> = ({
  replyToMessageId,
  messages,
  onMessageClick,
}) => {
  if (!replyToMessageId) return null;
  const parentMsg = messages.find((m) => m.id === replyToMessageId);
  if (!parentMsg || parentMsg.isDeleted) return null;

  return (
    <button
      onClick={() => onMessageClick(parentMsg)}
      className="flex items-center gap-2 mb-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--surface-glass)] transition-colors text-left w-full group"
    >
      <MessageSquare className="w-3 h-3 text-[var(--accent-color)] shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold text-[var(--accent-color)] uppercase tracking-widest">
          {parentMsg.senderName}
        </span>
        <p className="text-[10px] text-[var(--text-secondary)] truncate leading-snug">
          {parentMsg.content.substring(0, 80)}
        </p>
      </div>
      <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};
