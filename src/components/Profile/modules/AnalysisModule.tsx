import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ProfileData } from '../../../types/profile';
import { SavedAssessment } from '../../../types';
import { AssessmentReportViewer } from '../../AssessmentReportViewer';
import { RadarChart } from '../../RadarChart';
import { SectionHeader } from '../components/shared/SectionHeader';
import { BentoCard } from '../components/shared/BentoCard';

interface AnalysisModuleProps {
  data: ProfileData;
  onShare?: () => void;
}

export const AnalysisModule: React.FC<AnalysisModuleProps> = ({ data, onShare }) => {
  const { assessments, loading } = data;
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [filterStudent, setFilterStudent] = useState('');
  const [analysisNotes, setAnalysisNotes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('analysis_notes') || '[]'); }
    catch { return []; }
  });
  const [newAnalysisNote, setNewAnalysisNote] = useState('');
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  useEffect(() => {
    localStorage.setItem('analysis_notes', JSON.stringify(analysisNotes));
  }, [analysisNotes]);

  const addAnalysisNote = useCallback(() => {
    if (!newAnalysisNote.trim()) return;
    setAnalysisNotes(prev => [...prev, newAnalysisNote.trim()]);
    setNewAnalysisNote('');
  }, [newAnalysisNote]);

  const deleteAnalysisNote = useCallback((idx: number) => {
    setAnalysisNotes(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const startEditAnalysisNote = useCallback((idx: number) => {
    setEditingNoteIdx(idx);
    setEditingNoteText(analysisNotes[idx]);
  }, [analysisNotes]);

  const saveEditAnalysisNote = useCallback(() => {
    if (editingNoteIdx === null || !editingNoteText.trim()) return;
    setAnalysisNotes(prev => prev.map((n, i) => i === editingNoteIdx ? editingNoteText.trim() : n));
    setEditingNoteIdx(null);
    setEditingNoteText('');
  }, [editingNoteIdx, editingNoteText]);

  const [savedViews, setSavedViews] = useState<Array<{ name: string; sortBy: SortKey; filterStudent: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('analysis_saved_views') || '[]'); }
    catch { return []; }
  });
  const [viewName, setViewName] = useState('');
  const [showSaveView, setShowSaveView] = useState(false);

  useEffect(() => {
    localStorage.setItem('analysis_saved_views', JSON.stringify(savedViews));
  }, [savedViews]);

  const saveCurrentView = useCallback(() => {
    if (!viewName.trim()) return;
    setSavedViews(prev => [...prev, { name: viewName.trim(), sortBy, filterStudent }]);
    setViewName('');
    setShowSaveView(false);
  }, [viewName, sortBy, filterStudent]);

  const loadView = useCallback((view: { sortBy: SortKey; filterStudent: string }) => {
    setSortBy(view.sortBy);
    setFilterStudent(view.filterStudent);
  }, []);

  const deleteView = useCallback((idx: number) => {
    setSavedViews(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const filteredAssessments = useMemo(() => {
    return [...assessments]
      .filter((a) =>
        filterStudent === '' ||
        a.studentName?.toLowerCase().includes(filterStudent.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'date': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'score': return ((b.report.scores['attention'] as number) || 0) - ((a.report.scores['attention'] as number) || 0);
          case 'student': return a.studentName?.localeCompare(b.studentName || '') || 0;
          default: return 0;
        }
      });
  }, [assessments, filterStudent, sortBy]);

  const averageScores = useMemo(() => {
    if (assessments.length === 0) return null;
    const totals = assessments.reduce(
      (acc, a) => {
        const scores = a.report.scores as Record<string, number>;
        return {
          attention: acc.attention + (scores['attention'] || 0),
          memory: acc.memory + (scores['memory'] || 0),
          visual: acc.visual + (scores['visual'] || 0),
          phonological: acc.phonological + (scores['phonological'] || 0),
        };
      },
      { attention: 0, memory: 0, visual: 0, phonological: 0 }
    );
    const n = assessments.length;
    return {
      attention: Math.round(totals.attention / n),
      memory: Math.round(totals.memory / n),
      visual: Math.round(totals.visual / n),
      phonological: Math.round(totals.phonological / n),
    };
  }, [assessments]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-[var(--bg-secondary)] rounded-3xl" />
        <div className="h-80 bg-[var(--bg-secondary)] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Radar Özet */}
      {averageScores && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Radar */}
          <div className="md:col-span-5 bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] p-6 flex flex-col items-center">
            <SectionHeader title="Ortalama Performans Profili" icon="fa-chart-radar" />
            <RadarChart
              data={SCORE_KEYS.map(k => ({ label: SCORE_LABELS[k], value: averageScores[k] }))}
            />
          </div>
          {/* Skor Bar'ları */}
          <div className="md:col-span-7 bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] p-6">
            <SectionHeader title="Beceri Dağılımı" icon="fa-bars-progress" />
            <div className="space-y-4 mt-2">
              {SCORE_KEYS.map(k => (
                <div key={k}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{SCORE_LABELS[k]}</span>
                    <span className="text-[10px] font-black text-[var(--text-primary)]">%{averageScores[k]}</span>
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${SCORE_COLORS[k]} rounded-full transition-all duration-1000`}
                      style={{ width: `${averageScores[k]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[var(--border-color)] grid grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-center">
                <p className="text-lg font-black text-indigo-600">{assessments.length}</p>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Toplam Değerlendirme</p>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl text-center">
                <p className="text-lg font-black text-emerald-500">
                  %{Math.round((averageScores.attention + averageScores.memory + averageScores.visual + averageScores.phonological) / 4)}
                </p>
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Genel Ortalama</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share + Filtre */}
      <div className="flex items-center gap-3 flex-wrap">
        {onShare && (
          <button onClick={onShare} className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all">
            <i className="fa-solid fa-share-nodes" /> Paylaş
          </button>
        )}
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
          <input
            type="text"
            placeholder="Öğrenci adı ile filtrele..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 font-bold text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="px-5 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[var(--accent-color)]/10 font-bold text-sm"
        >
          <option value="date">↓ Tarihe göre</option>
          <option value="score">↓ Skora göre</option>
          <option value="student">↓ Öğrenciye göre</option>
        </select>
        {showSaveView ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="Görünüm adı..."
              className="px-3 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none w-40"
              onKeyDown={(e) => { if (e.key === 'Enter') saveCurrentView(); }}
            />
            <button onClick={saveCurrentView} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Kaydet</button>
            <button onClick={() => setShowSaveView(false)} className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">İptal</button>
          </div>
        ) : (
          <button onClick={() => setShowSaveView(true)} className="px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-[var(--border-color)]">
            <i className="fa-solid fa-floppy-disk mr-1" /> Görünümü Kaydet
          </button>
        )}
      </div>

      {/* Kaydedilmiş Görünümler */}
      {savedViews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedViews.map((view, idx) => (
            <div key={idx} className="flex items-center gap-1 px-3 py-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl group">
              <button onClick={() => loadView(view)} className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors">
                <i className="fa-solid fa-bookmark text-[8px] mr-1" />{view.name}
              </button>
              <button onClick={() => deleteView(idx)} className="w-4 h-4 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <i className="fa-solid fa-xmark text-[8px]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tablo */}
      <div className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg">
        {filteredAssessments.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-[var(--text-muted)]">
            <i className="fa-solid fa-clipboard text-4xl mb-3 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Değerlendirme bulunamadı</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--bg-secondary)]">
                {['Öğrenci', 'Tarih', 'Dikkat', 'Bellek', 'Görsel', 'Eylem'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[9px] font-black text-zinc-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredAssessments.map((assessment) => {
                const scores = assessment.report.scores as Record<string, number>;
                return (
                  <tr
                    key={assessment.id}
                    className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group"
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                          {assessment.studentName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-black text-[var(--text-primary)]">{assessment.studentName || 'Bilinmiyor'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[var(--text-muted)]">
                      {new Date(assessment.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    {(['attention', 'memory', 'visual'] as const).map(k => (
                      <td key={k} className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <div className={`h-full ${SCORE_COLORS[k]} rounded-full`} style={{ width: `${scores[k] || 0}%` }} />
                          </div>
                          <span className="text-xs font-black text-[var(--text-primary)]">{scores[k] || 0}%</span>
                        </div>
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedAssessment(assessment); }}
                        className="px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                        Görüntüle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Analiz Notları */}
      <BentoCard title="Analiz Notlarım" icon="fa-note-sticky" iconColor="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
        <div className="space-y-3">
          {analysisNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] group">
              {editingNoteIdx === idx ? (
                <div className="flex-1 space-y-2">
                  <textarea
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-bold resize-none outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingNoteIdx(null)} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">İptal</button>
                    <button onClick={saveEditAnalysisNote} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Kaydet</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] whitespace-pre-wrap">{note}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditAnalysisNote(idx)} className="w-7 h-7 rounded-lg hover:bg-[var(--bg-paper)] flex items-center justify-center text-zinc-400 hover:text-[var(--accent-color)] transition-all">
                      <i className="fa-solid fa-pen text-[10px]" />
                    </button>
                    <button onClick={() => deleteAnalysisNote(idx)} className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all">
                      <i className="fa-solid fa-trash text-[10px]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAnalysisNote}
              onChange={(e) => setNewAnalysisNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAnalysisNote(); } }}
              placeholder="Analiz notu ekle..."
              className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
            />
            <button onClick={addAnalysisNote} disabled={!newAnalysisNote.trim()} className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              <i className="fa-solid fa-plus" />
            </button>
          </div>
        </div>
      </BentoCard>

      {/* Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--bg-paper)] rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[var(--border-color)]">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Değerlendirme Raporu</h3>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{selectedAssessment.studentName}</p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AssessmentReportViewer assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};