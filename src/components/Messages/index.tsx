import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Settings } from 'lucide-react';
import { useMessagesStore } from './store/useMessagesStore';
import { useMessages } from './hooks/useMessages';
import { ContactPanel } from './panels/ContactPanel';
import { ConversationPanel } from './panels/ConversationPanel';
import { EmptyState } from './panels/EmptyState';
import { NotificationToast } from './components/NotificationToast';
import { NotificationSettings } from './components/NotificationSettings';
import { useAuthStore } from '../../store/useAuthStore';
import { messageService } from './services/messageService';
import { useState } from 'react';

interface MessagesModuleProps {
  onBack: () => void;
  onRefreshNotifications?: () => void;
}

export const MessagesModule: React.FC<MessagesModuleProps> = ({ onBack, onRefreshNotifications }) => {
  const { activeContactId, contacts, setActiveContactId, unreadCount } = useMessagesStore();
  const { user } = useAuthStore();
  const [showSettings, setShowSettings] = useState(false);

  const activeContact = contacts.find((c) => c.id === activeContactId) || null;

  useEffect(() => {
    if (user?.id && onRefreshNotifications) {
      messageService.getUnreadCount(user.id).then((count) => {
        useMessagesStore.getState().setUnreadCount(count);
        onRefreshNotifications();
      });
    }
  }, [user?.id]);

  useEffect(() => {
    useMessagesStore.getState().setActiveContactId(null);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-paper)] border border-[var(--border-color)] shadow-2xl backdrop-blur-md rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[var(--surface-glass)] border-b border-[var(--border-color)] backdrop-blur-xl flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Mesajlar</h2>
              <p className="text-[9px] font-medium text-[var(--text-secondary)]">
                {unreadCount > 0
                  ? `${unreadCount} okunmamış mesaj`
                  : 'Tüm mesajlar okundu'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] transition-all"
                title="Bildirim Ayarları"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <NotificationSettings open={showSettings} onClose={() => setShowSettings(false)} />
            </div>
            <button
              onClick={onBack}
              className="w-7 h-7 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] transition-all hover:scale-105"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Contact Panel - Desktop: sidebar, Mobile: full width when no active chat */}
          <div className={`${
            activeContact ? 'hidden lg:flex' : 'flex'
          } w-full lg:w-80 shrink-0 flex-col`}>
            <ContactPanel onSelectContact={setActiveContactId} />
          </div>

          {/* Conversation Panel */}
          <div className={`${
            activeContact ? 'flex' : 'hidden lg:flex'
          } flex-1 flex-col overflow-hidden`}>
            {activeContact ? (
              <ConversationPanel
                contact={activeContact}
                onBack={() => setActiveContactId(null)}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-bold text-[var(--text-muted)]">Firebase Realtime</span>
            </div>
            <span className="text-[8px] text-[var(--text-muted)]">
              {contacts.length} kişi • {new Date().toLocaleDateString('tr-TR')}
            </span>
          </div>
          <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            {user?.name || 'Kullanıcı'}
          </span>
        </div>

        {/* Floating Notification Toast */}
        <NotificationToast />
      </motion.div>
    </div>
  );
};

export default MessagesModule;
