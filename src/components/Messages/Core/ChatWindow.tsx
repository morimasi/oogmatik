import React, { useEffect, useRef } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { Timestamp } from 'firebase/firestore';

// Mock datalar gerçek servisten çekilecek
const mockMessages: IMessage[] = [
    {
        id: "msg-11",
        conversationId: "conv-1",
        senderId: "Me", // Mock own user
        type: "text",
        text: "Merhaba, dünkü raporu pdf olarak ekleyebilir misiniz?",
        isDeleted: false,
        readBy: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    },
    {
        id: "msg-12",
        conversationId: "conv-1",
        senderId: "user-veli-1",
        type: "text",
        text: "Tabii ki, hemen gönderiyorum.",
        isDeleted: false,
        quoteData: {
            messageId: "msg-11",
            originalSenderId: "Me",
            originalSenderName: "Öğretmen (Siz)",
            originalText: "Merhaba, dünkü raporu pdf olarak ekleyebilir misiniz?"
        },
        readBy: {},
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }
];

export const ChatWindow: React.FC = () => {
    const { activeConversationId, activeThreadId } = useMessageStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeConversationId]); // mock dependency

    if (!activeConversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <span className="text-2xl">👋</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Oogmatik İletişim Merkezi</h2>
                <p className="text-sm text-white/50 text-center max-w-sm">
                    Mesajlaşmaya başlamak için sol taraftaki menüden bir kişi veya grup seçin. 
                    Tüm iletişim kayıtlarınız güvenle şifrelenmektedir.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#0f1115]/90 relative">
            {/* Header */}
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        V
                    </div>
                    <div>
                        <h2 className="text-white font-medium">Veli (Ahmet)</h2>
                        <p className="text-xs text-green-400">Çevrimiçi</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar"
                style={{ 
                    // İsteğe bağlı olarak özel bir background grid veya pattern konabilir
                    backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.02) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            >
                <div className="flex flex-col justify-end min-h-full">
                    {mockMessages.map(msg => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === 'Me'} 
                        />
                    ))}
                </div>
            </div>

            {/* Composer */}
            <div className="z-10 bg-[#0f1115]">
                <EnhancedComposer />
            </div>
        </div>
    );
};
