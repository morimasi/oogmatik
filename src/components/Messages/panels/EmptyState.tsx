import { motion } from 'framer-motion';
import { MessageSquare, Users, ArrowRight, Paperclip, Quote, Reply } from 'lucide-react';

export const EmptyState: React.FC = () => {
  const features = [
    { icon: Paperclip, label: 'Dosya Gönder', desc: 'PDF, DOCX, görsel, ses ve video' },
    { icon: Quote, label: 'Alıntı Yap', desc: 'Metni seçerek veya mesajı tıklayarak' },
    { icon: Reply, label: 'Yanıtla', desc: 'Threaded konuşma akışı' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[var(--bg-primary)] p-8 select-none">
      {/* Ana ikon */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center shadow-2xl shadow-[var(--accent-color)]/30">
          <MessageSquare className="w-11 h-11 text-white" />
        </div>
        {/* Floating dekor */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center"
        >
          <Users className="w-4 h-4 text-purple-400" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <h3 className="text-base font-black text-[var(--text-primary)] mb-1.5">
          Mesajlaşmaya Başlayın
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Sol panelden bir kişiyi seçin ve güvenli, anlık mesajlaşma deneyiminin tadını çıkarın.
        </p>
      </motion.div>

      {/* Özellik kartları */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-2 w-full max-w-xs"
      >
        {features.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.07 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:bg-[var(--surface-glass)] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[var(--accent-color)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest">
                {label}
              </p>
              <p className="text-[9px] text-[var(--text-muted)]">{desc}</p>
            </div>
            <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest"
      >
        Firebase Realtime • Uçtan Uca Güvenli
      </motion.p>
    </div>
  );
};
