import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage, IConversation } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
import { authService } from '../../../services/authService';
import { User } from '../../../types';
import { Users, Info, Settings, Search, ChevronLeft, Shield, Sparkles, X, Trash2, Activity } from 'lucide-react';
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
            <style>{`
                .glass-premium {
                    background: rgba(10, 10, 10, 0.85);
                    backdrop-filter: blur(50px) saturate(200%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }
                .saas-gradient-text {
                    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.4) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .dot-background {
                    background-image: radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 32px 32px;
                }
            `}</style>

            {/* Ultra Premium SaaS Header */}
            <div className="h-28 px-8 md:px-14 flex items-center justify-between glass-premium z-40 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-7">
                    <button 
                        onClick={() => setActiveConversationId(null)}
                        className="p-3.5 -ml-4 md:hidden hover:bg-white/5 rounded-3xl text-white/40 transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    
                    <div className="relative group/avatar cursor-pointer">
                        <div className="absolute inset-0 bg-accent-primary/20 blur-3xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-700" />
                        <img 
                            src={displayAvatar} 
                            alt={displayName} 
                            className="w-20 h-20 rounded-[30px] border-2 border-white/5 object-cover bg-white/[0.02] shadow-2xl relative z-10 transition-all duration-700 group-hover/avatar:scale-105 group-hover/avatar:border-accent-primary/30 group-hover/avatar:rotate-2"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-[5px] border-[#0a0a0a] rounded-full z-20 shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
                    </div>
                    
                    <div className="min-w-0">
                        <h2 className="text-white font-black text-3xl leading-none truncate mb-2.5 saas-gradient-text tracking-tighter">
                            {displayName}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <span className="text-[11px] text-green-500 font-black uppercase tracking-[0.4em] leading-none opacity-60">Canlı Bağlantı</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden xl:flex flex-col items-end mr-6 opacity-20">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">SaaS v4.0 Active</span>
                        <div className="flex gap-1 mt-1">
                            {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse" style={{ animationDelay: `${i*200}ms` }} />)}
                        </div>
                    </div>
                    <button className="p-4 bg-white/[0.02] hover:bg-white/[0.08] rounded-2xl text-white/20 hover:text-white transition-all border border-white/5 ring-1 ring-white/5 active:scale-95 group">
                        <Search className="w-6 h-6 transition-transform group-hover:scale-110" />
                    </button>
                    <button 
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-4 rounded-2xl transition-all border ring-1 ${isSettingsOpen ? 'bg-accent-primary/20 text-white border-accent-primary/30 ring-accent-primary/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]' : 'bg-white/[0.02] hover:bg-white/[0.08] text-white/20 border-white/5 ring-white/5 active:scale-95 group'}`}
                    >
                        <Settings className={`w-6 h-6 transition-all ${isSettingsOpen ? 'rotate-90' : 'group-hover:rotate-45'}`} />
                    </button>
                </div>
            </div>

            {/* Main Communication Engine Space */}
            <div className="flex-1 relative flex overflow-hidden dot-background">
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto px-8 md:px-24 py-14 scroll-smooth custom-scrollbar-hidden relative z-10"
                >
                    <div className="max-w-5xl mx-auto flex flex-col gap-4 min-h-full">
                        <AnimatePresence mode='popLayout'>
                            {isLoading ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-3xl z-[100]">
                                    <div className="flex flex-col items-center gap-10">
                                        <div className="relative group">
                                            <div className="w-28 h-28 border-2 border-accent-primary/10 rounded-full animate-ping absolute scale-150"></div>
                                            <div className="w-28 h-28 border-[6px] border-accent-primary border-t-transparent rounded-full animate-spin shadow-[0_0_70px_rgba(59,130,246,0.4)]"></div>
                                            <Activity className="absolute inset-0 m-auto w-10 h-10 text-accent-primary animate-pulse" />
                                        </div>
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="text-[14px] text-accent-primary font-black tracking-[0.6em] uppercase animate-pulse">Ultra-SaaS Engine</span>
                                            <span className="text-[10px] text-white/20 font-medium uppercase tracking-[0.3em]">Hücresel Veri Senkronizasyonu</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : messages.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="w-40 h-40 rounded-[60px] bg-gradient-to-tr from-white/[0.04] to-transparent flex items-center justify-center mb-12 text-7xl shadow-2xl border border-white/[0.06] relative overflow-hidden group cursor-pointer">
                                        <div className="absolute inset-0 bg-accent-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-in-out" />
                                        <Sparkles className="w-16 h-16 text-accent-primary animate-bounce" />
                                    </div>
                                    <h3 className="text-4xl font-black text-white mb-6 tracking-tighter saas-gradient-text">Yeni Bir Çağı Başlatın</h3>
                                    <p className="text-white/20 text-lg max-w-[360px] leading-relaxed font-light">SaaS Premium ekosisteminde iletişimin ilk dijital sinyalini şimdi gönderin.</p>
                                </motion.div>
                            ) : (
                                messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.015, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <MessageBubble 
                                            message={msg} 
                                            isOwn={msg.senderId === user?.id}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} className="h-12 w-full" />
                    </div>
                </div>

                {/* SaaS Advanced Configuration Terminal */}
                <AnimatePresence>
                    {isSettingsOpen && (
                        <motion.div 
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 35, stiffness: 250 }}
                            className="absolute top-0 right-0 bottom-0 w-[440px] bg-[#0a0a0a]/98 backdrop-blur-[60px] border-l border-white/5 z-[60] p-12 shadow-[-80px_0_150px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
                        >
                             <div className="flex items-center justify-between mb-16">
                                <div className="flex flex-col">
                                    <h3 className="text-white font-black text-4xl tracking-tighter mb-2 uppercase">SaaS Panel</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-accent-primary rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                        <span className="text-[11px] text-accent-primary font-black tracking-[0.4em] uppercase">Güvenli Düğüm: 0xF2A</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="p-5 hover:bg-white/5 rounded-3xl text-white/20 hover:text-white transition-all ring-1 ring-white/5 group"
                                >
                                    <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>
                            
                            <div className="flex-1 space-y-12 overflow-y-auto custom-scrollbar-hidden pr-2">
                                {/* Enhanced Profile Quick View */}
                                <div className="p-10 rounded-[50px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 text-center relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-primary/60 shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                                    <img src={displayAvatar} className="w-32 h-32 rounded-[40px] mx-auto mb-8 border-4 border-[#0a0a0a] ring-2 ring-white/5 shadow-2xl transition-all group-hover:scale-105 duration-700" />
                                    <h4 className="text-2xl font-black text-white mb-3 saas-gradient-text">{displayName}</h4>
                                    <div className="inline-flex py-1.5 px-4 bg-white/5 rounded-full border border-white/10">
                                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{conversation?.type || 'SaaS Channel'}</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h5 className="text-[11px] font-black text-white/10 uppercase tracking-[0.5em] px-6">Kontrol Merkezi</h5>
                                    
                                    <div className="grid gap-4">
                                        <SettingItem 
                                            icon={<Info className="w-6 h-6" />} 
                                            label="Sessiz Mod" 
                                            desc="Anlık bildirimleri askıya al"
                                            isActive={useMessageStore.getState().settings.isMuted}
                                            onClick={() => useMessageStore.getState().updateSettings({ isMuted: !useMessageStore.getState().settings.isMuted })}
                                        />
                                        <SettingItem 
                                            icon={<Shield className="w-6 h-6 text-green-500/60" />} 
                                            label="Okundu Bilgisi" 
                                            desc="Görüldü işaretlerini senkronize et"
                                            isActive={useMessageStore.getState().settings.showReadReceipts}
                                            onClick={() => useMessageStore.getState().updateSettings({ showReadReceipts: !useMessageStore.getState().settings.showReadReceipts })}
                                        />
                                        <SettingItem 
                                            icon={<Trash2 className="w-6 h-6 text-red-500/60" />} 
                                            label="Gecici Silme" 
                                            desc="Mesaj geçmişini arşiv moduna al"
                                            onClick={() => alert("Güvenlik Protokolü: Mesajlar 30 gün boyunca merkezi arşivde tutulacaktır.")}
                                        />
                                    </div>
                                </div>

                                {/* Premium Resource Cluster */}
                                <div className="space-y-6">
                                     <h5 className="text-[11px] font-black text-white/10 uppercase tracking-[0.5em] px-6">Dosya Bulutu</h5>
                                     <div className="grid grid-cols-4 gap-3 px-2">
                                        {[1,2,3,4,5,6,7,8].map(i => (
                                            <div key={i} className="aspect-square bg-white/[0.03] border border-white/[0.08] rounded-[20px] hover:border-accent-primary/50 transition-all cursor-pointer flex items-center justify-center hover:bg-accent-primary/10 group/item">
                                                <div className="w-1.5 h-1.5 bg-white/10 rounded-full group-hover/item:bg-accent-primary group-hover/item:scale-150 transition-all" />
                                            </div>
                                        ))}
                                     </div>
                                     <button className="w-full py-5 text-[11px] font-black text-white/40 hover:text-white uppercase tracking-[0.3em] transition-all border-2 border-dashed border-white/5 rounded-3xl mt-6 hover:bg-white/[0.02]">Cloud Arşivini Genişlet</button>
                                </div>
                            </div>

                            <div className="mt-auto pt-12 border-t border-white/[0.05] flex items-center justify-center gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                                <Activity className="w-5 h-5 text-yellow-500 animate-pulse" />
                                <span className="text-[12px] font-black tracking-[1em] text-white uppercase translate-x-[0.5em]">Ooggen Ultra SaaS</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Ultra Floating Composer Area with Multi-Layer Shadow */}
            <div className="px-10 md:px-32 pb-14 pt-8 bg-gradient-to-t from-[#050505] via-[#050505]/98 to-transparent z-40 relative">
                <div className="max-w-5xl mx-auto relative group">
                    <div className="absolute inset-x-0 -top-40 h-40 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
                    <div className="rounded-[50px] overflow-hidden border-2 border-white/[0.1] shadow-[0_50px_120px_rgba(0,0,0,1)] bg-[#0d0d0d]/95 backdrop-blur-[60px] ring-1 ring-white/10 group-hover:ring-accent-primary/40 transition-all duration-1000 group-hover:shadow-[0_50px_120px_rgba(59,130,246,0.2)] transform translate-y-0 hover:-translate-y-2 active:scale-[0.995]">
                        <EnhancedComposer />
                    </div>
                </div>
            </div>
            
            {/* Extended Ambient Space */}
            <div className="absolute -bottom-60 -left-60 w-[1000px] h-[1000px] bg-accent-primary/[0.03] blur-[300px] rounded-full pointer-events-none z-0" />
            <div className="absolute -top-60 -right-60 w-[1000px] h-[1000px] bg-purple-500/[0.02] blur-[300px] rounded-full pointer-events-none z-0" />
        </div>
    );
};

// SaaS Setting Item Sub-component
const SettingItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    desc: string; 
    isActive?: boolean;
    onClick?: () => void;
}> = ({ icon, label, desc, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full py-6 px-7 rounded-[32px] text-left flex items-center justify-between transition-all group border-2 ${isActive ? 'bg-accent-primary/10 border-accent-primary/30 ring-4 ring-accent-primary/5' : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15'}`}
    >
        <div className="flex items-center gap-6">
            <div className={`p-4 rounded-[22px] transition-all duration-500 ${isActive ? 'bg-accent-primary text-white shadow-[0_10px_25px_rgba(59,130,246,0.5)] scale-110' : 'bg-white/5 text-white/30 group-hover:text-white/70'}`}>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className={`text-lg font-black tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{label}</span>
                <span className="text-[11px] text-white/20 font-bold group-hover:text-white/40 uppercase tracking-widest">{desc}</span>
            </div>
        </div>
        {isActive !== undefined && (
            <div className={`w-14 h-7 rounded-full relative transition-all duration-700 p-1.5 ${isActive ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-all duration-700 transform ${isActive ? 'translate-x-7' : 'translate-x-0'} shadow-2xl ring-2 ring-black/10`} />
            </div>
        )}
    </button>
);
