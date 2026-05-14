import React, { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { MessageBubble } from '../Core/MessageBubble';
import { EnhancedComposer } from '../Core/EnhancedComposer';
import { X, CornerUpRight, MessageSquare } from 'lucide-react';
import { IMessage } from '../../../types/messaging';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';

export const ThreadPanel: React.FC = () => {
  const { activeConversationId, activeThreadId, setActiveThreadId } = useMessageStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [replies, setReplies] = useState<IMessage[]>([]);
  const [originalMessage, setOriginalMessage] = useState<IMessage | null>(null);
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
    <div className="w-full md:w-80 h-full border-l border-white/5 bg-[#0a0a0a] flex flex-col shadow-2xl">
      <div className="h-12 px-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <CornerUpRight className="w-4 h-4 text-accent-primary" />
          <h3 className="font-semibold text-sm">Yanıtlar</h3>
          <span className="text-[11px] text-white/30">({replies.length})</span>
        </div>
        <button onClick={() => setActiveThreadId(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3" ref={scrollRef}>
        {originalMessage && (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-white/30"><MessageSquare className="w-3 h-3" /><span>Orijinal</span></div>
            <MessageBubble message={originalMessage} isOwn={originalMessage.senderId === user?.id} />
          </div>
        )}
        <div className="border-b border-white/5" />
        {isLoading ? (
          <div className="flex justify-center py-6"><div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : replies.length === 0 ? (
          <div className="text-center py-6"><p className="text-[11px] text-white/30">Henüz yanıt yok</p></div>
        ) : replies.map(msg => <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === user?.id} />)}
      </div>
      <div className="border-t border-white/5 flex-shrink-0"><EnhancedComposer /></div>
    </div>
  );
};
