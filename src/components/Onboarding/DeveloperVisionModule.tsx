import React, { useState } from 'react';
import { X, Code, Zap, Rocket, GitBranch, Database, Cloud, Shield, Users, BookOpen, Terminal, Cpu, Globe, ArrowRight, CheckCircle, Star, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DeveloperVisionModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('architecture');

  const techStack = [
    { name: 'React 18', icon: Code, color: 'indigo', description: 'UI Framework' },
    { name: 'TypeScript', icon: Terminal, color: 'blue', description: 'Type Safety' },
    { name: 'Node.js', icon: Cpu, color: 'emerald', description: 'Server Runtime' },
    { name: 'Firebase', icon: Database, color: 'amber', description: 'Infrastructure' },
    { name: 'Vercel', icon: Cloud, color: 'purple', description: 'Edge Hosting' },
    { name: 'Gemini AI', icon: Zap, color: 'rose', description: 'Core Intelligence' }
  ];

  const architecture = [
    {
      title: 'Modüler Frontend',
      description: 'Ölçeklenebilir UI sistemi',
      features: ['React 18 + TS', 'Tailwind & Framer', 'Zustand State', 'Vite Optimizer']
    },
    {
      title: 'Serverless Backend',
      description: 'Dinamik servis yapısı',
      features: ['Firebase Cloud', 'RESTful APIs', 'Real-time Sync', 'Global Storage']
    },
    {
      title: 'AI Pipeline',
      description: 'Gelişmiş içerik motoru',
      features: ['Gemini 2.5 Flash', 'Dynamic Prompts', 'Token Optimization', 'Vision OCR']
    }
  ];

  const roadmap = [
    {
      phase: 'Faz 1',
      title: 'Temeller',
      status: 'completed',
      features: ['Çekirdek Platform', 'AI Entegrasyonu', 'Temel Analitik', 'Üyelik Sistemi']
    },
    {
      phase: 'Faz 2',
      title: 'Genişleme',
      status: 'current',
      features: ['Gelişmiş AI Modülleri', 'Mobil Uygulamalar', 'API Platformu', 'Grup Yönetimi']
    },
    {
      phase: 'Faz 3',
      title: 'İnovasyon',
      status: 'upcoming',
      features: ['AI Eğitmen', 'VR Deneyimi', 'Blokzincir Sertifika', 'Global Genişleme']
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[140] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full max-w-7xl max-h-[85vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-['Lexend']"
      >
        {/* Header - Engineering Excellence Look */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-secondary)] to-transparent">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[var(--text-primary)] text-[var(--bg-paper)] rounded-2xl flex items-center justify-center shadow-2xl rotate-3">
              <Terminal className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Geliştirici <span className="text-[var(--accent-color)]">Vizyonu</span></h2>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">Technology & Innovation Roadmap</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90 border border-transparent hover:border-[var(--border-color)]"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Dynamic Sub-Navigation */}
        <div className="flex bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] overflow-x-auto">
          {[
            { id: 'architecture', label: 'Mimari', icon: Database },
            { id: 'techstack', label: 'Teknoloji', icon: Code },
            { id: 'roadmap', label: 'Yol Haritası', icon: Rocket }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 px-10 py-5 text-xs font-black uppercase tracking-widest transition-all relative ${
                activeSection === tab.id
                  ? 'text-[var(--accent-color)] bg-[var(--bg-paper)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeSection === tab.id && (
                <motion.div layoutId="devTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-color)] shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
              )}
            </button>
          ))}
        </div>

        {/* Engineering Content Area */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {activeSection === 'architecture' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {architecture.map((item, index) => (
                    <div key={index} className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem] group hover:border-[var(--accent-color)]/30 transition-all shadow-sm">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center mb-6 border border-[var(--border-color)] text-[var(--accent-color)] group-hover:scale-110 transition-transform">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <h4 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter italic">{item.title}</h4>
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 opacity-70">{item.description}</p>
                      <ul className="space-y-3">
                        {item.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'techstack' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {techStack.map((tech, index) => (
                    <div key={index} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] text-center hover:bg-[var(--surface-elevated)] transition-all group">
                      <div className="w-14 h-14 bg-[var(--bg-paper)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] group-hover:rotate-12 transition-transform shadow-sm">
                        <tech.icon className="w-7 h-7 text-[var(--accent-color)]" />
                      </div>
                      <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-1">{tech.name}</h4>
                      <p className="text-[10px] font-bold text-[var(--text-muted)]">{tech.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'roadmap' && (
                <div className="space-y-4">
                  {roadmap.map((phase, index) => (
                    <div key={index} className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] relative overflow-hidden group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${
                            phase.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            phase.status === 'current' ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20' :
                            'bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border-color)]'
                          }`}>
                            {phase.status === 'completed' ? <CheckCircle className="w-7 h-7" /> : 
                             phase.status === 'current' ? <Zap className="w-7 h-7 animate-pulse" /> : 
                             <Rocket className="w-7 h-7 opacity-30" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest opacity-60">{phase.phase}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                phase.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                phase.status === 'current' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-zinc-500/10 text-zinc-500'
                              }`}>
                                {phase.status === 'completed' ? 'Tamamlandı' : phase.status === 'current' ? 'Devam Ediyor' : 'Planlanıyor'}
                              </span>
                            </div>
                            <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">{phase.title}</h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 border-l border-[var(--border-color)] pl-8">
                          {phase.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-secondary)]">
                              <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-30" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Technical Footer */}
        <div className="px-10 py-6 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Platform Status: Operational</p>
            </div>
            <p className="hidden md:block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Build: 2.5.0-Stable</p>
          </div>
          <button
            onClick={onClose}
            className="px-10 py-4 bg-[var(--text-primary)] text-[var(--bg-paper)] text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Terminali Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
