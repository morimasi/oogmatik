import React, { useState, useMemo, useCallback } from 'react';
import { ProfileData } from '../../../types/profile';
import { SavedAssessment } from '../../../types';
import { StatCard } from '../components/shared/StatCard';
import { ToggleSwitch } from '../components/shared/ToggleSwitch';
import { logError } from '../../../utils/errorHandler';
import { assessmentService } from '../../../services/assessmentService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { printService } from '../../../utils/printService';
import { useFirestoreNotes } from '../hooks/useFirestoreNotes';

interface ReportsModuleProps {
  data: ProfileData;
  onShare?: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ data, onShare }) => {
  const { assessments: rawAssessments, worksheets, loading, refreshData } = data;
  const assessments = rawAssessments as unknown as SavedAssessment[];
  const { user } = useAuthStore();
  const { success, error, info } = useToastStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anonymize, setAnonymize] = useState(true);
  const [exporting, setExporting] = useState(false);
  // Rapor notları artık Firestore'da senkronize
  const { notes: reportNotesArr } = useFirestoreNotes('reports');
  // key→value yapısı için: "assessmentId::not metni" formatı
  const reportNotes: Record<string, string> = Object.fromEntries(
    reportNotesArr
      .filter(n => n.includes('::'))
      .map(n => { const [id, ...rest] = n.split('::'); return [id, rest.join('::')]; })
  );
  const { addNote: fsAddReportNote, deleteNote: fsDeleteReportNote } = useFirestoreNotes('reports');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveNote = useCallback((assessmentId: string) => {
    if (!noteText.trim()) return;
    // Mevcut notu güncelle: önce eski kaydı sil, yenisini ekle
    const existingIdx = reportNotesArr.findIndex(n => n.startsWith(`${assessmentId}::`));
    if (existingIdx >= 0) fsDeleteReportNote(existingIdx);
    fsAddReportNote(`${assessmentId}::${noteText.trim()}`);
    setExpandedNote(null);
    setNoteText('');
    success('Rapor notu kaydedildi.');
  }, [noteText, success, reportNotesArr, fsAddReportNote, fsDeleteReportNote]);

  const deleteNote = useCallback((assessmentId: string) => {
    const idx = reportNotesArr.findIndex(n => n.startsWith(`${assessmentId}::`));
    if (idx >= 0) fsDeleteReportNote(idx);
    success('Rapor notu silindi.');
  }, [reportNotesArr, fsDeleteReportNote, success]);

  const handleDelete = useCallback(async (assessmentId: string) => {
    if (!user) return;
    setDeletingId(assessmentId);
    try {
      await assessmentService.deleteAssessment(assessmentId, user.id);
      success('Değerlendirme silindi.');
      refreshData();
    } catch (e) {
      logError(e instanceof Error ? e : new Error(String(e)), { context: 'ReportsModule.delete' });
      error('Silme başarısız.');
    } finally {
      setDeletingId(null);
    }
  }, [user, success, error, refreshData]);

  const toggle = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds(prev =>
      prev.size === assessments.length ? new Set() : new Set(assessments.map((a) => a.id))
    );

  const avgScore = useMemo(() => {
    if (!assessments.length) return 0;
    return Math.round(
      assessments.reduce((sum: number, a: SavedAssessment) => {
        const scores = a.report.scores as Record<string, number>;
        return sum + (scores['attention'] ?? 0);
      }, 0) / assessments.length
    );
  }, [assessments]);

  const uniqueStudentCount = useMemo(() =>
    new Set(assessments.map((a) => a.studentName)).size,
    [assessments]
  );

  const handleBulkExport = async () => {
    if (selectedIds.size === 0) return;
    setExporting(true);
    info(`${selectedIds.size} adet rapor PDF olarak indiriliyor...`);
    try {
      const selectedAssessments = assessments.filter(a => selectedIds.has(a.id));
      for (const assessment of selectedAssessments) {
        const displayName = anonymize ? 'Anonim_Ogrenci' : (assessment.studentName || 'Ogrenci').replace(/\s+/g, '_');
        const fileName = `bdmind_Rapor_${displayName}_${new Date(assessment.createdAt).toISOString().slice(0, 10)}`;
        
        // Geçici DOM elemanı oluşturup yazdırma motoruna gönder
        const container = document.createElement('div');
        container.id = `temp-report-export-${assessment.id}`;
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.innerHTML = `
          <div style="padding: 30px; font-family: sans-serif; background: #fff; color: #111; width: 210mm;">
            <h1 style="font-size: 20px; font-weight: 900; margin-bottom: 5px;">bdmind Değerlendirme Raporu</h1>
            <p style="font-size: 12px; color: #666; margin-bottom: 20px;">Öğrenci: ${anonymize ? 'Anonim Öğrenci' : assessment.studentName} · Tarih: ${new Date(assessment.createdAt).toLocaleDateString('tr-TR')}</p>
            <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 10px;">Özet Değerlendirme</h3>
              <p style="font-size: 12px; line-height: 1.6;">${assessment.report.overallSummary || 'Tarama detayları başarıyla kaydedildi.'}</p>
            </div>
            <h3 style="font-size: 14px; font-weight: 800; margin-bottom: 10px;">Skorlar</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left;">
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Alan</th>
                  <th style="padding: 8px; border: 1px solid #cbd5e1;">Skor</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(assessment.report.scores || {}).map(([key, val]) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${key.toUpperCase()}</td>
                    <td style="padding: 8px; border: 1px solid #cbd5e1;">%${val}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
        document.body.appendChild(container);
        
        await printService.generatePdf(`#${container.id}`, fileName, { action: 'download' });
        document.body.removeChild(container);
      }
      success(`${selectedIds.size} adet rapor başarıyla indirildi.`);
    } catch (e) {
      logError(e instanceof Error ? e : new Error(String(e)), { context: 'ReportsModule.bulkExport' });
      error('PDF indirme sırasında bir hata oluştu.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-3xl" />)}
        </div>
        <div className="h-80 bg-[var(--bg-secondary)] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={assessments.length} label="Değerlendirme" icon="fa-clipboard-check" color="text-indigo-600" />
        <StatCard value={worksheets.length} label="Materyal" icon="fa-file-lines" color="text-emerald-500" />
        <StatCard value={`%${avgScore}`} label="Ort. Dikkat Skoru" icon="fa-chart-simple" color="text-amber-500" />
        <StatCard value={uniqueStudentCount} label="Farklı Öğrenci" icon="fa-users" color="text-purple-600" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === assessments.length && assessments.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 accent-indigo-600"
            />
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tümünü Seç</span>
          </label>
          <div className="flex items-center gap-2">
            <ToggleSwitch enabled={anonymize} onChange={setAnonymize} size="sm" color="bg-amber-500" />
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">KVKK Anonimleştirme</span>
          </div>
        </div>
        {onShare && (
          <button onClick={onShare} className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--border-color)]">
            <i className="fa-solid fa-share-nodes" /> Paylaş
          </button>
        )}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkExport}
            disabled={exporting}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {exporting
              ? <i className="fa-solid fa-circle-notch fa-spin" />
              : <i className="fa-solid fa-download" />}
            <span>PDF İndir ({selectedIds.size})</span>
          </button>
        )}
      </div>

      {/* Reports */}
      <div className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg">
        {assessments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-[var(--text-muted)]">
            <i className="fa-solid fa-file-medical text-5xl mb-4 opacity-20" />
            <p className="text-sm font-black text-[var(--text-primary)] mb-1">Henüz rapor yok</p>
            <p className="text-[10px] font-bold uppercase tracking-widest">Değerlendirme yaptıkça raporlar burada görünür.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {assessments.map((assessment: SavedAssessment) => {
              const scores = assessment.report.scores as Record<string, number>;
              const isSelected = selectedIds.has(assessment.id);
              return (
                <div
                  key={assessment.id}
                  onClick={() => toggle(assessment.id)}
                  className={`p-5 flex items-center gap-5 cursor-pointer transition-all group ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'hover:bg-[var(--bg-secondary)]'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(assessment.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 accent-indigo-600 flex-shrink-0"
                  />

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm ${isSelected ? 'bg-indigo-600' : 'bg-gradient-to-br from-zinc-400 to-zinc-600'
                    }`}>
                    {assessment.studentName?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] truncate">
                      {anonymize ? 'Anonim Öğrenci' : (assessment.studentName || 'Bilinmiyor')}
                    </p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {new Date(assessment.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    {reportNotes[assessment.id] && (
                      <p className="text-[9px] font-medium text-[var(--text-muted)] mt-1 italic truncate max-w-[200px]">
                        <i className="fa-solid fa-note-sticky text-[8px] mr-1 text-amber-500" />
                        {reportNotes[assessment.id]}
                      </p>
                    )}
                  </div>

                  {/* Scores */}
                  <div className="hidden md:flex items-center gap-4">
                    {(['attention', 'memory', 'visual'] as const).map(k => (
                      <div key={k} className="text-center">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{k === 'attention' ? 'Dkt' : k === 'memory' ? 'Blk' : 'Grs'}</p>
                        <p className={`text-xs font-black ${(scores[k] ?? 0) >= 70 ? 'text-emerald-500' : (scores[k] ?? 0) >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {scores[k] ?? 0}%
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedNote(assessment.id); setNoteText(reportNotes[assessment.id] || ''); }}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110 ${reportNotes[assessment.id] ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:bg-indigo-600 group-hover:text-white'}`}
                      title="Not Ekle"
                    >
                      <i className="fa-solid fa-note-sticky text-xs" />
                    </button>
                    <button
                      onClick={async (e) => { e.stopPropagation(); await handleDelete(assessment.id); }}
                      disabled={deletingId === assessment.id}
                      className="w-9 h-9 flex items-center justify-center bg-[var(--bg-secondary)] group-hover:bg-red-500 group-hover:text-white text-[var(--text-muted)] rounded-xl transition-all hover:scale-110 disabled:opacity-50"
                      title="Sil"
                    >
                      {deletingId === assessment.id ? <i className="fa-solid fa-spinner fa-spin text-xs" /> : <i className="fa-solid fa-trash text-xs" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {expandedNote && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setExpandedNote(null)}>
          <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-xs font-black text-[var(--text-primary)] mb-3 uppercase tracking-widest">Değerlendirme Notu</h4>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Bu değerlendirme için notunuz..."
              rows={3}
              className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold resize-none outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
            />
            <div className="flex gap-2 justify-end mt-3">
              <button onClick={() => { setExpandedNote(null); setNoteText(''); }} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">İptal</button>
              <button onClick={() => saveNote(expandedNote)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
