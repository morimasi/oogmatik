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

    const unsubReplies = messageService.subscribeToThreadMessages(
      activeConversationId,
      activeThreadId,
      (msgs) => {
        setReplies(msgs);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    const unsubMessages = messageService.subscribeToMessages(
      activeConversationId,
      100,
      (msgs) => {
        const found = msgs.find(m => m.id === activeThreadId);
        if (found) {
          setOriginalMessage(found);
        }
      },
      () => {}
    );

    return () => {
      unsubReplies();
      unsubMessages();
    };
  }, [activeConversationId, activeThreadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [replies]);

  if (!activeThreadId) return null;

  return (
    <div className="w-full md:w-96 h-full border-l border-white/5 bg-[#0f1115]/95 backdrop-blur-xl flex flex-col shadow-2xl">
      {/* Header */}
      <div className="h-14 md:h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <CornerUpRight className="w-4 h-4 md:w-5 md:h-5 text-accent-primary" />
          <h3 className="font-semibold text-sm md:text-base">Yanıtlar</h3>
          <span className="text-xs text-white/40 ml-1">({replies.length})</span>
        </div>
        <button
          onClick={() => setActiveThreadId(null)}
          className="p-1.5 md:p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-3 md:space-y-4" ref={scrollRef}>
        {/* Original Message */}
        {originalMessage && (
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
              <MessageSquare className="w-3 h-3" />
              <span>Orijinal Mesaj</span>
            </div>
            <MessageBubble
              message={originalMessage}
              isOwn={originalMessage.senderId === user?.id}
            />
          </div>
        )}

        <div className="border-b border-white/5" />

        {/* Replies */}
        <div className="flex flex-col gap-2 md:gap-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-white/30">Henüz yanıt yok. İlk yanıtı siz yazın.</p>
            </div>
          ) : (
            replies.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === user?.id}
              />
            ))
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="bg-[#0f1115] border-t border-white/5 flex-shrink-0">
        <EnhancedComposer />
      </div>
    </div>
  );
};
