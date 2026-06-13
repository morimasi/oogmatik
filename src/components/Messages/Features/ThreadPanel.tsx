import React, { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { MessageBubble } from '../Core/MessageBubble';
import { EnhancedComposer } from '../Core/EnhancedComposer';
import { X, CornerUpRight, MessageSquare } from 'lucide-react';
import { Message } from '../../../types/messaging';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';

export const ThreadPanel: React.FC = () => {
  const { activeConversationId, activeThreadId, setActiveThreadId } = useMessageStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replies, setReplies] = useState<Message[]>([]);
  const [originalMessage, setOriginalMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeConversationId || !activeThreadId) return;
    setIsLoading(true);
    const unsubReplies = messageService.subscribeToThreadMessages(activeConversationId, activeThreadId, (msgs) => { setReplies(msgs); setIsLoading(false); }, () => setIsLoading(false));
    const unsubMessages = messageService.subscribeToMessages(activeConversationId, 100, (msgs) => { const f = msgs.find(m => m.id === activeThreadId); if (f) setOriginalMessage(f); }, () => {});
    return () => { unsubReplies(); unsubMessages(); };
  }, [activeConversationId, activeThreadId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [replies]);
  if (!activeThreadId) return null;

  return (
    <div className="w-full md:w-[320px] h-full flex flex-col">
      <div className="h-12 px-3 border-b border-[var(--border-color)] flex items-center justify-between flex-shrink-0 bg-[var(--bg-paper)]">
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <CornerUpRight className="w-4 h-4 text-[var(--accent-color)]" />
          <h3 className="font-semibold text-[13px]">Yanıtlar</h3>
          <span className="text-[10px] text-[var(--text-secondary)] font-medium bg-[var(--bg-default)] px-1.5 py-0.5 rounded-md">{replies.length}</span>
        </div>
        <button onClick={() => setActiveThreadId(null)} className="p-1.5 rounded-md hover:bg-[var(--bg-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-2.5 bg-[var(--bg-default)]" ref={scrollRef}>
        {originalMessage && (
          <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]"><MessageSquare className="w-3 h-3 text-[var(--accent-color)]" /><span>Orijinal Mesaj</span></div>
            <MessageBubble message={originalMessage} isOwn={originalMessage.senderId === user?.id} />
          </div>
        )}
        {isLoading ? (
          <div className="flex justify-center py-6"><div className="w-4 h-4 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" /></div>
        ) : replies.length === 0 ? (
          <div className="text-center py-6"><p className="text-[10px] text-[var(--text-secondary)]">Henüz yanıt yok</p></div>
        ) : replies.map(msg => <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />)}
      </div>
      <div className="flex-shrink-0"><EnhancedComposer /></div>
    </div>
  );
};
