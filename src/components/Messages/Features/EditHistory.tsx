import React from 'react';
import { IMessageEdit } from '../../../types/messaging';
import { Timestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { History, X, Clock } from 'lucide-react';

interface EditHistoryProps {
  editHistory: IMessageEdit[];
  onClose: () => void;
}

function formatEditTime(ts: Timestamp): string {
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

export const EditHistory: React.FC<EditHistoryProps> = ({ editHistory, onClose }) => {
  if (!editHistory || editHistory.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0f1115] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <History className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Düzenleme Geçmişi</h3>
              <p className="text-xs text-white/40">{editHistory.length} değişiklik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {editHistory.map((edit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-8 pb-4 border-l-2 border-white/5 last:border-transparent last:pb-0"
            >
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-accent-primary/20 border-2 border-accent-primary flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-white/30">
                  <Clock className="w-3 h-3" />
                  <span>{formatEditTime(edit.editedAt as unknown as Timestamp)}</span>
                  {index === 0 && (
                    <span className="px-2 py-0.5 bg-accent-primary/10 text-accent-primary text-[10px] rounded-full font-medium">Son</span>
                  )}
                </div>
                <p className="text-sm text-white/70 italic line-clamp-3 leading-relaxed">
                  &ldquo;{edit.previousText}&rdquo;
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            Tüm düzenlemeler KVKK kapsamında kayıt altına alınır
          </p>
        </div>
      </div>
    </motion.div>
  );
};
