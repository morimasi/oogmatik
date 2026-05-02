import React, { useState } from 'react';
import { X, ChevronRight, BookOpen, Lightbulb, Target, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GuideModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      icon: BookOpen,
      title: 'Başlangıç Rehberi',
      description: 'Platformu hızlıca öğrenin',
      color: 'blue',
      items: [
        'Dashboard navigasyonu',
        'İlk etkinliği oluşturma',
        'Öğrenci profilleri',
        'Temel özellikler'
      ]
    },
    {
      icon: Lightbulb,
      title: 'İpuçları & Püf Noktaları',
      description: 'Verimliliği artırın',
      color: 'amber',
      items: [
        'Kısayollar ve hızlı erişim',
        'AI asistan kullanımı',
        'Şablonlar ve kütüphane',
        'En iyi uygulamalar'
      ]
    },
    {
      icon: Target,
      title: 'Hedef Belirleme',
      description: 'Öğrenme hedefleri oluşturun',
      color: 'emerald',
      items: [
        'Kişiselleştirilmiş planlar',
        'İlerleme takibi',
        'Başarı metrikleri',
        'Raporlama'
      ]
    },
    {
      icon: Zap,
      title: 'Hızlı Başlangıç',
      description: '5 dakikada hazır olun',
      color: 'purple',
      items: [
        'Hızlı kurulum',
        'Demo etkinlikler',
        'Test modu',
        'Yayına alım'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-['Lexend']"
      >
        {/* Header - Ultra Premium SaaS */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--accent-muted)]">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight uppercase">Rehber Merkezi</h2>
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Platform kullanım kılavuzu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Modern Grid */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === index;
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  onClick={() => setActiveSection(index)}
                  className={`p-6 rounded-3xl border cursor-pointer transition-all relative overflow-hidden group ${
                    isActive 
                      ? 'bg-[var(--accent-muted)] border-[var(--accent-color)] shadow-xl shadow-[var(--accent-muted)]' 
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--text-muted)]/30'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Icon className="w-24 h-24 text-[var(--accent-color)]" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-[var(--accent-color)] text-white' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-black ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {section.title}
                      </h3>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider opacity-60">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2 relative z-10">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[var(--accent-color)]' : 'bg-[var(--text-muted)]/30'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-opacity ${isActive ? 'text-[var(--accent-color)]' : 'opacity-0'}`}>
                    Detayları Görüntüle <ArrowRight className="w-3 h-3" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer - Minimalist Premium */}
        <div className="px-8 py-6 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <div className="flex gap-1.5">
            {sections.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeSection ? 'w-8 bg-[var(--accent-color)]' : 'w-1.5 bg-[var(--border-color)]'
                }`} 
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-[var(--accent-muted)] transition-all active:scale-95 flex items-center gap-2"
          >
            Anladım, Teşekkürler
          </button>
        </div>
      </motion.div>
    </div>
  );
};
