import React, { useState } from 'react';
import { X, Search, MessageCircle, Phone, Mail, Star, Clock, CheckCircle, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PremiumHelpModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    { icon: MessageCircle, label: 'Canlı Sohbet', color: 'indigo', description: 'Anında yanıt' },
    { icon: Mail, label: 'E-posta', color: 'emerald', description: '24 saat içinde' },
    { icon: Phone, label: 'Telefon', color: 'purple', description: 'İş saatleri' },
    { icon: ShieldCheck, label: 'Uzman Desteği', color: 'amber', description: 'Öncelikli' }
  ];

  const faqCategories = [
    {
      title: 'Genel Sorular',
      items: ['Nasıl başlanır?', 'Fiyatlandırma', 'Özellikler', 'Sistem gereksinimleri']
    },
    {
      title: 'Teknik Destek',
      items: ['Giriş sorunları', 'Etkinlik oluşturma', 'AI asistan', 'Export işlemleri']
    },
    {
      title: 'Eğitim & Gelişim',
      items: ['Video tutorial', 'Dokümantasyon', 'Webinar', 'Workshop']
    }
  ];

  const recentTickets = [
    { id: '#12345', title: 'AI asistan kullanımı', status: 'resolved', time: '2 saat önce' },
    { id: '#12344', title: 'Export sorunu', status: 'pending', time: '5 saat önce' },
    { id: '#12343', title: 'Öğrenci ekleme', status: 'resolved', time: '1 gün önce' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[85vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-['Lexend']"
      >
        {/* Header - Premium SaaS Design */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-[var(--accent-muted)]">
              <Star className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Premium <span className="text-[var(--accent-color)]">Destek</span></h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Destek Ekibi Çevrimiçi</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex relative mr-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Yardım merkezinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-color)] outline-none min-w-[240px] transition-all"
              />
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Minimalist Sidebar Tabs */}
          <div className="w-20 sm:w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-4 flex flex-col gap-2">
            {[
              { id: 'chat', label: 'Canlı Sohbet', icon: MessageCircle },
              { id: 'faq', label: 'Sıkça Sorulanlar', icon: Search },
              { id: 'tickets', label: 'Destek Talepleri', icon: Mail },
              { id: 'docs', label: 'Dokümantasyon', icon: ExternalLink }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-muted)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-glass)]'
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="hidden sm:block text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
            
            <div className="mt-auto p-4 rounded-3xl bg-[var(--accent-muted)] border border-[var(--accent-color)]/20 hidden sm:block">
              <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-1">VIP Status</p>
              <p className="text-[11px] font-medium text-[var(--text-primary)] leading-tight">Sizin için öncelikli destek aktif.</p>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full"
              >
                {activeTab === 'chat' && (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                    <div className="w-24 h-24 bg-[var(--accent-muted)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--accent-color)]/20 rotate-3">
                      <MessageCircle className="w-12 h-12 text-[var(--accent-color)]" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter italic">Profesyonel Sohbet</h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 opacity-70">Uzman ekibimizle anında iletişime geçin. Ortalama yanıt süremiz 2 dakikadır.</p>
                    <button className="w-full py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[var(--accent-muted)] transition-all active:scale-95 flex items-center justify-center gap-3">
                      Sohbeti Başlat <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-8">
                    <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-6">Merak Edilenler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {faqCategories.map((category, idx) => (
                        <div key={idx} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl hover:border-[var(--accent-color)]/30 transition-all group">
                          <h4 className="text-xs font-black text-[var(--accent-color)] uppercase tracking-widest mb-4">{category.title}</h4>
                          <ul className="space-y-3">
                            {category.items.map((item, i) => (
                              <li key={i} className="flex items-center justify-between text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors group/item">
                                {item}
                                <ArrowRight className="w-3 h-3 opacity-0 group-item-hover:opacity-100 transition-all -translate-x-2 group-item-hover:translate-x-0" />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'tickets' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Destek Geçmişi</h3>
                      <button className="px-5 py-2 bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">Yeni Talep</button>
                    </div>
                    <div className="grid gap-3">
                      {recentTickets.map((ticket) => (
                        <div key={ticket.id} className="p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl flex items-center justify-between hover:bg-[var(--surface-elevated)] transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] border border-[var(--border-color)]">
                              {ticket.id}
                            </div>
                            <div>
                              <p className="text-sm font-black text-[var(--text-primary)]">{ticket.title}</p>
                              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{ticket.time}</p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {ticket.status === 'resolved' ? 'Çözüldü' : 'Bekliyor'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                    <div className="w-24 h-24 bg-[var(--accent-muted)] rounded-3xl flex items-center justify-center mb-6 border border-[var(--accent-color)]/20 -rotate-3">
                      <ExternalLink className="w-12 h-12 text-[var(--accent-color)]" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter italic">Bilgi Bankası</h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 opacity-70">Görsel eğitimler, dökümanlar ve teknik rehberlerin tamamına buradan ulaşabilirsiniz.</p>
                    <button className="w-full py-4 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                      Kütüphaneyi Aç <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer - Compact Info */}
        <div className="px-8 py-5 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Çalışma Saatleri: 09:00 - 18:00</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">SLA: %99.9 Yanıt Oranı</p>
            </div>
          </div>
          <p className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest opacity-80">Premium Member Only Content</p>
        </div>
      </motion.div>
    </div>
  );
};
