import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Quote, Loader2 } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import { FilePreview } from '../components/FilePreview';
import { useMessages } from '../hooks/useMessages';
import { useTextSelection } from '../hooks/useTextSelection';
import { useToastStore } from '../../../store/useToastStore';
import type { Message, MessageFile } from '../../../types';
import type { Contact } from '../types';

interface ConversationPanelProps {
  contact: Contact;
  onBack: () => void;
}

export const ConversationPanel: React.FC<ConversationPanelProps> = ({ contact, onBack }) => {
  const {
    messages,
    user,
    sendMessage,
    sendMessageWithFiles,
    editMessage,
    deleteMessage,
    restoreMessage,
    replyToMessage,
    clearConversation,
    loading,
  } = useMessages();
  const { addToast } = useToastStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [previewFile, setPreviewFile] = useState<MessageFile | null>(null);
  const [previewFiles, setPreviewFiles] = useState<MessageFile[]>([]);

  // Deep link: vurgulanan mesajı takip et
  const highlightedMessageId = useMessagesStore((s) => s.highlightedMessageId);
  const setHighlightedMessageId = useMessagesStore((s) => s.setHighlightedMessageId);

  const { selection, setCurrentMessageId, clearSelection, quoteMessage } =
    useTextSelection(messagesContainerRef);

  // Silinen mesajları filtrele (son 100)
  const conversationMessages = useMemo(
    () => messages.filter((m) => !m.isDeleted).slice(-100),
    [messages]
  );

  // Tarih gruplarına böl
  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: Message[] }> = [];
    conversationMessages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      const last = groups[groups.length - 1];
      if (last && last.date === date) {
        last.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [conversationMessages]);

  // Yeni mesaj gelince sona scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  // Deep link: highlightedMessageId değişince o mesaja scroll ve vurgula
  useEffect(() => {
    if (!highlightedMessageId) return;
    const el = document.getElementById(`msg-${highlightedMessageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedMessageId]);

  const handleFilePreview = (file: MessageFile, allFiles?: MessageFile[]) => {
    setPreviewFile(file);
    setPreviewFiles(allFiles ?? [file]);
  };

  const handleQuoteFromSelection = () => {
    const { message: msg, selectedText } = quoteMessage(messages);
    if (msg && selectedText) {
      replyToMessage(msg);
      useMessagesStore.getState().setQuoteContent(selectedText);
    }
  };

  const handleNavigateToMessage = (msg: Message) => {
    const el = document.getElementById(`msg-${msg.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(msg.id);
      setTimeout(() => setHighlightedMessageId(null), 2500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Konuşma başlığı */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-paper)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] transition-all lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[var(--text-primary)] truncate">{contact.name}</p>
            <p className="text-[9px] font-medium text-[var(--text-muted)] capitalize">{contact.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              if (window.confirm('Tüm konuşmayı silmek istediğinize emin misiniz?')) {
                await clearConversation();
              }
            }}
            className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-rose-500/10 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 transition-all"
            title="Konuşmayı Temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mesaj listesi */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-color)]" />
          </div>
        )}

        {!loading && groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Tarih ayırıcı */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[var(--border-color)]" />
              <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 whitespace-nowrap">
                {new Date(group.date).toLocaleDateString('tr-TR', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              <div className="flex-1 h-px bg-[var(--border-color)]" />
            </div>

            {group.messages.map((msg) => {
              const isHighlighted = highlightedMessageId === msg.id;
              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  onMouseEnter={() => setCurrentMessageId(msg.id)}
                  className={`transition-all duration-300 rounded-xl ${
                    isHighlighted
                      ? 'ring-2 ring-[var(--accent-color)] ring-offset-2 ring-offset-[var(--bg-primary)] bg-[var(--accent-muted)]/30'
                      : ''
                  }`}
                >
                  <MessageBubble
                    message={msg}
                    isOwn={msg.senderId === user?.id}
                    onReply={replyToMessage}
                    onQuote={replyToMessage}
                    onEdit={async () => {}}
                    onDelete={async (m) => deleteMessage(m.id)}
                    onRestore={async (m) => restoreMessage(m.id)}
                    onFilePreview={handleFilePreview}
                    onNavigateToMessage={handleNavigateToMessage}
                  />
                </div>
              );
            })}
          </div>
        ))}

        {!loading && conversationMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-color)]/20 to-purple-500/20 border border-[var(--border-color)] flex items-center justify-center">
              <span className="text-lg">{contact.name.charAt(0)}</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {contact.name} ile henüz mesajlaşmadınız.
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              İlk mesajı göndererek konuşmayı başlatın.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Seçili metinden alıntı araç çubuğu */}
      {selection.visible && selection.selectedText && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed z-50 flex items-center gap-1 px-2 py-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg shadow-xl"
          style={{
            top: Math.max(selection.top, 10),
            left: Math.max(selection.left - 60, 10),
          }}
        >
          <button
            onClick={handleQuoteFromSelection}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[var(--accent-muted)] text-[var(--accent-color)] text-[10px] font-bold transition-colors"
          >
            <Quote className="w-3 h-3" />
            Alıntı Yap
          </button>
          <button
            onClick={clearSelection}
            className="px-2 py-1 rounded-md hover:bg-[var(--surface-glass)] text-[var(--text-muted)] text-[10px] font-bold transition-colors"
          >
            İptal
          </button>
        </motion.div>
      )}

      {/* Mesaj yazma alanı (Composer) */}
      <MessageComposer
        onSend={sendMessage}
        onSendWithFiles={sendMessageWithFiles}
        disabled={!user?.id}
      />

      {/* Dosya önizleme modali */}
      <FilePreview
        file={previewFile}
        allFiles={previewFiles.length > 1 ? previewFiles : undefined}
        onClose={() => { setPreviewFile(null); setPreviewFiles([]); }}
      />
    </div>
  );
};
