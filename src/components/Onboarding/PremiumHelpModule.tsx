import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  CircleHelp,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Search,
  Send,
  AlertTriangle,
  Zap,
  Bug,
  Lightbulb,
  FileText,
  Star,
  Loader2,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useAuthStore';
import { feedbackService, FeedbackPriority } from '../../services/feedbackService';
import { FeedbackItem, FeedbackCategory } from '../../types';

type HelpTab = 'faq' | 'ticket' | 'contact';

const FAQ_ITEMS = [
  {
    q: 'AI içerik üretimi ne kadar sürer?',
    a: 'Gemini 2.5 Flash ile ortalama 15-30 saniye. Karmaşık çoklu aktivite üretimleri 1 dakikayı geçmez.',
    tag: 'Teknik',
  },
  {
    q: 'Ücretsiz plan ile Premium arasındaki fark nedir?',
    a: 'Ücretsiz: 50 üretim/ay. Premium: Sınırsız üretim, OCR klonlama, BEP entegrasyonu, öncelikli destek.',
    tag: 'Abonelik',
  },
  {
    q: 'Öğrenci verileri güvende mi?',
    a: 'KVKK uyumlu. Veriler Firebase\'te şifreli saklanır. Tanı bilgileri ve skorlar ayrı tutulur.',
    tag: 'Güvenlik',
  },
  {
    q: 'MEB müfredatına uygun mu?',
    a: 'Evet. Tüm içerikler MEB Özel Eğitim Yönetmeliği ve 573 KHK uyumlu hazırlanır.',
    tag: 'Müfredat',
  },
  {
    q: 'Offline çalışabilir miyim?',
    a: 'Önceden üretilmiş içeriklere internet olmadan erişebilirsiniz. Yeni üretim için bağlantı gerekir.',
    tag: 'Teknik',
  },
  {
    q: 'Toplu lisans nasıl alınır?',
    a: 'Okul/kurum lisansları için morimasi@gmail.com adresinden iletişime geçin.',
    tag: 'Abonelik',
  },
  {
    q: 'Hata bulursam ne yapmalıyım?',
    a: 'Destek Talebi sekmesinden "Hata Bildirimi" kategorisi ile detaylı bir talep oluşturun. Ekran görüntüsü eklemeyi unutmayın.',
    tag: 'Destek',
  },
  {
    q: 'Özellik önerim varsa?',
    a: 'Destek Talebi sekmesinden "Özellik İsteği" kategorisi ile önerinizi paylaşın. Tüm öneriler değerlendirilir.',
    tag: 'Destek',
  },
];

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'bug', label: 'Hata Bildirimi', icon: <Bug className="w-4 h-4" />, desc: 'Çalışmayan özellik', },
  { id: 'feature', label: 'Özellik İsteği', icon: <Lightbulb className="w-4 h-4" />, desc: 'Yeni talep', },
  { id: 'content', label: 'İçerik Hatası', icon: <FileText className="w-4 h-4" />, desc: 'Soru/metin hatası', },
  { id: 'general', label: 'Genel Görüş', icon: <MessageCircle className="w-4 h-4" />, desc: 'Görüş ve öneri', },
];

