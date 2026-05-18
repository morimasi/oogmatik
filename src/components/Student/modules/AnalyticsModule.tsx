import React, { useState } from 'react';
import { SavedAssessment } from '../../../types';
import { generateMockAssessments } from './studentDashboardData';
import { RadarChart } from '../../RadarChart';
import { LineChart } from '../../LineChart';

interface AnalyticsModuleProps {
  studentId: string;
  assessments: SavedAssessment[];
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({
  studentId,
  assessments,
}) => {
  const allAssessments = assessments.length > 0 ? assessments : generateMockAssessments(studentId);
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const trendData = allAssessments
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(a => ({
      date: new Date(a.createdAt).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
      attention: a.report.scores.attention || 0,
      spatial: a.report.scores.spatial || 0,
      phonological: a.report.scores.phonological || 0,
    }));

  const latestAssessment = allAssessments[0];
  const firstAssessment = allAssessments[allAssessments.length - 1];

  const getImprovement = (key: keyof typeof latestAssessment.report.scores) => {
    if (!firstAssessment) return 0;
    return (latestAssessment.report.scores[key] || 0) - (firstAssessment.report.scores[key] || 0);
  };

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const data = allAssessments.map(a => ({
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
          <h3 className="font-black text-xs tracking-tighter text-[var(--text-primary)] uppercase">Analiz</h3>
          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
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
          <h4 className="font-black text-[10px] text-[var(--accent-color)] uppercase tracking-tight mb-3 flex items-center gap-2">
            <i className="fa-solid fa-arrow-trend-up text-[10px]"></i>
            Gelişim Özeti
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(latestAssessment.report.scores).map(key => {
              const improvement = getImprovement(key as keyof typeof latestAssessment.report.scores);
              return (
                <div key={key} className="text-center">
                  <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">{key === 'phonological' ? 'Fonolojik' : key === 'spatial' ? 'Görsel' : key === 'attention' ? 'Dikkat' : key === 'memory' ? 'Bellek' : key === 'logic' ? 'Mantık' : key === 'visualSearch' ? 'G. Arama' : key}</span>
                  <p className={`text-lg font-black leading-none mt-1 ${improvement > 0 ? 'text-emerald-500' : improvement < 0 ? 'text-rose-500' : 'text-[var(--text-muted)]'}`}>
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
        <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight mb-3 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-[var(--accent-color)] text-[10px]"></i>
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
              ]}
              compact
            />
          </div>
        ) : (
          <p className="text-[9px] text-[var(--text-muted)] text-center py-8">Trend için en az 2 değerlendirme gerekli.</p>
        )}
      </div>

      {/* Assessment History */}
      <div className="space-y-2">
        <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight">Değerlendirme Geçmişi</h4>
        {allAssessments.map((a, i) => (
          <div
            key={a.id}
            className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30 cursor-pointer group"
            onClick={() => { setSelectedAssessment(a); setShowDetail(true); }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-8 h-8 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black">{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase">
                      {new Date(a.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                  <p className="text-[8px] text-[var(--text-muted)] mt-1 line-clamp-2">{a.report.overallSummary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {a.report.chartData.slice(0, 4).map((d, j) => (
                      <span key={j} className="text-[7px] font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded">
                        {d.label}: {d.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <i className="fa-solid fa-chevron-right text-[var(--text-muted)] text-[8px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
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
                <h3 className="font-black text-xs text-[var(--text-primary)] uppercase">Değerlendirme Detayı</h3>
                <p className="text-[7px] text-[var(--text-muted)]">{new Date(selectedAssessment.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[9px]"></i>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed">{selectedAssessment.report.overallSummary}</p>

              {/* Radar Chart */}
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4">
                <h4 className="font-black text-[9px] text-[var(--text-primary)] uppercase mb-3">Beceri Matrisi</h4>
                <div className="h-56">
                  <RadarChart data={selectedAssessment.report.chartData} />
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                  <h4 className="font-black text-[8px] text-emerald-500 uppercase mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-check-circle text-[8px]"></i> Güçlü Yönler
                  </h4>
                  <ul className="space-y-1">
                    {selectedAssessment.report.analysis.strengths.map((s, i) => (
                      <li key={i} className="text-[8px] text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1 shrink-0"></span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                  <h4 className="font-black text-[8px] text-amber-500 uppercase mb-2 flex items-center gap-1.5">
                    <i className="fa-solid fa-triangle-exclamation text-[8px]"></i> Destek Alanları
                  </h4>
                  <ul className="space-y-1">
                    {selectedAssessment.report.analysis.weaknesses.map((w, i) => (
                      <li key={i} className="text-[8px] text-[var(--text-secondary)] flex items-start gap-1.5">
                        <span className="w-1 h-1 bg-amber-500 rounded-full mt-1 shrink-0"></span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Roadmap */}
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <h4 className="font-black text-[8px] text-[var(--text-primary)] uppercase mb-2 flex items-center gap-1.5">
                  <i className="fa-solid fa-route text-[var(--accent-color)] text-[8px]"></i> Önerilen Yol Haritası
                </h4>
                <div className="space-y-2">
                  {selectedAssessment.report.roadmap.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-[var(--bg-paper)] rounded-lg">
                      <i className="fa-solid fa-bullseye text-[var(--accent-color)] text-[8px] mt-0.5"></i>
                      <div>
                        <p className="text-[8px] font-bold text-[var(--text-primary)]">{r.activityId}</p>
                        <p className="text-[7px] text-[var(--text-muted)]">{r.reason} — {r.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[8px] font-bold uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-print text-[8px]"></i> Yazdır
              </button>
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(selectedAssessment, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const el = document.createElement('a');
                el.href = url;
                el.download = `rapor_${selectedAssessment.id}.json`;
                el.click();
                URL.revokeObjectURL(url);
              }} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[8px] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-download text-[8px]"></i> İndir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
