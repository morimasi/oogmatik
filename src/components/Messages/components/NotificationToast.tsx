import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useMessagesStore } from '../store/useMessagesStore';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification, markRead, navigateToConversation } =
    useNotifications();
  const { setActiveContactId } = useMessagesStore();

  return (
    <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 5).map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="pointer-events-auto bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden cursor-pointer group"
            onClick={() => {
              markRead(n.id);
              setActiveContactId(n.senderId);
            }}
          >
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Bell className="w-3 h-3 text-[var(--accent-color)]" />
                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest truncate">
                      {n.senderName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                    {n.content}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(n.id);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="h-0.5 bg-gradient-to-r from-[var(--accent-color)] to-purple-500" />
          </motion.div>
        ))}
      </AnimatePresence>

      {notifications.length > 5 && (
        <div className="pointer-events-auto text-center text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          +{notifications.length - 5} bildirim daha
        </div>
      )}
    </div>
  );
};
