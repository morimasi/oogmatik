import React, { useState, useMemo } from 'react';
import { ActivityAssignment } from '../../../types/assignment';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import { useGetUserWorksheets } from '../../../hooks/useWorksheets';
import { useToastStore } from '../../../store/useToastStore';

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

const NewAssignmentModal: React.FC<{ isOpen: boolean; onClose: () => void; studentId: string }> = ({ isOpen, onClose, studentId }) => {
  const { user } = useAuthStore();
  const { createAssignment, isLoading } = useAssignmentStore();
  const worksheetsData = useGetUserWorksheets({
    userId: user?.id || '',
    userRole: user?.role || 'teacher',
    pageSize: 50
  });

  const [selectedWorksheetId, setSelectedWorksheetId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [worksheetSearch, setWorksheetSearch] = useState('');

  if (!isOpen) return null;

  // Filter worksheets based on search query (by name or activity type)
  const filteredWorksheets = worksheetsData.data?.items?.filter(w => {
    if (!worksheetSearch) return true;
    const q = worksheetSearch.toLowerCase();
    return (
      (w.name || '').toLowerCase().includes(q) ||
      (w.activityType || '').toLowerCase().includes(q)
    );
  }) || [];

  const handleAssign = async () => {
    if (!selectedWorksheetId) {
      useToastStore.getState().error('Lütfen bir etkinlik seçin.');
      return;
    }
    
    const isoDueDate = dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : undefined;

    const success = await createAssignment({
      studentIds: [studentId],
      worksheetId: selectedWorksheetId,
      dueDate: isoDueDate,
      teacherNotes: notes
    }, user?.id || 'system');
    
    if (success) {
      onClose();
      setSelectedWorksheetId('');
      setDueDate('');
      setNotes('');
      setWorksheetSearch('');
    }
  };

  const activityTypeIcon = (type: string) => {
    const map: Record<string, string> = {
      'worksheet': 'fa-file-lines',
      'exam': 'fa-clipboard-check',
      'quiz': 'fa-question-circle',
      'activity': 'fa-puzzle-piece',
      'reading': 'fa-book-open',
      'math': 'fa-calculator',
    };
    return map[type?.toLowerCase()] || 'fa-file';
  };

  return (
        <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border-color)] flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <i className="fa-solid fa-paper-plane text-white text-[10px]"></i>
                </div>
                <div>
                  <h3 className="font-black text-xs text-[var(--text-primary)] uppercase tracking-tight">Yeni Atama Yap</h3>
                  <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Arşivinizden içerik seçin</p>
                </div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all">
                <i className="fa-solid fa-times text-[10px]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto">
              
              {/* Worksheet Selection with Search */}
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">
                  Etkinlik / İçerik Seçimi <span className="text-rose-500">*</span>
                </label>
                {worksheetsData.loading ? (
                    <div className="p-6 flex flex-col items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin text-xl text-[var(--accent-color)]"></i>
                      <span className="text-[9px] font-bold text-[var(--text-muted)]">İçerikleriniz Yükleniyor...</span>
                    </div>
                ) : (
                  <>
                    {/* Search Bar */}
                    <div className="relative mb-2">
                      <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[8px]"></i>
                      <input
                        type="text"
                        placeholder="İçerik adı veya tür ile ara..."
                        value={worksheetSearch}
                        onChange={e => setWorksheetSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 text-[var(--text-primary)] font-medium transition-all"
                      />
                      {worksheetSearch && (
                        <button onClick={() => setWorksheetSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                          <i className="fa-solid fa-times-circle text-[9px]"></i>
                        </button>
                      )}
                    </div>

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        {filteredWorksheets.length} içerik bulundu
                      </span>
                      {worksheetSearch && (
                        <button onClick={() => setWorksheetSearch('')} className="text-[7px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest">
                          Filtreyi Temizle
                        </button>
                      )}
                    </div>

                    {/* Worksheet List */}
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                        {filteredWorksheets.map(w => (
                            <div key={w.id} 
                                onClick={() => setSelectedWorksheetId(w.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all group/card ${selectedWorksheetId === w.id ? 'border-indigo-500 bg-indigo-500/5 shadow-sm shadow-indigo-500/10' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-indigo-500/30 hover:bg-[var(--bg-paper)]'}`}>
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${selectedWorksheetId === w.id ? 'bg-indigo-500/20 text-indigo-600' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] group-hover/card:text-indigo-500'} transition-all`}>
                                      <i className={`fa-solid ${activityTypeIcon(w.activityType)} text-[9px]`}></i>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h4 className="font-bold text-[10px] text-[var(--text-primary)] leading-tight truncate">{w.name || "İsimsiz İçerik"}</h4>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-paper)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{w.activityType || 'Genel'}</span>
                                        <span className="text-[7px] text-[var(--text-muted)] font-bold">{new Date(w.createdAt).toLocaleDateString('tr-TR')}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedWorksheetId === w.id ? 'border-indigo-500 bg-indigo-500' : 'border-[var(--border-color)]'}`}>
                                    {selectedWorksheetId === w.id && <i className="fa-solid fa-check text-white text-[7px]"></i>}
                                  </div>
                                </div>
                            </div>
                        ))}
                        {filteredWorksheets.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <i className="fa-solid fa-folder-open text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] text-center">
                                  {worksheetSearch ? 'Aramanızla eşleşen içerik bulunamadı.' : 'Kataloğunuzda kayıtlı etkinlik bulunmuyor.'}
                                </p>
                                {worksheetSearch && (
                                  <button onClick={() => setWorksheetSearch('')} className="mt-2 text-[8px] font-bold text-indigo-500 hover:text-indigo-600">
                                    Aramayı Temizle
                                  </button>
                                )}
                            </div>
                        )}
                    </div>
                  </>
                )}
              </div>

              {/* Due Date */}
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

              {/* Teacher Notes */}
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
            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2 shrink-0">
              <button disabled={isLoading} onClick={onClose} className="px-4 py-2 text-[var(--text-muted)] font-bold text-[9px] rounded-lg hover:bg-[var(--bg-secondary)] transition-all uppercase tracking-widest">İptal</button>
              <button disabled={isLoading || !selectedWorksheetId} onClick={handleAssign} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white font-black text-[9px] rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest border border-white/10">
                {isLoading ? <><i className="fa-solid fa-spinner fa-spin text-[10px]"></i> Atanıyor...</> : <><i className="fa-solid fa-paper-plane text-[10px]"></i> Ata</>}
              </button>
            </div>
          </div>
        </div>
  );
};
