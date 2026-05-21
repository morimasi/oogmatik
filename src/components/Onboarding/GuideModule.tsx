import React, { useState } from 'react';
import { X, ChevronRight, BookOpen, Lightbulb, Target, Sparkles, ArrowRight, MousePointer, Layers, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GuideModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-paper)] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-lexend"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--accent-color)] rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">Rehber Merkezi</h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Platform kullanım kılavuzu</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Section Tabs */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
                  activeSection === i
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <s.icon className="w-3 h-3" />
                {s.title}
              </button>
            ))}
          </div>

          {/* Active Section Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2"
            >
              {sections[activeSection].items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-black text-[var(--accent-color)]">{idx + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <div className="flex gap-1">
            {sections.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all ${i === activeSection ? 'w-6 bg-[var(--accent-color)]' : 'w-1 bg-[var(--border-color)]'}`} />
            ))}
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95">
            Anladım
          </button>
        </div>
      </motion.div>
    </div>
  );
};
