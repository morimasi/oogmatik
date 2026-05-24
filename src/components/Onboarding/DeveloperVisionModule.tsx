import React from 'react';
import { X, Code, Cpu, Database, Cloud, Shield, Zap, Mail, ExternalLink, Layers, GitBranch, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const DeveloperVisionModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const techStack = [
    { category: 'Frontend', items: [
      { icon: Code, name: 'React 18 + TypeScript', desc: 'Strict mode, tip güvenliği' },
      { icon: Zap, name: 'Vite', desc: 'Hızlı build, HMR' },
      { icon: Layers, name: 'Tailwind + Framer Motion', desc: 'Glassmorphism UI, animasyonlar' }
    ]},
    { category: 'AI & Backend', items: [
      { icon: Cpu, name: 'Gemini 1.5 Flash', desc: 'AI içerik üretimi, OCR' },
      { icon: Cloud, name: 'Vercel Serverless', desc: 'API endpointleri, edge functions' },
      { icon: Database, name: 'Firebase', desc: 'Auth, Firestore, Storage' }
    ]},
    { category: 'Güvenlik & Kalite', items: [
      { icon: Shield, name: 'Zod Validation', desc: 'Tip güvenli doğrulama' },
      { icon: GitBranch, name: 'Vitest', desc: 'Unit test, coverage' },
      { icon: Terminal, name: 'ESLint + Prettier', desc: 'Kod standardizasyonu' }
    ]}
  ];

  const principles = [
    'Her içerik gerçek bir çocuğa ulaşır — hata toleransı sıfır',
    'Disleksi dostu tasarım: Lexend font, geniş satır aralığı',
    'KVKK uyumlu veri yönetimi — öğrenci gizliliği öncelikli',
    'MEB Özel Eğitim Yönetmeliği ve 573 KHK uyumlu içerik',
    'Tanı koyucu dil yasak — destek odaklı yaklaşım'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-paper)] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-lexend"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--accent-color)] rounded-xl flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">Geliştirici Vizyonu</h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Teknik altyapı & prensipler</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Tech Stack */}
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Teknoloji Yığını</h3>
            <div className="space-y-2">
              {techStack.map((stack, i) => (
                <div key={i}>
                  <h4 className="text-[9px] font-bold text-[var(--accent-color)] uppercase tracking-wider mb-1">{stack.category}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {stack.items.map((item, j) => (
                      <div key={j} className="p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                        <div className="w-6 h-6 rounded-md bg-[var(--accent-muted)] flex items-center justify-center mb-1.5">
                          <item.icon className="w-3 h-3 text-[var(--accent-color)]" />
                        </div>
                        <h5 className="text-[9px] font-bold text-[var(--text-primary)]">{item.name}</h5>
                        <p className="text-[8px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Architecture Principles */}
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Mimari Prensipler</h3>
            <div className="space-y-1">
              {principles.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-[var(--bg-secondary)] rounded-lg">
                  <div className="w-4 h-4 rounded bg-[var(--accent-muted)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[7px] font-black text-[var(--accent-color)]">{i + 1}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)]">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="p-3 bg-[var(--accent-muted)] rounded-xl border border-[var(--accent-color)]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)] flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-[var(--accent-color)]">Geliştirici İletişim</h4>
                <a href="mailto:morimasi@gmail.com" className="text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors flex items-center gap-1">
                  morimasi@gmail.com <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-[8px] text-[var(--text-muted)] mt-0.5">Teknik destek, işbirliği ve lisans talepleri için</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <p className="text-[9px] text-[var(--text-muted)]">bdmind v2.0 — AI Destekli Eğitim Platformu</p>
          <button onClick={onClose} className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95">
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
