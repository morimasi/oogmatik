import React, { useState } from 'react';
import { SavedAssessment } from '../../../types';
import { RadarChart } from '../../RadarChart';
import { LineChart } from '../../LineChart';

interface AnalyticsModuleProps {
  studentId: string;
  assessments: SavedAssessment[];
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({
  studentId,
  assessments,
}: AnalyticsModuleProps) => {
  const allAssessments = assessments;
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const scoreKeys = Array.from(new Set(allAssessments.flatMap((a: SavedAssessment) => Object.keys(a.report.scores))));

  // Chart: ascending (oldest→newest, left→right)
  const trendData = [...allAssessments]
    .sort((a: SavedAssessment, b: SavedAssessment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((a: SavedAssessment) => {
      const dataPoint: any = {
        date: new Date(a.createdAt).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      };
      (scoreKeys as string[]).forEach((key: string) => {
        dataPoint[key] = (a.report.scores as Record<string, number>)[key] || 0;
      });
      return dataPoint;
    });

  // List & improvement: descending (newest first)
  const sortedDesc = [...allAssessments]
    .sort((a: SavedAssessment, b: SavedAssessment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const latestAssessment = sortedDesc[0];  // NEWEST
  const firstAssessment = sortedDesc[sortedDesc.length - 1];  // OLDEST

  const getImprovement = (key: keyof typeof latestAssessment.report.scores) => {
    if (!firstAssessment) return 0;
    return (latestAssessment.report.scores[key] || 0) - (firstAssessment.report.scores[key] || 0);
  };

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const data = allAssessments.map((a: SavedAssessment) => ({
      id: a.id,
      date: a.createdAt,
      scores: a.report.scores,
      summary: a.report.overallSummary,
      strengths: a.report.analysis.strengths,
      weaknesses: a.report.analysis.weaknesses,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = 'analiz_raporlari.json';
    el.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Analiz Raporu - ${studentId} - ${allAssessments.length} değerlendirme`);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-[var(--text-primary)] uppercase">Analiz</h3>
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {allAssessments.length} değerlendirme raporu
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={handleDownload} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
          <button onClick={handleShare} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Paylaş">
            <i className="fa-solid fa-share-nodes text-[9px]"></i>
          </button>
        </div>
      </div>

      {/* Improvement Summary */}
      {latestAssessment && firstAssessment && latestAssessment.id !== firstAssessment.id && (
        <div className="bg-gradient-to-br from-[var(--accent-color)]/10 to-emerald-500/10 border border-[var(--accent-color)]/20 rounded-xl p-4">
          <h4 className="font-bold text-xs text-[var(--accent-color)] uppercase tracking-tight mb-3 flex items-center gap-2">
            <i className="fa-solid fa-arrow-trend-up text-xs"></i>
            Gelişim Özeti
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(latestAssessment.report.scores).map((key: string) => {
              const improvement = getImprovement(key as keyof typeof latestAssessment.report.scores);
              return (
                <div key={key} className="text-center">
                  <span className="text-[9px] font-medium text-[var(--text-muted)] uppercase">{key === 'phonological' ? 'Fonolojik' : key === 'spatial' ? 'Görsel' : key === 'attention' ? 'Dikkat' : key === 'memory' ? 'Bellek' : key === 'logic' ? 'Mantık' : key === 'visualSearch' ? 'G. Arama' : key}</span>
                  <p className={`text-lg font-bold leading-none mt-1 ${improvement > 0 ? 'text-emerald-500' : improvement < 0 ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}>
                    {improvement > 0 ? '+' : ''}{improvement}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-4">
        <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-tight mb-3 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-[var(--accent-color)] text-xs"></i>
          Gelişim Trendi
        </h4>
        {trendData.length > 1 ? (
          <div className="h-48">
            <LineChart
              data={trendData}
              lines={[
                { key: 'attention', color: '#818cf8', label: 'Dikkat' },
                { key: 'spatial', color: '#fbbf24', label: 'Görsel Algı' },
                { key: 'phonological', color: '#34d399', label: 'Fonolojik' },
                { key: 'memory', color: '#f472b6', label: 'Bellek' },
                { key: 'logic', color: '#a78bfa', label: 'Mantık' },
                { key: 'reading', color: '#60a5fa', label: 'Okuma' },
              ].filter(l => scoreKeys.includes(l.key))}
            />
          </div>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)] text-center py-8">Trend için en az 2 değerlendirme gerekli.</p>
        )}
      </div>

      {/* Assessment History */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-tight">Değerlendirme Geçmişi</h4>
        {sortedDesc.map((a: SavedAssessment, i: number) => (
          <div
            key={a.id}
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 cursor-pointer group"
            onClick={() => { setSelectedAssessment(a); setShowDetail(true); }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold">{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase">
                      {new Date(a.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2">{a.report.overallSummary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {a.report.chartData.slice(0, 4).map((d: any, j: number) => (
                      <span key={j} className="text-[9px] font-medium text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                        {d.label}: {d.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-[var(--text-muted)] text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedAssessment && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-2xl border border-[var(--border-color)] max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase">Değerlendirme Detayı</h3>
                <p className="text-[9px] text-[var(--text-muted)]">{new Date(selectedAssessment.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[11px]"></i>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{selectedAssessment.report.overallSummary}</p>

              {/* Radar Chart */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <h4 className="font-bold text-[11px] text-[var(--text-primary)] uppercase mb-3">Beceri Matrisi</h4>
                <div className="h-56">
                  <RadarChart data={selectedAssessment.report.chartData} />
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <h4 className="font-bold text-[10px] text-emerald-500 uppercase mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-check-circle text-[10px]"></i> Güçlü Yönler
                  </h4>
                  <ul className="space-y-1">
                    {selectedAssessment.report.analysis.strengths.map((s: string, i: number) => (
                      <li key={i} className="text-[10px] text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1 shrink-0"></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <h4 className="font-bold text-[10px] text-amber-500 uppercase mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-triangle-exclamation text-[10px]"></i> Destek Alanları
                  </h4>
                  <ul className="space-y-1">
                    {selectedAssessment.report.analysis.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="text-[10px] text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="w-1 h-1 bg-amber-500 rounded-full mt-1 shrink-0"></span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Roadmap */}
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <h4 className="font-bold text-[10px] text-[var(--text-primary)] uppercase mb-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-route text-[var(--accent-color)] text-[10px]"></i> Önerilen Yol Haritası
                </h4>
                <div className="space-y-2">
                  {selectedAssessment.report.roadmap.map((r: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-[var(--bg-paper)] rounded-lg">
                      <i className="fa-solid fa-bullseye text-[var(--accent-color)] text-[10px] mt-0.5"></i>
                      <div>
                        <p className="text-[10px] font-medium text-[var(--text-primary)]">{r.activityId}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{r.reason} — {r.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-medium uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-print text-[10px]"></i> Yazdır
              </button>
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(selectedAssessment, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const el = document.createElement('a');
                el.href = url;
                el.download = `rapor_${selectedAssessment.id}.json`;
                el.click();
                URL.revokeObjectURL(url);
              }} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[10px] font-medium uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-download text-[10px]"></i> İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
