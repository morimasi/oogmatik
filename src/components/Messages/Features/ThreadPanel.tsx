import React, { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { MessageBubble } from '../Core/MessageBubble';
import { EnhancedComposer } from '../Core/EnhancedComposer';
import { X, CornerUpRight } from 'lucide-react';
import { IMessage } from '../../../types/messaging';
import { Timestamp } from 'firebase/firestore';

import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
export const ThreadPanel: React.FC = () => {
    const { activeConversationId, activeThreadId, setActiveThreadId } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [replies, setReplies] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!activeConversationId || !activeThreadId) return;

        setIsLoading(true);
        const unsubscribe = messageService.subscribeToThreadMessages(
            activeConversationId,
            activeThreadId,
            (msgs) => {
                setReplies(msgs);
                setIsLoading(false);
            },
            (err) => {
                console.error("Yanıtlar yüklenemedi:", err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeConversationId, activeThreadId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [replies]);

    if (!activeThreadId) return null;

    return (
        <div className="w-80 h-full border-l border-white/5 bg-[#0f1115]/95 backdrop-blur-xl flex flex-col absolute right-0 z-20 shadow-2xl transition-transform animate-in slide-in-from-right-8">
            
            {/* Header */}
            <div className="h-16 px-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <CornerUpRight className="w-5 h-5 text-accent-primary" />
                    <h3 className="font-semibold text-sm">Mesaj Yanıtları</h3>
                </div>
                <button 
                    onClick={() => setActiveThreadId(null)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4" ref={scrollRef}>
                {/* Orijinal Mesaj View (Daha sade) - Bu özellik ileride eklenebilir veya activeThreadMessage objesi state'de tutulabilir */}
                <div className="mb-2 border-b border-white/10"></div>

                {/* Yanıtlar */}
                <div className="flex flex-col">
                    <span className="text-xs text-white/40 mb-4 font-inter text-center">
                        {replies.length} Yanıt
                    </span>
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : replies.map(msg => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === user?.id} 
                        />
                    ))}
                </div>
            </div>

            {/* Composer (Thread için özelleşmiş çalışabilir veya standart composer kullanılabilir) */}
            <div className="bg-[#0f1115]">
                {/* Aslında thread composer'a `threadId` prop'u aktarılarak mesajların "threadId" si ile gönderilmesi sağlanmalıdır. */}
                <EnhancedComposer /> 
            </div>
        </div>
    );
};
