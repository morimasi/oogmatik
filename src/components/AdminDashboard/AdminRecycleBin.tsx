import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, Search, RefreshCw, AlertTriangle, ShieldCheck, UserCheck, GraduationCap, Calendar, UserX, CheckCircle, Info } from 'lucide-react';
import { recycleBinService } from '../../services/recycleBinService';
import { RecycleBinItem } from '../../types/admin';
import { useToastStore } from '../../store/useToastStore';

export const AdminRecycleBin: React.FC = () => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teacher' | 'student'>('all');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmHardDelete, setConfirmHardDelete] = useState<RecycleBinItem | null>(null);
  const toast = useToastStore();

  const loadRecycleBin = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recycleBinService.getAllRecycleBinItems();
      setItems(data);
    } catch {
      toast.error('Geri dönüşüm verileri alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRecycleBin();
  }, [loadRecycleBin]);

  const handleRestore = async (item: RecycleBinItem) => {
    setRestoringId(item.id);
    try {
      await recycleBinService.restoreItem(item.id);
      toast.success(`${item.name} ve tüm ilişkili verileri başarıyla geri yüklendi.`);
      loadRecycleBin();
    } catch {
      toast.error('Kayıt geri yüklenirken hata oluştu.');
    } finally {
      setRestoringId(null);
    }
  };

  const handleHardDelete = async (item: RecycleBinItem) => {
    setDeletingId(item.id);
    try {
      await recycleBinService.permanentlyDeleteItem(item.id);
      toast.success(`${item.name} kalıcı olarak sistemden silindi.`);
      setConfirmHardDelete(null);
      loadRecycleBin();
    } catch {
      toast.error('Kalıcı silme sırasında hata oluştu.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.diagnosis && item.diagnosis.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesType = filterType === 'all' || item.entityType === filterType;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, filterType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-lexend">
      {/* Top Banner & Info */}
      <div className="bg-gradient-to-r from-zinc-900 via-indigo-950 to-purple-950 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black italic tracking-tight">Geri Dönüşüm & Silinen Veri Mimarisi</h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Yedekleme Kalkanı Aktif
                </span>
              </div>
              <p className="text-xs text-zinc-300 max-w-xl font-medium leading-relaxed">
                Silinen öğretmen ve öğrencilerin profil, tanı, BEP ve çalışma kâğıdı verileri burada kalıcı olarak yedeklenir. Yanlışlıkla silinen tüm kayıtları tek tıkla geri yükleyebilirsiniz.
              </p>
            </div>
          </div>
          <button
            onClick={loadRecycleBin}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Listeyi Yenile
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Silinen isim, e-posta veya tanıya göre ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)] w-full md:w-auto">
          {(['all', 'teacher', 'student'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-[var(--accent-color)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {t === 'all' ? `Tümü (${items.length})` : t === 'teacher' ? 'Öğretmenler' : 'Öğrenciler'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-[var(--bg-secondary)] rounded-[2.5rem] animate-pulse border border-[var(--border-color)]" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] text-center p-8">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mb-4 border border-emerald-500/20">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">Geri Dönüşüm Kutusu Temiz</h3>
          <p className="text-xs font-bold text-[var(--text-muted)] max-w-sm">
            {searchTerm || filterType !== 'all' ? 'Arama kriterlerine uygun silinmiş veri bulunamadı.' : 'Sistemde arşivlenmiş veya silinmiş yedek kaydı bulunmuyor.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all"
            >
              {/* Type Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="w-12 h-12 rounded-2xl border-2 border-[var(--border-color)] shadow-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-lg border border-indigo-500/20">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-[var(--text-primary)] truncate max-w-[160px]">{item.name}</h4>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] truncate max-w-[160px]">
                      {item.entityType === 'teacher' ? item.email : item.diagnosis?.join(', ') || 'Öğrenci'}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-wider ${item.entityType === 'teacher' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                  {item.entityType === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                </span>
              </div>

              {/* Deletion Metadata */}
              <div className="bg-[var(--bg-secondary)] rounded-2xl p-3 border border-[var(--border-color)] mb-4 text-[10px] space-y-1">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>Silinme Tarihi:</span>
                  <span className="font-bold text-[var(--text-primary)]">{new Date(item.deletedAt).toLocaleDateString('tr-TR')} {new Date(item.deletedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>İşlemi Yapan:</span>
                  <span className="font-bold text-indigo-500">{item.deletedBy}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  onClick={() => handleRestore(item)}
                  disabled={restoringId === item.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {restoringId === item.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  {restoringId === item.id ? 'Yükleniyor...' : 'Geri Yükle'}
                </button>
                <button
                  onClick={() => setConfirmHardDelete(item)}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"
                  title="Kalıcı Olarak Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hard Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmHardDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--bg-paper)] border border-rose-500/30 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">Kalıcı Silme Onayı</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  <strong className="text-rose-500">{confirmHardDelete.name}</strong> kaydını ve tüm ilişkili verileri veritabanından <u className="font-bold text-rose-500">kalıcı olarak silmek</u> üzeresiniz. Bu işlem geri alınamaz!
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmHardDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] font-bold text-xs border border-[var(--border-color)]"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => handleHardDelete(confirmHardDelete)}
                  disabled={deletingId === confirmHardDelete.id}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20"
                >
                  {deletingId === confirmHardDelete.id ? 'Siliniyor...' : 'Kalıcı Olarak Sil'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
