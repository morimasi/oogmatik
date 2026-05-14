import React from 'react';
import { ConversationList } from './Core/ConversationList';
import { ChatWindow } from './Core/ChatWindow';
import { ThreadPanel } from './Features/ThreadPanel';
import { useMessageStore } from '../../store/useMessageStore';
import { useUIStore } from '../../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';

export const MessagingModule: React.FC = () => {
    const { activeThreadId } = useMessageStore();
    const { setIsSidebarOpen } = useUIStore();

    React.useLayoutEffect(() => {
        setIsSidebarOpen(false);
        // Force body class if needed for global CSS overrides
        document.body.classList.add('messaging-active');
        return () => {
            document.body.classList.remove('messaging-active');
        };
    }, [setIsSidebarOpen]);

    return (
        <div className="flex h-full bg-[#050505] overflow-hidden font-lexend">
            {/* Sohbet Listesi Sol Panel */}
            <div className="w-80 border-r border-white/5 bg-[#0a0a0a]">
                <ConversationList />
            </div>

            {/* Ana Sohbet Penceresi */}
            <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_#0f1115_0%,_#050505_100%)]">
                <ChatWindow />
            </div>

            {/* Thread (Yanıt Dizisi) Paneli - Koşullu Gösterim */}
            <AnimatePresence>
                {activeThreadId && (
                    <motion.div 
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-96 border-l border-white/5 bg-[#0a0a0a] shadow-2xl z-20"
                    >
                        <ThreadPanel />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
