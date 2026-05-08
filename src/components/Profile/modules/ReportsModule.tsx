import React, { useState } from 'react';
import { ProfileData } from '../../types/profile';
import { SavedAssessment } from '../../types';

interface ReportsModuleProps {
  data: ProfileData;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({ data }) => {
  const { assessments, worksheets, loading } = data;
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [anonymizeData, setAnonymizeData] = useState(true);

  const handleSelectReport = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const handleBulkExport = () => {
    // TODO: Implement PDF export
    console.log('Exporting reports:', selectedReports);
  };

  if (loading) {
    return <div className="animate-pulse bg-[var(--bg-secondary)] rounded-3xl h-96"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Raporlar</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={anonymizeData}
              onChange={(e) => setAnonymizeData(e.target.checked)}
              className="rounded border-[var(--border-color)]"
            />
            KVKK Anonimleştirme
          </label>
          {selectedReports.length > 0 && (
            <button
              onClick={handleBulkExport}
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors"
            >
              <i className="fa-solid fa-download mr-2"></i>
              Toplu İndir ({selectedReports.length})
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-4">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{assessments.length}</div>
          <div className="text-sm text-[var(--text-muted)]">Değerlendirme</div>
        </div>
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-4">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{worksheets.length}</div>
          <div className="text-sm text-[var(--text-muted)]">Materyal</div>
        </div>
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-4">
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {assessments.length > 0
              ? Math.round(assessments.reduce((sum: number, a: any) =>
                  sum + (a.report.scores.attention || 0), 0) / assessments.length)
              : 0}%
          </div>
          <div className="text-sm text-[var(--text-muted)]">Ortalama Skor</div>
        </div>
        <div className="bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)] p-4">
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {new Set(assessments.map((a: any) => a.studentName)).size}
          </div>
          <div className="text-sm text-[var(--text-muted)]">Farklı Öğrenci</div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Değerlendirme Raporları</h3>
        </div>

        <div className="divide-y divide-[var(--border-color)]">
          {assessments.map((assessment: any) => (
            <div
              key={assessment.id}
              className="p-6 hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(assessment.id)}
                    onChange={() => handleSelectReport(assessment.id)}
                    className="rounded border-[var(--border-color)]"
                  />
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)]">
                      {anonymizeData ? 'Öğrenci' : (assessment.studentName || 'Bilinmiyor')}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {new Date(assessment.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-[var(--text-primary)]">
                      Dikkat: {assessment.report.scores.attention || 0}%
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Bellek: {assessment.report.scores.memory || 0}%
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg text-sm hover:bg-[var(--bg-hover)] transition-colors">
                      Görüntüle
                    </button>
                    <button className="px-3 py-1 bg-[var(--accent-color)] text-white rounded-lg text-sm hover:bg-[var(--accent-hover)] transition-colors">
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {assessments.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-4 mx-auto">
              <i className="fa-solid fa-file-medical text-2xl text-[var(--text-muted)]"></i>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Henüz rapor bulunmuyor
            </h3>
            <p className="text-[var(--text-muted)]">
              Öğrencileriniz için değerlendirme yaptıkça raporlar burada görünecek.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};