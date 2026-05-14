import React, { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { Timestamp } from 'firebase/firestore';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
export const ChatWindow: React.FC = () => {
    const { activeConversationId, activeThreadId } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!activeConversationId) return;
        setIsLoading(true);

        const unsubscribe = messageService.subscribeToMessages(
            activeConversationId,
            50, // limit
            (msgs) => {
                setMessages(msgs);
                setIsLoading(false);
            },
            (err) => {
                console.error("Mesajlar yüklenemedi:", err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeConversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]); 

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
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-white/40 text-sm py-8">
                            Bu sohbette henüz mesaj yok. İlk mesajı siz gönderin.
                        </div>
                    ) : messages.map(msg => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === user?.id} 
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
