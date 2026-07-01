import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { activityApprovalService } from '../../services/activityApprovalService';
import type { ActivityDraft } from '../../types/admin';
import type { ApprovalStatus } from '../../types/ocr-activity';
import { filterDraftsBySource, type ApprovalSourceFilter } from '../../services/activityStudioApprovalFilter';
import { useToastStore } from '../../store/useToastStore';
import { logError } from '../../utils/logger';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_review: { label: 'Bekliyor', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  approved: { label: 'Onaylı', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  rejected: { label: 'Red', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  draft: { label: 'Taslak', color: 'text-zinc-500', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' },
};

const SOURCE_FILTERS: { id: ApprovalSourceFilter; label: string }[] = [
  { id: 'all', label: 'Tüm Kaynaklar' },
  { id: 'activity-studio', label: 'Activity Studio' },
  { id: 'other', label: 'Diğer' },
];

export const AdminActivityApproval: React.FC = () => {
  const toast = useToastStore();
  const [drafts, setDrafts] = useState<ActivityDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<ActivityDraft | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('pending_review');
  const [sourceFilter, setSourceFilter] = useState<ApprovalSourceFilter>('all');
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam = filter === 'all' ? undefined : { status: filter as ApprovalStatus };
      const result = await activityApprovalService.getPendingReviews(filterParam);
      setDrafts(result);
    } catch (err) {
      logError(err instanceof Error ? err : String(err));
      toast.error('Taslaklar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => { loadDrafts(); }, [loadDrafts]);

  const filteredDrafts = useMemo(() => filterDraftsBySource(drafts, sourceFilter), [drafts, sourceFilter]);

  const handleApprove = async (draftId: string) => {
    try {
      await activityApprovalService.approve(draftId, 'admin-user');
      await loadDrafts();
      setSelectedDraft(null);
      toast.success('İçerik onaylandı');
    } catch (err) {
      toast.error('Onaylama başarısız');
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => activityApprovalService.approve(id, 'admin-user')));
      await loadDrafts();
      setSelectedIds([]);
      setIsSelectionMode(false);
      toast.success(`${selectedIds.length} içerik topluca onaylandı`);
    } catch {
      toast.error('Toplu onaylama başarısız');
    }
  };

  const handleReject = async (draftId: string) => {
    if (!rejectReason.trim()) return;
    try {
      await activityApprovalService.reject(draftId, 'admin-user', rejectReason);
      setRejectReason('');
      setShowRejectForm(false);
      await loadDrafts();
      setSelectedDraft(null);
      toast.success('İçerik reddedildi');
    } catch (err) {
      toast.error('Reddetme başarısız');
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.length === 0) return;
    const reason = 'Toplu red — yönetici tarafından';
    try {
      await Promise.all(selectedIds.map(id => activityApprovalService.reject(id, 'admin-user', reason)));
      await loadDrafts();
      setSelectedIds([]);
      setIsSelectionMode(false);
      toast.success(`${selectedIds.length} içerik topluca reddedildi`);
    } catch {
      toast.error('Toplu reddetme başarısız');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full space-y-6 font-lexend overflow-hidden">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/40 dark:bg-black/20 p-4 rounded-3xl border border-zinc-200 dark:border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {(['all', 'pending_review', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setSelectedDraft(null); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-indigo-500'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'pending_review' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Red'}
              </button>
            ))}
          </div>
          <div className="w-px h-8 bg-zinc-200 dark:bg-white/5 mx-2 hidden md:block"></div>
          <div className="flex gap-2">
            {SOURCE_FILTERS.map((sf) => (
              <button
                key={sf.id}
                onClick={() => setSourceFilter(sf.id)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  sourceFilter === sf.id
                    ? 'bg-teal-600 text-white'
                    : 'text-zinc-500 bg-white/30 dark:bg-black/20 border border-zinc-200 dark:border-white/5'
                }`}
              >
                {sf.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setIsSelectionMode(!isSelectionMode); if (isSelectionMode) setSelectedIds([]); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              isSelectionMode ? 'bg-amber-500 text-white' : 'bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {isSelectionMode ? 'Seçim Kapat' : 'Toplu İşlem'}
          </button>
          <button onClick={loadDrafts} className="p-2 bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 transition-colors">
            <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Toplam', value: filteredDrafts.length, icon: 'fa-file', color: 'from-blue-500 to-blue-700' },
          { label: 'Bekleyen', value: filteredDrafts.filter(d => d.status === 'pending_review').length, icon: 'fa-clock', color: 'from-amber-500 to-amber-700' },
          { label: 'Onaylı', value: filteredDrafts.filter(d => d.status === 'approved').length, icon: 'fa-check-circle', color: 'from-emerald-500 to-emerald-700' },
          { label: 'Red', value: filteredDrafts.filter(d => d.status === 'rejected').length, icon: 'fa-xmark-circle', color: 'from-red-500 to-red-700' },
        ].map((s, i) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}
            className="p-4 rounded-[1.5rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl flex items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110`}>
              <i className={`fa-solid ${s.icon}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</p>
              <h4 className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">{s.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.length > 0 && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20"
          >
            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest whitespace-nowrap">
              {selectedIds.length} seçili
            </span>
            <div className="w-px h-6 bg-indigo-500/20"></div>
            <button onClick={handleBatchApprove} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
              Toplu Onayla
            </button>
            <button onClick={handleBatchReject} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
              Toplu Reddet
            </button>
            <button onClick={() => { setSelectedIds([]); setIsSelectionMode(false); }} className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Draft List */}
        <div className={`${selectedDraft ? 'w-[400px]' : 'flex-1'} shrink-0 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-4 overflow-y-auto custom-scrollbar transition-all duration-300`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-indigo-500"></i>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <i className="fa-solid fa-inbox text-4xl mb-4 opacity-20"></i>
              <p className="text-[10px] font-black uppercase tracking-widest">
                {filter === 'pending_review' ? 'Onay bekleyen içerik yok' : 'Sonuç bulunamadı'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDrafts.map((draft) => {
                const sc = STATUS_CONFIG[draft.status || 'draft'];
                return (
                  <div
                    key={draft.id}
                    onClick={() => isSelectionMode ? toggleSelect(draft.id) : setSelectedDraft(draft)}
                    className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isSelectionMode && selectedIds.includes(draft.id)
                        ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20'
                        : selectedDraft?.id === draft.id
                          ? 'border-indigo-500/50 bg-indigo-500/5'
                          : 'border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 bg-white/50 dark:bg-black/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate">
                          {draft.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                          {draft.baseType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelectionMode && (
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedIds.includes(draft.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-400 dark:border-zinc-600'
                          }`}>
                            {selectedIds.includes(draft.id) && <i className="fa-solid fa-check text-[8px]"></i>}
                          </div>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${sc.bg} ${sc.color} ${sc.border} border`}>
                          {sc.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[9px] text-zinc-500 font-mono">{draft.metadata?.subject || '-'}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                      <span className="text-[9px] text-zinc-500 font-mono">{draft.metadata?.gradeLevel || '-'}. sınıf</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                      <span className="text-[9px] text-zinc-500 font-mono">{draft.metadata?.difficulty || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[8px] text-zinc-600 font-mono">{new Date(draft.createdAt).toLocaleString('tr-TR')}</span>
                      {draft.version && <span className="text-[8px] text-zinc-600 font-mono">{draft.version}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedDraft && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-8 overflow-y-auto custom-scrollbar"
            >
              <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6">
                {selectedDraft.title}
              </h3>

              {/* Metadata Cards */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Konu', value: selectedDraft.metadata?.subject || '-', icon: 'fa-book' },
                  { label: 'Sınıf', value: `${selectedDraft.metadata?.gradeLevel || '-'}. Sınıf`, icon: 'fa-graduation-cap' },
                  { label: 'Zorluk', value: selectedDraft.metadata?.difficulty || '-', icon: 'fa-signal' },
                  { label: 'Süre', value: `${selectedDraft.metadata?.estimatedDuration || '-'} dk`, icon: 'fa-clock' },
                ].map((card, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 text-center">
                    <i className={`fa-solid ${card.icon} text-lg text-indigo-500 mb-2 block`}></i>
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{card.label}</p>
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 mt-0.5">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Target Skills */}
              {selectedDraft.metadata?.targetSkills && selectedDraft.metadata.targetSkills.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Hedef Beceriler</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDraft.metadata.targetSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedDraft.status === 'rejected' && selectedDraft.rejectionReason && (
                <div className="p-4 mb-6 rounded-xl bg-red-500/5 border-l-4 border-red-500">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Red Gerekcesi</p>
                  <p className="text-sm text-red-300">{selectedDraft.rejectionReason}</p>
                </div>
              )}

              {/* Approval Timeline */}
              <div className="mb-6 p-4 rounded-xl bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Surec</p>
                <div className="space-y-2">
                  {[
                    { label: 'Olusturulma', time: selectedDraft.createdAt, icon: 'fa-plus-circle' },
                    ...(selectedDraft.status === 'approved' && selectedDraft.approvedAt
                      ? [{ label: 'Onaylanma', time: selectedDraft.approvedAt, icon: 'fa-check-circle' }]
                      : []),
                    ...(selectedDraft.status === 'rejected' && selectedDraft.approvedAt
                      ? [{ label: 'Reddedilme', time: selectedDraft.approvedAt, icon: 'fa-xmark-circle' }]
                      : []),
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <i className={`fa-solid ${event.icon} text-xs`}></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400">{event.label}</p>
                        <p className="text-[11px] font-mono text-zinc-500">{new Date(event.time).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selectedDraft.status === 'pending_review' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(selectedDraft.id)}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-check-circle mr-2"></i> Onayla
                  </button>
                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    className="flex-1 py-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95"
                  >
                    <i className="fa-solid fa-xmark-circle mr-2"></i> Reddet
                  </button>
                </div>
              )}

              {showRejectForm && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Red gerekcesi yazin (zorunlu)..."
                    rows={3}
                    className="w-full p-3 bg-black/30 border border-red-500/20 rounded-xl text-sm text-zinc-300 outline-none resize-none focus:border-red-500/50 transition-all mb-3"
                  />
                  <button
                    onClick={() => handleReject(selectedDraft.id)}
                    disabled={!rejectReason.trim()}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-red-700"
                  >
                    Red Gerekcesiyle Reddet
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};