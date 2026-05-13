import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Bell, BellOff, MoreVertical, Info } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { MessageBubble } from '../components/MessageBubble';
import { MessageComposer } from '../components/MessageComposer';
import { FilePreview } from '../components/FilePreview';
import { useMessages } from '../hooks/useMessages';
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
  } = useMessages();
  const { addToast } = useToastStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previewFile, setPreviewFile] = useState<MessageFile | null>(null);

  const conversationMessages = useMemo(
    () => messages.filter((m) => !m.isDeleted || m.isDeleted === undefined).slice(-100),
    [messages]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  const handleEdit = async (msg: Message) => {
    const newContent = prompt('Mesajı düzenle:', msg.content);
    if (newContent && newContent.trim() && newContent !== msg.content) {
      await editMessage(msg.id, newContent.trim());
    }
  };

  const handleDelete = async (msg: Message) => {
    await deleteMessage(msg.id);
  };

  const handleRestore = async (msg: Message) => {
    await restoreMessage(msg.id);
  };

  const handleReply = (msg: Message) => {
    replyToMessage(msg);
  };

  const handleQuote = (msg: Message) => {
    replyToMessage(msg);
  };

  const handleNavigateToMessage = (msg: Message) => {
    const el = document.getElementById(`msg-${msg.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.classList.add('ring-2', 'ring-[var(--accent-color)]', 'rounded-xl');
    setTimeout(() => {
      el?.classList.remove('ring-2', 'ring-[var(--accent-color)]', 'rounded-xl');
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Conversation Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-paper)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] transition-all lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text-primary)] truncate">{contact.name}</p>
            <p className="text-[9px] font-medium text-[var(--text-muted)] capitalize">{contact.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={async () => {
              const confirmed = window.confirm('Tüm konuşmayı silmek istediğinize emin misiniz?');
              if (confirmed) {
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {conversationMessages.map((msg, index) => (
          <div key={msg.id}>
            {/* Date Separator */}
            {index === 0 || new Date(msg.timestamp).toDateString() !== new Date(conversationMessages[index - 1]?.timestamp || '').toDateString() ? (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2">
                  {new Date(msg.timestamp).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </div>
            ) : null}

            <div id={`msg-${msg.id}`}>
              <MessageBubble
                message={msg}
                isOwn={msg.senderId === user?.id}
                onReply={handleReply}
                onQuote={handleQuote}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onFilePreview={setPreviewFile}
                onNavigateToMessage={handleNavigateToMessage}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {conversationMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <p className="text-xs text-[var(--text-muted)] font-medium">
              {contact.name} ile henüz mesajlaşmadınız.
            </p>
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
              İlk mesajı göndererek konuşmayı başlatın.
            </p>
          </div>
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        onSend={sendMessage}
        onSendWithFiles={sendMessageWithFiles}
        disabled={!user?.id}
      />

      {/* File Preview Modal */}
      <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};
