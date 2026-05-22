import React, { useState, useMemo } from 'react';
import { ProfileData } from '../../../types/profile';
import { SavedAssessment } from '../../../types';
import { StatCard } from '../components/shared/StatCard';
import { ToggleSwitch } from '../components/shared/ToggleSwitch';
import { logError } from '../../../utils/errorHandler';

interface ReportsModuleProps {
  data: ProfileData;
  onShare?: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ data, onShare }) => {
  const { assessments, worksheets, loading } = data;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [anonymize, setAnonymize] = useState(true);
  const [exporting, setExporting] = useState(false);

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
    try {
      // PDF export logic placeholder — bağlanacak
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (e) {
      logError(e instanceof Error ? e : new Error(String(e)), { context: 'ReportsModule.bulkExport' });
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
                      onClick={(e) => e.stopPropagation()}
                      className="w-9 h-9 flex items-center justify-center bg-[var(--bg-secondary)] group-hover:bg-indigo-600 group-hover:text-white text-[var(--text-muted)] rounded-xl transition-all hover:scale-110"
                      title="PDF İndir"
                    >
                      <i className="fa-solid fa-download text-xs" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};