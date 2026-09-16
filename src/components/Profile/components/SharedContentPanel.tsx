import React, { useState, useMemo } from 'react';
import { UnifiedSharedItem } from '../hooks/useSharedContentHub';
import { SavedWorksheet, SavedAssessment } from '../../../types';
import { AssessmentReportViewer } from '../../AssessmentReportViewer';
import { useAuthStore } from '../../../store/useAuthStore';

type SharedCategory = 'all' | 'module' | 'assessment' | 'worksheet' | 'unread';

interface SharedContentPanelProps {
  items: UnifiedSharedItem[];
  loading: boolean;
  onOpenModule: (moduleType: string, contentId?: string) => void;
  onLoadWorksheet?: (ws: SavedWorksheet) => void;
  onRemoveShare: (id: string, type: UnifiedSharedItem['type']) => Promise<boolean>;
  onMarkAsRead?: (id: string, type: UnifiedSharedItem['type']) => Promise<void>;
}

const TYPE_CONFIGS: Record<UnifiedSharedItem['type'], { icon: string; color: string; label: string }> = {
  module: { icon: 'fa-cubes', color: 'from-indigo-500 to-purple-600 shadow-indigo-500/20', label: 'MODÜL / ANALİZ' },
  assessment: { icon: 'fa-clipboard-check', color: 'from-emerald-500 to-teal-600 shadow-emerald-500/20', label: 'DEĞERLENDİRME RAPORU' },
  worksheet: { icon: 'fa-file-lines', color: 'from-blue-500 to-cyan-600 shadow-blue-500/20', label: 'EĞİTİM MATERYALİ' },
};

export const SharedContentPanel: React.FC<SharedContentPanelProps> = ({
  items,
  loading,
  onOpenModule,
  onLoadWorksheet,
  onRemoveShare,
  onMarkAsRead,
}) => {
  const { user } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<SharedCategory>('all');
  const [search, setSearch] = useState('');
  const [viewingAssessment, setViewingAssessment] = useState<SavedAssessment | null>(null);

  // Filtreleme
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Kategori Filtresi
      if (activeCategory === 'module' && item.type !== 'module') return false;
      if (activeCategory === 'assessment' && item.type !== 'assessment') return false;
      if (activeCategory === 'worksheet' && item.type !== 'worksheet') return false;
      if (activeCategory === 'unread' && item.readAt) return false;

      // Arama Filtresi
      if (search) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.senderName.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          (item.message && item.message.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, activeCategory, search]);

  const unreadCount = useMemo(() => items.filter(i => !i.readAt).length, [items]);

  const handleItemClick = (item: UnifiedSharedItem) => {
    if (!item.readAt) {
      onMarkAsRead?.(item.id, item.type);
    }

    if (item.type === 'worksheet') {
      if (onLoadWorksheet) onLoadWorksheet(item.originalItem as SavedWorksheet);
    } else if (item.type === 'assessment') {
      // Değerlendirme paylaşımı tıklandığında önizleme modalını aç veya Analiz stüdyosuna yönlendir
      setViewingAssessment(item.originalItem as SavedAssessment);
    } else if (item.type === 'module') {
      if (item.moduleType === 'analysis' && item.contentId) {
        onOpenModule('analysis', item.contentId);
      } else if (item.moduleType) {
        onOpenModule(item.moduleType, item.contentId);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-14 bg-[var(--bg-secondary)] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-[var(--bg-secondary)] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Değerlendirme Raporu Canlı Önizleme Modalı */}
      {viewingAssessment && (
        <AssessmentReportViewer
          assessment={viewingAssessment}
          onClose={() => setViewingAssessment(null)}
          user={user}
        />
      )}

      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Üst Başlık & İstatistik Çubuğu */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-paper)] p-6 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Benimle Paylaşılanlar</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                  {unreadCount} Yeni
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[var(--text-muted)] mt-1">
              Size özel gönderilen modül, analiz raporu ve eğitim materyallerini yönetin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] text-center">
              <p className="text-lg font-black text-indigo-600">{items.length}</p>
              <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Toplam Gelen</p>
            </div>
          </div>
        </div>

        {/* Kontrol Çubuğu: Kategori Sekmeleri & Arama */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Kategoriler */}
          <div className="flex bg-[var(--bg-paper)] p-1.5 rounded-2xl border border-[var(--border-color)] overflow-x-auto shadow-sm">
            {[
              { id: 'all', label: 'Tümü', icon: 'fa-layer-group', count: items.length },
              { id: 'module', label: 'Analiz & Modüller', icon: 'fa-cubes', count: items.filter(i => i.type === 'module').length },
              { id: 'assessment', label: 'Raporlar', icon: 'fa-clipboard-check', count: items.filter(i => i.type === 'assessment').length },
              { id: 'worksheet', label: 'Materyaller', icon: 'fa-file-lines', count: items.filter(i => i.type === 'worksheet').length },
              { id: 'unread', label: 'Okunmamış', icon: 'fa-bolt', count: unreadCount },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as SharedCategory)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
              >
                <i className={`fa-solid ${cat.icon} text-[10px]`} />
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black ${
                  activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Arama Barı */}
          <div className="relative md:w-64 shrink-0">
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              placeholder="Paylaşım veya isim ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl text-xs font-bold bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* İçerik Izgarası */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl flex items-center justify-center mb-4 border border-indigo-500/20">
              <i className="fa-solid fa-share-nodes text-3xl text-indigo-500 opacity-50" />
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">
              {search ? 'Aramanıza Uygun Paylaşım Bulunamadı' : 'Henüz Paylaşım Yok'}
            </h3>
            <p className="text-xs font-bold text-[var(--text-muted)] max-w-sm">
              {search ? 'Arama terimini değiştirmeyi deneyin' : 'Size özel paylaşılan modül ve materyaller bu alanda listelenir.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const cfg = TYPE_CONFIGS[item.type];
              const isUnread = !item.readAt;

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex flex-col justify-between p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                    isUnread
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-700 shadow-lg shadow-indigo-500/10'
                      : 'bg-[var(--bg-paper)] border-[var(--border-color)] hover:border-indigo-500/40 hover:shadow-md'
                  }`}
                >
                  {/* Okunmadı Rozeti */}
                  {isUnread && (
                    <div className="absolute -top-2.5 -right-2.5 px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center gap-1 text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/40 animate-pulse">
                      <i className="fa-solid fa-bolt text-[7px]" /> YENİ
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white text-xl shadow-md shrink-0 border border-white/20`}>
                      <i className={`fa-solid ${cfg.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
                          {cfg.label}
                        </span>
                        <span className="text-[9px] font-bold text-[var(--text-muted)] truncate">
                          {new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-[var(--text-primary)] truncate group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs font-bold text-[var(--text-muted)] mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Gönderen Bilgisi & Mesaj */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 text-[10px] font-black shrink-0">
                        {item.senderName?.charAt(0)?.toUpperCase() || 'Ö'}
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                        Gönderen: <span className="font-black text-indigo-600 dark:text-indigo-400">{item.senderName}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm cursor-pointer flex items-center gap-1"
                      >
                        <span>Aç</span>
                        <i className="fa-solid fa-arrow-right text-[8px]" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveShare(item.id, item.type);
                        }}
                        className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-all cursor-pointer"
                        title="Paylaşımı Kaldır"
                      >
                        <i className="fa-solid fa-xmark text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Varsa Mesaj Notu */}
                  {item.message && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-medium text-[var(--text-muted)] italic truncate">
                      &ldquo;{item.message}&rdquo;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
