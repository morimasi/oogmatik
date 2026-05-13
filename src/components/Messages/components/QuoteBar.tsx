import { X, Quote } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';

export const QuoteBar: React.FC = () => {
  const { replyToMessage, quoteContent, setReplyToMessage, setQuoteContent } =
    useMessagesStore();

  if (!replyToMessage || !quoteContent) return null;

  return (
    <div className="flex items-start gap-2 px-4 py-2 bg-[var(--accent-muted)] border-b border-[var(--accent-color)]/20 rounded-t-xl">
      <Quote className="w-3.5 h-3.5 text-[var(--accent-color)] mt-1 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest">
            {replyToMessage.senderName}
          </span>
          <span className="text-[8px] text-[var(--text-muted)]">
            {new Date(replyToMessage.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] truncate leading-snug">
          {quoteContent}
        </p>
      </div>
      <button
        onClick={() => {
          setReplyToMessage(null);
          setQuoteContent(null);
        }}
        className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--surface-glass)] text-[var(--text-muted)] shrink-0 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
