import React, { useState, useMemo } from 'react';
import { ProfileData } from '../../../types/profile';
import { SavedAssessment } from '../../../types';
import { AssessmentReportViewer } from '../../AssessmentReportViewer';
import { RadarChart } from '../../RadarChart';
import { SectionHeader } from '../components/shared/SectionHeader';

interface AnalysisModuleProps {
  data: ProfileData;
}

type SortKey = 'date' | 'score' | 'student';

const SCORE_KEYS = ['attention', 'memory', 'visual', 'phonological'] as const;
const SCORE_LABELS: Record<typeof SCORE_KEYS[number], string> = {
  attention: 'Dikkat',
  memory: 'Bellek',
  visual: 'Görsel',
  phonological: 'Fonolojik',
};

const SCORE_COLORS: Record<typeof SCORE_KEYS[number], string> = {
  attention: 'bg-indigo-500',
  memory: 'bg-emerald-500',
  visual: 'bg-amber-500',
  phonological: 'bg-purple-500',
};

export const AnalysisModule: React.FC<AnalysisModuleProps> = ({ data }) => {
  const { assessments, loading } = data;
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [filterStudent, setFilterStudent] = useState('');

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
              size={220}
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

      {/* Filtre */}
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
      </div>

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