const PRIORITIES: { id: FeedbackPriority; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'low', label: 'Düşük', icon: <span className="text-[10px]">●</span>, color: 'text-zinc-400' },
  { id: 'medium', label: 'Orta', icon: <Zap className="w-3 h-3" />, color: 'text-blue-400' },
  { id: 'high', label: 'Yüksek', icon: <AlertTriangle className="w-3 h-3" />, color: 'text-amber-400' },
  { id: 'urgent', label: 'Acil', icon: <Zap className="w-3 h-3" />, color: 'text-rose-400' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'new': { label: 'Yeni', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'read': { label: 'Okundu', color: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' },
  'in-progress': { label: 'İşleniyor', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  'replied': { label: 'Yanıtlandı', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  'resolved': { label: 'Çözüldü', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bug: <Bug className="w-3 h-3" />,
  feature: <Lightbulb className="w-3 h-3" />,
  content: <FileText className="w-3 h-3" />,
  general: <MessageCircle className="w-3 h-3" />,
};

export const PremiumHelpModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<HelpTab>('faq');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqSearch, setFaqSearch] = useState('');

  // Ticket form state
  const [ticketCategory, setTicketCategory] = useState<FeedbackCategory>('bug');
  const [ticketPriority, setTicketPriority] = useState<FeedbackPriority>('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketRating, setTicketRating] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // User tickets
  const [myTickets, setMyTickets] = useState<FeedbackItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const loadMyTickets = useCallback(async () => {
    if (!user?.id) return;
    setLoadingTickets(true);
    try {
      const tickets = await feedbackService.getFeedbacksByUser(user.id);
      setMyTickets(tickets);
    } catch {
      // silent
    } finally {
      setLoadingTickets(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === 'ticket') {
      loadMyTickets();
    }
  }, [activeTab, loadMyTickets]);

  const filteredFaqs = FAQ_ITEMS.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.tag.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await feedbackService.submitFeedback({
        userId: user?.id,
        userName: user?.name || 'Misafir',
        userEmail: user?.email || '',
        activityType: 'Destek Talebi',
        activityTitle: `${CATEGORIES.find((c) => c.id === ticketCategory)?.label || 'Genel'} — ${PRIORITIES.find((p) => p.id === ticketPriority)?.label || 'Orta'}`,
        rating: ticketRating,
        category: ticketCategory,
        message: ticketMessage,
        priority: ticketPriority,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTicketMessage('');
        setTicketRating(0);
        setTicketPriority('medium');
        setTicketCategory('bug');
        loadMyTickets();
      }, 2500);
    } catch {
      alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-[var(--border-color)] flex flex-col font-['Lexend']"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--accent-color)] rounded-lg flex items-center justify-center">
              <CircleHelp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--text-primary)] tracking-tight">Yardım & Destek</h2>
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">SSS · Destek Talebi · İletişim</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-[var(--bg-paper)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          {[
            { id: 'faq' as HelpTab, label: 'SSS', icon: <CircleHelp className="w-3 h-3" /> },
            { id: 'ticket' as HelpTab, label: 'Destek Talebi', icon: <Send className="w-3 h-3" /> },
            { id: 'contact' as HelpTab, label: 'İletişim', icon: <Mail className="w-3 h-3" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* === FAQ TAB === */}
          {activeTab === 'faq' && (
            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Soru ara..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] outline-none transition-all"
                />
              </div>

              {/* FAQ List */}
              <div className="space-y-1.5">
                {filteredFaqs.length === 0 && (
                  <p className="text-center text-[11px] text-[var(--text-muted)] py-8">Sonuç bulunamadı.</p>
                )}
                {filteredFaqs.map((faq, i) => (
                  <div key={i} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--bg-paper)] transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-bold text-[var(--text-primary)] truncate">{faq.q}</span>
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[7px] font-bold bg-[var(--accent-muted)] text-[var(--accent-color)] uppercase">
                          {faq.tag}
                        </span>
                      </div>
                      {activeFaq === i ? (
                        <ChevronUp className="w-3 h-3 text-[var(--text-muted)] shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0 ml-2" />
                      )}
                    </button>
                    <AnimatePresence>
                      {activeFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="px-3 pb-3 text-[10px] text-[var(--text-secondary)] leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === TICKET TAB === */}
          {activeTab === 'ticket' && (
            <div className="p-4 space-y-4">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-12 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-black text-[var(--text-primary)] mb-1">Talebiniz Alındı!</h3>
                    <p className="text-[10px] text-[var(--text-muted)]">En kısa sürede size dönüş yapacağız.</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmitTicket} className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Kategori</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setTicketCategory(cat.id)}
                            className={`p-2.5 rounded-xl text-left transition-all border ${
                              ticketCategory === cat.id
                                ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                                : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)]/30'
                            }`}
                          >
                            <div className={`mb-1 ${ticketCategory === cat.id ? 'text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}>
                              {cat.icon}
                            </div>
                            <span className="block text-[10px] font-bold text-[var(--text-primary)]">{cat.label}</span>
                            <p className="text-[8px] text-[var(--text-muted)]">{cat.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Öncelik</label>
                      <div className="flex gap-1.5">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setTicketPriority(p.id)}
                            className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                              ticketPriority === p.id
                                ? 'bg-[var(--accent-color)] text-white'
                                : `bg-[var(--bg-secondary)] ${p.color} hover:bg-[var(--bg-paper)]`
                            }`}
                          >
                            {p.icon}
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                        Mesajınız <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-color)] outline-none transition-all resize-none"
                        placeholder={
                          ticketCategory === 'bug'
                            ? 'Hatanın oluşma adımlarını yazın...'
                            : ticketCategory === 'feature'
                            ? 'İstediğiniz özelliği açıklayın...'
                            : 'Mesajınızı yazın...'
                        }
                      />
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Puanınız (isteğe bağlı)</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setTicketRating(ticketRating === star ? 0 : star)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              ticketRating >= star ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <Star className="w-4 h-4" fill={ticketRating >= star ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSending || !ticketMessage.trim()}
                      className="w-full py-3 bg-[var(--accent-color)] text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Talep Gönder
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* My Tickets */}
              {!showSuccess && (
                <div className="border-t border-[var(--border-color)] pt-4">
                  <h3 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Inbox className="w-3 h-3" />
                    Taleplerim ({myTickets.length})
                  </h3>
                  {loadingTickets ? (
                    <div className="py-6 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-color)] mx-auto" />
                    </div>
                  ) : myTickets.length === 0 ? (
                    <p className="text-center text-[10px] text-[var(--text-muted)] py-6">Henüz talebiniz yok.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                      {myTickets.map((ticket) => (
                        <div key={ticket.id} className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
                          <button
                            onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                            className="w-full flex items-center gap-2 p-2.5 text-left hover:bg-[var(--bg-paper)] transition-all"
                          >
                            <span className="text-[var(--text-muted)]">{CATEGORY_ICONS[ticket.category]}</span>
                            <span className="flex-1 min-w-0">
                              <span className="block text-[10px] font-bold text-[var(--text-primary)] truncate">
                                {ticket.activityTitle}
                              </span>
                              <span className="block text-[8px] text-[var(--text-muted)]">{formatDate(ticket.timestamp)}</span>
                            </span>
                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[7px] font-bold border ${STATUS_MAP[ticket.status]?.color || ''}`}>
                              {STATUS_MAP[ticket.status]?.label || ticket.status}
                            </span>
                            {expandedTicket === ticket.id ? (
                              <ChevronUp className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                            )}
                          </button>
                          <AnimatePresence>
                            {expandedTicket === ticket.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-2.5 pb-2.5 space-y-2">
                                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-paper)] rounded-lg p-2">
                                    {ticket.message}
                                  </p>
                                  {ticket.adminReply && (
                                    <div className="p-2 bg-[var(--accent-muted)] rounded-lg border border-[var(--accent-color)]/20">
                                      <p className="text-[8px] font-bold text-[var(--accent-color)] uppercase mb-1">Yönetim Yanıtı</p>
                                      <p className="text-[10px] text-[var(--text-primary)]">{ticket.adminReply}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === CONTACT TAB === */}
          {activeTab === 'contact' && (
            <div className="p-4 space-y-4">
              {/* Support Channels */}
              <div>
                <h3 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Destek Kanalları</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { icon: <Mail className="w-4 h-4" />, title: 'E-posta', value: 'morimasi@gmail.com', desc: '24 saat içinde yanıt', color: 'indigo' },
                    { icon: <MessageCircle className="w-4 h-4" />, title: 'Canlı Destek', value: 'Platform içi chat', desc: 'Pzt-Cuma 09:00-18:00', color: 'emerald' },
                    { icon: <Phone className="w-4 h-4" />, title: 'Telefon', value: 'Premium özel', desc: 'Randevu ile görüşme', color: 'violet' },
                  ].map((ch, i) => (
                    <div key={i} className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all">
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center mb-2 text-[var(--accent-color)]">
                        {ch.icon}
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
                <div className="flex items-center gap-2 mb-2">
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

              {/* Quick Contact */}
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <h4 className="text-[10px] font-bold text-[var(--text-primary)] mb-2">Hızlı İletişim</h4>
                <p className="text-[9px] text-[var(--text-muted)] leading-relaxed">
                  Acil durumlar için{' '}
                  <a href="mailto:morimasi@gmail.com" className="text-[var(--accent-color)] font-bold hover:underline">
                    morimasi@gmail.com
                  </a>{' '}
                  adresine e-posta gönderebilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[8px] text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>Destek: Pzt-Cuma 09:00-18:00</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--accent-color)] text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95"
          >
            Kapat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
