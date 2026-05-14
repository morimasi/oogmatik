import React from 'react';
import { ConversationList } from './Core/ConversationList';
import { ChatWindow } from './Core/ChatWindow';
import { ThreadPanel } from './Features/ThreadPanel';
import { ArchivePanel } from './Features/ArchivePanel';
import { useMessageStore } from '../../store/useMessageStore';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

export const MessagingModule: React.FC = () => {
    const { activeThreadId } = useMessageStore();
    const { setIsSidebarOpen } = useUIStore();
    const { user } = useAuthStore();
    const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);

    // Yetki Kontrolü: Admin veya Öğretmen mi?
    const canViewArchive = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'teacher');

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

            {/* Ana Sohbet Penceresi veya Arşiv */}
            <div className="flex-1 relative bg-[radial-gradient(circle_at_center,_#0f1115_0%,_#050505_100%)]">
                {isArchiveOpen ? (
                    <ArchivePanel onClose={() => setIsArchiveOpen(false)} />
                ) : (
                    <>
                        <ChatWindow />
                        
                        {/* Arşiv Butonu (Floating) */}
                        {canViewArchive && (
                            <button
                                onClick={() => setIsArchiveOpen(true)}
                                className="absolute top-4 right-20 z-20 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all shadow-xl backdrop-blur-md flex items-center gap-2 group"
                                title="Güvenli Arşiv"
                            >
                                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[100px]">Arşiv Modu</span>
                            </button>
                        )}
                    </>
                )}
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
