import React, { useState, useEffect, useMemo } from 'react';
import { FeedbackItem, FeedbackStatus, FeedbackCategory, FeedbackPriority } from '../../types';
import { feedbackService } from '../../services/feedbackService';
import { useToastStore } from '../../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { logError } from '../../utils/logger';

interface AdminFeedbackProps {
  onOpenPrompt?: (activityType: string) => void;
  onOpenActivities?: () => void;
}

const CANNED_REPLIES = [
  {
    label: 'İnceleniyor',
    text: 'Bildiriminiz için teşekkür ederiz. Teknik ve pedagojik ekibimiz konuyu incelemeye almıştır. En kısa sürede güncelleme paylaşılacaktır.',
  },
  {
    label: 'Çözüldü',
    text: 'Bildirdiğiniz konu giderilmiş ve sisteme yansıtılmıştır. Sayfayı yenileyerek güncel sürümü kullanabilirsiniz. Katkınız için teşekkür ederiz.',
  },
  {
    label: 'Yol Haritası',
    text: 'Değerli öneriniz geliştirme yol haritamıza eklenmiştir. bdmind platformunu birlikte geliştirdiğimiz için teşekkür ederiz.',
  },
];

const PRIORITY_META: Record<FeedbackPriority, { label: string; cls: string }> = {
  urgent: { label: 'Acil', cls: 'bg-rose-500/15 text-rose-500 border-rose-500/30' },
  high: { label: 'Yüksek', cls: 'bg-amber-500/15 text-amber-500 border-amber-500/30' },
  medium: { label: 'Orta', cls: 'bg-blue-500/15 text-blue-500 border-blue-500/30' },
  low: { label: 'Düşük', cls: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30' },
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'Yeni',
  read: 'İncelendi',
  'in-progress': 'İşlemde',
  replied: 'Yanıtlandı',
  resolved: 'Çözüldü',
};

export const AdminFeedback: React.FC<AdminFeedbackProps> = ({ onOpenPrompt, onOpenActivities }) => {
  const toast = useToastStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | FeedbackStatus>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | FeedbackCategory>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | FeedbackPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { feedbacks: data } = await feedbackService.getAllFeedbacks(0, 100);
      setFeedbacks(data);
    } catch (error) {
      logError('Geri bildirimler yüklenemedi', { error });
      toast.error('Geri bildirimler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
    if (selectedFeedback?.id === id) {
      setSelectedFeedback((prev) => (prev ? { ...prev, status } : null));
    }
    try {
      await feedbackService.updateFeedbackStatus(id, status);
      toast.success(`Durum "${STATUS_LABELS[status]}" olarak güncellendi.`);
    } catch {
      toast.error('Durum güncellenemedi.');
    }
  };

  const handlePriorityUpdate = async (id: string, priority: FeedbackPriority) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, priority } : f)));
    if (selectedFeedback?.id === id) {
      setSelectedFeedback((prev) => (prev ? { ...prev, priority } : null));
    }
    try {
      await feedbackService.updateFeedbackPriority(id, priority);
      toast.success(`Öncelik "${PRIORITY_META[priority].label}" olarak güncellendi.`);
    } catch {
      toast.error('Öncelik güncellenemedi.');
    }
  };

  const handleReply = async (resolve: boolean = false) => {
    if (!selectedFeedback || !replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      await feedbackService.submitReply(selectedFeedback.id, replyText.trim(), resolve);
      const updatedStatus: FeedbackStatus = resolve ? 'resolved' : 'replied';

      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === selectedFeedback.id
            ? { ...f, adminReply: replyText.trim(), status: updatedStatus }
            : f
        )
      );
      setSelectedFeedback((prev) =>
        prev ? { ...prev, adminReply: replyText.trim(), status: updatedStatus } : null
      );
      setReplyText('');
      toast.success(resolve ? 'Yanıtlandı ve çözüldü olarak işaretlendi.' : 'Yanıt kaydedildi.');
    } catch (error) {
      logError('Yanıt gönderilemedi', { error });
      toast.error('Yanıt gönderilemedi.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const targetId = deleteTargetId;
    setDeleteTargetId(null);
    setFeedbacks((prev) => prev.filter((f) => f.id !== targetId));
    if (selectedFeedback?.id === targetId) setSelectedFeedback(null);
    try {
      await feedbackService.deleteFeedback(targetId);
      toast.success('Bildirim silindi.');
    } catch {
      toast.error('Silme işlemi başarısız.');
    }
  };

  const handleBulkStatus = async (status: FeedbackStatus) => {
    if (selectedIds.length === 0) return;
    try {
      await feedbackService.bulkUpdateStatus(selectedIds, status);
      setFeedbacks((prev) =>
        prev.map((f) => (selectedIds.includes(f.id) ? { ...f, status } : f))
      );
      toast.success(`${selectedIds.length} bildirim güncellendi.`);
      setSelectedIds([]);
      setSelectionMode(false);
    } catch {
      toast.error('Toplu güncelleme başarısız.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await feedbackService.bulkDelete(selectedIds);
      setFeedbacks((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
      if (selectedFeedback && selectedIds.includes(selectedFeedback.id)) {
        setSelectedFeedback(null);
      }
      toast.success(`${selectedIds.length} bildirim silindi.`);
      setSelectedIds([]);
      setSelectionMode(false);
    } catch {
      toast.error('Toplu silme başarısız.');
    }
  };

  const stats = useMemo(() => {
    const rated = feedbacks.filter((f) => f.rating > 0);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(1)
        : '—';
    return {
      total: feedbacks.length,
      newCount: feedbacks.filter((f) => f.status === 'new').length,
      bugCount: feedbacks.filter((f) => f.category === 'bug').length,
      resolvedCount: feedbacks.filter((f) => f.status === 'resolved').length,
      avgRating,
    };
  }, [feedbacks]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return feedbacks.filter((f) => {
      const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
      const matchesPriority =
        filterPriority === 'all' || (f.priority || 'medium') === filterPriority;
      const matchesSearch =
        !q ||
        f.message.toLowerCase().includes(q) ||
        f.userName.toLowerCase().includes(q) ||
        (f.userEmail || '').toLowerCase().includes(q) ||
        (f.activityTitle || '').toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });
  }, [feedbacks, filterStatus, filterCategory, filterPriority, searchQuery]);

  const handleExport = (format: 'json' | 'csv') => {
    const dataToExport = filtered;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gelen_kutusu_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['ID', 'Kullanıcı', 'E-posta', 'Kategori', 'Öncelik', 'Durum', 'Aktivite', 'Puan', 'Mesaj', 'Tarih'];
      const rows = dataToExport.map((f) =>
        [
          f.id,
          f.userName,
          f.userEmail || '',
          f.category,
          f.priority || 'medium',
          f.status,
          f.activityTitle || '',
          f.rating,
          `"${(f.message || '').replace(/"/g, '""')}"`,
          f.timestamp,
        ].join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gelen_kutusu_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success(`${dataToExport.length} kayıt ${format.toUpperCase()} olarak indirildi.`);
  };

  const handleCopyEmail = async (email?: string) => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      toast.success('E-posta panoya kopyalandı.');
    } catch {
      toast.error('Kopyalanamadı.');
    }
  };

  const getStatusStyles = (status: FeedbackStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'read':
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
      case 'in-progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'replied':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const getCategoryIcon = (cat: FeedbackCategory) => {
    switch (cat) {
      case 'bug':
        return 'fa-bug text-rose-500';
      case 'feature':
        return 'fa-lightbulb text-amber-500';
      case 'content':
        return 'fa-file-lines text-sky-500';
      case 'general':
        return 'fa-comment-dots text-indigo-500';
      default:
        return 'fa-comment text-zinc-500';
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const statCards = [
    { label: 'Toplam', value: stats.total, sub: `Ort. ${stats.avgRating} ★`, icon: 'fa-envelope', iconBox: 'bg-indigo-500/10 text-indigo-500' },
    { label: 'Yeni Bildirim', value: stats.newCount, sub: 'Okunmamış', icon: 'fa-bell', iconBox: 'bg-blue-500/10 text-blue-500' },
    { label: 'Hata Raporu', value: stats.bugCount, sub: 'Teknik / İçerik', icon: 'fa-bug', iconBox: 'bg-rose-500/10 text-rose-500' },
    { label: 'Çözüldü', value: stats.resolvedCount, sub: 'Tamamlanan', icon: 'fa-check-double', iconBox: 'bg-emerald-500/10 text-emerald-500' },
  ];

  return (
    <div className="min-h-[680px] lg:h-[calc(100vh-140px)] flex flex-col gap-5 font-lexend">
      {/* Stats Cards + Top Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl flex items-center gap-4 group hover:border-[var(--accent-color)] transition-all shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl ${stat.iconBox} flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <i className={`fa-solid ${stat.icon} text-lg`} />
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-none mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-[var(--text-primary)] leading-none tabular-nums">
                  {stat.value}
                </p>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{stat.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-lg min-h-0">
        {/* Sidebar List */}
        <div className="w-full lg:w-[390px] border-b lg:border-b-0 lg:border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-paper)]/60 max-h-[420px] lg:max-h-none shrink-0">
          <div className="p-5 space-y-3 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                Bildirimler ({filtered.length})
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    if (selectionMode) setSelectedIds([]);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all border ${
                    selectionMode
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {selectionMode ? 'Vazgeç' : 'Seç'}
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-8 h-8 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center"
                  title="CSV İndir"
                >
                  <i className="fa-solid fa-file-csv text-xs" />
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-8 h-8 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center"
                  title="JSON İndir"
                >
                  <i className="fa-solid fa-download text-xs" />
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-8 h-8 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center"
                  title="Yazdır"
                >
                  <i className="fa-solid fa-print text-xs" />
                </button>
                <button
                  onClick={loadData}
                  className="w-8 h-8 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center"
                  title="Yenile"
                >
                  <i className={`fa-solid fa-sync-alt text-xs ${loading ? 'fa-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
              <input
                type="text"
                placeholder="Mesaj, kullanıcı, e-posta veya aktivite ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl py-2 pl-9 pr-4 text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-color)] outline-none transition-all"
              />
            </div>

            {/* Status Quick Filters */}
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'new', 'in-progress', 'replied', 'resolved'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all border ${
                    filterStatus === s
                      ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-sm'
                      : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {s === 'all' ? 'Tümü' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Category & Priority Filters */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as 'all' | FeedbackCategory)}
                className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] outline-none"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="bug">Hata Bildirimi</option>
                <option value="content">İçerik Hatası</option>
                <option value="feature">Özellik İsteği</option>
                <option value="general">Genel Görüş</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as 'all' | FeedbackPriority)}
                className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-[var(--text-primary)] outline-none"
              >
                <option value="all">Tüm Öncelikler</option>
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectionMode && selectedIds.length > 0 && (
              <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--accent-color)] flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-[var(--text-primary)]">
                  {selectedIds.length} seçili
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleBulkStatus('resolved')}
                    className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase"
                  >
                    Çözüldü
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[9px] font-black uppercase"
                  >
                    Sil
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-[var(--text-muted)]">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Yükleniyor...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Eşleşen Bildirim Yok
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const pri = PRIORITY_META[item.priority || 'medium'];
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (selectionMode) {
                        toggleSelect(item.id);
                        return;
                      }
                      setSelectedFeedback(item);
                      if (item.status === 'new') handleStatusUpdate(item.id, 'read');
                    }}
                    className={`p-4 border-b border-[var(--border-color)] cursor-pointer transition-all hover:bg-[var(--bg-secondary)] group relative ${
                      selectedFeedback?.id === item.id ? 'bg-[var(--accent-muted)]/40' : ''
                    }`}
                  >
                    {selectedFeedback?.id === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-color)]" />
                    )}
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => {}}
                            className="mr-1 accent-[var(--accent-color)]"
                          />
                        )}
                        <i className={`fa-solid ${getCategoryIcon(item.category)} text-xs`} />
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {STATUS_LABELS[item.status] || item.status}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase border ${pri.cls}`}
                        >
                          {pri.label}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold text-[var(--text-muted)] shrink-0">
                        {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <h4
                      className={`text-xs font-black mb-0.5 truncate ${
                        item.status === 'new'
                          ? 'text-[var(--text-primary)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {item.userName}
                    </h4>
                    <p className="text-[10px] text-[var(--accent-color)] font-bold truncate uppercase">
                      {item.activityTitle || 'GENEL BİLDİRİM'}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-1">
                      &quot;{item.message}&quot;
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="flex-1 flex flex-col bg-[var(--bg-paper)] min-w-0">
          {selectedFeedback ? (
            <div className="flex-1 flex flex-col h-full">
              {/* Detail Header */}
              <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/60 flex flex-wrap justify-between items-start gap-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-color)] border border-[var(--border-color)]">
                    <i className={`fa-solid ${getCategoryIcon(selectedFeedback.category)} text-lg`} />
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-black text-[var(--text-primary)] uppercase tracking-tight leading-tight mb-1">
                      {selectedFeedback.activityTitle || 'Genel Bildirim'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-[var(--text-muted)]">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-regular fa-user text-[var(--accent-color)]" />{' '}
                        {selectedFeedback.userName}
                      </span>
                      {selectedFeedback.userEmail && (
                        <button
                          onClick={() => handleCopyEmail(selectedFeedback.userEmail)}
                          className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
                          title="E-postayı kopyala"
                        >
                          <i className="fa-regular fa-envelope text-[var(--accent-color)]" />{' '}
                          {selectedFeedback.userEmail}
                        </button>
                      )}
                      <span className="font-mono text-[10px]">
                        {new Date(selectedFeedback.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedFeedback.priority || 'medium'}
                    onChange={(e) =>
                      handlePriorityUpdate(selectedFeedback.id, e.target.value as FeedbackPriority)
                    }
                    className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[11px] font-black uppercase px-3 py-2 outline-none text-[var(--text-primary)] cursor-pointer"
                    title="Öncelik"
                  >
                    <option value="low">Düşük Öncelik</option>
                    <option value="medium">Orta Öncelik</option>
                    <option value="high">Yüksek Öncelik</option>
                    <option value="urgent">Acil Öncelik</option>
                  </select>
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) =>
                      handleStatusUpdate(selectedFeedback.id, e.target.value as FeedbackStatus)
                    }
                    className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[11px] font-black uppercase px-3 py-2 outline-none text-[var(--text-primary)] cursor-pointer"
                    title="Durum"
                  >
                    <option value="new">Yeni</option>
                    <option value="read">İncelendi</option>
                    <option value="in-progress">İşlemde</option>
                    <option value="replied">Yanıtlandı</option>
                    <option value="resolved">Çözüldü</option>
                  </select>
                  <button
                    onClick={() => setDeleteTargetId(selectedFeedback.id)}
                    className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center justify-center"
                    title="Sil"
                  >
                    <i className="fa-solid fa-trash-alt text-sm" />
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
                <div className="max-w-3xl">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] block mb-3">
                    Gönderilen Mesaj
                  </span>
                  <div className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] relative">
                    <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                      {selectedFeedback.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                  {selectedFeedback.rating > 0 && (
                    <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-color)]">
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block mb-3">
                        Kullanıcı Puanlaması
                      </span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`fa-solid fa-star text-lg ${
                              star <= selectedFeedback.rating
                                ? 'text-amber-400'
                                : 'text-[var(--border-color)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedFeedback.activityType && (
                    <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">
                        İlgili Stüdyo & Bağlam
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--accent-color)] bg-[var(--accent-muted)] px-2.5 py-1 rounded-lg">
                          {selectedFeedback.activityType}
                        </span>
                        <div className="flex gap-2">
                          {onOpenPrompt && selectedFeedback.activityType !== 'Genel' && (
                            <button
                              onClick={() => onOpenPrompt(selectedFeedback.activityType)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase hover:bg-amber-500 hover:text-black transition-all"
                            >
                              Promptu Aç
                            </button>
                          )}
                          {onOpenActivities && (
                            <button
                              onClick={onOpenActivities}
                              className="px-2.5 py-1 rounded-lg bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] text-[10px] font-black uppercase hover:border-[var(--accent-color)] transition-all"
                            >
                              Aktiviteler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedFeedback.adminReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl"
                  >
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <i className="fa-solid fa-reply-all" /> Yönetici Yanıtı
                    </span>
                    <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                        {selectedFeedback.adminReply}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/80 shrink-0">
                <div className="max-w-3xl space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      Hızlı Şablon:
                    </span>
                    {CANNED_REPLIES.map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => setReplyText(tpl.text)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--bg-paper)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-4 text-[var(--text-primary)] text-sm font-medium placeholder-[var(--text-muted)] outline-none focus:ring-1 focus:ring-[var(--accent-color)] transition-all resize-none h-28 custom-scrollbar"
                    placeholder="Kullanıcıya yanıt yaz veya süreçle ilgili not ekle..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      onClick={() => handleReply(false)}
                      disabled={!replyText.trim() || isSubmittingReply}
                      className="px-5 py-2.5 bg-[var(--bg-paper)] hover:border-[var(--accent-color)] text-[var(--text-primary)] text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-[var(--border-color)] disabled:opacity-40"
                    >
                      Sadece Yanıtla
                    </button>
                    <button
                      onClick={() => handleReply(true)}
                      disabled={!replyText.trim() || isSubmittingReply}
                      className="px-6 py-2.5 bg-[var(--accent-color)] hover:opacity-90 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                      {isSubmittingReply ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <i className="fa-solid fa-check-circle" />
                      )}
                      Yanıtla & Çözüldü İşaretle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4 border border-[var(--border-color)]">
                <i className="fa-solid fa-envelope-open text-3xl text-[var(--accent-color)] opacity-60" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-1">
                Gelen Kutusu Beklemede
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Detayları görmek ve yanıtlamak için sol listeden bir bildirim seçin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (Non-blocking UI) */}
      <AnimatePresence>
        {deleteTargetId && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
            onClick={() => setDeleteTargetId(null)}
          >
            <div
              className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-black text-[var(--text-primary)] uppercase">
                Bildirimi Kalıcı Sil
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Bu geri bildirim kaydı veritabanından kalıcı olarak silinecektir. Devam edilsin mi?
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-black uppercase"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
