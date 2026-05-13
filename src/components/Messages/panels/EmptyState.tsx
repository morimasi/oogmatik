import { MessageSquare } from 'lucide-react';

export const EmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center h-full bg-[var(--bg-primary)] p-8">
    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center mb-4">
      <MessageSquare className="w-7 h-7 text-[var(--text-muted)]" />
    </div>
    <h3 className="text-base font-black text-[var(--text-primary)] mb-1 uppercase tracking-tight italic">
      Mesajlar
    </h3>
    <p className="text-xs text-[var(--text-secondary)] text-center max-w-xs leading-relaxed">
      Bir konuşma başlatmak için sol taraftan bir kişi seçin veya yeni bir mesaj gönderin.
    </p>
  </div>
);
