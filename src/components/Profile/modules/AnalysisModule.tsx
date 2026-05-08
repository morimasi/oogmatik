import React, { useState } from 'react';
import { ProfileData } from '../../types/profile';
import { SavedAssessment } from '../../types';
import { AssessmentReportViewer } from '../AssessmentReportViewer';
import { RadarChart } from '../RadarChart';

interface AnalysisModuleProps {
  data: ProfileData;
}

export const AnalysisModule: React.FC<AnalysisModuleProps> = ({ data }) => {
  const { assessments, loading } = data;
  const [selectedAssessment, setSelectedAssessment] = useState<SavedAssessment | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'student'>('date');
  const [filterStudent, setFilterStudent] = useState<string>('');

  const filteredAssessments = assessments
    .filter((a: any) =>
      filterStudent === '' ||
      a.studentName?.toLowerCase().includes(filterStudent.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'score':
          return (b.report.scores.attention || 0) - (a.report.scores.attention || 0);
        case 'student':
          return a.studentName?.localeCompare(b.studentName || '') || 0;
        default:
          return 0;
      }
    });

  const getAverageScores = () => {
    if (assessments.length === 0) return null;

    const totals = assessments.reduce(
      (acc: any, a: any) => ({
        attention: acc.attention + (a.report.scores.attention || 0),
        memory: acc.memory + (a.report.scores.memory || 0),
        visual: acc.visual + (a.report.scores.visual || 0),
        phonological: acc.phonological + (a.report.scores.phonological || 0),
      }),
      { attention: 0, memory: 0, visual: 0, phonological: 0 }
    );

    return {
      attention: Math.round(totals.attention / assessments.length),
      memory: Math.round(totals.memory / assessments.length),
      visual: Math.round(totals.visual / assessments.length),
      phonological: Math.round(totals.phonological / assessments.length),
    };
  };

  const averageScores = getAverageScores();

  if (loading) {
    return <div className="animate-pulse bg-[var(--bg-secondary)] rounded-3xl h-96"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Analiz & Değerlendirmeler</h2>
        <div className="text-sm text-[var(--text-muted)]">
          {assessments.length} değerlendirme
        </div>
      </div>

      {/* Average Scores Radar Chart */}
      {averageScores && (
        <div className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Ortalama Performans Profili
          </h3>
          <RadarChart
            data={[
              { label: 'Dikkat', value: averageScores.attention },
              { label: 'Bellek', value: averageScores.memory },
              { label: 'Görsel', value: averageScores.visual },
              { label: 'Fonolojik', value: averageScores.phonological },
            ]}
            size={300}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Öğrenci adına göre filtrele..."
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="w-full px-4 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          <option value="date">Tarihe göre</option>
          <option value="score">Skora göre</option>
          <option value="student">Öğrenciye göre</option>
        </select>
      </div>

      {/* Assessment Table */}
      <div className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-secondary)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Öğrenci
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Dikkat
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Bellek
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Görsel
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredAssessments.map((assessment: any) => (
                <tr
                  key={assessment.id}
                  className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      {assessment.studentName || 'Bilinmiyor'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--text-muted)]">
                      {new Date(assessment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--text-primary)] font-medium">
                      {assessment.report.scores.attention || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--text-primary)] font-medium">
                      {assessment.report.scores.memory || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[var(--text-primary)] font-medium">
                      {assessment.report.scores.visual || 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssessment(assessment);
                      }}
                      className="text-[var(--accent-color)] hover:text-[var(--accent-hover)] font-medium"
                    >
                      Görüntüle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Detail Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-paper)] rounded-3xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Değerlendirme Detayı
              </h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center hover:bg-[var(--bg-hover)]"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AssessmentReportViewer assessment={selectedAssessment} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};