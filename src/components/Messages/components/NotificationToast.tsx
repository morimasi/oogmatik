import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, FileIcon, Clock } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useMessagesStore } from '../store/useMessagesStore';
import { useState, useEffect } from 'react';

export const NotificationToast: React.FC = () => {
  const { notifications, dismissNotification, dismissAll, openMessagesAndNavigate } =
    useNotifications();
  const { dismissAllNotifications } = useMessagesStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.length > 1 && (
        <div className="pointer-events-auto flex justify-end">
          <button
            onClick={dismissAllNotifications}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-paper)]/90 backdrop-blur-sm border border-[var(--border-color)] text-[9px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-lg"
          >
            <CheckCheck className="w-3 h-3" />
            Tümünü Kapat ({notifications.length})
          </button>
        </div>
      )}

      <AnimatePresence>
        {notifications.slice(0, 5).map((n: any) => (
          <ToastItem
            key={n.id}
            notification={n}
            onDismiss={dismissNotification}
            onNavigate={openMessagesAndNavigate}
          />
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

interface ToastItemProps {
  notification: {
    id: string;
    messageId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  onDismiss: (id: string) => void;
  onNavigate: (senderId: string, messageId: string, notificationId: string) => void;
}

const AUTO_DISMISS_MS = 6000;

const ToastItem: React.FC<ToastItemProps> = ({ notification: n, onDismiss, onNavigate }) => {
  const [progress, setProgress] = useState(100);
  const [paused, setPaused] = useState(false);
  const isFile = n.content.startsWith('[Dosya]') || n.content.includes('📎');

  // Auto-dismiss progress bar
  useEffect(() => {
    if (paused) return;
    const interval = 50; // ms
    const step = (interval / AUTO_DISMISS_MS) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(n.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [paused, n.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="pointer-events-auto bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden cursor-pointer group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => onNavigate(n.senderId, n.messageId, n.id)}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          {/* Avatar */}
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
              {n.senderName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {isFile ? (
                  <FileIcon className="w-3 h-3 text-[var(--accent-color)] shrink-0" />
                ) : (
                  <Bell className="w-3 h-3 text-[var(--accent-color)] shrink-0" />
                )}
                <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest truncate">
                  {n.senderName}
                </span>
                <span className="text-[8px] text-[var(--text-muted)] shrink-0 flex items-center gap-0.5">
                  <Clock className="w-2 h-2" />
                  {new Date(n.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug line-clamp-2">
                {n.content}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(n.id);
            }}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--surface-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shrink-0 opacity-0 group-hover:opacity-100"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-[var(--bg-secondary)]">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-color)] to-purple-500 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};
