import React, { useEffect, useState, useCallback } from 'react';
import { IMessage } from '../../../types/messaging';
import { Trash2, Shield, Calendar, Search, ArrowLeft, RefreshCw, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { messageService } from '../../../services/messaging/messageService';
import { messageScheduler } from '../../../services/messaging/messageScheduler';
import { Timestamp } from 'firebase/firestore';

interface ArchivePanelProps {
  onClose: () => void;
}

function formatTime(ts: Timestamp | null | undefined): string {
  if (!ts) return '';
  const date = ts.toMillis ? new Date(ts.toMillis()) : new Date((ts as unknown as Record<string, number>).seconds * 1000);
  return date.toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDaysRemaining(deletedAt: Timestamp | null | undefined): number {
  if (!deletedAt) return 30;
  const deletedMs = deletedAt.toMillis ? deletedAt.toMillis() : (deletedAt as unknown as Record<string, number>).seconds * 1000;
  const expiresMs = deletedMs + 30 * 24 * 60 * 60 * 1000;
  const remainingMs = expiresMs - Date.now();
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

export const ArchivePanel: React.FC<ArchivePanelProps> = ({ onClose }) => {
  const [deletedMessages, setDeletedMessages] = useState<IMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadDeleted = useCallback(() => {
    setIsLoading(true);
    messageService.getDeletedMessages().then((msgs) => {
      setDeletedMessages(msgs);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    loadDeleted();
  }, [loadDeleted]);

  const handleRestore = async (msg: IMessage) => {
    setRestoringId(msg.id);
    try {
      await messageService.restoreMessage(msg.conversationId, msg.id);
      setDeletedMessages(prev => prev.filter(m => m.id !== msg.id));
    } catch {
    } finally {
      setRestoringId(null);
    }
  };

  const filtered = deletedMessages.filter(msg => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (msg.text?.toLowerCase().includes(search) || msg.id.toLowerCase().includes(search));
  });

  const retentionDays = messageScheduler.getRetentionDays();

  return (
    <div className="flex flex-col h-full bg-[#050505] font-lexend">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="p-1.5 md:p-2 bg-red-500/20 rounded-lg text-red-400 flex-shrink-0">
            <Shield className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-white truncate">Güvenli Mesaj Arşivi</h2>
            <p className="text-[10px] md:text-xs text-white/40 truncate">Silinen mesajlar {retentionDays} gün saklanır</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDeleted}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 md:p-4 bg-white/5 border-b border-white/5">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Arşivde ara..."
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-white/20">
            <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs md:text-sm">Arşiv taranıyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 md:h-64 text-white/20">
            <Shield className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-30" />
            <p className="text-sm md:text-base text-white/30">Silinmiş mesaj bulunamadı</p>
            <p className="text-[10px] md:text-xs text-white/20 mt-2">Mesajlar silindiğinde {retentionDays} gün burada görünecek</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] md:text-xs text-white/30">{filtered.length} silinmiş mesaj</span>
            </div>
            {filtered.map((msg, i) => {
              const daysLeft = getDaysRemaining(msg.deletedAt);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-[8px] md:text-[10px] text-accent-primary font-bold flex-shrink-0">
                          {msg.senderId.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs md:text-sm font-medium text-white truncate">
                          Kullanıcı #{msg.senderId.slice(0, 6)}
                        </span>
                        <span className="text-[10px] md:text-xs text-white/30 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTime(msg.deletedAt)}
                        </span>
                      </div>

                      <div className="relative mt-2">
                        <p className="text-xs md:text-sm text-white/60 italic line-through decoration-red-500/30 line-clamp-2">
                          {msg.text || "Dosya mesajı"}
                        </p>
                        <div className="mt-2 flex items-center gap-2 md:gap-3 flex-wrap">
                          <span className="text-[9px] md:text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> Silinmiş
                          </span>
                          <span className={`text-[9px] md:text-xs inline-flex items-center gap-1 ${
                            daysLeft < 3 ? 'text-yellow-400' : 'text-white/30'
                          }`}>
                            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {daysLeft} gün kaldı
                          </span>
                          {daysLeft < 3 && (
                            <span className="text-[9px] md:text-xs text-yellow-400 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> Kalıcı silinecek
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestore(msg)}
                      disabled={restoringId === msg.id}
                      className="p-2 md:p-2.5 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-xl border border-accent-primary/30 transition-all disabled:opacity-50 flex-shrink-0"
                      title="Geri yükle"
                    >
                      {restoringId === msg.id ? (
                        <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
