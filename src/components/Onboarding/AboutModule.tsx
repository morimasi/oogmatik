import React, { useState } from 'react';
import { X, Users, Target, Award, Globe, Heart, Mail, Twitter, Linkedin, Github, CheckCircle, TrendingUp, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AboutModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('mission');

  const stats = [
    { label: 'Öğrenci', value: '50K+', icon: Users, color: 'indigo' },
    { label: 'Etkinlik', value: '1M+', icon: Sparkles, color: 'purple' },
    { label: 'Kurum', value: '500+', icon: Award, color: 'emerald' },
    { label: 'Ülke', value: '25+', icon: Globe, color: 'amber' }
  ];

  const team = [
    { name: 'Dr. Elif Yıldız', role: 'Kurucu & Pedagoji', avatar: '👩‍🏫' },
    { name: 'Ahmet Kaya', role: 'Teknoloji Direktörü', avatar: '👨‍💻' },
    { name: 'Selin Arslan', role: 'AI Direktörü', avatar: '👩‍🔬' },
    { name: 'Bora Demir', role: 'Ürün Direktörü', avatar: '👨‍🎨' }
  ];

  const values = [
    { icon: Heart, title: 'Erişilebilirlik', description: 'Eğitimi herkes için ulaşılabilir kılıyoruz' },
    { icon: Target, title: 'İnovasyon', description: 'AI ile öğrenme deneyimini yeniden tanımlıyoruz' },
    { icon: Users, title: 'Topluluk', description: 'Güçlü bir eğitimci ekosistemi oluşturuyoruz' },
    { icon: ShieldCheck, title: 'Güven', description: 'En yüksek veri ve pedagoji standartları' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[130] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-['Lexend']"
      >
        {/* Header - Ultra Premium */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-2xl shadow-[var(--accent-muted)]">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Oogmatik <span className="text-[var(--accent-color)]">Vizyonu</span></h2>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Eğitimde Geleceği İnşa Ediyoruz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Dynamic Navigation */}
        <div className="flex bg-[var(--bg-secondary)]/30 border-b border-[var(--border-color)]">
          {['mission', 'team', 'values', 'contact'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden ${
                activeTab === tab 
                  ? 'text-[var(--accent-color)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]'
              }`}
            >
              {tab === 'mission' ? 'Misyon' : tab === 'team' ? 'Ekibimiz' : tab === 'values' ? 'Değerler' : 'İletişim'}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent-color)] shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {activeTab === 'mission' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, i) => (
                      <div key={i} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] text-center group hover:border-[var(--accent-color)]/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-paper)] flex items-center justify-center mx-auto mb-4 border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                          <stat.icon className="w-6 h-6 text-[var(--accent-color)]" />
                        </div>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter mb-1">{stat.value}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-[var(--accent-muted)] to-transparent p-10 rounded-[3rem] border border-[var(--accent-color)]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                      <Sparkles className="w-32 h-32 text-[var(--accent-color)]" />
                    </div>
                    <div className="relative z-10 max-w-3xl">
                      <h3 className="text-3xl font-black text-[var(--text-primary)] mb-6 tracking-tight uppercase italic leading-none">Eğitimde <span className="text-[var(--accent-color)]">Fırsat Eşitliği</span> İçin.</h3>
                      <p className="text-lg font-medium text-[var(--text-secondary)] leading-relaxed opacity-80 mb-8">
                        Oogmatik, özel öğrenme güçlüğü yaşayan çocuklar için geliştirilmiş AI destekli eğitim platformudur. 
                        Disleksi, DEHB ve diğer öğrenme farklılıklarına sahip öğrencilerin potansiyellerini tam olarak ortaya çıkarmalarını sağlıyoruz.
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent-color)]">
                          <CheckCircle className="w-4 h-4" /> Kişiselleştirilmiş Planlar
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent-color)]">
                          <CheckCircle className="w-4 h-4" /> AI Destekli Analiz
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {team.map((member, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ y: -8 }}
                      className="text-center p-8 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] group hover:border-[var(--accent-color)]/40 transition-all shadow-sm"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-[var(--accent-color)] to-purple-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-xl shadow-[var(--accent-muted)] rotate-3 group-hover:rotate-0 transition-transform">
                        {member.avatar}
                      </div>
                      <h4 className="text-lg font-black text-[var(--text-primary)] mb-1 uppercase tracking-tighter">{member.name}</h4>
                      <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest opacity-80">{member.role}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {activeTab === 'values' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <div key={index} className="flex gap-6 p-8 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem] hover:bg-[var(--surface-elevated)] transition-all group">
                      <div className="w-16 h-16 bg-[var(--accent-muted)] rounded-[1.5rem] flex items-center justify-center shrink-0 border border-[var(--accent-color)]/20 shadow-lg shadow-[var(--accent-muted)] group-hover:scale-110 transition-transform">
                        <value.icon className="w-8 h-8 text-[var(--accent-color)]" />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter italic">{value.title}</h4>
                        <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed opacity-70">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto py-10">
                  <h3 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase italic leading-none">Bize <span className="text-[var(--accent-color)]">Ulaşın.</span></h3>
                  <p className="text-lg font-medium text-[var(--text-secondary)] mb-12 opacity-70 leading-relaxed">
                    Sorularınız, önerileriniz veya iş birliği talepleriniz için uzman ekibimizle iletişime geçin.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
                    {[
                      { icon: Mail, label: 'E-posta', val: 'info@oogmatik.com' },
                      { icon: Phone, label: 'Telefon', val: '+90 212 555 0123' },
                      { icon: Globe, label: 'Konum', val: 'İstanbul, TR' }
                    ].map((item, i) => (
                      <div key={i} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl group hover:border-[var(--accent-color)]/30 transition-all">
                        <item.icon className="w-8 h-8 text-[var(--accent-color)] mx-auto mb-4 transition-transform group-hover:scale-110" />
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-black text-[var(--text-primary)] tracking-tight">{item.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    {[Twitter, Linkedin, Github].map((Icon, i) => (
                      <button key={i} className="w-14 h-14 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-primary)] rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm hover:shadow-xl hover:shadow-[var(--accent-muted)]">
                        <Icon className="w-6 h-6" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer - Minimalist Premium */}
        <div className="px-8 py-5 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">© 2026 Oogmatik EdTech Solutions · EST 2004</p>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
