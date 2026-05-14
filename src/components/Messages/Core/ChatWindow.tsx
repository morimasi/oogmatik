import React, { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage, IConversation } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
import { authService } from '../../../services/authService';
import { User } from '../../../types';
import { Users, Info, Settings, Search, ChevronLeft } from 'lucide-react';

export const ChatWindow: React.FC = () => {
    const { activeConversationId, setActiveConversationId } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<IConversation | null>(null);
    const [recipient, setRecipient] = useState<User | null>(null);

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

        // Fetch Conversation Details
        messageService.getConversation(activeConversationId).then(conv => {
            setConversation(conv);
            if (conv.type === 'direct' && user) {
                const otherId = conv.participants.find(p => p.userId !== user.id)?.userId;
                if (otherId) {
                    authService.getMultipleUsers([otherId]).then(users => {
                        if (users.length > 0) setRecipient(users[0]);
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [activeConversationId, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]); 

    if (!activeConversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0f1115] relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                <div className="relative z-10 text-center px-6">
                    <div className="w-24 h-24 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mb-6 mx-auto animate-pulse">
                        <Users className="w-10 h-10 text-accent-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Oogmatik İletişim Hattı</h2>
                    <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                        Öğretmenler, veliler ve uzmanlar arasında etkileşimli iletişim için bir konuşma seçin.
                    </p>
                </div>
            </div>
        );
    }

    const displayName = conversation?.type === 'group' ? (conversation.title || 'Grup') : (recipient?.name || 'Yükleniyor...');
    const displayAvatar = recipient?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e11] relative overflow-hidden">
            {/* Header - Telegram Style */}
            <div className="h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between bg-[#0f1115]/80 backdrop-blur-xl z-20 sticky top-0 shadow-2xl">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveConversationId(null)}
                        className="p-2 -ml-2 md:hidden hover:bg-white/5 rounded-full text-white/60 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="relative">
                        <img 
                            src={displayAvatar} 
                            alt={displayName} 
                            className="w-10 h-10 rounded-full border border-white/10 object-cover bg-white/5 shadow-lg"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f1115] rounded-full shadow-sm"></div>
                    </div>
                    
                    <div className="min-w-0">
                        <h2 className="text-white font-semibold text-sm md:text-base leading-none truncate mb-1">
                            {displayName}
                        </h2>
                        <div className="flex items-center gap-1.5 leading-none">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[10px] text-green-500/80 font-medium uppercase tracking-wider">Çevrimiçi</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                        <Info className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area - Telegram Textured Background */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth custom-scrollbar relative"
                style={{ 
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                    backgroundOpacity: 0.05
                }}
            >
                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e11] via-transparent to-[#0b0e11] pointer-events-none opacity-50" />
                
                <div className="relative z-10 flex flex-col justify-end min-h-full space-y-1">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4 text-3xl">💬</div>
                            <h3 className="text-white font-medium mb-1">Yeni bir başlangıç!</h3>
                            <p className="text-white/30 text-xs max-w-[200px]">Bu sohbette henüz mesaj yok. İlk adımı siz atın.</p>
                        </div>
                    ) : messages.map((msg, idx) => (
                        <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            isOwn={msg.senderId === user?.id}
                        />
                    ))}
                </div>
            </div>

            {/* Composer */}
            <div className="z-20 bg-[#0f1115]/90 backdrop-blur-2xl border-t border-white/5 safe-padding-bottom">
                <EnhancedComposer />
            </div>
        </div>
    );
};
