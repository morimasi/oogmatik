import React, { useState, useMemo, useCallback } from 'react';
import { SavedAssessment } from '../../../types';
import { assessmentService } from '../../../services/assessmentService';
import { printService } from '../../../utils/printService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { ShareModal } from '../../ShareModal';
import { AssessmentReportViewer } from '../../AssessmentReportViewer';
import { logError } from '../../../utils/errorHandler';
import { AppError } from '../../../utils/AppError';

type SortMode = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc' | 'student_asc';
type ArchiveFilter = 'active' | 'archived' | 'all';

interface AssessmentHistoryPanelProps {
  assessments: SavedAssessment[];
  onRefresh: () => void;
  onSelectActivity?: (id: string) => void;
  onAutoGenerateWorkbook?: (report: unknown) => void;
}

const RISK_LEVELS = {
  low: { label: 'Düşük', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200' },
  moderate: { label: 'Orta', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200' },
  high: { label: 'Yüksek', cls: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200' },
};

const getOverallRisk = (a: SavedAssessment): 'low' | 'moderate' | 'high' => {
  const scores = a.report?.scores ?? {};
  const vals = Object.values(scores) as number[];
  if (!vals.length) return 'low';
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  if (avg < 50) return 'high';
  if (avg < 70) return 'moderate';
  return 'low';
};

const avgScore = (a: SavedAssessment): number => {
  const vals = Object.values(a.report?.scores ?? {}) as number[];
  if (!vals.length) return 0;
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
};

const ScoreMiniBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-1.5" title={`${label}: %${value}`}>
    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] w-10 shrink-0 truncate">{label}</span>
    <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
    <span className="text-[8px] font-black text-[var(--text-muted)] w-5 text-right">{value}</span>
  </div>
);

export const AssessmentHistoryPanel: React.FC<AssessmentHistoryPanelProps> = ({
  assessments,
  onRefresh,
  onSelectActivity,
  onAutoGenerateWorkbook,
}) => {
  const { user } = useAuthStore();
  const { success, error: showError, info } = useToastStore();

  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('date_desc');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [anonymize, setAnonymize] = useState(false);
  const [viewingReport, setViewingReport] = useState<SavedAssessment | null>(null);
  const [shareTarget, setShareTarget] = useState<SavedAssessment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkExporting, setBulkExporting] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // --- Filtreleme + Sıralama ---
  const sorted = useMemo(() => {
    let list = assessments.filter(a => {
      // Arşiv filtresi
      if (archiveFilter === 'active' && a.isArchived) return false;
      if (archiveFilter === 'archived' && !a.isArchived) return false;

      // Metin Arama
      if (search) {
        const query = search.toLowerCase();
        return (
          a.studentName.toLowerCase().includes(query) ||
          a.grade?.toLowerCase().includes(query)
        );
      }
      return true;
    });

    switch (sortMode) {
      case 'date_asc': list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case 'date_desc': list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'score_desc': list = [...list].sort((a, b) => avgScore(b) - avgScore(a)); break;
      case 'score_asc': list = [...list].sort((a, b) => avgScore(a) - avgScore(b)); break;
      case 'student_asc': list = [...list].sort((a, b) => a.studentName.localeCompare(b.studentName, 'tr')); break;
    }
    return list;
  }, [assessments, search, sortMode, archiveFilter]);

  const displayName = useCallback((a: SavedAssessment): string =>
    anonymize ? `Öğrenci ${a.id?.slice(-4) ?? '????'}` : a.studentName,
    [anonymize]
  );

  // --- Seçim ---
  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => setSelected(prev =>
    prev.size === sorted.length ? new Set() : new Set(sorted.map(a => a.id))
  );

  // --- Tekli İndir (PDF) ---
  const handleSingleExportPdf = useCallback(async (a: SavedAssessment) => {
    setExportingId(a.id);
    try {
      const name = anonymize ? `Ogrenci-${a.id?.slice(-4)}` : a.studentName.replace(/\s+/g, '_');
      const container = document.createElement('div');
      container.id = `single-export-${a.id}`;
      container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;background:#fff;padding:32px;font-family:Lexend,sans-serif;';
      container.innerHTML = `
        <div style="border-bottom:2px solid #333;padding-bottom:12px;margin-bottom:20px">
          <h1 style="font-size:24px;font-weight:900;margin:0">Bilişsel Değerlendirme & Analiz Raporu</h1>
          <p style="font-size:12px;color:#666;margin:6px 0 0 0">
            ${anonymize ? 'Gizli Danışan' : `Öğrenci: ${a.studentName}`} · 
            Yaş: ${a.age} · Sınıf: ${a.grade} · 
            Tarih: ${new Date(a.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <h2 style="font-size:15px;font-weight:800;color:#1e1b4b;margin-bottom:8px">Uzman Analiz Özeti</h2>
        <div style="background:#f5f3ff;border-left:4px solid #6366f1;padding:12px;font-size:12px;line-height:1.6;color:#334155;margin-bottom:20px font-style:italic">
          "${a.report?.overallSummary ?? 'Değerlendirme özeti mevcut.'}"
        </div>
        <h2 style="font-size:15px;font-weight:800;color:#1e1b4b;margin-bottom:12px">Bilişsel Alan Puanları</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
          ${Object.entries(a.report?.scores ?? {}).map(([k, v]) => `
            <div style="border:1px solid #e2e8f0;padding:8px 12px;border-radius:8px;display:flex;justify-content:space-between">
              <span style="font-size:12px;font-weight:700;text-transform:capitalize">${k}</span>
              <span style="font-size:12px;font-weight:900;color:#4f46e5">%${v as number}</span>
            </div>
          `).join('')}
        </div>
      `;
      document.body.appendChild(container);
      await printService.generatePdf(`#single-export-${a.id}`, `${name}-Analiz-Raporu`, { action: 'download' });
      document.body.removeChild(container);
      success(`${a.studentName} için PDF rapor indirildi.`);
    } catch (e) {
      logError(new AppError(String(e), 'SINGLE_PDF_EXPORT_ERROR', 500), { context: 'AssessmentHistoryPanel.singleExport' });
      showError('PDF üretilirken hata oluştu.');
    } finally {
      setExportingId(null);
    }
  }, [anonymize, success, showError]);

  // --- Tekli Arşivle / Arşivden Çıkar ---
  const handleToggleArchive = useCallback(async (a: SavedAssessment) => {
    if (!user?.id) return;
    setArchivingId(a.id);
    const nextArchived = !a.isArchived;
    try {
      await assessmentService.toggleArchiveAssessment(a.id, user.id, nextArchived);
      success(nextArchived ? 'Değerlendirme arşivlendi (Öğrenci Paneli ve Arşive senkronize edildi).' : 'Değerlendirme arşivden çıkarıldı.');
      onRefresh();
    } catch (e) {
      logError(new AppError(String(e), 'ARCHIVE_ASSESSMENT_ERROR', 500), { context: 'AssessmentHistoryPanel.archive' });
      showError('Arşivleme işlemi başarısız.');
    } finally {
      setArchivingId(null);
    }
  }, [user?.id, success, showError, onRefresh]);

  // --- Tekli Sil ---
  const handleDelete = useCallback(async (id: string) => {
    if (!user?.id) return;
    setDeletingId(id);
    try {
      await assessmentService.deleteAssessment(id, user.id);
      success('Değerlendirme silindi.');
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      onRefresh();
    } catch (e) {
      logError(new AppError(String(e), 'DELETE_ASSESSMENT_ERROR', 500), { context: 'AssessmentHistoryPanel.delete' });
      showError('Silme işlemi başarısız.');
    } finally { setDeletingId(null); }
  }, [user?.id, success, showError, onRefresh]);

  // --- Toplu Sil ---
  const handleBulkDelete = useCallback(async () => {
    if (!user?.id || selected.size === 0) return;
    setBulkDeleting(true);
    let ok = 0;
    for (const id of selected) {
      try { await assessmentService.deleteAssessment(id, user.id); ok++; }
      catch { /* devam et */ }
    }
    success(`${ok} değerlendirme silindi.`);
    setSelected(new Set());
    setConfirmBulkDelete(false);
    setBulkDeleting(false);
    onRefresh();
  }, [user?.id, selected, success, onRefresh]);

  // --- Toplu PDF İndir ---
  const handleBulkExport = useCallback(async () => {
    if (selected.size === 0) { info('Önce değerlendirme seçin.'); return; }
    setBulkExporting(true);
    const targets = sorted.filter(a => selected.has(a.id));
    for (const a of targets) {
      await handleSingleExportPdf(a);
    }
    setBulkExporting(false);
    success(`${targets.length} rapor toplu PDF olarak indirildi.`);
  }, [selected, sorted, handleSingleExportPdf, success, info]);

  // --- Paylaş ---
  const handleShare = useCallback(async (receiverIds: string[]) => {
    if (!shareTarget || !user) return;
    try {
      await Promise.all(receiverIds.map(rid =>
        assessmentService.shareAssessment(shareTarget, user.id, user.name ?? 'Öğretmen', rid)
      ));
      success('Rapor başarıyla paylaşıldı ve alıcının Benimle Paylaşılanlar modülüne senkronize edildi.');
      setShareTarget(null);
    } catch (e) {
      logError(new AppError(String(e), 'SHARE_ASSESSMENT_ERROR', 500), { context: 'AssessmentHistoryPanel.share' });
      showError('Paylaşım sırasında hata oluştu.');
    }
  }, [shareTarget, user, success, showError]);

  return (
    <>
      {/* Rapor Modal */}
      {viewingReport && (
        <AssessmentReportViewer
          assessment={viewingReport}
          onClose={() => setViewingReport(null)}
          user={user}
          onSelectActivity={onSelectActivity}
          onAutoGenerateWorkbook={onAutoGenerateWorkbook as ((r: unknown) => void) | undefined}
        />
      )}
      {shareTarget && (
        <ShareModal
          isOpen
          onClose={() => setShareTarget(null)}
          onShare={handleShare}
        />
      )}

      <div className="flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden">
        {/* Panel Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[var(--border-color)] flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-indigo-600 text-xs" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)]">Değerlendirme Geçmişi</h3>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {assessments.length} Toplam Rapor
                </p>
              </div>
            </div>

            {/* KVKK anonimleştirme toggle */}
            <button
              onClick={() => setAnonymize(p => !p)}
              title={anonymize ? 'Anonimleştirme Açık' : 'Anonimleştirme Kapalı'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                anonymize
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'
              }`}
            >
              <i className={`fa-solid ${anonymize ? 'fa-user-secret' : 'fa-user'} text-[9px]`} />
              KVKK
            </button>
          </div>

          {/* Arşiv Filtre Sekmeleri */}
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setArchiveFilter('active')}
              className={`flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                archiveFilter === 'active' ? 'bg-[var(--bg-card)] text-indigo-600 shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setArchiveFilter('archived')}
              className={`flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                archiveFilter === 'archived' ? 'bg-[var(--bg-card)] text-amber-600 shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Arşivlenmiş ({assessments.filter(a => a.isArchived).length})
            </button>
            <button
              onClick={() => setArchiveFilter('all')}
              className={`flex-1 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                archiveFilter === 'all' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Tümü
            </button>
          </div>

          {/* Arama */}
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px]" />
            <input
              type="text"
              placeholder="Öğrenci veya sınıf ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-[11px] font-bold outline-none bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
            />
          </div>

          {/* Sıralama + Toplu Eylemler */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
              className="text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] outline-none cursor-pointer"
            >
              <option value="date_desc">En Yeni ↓</option>
              <option value="date_asc">En Eski ↑</option>
              <option value="score_desc">Skor ↓</option>
              <option value="score_asc">Skor ↑</option>
              <option value="student_asc">İsim A→Z</option>
            </select>

            {sorted.length > 0 && (
              <button
                onClick={toggleAll}
                className="text-[9px] font-black uppercase tracking-widest px-2 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                {selected.size === sorted.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
              </button>
            )}

            {selected.size > 0 && (
              <>
                <button
                  onClick={handleBulkExport}
                  disabled={bulkExporting}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                >
                  {bulkExporting
                    ? <i className="fa-solid fa-circle-notch fa-spin" />
                    : <i className="fa-solid fa-file-pdf" />}
                  PDF ({selected.size})
                </button>
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-200 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can" /> Sil ({selected.size})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Toplu Silme Onay Bandı */}
        {confirmBulkDelete && (
          <div className="px-5 py-3 bg-rose-50 dark:bg-rose-900/10 border-b border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 flex-shrink-0">
            <p className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
              <i className="fa-solid fa-triangle-exclamation mr-1" />
              {selected.size} değerlendirme kalıcı silinecek. Emin misiniz?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="text-[9px] font-black px-2.5 py-1 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-100 transition-colors"
              >İptal</button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {bulkDeleting ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Evet, Sil'}
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 p-3">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                <i className="fa-solid fa-clipboard-list text-3xl opacity-20" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-sm font-black text-[var(--text-primary)]">
                {search ? 'Eşleşme bulunamadı' : archiveFilter === 'archived' ? 'Arşivlenmiş değerlendirme yok' : 'Henüz değerlendirme yok'}
              </p>
              <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">
                {search ? 'Arama terimini değiştirin' : 'İlk değerlendirmeyi başlatın'}
              </p>
            </div>
          ) : (
            sorted.map(a => {
              const risk = getOverallRisk(a);
              const avg = avgScore(a);
              const isSelected = selected.has(a.id);
              const isDeleting = deletingId === a.id;
              const isArchiving = archivingId === a.id;
              const isExporting = exportingId === a.id;
              const riskCfg = RISK_LEVELS[risk];
              const scores = (a.report?.scores ?? {}) as Record<string, number>;
              const SCORE_BARS: { key: string; label: string; color: string }[] = [
                { key: 'attention', label: 'Dikkat', color: 'bg-indigo-500' },
                { key: 'reading', label: 'Okuma', color: 'bg-emerald-500' },
                { key: 'math', label: 'Matematik', color: 'bg-amber-500' },
              ];

              return (
                <div
                  key={a.id}
                  className={`relative group rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-300 dark:border-indigo-700 shadow-sm shadow-indigo-500/10'
                      : a.isArchived
                        ? 'bg-zinc-50 dark:bg-zinc-900/40 border-amber-200/60 dark:border-amber-900/30 opacity-80'
                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                  }`}
                  onClick={() => toggleSelect(a.id)}
                >
                  {/* Seçim checkbox */}
                  <div className={`absolute top-3 left-3 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                  }`}>
                    {isSelected && <i className="fa-solid fa-check text-white text-[7px]" />}
                  </div>

                  <div className="pl-8 pr-3 pt-3 pb-3">
                    {/* Başlık satırı */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-black text-[var(--text-primary)] truncate">
                            {displayName(a)}
                          </p>
                          {a.isArchived && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                              Arşivli
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5">
                          {a.grade} · {a.age} yaş ·{' '}
                          {new Date(a.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase border ${riskCfg.cls}`}>
                          {riskCfg.label}
                        </span>
                        <span className={`text-[10px] font-black ${avg > 70 ? 'text-emerald-600' : avg > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          %{avg}
                        </span>
                      </div>
                    </div>

                    {/* Skor mini barları */}
                    <div className="space-y-1 mb-3">
                      {SCORE_BARS.map(b => (
                        <ScoreMiniBar key={b.key} label={b.label} value={scores[b.key] ?? 0} color={b.color} />
                      ))}
                    </div>

                    {/* Eylem butonları — İndir, Arşivle, Paylaş, Rapor */}
                    <div
                      className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[var(--border-color)]/50"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setViewingReport(a)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 hover:bg-indigo-200 transition-colors cursor-pointer"
                        title="Raporu Detaylı İncele"
                      >
                        <i className="fa-solid fa-eye" /> Rapor
                      </button>

                      {/* İNDİR (PDF) BUTONU */}
                      <button
                        onClick={() => handleSingleExportPdf(a)}
                        disabled={isExporting}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 disabled:opacity-50 transition-colors cursor-pointer"
                        title="Raporu PDF olarak İndir"
                      >
                        {isExporting ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-file-pdf" />} İndir
                      </button>

                      {/* ARŞİVLE BUTONU */}
                      <button
                        onClick={() => handleToggleArchive(a)}
                        disabled={isArchiving}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                          a.isArchived
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-200'
                        }`}
                        title={a.isArchived ? 'Arşivden Çıkar' : 'Uygulama Arşivine ve Öğrenci Paneline Kaydet/Arşivle'}
                      >
                        {isArchiving ? <i className="fa-solid fa-circle-notch fa-spin" /> : <i className="fa-solid fa-box-archive" />}
                        {a.isArchived ? 'Arşivde' : 'Arşivle'}
                      </button>

                      {/* PAYLAŞ BUTONU */}
                      <button
                        onClick={() => setShareTarget(a)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 transition-colors cursor-pointer"
                        title="Kullanıcılar ile Paylaş"
                      >
                        <i className="fa-solid fa-share-nodes" /> Paylaş
                      </button>

                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={isDeleting}
                        className="ml-auto flex items-center gap-1 px-1.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-200 disabled:opacity-50 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        {isDeleting
                          ? <i className="fa-solid fa-circle-notch fa-spin" />
                          : <i className="fa-solid fa-trash-can" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer özet */}
        {assessments.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--border-color)] flex items-center justify-between flex-shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              {sorted.length} / {assessments.length} gösteriliyor
            </span>
            {selected.size > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">
                {selected.size} seçili
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};
