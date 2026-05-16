import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IMessage, IConversation } from '../../../types/messaging';
import { MessageBubble } from './MessageBubble';
import { EnhancedComposer } from './EnhancedComposer';
import { useAuthStore } from '../../../store/useAuthStore';
import { messageService } from '../../../services/messaging/messageService';
import { notificationService } from '../../../services/messaging/notificationService';
import { authService } from '../../../services/authService';
import { useGlobalStore } from '../../../shared/store/useGlobalStore';
import { User } from '../../../types';
import { ChevronLeft, Settings, X, Bell, BellOff, Volume2, Monitor, Shield, Eye, Download, Trash2, Archive, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ChatWindow: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversationId,
    highlightMessageId,
    setHighlightMessageId,
    getConversationSettings,
    updateConversationSettings,
    updateNotificationPreferences,
  } = useMessageStore();
  const { user } = useAuthStore();
  const { theme, setTheme } = useGlobalStore();
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
      activeConversationId, 100,
      (msgs) => {
        setMessages(msgs);
        const prevCount = lastMessageCount.current;
        lastMessageCount.current = msgs.length;
        if (prevCount > 0 && msgs.length > prevCount) {
          for (const msg of msgs.slice(prevCount)) {
            if (msg.senderId !== user.id) {
              const s = getConversationSettings(activeConversationId);
              if (!s.isMuted) {
                authService.getMultipleUsers([msg.senderId]).then(users => {
                  if (users.length > 0) notificationService.notifyNewMessage(msg, users[0].name || "Kullanıcı", activeConversationId);
                }).catch(() => {});
              }
            }
          }
        }
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );

    messageService.getConversation(activeConversationId).then(conv => {
      setConversation(conv);
      if (conv.type === 'direct' && user) {
        const other = conv.participants.find(p => p.userId !== user.id);
        if (other) authService.getMultipleUsers([other.userId]).then(u => { if (u[0]) setRecipient(u[0]); });
      }
    });

    return () => unsubMessages();
  }, [activeConversationId, user, getConversationSettings]);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (highlightMessageId && messagesContainerRef.current) {
      const el = messagesContainerRef.current.querySelector(`[data-message-id="${highlightMessageId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[var(--accent-color)]/50', 'rounded-xl');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[var(--accent-color)]/50', 'rounded-xl');
          setHighlightMessageId(null);
        }, 3000);
      }
    }
  }, [highlightMessageId, messages, setHighlightMessageId]);

  const convSettings = activeConversationId ? getConversationSettings(activeConversationId) : null;
  const isMuted = convSettings?.isMuted ?? false;

  const handleToggleMute = useCallback(() => {
    if (!activeConversationId) return;
    updateConversationSettings(activeConversationId, { isMuted: !isMuted });
  }, [activeConversationId, isMuted, updateConversationSettings]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-default)]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--accent-muted)] border border-[var(--accent-color)]/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">İletişim Merkezi</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs">Bir sohbet seçin veya yeni bir görüşme başlatın.</p>
        </motion.div>
      </div>
    );
  }

  const displayName = conversation?.type === 'group' ? (conversation.title || 'Grup') : (recipient?.name || 'Yükleniyor...');
  const displayAvatar = recipient?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-default)] relative h-full overflow-hidden">
      {/* Header */}
      <div className="h-12 md:h-14 px-3 md:px-5 flex items-center justify-between bg-[var(--bg-paper)] border-b border-[var(--border-color)] z-40 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <button onClick={() => setActiveConversationId(null)} className="p-1.5 -ml-1 md:hidden hover:bg-[var(--bg-default)] rounded-lg text-[var(--text-secondary)] transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-shrink-0">
            <img src={displayAvatar} alt={displayName} className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-[var(--border-color)] object-cover bg-[var(--bg-default)]" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[var(--bg-paper)] rounded-full" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[var(--text-primary)] font-bold text-sm md:text-[13px] leading-none truncate">{displayName}</h2>
            <span className="text-[9px] text-emerald-500/80 font-medium">Çevrimiçi</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-1.5 rounded-lg transition-all border ${isSettingsOpen ? 'bg-[var(--accent-muted)] text-[var(--accent-color)] border-[var(--accent-color)]/30' : 'bg-[var(--bg-default)] hover:bg-[var(--bg-paper)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)]'}`}>
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative flex overflow-hidden">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-2 md:px-4 py-3 scroll-smooth custom-scrollbar relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col gap-1.5 min-h-full">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[var(--text-secondary)] border-t-[var(--accent-color)] rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5">Henüz mesaj yok</h3>
                <p className="text-[10px] text-[var(--text-secondary)]/50">İlk mesajı göndererek sohbeti başlatın.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.005 }} data-message-id={msg.id} className="scroll-mt-10">
                  <MessageBubble message={msg} isOwn={msg.senderId === user?.id} />
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} className="h-2 w-full" />
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-[var(--bg-paper)] border-l border-[var(--border-color)] z-[60] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
                <h3 className="text-[var(--text-primary)] font-bold text-[13px]">Sohbet Ayarları</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-1 hover:bg-[var(--bg-default)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 space-y-1.5">
                {/* Profile Summary */}
                <div className="p-4 rounded-xl bg-[var(--bg-default)] border border-[var(--border-color)] text-center relative overflow-hidden group mb-3">
                  <img src={displayAvatar} className="w-14 h-14 rounded-xl mx-auto mb-2 border border-[var(--border-color)] object-cover bg-[var(--bg-paper)]" />
                  <h4 className="text-[13px] font-bold text-[var(--text-primary)] truncate">{displayName}</h4>
                  <span className="text-[9px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">{conversation?.type === 'direct' ? 'Birebir' : 'Grup'}</span>
                </div>

                <div className="px-1 pb-1 text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Arayüz</div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-default)] border border-[var(--border-color)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-[var(--text-secondary)]"><Sun className="w-3.5 h-3.5" /></div>
                      <div>
                        <span className="text-[11px] font-medium text-[var(--text-primary)] block leading-none">Aydınlık/Karanlık</span>
                      </div>
                    </div>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={`relative w-8 h-4 rounded-full transition-all ${theme === 'dark' ? 'bg-[var(--accent-color)]' : 'bg-gray-300 dark:bg-gray-700'}`}>
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all flex items-center justify-center ${theme === 'dark' ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                    </button>
                  </div>
                </div>

                <div className="px-1 pt-2 pb-1 text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Bildirimler</div>
                <SettingsToggle
                  icon={isMuted ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                  label="Sessiz Mod"
                  isActive={isMuted}
                  onToggle={handleToggleMute}
                  isWarning={isMuted}
                />
                <SettingsToggle
                  icon={<Monitor className="w-3.5 h-3.5" />}
                  label="Masaüstü Bildirimi"
                  isActive={convSettings?.notificationPreferences.desktopEnabled ?? false}
                  onToggle={() => {
                    if (!activeConversationId) return;
                    if (!convSettings?.notificationPreferences.desktopEnabled) notificationService.requestDesktopPermission().then(g => updateNotificationPreferences(activeConversationId, { desktopEnabled: g }));
                    else updateNotificationPreferences(activeConversationId, { desktopEnabled: false });
                  }}
                />
                <SettingsToggle
                  icon={<Volume2 className="w-3.5 h-3.5" />}
                  label="Bildirim Sesi"
                  isActive={convSettings?.notificationPreferences.soundEnabled ?? true}
                  onToggle={() => {
                    if (!activeConversationId) return;
                    const v = !convSettings?.notificationPreferences.soundEnabled;
                    updateNotificationPreferences(activeConversationId, { soundEnabled: v });
                    if (v) notificationService.playTestSound();
                  }}
                />
                <SettingsToggle
                  icon={<Shield className="w-3.5 h-3.5" />}
                  label="Gizlilik (Mesajı Gizle)"
                  isActive={!convSettings?.notificationPreferences.showOnLockScreen}
                  onToggle={() => {
                    if (!activeConversationId) return;
                    updateNotificationPreferences(activeConversationId, { showOnLockScreen: !convSettings?.notificationPreferences.showOnLockScreen });
                  }}
                />

                <div className="px-1 pt-2 pb-1 text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Sohbet Seçenekleri</div>
                <SettingsToggle
                  icon={<Eye className="w-3.5 h-3.5" />}
                  label="Okundu Bilgisi (Görüldü)"
                  isActive={convSettings?.showReadReceipts ?? true}
                  onToggle={() => {
                    if (!activeConversationId) return;
                    updateConversationSettings(activeConversationId, { showReadReceipts: !convSettings?.showReadReceipts });
                  }}
                />

                <div className="pt-2 space-y-1">
                  <ActionButton icon={<Download className="w-3.5 h-3.5" />} label="Sohbeti Dışa Aktar" onClick={() => {
                    const data = JSON.stringify(messages.map(m => ({ text: m.text, sender: m.senderId, date: new Date((m.createdAt as any).seconds * 1000).toLocaleString() })), null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sohbet-export.json`; a.click();
                  }} />

                  <ActionButton icon={<Trash2 className="w-3.5 h-3.5" />} label="Sohbeti Temizle" color="text-rose-500 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20" onClick={async () => {
                    if (window.confirm('Tüm mesajları silmek istediğinize emin misiniz? Bu işlem her iki taraf için de siler.')) {
                      await messageService.clearConversation(activeConversationId);
                    }
                  }} />
                </div>
              </div>

              <div className="p-3 border-t border-[var(--border-color)] text-center">
                <p className="text-[9px] text-[var(--text-secondary)] tracking-widest uppercase">KVKK Kapsamında Kayıt Altına Alınır</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="p-2 md:p-3 bg-[var(--bg-paper)] border-t border-[var(--border-color)] flex-shrink-0 z-40">
        <div className="max-w-4xl mx-auto">
          <EnhancedComposer />
        </div>
      </div>
    </div>
  );
};

const SettingsToggle: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onToggle: () => void; isWarning?: boolean }> = ({ icon, label, isActive, onToggle, isWarning }) => (
  <div className={`p-2.5 rounded-lg bg-[var(--bg-default)] border ${isWarning ? 'border-rose-500/30' : 'border-[var(--border-color)]'}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={isWarning ? 'text-rose-500' : 'text-[var(--text-secondary)]'}>{icon}</div>
        <span className={`text-[11px] font-medium block leading-none ${isWarning ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{label}</span>
      </div>
      <button onClick={onToggle} className={`relative w-8 h-4 rounded-full transition-all flex-shrink-0 ${isActive ? (isWarning ? 'bg-rose-500' : 'bg-[var(--accent-color)]') : 'bg-gray-300 dark:bg-gray-700'}`}>
        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
      </button>
    </div>
  </div>
);

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; color?: string; onClick?: () => void }> = ({ icon, label, color = 'text-[var(--text-primary)] hover:bg-[var(--bg-default)] border-transparent', onClick }) => (
  <button onClick={onClick} className={`w-full p-2.5 rounded-lg border transition-all text-left flex items-center gap-2 ${color}`}>
    <div className="opacity-70">{icon}</div>
    <span className="text-[11px] font-medium">{label}</span>
  </button>
);
