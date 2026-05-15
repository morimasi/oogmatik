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
    <div className="flex flex-col h-full bg-[var(--bg-default)] font-lexend">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-paper)] shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[13px] font-bold text-[var(--text-primary)] truncate">Güvenli Mesaj Arşivi</h2>
            <p className="text-[9px] text-[var(--text-secondary)] truncate">Silinen mesajlar {retentionDays} gün saklanır</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={loadDeleted} className="p-2 hover:bg-[var(--bg-default)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Yenile">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-default)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 bg-[var(--bg-paper)] border-b border-[var(--border-color)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <input type="text" placeholder="Arşivde ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-default)] border border-[var(--border-color)] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--text-secondary)]">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs">Arşiv taranıyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[var(--text-secondary)] text-center px-4">
            <Shield className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-xs font-semibold mb-1">Silinmiş mesaj bulunamadı</p>
            <p className="text-[9px] opacity-70">Mesajlar silindiğinde {retentionDays} gün burada görünecek</p>
          </div>
        ) : (
          <>
            <div className="px-1 py-0.5 text-[9px] text-[var(--text-secondary)] font-medium uppercase tracking-wider">{filtered.length} Arşiv Kaydı</div>
            {filtered.map((msg, i) => {
              const daysLeft = getDaysRemaining(msg.deletedAt);
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-amber-500/30 transition-all group shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <div className="w-6 h-6 rounded-lg bg-[var(--bg-default)] border border-[var(--border-color)] flex items-center justify-center text-[9px] text-[var(--text-secondary)] font-bold flex-shrink-0">
                          {msg.senderId.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                          Kullanıcı #{msg.senderId.slice(0, 4)}
                        </span>
                        <span className="text-[9px] text-[var(--text-secondary)] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTime(msg.deletedAt)}
                        </span>
                      </div>

                      <div className="relative mt-2">
                        <p className="text-[11px] text-[var(--text-secondary)] italic line-through decoration-rose-500/40 line-clamp-2">
                          {msg.text || "Dosya mesajı"}
                        </p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                            <Trash2 className="w-3 h-3" /> Silinmiş
                          </span>
                          <span className={`text-[9px] flex items-center gap-1 font-medium ${daysLeft < 3 ? 'text-amber-500' : 'text-[var(--text-secondary)]'}`}>
                            <Clock className="w-3 h-3" /> {daysLeft} gün kaldı
                          </span>
                          {daysLeft < 3 && (
                            <span className="text-[9px] text-amber-500 flex items-center gap-1 font-medium">
                              <AlertTriangle className="w-3 h-3" /> Kalıcı silinecek
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button onClick={() => handleRestore(msg)} disabled={restoringId === msg.id}
                      className="p-2 bg-[var(--bg-default)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] border border-[var(--border-color)] rounded-lg transition-all disabled:opacity-50 flex-shrink-0" title="Geri yükle">
                      {restoringId === msg.id ? <div className="w-3.5 h-3.5 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
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
