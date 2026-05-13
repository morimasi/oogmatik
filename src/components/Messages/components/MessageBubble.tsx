import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Edit3, Trash2, RotateCcw, Reply, Quote, MoreHorizontal, CheckCircle2, XCircle } from 'lucide-react';
import { useMessages } from '../hooks/useMessages';
import { ReplyThread } from './ReplyThread';
import { FileAttachment } from './FileAttachment';
import type { Message, MessageFile } from '../../../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: (msg: Message) => void;
  onQuote: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msg: Message) => void;
  onRestore?: (msg: Message) => void;
  onFilePreview: (file: MessageFile) => void;
  onNavigateToMessage?: (msg: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReply,
  onQuote,
  onEdit,
  onDelete,
  onRestore,
  onFilePreview,
  onNavigateToMessage,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const { editMessage } = useMessages();

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== message.content) {
      await editMessage(message.id, editContent.trim());
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setEditing(false);
  };

  if (message.isDeleted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] opacity-50">
          <XCircle className="w-3 h-3 text-[var(--text-muted)]" />
          <span className="text-[10px] text-[var(--text-muted)] italic">Bu mesaj silindi</span>
          {onRestore && (
            <button
              onClick={() => onRestore(message)}
              className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
              title="Geri Yükle"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[75%] min-w-[120px] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        {!isOwn && (
          <p className="text-[9px] font-bold text-[var(--accent-color)] uppercase tracking-widest mb-1 px-1">
            {message.senderName}
          </p>
        )}

        {/* Reply Thread */}
        {message.replyToMessageId && onNavigateToMessage && (
          <div className="mb-1">
            <ReplyThread
              replyToMessageId={message.replyToMessageId}
              messages={useMessagesStore.getState().messages}
              onMessageClick={onNavigateToMessage}
            />
          </div>
        )}

        {/* Quote Preview */}
        {message.quote && (
          <div className="mb-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-[var(--accent-color)] opacity-80">
            <div className="flex items-center gap-2 mb-0.5">
              <Quote className="w-2.5 h-2.5 text-[var(--accent-color)]" />
              <span className="text-[8px] font-bold text-[var(--accent-color)] uppercase tracking-widest">
                {message.quote.senderName}
              </span>
              <span className="text-[7px] text-[var(--text-muted)]">
                {new Date(message.quote.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] italic line-clamp-2">
              {message.quote.content.substring(0, 120)}
            </p>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`relative px-3.5 py-2.5 rounded-2xl ${
            isOwn
              ? 'bg-[var(--accent-color)] text-white rounded-tr-md'
              : 'bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-md'
          } shadow-sm`}
        >
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent text-sm outline-none resize-none border-b border-white/20 pb-1"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="text-[9px] font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
                >
                  İptal
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editContent.trim()}
                  className="text-[9px] font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30"
                >
                  Kaydet
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* File Attachments */}
          {message.files && message.files.length > 0 && (
            <div className={`mt-2 space-y-1.5 ${isOwn ? '' : ''}`}>
              {message.files.map((file) => (
                <FileAttachment key={file.id} file={file} onPreview={onFilePreview} />
              ))}
            </div>
          )}
        </div>

        {/* Footer: Time + Status */}
        <div className={`flex items-center gap-2 mt-0.5 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[8px] font-medium ${isOwn ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
            {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.isEdited && (
            <span className="text-[7px] text-[var(--text-muted)] italic">(düzenlendi)</span>
          )}
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <Check className="w-3 h-3 text-white/40" />
            )
          )}
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-0.5 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-0.5"
            >
              <button
                onClick={() => onReply(message)}
                className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
                title="Yanıtla"
              >
                <Reply className="w-3 h-3" />
              </button>
              <button
                onClick={() => onQuote(message)}
                className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
                title="Alıntı Yap"
              >
                <Quote className="w-3 h-3" />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => {
                      setEditContent(message.content);
                      setEditing(true);
                    }}
                    className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
                    title="Düzenle"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(message)}
                    className="p-1 rounded hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-rose-500 transition-all"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
