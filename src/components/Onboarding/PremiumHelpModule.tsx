import React, { useState } from 'react';
import { X, CircleHelp, Mail, MessageCircle, Phone, Clock, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PremiumHelpModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'AI içerik üretimi ne kadar sürer?',
      a: 'Gemini 1.5 Flash ile ortalama 15-30 saniye. Karmaşık çoklu aktivite üretimleri 1 dakikayı geçmez.'
    },
    {
      q: 'Ücretsiz plan ile Premium arasındaki fark nedir?',
      a: 'Ücretsiz: 50 üretim/ay. Premium: Sınırsız üretim, OCR klonlama, BEP entegrasyonu, öncelikli destek.'
    },
    {
      q: 'Öğrenci verileri güvende mi?',
      a: 'KVKK uyumlu. Veriler Firebase\'te şifreli saklanır. Tanı bilgileri ve skorlar ayrı tutulur.'
    },
    {
      q: 'MEB müfredatına uygun mu?',
      a: 'Evet. Tüm içerikler MEB Özel Eğitim Yönetmeliği ve 573 KHK uyumlu hazırlanır.'
    },
    {
      q: 'Offline çalışabilir miyim?',
      a: 'Önceden üretilmiş içeriklere internet olmadan erişebilirsiniz. Yeni üretim için bağlantı gerekir.'
    },
    {
      q: 'Toplu lisans nasıl alınır?',
      a: 'Okul/kurum lisansları için morimasi@gmail.com adresinden iletişime geçin.'
    }
  ];

  const supportChannels = [
    {
      icon: Mail,
      title: 'E-posta Desteği',
      value: 'morimasi@gmail.com',
      desc: '24 saat içinde yanıt',
      color: 'indigo'
    },
    {
      icon: MessageCircle,
      title: 'Canlı Destek',
      value: 'Platform içi chat',
      desc: 'Pzt-Cuma 09:00-18:00',
      color: 'emerald'
    },
    {
      icon: Phone,
      title: 'Telefon Desteği',
      value: 'Premium kullanıcılara özel',
      desc: 'Randevu ile görüntülü görüşme',
      color: 'violet'
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
              <CircleHelp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">Premium Yardım</h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Destek kanalları & SSS</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Support Channels */}
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Destek Kanalları</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {supportChannels.map((ch, i) => (
                <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center mb-2">
                    <ch.icon className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  </div>
                  <h4 className="text-[10px] font-bold text-[var(--text-primary)]">{ch.title}</h4>
                  <p className="text-[9px] text-[var(--accent-color)] font-bold mt-0.5">{ch.value}</p>
                  <p className="text-[8px] text-[var(--text-muted)] mt-0.5">{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SLA */}
          <div className="p-3 bg-[var(--accent-muted)] rounded-xl border border-[var(--accent-color)]/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              <h4 className="text-[10px] font-black text-[var(--accent-color)]">Premium SLA Garantisi</h4>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px]">
              <div>
                <p className="text-[var(--text-muted)]">Yanıt Süresi</p>
                <p className="font-bold text-[var(--text-primary)]">&lt; 4 saat</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">Çözüm Oranı</p>
                <p className="font-bold text-[var(--text-primary)]">%95</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">Uptime</p>
                <p className="font-bold text-[var(--text-primary)]">%99.9</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Sık Sorulan Sorular</h3>
            <div className="space-y-1.5">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--bg-tertiary)] transition-all"
                  >
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">{faq.q}</span>
                    {activeFaq === i ? <ChevronUp className="w-3 h-3 text-[var(--text-muted)]" /> : <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-3 pb-3 text-[10px] text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>Destek: Pzt-Cuma 09:00-18:00</span>
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95">
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
