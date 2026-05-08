import React, { useState } from 'react';
import { ProfileData } from '../../../types/profile';
import { Student } from '../../../types';

interface StudentsModuleProps {
  data: ProfileData;
  activeStudent: Student | null;
}

// Lazy load components to break circular dependencies
const StudentDashboard = React.lazy(() => import('../../Student/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const AdvancedStudentManager = React.lazy(() => import('../../Student/AdvancedStudentManager').then(m => ({ default: m.AdvancedStudentManager })));

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  data,
  activeStudent,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Öğrenci Yönetimi</h2>
        <div className="flex bg-[var(--bg-secondary)] rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-[var(--accent-color)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="fa-solid fa-grid-2"></i>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-white text-[var(--accent-color)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="fa-solid fa-list"></i>
          </button>
        </div>
      </div>

      {/* Advanced Student Manager */}
      <div className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] p-6">
        <React.Suspense fallback={<div>Yükleniyor...</div>}>
          <AdvancedStudentManager />
        </React.Suspense>
      </div>

      {/* Active Student Spotlight */}
      {activeStudent && (
        <div className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Aktif Öğrenci</h3>
          <React.Suspense fallback={<div>Yükleniyor...</div>}>
            <StudentDashboard student={activeStudent} />
          </React.Suspense>
        </div>
      )}
    </div>
  );
};