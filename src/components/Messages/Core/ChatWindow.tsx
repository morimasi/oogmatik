import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage, IConversation } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
import { authService } from '../../../services/authService';
import { User } from '../../../types';
import { Users, Info, Settings, Search, ChevronLeft, Shield, Sparkles, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWindow: React.FC = () => {
    const { activeConversationId, setActiveConversationId } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState<IConversation | null>(null);
    const [recipient, setRecipient] = useState<User | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        if (!activeConversationId) return;
        setIsLoading(true);

        const unsubscribe = messageService.subscribeToMessages(
            activeConversationId,
            100, 
            (msgs) => {
                setMessages(msgs);
                setIsLoading(false);
            },
            (err) => {
                console.error("Mesajlar yüklenemedi:", err);
                setIsLoading(false);
            }
        );

        messageService.getConversation(activeConversationId).then(conv => {
            setConversation(conv);
            if (conv.type === 'direct' && user) {
                const otherParticipant = conv.participants.find(p => p.userId !== user.id);
                if (otherParticipant) {
                    authService.getMultipleUsers([otherParticipant.userId]).then(users => {
                        if (users.length > 0) setRecipient(users[0]);
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [activeConversationId, user]);

    // Force scroll to bottom with smooth effect
    useLayoutEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    if (!activeConversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center px-6"
                >
                    <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-accent-primary/20 to-purple-500/20 border border-white/5 flex items-center justify-center mb-10 mx-auto shadow-2xl relative group cursor-pointer hover:rotate-6 transition-transform duration-500">
                        <div className="absolute inset-0 bg-accent-primary/10 blur-3xl rounded-full group-hover:bg-accent-primary/20 transition-colors" />
                        <Users className="w-12 h-12 text-accent-primary relative z-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tighter">Oogmatik Ultra Messenger</h2>
                    <p className="text-white/30 text-base max-w-sm mx-auto leading-relaxed font-light">
                        Özel eğitim profesyonelleri için tasarlanmış, tam şifreli ve yüksek performanslı iletişim merkezi.
                    </p>
                </motion.div>
            </div>
        );
    }

    const displayName = conversation?.type === 'group' ? (conversation.title || 'Grup') : (recipient?.name || 'Yükleniyor...');
    const displayAvatar = recipient?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative h-full overflow-hidden">
            {/* Ultra Premium Header */}
            <div className="h-24 px-6 md:px-10 flex items-center justify-between bg-[#0a0a0a]/95 backdrop-blur-2xl z-40 border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => setActiveConversationId(null)}
                        className="p-3 -ml-3 md:hidden hover:bg-white/5 rounded-2xl text-white/50 transition-all hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                    
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-accent-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <img 
                            src={displayAvatar} 
                            alt={displayName} 
                            className="w-14 h-14 rounded-3xl border-2 border-white/10 object-cover bg-white/5 relative z-10 shadow-2xl transition-all group-hover:scale-105 group-hover:border-accent-primary/50"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[4px] border-[#0a0a0a] rounded-full z-20 shadow-lg shadow-green-500/20"></div>
                    </div>
                    
                    <div className="min-w-0">
                        <h2 className="text-white font-black text-xl leading-none truncate mb-1.5 tracking-tight group-hover:text-accent-primary transition-colors cursor-pointer">
                            {displayName}
                        </h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[11px] text-green-500/80 font-black uppercase tracking-widest leading-none">Aktif Hat</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-3.5 bg-white/5 hover:bg-accent-primary/10 rounded-2xl text-white/30 hover:text-accent-primary transition-all border border-white/5 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-accent-primary/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                        <Search className="w-5 h-5 relative z-10" />
                    </button>
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-3.5 rounded-2xl transition-all border relative overflow-hidden ${isSettingsOpen ? 'bg-accent-primary/20 text-white border-accent-primary/30' : 'bg-white/5 hover:bg-white/10 text-white/30 border-white/5'}`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Chat Content Space */}
            <div className="flex-1 relative flex overflow-hidden">
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-6 md:px-16 py-10 scroll-smooth custom-scrollbar-hidden relative z-10"
                    style={{ 
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                        backgroundBlendMode: 'overlay'
                    }}
                >
                    <div className="max-w-4xl mx-auto flex flex-col gap-2 min-h-full">
                        <AnimatePresence mode='popLayout'>
                            {isLoading ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-14 h-14 border-4 border-accent-primary border-t-transparent rounded-full animate-spin shadow-[0_0_40px_rgba(59,130,246,0.3)]"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] text-accent-primary font-black tracking-[0.3em] uppercase animate-pulse mb-1">Ultra-Sync</span>
                                            <span className="text-[9px] text-white/20 font-medium uppercase tracking-widest">Veriler Şifreleniyor...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : messages.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="w-24 h-24 rounded-[40px] bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center mb-8 text-5xl shadow-2xl border border-white/5 ring-1 ring-white/10">✨</div>
                                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Yeni Bir Hikaye Başlatın</h3>
                                    <p className="text-white/30 text-sm max-w-[280px] leading-relaxed font-light">Selam vererek veya bir dosya paylaşarak iletişimi Hemen başlatın.</p>
                                </motion.div>
                            ) : (
                                messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: msg.senderId === user?.id ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                    >
                                        <MessageBubble 
                                            message={msg} 
                                            isOwn={msg.senderId === user?.id}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} className="h-4 w-full" />
                    </div>
                </div>

                {/* Ultra Settings Panel Overlay */}
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute top-0 right-0 bottom-0 w-[340px] bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/5 z-[60] p-8 shadow-[-40px_0_80px_rgba(0,0,0,0.8)] flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-accent-primary" />
                                    <h3 className="text-white font-black text-lg tracking-tight uppercase">Dashboard</h3>
                                </div>
                                <button 
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar-hidden">
                                <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] block mb-6">Medya Arşivi</span>
                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        {[1,2,3,4,5,6].map(i => (
                                            <div key={i} className="aspect-square bg-white/5 rounded-xl border border-white/5 hover:border-accent-primary/30 transition-all cursor-pointer"></div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black text-white/60 hover:text-white transition-all uppercase tracking-widest border border-white/5">Hepsini İncele</button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-2">Güvenlik & Gizlilik</h4>
                                    <button className="w-full py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 text-sm font-bold text-left flex items-center justify-between group transition-all border border-white/5">
                                        <span>Bildirim Merkezi</span>
                                        <div className="w-10 h-5 bg-green-500/20 rounded-full relative p-1 outline outline-1 outline-green-500/20 shadow-inner">
                                            <div className="absolute right-1 top-1 bottom-1 w-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        </div>
                                    </button>
                                    <button className="w-full py-4 px-5 rounded-2xl bg-white/5 hover:bg-red-500/10 text-red-500/80 hover:text-red-500 text-sm font-bold text-left flex items-center justify-between group transition-all border border-transparent hover:border-red-500/10 mb-10">
                                        <span>Konuşmayı Arşivle</span>
                                        <Shield className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/5 opacity-20 text-center">
                                <span className="text-[8px] font-black tracking-[0.5em] text-white uppercase">Oogmatik v2.5.0 Premium</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ultra Floating Composer Area */}
            <div className="px-6 md:px-16 pb-8 pt-4 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent z-40">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute inset-x-0 -top-20 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
                    <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.8)] bg-[#0f1115]/80 backdrop-blur-3xl ring-1 ring-white/5 group-hover:ring-accent-primary/20 transition-all duration-500 group-hover:shadow-accent-primary/10">
                        <EnhancedComposer />
                    </div>
                </div>
            </div>
            
            {/* Ambient Lights */}
            <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-accent-primary/5 blur-[180px] rounded-full pointer-events-none z-0" />
            <div className="absolute -top-20 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[180px] rounded-full pointer-events-none z-0" />
        </div>
    );
};
