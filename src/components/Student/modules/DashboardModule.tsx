import React, { useState } from 'react';
import { Student } from '../../../types';
import { ActivityAssignment } from '../../../types/assignment';
import { SavedWorksheet, SavedAssessment, Curriculum } from '../../../types';
import { generateMockAssignments, generateMockWorksheets, generateMockAssessments, generateMockCurriculums, generateMockIEPGoals, generateMockGrades, generateMockBehaviorIncidents } from './studentDashboardData';

interface DashboardModuleProps {
  student: Student;
  assignments: ActivityAssignment[];
  worksheets: SavedWorksheet[];
  assessments: SavedAssessment[];
  curriculums: Curriculum[];
  onNavigateToTab?: (tab: 'overview' | 'materials' | 'assignments' | 'analytics' | 'plans' | 'notes' | 'settings') => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  student,
  assignments,
  worksheets,
  assessments,
  curriculums,
  onNavigateToTab,
}) => {
  const allAssignments = assignments;
  const allWorksheets = worksheets;
  const allAssessments = assessments;
  const allCurriculums = curriculums;

  const completedAssignments = allAssignments.filter(a => a.status === 'completed').length;
  const inProgressAssignments = allAssignments.filter(a => a.status === 'in_progress').length;
  const pendingAssignments = allAssignments.filter(a => a.status === 'pending').length;
  const avgScore = allAssignments.filter(a => a.score).reduce((acc, a) => acc + (a.score || 0), 0) / (allAssignments.filter(a => a.score).length || 1);

  const latestAssessment = allAssessments[0];
  const activePlan = allCurriculums[0];
  const planProgress = activePlan
    ? Math.round((activePlan.schedule.filter(d => d.isCompleted).length / activePlan.schedule.length) * 100)
    : 0;

  const [showShareModal, setShowShareModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = {
      student,
      summary: {
        totalAssignments: allAssignments.length,
        completed: completedAssignments,
        inProgress: inProgressAssignments,
        pending: pendingAssignments,
        avgScore: Math.round(avgScore),
        totalMaterials: allWorksheets.length,
        totalAssessments: allAssessments.length,
        planProgress,
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name}_dashboard_ozet.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs tracking-tighter text-[var(--text-primary)] uppercase">Genel Bakış</h3>
          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {student.name} — {student.grade}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={handleDownload} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
          <button onClick={() => setShowShareModal(true)} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] transition-all" title="Paylaş">
            <i className="fa-solid fa-share-nodes text-[9px]"></i>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tamamlanan', value: completedAssignments, icon: 'fa-check-circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Devam Eden', value: inProgressAssignments, icon: 'fa-spinner', color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Bekleyen', value: pendingAssignments, icon: 'fa-clock', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Ort. Skor', value: `${Math.round(avgScore)}`, icon: 'fa-chart-line', color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-3 transition-all hover:border-[var(--accent-color)]/30">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                <i className={`fa-solid ${stat.icon} text-[9px]`}></i>
              </div>
              <span className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-lg font-black text-[var(--text-primary)] leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Performance */}
        <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-4">
          <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight mb-3 flex items-center gap-2">
            <i className="fa-solid fa-brain text-[var(--accent-color)] text-[10px]"></i>
            Son Değerlendirme
          </h4>
          {latestAssessment ? (
            <div className="space-y-2.5">
              <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed">{latestAssessment.report.overallSummary.slice(0, 120)}...</p>
              <div className="grid grid-cols-3 gap-2">
                {latestAssessment.report.chartData.slice(0, 6).map((d, i) => (
                  <div key={i} className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--bg-secondary)]" />
                        <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={100} strokeDashoffset={100 - d.value} strokeLinecap="round" className="text-[var(--accent-color)]" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-[var(--text-primary)]">{d.value}</span>
                    </div>
                    <span className="text-[6px] font-bold text-[var(--text-muted)] uppercase">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[9px] text-[var(--text-muted)]">Değerlendirme verisi yok.</p>
          )}
        </div>

        {/* Active Plan Progress */}
        <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-4">
          <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight mb-3 flex items-center gap-2">
            <i className="fa-solid fa-map-location-dot text-[var(--accent-color)] text-[10px]"></i>
            Aktif Plan
          </h4>
          {activePlan ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-[var(--text-secondary)]">{new Date(activePlan.startDate).toLocaleDateString('tr-TR')} Dönemi</span>
                <span className="text-[8px] font-black text-[var(--accent-color)] bg-[var(--accent-muted)] px-2 py-0.5 rounded-full">%{planProgress}</span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-full rounded-full transition-all" style={{ width: `${planProgress}%` }}></div>
              </div>
              <div className="space-y-1.5">
                {activePlan.goals.slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <i className={`fa-solid ${i < activePlan.schedule.filter(d => d.isCompleted).length ? 'fa-check text-emerald-500' : 'fa-circle text-[var(--text-muted)]'} text-[7px] mt-0.5`}></i>
                    <span className="text-[8px] text-[var(--text-secondary)]">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[9px] text-[var(--text-muted)]">Aktif plan yok.</p>
          )}
        </div>
      </div>

      {/* Recent Materials */}
      <div 
        className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-4 cursor-pointer hover:border-[var(--accent-color)]/30 transition-all"
        onClick={() => onNavigateToTab?.('materials')}
      >
        <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight mb-3 flex items-center gap-2">
          <i className="fa-solid fa-scroll text-[var(--accent-color)] text-[10px]"></i>
          Son Materyaller
          <i className="fa-solid fa-chevron-right text-[var(--text-muted)] text-[8px] ml-auto"></i>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {allWorksheets.slice(0, 6).map(ws => (
            <div key={ws.id} className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]/50 hover:border-[var(--accent-color)]/30 transition-all">
              <div className="w-7 h-7 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-lg flex items-center justify-center shrink-0">
                <i className={`fa-solid ${ws.icon} text-[9px]`}></i>
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-[var(--text-primary)] uppercase truncate">{ws.name}</p>
                <p className="text-[7px] text-[var(--text-muted)]">{new Date(ws.createdAt).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div 
        className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl p-4 cursor-pointer hover:border-[var(--accent-color)]/30 transition-all"
        onClick={() => onNavigateToTab?.('assignments')}
      >
        <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase tracking-tight mb-3 flex items-center gap-2">
          <i className="fa-solid fa-calendar-check text-[var(--accent-color)] text-[10px]"></i>
          Yaklaşan Görevler
          <i className="fa-solid fa-chevron-right text-[var(--text-muted)] text-[8px] ml-auto"></i>
        </h4>
        <div className="space-y-2">
          {allAssignments.filter(a => a.status !== 'completed').slice(0, 4).map(a => (
            <div key={a.id} className="flex items-center justify-between p-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]/50">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === 'in_progress' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`}></div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black text-[var(--text-primary)] uppercase truncate">#{a.worksheetId.slice(0, 6)}</p>
                  {a.teacherNotes && <p className="text-[7px] text-[var(--text-muted)] truncate">{a.teacherNotes.slice(0, 50)}...</p>}
                </div>
              </div>
              {a.dueDate && (
                <span className="text-[7px] font-bold text-[var(--text-muted)] whitespace-nowrap ml-2">{new Date(a.dueDate).toLocaleDateString('tr-TR')}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-sm border border-[var(--border-color)]">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="font-black text-xs text-[var(--text-primary)] uppercase">Paylaş</h3>
              <button onClick={() => setShowShareModal(false)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[9px]"></i>
              </button>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--accent-muted)] transition-all text-left">
                <i className="fa-solid fa-envelope text-[var(--accent-color)] text-sm"></i>
                <span className="text-[9px] font-bold text-[var(--text-primary)]">E-posta ile Paylaş</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--accent-muted)] transition-all text-left">
                <i className="fa-solid fa-link text-[var(--accent-color)] text-sm"></i>
                <span className="text-[9px] font-bold text-[var(--text-primary)]">Bağlantı Kopyala</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl hover:bg-[var(--accent-muted)] transition-all text-left">
                <i className="fa-solid fa-file-pdf text-[var(--accent-color)] text-sm"></i>
                <span className="text-[9px] font-bold text-[var(--text-primary)]">PDF Olarak Paylaş</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
