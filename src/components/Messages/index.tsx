import React from 'react';
import { ConversationList } from './Core/ConversationList';
import { ChatWindow } from './Core/ChatWindow';
import { ThreadPanel } from './Features/ThreadPanel';
import { ArchivePanel } from './Features/ArchivePanel';
import { ToastNotification } from './Notification/ToastNotification';
import { useMessageStore } from '../../store/useMessageStore';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

export const MessagingModule: React.FC = () => {
  const { activeThreadId, activeConversationId } = useMessageStore();
  const { setIsSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const [showMobileList, setShowMobileList] = React.useState(true);

  React.useLayoutEffect(() => {
    setIsSidebarOpen(false);
    document.body.classList.add('messaging-active');
    return () => document.body.classList.remove('messaging-active');
  }, [setIsSidebarOpen]);

  React.useEffect(() => { if (activeConversationId) setShowMobileList(false); }, [activeConversationId]);

  const canViewArchive = user && ['admin', 'superadmin', 'teacher'].includes(user.role);

  return (
    <div className="flex h-full bg-[#050505] overflow-hidden font-lexend relative">
      <ToastNotification />
      <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-[260px] border-r border-white/5 bg-[#0a0a0a] absolute md:relative inset-0 z-30 md:z-auto`}>
        <ConversationList />
      </div>
      <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 relative bg-[#050505]`}>
        {isArchiveOpen ? <ArchivePanel onClose={() => setIsArchiveOpen(false)} /> : (
          <>
            <ChatWindow />
            {canViewArchive && (
              <button onClick={() => setIsArchiveOpen(true)}
                className="hidden md:flex absolute top-3 right-16 z-20 p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all shadow-lg backdrop-blur-md items-center gap-1.5 group">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[100px]">Arşiv</span>
              </button>
            )}
          </>
        )}
      </div>
      <AnimatePresence>
        {activeThreadId && (
          <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden md:flex w-80 border-l border-white/5 bg-[#0a0a0a] shadow-2xl z-20">
            <ThreadPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
