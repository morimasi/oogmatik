import React, { useEffect, useRef } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { MessageBubble } from '../Core/MessageBubble';
import { EnhancedComposer } from '../Core/EnhancedComposer';
import { X, CornerUpRight } from 'lucide-react';
import { IMessage } from '../../../types/messaging';
import { Timestamp } from 'firebase/firestore';

const mockThreadMessages: IMessage[] = [
    {
        id: "msg-11",
        conversationId: "conv-1",
        senderId: "Me",
        type: "text",
        text: "Merhaba, dünkü raporu pdf olarak ekleyebilir misiniz? Bu mesaj thread başlatıyor.",
        isDeleted: false,
        readBy: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        id: "msg-11-a",
        conversationId: "conv-1",
        senderId: "user-veli-1",
        type: "text",
        text: "Evet, ben de onu bekliyorum.",
        isDeleted: false,
        threadId: "msg-11",
        readBy: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }
];

export const ThreadPanel: React.FC = () => {
    const { activeThreadId, setActiveThreadId } = useMessageStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeThreadId]);

    if (!activeThreadId) return null;

    // Gerçekte orijinal mesaj activeThreadId kullanılarak messageStore veya servisten getirilecek
    const originalMessage = mockThreadMessages[0]; 
    const replies = mockThreadMessages.slice(1);

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
                {/* Orijinal Mesaj View (Daha sade) */}
                <div className="mb-6 pb-6 border-b border-white/10">
                    <MessageBubble message={originalMessage} isOwn={originalMessage.senderId === 'Me'} />
                </div>

                {/* Yanıtlar */}
                <div className="flex flex-col">
                    <span className="text-xs text-white/40 mb-4 font-inter text-center">
                        {replies.length} Yanıt
                    </span>
                    {replies.map(msg => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === 'Me'} 
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
