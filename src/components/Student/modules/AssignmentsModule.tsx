import React, { useState, useMemo } from 'react';
import { ActivityAssignment } from '../../../types/assignment';
import { ActivityType } from '../../../types/activity';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import { useGetUserWorksheets } from '../../../hooks/useWorksheets';
import { useToastStore } from '../../../store/useToastStore';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../../../constants';
import { STUDIO_GROUPS } from '../../../constants/studios';
import { worksheetService } from '../../../services/worksheetService';

interface AssignmentsModuleProps {
  studentId: string;
  assignments: ActivityAssignment[];
  onUpdateAssignment?: (id: string, updates: Partial<ActivityAssignment>) => void;
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'completed';
type SortBy = 'dueDate' | 'assignedAt' | 'score' | 'status';

export const AssignmentsModule: React.FC<AssignmentsModuleProps> = ({
  studentId,
  assignments,
  onUpdateAssignment,
}) => {
  const allAssignments = assignments;
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<ActivityAssignment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewAssignModal, setShowNewAssignModal] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editScore, setEditScore] = useState<number | undefined>(undefined);

  const filtered = useMemo(() => {
    let result = [...allAssignments];
    if (filterStatus !== 'all') {
      result = result.filter((a: ActivityAssignment) => a.status === filterStatus);
    }
    if (searchQuery) {
      result = result.filter((a: ActivityAssignment) =>
        (a.teacherNotes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.worksheetId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate': return new Date(a.dueDate || '2099-01-01').getTime() - new Date(b.dueDate || '2099-01-01').getTime();
        case 'assignedAt': return new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
        case 'score': return (b.score || 0) - (a.score || 0);
        case 'status': {
          const order = { pending: 0, in_progress: 1, completed: 2, abandoned: 3 };
          return (order[a.status] || 0) - (order[b.status] || 0);
        }
        default: return 0;
      }
    });
    return result;
  }, [allAssignments, filterStatus, sortBy, searchQuery]);

  const statusCounts = useMemo(() => ({
    all: allAssignments.length,
    pending: allAssignments.filter(a => a.status === 'pending').length,
    in_progress: allAssignments.filter(a => a.status === 'in_progress').length,
    completed: allAssignments.filter(a => a.status === 'completed').length,
  }), [allAssignments]);

  const handleSaveEdit = () => {
    if (selectedAssignment && onUpdateAssignment) {
      const updates: Partial<ActivityAssignment> = {};
      if (editNotes !== selectedAssignment.teacherNotes) updates.teacherNotes = editNotes;
      if (editScore !== undefined && editScore !== selectedAssignment.score) updates.score = editScore;
      if (Object.keys(updates).length > 0) {
        onUpdateAssignment(selectedAssignment.id, updates);
      }
    }
    setShowEditModal(false);
    setSelectedAssignment(null);
  };

  const handleOpenEdit = (assignment: ActivityAssignment) => {
    setSelectedAssignment(assignment);
    setEditNotes(assignment.teacherNotes || '');
    setEditScore(assignment.score);
    setShowEditModal(true);
  };

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const data = filtered.map(a => ({
      id: a.id,
      worksheetId: a.worksheetId,
      status: a.status,
      dueDate: a.dueDate,
      score: a.score,
      notes: a.teacherNotes,
      assignedAt: a.assignedAt,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = 'atamalar.json';
    el.click();
    URL.revokeObjectURL(url);
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      pending: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      abandoned: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };
    const label: Record<string, string> = {
      completed: 'Tamamlandı',
      in_progress: 'Devam Ediyor',
      pending: 'Bekliyor',
      abandoned: 'Terke',
    };
    return <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full border ${map[status] || ''}`}>{label[status] || status}</span>;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs tracking-tighter text-[var(--text-primary)] uppercase">Atamalar</h3>
          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {allAssignments.length} toplam atama
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowNewAssignModal(true)} className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 flex items-center justify-center text-white hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-black text-[9px] uppercase tracking-widest shadow-md shadow-indigo-500/20 border border-white/10">
            <i className="fa-solid fa-plus mr-1.5"></i> Yeni Ata
          </button>
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={handleDownload} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[140px]">
          <i className="fa-solid fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[8px]"></i>
          <input
            type="text"
            placeholder="Atama ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)]"
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="px-2 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[8px] font-bold text-[var(--text-secondary)] outline-none cursor-pointer"
        >
          <option value="dueDate">Teslim Tarihi</option>
          <option value="assignedAt">Atama Tarihi</option>
          <option value="score">Skor</option>
          <option value="status">Durum</option>
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
        {([['all', 'Tümü'], ['pending', 'Bekleyen'], ['in_progress', 'Devam Eden'], ['completed', 'Tamamlanan']] as [FilterStatus, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`flex-1 py-1.5 text-[7px] font-black uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${filterStatus === key ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            {label} <span className="opacity-60">({statusCounts[key]})</span>
          </button>
        ))}
      </div>

      {/* Assignment List */}
      <div className="space-y-2">
        {filtered.map((a: ActivityAssignment) => (
          <div key={a.id} className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : a.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  <i className={`fa-solid ${a.status === 'completed' ? 'fa-check-double' : a.status === 'in_progress' ? 'fa-spinner fa-spin' : 'fa-clock'} text-xs`}></i>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase">#{a.worksheetId.slice(0, 6)}</h4>
                    {statusBadge(a.status)}
                    {a.score !== undefined && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${a.score >= 80 ? 'bg-emerald-500/10 text-emerald-500' : a.score >= 60 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {a.score} puan
                      </span>
                    )}
                  </div>
                  {a.teacherNotes && (
                    <p className="text-[8px] text-[var(--text-muted)] mt-1 leading-relaxed">{a.teacherNotes}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[7px] text-[var(--text-muted)] font-bold">
                      <i className="fa-solid fa-calendar mr-1"></i>
                      {a.dueDate ? new Date(a.dueDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                    </span>
                    <span className="text-[7px] text-[var(--text-muted)] font-bold">
                      <i className="fa-solid fa-user mr-1"></i>
                      {new Date(a.assignedAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenEdit(a)} className="w-6 h-6 rounded-md bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Düzenle">
                  <i className="fa-solid fa-pen text-[8px]"></i>
                </button>
                {a.status !== 'completed' && onUpdateAssignment && (
                  <button onClick={() => onUpdateAssignment(a.id, { status: 'completed' })} className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all" title="Tamamla">
                    <i className="fa-solid fa-check text-[8px]"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
            <i className="fa-solid fa-clipboard-list text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
            <p className="text-[var(--text-muted)] font-bold text-[9px] uppercase tracking-widest">Atama bulunamadı</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border-color)]">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="font-black text-xs text-[var(--text-primary)] uppercase">Atama Düzenle</h3>
              <button onClick={() => setShowEditModal(false)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[9px]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Notlar</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)] h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Skor</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editScore ?? ''}
                  onChange={e => setEditScore(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)]"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-[var(--text-muted)] font-bold text-[9px] rounded-lg hover:bg-[var(--bg-secondary)] transition-all">İptal</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-[var(--accent-color)] text-white font-bold text-[9px] rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5">
                <i className="fa-solid fa-save text-[8px]"></i> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Assignment Modal */}
      <NewAssignmentModal 
        isOpen={showNewAssignModal} 
        onClose={() => setShowNewAssignModal(false)} 
        studentId={studentId} 
      />
    </div>
  );
};

// ── Studio → ActivityType mapping for assignment creation ──────────────────────
const STUDIO_ACTIVITY_MAP: Record<string, ActivityType> = {
  'reading': ActivityType.READING_COMPREHENSION,
  'math': ActivityType.MATH_STUDIO,
  'super-turkce': ActivityType.PREMIUM_STUDIO,
  'sinav-studyosu': ActivityType.SINAV,
  'mat-sinav-studyosu': ActivityType.MAT_SINAV,
  'activity-studio': ActivityType.PREMIUM_STUDIO,
  'infographic-studio': ActivityType.INFOGRAPHIC_STUDIO,
  'sari-kitap-studio': ActivityType.SARI_KITAP_STUDIO,
  'kelime-cumle-studio': ActivityType.KELIME_CUMLE,
};

// Studios that are not assignable (informational only)
const NON_ASSIGNABLE_STUDIOS = new Set(['screening', 'curriculum', 'guide', 'tour', 'help', 'about', 'developer']);

function getActivityMeta(type: ActivityType | string) {
  return ACTIVITIES.find(a => a.id === type) || null;
}
function getCategoryForActivity(type: ActivityType | string) {
  return ACTIVITY_CATEGORIES.find(c => (c.activities as unknown as string[]).includes(type as string)) || null;
}

const NewAssignmentModal: React.FC<{ isOpen: boolean; onClose: () => void; studentId: string }> = ({ isOpen, onClose, studentId }) => {
  const { user } = useAuthStore();
  const { createAssignment, isLoading: isCreating } = useAssignmentStore();
  const worksheetsData = useGetUserWorksheets({
    userId: user?.id || '',
    userRole: user?.role || 'teacher',
    pageSize: 50
  });

  type SourceTab = 'catalog' | 'archive';
  const [activeTab, setActiveTab] = useState<SourceTab>('catalog');
  const [selectedWorksheetId, setSelectedWorksheetId] = useState('');
  const [selectedCatalogType, setSelectedCatalogType] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // ── Catalog: flat list of all ACTIVITIES ──────────────────────────────────────
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ACTIVITIES.filter(activity => {
      if (!q) return true;
      const cat = getCategoryForActivity(activity.id);
      return (
        activity.title.toLowerCase().includes(q) ||
        activity.id.toLowerCase().includes(q) ||
        (cat?.title || '').toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  // ── Catalog: assignable studios ──────────────────────────────────────────────
  const assignableStudios = useMemo(() => {
    return STUDIO_GROUPS.flatMap(g =>
      g.items.filter(s => !NON_ASSIGNABLE_STUDIOS.has(s.id) && STUDIO_ACTIVITY_MAP[s.id])
    );
  }, []);

  const filteredStudios = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return assignableStudios;
    return assignableStudios.filter(s => s.label.toLowerCase().includes(q));
  }, [searchQuery, assignableStudios]);

  // ── Archive: saved worksheets ──────────────────────────────────────────────
  const filteredArchive = useMemo(() => {
    const items = worksheetsData.data?.items || [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return items;
    return items.filter(w =>
      (w.name || '').toLowerCase().includes(q) ||
      (w.activityType || '').toLowerCase().includes(q)
    );
  }, [worksheetsData.data, searchQuery]);

  // ── Main assign handler ──────────────────────────────────────────────────────
  const handleAssign = async () => {
    let finalWorksheetId = selectedWorksheetId;

    // When from catalog: persist a new worksheet to saved_worksheets first
    if (activeTab === 'catalog' && selectedCatalogType) {
      setIsSaving(true);
      try {
        const meta = getActivityMeta(selectedCatalogType as ActivityType);
        const cat = getCategoryForActivity(selectedCatalogType as ActivityType);
        const saved = await worksheetService.saveWorksheet(
          user?.id || 'system',
          meta?.title || selectedCatalogType,
          selectedCatalogType as ActivityType,
          [],
          meta?.icon || 'fa-solid fa-puzzle-piece',
          cat ? { id: cat.id, title: cat.title } : { id: 'uncategorized', title: 'Kategorisiz' }
        );
        finalWorksheetId = saved.id;
      } catch {
        useToastStore.getState().error('Etkinlik kaydedilemedi. Lütfen tekrar deneyin.');
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }

    if (!finalWorksheetId) {
      useToastStore.getState().error('Lütfen bir etkinlik seçin.');
      return;
    }

    const isoDueDate = dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : undefined;
    const success = await createAssignment({
      studentIds: [studentId],
      worksheetId: finalWorksheetId,
      dueDate: isoDueDate,
      teacherNotes: notes
    }, user?.id || 'system');

    if (success) {
      onClose();
      setSelectedWorksheetId('');
      setSelectedCatalogType('');
      setDueDate('');
      setNotes('');
      setSearchQuery('');
      setActiveTab('catalog');
    }
  };

  const hasSelection = activeTab === 'archive' ? !!selectedWorksheetId : !!selectedCatalogType;
  const busy = isCreating || isSaving;

  return (
    <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] flex flex-col max-h-[90vh]">
        {/* ── Header ── */}
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <i className="fa-solid fa-paper-plane text-white text-[10px]"></i>
            </div>
            <div>
              <h3 className="font-black text-xs text-[var(--text-primary)] uppercase tracking-tight">Yeni Atama Yap</h3>
              <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Etkinlik veya stüdyo seçin</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
            <i className="fa-solid fa-times text-[10px]"></i>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="px-4 pt-3 shrink-0">
          <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
            {([
              ['catalog', 'fa-layer-group', 'Tüm Etkinlikler & Stüdyolar'],
              ['archive', 'fa-archive', 'Arşivim'],
            ] as [SourceTab, string, string][]).map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearchQuery(''); setSelectedCatalogType(''); setSelectedWorksheetId(''); }}
                className={`flex-1 py-2 text-[8px] font-black uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${activeTab === key ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                <i className={`fa-solid ${icon} text-[8px]`}></i> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">

          {/* Search Bar */}
          <div>
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[8px]"></i>
              <input
                type="text"
                placeholder={activeTab === 'catalog' ? 'Etkinlik, stüdyo veya kategori ara...' : 'Arşivimde ara...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-[var(--text-primary)] font-medium transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  <i className="fa-solid fa-times-circle text-[9px]"></i>
                </button>
              )}
            </div>
          </div>

          {/* ── CATALOG TAB ── */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">

              {/* Activities grouped by category */}
              <div>
                <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  <i className="fa-solid fa-puzzle-piece mr-1 text-indigo-500"></i>
                  Etkinlikler
                  <span className="ml-1.5 opacity-60">({filteredCatalog.length})</span>
                </p>
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {ACTIVITY_CATEGORIES.map(cat => {
                    const catActivities = filteredCatalog.filter(a =>
                      (cat.activities as unknown as string[]).includes(a.id as string)
                    );
                    if (catActivities.length === 0) return null;
                    return (
                      <div key={cat.id}>
                        <p className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <i className={`${cat.icon} text-[8px] text-indigo-400`}></i>
                          {cat.title}
                          <span className="opacity-50">({catActivities.length})</span>
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {catActivities.map(activity => (
                            <div
                              key={activity.id}
                              onClick={() => { setSelectedCatalogType(activity.id as string); setSelectedWorksheetId(''); }}
                              className={`p-2.5 rounded-xl border cursor-pointer transition-all group/card flex items-center gap-2.5 ${selectedCatalogType === activity.id ? 'border-indigo-500 bg-indigo-500/5 shadow-sm' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 hover:bg-[var(--bg-paper)]'}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${selectedCatalogType === activity.id ? 'bg-indigo-500/20 text-indigo-600' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] group-hover/card:text-indigo-500'}`}>
                                <i className={`${activity.icon || 'fa-solid fa-puzzle-piece'} text-[9px]`}></i>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-[9px] text-[var(--text-primary)] leading-tight truncate">{activity.title}</h4>
                                <p className="text-[7px] text-[var(--text-muted)] mt-0.5 truncate">{activity.description}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedCatalogType === activity.id ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)]'}`}>
                                {selectedCatalogType === activity.id && <i className="fa-solid fa-check text-white text-[6px]"></i>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Activities not in any category */}
                  {(() => {
                    const categorised = new Set(ACTIVITY_CATEGORIES.flatMap(c => c.activities as unknown as string[]));
                    const uncategorised = filteredCatalog.filter(a => !categorised.has(a.id as string));
                    if (uncategorised.length === 0) return null;
                    return (
                      <div>
                        <p className="text-[7px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <i className="fa-solid fa-shapes text-[8px] text-indigo-400"></i>
                          Diğer Etkinlikler
                          <span className="opacity-50">({uncategorised.length})</span>
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {uncategorised.map(activity => (
                            <div
                              key={activity.id}
                              onClick={() => { setSelectedCatalogType(activity.id as string); setSelectedWorksheetId(''); }}
                              className={`p-2.5 rounded-xl border cursor-pointer transition-all group/card flex items-center gap-2.5 ${selectedCatalogType === activity.id ? 'border-indigo-500 bg-indigo-500/5 shadow-sm' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 hover:bg-[var(--bg-paper)]'}`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${selectedCatalogType === activity.id ? 'bg-indigo-500/20 text-indigo-600' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] group-hover/card:text-indigo-500'}`}>
                                <i className={`${activity.icon || 'fa-solid fa-puzzle-piece'} text-[9px]`}></i>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-[9px] text-[var(--text-primary)] leading-tight truncate">{activity.title}</h4>
                                <p className="text-[7px] text-[var(--text-muted)] mt-0.5 truncate">{activity.description}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedCatalogType === activity.id ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)]'}`}>
                                {selectedCatalogType === activity.id && <i className="fa-solid fa-check text-white text-[6px]"></i>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {filteredCatalog.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6">
                      <i className="fa-solid fa-magnifying-glass text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
                      <p className="text-[9px] font-bold text-[var(--text-muted)]">Aramayla eşleşen etkinlik bulunamadı.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Studios */}
              <div>
                <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  <i className="fa-solid fa-wand-magic-sparkles mr-1 text-fuchsia-500"></i>
                  Stüdyolar
                  <span className="ml-1.5 opacity-60">({filteredStudios.length})</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredStudios.map(studio => {
                    const type = STUDIO_ACTIVITY_MAP[studio.id];
                    return (
                      <div
                        key={studio.id}
                        onClick={() => { setSelectedCatalogType(type as string); setSelectedWorksheetId(''); }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all group/card ${selectedCatalogType === type ? 'border-fuchsia-500 bg-fuchsia-500/5 shadow-sm' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-fuchsia-500/30 hover:bg-[var(--bg-paper)]'}`}
                      >
                        <div className="flex flex-col items-center gap-1.5 text-center">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${selectedCatalogType === type ? 'bg-fuchsia-500/20 text-fuchsia-600' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] group-hover/card:text-fuchsia-500'}`}>
                            <i className={`fa-solid ${studio.icon} text-[11px]`}></i>
                          </div>
                          <p className="text-[8px] font-black text-[var(--text-primary)] leading-tight">{studio.label}</p>
                          {selectedCatalogType === type && (
                            <span className="text-[6px] font-black text-fuchsia-600 uppercase tracking-widest">Seçili</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredStudios.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center py-4">
                      <p className="text-[9px] font-bold text-[var(--text-muted)]">Aramayla eşleşen stüdyo bulunamadı.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ARCHIVE TAB ── */}
          {activeTab === 'archive' && (
            <div>
              {worksheetsData.loading ? (
                <div className="p-6 flex flex-col items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner fa-spin text-xl text-[var(--accent-color)]"></i>
                  <span className="text-[9px] font-bold text-[var(--text-muted)]">İçerikleriniz Yükleniyor...</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">
                    {filteredArchive.length} kayıtlı içerik
                  </p>
                  {filteredArchive.map(w => {
                    const meta = getActivityMeta(w.activityType as ActivityType);
                    return (
                      <div key={w.id}
                        onClick={() => { setSelectedWorksheetId(w.id); setSelectedCatalogType(''); }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all group/card ${selectedWorksheetId === w.id ? 'border-indigo-500 bg-indigo-500/5 shadow-sm' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 hover:bg-[var(--bg-paper)]'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${selectedWorksheetId === w.id ? 'bg-indigo-500/20 text-indigo-600' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] group-hover/card:text-indigo-500'}`}>
                              <i className={`${meta?.icon || 'fa-solid fa-file-lines'} text-[9px]`}></i>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-[10px] text-[var(--text-primary)] leading-tight truncate">{w.name || 'İsimsiz İçerik'}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-paper)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{meta?.title || w.activityType || 'Genel'}</span>
                                <span className="text-[7px] text-[var(--text-muted)] font-bold">{new Date(w.createdAt).toLocaleDateString('tr-TR')}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedWorksheetId === w.id ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)]'}`}>
                            {selectedWorksheetId === w.id && <i className="fa-solid fa-check text-white text-[7px]"></i>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredArchive.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <i className="fa-solid fa-folder-open text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] text-center">
                        {searchQuery ? 'Aramayla eşleşen içerik bulunamadı.' : 'Arşivinizde kayıtlı etkinlik bulunmuyor.'}
                      </p>
                      {!searchQuery && (
                        <button onClick={() => setActiveTab('catalog')} className="mt-2 text-[8px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest">
                          Katalogdan Seç →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Due Date ── */}
          <div>
            <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">
              <i className="fa-solid fa-calendar-day mr-1 text-indigo-500"></i>Teslim Tarihi (Opsiyonel)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-[var(--text-primary)] font-bold transition-all"
            />
          </div>

          {/* ── Teacher Notes ── */}
          <div>
            <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">
              <i className="fa-solid fa-pen-fancy mr-1 text-indigo-500"></i>Öğretmen Notu (Opsiyonel)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-[var(--text-primary)] h-20 resize-none font-medium transition-all"
              placeholder="Bu etkinlikte şunlara dikkat etmelisin..."
            />
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2 shrink-0">
          <button disabled={busy} onClick={onClose} className="px-4 py-2 text-[var(--text-muted)] font-bold text-[9px] rounded-lg hover:bg-[var(--bg-secondary)] transition-all uppercase tracking-widest">İptal</button>
          <button
            disabled={busy || !hasSelection}
            onClick={handleAssign}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white font-black text-[9px] rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest border border-white/10"
          >
            {busy
              ? <><i className="fa-solid fa-spinner fa-spin text-[10px]"></i> {isSaving ? 'Kaydediliyor...' : 'Atanıyor...'}</>
              : <><i className="fa-solid fa-paper-plane text-[10px]"></i> Ata</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};
