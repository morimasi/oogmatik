import React, { useState } from 'react';
import { X, ChevronRight, Map, Layout, Users, FileText, BarChart3, Settings, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TourModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      icon: Layout,
      title: 'Ana Panel (Dashboard)',
      description: 'Tüm modüllerinize tek noktadan erişim',
      details: [
        'Sol menü: Stüdyolar, Defterler, Raporlar ve Ayarlar',
        'Hızlı erişim kartları: Son kullanılan içerikler',
        'Bildirimler: Yeni güncellemeler ve AI tamamlamaları',
        'Arama çubuğu: Ctrl+K ile anında erişim'
      ],
      tip: 'Dashboard\'u sık kullandığınız modüllere göre özelleştirebilirsiniz.'
    },
    {
      icon: Sparkles,
      title: 'AI Stüdyoları',
      description: 'Kişiselleştirilmiş içerik üretim merkezi',
      details: [
        'Süper Türkçe: MEB uyumlu okuma-yazma etkinlikleri',
        'Matematik: Görsel problem ve bulmaca üretimi',
        'Sarı Kitap: Disleksi dostu okuma materyalleri',
        'OCR: Fotoğraf/PDF\'den aktivite klonlama'
      ],
      tip: 'Yaş grubu ve zorluk seviyesini seçin, AI 30 saniyede üretsin.'
    },
    {
      icon: Users,
      title: 'Öğrenci Yönetimi',
      description: 'Profil oluşturma ve ilerleme takibi',
      details: [
        'Yeni öğrenci ekleme: Yaş, sınıf, öğrenme profili',
        'BEP hedefleri: Bireysel eğitim planı oluşturma',
        'İlerleme paneli: Tamamlanan aktiviteler ve başarı',
        'Veli erişimi: Güvenli rapor paylaşımı'
      ],
      tip: 'Her öğrenci için farklı öğrenme profilleri tanımlayabilirsiniz.'
    },
    {
      icon: FileText,
      title: 'Çalışma Defteri',
      description: 'Aktiviteleri birleştir ve düzenle',
      details: [
        'Workbook oluştur: Birden fazla aktiviteyi bir araya getir',
        'Sıralama: Drag-and-drop ile aktivite düzeni',
        'Şablonlar: Hazır şablonlardan hızlı başlangıç',
        'Export: PDF olarak indir veya yazdır'
      ],
      tip: 'Defterleri diğer öğretmenlerle paylaşarak işbirliği yapın.'
    },
    {
      icon: BarChart3,
      title: 'Bilişsel Değerlendirme',
      description: 'Disleksi tarama ve analiz merkezi',
      details: [
        'Tarama testi: 4 alt test bataryası',
        'Radar grafik: Bilişsel profil görselleştirme',
        'AI analiz: Otomatik öneriler ve yönlendirmeler',
        'Takip: Zaman içinde ilerleme karşılaştırması'
      ],
      tip: 'Test sonuçlarını BEP hedefleri ile eşleştirin.'
    },
    {
      icon: Settings,
      title: 'Ayarlar & Entegrasyonlar',
      description: 'Platform yapılandırma ve özelleştirme',
      details: [
        'Profil ayarları: Hesap bilgileri ve tercihler',
        'Bildirimler: E-posta ve platform içi ayarlar',
        'API entegrasyonları: MEB ve okul sistemleri',
        'Veri yönetimi: Export, import ve yedekleme'
      ],
      tip: 'Tema ve dil tercihlerinizi burada özelleştirebilirsiniz.'
    }
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
              <Map className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">Platform Turu</h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">bdmind'i adım adım keşfet</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveStep(i)}
                  className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all ${
                    i === activeStep
                      ? 'bg-[var(--accent-color)] text-white'
                      : i < activeStep
                      ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                  }`}
                >
                  {i + 1}
                </button>
                {i < steps.length - 1 && <div className={`w-3 h-px ${i < activeStep ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'}`} />}
              </div>
            ))}
          </div>

          {/* Active Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
                  {React.createElement(steps[activeStep].icon, { className: 'w-5 h-5 text-[var(--accent-color)]' })}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text-primary)]">{steps[activeStep].title}</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">{steps[activeStep].description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {steps[activeStep].details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-[var(--bg-secondary)] rounded-lg">
                    <ChevronRight className="w-3 h-3 text-[var(--accent-color)] mt-0.5 shrink-0" />
                    <span className="text-[10px] text-[var(--text-secondary)]">{detail}</span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-[var(--accent-muted)] rounded-lg border border-[var(--accent-color)]/20">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-3 h-3 text-[var(--accent-color)] mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-[var(--accent-color)]">{steps[activeStep].tip}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-4 py-2 text-[10px] font-bold text-[var(--text-muted)] rounded-xl transition-all disabled:opacity-30 hover:text-[var(--text-primary)]"
          >
            ← Geri
          </button>
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {activeStep + 1} / {steps.length}
          </span>
          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              İleri <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95"
            >
              Turu Tamamla
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
