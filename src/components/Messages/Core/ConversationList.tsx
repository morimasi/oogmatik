import React, { useState, useEffect } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IConversation } from '../../../types/messaging';
import { Search, MessageSquare, Users, BellOff, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { authService } from '../../../services/authService';
import { messageService } from '../../../services/messaging/messageService';
import { User } from '../../../types';

type ListMode = 'conversations' | 'contacts';

export const ConversationList: React.FC = () => {
    const { activeConversationId, setActiveConversationId } = useMessageStore();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [mode, setMode] = useState<ListMode>('conversations');
    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [contacts, setContacts] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Subscribe to Conversations
    useEffect(() => {
        if (!user) return;
        
        setIsLoading(true);
        const unsubscribe = messageService.subscribeToConversations(
            user.id,
            (convs) => {
                setConversations(convs);
                setIsLoading(false);
            },
            (err) => {
                console.error("Sohbetler yüklenemedi:", err);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user]);

    // Load Contacts when mode changes
    useEffect(() => {
        if (mode === 'contacts' && user) {
            setIsLoading(true);
            authService.getContacts(user.id).then(u => {
                setContacts(u);
                setIsLoading(false);
            }).catch(err => {
                console.error("Kişiler yüklenemedi:", err);
                setIsLoading(false);
            });
        }
    }, [mode, user]);

    const handleContactClick = async (contact: User) => {
        if (!user) return;

        // Birebir konuşma zaten var mı kontrol et
        const existingConv = conversations.find(c => 
            c.type === 'direct' && 
            c.participantIds?.includes(contact.id) && 
            c.participantIds?.includes(user.id)
        );

        if (existingConv) {
            setActiveConversationId(existingConv.id);
            setMode('conversations');
        } else {
            // Yeni konuşma oluştur
            try {
                setIsLoading(true);
                const newConvId = await messageService.createConversation({
                    type: 'direct',
                    participants: [
                        { userId: user.id, role: user.role, joinedAt: {} as any },
                        { userId: contact.id, role: contact.role, joinedAt: {} as any }
                    ],
                    participantIds: [user.id, contact.id]
                });
                setActiveConversationId(newConvId);
                setMode('conversations');
            } catch (err) {
                console.error("Konuşma başlatılamadı:", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredConversations = conversations.filter(c => {
        const titleMatch = c.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const lastMsgMatch = c.lastMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase());
        return titleMatch || lastMsgMatch;
    });

    const filteredContacts = contacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-80 backdrop-blur-xl bg-[#0f1115]/80 border-r border-white/5 font-inter">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">
                        {mode === 'conversations' ? 'Mesajlar' : 'Yeni Mesaj'}
                    </h2>
                    {mode === 'conversations' ? (
                        <button 
                            onClick={() => setMode('contacts')}
                            className="p-2 hover:bg-white/5 rounded-lg text-accent-primary transition-colors"
                            title="Yeni Mesaj"
                        >
                            <UserPlus className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            onClick={() => setMode('conversations')}
                            className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" /> Geri
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                        type="text" 
                        placeholder={mode === 'conversations' ? "Sohbetlerde ara..." : "Kullanıcı ara..."} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 space-y-1">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : mode === 'conversations' ? (
                    <>
                        {filteredConversations.length === 0 ? (
                            <div className="text-center text-white/40 text-sm py-8 px-4">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                Henüz bir konuşma yok. Sağ üstten yeni bir tane başlatın!
                            </div>
                        ) : filteredConversations.map((conv) => {
                            const isActive = activeConversationId === conv.id;
                            const isGroup = conv.type !== "direct";
                            
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 group
                                        ${isActive 
                                            ? 'bg-accent-primary/20 border-accent-primary/30' 
                                            : 'hover:bg-white/5 border-transparent'
                                        } border
                                    `}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                            ${isGroup ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}
                                        `}>
                                            {isGroup ? <Users className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f1115] rounded-full"></div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-medium text-sm text-white truncate">
                                                {isGroup ? conv.title : (conv.participants.find(p => p.userId !== user?.id)?.userId || 'Konuşma')}
                                            </h3>
                                            <span className="text-[10px] text-white/40">
                                                {conv.updatedAt ? new Date(conv.updatedAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-white/50'} font-lexend`}>
                                                {conv.lastMessage?.text || 'Yeni mesaj yok'}
                                            </p>
                                            <BellOff className="w-3 h-3 text-white/20 hidden group-hover:block" />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </>
                ) : (
                    <>
                        <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            Tüm Kullanıcılar
                        </div>
                        {filteredContacts.length === 0 ? (
                            <div className="text-center text-white/40 text-sm py-8">
                                Kullanıcı bulunamadı.
                            </div>
                        ) : filteredContacts.map((contact) => (
                            <button
                                key={contact.id}
                                onClick={() => handleContactClick(contact)}
                                className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent transition-all duration-200 flex items-center gap-3"
                            >
                                <img 
                                    src={contact.avatar} 
                                    alt={contact.name} 
                                    className="w-10 h-10 rounded-full bg-white/5"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm text-white truncate">{contact.name}</h3>
                                    <p className="text-xs text-white/40 truncate capitalize">{contact.role}</p>
                                </div>
                            </button>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
