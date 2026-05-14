import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage, IConversation } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
import { notificationService } from '../../../services/messaging/notificationService';
import { authService } from '../../../services/authService';
import { User } from '../../../types';
import { Users, Info, Settings, Search, ChevronLeft, Shield, Sparkles, X, Trash2, Activity, Bell, BellOff, Volume2, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWindow: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversationId,
    setActiveThreadId,
    highlightMessageId,
    setHighlightMessageId,
    getConversationSettings,
    updateConversationSettings,
    updateNotificationPreferences,
  } = useMessageStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<IConversation | null>(null);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastMessageCount = useRef(0);

  useEffect(() => {
    if (!activeConversationId || !user) return;
    setIsLoading(true);

    const unsubMessages = messageService.subscribeToMessages(
      activeConversationId,
      100,
      (msgs) => {
        setMessages(msgs);

        const prevCount = lastMessageCount.current;
        lastMessageCount.current = msgs.length;

        if (prevCount > 0 && msgs.length > prevCount) {
          const newMessages = msgs.slice(prevCount);
          for (const msg of newMessages) {
            if (msg.senderId !== user.id) {
              const settings = getConversationSettings(activeConversationId);
              if (!settings.isMuted) {
                authService.getMultipleUsers([msg.senderId]).then(users => {
                  if (users.length > 0) {
                    notificationService.notifyNewMessage(msg, users[0].name || "Kullanıcı", activeConversationId);
                  }
                }).catch(() => {});
              }
            }
          }
        }

        setIsLoading(false);
      },
      () => {
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

    return () => {
      unsubMessages();
    };
  }, [activeConversationId, user, getConversationSettings]);

  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (highlightMessageId && messagesContainerRef.current) {
      const el = messagesContainerRef.current.querySelector(`[data-message-id="${highlightMessageId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-accent-primary/50', 'rounded-2xl');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-accent-primary/50', 'rounded-2xl');
          setHighlightMessageId(null);
        }, 3000);
      }
    }
  }, [highlightMessageId, messages, setHighlightMessageId]);

  const settings = activeConversationId ? getConversationSettings(activeConversationId) : null;
  const isMuted = settings?.isMuted ?? false;

  const handleToggleMute = useCallback(() => {
    if (!activeConversationId) return;
    updateConversationSettings(activeConversationId, { isMuted: !isMuted });
  }, [activeConversationId, isMuted, updateConversationSettings]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
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

      <div className="h-20 md:h-28 px-4 md:px-14 flex items-center justify-between glass-premium z-40 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3 md:gap-7 min-w-0">
          <button
            onClick={() => setActiveConversationId(null)}
            className="p-2 md:p-3.5 -ml-2 md:hidden hover:bg-white/5 rounded-3xl text-white/40 transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          <div className="relative group/avatar cursor-pointer flex-shrink-0">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-12 h-12 md:w-20 md:h-20 rounded-[20px] md:rounded-[30px] border-2 border-white/5 object-cover bg-white/[0.02] shadow-2xl relative z-10 transition-all duration-700 group-hover/avatar:scale-105 group-hover/avatar:border-accent-primary/30"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-6 md:h-6 bg-green-500 border-[3px] md:border-[5px] border-[#0a0a0a] rounded-full z-20 shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-black text-lg md:text-3xl leading-none truncate mb-0.5 md:mb-2.5 saas-gradient-text tracking-tighter">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="flex h-2 w-2 md:h-2.5 md:w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-green-500"></span>
              </span>
              <span className="text-[9px] md:text-[11px] text-green-500 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] leading-none opacity-60">Canlı Bağlantı</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="hidden md:block p-2 md:p-4 bg-white/[0.02] hover:bg-white/[0.08] rounded-2xl text-white/20 hover:text-white transition-all border border-white/5 ring-1 ring-white/5 active:scale-95 group">
            <Search className="w-4 h-4 md:w-6 md:h-6 transition-transform group-hover:scale-110" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 md:p-4 rounded-2xl transition-all border ring-1 ${isSettingsOpen ? 'bg-accent-primary/20 text-white border-accent-primary/30 ring-accent-primary/20' : 'bg-white/[0.02] hover:bg-white/[0.08] text-white/20 border-white/5 ring-white/5 active:scale-95 group'}`}
          >
            <Settings className={`w-4 h-4 md:w-6 md:h-6 transition-all ${isSettingsOpen ? 'rotate-90' : 'group-hover:rotate-45'}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex overflow-hidden dot-background">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 md:px-24 py-6 md:py-14 scroll-smooth custom-scrollbar relative z-10"
        >
          <div className="max-w-5xl mx-auto flex flex-col gap-3 md:gap-4 min-h-full">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-3xl z-[100]">
                  <div className="flex flex-col items-center gap-6 md:gap-10">
                    <div className="relative group">
                      <div className="w-20 h-20 md:w-28 md:h-28 border-2 border-accent-primary/10 rounded-full animate-ping absolute scale-150"></div>
                      <div className="w-20 h-20 md:w-28 md:h-28 border-[6px] border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                      <Activity className="absolute inset-0 m-auto w-8 h-8 md:w-10 md:h-10 text-accent-primary animate-pulse" />
                    </div>
                    <span className="text-xs md:text-[14px] text-accent-primary font-black tracking-[0.3em] md:tracking-[0.6em] uppercase animate-pulse">Ultra-SaaS Engine</span>
                  </div>
                </motion.div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-12 md:py-20"
                >
                  <div className="w-24 h-24 md:w-40 md:h-40 rounded-[30px] md:rounded-[60px] bg-gradient-to-tr from-white/[0.04] to-transparent flex items-center justify-center mb-6 md:mb-12 text-5xl md:text-7xl shadow-2xl border border-white/[0.06] relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-accent-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-1000 ease-in-out" />
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-accent-primary animate-bounce" />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6 tracking-tighter saas-gradient-text">Yeni Bir Çağı Başlatın</h3>
                  <p className="text-white/20 text-sm md:text-lg max-w-[360px] leading-relaxed font-light px-4">SaaS Premium ekosisteminde iletişimin ilk dijital sinyalini şimdi gönderin.</p>
                </motion.div>
              ) : (
                <div ref={messagesContainerRef}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.015, ease: [0.23, 1, 0.32, 1] }}
                      data-message-id={msg.id}
                      className="scroll-mt-20"
                    >
                      <MessageBubble
                        message={msg}
                        isOwn={msg.senderId === user?.id}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-8 md:h-12 w-full" />
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 35, stiffness: 250 }}
              className="absolute top-0 right-0 bottom-0 w-[320px] md:w-[440px] bg-[#0a0a0a]/98 backdrop-blur-[60px] border-l border-white/5 z-[60] p-6 md:p-12 shadow-[-80px_0_150px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 md:mb-16">
                <div className="flex flex-col">
                  <h3 className="text-white font-black text-2xl md:text-4xl tracking-tighter mb-1 md:mb-2 uppercase">SaaS Panel</h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-accent-primary rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                    <span className="text-[9px] md:text-[11px] text-accent-primary font-black tracking-[0.2em] md:tracking-[0.4em] uppercase">Güvenli Düğüm: 0xF2A</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-3 md:p-5 hover:bg-white/5 rounded-3xl text-white/20 hover:text-white transition-all ring-1 ring-white/5 group"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="flex-1 space-y-6 md:space-y-12 overflow-y-auto custom-scrollbar pr-2">
                <div className="p-6 md:p-10 rounded-[30px] md:rounded-[50px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-accent-primary/60 md:h-1.5 shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
                  <img src={displayAvatar} className="w-20 h-20 md:w-32 md:h-32 rounded-[24px] md:rounded-[40px] mx-auto mb-4 md:mb-8 border-4 border-[#0a0a0a] ring-2 ring-white/5 shadow-2xl transition-all group-hover:scale-105 duration-700" />
                  <h4 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 saas-gradient-text">{displayName}</h4>
                  <div className="inline-flex py-1 px-3 md:py-1.5 md:px-4 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[8px] md:text-[10px] text-white/30 font-black uppercase tracking-widest">{conversation?.type === 'direct' ? 'Birebir Sohbet' : conversation?.type || 'SaaS Channel'}</span>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-8">
                  <h5 className="text-[10px] md:text-[11px] font-black text-white/10 uppercase tracking-[0.3em] md:tracking-[0.5em] px-4 md:px-6">Bildirim Kontrol Merkezi</h5>

                  <div className="grid gap-3 md:gap-4 px-2">
                    <SettingItem
                      icon={isMuted ? <BellOff className="w-5 h-5 md:w-6 md:h-6" /> : <Bell className="w-5 h-5 md:w-6 md:h-6" />}
                      label="Sessiz Mod"
                      desc="Anlık bildirimleri askıya al"
                      isActive={isMuted}
                      onClick={handleToggleMute}
                    />
                    <SettingItem
                      icon={<Bell className="w-5 h-5 md:w-6 md:h-6" />}
                      label="Masaüstü Bildirimleri"
                      desc="Tarayıcı bildirimlerini aç/kapat"
                      isActive={settings?.notificationPreferences.desktopEnabled ?? false}
                      onClick={() => {
                        if (!activeConversationId) return;
                        const prefs = settings?.notificationPreferences;
                        if (!prefs?.desktopEnabled) {
                          notificationService.requestDesktopPermission().then(granted => {
                            updateNotificationPreferences(activeConversationId, { desktopEnabled: granted });
                          });
                        } else {
                          updateNotificationPreferences(activeConversationId, { desktopEnabled: false });
                        }
                      }}
                    />
                    <SettingItem
                      icon={<Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                      label="Bildirim Sesi"
                      desc="Mesaj geldiğinde ses çal"
                      isActive={settings?.notificationPreferences.soundEnabled ?? true}
                      onClick={() => {
                        if (!activeConversationId) return;
                        const prefs = settings?.notificationPreferences;
                        const newVal = !prefs?.soundEnabled;
                        updateNotificationPreferences(activeConversationId, { soundEnabled: newVal });
                        if (newVal) {
                          notificationService.playTestSound();
                        }
                      }}
                    />
                    <SettingItem
                      icon={<Monitor className="w-5 h-5 md:w-6 md:h-6" />}
                      label="Titreşim"
                      desc="Mobil cihazlarda titreşim bildirimi"
                      isActive={settings?.notificationPreferences.vibrationEnabled ?? true}
                      onClick={() => {
                        if (!activeConversationId) return;
                        const prefs = settings?.notificationPreferences;
                        updateNotificationPreferences(activeConversationId, { vibrationEnabled: !prefs?.vibrationEnabled });
                      }}
                    />
                    <SettingItem
                      icon={<Shield className="w-5 h-5 md:w-6 md:h-6" />}
                      label="Gizlilik Modu"
                      desc="Bildirim içeriğini gizle"
                      isActive={!settings?.notificationPreferences.showOnLockScreen}
                      onClick={() => {
                        if (!activeConversationId) return;
                        const prefs = settings?.notificationPreferences;
                        updateNotificationPreferences(activeConversationId, { showOnLockScreen: !prefs?.showOnLockScreen });
                      }}
                    />
                    <SettingItem
                      icon={<Trash2 className="w-5 h-5 text-red-500/60" />}
                      label="Geçici Silme"
                      desc="Mesaj geçmişini arşiv moduna al (30 gün)"
                      onClick={() => {}}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 md:px-32 pb-6 md:pb-14 pt-4 md:pt-8 bg-gradient-to-t from-[#050505] via-[#050505]/98 to-transparent z-40 relative">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute inset-x-0 -top-20 md:-top-40 h-20 md:h-40 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
          <div className="rounded-[24px] md:rounded-[50px] overflow-hidden border-2 border-white/[0.1] shadow-[0_50px_120px_rgba(0,0,0,1)] bg-[#0d0d0d]/95 backdrop-blur-[60px] ring-1 ring-white/10 group-hover:ring-accent-primary/40 transition-all duration-1000">
            <EnhancedComposer />
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  desc: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ icon, label, desc, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full py-4 md:py-6 px-4 md:px-7 rounded-[24px] md:rounded-[32px] text-left flex items-center justify-between transition-all group border-2 ${isActive ? 'bg-accent-primary/10 border-accent-primary/30 ring-4 ring-accent-primary/5' : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/15'}`}
  >
    <div className="flex items-center gap-4 md:gap-6 min-w-0">
      <div className={`p-3 md:p-4 rounded-[16px] md:rounded-[22px] transition-all duration-500 flex-shrink-0 ${isActive ? 'bg-accent-primary text-white shadow-[0_10px_25px_rgba(59,130,246,0.5)] scale-110' : 'bg-white/5 text-white/30 group-hover:text-white/70'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <span className={`text-sm md:text-lg font-black tracking-tight transition-colors block truncate ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{label}</span>
        <span className="text-[9px] md:text-[11px] text-white/20 font-bold group-hover:text-white/40 uppercase tracking-widest truncate">{desc}</span>
      </div>
    </div>
    {isActive !== undefined && (
      <div className={`w-10 h-5 md:w-14 md:h-7 rounded-full relative transition-all duration-700 p-1 md:p-1.5 flex-shrink-0 ${isActive ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'bg-white/10'}`}>
        <div className={`w-3 h-3 md:w-4 md:h-4 bg-white rounded-full transition-all duration-700 transform ${isActive ? 'translate-x-4 md:translate-x-7' : 'translate-x-0'} shadow-2xl ring-2 ring-black/10`} />
      </div>
    )}
  </button>
);
