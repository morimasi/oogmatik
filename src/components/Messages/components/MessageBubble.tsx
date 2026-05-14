import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, CheckCheck, Edit3, Trash2, RotateCcw, Reply, Quote,
  XCircle, History, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { useMessages } from '../hooks/useMessages';
import { ReplyThread } from './ReplyThread';
import { FileAttachment } from './FileAttachment';
import type { Message, MessageFile, MessageEditHistoryEntry } from '../../../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply: (msg: Message) => void;
  onQuote: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  onDelete: (msg: Message) => void;
  onRestore?: (msg: Message) => void;
  onFilePreview: (file: MessageFile, allFiles?: MessageFile[]) => void;
  onNavigateToMessage?: (msg: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReply,
  onQuote,
  onDelete,
  onRestore,
  onFilePreview,
  onNavigateToMessage,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showHistory, setShowHistory] = useState(false);

  // Bug fix: useMessagesStore hook olarak kullan, getState() değil
  const allMessages = useMessagesStore((s) => s.messages);
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

  // Silinen mesaj görünümü
  if (message.isDeleted) {
    const deletedAt = message.deletedAt ? new Date(message.deletedAt) : null;
    const daysLeft = deletedAt
      ? 30 - Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-dashed border-[var(--border-color)] opacity-60 max-w-[75%]">
          <XCircle className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
          <span className="text-[10px] text-[var(--text-muted)] italic">Bu mesaj silindi</span>
          {isOwn && onRestore && daysLeft > 0 && (
            <button
              onClick={() => onRestore(message)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--surface-glass)] hover:bg-[var(--accent-muted)] text-[var(--accent-color)] text-[8px] font-black uppercase tracking-widest transition-all"
              title={`${daysLeft} gün içinde geri yükleyebilirsiniz`}
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Geri Yükle ({daysLeft}g)
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[78%] min-w-[100px] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* Gönderen adı (karşı taraf) */}
        {!isOwn && (
          <p className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-1 px-1">
            {message.senderName}
          </p>
        )}

        {/* Yanıtlanan mesaj bağlamı */}
        {message.replyToMessageId && onNavigateToMessage && (
          <div className="mb-1 w-full">
            <ReplyThread
              replyToMessageId={message.replyToMessageId}
              messages={allMessages}
              onMessageClick={onNavigateToMessage}
            />
          </div>
        )}

        {/* Alıntı önizlemesi */}
        {message.quote && (
          <div
            className="mb-1 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border-l-4 border-[var(--accent-color)] w-full cursor-pointer hover:bg-[var(--surface-glass)] transition-colors"
            onClick={() => {
              const quoted = allMessages.find((m) => m.id === message.quote?.messageId);
              if (quoted && onNavigateToMessage) onNavigateToMessage(quoted);
            }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <Quote className="w-2.5 h-2.5 text-[var(--accent-color)]" />
              <span className="text-[8px] font-black text-[var(--accent-color)] uppercase tracking-widest">
                {message.quote.senderName}
              </span>
              <span className="text-[7px] text-[var(--text-muted)]">
                {new Date(message.quote.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] italic line-clamp-2">
              {message.quote.content.substring(0, 120)}
            </p>
          </div>
        )}

        {/* Ana mesaj balonu */}
        <div
          className={`relative px-3.5 py-2.5 rounded-2xl w-full ${
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
                className="w-full bg-transparent text-sm outline-none resize-none border-b border-white/30 pb-1 font-lexend"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); }
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[8px] opacity-60">Enter: kaydet • Esc: iptal</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="text-[9px] font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!editContent.trim()}
                    className="text-[9px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md hover:bg-white/30 transition-all disabled:opacity-30"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap break-words font-lexend">
              {message.content}
            </p>
          )}

          {/* Dosya ekleri */}
          {message.files && message.files.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {message.files.map((file) => (
                <FileAttachment
                  key={file.id}
                  file={file}
                  onPreview={(f) => onFilePreview(f, message.files)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Alt bilgi: zaman + okundu + düzenlendi */}
        <div className={`flex items-center gap-2 mt-0.5 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[8px] font-medium ${isOwn ? 'text-[var(--accent-color)]/60' : 'text-[var(--text-muted)]'}`}>
            {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
          {message.isEdited && (
            <button
              onClick={() => setShowHistory((v) => !v)}
              className={`flex items-center gap-0.5 text-[7.5px] italic transition-colors ${
                isOwn ? 'text-white/50 hover:text-white/80' : 'text-[var(--text-muted)] hover:text-[var(--accent-color)]'
              }`}
              title="Düzenleme geçmişi"
            >
              <History className="w-2.5 h-2.5" />
              düzenlendi
            </button>
          )}
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="w-3 h-3 text-emerald-400" />
            ) : (
              <Check className="w-3 h-3 text-white/40" />
            )
          )}
        </div>

        {/* Düzenleme geçmişi dropdown */}
        <AnimatePresence>
          {showHistory && message.editHistory && message.editHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`overflow-hidden w-full mt-1 px-1 ${isOwn ? 'items-end' : 'items-start'}`}
            >
              <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-2.5 space-y-2">
                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                  Düzenleme Geçmişi
                </p>
                {message.editHistory.slice().reverse().map((entry, i) => (
                  <HistoryEntry key={i} entry={entry} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Eylem butonları */}
        <AnimatePresence>
          {showActions && !editing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-0.5 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <ActionBtn icon={Reply} title="Yanıtla" onClick={() => onReply(message)} />
              <ActionBtn icon={Quote} title="Alıntı Yap" onClick={() => onQuote(message)} />
              {isOwn && (
                <>
                  <ActionBtn
                    icon={Edit3}
                    title="Düzenle"
                    onClick={() => { setEditContent(message.content); setEditing(true); }}
                  />
                  <ActionBtn
                    icon={Trash2}
                    title="Sil"
                    danger
                    onClick={() => onDelete(message)}
                  />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Küçük yardımcı bileşenler ──────────────────────────────────────────────

const ActionBtn: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon: Icon, title, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`p-1 rounded hover:bg-[var(--surface-glass)] transition-all ${
      danger
        ? 'text-[var(--text-muted)] hover:text-rose-500'
        : 'text-[var(--text-muted)] hover:text-[var(--accent-color)]'
    }`}
    title={title}
  >
    <Icon className="w-3 h-3" />
  </button>
);

const HistoryEntry: React.FC<{ entry: MessageEditHistoryEntry }> = ({ entry }) => (
  <div className="border-l-2 border-[var(--border-color)] pl-2">
    <p className="text-[8px] text-[var(--text-muted)] mb-0.5">
      {new Date(entry.editedAt).toLocaleString('tr-TR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })}
    </p>
    <p className="text-[10px] text-[var(--text-secondary)] line-clamp-3">{entry.content}</p>
  </div>
);
