import React, { useState, useEffect } from 'react';
import { X, ChevronRight, BookOpen, Target, Sparkles, ArrowRight, MousePointer, Layers, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';

export const GuideModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState(0);

  // Keep track of which sections the user has viewed
  const [viewedSections, setViewedSections] = useState<number[]>([0]);

  const sections = [
    {
      icon: BookOpen,
      title: 'İlk Adımlar',
      description: 'Platforma hızlı giriş',
      color: 'indigo',
      items: [
        { title: 'Dashboard\'a Giriş', desc: 'Ana panel navigasyonu, sol menü ve hızlı erişim butonları' },
        { title: 'Öğrenci Profili Oluşturma', desc: 'Yeni öğrenci ekleme, yaş grubu ve öğrenme profili belirleme' },
        { title: 'İlk Etkinlik Üretimi', desc: 'AI ile 30 saniyede kişiselleştirilmiş çalışma kağıdı oluşturma' },
        { title: 'PDF Export & Yazdırma', desc: 'A4 çıktı alma, kompakt düzen ve yazıcı ayarları' }
      ]
    },
    {
      icon: Wand2,
      title: 'AI Stüdyoları',
      description: 'Akıllı içerik üretimi',
      color: 'violet',
      items: [
        { title: 'Süper Türkçe Stüdyosu', desc: 'MEB uyumlu Türkçe etkinlikleri AI ile üretin' },
        { title: 'Matematik Stüdyosu', desc: 'Görsel denklem, bulmaca ve problem üretimi' },
        { title: 'Sarı Kitap', desc: 'Disleksi dostu okuma materyalleri oluşturma' },
        { title: 'OCR Tarama', desc: 'Fotoğraf/PDF\'den aktivite klonlama ve varyasyon üretme' }
      ]
    },
    {
      icon: Layers,
      title: 'Çalışma Defteri',
      description: 'İçerik organizasyonu',
      color: 'emerald',
      items: [
        { title: 'Workbook Oluşturma', desc: 'Birden fazla aktiviteyi tek defterde birleştirme' },
        { title: 'Sıralama & Düzenleme', desc: 'Drag-and-drop ile aktivite sıralama' },
        { title: 'Paylaşım', desc: 'Defteri diğer öğretmenlerle paylaşma' },
        { title: 'Şablon Kullanımı', desc: 'Hazır şablonlardan hızlı başlangıç' }
      ]
    },
    {
      icon: Target,
      title: 'İlerleme Takibi',
      description: 'Analiz ve raporlama',
      color: 'amber',
      items: [
        { title: 'Öğrenci İlerleme Paneli', desc: 'Tamamlanan aktiviteler ve başarı oranları' },
        { title: 'Bilişsel Değerlendirme', desc: 'Disleksi tarama testi ve radar grafik analizi' },
        { title: 'BEP Hedefleri', desc: 'Bireysel eğitim planı hedef takibi' },
        { title: 'Rapor Export', desc: 'PDF rapor oluşturma ve veliye gönderme' }
      ]
    },
    {
      icon: MousePointer,
      title: 'Kısayollar & İpuçları',
      description: 'Verimlilik artırıcı',
      color: 'rose',
      items: [
        { title: 'Klavye Kısayolları', desc: 'Ctrl+K: Arama, Ctrl+N: Yeni etkinlik, Ctrl+P: Yazdır' },
        { title: 'Hızlı Üretim', desc: 'Ayarları kaydet, sonraki üretimde otomatik uygula' },
        { title: 'Toplu İşlem', desc: 'Birden fazla aktiviteyi aynı anda üret ve dışa aktar' },
        { title: 'Offline Mod', desc: 'İnternet olmadan önceden üretilmiş içeriklere erişim' }
      ]
    }
  ];

  const isMandatory = user ? localStorage.getItem(`bdmind_guide_completed_${user.id}`) !== 'true' : false;
  const allSectionsViewed = viewedSections.length === sections.length;

  const handleSectionChange = (index: number) => {
    setActiveSection(index);
    if (!viewedSections.includes(index)) {
      setViewedSections((prev) => [...prev, index]);
    }
  };

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      handleSectionChange(activeSection + 1);
    }
  };

  const handleComplete = () => {
    if (user) {
      localStorage.setItem(`bdmind_guide_completed_${user.id}`, 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-paper)] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-lexend"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-color)] rounded-xl flex items-center justify-center shadow-lg shadow-[var(--accent-color)]/25">
              <BookOpen className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">bdmind Hızlı Kurulum Rehberi</h2>
              <p className="text-[9px] font-black text-[var(--accent-color)] uppercase tracking-wider">
                {isMandatory ? 'İlk kullanım için zorunlu kurulum adımları' : 'Platform kullanım kılavuzu'}
              </p>
            </div>
          </div>
          {!isMandatory && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info Banner for Mandatory mode */}
        {isMandatory && (
          <div className="bg-[var(--accent-muted)] px-5 py-2.5 border-b border-[var(--accent-color)]/20 flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--accent-color)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              Lütfen platformu kullanmaya başlamadan önce tüm rehber bölümlerini okuyunuz.
            </span>
            <span className="text-[10px] font-black text-[var(--accent-color)] bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full">
              {viewedSections.length} / {sections.length} Bölüm Okundu
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Section Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1.5 scrollbar-thin">
            {sections.map((s, i) => {
              const isViewed = viewedSections.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleSectionChange(i)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
                    activeSection === i
                      ? 'bg-[var(--accent-color)] text-white border-transparent shadow-md shadow-[var(--accent-color)]/20'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]/30'
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  <span>{s.title}</span>
                  {isMandatory && isViewed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Section Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              <div className="pb-2 border-b border-[var(--border-color)]">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{sections[activeSection].description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections[activeSection].items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all duration-300 group hover:shadow-md hover:shadow-black/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[var(--accent-color)] group-hover:text-white transition-colors duration-300">
                        <span className="text-[9px] font-black text-[var(--accent-color)] group-hover:text-white">{idx + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors duration-300">{item.title}</h4>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-1">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between gap-4">
          <div className="flex gap-1.5">
            {sections.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeSection
                    ? 'w-7 bg-[var(--accent-color)]'
                    : viewedSections.includes(i)
                    ? 'w-1.5 bg-emerald-500'
                    : 'w-1.5 bg-[var(--border-color)]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isMandatory ? (
              <>
                {activeSection < sections.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    Sonraki Bölüm <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={!allSectionsViewed}
                    className={`px-6 py-2.5 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg ${
                      allSectionsViewed
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25'
                        : 'bg-zinc-400 dark:bg-zinc-700 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {allSectionsViewed ? 'Okudum, Platformu Başlat! 🎉' : `Bölümleri Okuyun (${viewedSections.length}/${sections.length})`}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95"
              >
                Anladım, Kapat
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
