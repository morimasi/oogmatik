import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { DynamicActivity } from '../../types/admin';
import { ACTIVITY_CATEGORIES } from '../../constants';
import { useToastStore } from '../../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Settings, 
  ZapOff as Zap, 
  Shield, 
  Eye, 
  EyeOff, 
  Activity as ActivityIcon, 
  Sparkles,
  ChevronRight,
  Layers,
  Target,
  BrainCircuit,
  Save,
  RefreshCcw as RefreshCw,
  X,
  Copy
} from 'lucide-react';

/**
 * AdminActivityManager — Ultra-Professional Content Management
 * Dark Glassmorphism Design System
 */
export const AdminActivityManager: React.FC = () => {
  const toast = useToastStore();
  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllActivities();
      setActivities(data);
    } catch (e) {
      toast.error('Aktiviteler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           act.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || act.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && act.isActive) ||
                           (statusFilter === 'inactive' && !act.isActive) ||
                           (statusFilter === 'premium' && act.isPremium);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [activities, searchQuery, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: activities.length,
    active: activities.filter(a => a.isActive).length,
    premium: activities.filter(a => a.isPremium).length,
    aiOnly: activities.filter(a => a.engineConfig?.mode === 'ai_only').length,
  }), [activities]);

  const handleToggleStatus = async (id: string, field: 'isActive' | 'isPremium') => {
    const activity = activities.find(a => a.id === id);
    if (!activity) return;

    try {
      const newValue = !activity[field];
      await adminService.updateActivity(id, { [field]: newValue });
      setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: newValue } : a));
      toast.success(`${activity.title} güncellendi`);
    } catch (e) {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleSaveDetail = async (updated: DynamicActivity) => {
    setIsSaving(true);
    try {
      await adminService.saveActivity(updated);
      setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
      toast.success(`${updated.title} başarıyla kaydedildi`);
      setIsInspectorOpen(false);
    } catch (e) {
      toast.error('Kaydetme hatası');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAction = async (action: 'active' | 'inactive' | 'delete' | 'clone') => {
    if (selectedIds.length === 0) return;
    setIsSaving(true);
    try {
      if (action === 'delete') {
        const batch = activities.filter(a => selectedIds.includes(a.id));
        await adminService.deleteActivitiesBulk(batch.map(a => a.id));
        setActivities(prev => prev.filter(a => !selectedIds.includes(a.id)));
        toast.success(`${selectedIds.length} aktivite başarıyla silindi`);
      } else if (action === 'clone') {
        const toClone = activities.filter(a => selectedIds.includes(a.id));
        const clones = toClone.map(a => ({
          ...a,
          id: `${a.id}_clone_${Date.now()}`,
          title: `${a.title} (Kopya)`,
          isActive: false,
          order: activities.length + 1,
          updatedAt: new Date().toISOString(),
        }));
        await adminService.saveActivitiesBulk(clones);
        setActivities(prev => [...prev, ...clones]);
        toast.success(`${selectedIds.length} aktivite klonlandı`);
      } else {
        const isActive = action === 'active';
        const batch = activities
          .filter(a => selectedIds.includes(a.id))
          .map(a => ({ ...a, isActive }));
        
        await adminService.saveActivitiesBulk(batch);
        setActivities(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, isActive } : a));
        toast.success(`${selectedIds.length} aktivite başarıyla ${isActive ? 'aktif' : 'pasif'} yapıldı`);
      }
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (e) {
      toast.error('Toplu işlem başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloneSingle = async (activity: DynamicActivity) => {
    const clone: DynamicActivity = {
      ...activity,
      id: `${activity.id}_clone_${Date.now()}`,
      title: `${activity.title} (Kopya)`,
      isActive: false,
      order: activities.length + 1,
      updatedAt: new Date().toISOString(),
    };
    try {
      await adminService.saveActivity(clone);
      setActivities(prev => [...prev, clone]);
      toast.success(`${activity.title} klonlandı`);
    } catch {
      toast.error('Klonlama başarısız');
    }
  };

  const moveActivity = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...activities].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(a => a.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
    sorted[swapIdx] = { ...sorted[swapIdx], order: temp };
    try {
      await adminService.saveActivitiesBulk([sorted[idx], sorted[swapIdx]]);
      setActivities(prev => prev.map(a => {
        if (a.id === sorted[idx].id) return { ...a, order: sorted[idx].order };
        if (a.id === sorted[swapIdx].id) return { ...a, order: sorted[swapIdx].order };
        return a;
      }));
    } catch {
      toast.error('Sıralama güncellenemedi');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full space-y-6 font-lexend overflow-hidden">
      
      {/* ── Dashboard Stats Bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam', value: stats.total, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Aktif', value: stats.active, icon: ActivityIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Premium', value: stats.premium, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'AI Motoru', value: stats.aiOnly, icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="p-4 rounded-[1.5rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl flex items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Control Center (Toolbar) ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-black/20 p-4 rounded-3xl border border-zinc-200 dark:border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Aktivite ara..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl px-3 py-2 text-sm outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <select 
            className="bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl px-3 py-2 text-sm outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isSelectionMode ? 'bg-amber-500 text-white' : 'bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400'}`}
          >
             {isSelectionMode ? 'Hızlı Seçim Kapat' : 'Çoklu Seçim'}
          </button>
          <button 
            onClick={fetchActivities}
            className="p-2 bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
            <Zap size={14} /> AI Analiz
          </button>
        </div>
      </div>

      {/* ── Activity Grid ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
             <RefreshCw size={32} className="text-indigo-500 animate-spin" />
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Aktiviteler Hazırlanıyor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-40">
            <AnimatePresence>
              {filteredActivities.map((act) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={act.id}
                  className={`group relative p-5 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer ${isSelectionMode && selectedIds.includes(act.id) ? 'border-indigo-500 shadow-xl shadow-indigo-500/10 ring-4 ring-indigo-500/10' : act.isActive ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5' : 'bg-red-50/20 dark:bg-red-900/10 border-red-200/50 dark:border-red-900/30'}`}
                  onClick={() => isSelectionMode && toggleSelect(act.id)}
                >
                  {isSelectionMode && (
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center transition-all ${selectedIds.includes(act.id) ? 'bg-indigo-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-transparent'}`}>
                       <Target size={14} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12 group-hover:scale-110"
                      style={{ backgroundColor: act.themeColor || '#6366f1' }}
                    >
                      <i className={`fa-solid ${act.icon || 'fa-box'} text-lg`}></i>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex gap-1.5">
                        {act.isPremium && <span className="text-[8px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black tracking-tighter shadow-sm">PREMIUM</span>}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(act.id, 'isActive'); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${act.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}
                        >
                          {act.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-tight truncate">{act.title}</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">{act.category}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveActivity(act.id, 'up'); }}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        title="Sırala"
                      >
                        <i className="fa-solid fa-arrow-up text-[8px]"></i>
                      </button>
                      <span className="text-[8px] font-mono text-zinc-400 opacity-50">#{act.order}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCloneSingle(act); }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all"
                        title="Klonla"
                      >
                        <Copy size={12} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(act.id);
                          setIsInspectorOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        Düzenle <Settings size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredActivities.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500 font-bold uppercase text-xs italic">
                Eşleşen aktivite bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Side Inspector (Drawer) ─────────────────────────────────── */}
      <AnimatePresence>
        {isInspectorOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsInspectorOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-white/10 z-[101] shadow-2xl overflow-hidden flex flex-col"
            >
              {selectedId && <InspectorContent 
                id={selectedId} 
                activity={activities.find(a => a.id === selectedId)!} 
                onClose={() => setIsInspectorOpen(false)}
                onSave={handleSaveDetail}
                isSaving={isSaving}
              />}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bulk Actions Floating Bar ───────────────────────────────── */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: 100, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-4 bg-zinc-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl border border-white/10 backdrop-blur-3xl"
          >
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Seçilen</span>
               <span className="text-sm font-black whitespace-nowrap">{selectedIds.length} Aktivite</span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <div className="flex gap-2">
               <button 
                 onClick={() => handleBulkAction('active')}
                 className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
               >
                 Tümünü Aç
               </button>
               <button 
                 onClick={() => handleBulkAction('inactive')}
                 className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
               >
                 Tümünü Kapat
               </button>
                <button 
                  onClick={() => handleBulkAction('clone')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Toplu Klonla
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Toplu Sil
                </button>
            </div>
            <button 
              onClick={() => { setSelectedIds([]); setIsSelectionMode(false); }}
              className="ml-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
               <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Inspector Content Micro-component ───────────────────────────
const InspectorContent = ({ id, activity, onClose, onSave, isSaving }: { 
  id: string, 
  activity: DynamicActivity, 
  onClose: () => void,
  onSave: (updated: DynamicActivity) => void,
  isSaving: boolean
}) => {
  const [formData, setFormData] = useState<DynamicActivity>({ ...activity });

  const updateField = <K extends keyof DynamicActivity>(path: string, value: DynamicActivity[K]) => {
    setFormData(prev => {
      if (path.includes('.')) {
        const [parent, child] = path.split('.') as [keyof DynamicActivity, string];
        const parentObj = prev[parent];
        if (parentObj && typeof parentObj === 'object' && !Array.isArray(parentObj)) {
          return { ...prev, [parent]: { ...parentObj, [child]: value } };
        }
      }
      return { ...prev, [path]: value };
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      {/* Header */}
      <div className="p-6 bg-white dark:bg-black/20 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20" style={{ backgroundColor: formData.themeColor }}>
            <i className={`fa-solid ${formData.icon}`}></i>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight truncate max-w-[200px]">{formData.title}</h3>
            <p className="text-[10px] text-zinc-500 font-mono">#{id}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        
        {/* Basic Info Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Temel Ayarlar</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Başlık</label>
              <input 
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Kategori</label>
              <select 
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Açıklama</label>
             <textarea 
               value={formData.description}
               onChange={(e) => updateField('description', e.target.value)}
               className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-xl text-xs outline-none min-h-[60px] focus:ring-1 focus:ring-indigo-500"
             />
          </div>
        </section>

        {/* AI Engine Section */}
        <section className="space-y-4 p-5 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-[0.03] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-indigo-500" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">AI Motoru Yapılandırması</h4>
              </div>
              <div className="flex gap-2">
                 {['ai_only', 'hybrid', 'logic_only'].map(m => (
                   <button 
                     key={m}
                     onClick={() => updateField('engineConfig.mode', m)}
                     className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${formData.engineConfig?.mode === m ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-500/10 text-indigo-500/60'}`}
                   >
                     {m.replace('_', ' ')}
                   </button>
                 ))}
              </div>
           </div>
           
           <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                   <Target size={14} className="text-zinc-500" />
                   <span className="text-xs font-medium">Zorluk Seviyesi Ayarı</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.engineConfig?.parameters?.allowDifficulty} 
                  onChange={(e) => updateField('engineConfig.parameters.allowDifficulty', e.target.checked)}
                  className="w-4 h-4 accent-indigo"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                   <Sparkles size={14} className="text-zinc-500" />
                   <span className="text-xs font-medium">Distraksiyon (Çeldirici) Modu</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={formData.engineConfig?.parameters?.allowDistraction} 
                  onChange={(e) => updateField('engineConfig.parameters.allowDistraction', e.target.checked)}
                  className="w-4 h-4 accent-indigo"
                />
              </div>
           </div>

           <div className="space-y-2 mt-4">
              <label className="text-[9px] font-bold text-indigo-500/70 uppercase flex items-center gap-1">
                 <Shield size={10} /> Mimari DNA (Blueprint Blueprint)
              </label>
              <textarea 
                value={formData.engineConfig?.baseBlueprint || ''}
                placeholder="Creative Studio Blueprint DNA..."
                onChange={(e) => updateField('engineConfig.baseBlueprint', e.target.value)}
                className="w-full px-3 py-2 bg-black/20 border border-indigo-500/10 rounded-xl text-[10px] font-mono text-indigo-400 outline-none min-h-[80px] focus:ring-1 focus:ring-indigo-500"
              />
           </div>
        </section>

        {/* Pedagogical Metadata */}
        <section className="space-y-4 pb-12">
           <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Pedagojik Veriler</h4>
          </div>
          
          <div className="space-y-4">
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-zinc-500 uppercase">Hedef Beceriler</label>
               <div className="flex flex-wrap gap-2">
                 {(formData.targetSkills || []).map((s, i) => (
                   <span key={i} className="px-3 py-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-[10px] font-bold flex items-center gap-2 border border-zinc-300 dark:border-white/5">
                     {s} 
                     <button className="hover:text-red-500 transition-colors"><X size={10} /></button>
                   </span>
                 ))}
                 <button className="px-3 py-1 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-indigo-500 transition-colors">+ Yeni Beceri</button>
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-[10px] font-bold text-zinc-500 uppercase">Öğrenme Kazanımları</label>
               <div className="space-y-2">
                 {(formData.learningObjectives || []).map((obj, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white dark:bg-white/5 rounded-xl border border-zinc-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all">
                       <ChevronRight size={12} className="text-indigo-500" />
                       <span className="text-[11px] flex-1 font-medium">{obj}</span>
                       <button className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all"><X size={12} /></button>
                    </div>
                 ))}
                 <button className="w-full py-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Yeni Kazanım Ekle</button>
               </div>
             </div>
          </div>
        </section>

      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/10 flex gap-3">
         <button 
           onClick={onClose}
           className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95"
         >
           Vazgeç
         </button>
         <button 
           onClick={() => onSave(formData)}
           disabled={isSaving}
           className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
         >
           {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
           {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Yayınla'}
         </button>
      </div>
    </div>
  );
};

AdminActivityManager.displayName = 'AdminActivityManager';
