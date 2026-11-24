import React, { useState, useEffect, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import { DynamicActivity } from '../../types/admin';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../../constants';
import { useToastStore } from '../../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Settings,
  Zap,
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
  Copy,
  Plus,
  Download,
  Upload,
  Terminal,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AdminActivityManagerProps {
  onOpenPrompt?: (activityId: string) => void;
}

interface CatalogAuditItem {
  id: string;
  title: string;
  issues: string[];
}

export const AdminActivityManager: React.FC<AdminActivityManagerProps> = ({ onOpenPrompt }) => {
  const toast = useToastStore();
  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  // Create form state
  const [newAct, setNewAct] = useState<{
    id: string;
    title: string;
    description: string;
    category: string;
    mode: 'ai_only' | 'hybrid' | 'logic_only';
    isPremium: boolean;
  }>({
    id: '',
    title: '',
    description: '',
    category: ACTIVITY_CATEGORIES[0]?.id || 'visual-perception',
    mode: 'ai_only',
    isPremium: false,
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllActivities();
      setActivities(data);
    } catch {
      toast.error('Aktiviteler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .filter((act) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          act.title.toLowerCase().includes(q) ||
          act.id.toLowerCase().includes(q) ||
          (act.description || '').toLowerCase().includes(q);
        const matchesCategory = categoryFilter === 'all' || act.category === categoryFilter;
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && act.isActive) ||
          (statusFilter === 'inactive' && !act.isActive) ||
          (statusFilter === 'premium' && act.isPremium);
        const matchesMode =
          modeFilter === 'all' || (act.engineConfig?.mode || 'ai_only') === modeFilter;
        return matchesSearch && matchesCategory && matchesStatus && matchesMode;
      });
  }, [activities, searchQuery, categoryFilter, statusFilter, modeFilter]);

  const stats = useMemo(
    () => ({
      total: activities.length,
      active: activities.filter((a) => a.isActive).length,
      premium: activities.filter((a) => a.isPremium).length,
      aiOnly: activities.filter((a) => a.engineConfig?.mode === 'ai_only').length,
      catalogTotal: ACTIVITIES.length,
    }),
    [activities]
  );

  // Katalog pedagojik denetim analizi
  const catalogAudit = useMemo(() => {
    const issuesList: CatalogAuditItem[] = [];
    activities.forEach((act) => {
      const issues: string[] = [];
      if (!act.description || act.description.trim().length < 15) {
        issues.push('Açıklama eksik veya çok kısa');
      }
      if (!act.targetSkills || act.targetSkills.length === 0) {
        issues.push('Hedef beceri tanımlanmamış');
      }
      if (!act.learningObjectives || act.learningObjectives.length === 0) {
        issues.push('Öğrenme kazanımı eksik');
      }
      if (act.engineConfig?.mode !== 'logic_only' && !act.engineConfig?.baseBlueprint) {
        issues.push('AI Mimari DNA (Blueprint) boş');
      }
      if (issues.length > 0) {
        issuesList.push({ id: act.id, title: act.title, issues });
      }
    });
    const healthScore =
      activities.length > 0
        ? Math.round(((activities.length - issuesList.length) / activities.length) * 100)
        : 100;
    return { issuesList, healthScore };
  }, [activities]);

  const handleToggleStatus = async (id: string, field: 'isActive' | 'isPremium') => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    try {
      const newValue = !activity[field];
      await adminService.updateActivity(id, { [field]: newValue });
      setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: newValue } : a)));
      toast.success(`${activity.title} güncellendi`);
    } catch {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleSaveDetail = async (updated: DynamicActivity) => {
    setIsSaving(true);
    try {
      await adminService.saveActivity(updated);
      setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast.success(`${updated.title} başarıyla kaydedildi`);
      setIsInspectorOpen(false);
    } catch {
      toast.error('Kaydetme hatası');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAct.title.trim()) {
      toast.warning('Aktivite başlığı zorunludur');
      return;
    }
    const cleanId =
      newAct.id.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_') ||
      `CUSTOM_${Date.now()}`;

    const created: DynamicActivity = {
      id: cleanId,
      title: newAct.title.trim(),
      description: newAct.description.trim() || 'Özel eğitim amaçlı kişiselleştirilmiş aktivite.',
      icon: 'fa-sparkles',
      category: newAct.category,
      isActive: true,
      isPremium: newAct.isPremium,
      updatedAt: new Date().toISOString(),
      order: activities.length + 1,
      themeColor: '#6366f1',
      targetSkills: ['Bilişsel Esneklik'],
      learningObjectives: ['Yönergeyi anlayarak adımları doğru uygular.'],
      engineConfig: {
        mode: newAct.mode,
        parameters: {
          allowDifficulty: true,
          allowDistraction: true,
          allowFontSize: true,
        },
      },
    };

    setIsSaving(true);
    try {
      await adminService.saveActivity(created);
      setActivities((prev) => [...prev, created]);
      toast.success(`${created.title} oluşturuldu ve yayınlandı.`);
      setIsCreateOpen(false);
      setNewAct({
        id: '',
        title: '',
        description: '',
        category: ACTIVITY_CATEGORIES[0]?.id || 'visual-perception',
        mode: 'ai_only',
        isPremium: false,
      });
    } catch {
      toast.error('Aktivite oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnrichWithAI = async (act: DynamicActivity) => {
    setEnrichingId(act.id);
    try {
      const enriched = await adminService.refineActivityDraft(
        `Başlık: ${act.title}\nKategori: ${act.category}\nMevcut Açıklama: ${act.description || 'Yok'}`
      );
      const updated: DynamicActivity = {
        ...act,
        description: enriched.description || act.description,
        targetSkills:
          enriched.targetSkills && enriched.targetSkills.length > 0
            ? enriched.targetSkills
            : act.targetSkills,
        learningObjectives:
          enriched.learningObjectives && enriched.learningObjectives.length > 0
            ? enriched.learningObjectives
            : act.learningObjectives,
        updatedAt: new Date().toISOString(),
      };
      await adminService.saveActivity(updated);
      setActivities((prev) => prev.map((a) => (a.id === act.id ? updated : a)));
      toast.success(`${act.title} pedagojik verileri AI ile zenginleştirildi.`);
    } catch {
      toast.error('AI zenginleştirme başarısız oldu.');
    } finally {
      setEnrichingId(null);
    }
  };

  const handleBulkAction = async (action: 'active' | 'inactive' | 'delete' | 'clone') => {
    if (selectedIds.length === 0) return;
    setIsSaving(true);
    try {
      if (action === 'delete') {
        const batch = activities.filter((a) => selectedIds.includes(a.id));
        await adminService.deleteActivitiesBulk(batch.map((a) => a.id));
        setActivities((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
        toast.success(`${selectedIds.length} aktivite silindi`);
      } else if (action === 'clone') {
        const toClone = activities.filter((a) => selectedIds.includes(a.id));
        const clones = toClone.map((a, idx) => ({
          ...a,
          id: `${a.id}_CLONE_${Date.now()}_${idx}`,
          title: `${a.title} (Kopya)`,
          isActive: false,
          order: activities.length + idx + 1,
          updatedAt: new Date().toISOString(),
        }));
        await adminService.saveActivitiesBulk(clones);
        setActivities((prev) => [...prev, ...clones]);
        toast.success(`${selectedIds.length} aktivite klonlandı`);
      } else {
        const isActive = action === 'active';
        const batch = activities
          .filter((a) => selectedIds.includes(a.id))
          .map((a) => ({ ...a, isActive }));

        await adminService.saveActivitiesBulk(batch);
        setActivities((prev) =>
          prev.map((a) => (selectedIds.includes(a.id) ? { ...a, isActive } : a))
        );
        toast.success(`${selectedIds.length} aktivite ${isActive ? 'aktif' : 'pasif'} yapıldı`);
      }
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch {
      toast.error('Toplu işlem başarısız');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloneSingle = async (activity: DynamicActivity) => {
    const clone: DynamicActivity = {
      ...activity,
      id: `${activity.id}_CLONE_${Date.now()}`,
      title: `${activity.title} (Kopya)`,
      isActive: false,
      order: activities.length + 1,
      updatedAt: new Date().toISOString(),
    };
    try {
      await adminService.saveActivity(clone);
      setActivities((prev) => [...prev, clone]);
      toast.success(`${activity.title} klonlandı`);
    } catch {
      toast.error('Klonlama başarısız');
    }
  };

  const moveActivity = async (id: string, direction: 'up' | 'down') => {
    const sorted = [...activities].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const idx = sorted.findIndex((a) => a.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[swapIdx].order };
    sorted[swapIdx] = { ...sorted[swapIdx], order: temp };
    try {
      await adminService.saveActivitiesBulk([sorted[idx], sorted[swapIdx]]);
      setActivities((prev) =>
        prev.map((a) => {
          if (a.id === sorted[idx].id) return { ...a, order: sorted[idx].order };
          if (a.id === sorted[swapIdx].id) return { ...a, order: sorted[swapIdx].order };
          return a;
        })
      );
    } catch {
      toast.error('Sıralama güncellenemedi');
    }
  };

  const handleExportCatalog = () => {
    const payload =
      isSelectionMode && selectedIds.length > 0
        ? activities.filter((a) => selectedIds.includes(a.id))
        : activities;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aktivite_katalogu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${payload.length} aktivite JSON olarak dışa aktarıldı.`);
  };

  const handleImportCatalog = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as unknown;
        if (!Array.isArray(parsed)) {
          toast.error('Geçersiz JSON: Dizi formatı bekleniyor.');
          return;
        }
        const valid = parsed.filter(
          (item): item is DynamicActivity =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as DynamicActivity).id === 'string' &&
            typeof (item as DynamicActivity).title === 'string'
        );
        if (valid.length === 0) {
          toast.error('İçe aktarılacak geçerli aktivite bulunamadı.');
          return;
        }
        await adminService.saveActivitiesBulk(valid);
        await fetchActivities();
        toast.success(`${valid.length} aktivite başarıyla içe aktarıldı.`);
      } catch {
        toast.error('JSON okuma hatası.');
      }
    };
    reader.readAsText(file);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectedActivity = selectedId ? activities.find((a) => a.id === selectedId) : undefined;

  return (
    <div className="flex flex-col h-full space-y-6 font-lexend overflow-hidden">
      {/* ── Dashboard Stats Bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Dinamik / Katalog',
            value: `${stats.total} / ${stats.catalogTotal}`,
            icon: Layers,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Aktif Yayın',
            value: stats.active,
            icon: ActivityIcon,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Premium Modül',
            value: stats.premium,
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'AI Motoru (Saf)',
            value: stats.aiOnly,
            icon: Sparkles,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
          },
        ].map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={idx}
            className="p-4 rounded-[1.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-4 group shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}
            >
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {stat.label}
              </p>
              <h4 className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Control Center (Toolbar) ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] p-4 rounded-3xl border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Aktivite adı, ID veya açıklama ara..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Tüm Kategoriler</option>
            {ACTIVITY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="premium">Premium</option>
          </select>
          <select
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">Tüm Motorlar</option>
            <option value="ai_only">Saf AI</option>
            <option value="hybrid">Hibrit</option>
            <option value="logic_only">Offline / Algoritmik</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-sm"
          >
            <Plus size={14} /> Yeni
          </button>
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedIds([]);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              isSelectionMode
                ? 'bg-amber-500 text-white'
                : 'bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isSelectionMode ? 'Seçimi Kapat' : 'Çoklu Seçim'}
          </button>
          <button
            onClick={handleExportCatalog}
            className="p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
            title="JSON Dışa Aktar"
          >
            <Download size={16} />
          </button>
          <label
            className="p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors cursor-pointer"
            title="JSON İçe Aktar"
          >
            <Upload size={16} />
            <input type="file" accept=".json" className="hidden" onChange={handleImportCatalog} />
          </label>
          <button
            onClick={fetchActivities}
            className="p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
            title="Yenile"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsAuditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-md"
          >
            <Sparkles size={14} /> AI Denetim ({catalogAudit.issuesList.length})
          </button>
        </div>
      </div>

      {/* ── Activity Grid ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw size={32} className="text-[var(--accent-color)] animate-spin" />
            <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">
              Aktiviteler Yükleniyor
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-32">
            <AnimatePresence>
              {filteredActivities.map((act) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={act.id}
                  className={`group relative p-5 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    isSelectionMode && selectedIds.includes(act.id)
                      ? 'border-[var(--accent-color)] ring-4 ring-[var(--accent-muted)] bg-[var(--bg-secondary)]'
                      : act.isActive
                        ? 'bg-[var(--bg-secondary)] border-[var(--border-color)]'
                        : 'bg-red-500/5 border-red-500/20'
                  }`}
                  onClick={() => isSelectionMode && toggleSelect(act.id)}
                >
                  {isSelectionMode && (
                    <div
                      className={`absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full border-2 border-[var(--bg-paper)] flex items-center justify-center transition-all ${
                        selectedIds.includes(act.id)
                          ? 'bg-[var(--accent-color)] text-white'
                          : 'bg-[var(--bg-paper)] text-transparent'
                      }`}
                    >
                      <Target size={13} />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: act.themeColor || '#6366f1' }}
                    >
                      <i className={`fa-solid ${act.icon || 'fa-box'} text-lg`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(act.id, 'isPremium');
                        }}
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-tight transition-all ${
                          act.isPremium
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border-color)]'
                        }`}
                        title="Premium durumunu değiştir"
                      >
                        {act.isPremium ? 'PREMIUM' : 'ÜCRETSİZ'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(act.id, 'isActive');
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          act.isActive
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                        title={act.isActive ? 'Pasife al' : 'Aktifleştir'}
                      >
                        {act.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-sm text-[var(--text-primary)] uppercase tracking-tight truncate">
                      {act.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest truncate">
                        {act.category}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-paper)] text-[var(--text-secondary)] font-mono border border-[var(--border-color)]">
                        {act.engineConfig?.mode || 'ai_only'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveActivity(act.id, 'up');
                        }}
                        className="p-1 hover:bg-[var(--bg-paper)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Yukarı taşı"
                      >
                        <i className="fa-solid fa-arrow-up text-[9px]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveActivity(act.id, 'down');
                        }}
                        className="p-1 hover:bg-[var(--bg-paper)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Aşağı taşı"
                      >
                        <i className="fa-solid fa-arrow-down text-[9px]" />
                      </button>
                      <span className="text-[9px] font-mono text-[var(--text-muted)] ml-1">#{act.order}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {onOpenPrompt && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPrompt(act.id);
                          }}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                          title="Prompt Stüdyosunda Düzenle"
                        >
                          <Terminal size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneSingle(act);
                        }}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-muted)] transition-all"
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
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--accent-color)] hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                      >
                        Düzenle <Settings size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredActivities.length === 0 && (
              <div className="col-span-full py-12 text-center text-[var(--text-muted)] font-bold uppercase text-xs italic">
                Eşleşen aktivite bulunamadı.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Side Inspector (Drawer) ─────────────────────────────────── */}
      <AnimatePresence>
        {isInspectorOpen && selectedActivity && (
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
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[var(--bg-paper)] border-l border-[var(--border-color)] z-[101] shadow-2xl overflow-hidden flex flex-col"
            >
              <InspectorContent
                id={selectedActivity.id}
                activity={selectedActivity}
                onClose={() => setIsInspectorOpen(false)}
                onSave={handleSaveDetail}
                onOpenPrompt={onOpenPrompt}
                isSaving={isSaving}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── AI Pedagojik Denetim Modalı ──────────────────────────────── */}
      <AnimatePresence>
        {isAuditOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
            onClick={() => setIsAuditOpen(false)}
          >
            <div
              className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] text-[var(--accent-color)] flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[var(--text-primary)] uppercase">
                      AI Pedagojik Katalog Denetimi
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Kapsama Skoru: <strong className="text-emerald-500">%{catalogAudit.healthScore}</strong> ·{' '}
                      {catalogAudit.issuesList.length} aktivitede eksik alan tespit edildi
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAuditOpen(false)}
                  className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {catalogAudit.issuesList.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
                    <p className="text-sm font-black text-[var(--text-primary)]">
                      Tüm aktiviteler tam pedagojik standartta!
                    </p>
                  </div>
                ) : (
                  catalogAudit.issuesList.map((item) => {
                    const act = activities.find((a) => a.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                            <h4 className="text-xs font-black text-[var(--text-primary)] truncate">{item.title}</h4>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1">
                            {item.issues.join(' · ')}
                          </p>
                        </div>
                        {act && (
                          <button
                            onClick={() => handleEnrichWithAI(act)}
                            disabled={enrichingId === act.id}
                            className="px-3 py-1.5 rounded-xl bg-[var(--accent-color)] text-white text-[10px] font-black uppercase tracking-wider shrink-0 disabled:opacity-50"
                          >
                            {enrichingId === act.id ? 'Üretiliyor...' : 'AI ile Tamamla'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Yeni Aktivite Oluştur Modalı ──────────────────────────────── */}
      <AnimatePresence>
        {isCreateOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
            onClick={() => setIsCreateOpen(false)}
          >
            <form
              onSubmit={handleCreateActivity}
              className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 w-full max-w-md space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[var(--text-primary)] uppercase">
                  Yeni Aktivite Oluştur
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 rounded-full hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Başlık *</label>
                <input
                  required
                  value={newAct.title}
                  onChange={(e) => setNewAct({ ...newAct, title: e.target.value })}
                  placeholder="Örn: Fonolojik Hece Avı"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Kimlik ID (opsiyonel)</label>
                <input
                  value={newAct.id}
                  onChange={(e) => setNewAct({ ...newAct, id: e.target.value })}
                  placeholder="PHONOLOGICAL_SYLLABLE_HUNT"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-primary)] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Kategori</label>
                  <select
                    value={newAct.category}
                    onChange={(e) => setNewAct({ ...newAct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
                  >
                    {ACTIVITY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Motor Modu</label>
                  <select
                    value={newAct.mode}
                    onChange={(e) =>
                      setNewAct({ ...newAct, mode: e.target.value as 'ai_only' | 'hybrid' | 'logic_only' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
                  >
                    <option value="ai_only">Saf AI</option>
                    <option value="hybrid">Hibrit</option>
                    <option value="logic_only">Offline</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Açıklama</label>
                <textarea
                  value={newAct.description}
                  onChange={(e) => setNewAct({ ...newAct, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAct.isPremium}
                  onChange={(e) => setNewAct({ ...newAct, isPremium: e.target.checked })}
                />
                Premium Aktivite olarak işaretle
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-black uppercase"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-2.5 rounded-xl bg-[var(--accent-color)] text-white text-xs font-black uppercase"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Oluştur & Yayınla'}
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      {/* ── Bulk Actions Floating Bar ───────────────────────────────── */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: 100, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] flex flex-wrap items-center gap-3 bg-[var(--bg-paper)] text-[var(--text-primary)] px-6 py-4 rounded-[2rem] shadow-2xl border border-[var(--border-color)]"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Seçilen</span>
              <span className="text-sm font-black whitespace-nowrap">{selectedIds.length} Aktivite</span>
            </div>
            <div className="w-px h-8 bg-[var(--border-color)] mx-1" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('active')}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase rounded-xl transition-all"
              >
                Aç
              </button>
              <button
                onClick={() => handleBulkAction('inactive')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase rounded-xl transition-all"
              >
                Kapat
              </button>
              <button
                onClick={() => handleBulkAction('clone')}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase rounded-xl transition-all"
              >
                Klonla
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded-xl transition-all"
              >
                Sil
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedIds([]);
                setIsSelectionMode(false);
              }}
              className="ml-2 p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors"
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
const InspectorContent = ({
  id,
  activity,
  onClose,
  onSave,
  onOpenPrompt,
  isSaving,
}: {
  id: string;
  activity: DynamicActivity;
  onClose: () => void;
  onSave: (updated: DynamicActivity) => void;
  onOpenPrompt?: (activityId: string) => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = useState<DynamicActivity>({ ...activity });
  const [newSkill, setNewSkill] = useState('');
  const [newObjective, setNewObjective] = useState('');

  useEffect(() => {
    setFormData({ ...activity });
  }, [activity]);

  const updateField = (path: string, value: unknown) => {
    setFormData((prev) => {
      if (path.includes('.')) {
        const parts = path.split('.');
        if (parts.length === 2) {
          const [parent, child] = parts as [keyof DynamicActivity, string];
          const parentObj = prev[parent];
          if (parentObj && typeof parentObj === 'object' && !Array.isArray(parentObj)) {
            return { ...prev, [parent]: { ...parentObj, [child]: value } };
          }
        } else if (parts.length === 3 && parts[0] === 'engineConfig' && parts[1] === 'parameters') {
          return {
            ...prev,
            engineConfig: {
              ...prev.engineConfig,
              parameters: {
                ...prev.engineConfig.parameters,
                [parts[2]]: value,
              },
            },
          };
        }
      }
      return { ...prev, [path]: value };
    });
  };

  const handleAddSkill = () => {
    const val = newSkill.trim();
    if (!val) return;
    setFormData((prev) => ({
      ...prev,
      targetSkills: [...(prev.targetSkills || []), val],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      targetSkills: (prev.targetSkills || []).filter((_, i) => i !== idx),
    }));
  };

  const handleAddObjective = () => {
    const val = newObjective.trim();
    if (!val) return;
    setFormData((prev) => ({
      ...prev,
      learningObjectives: [...(prev.learningObjectives || []), val],
    }));
    setNewObjective('');
  };

  const handleRemoveObjective = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      learningObjectives: (prev.learningObjectives || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-paper)]">
      {/* Header */}
      <div className="p-6 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: formData.themeColor || '#6366f1' }}
          >
            <i className={`fa-solid ${formData.icon || 'fa-box'}`} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-[var(--text-primary)] truncate max-w-[220px]">
              {formData.title}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] font-mono">#{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenPrompt && (
            <button
              onClick={() => onOpenPrompt(id)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase flex items-center gap-1.5 hover:bg-amber-500 hover:text-white transition-all"
              title="Prompt Stüdyosuna Git"
            >
              <Terminal size={12} /> Prompt
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-paper)] rounded-full transition-colors text-[var(--text-muted)]"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Basic Info Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)]" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Temel Ayarlar
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1">Başlık</label>
              <input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] focus:ring-1 focus:ring-[var(--accent-color)] outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none"
              >
                {ACTIVITY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase ml-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] outline-none min-h-[68px]"
            />
          </div>
        </section>

        {/* AI Engine Section */}
        <section className="space-y-4 p-5 rounded-[1.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-[var(--accent-color)]" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)]">
                AI & Profil Ayarları
              </h4>
            </div>
            <div className="flex gap-1.5">
              {(['ai_only', 'hybrid', 'logic_only'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateField('engineConfig.mode', m)}
                  className={`px-2 py-1 rounded text-[9px] font-black uppercase transition-all ${
                    formData.engineConfig?.mode === m
                      ? 'bg-[var(--accent-color)] text-white shadow'
                      : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              {
                key: 'engineConfig.parameters.allowDifficulty',
                label: 'Zorluk Seviyesi Uyumu (Kolay / Orta / Zor)',
                checked: !!formData.engineConfig?.parameters?.allowDifficulty,
                icon: Target,
              },
              {
                key: 'engineConfig.parameters.allowDistraction',
                label: 'DEHB Çeldirici / Odak Modu',
                checked: !!formData.engineConfig?.parameters?.allowDistraction,
                icon: Sparkles,
              },
              {
                key: 'engineConfig.parameters.allowFontSize',
                label: 'Disleksi Lexend Punto Ölçekleme',
                checked: !!formData.engineConfig?.parameters?.allowFontSize,
                icon: Layers,
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <item.icon size={14} className="text-[var(--accent-color)]" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => updateField(item.key, e.target.checked)}
                  className="w-4 h-4 accent-[var(--accent-color)]"
                />
              </label>
            ))}
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
              <Shield size={10} /> Mimari DNA (Blueprint)
            </label>
            <textarea
              value={formData.engineConfig?.baseBlueprint || ''}
              placeholder="Creative Studio Blueprint DNA..."
              onChange={(e) => updateField('engineConfig.baseBlueprint', e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[11px] font-mono text-[var(--text-primary)] outline-none min-h-[80px]"
            />
          </div>
        </section>

        {/* Pedagogical Metadata */}
        <section className="space-y-5 pb-8">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Pedagojik Veriler
            </h4>
          </div>

          {/* Hedef Beceriler */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Hedef Beceriler</label>
            <div className="flex flex-wrap gap-2">
              {(formData.targetSkills || []).map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[var(--bg-secondary)] rounded-lg text-[10px] font-bold text-[var(--text-primary)] flex items-center gap-2 border border-[var(--border-color)]"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(i)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Yeni beceri ekle (ör. Görsel Tarama)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent-color)] text-white text-xs font-bold"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Öğrenme Kazanımları */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Öğrenme Kazanımları</label>
            <div className="space-y-2">
              {(formData.learningObjectives || []).map((obj, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] group"
                >
                  <ChevronRight size={12} className="text-[var(--accent-color)] shrink-0" />
                  <span className="text-[11px] flex-1 font-medium text-[var(--text-primary)]">{obj}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(i)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
                placeholder="Yeni MEB / BEP kazanımı ekle..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-3 py-1.5 rounded-xl bg-[var(--accent-color)] text-white text-xs font-bold"
              >
                Ekle
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-2xl text-xs font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-all"
        >
          Vazgeç
        </button>
        <button
          onClick={() => onSave(formData)}
          disabled={isSaving}
          className="flex-[2] py-3 bg-[var(--accent-color)] text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Yayınla'}
        </button>
      </div>
    </div>
  );
};

AdminActivityManager.displayName = 'AdminActivityManager';
