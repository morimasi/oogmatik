import { useState } from 'react';
import { Check, X, Edit3, Trash2, RotateCcw, Reply, Quote, MoreHorizontal } from 'lucide-react';

interface MessageActionsProps {
  isOwn: boolean;
  isDeleted?: boolean;
  isEdited?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onReply: () => void;
  onQuote: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  isOwn,
  isDeleted,
  isEdited,
  onEdit,
  onDelete,
  onRestore,
  onReply,
  onQuote,
}) => {
  const [open, setOpen] = useState(false);

  if (isDeleted) {
    return (
      <div className="flex items-center gap-1">
        {onRestore && (
          <button
            onClick={onRestore}
            className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
            title="Geri Yükle"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onReply}
          className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
          title="Yanıtla"
        >
          <Reply className="w-3 h-3" />
        </button>
        <button
          onClick={onQuote}
          className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
          title="Alıntı Yap"
        >
          <Quote className="w-3 h-3" />
        </button>
        {isOwn && (
          <>
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
              title="Düzenle"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-rose-500 transition-all"
              title="Sil"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
