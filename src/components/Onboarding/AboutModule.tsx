import React from 'react';
import { X, Heart, Target, Eye, Users, Award, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const values = [
    { icon: Heart, title: 'Kapsayıcılık', desc: 'Her çocuk öğrenmeyi hak eder' },
    { icon: Target, title: 'Bilimsellik', desc: 'Kanıt temelli pedagojik yaklaşım' },
    { icon: Eye, title: 'Şeffaflık', desc: 'Açık veri, gizlilik odaklı tasarım' },
    { icon: Users, title: 'İşbirliği', desc: 'Öğretmen-aile-uzman ekosistemi' },
    { icon: Award, title: 'Kalite', desc: 'MEB standartları uyumlu içerik' },
    { icon: Sparkles, title: 'Yenilik', desc: 'AI destekli kişiselleştirme' }
  ];

  const team = [
    { role: 'Kurucu & Baş Geliştirici', name: 'Oogmatik Ekibi', desc: 'Full-stack geliştirme, AI entegrasyonları' },
    { role: 'Pedagojik Danışman', name: 'Özel Eğitim Uzmanları', desc: 'MEB uyumu, BEP hedefleri, disleksi protokolleri' },
    { role: 'Klinik Danışman', name: 'Çocuk Psikologları', desc: 'Bilişsel değerlendirme, DEHB stratejileri' },
    { role: 'Topluluk', name: '500+ Öğretmen', desc: 'Beta test, geri bildirim, içerik üretimi' }
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
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">Hakkımızda</h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Misyon, vizyon & ekip</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mission & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-wider mb-1">Misyon</h3>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                Disleksi ve özel öğrenme güçlüğü yaşayan her çocuğa, AI destekli kişiselleştirilmiş eğitim materyalleri sunarak öğrenme eşitsizliğini ortadan kaldırmak.
              </p>
            </div>
            <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <h3 className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-wider mb-1">Vizyon</h3>
              <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                Türkiye'nin en kapsayıcı eğitim teknolojisi platformu olarak, her öğretmenin 5 dakikada profesyonel materyal üretmesini sağlamak.
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Değerlerimiz</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {values.map((v, i) => (
                <div key={i} className="p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="w-6 h-6 rounded-md bg-[var(--accent-muted)] flex items-center justify-center mb-1.5">
                    <v.icon className="w-3 h-3 text-[var(--accent-color)]" />
                  </div>
                  <h4 className="text-[9px] font-bold text-[var(--text-primary)]">{v.title}</h4>
                  <p className="text-[8px] text-[var(--text-muted)] mt-0.5">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Ekibimiz</h3>
            <div className="space-y-1.5">
              {team.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--text-primary)]">{t.role}</p>
                    <p className="text-[9px] text-[var(--accent-color)] font-bold">{t.name}</p>
                    <p className="text-[8px] text-[var(--text-muted)] mt-0.5">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 bg-[var(--accent-muted)] rounded-xl border border-[var(--accent-color)]/20">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-black text-[var(--accent-color)]">500+</p>
                <p className="text-[8px] font-bold text-[var(--text-muted)]">Öğretmen</p>
              </div>
              <div>
                <p className="text-lg font-black text-[var(--accent-color)]">10K+</p>
                <p className="text-[8px] font-bold text-[var(--text-muted)]">Üretim</p>
              </div>
              <div>
                <p className="text-lg font-black text-[var(--accent-color)]">50K+</p>
                <p className="text-[8px] font-bold text-[var(--text-muted)]">Öğrenci</p>
              </div>
              <div>
                <p className="text-lg font-black text-[var(--accent-color)]">%98</p>
                <p className="text-[8px] font-bold text-[var(--text-muted)]">Memnuniyet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <p className="text-[9px] text-[var(--text-muted)]">© 2026 Oogmatik. Tüm hakları saklı.</p>
          <button onClick={onClose} className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95">
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
