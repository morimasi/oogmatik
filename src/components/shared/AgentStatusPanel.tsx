import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, ChevronDown, CheckCircle2 } from 'lucide-react';
import type { AgentDefinition } from '../../services/agentService';

interface AgentStatusPanelProps {
  agents: readonly AgentDefinition[];
  isActive: boolean;
}

/**
 * Ajan Kadrosu Rozeti
 * Uygulama açılışında etkinleştirilen 13 Ordinaryüs ajanın durumunu
 * sağ altta küçük bir rozet olarak gösterir; tıklanınca kadro listesi açılır.
 */
export const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ agents, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const total = agents.length;

  return (
    <div className="fixed bottom-5 right-5 z-[900] font-lexend">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="mb-3 w-[320px] max-h-[60vh] overflow-y-auto rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          >
            <div className="px-5 pt-4 pb-3 border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-secondary)]/95 backdrop-blur-2xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Ajan Kadrosu
              </h4>
              <p className="text-[11px] font-bold text-[var(--text-primary)] mt-1">
                {total} Ordinaryüs Uzman · {isActive ? 'Koordinasyon Aktif' : 'Koordinasyon Pasif'}
              </p>
            </div>
            <ul className="p-3 space-y-1.5">
              {agents.map((agent, index) => (
                <li
                  key={agent.id}
                  className="flex items-start gap-2.5 rounded-2xl px-3 py-2 hover:bg-[var(--bg-tertiary)]/60 transition-colors"
                >
                  <span className="mt-0.5 shrink-0 w-5 text-[10px] font-black text-[var(--text-muted)] tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight truncate">
                      {agent.name}
                    </p>
                    <p className="text-[9px] text-[var(--text-muted)] leading-snug">{agent.title}</p>
                  </div>
                  <CheckCircle2
                    size={13}
                    className={`ml-auto mt-0.5 shrink-0 ${isActive ? 'text-emerald-500' : 'text-zinc-400'}`}
                  />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur-xl px-4 py-2.5 shadow-lg hover:scale-[1.03] active:scale-95 transition-transform"
      >
        <span className="relative flex h-2 w-2">
          {isActive && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`}
          />
        </span>
        <Users size={13} className="text-[var(--text-secondary)]" />
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)]">
          {isActive ? `${total}/${total} Ajan Aktif` : 'Ajanlar Pasif'}
        </span>
        <ChevronDown
          size={13}
          className={`text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
};

export default AgentStatusPanel;
