import React, { useState, useEffect } from 'react';
import { ProfileData } from '../../../types/profile';
import { Student, SavedWorksheet } from '../../../types';
import { BentoCard } from '../components/shared/BentoCard';
import { StatCard } from '../components/shared/StatCard';
import { useStudentStore } from '../../../store/useStudentStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { SimplifiedStudentForm } from '../../Student/SimplifiedStudentForm';
import { StudentDashboard } from '../../Student/StudentDashboard';
import { AdvancedStudentManager } from '../../Student/AdvancedStudentManager';
import { logError } from '../../../utils/logger';
import { toAppError } from '../../../utils/AppError';

interface StudentsModuleProps {
  data: ProfileData;
  activeStudent: Student | null;
  onBack?: () => void;
  onLoadMaterial?: (ws: SavedWorksheet) => void;
  setActiveStudent?: (student: Student | null) => void;
}

type StudentView = 'grid' | 'manager' | 'dashboard';

export const StudentsModule: React.FC<StudentsModuleProps> = ({
  data,
  activeStudent,
  onBack,
  onLoadMaterial,
  setActiveStudent,
}) => {
  const { stats, loading } = data;
  const [viewMode, setViewMode] = useState<StudentView>('grid');
  const { students, isLoading: studentsLoading, fetchStudents, addStudent, updateStudent, deleteStudent, setActiveStudent: setActiveStudentInStore } = useStudentStore();
  const { user } = useAuthStore();
  const { success, error } = useToastStore();
  
  // Yeni özellikler için state
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const isAdmin = user.role === 'superadmin' || user.role === 'admin';
      const unsubscribe = fetchStudents(user.id, isAdmin);
      return () => unsubscribe();
    }
  }, [user?.id, fetchStudents, user?.role]);

  const filteredStudents = students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.diagnosis.some((d: string) => d.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (user?.id) {
        if (editingStudent) {
          await updateStudent(editingStudent.id, studentData);
          success('Öğrenci başarıyla güncellendi!');
        } else {
          await addStudent(user.id, studentData);
          success('Öğrenci başarıyla eklendi!');
        }
        setIsModalOpen(false);
        setEditingStudent(null);
      }
    } catch (err) {
      logError(toAppError(err), { context: 'Öğrenci kaydedilirken hata' });
      error('Öğrenci kaydedilirken bir hata oluştu!');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setIsDeleting(studentId);
      await deleteStudent(studentId);
      success('Öğrenci başarıyla silindi!');
      if (activeStudent?.id === studentId) {
        setActiveStudentInStore(null);
        setActiveStudent?.(null);
      }
    } catch (err) {
      logError(toAppError(err), { context: 'Öğrenci silinirken hata' });
      error('Öğrenci silinirken bir hata oluştu!');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleBack = () => {
    if (viewMode !== 'grid') {
      setViewMode('grid');
    } else {
      onBack?.();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[var(--bg-secondary)] rounded-3xl" />)}
        </div>
        <div className="h-80 bg-[var(--bg-secondary)] rounded-3xl" />
      </div>
    );
  }

  // Advanced Manager veya Dashboard aktifken tam ekran göster
  if (viewMode === 'manager') {
    return (
      <div className="h-full animate-in fade-in duration-300">
        <AdvancedStudentManager onBack={handleBack} onLoadMaterial={onLoadMaterial} />
      </div>
    );
  }

  if (viewMode === 'dashboard' && activeStudent) {
    return (
      <div className="h-full animate-in fade-in duration-300">
        <StudentDashboard onBack={handleBack} onLoadMaterial={onLoadMaterial} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={stats.totalStudents} label="Toplam Öğrenci" icon="fa-user-graduate" color="text-indigo-600" />
        <StatCard value={stats.monthlyNewStudents} label="Bu Ay Yeni" icon="fa-user-plus" color="text-emerald-500" />
        <StatCard value={stats.totalAssessments} label="Değerlendirme" icon="fa-clipboard-check" color="text-amber-500" />
        <StatCard value={`%${stats.avgScore}`} label="Ort. Başarı" icon="fa-chart-simple" color="text-purple-600" />
      </div>

      {/* Yeni: Öğrenci Yönetim Alanı */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>Öğrencilerim</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Öğrencilerinizi yönetin ve takip edin</p>
          </div>
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
          >
            <i className="fa-solid fa-plus mr-1.5" /> Yeni Öğrenci
          </button>
        </div>

        {/* Arama */}
        <div className="relative">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Öğrenci ara (isim, sınıf, tanı)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 outline-none transition-colors"
            style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Öğrenci Listesi */}
        {studentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-indigo-500" />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Öğrenciler yükleniyor…</span>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <i className="fa-solid fa-user-group text-6xl mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <h3 className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>Henüz öğrenci eklemediniz</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Yeni bir öğrenci eklemek için yukarıdaki butona tıklayın</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredStudents.map((student: Student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer"
                style={{ backgroundColor: activeStudent?.id === student.id ? 'var(--accent-muted)' : 'var(--surface-elevated)', borderColor: activeStudent?.id === student.id ? 'var(--accent-color)' : 'var(--border-color)' }}
                onClick={() => {
                  setActiveStudentInStore(student);
                  setActiveStudent?.(student);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                    {student.name[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{student.name}</h4>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{student.grade}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {student.diagnosis.slice(0, 3).map((d: string) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
                          style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}
                        >
                          {d}
                        </span>
                      ))}
                      {student.diagnosis.length > 3 && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          +{student.diagnosis.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setEditingStudent(student);
                      setIsModalOpen(true);
                    }}
                    className="p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-secondary)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <i className="fa-solid fa-pen-to-square" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    disabled={isDeleting === student.id}
                    className="p-2.5 rounded-xl transition-colors hover:bg-red-100 dark:hover:bg-red-900/20 disabled:opacity-50"
                    style={{ color: isDeleting === student.id ? 'var(--text-muted)' : '#ef4444' }}
                  >
                    <i className={`fa-solid ${isDeleting === student.id ? 'fa-circle-notch fa-spin' : 'fa-trash'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hızlı Erişim Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gelişmiş Yönetim Kartı */}
        <BentoCard
          title="Gelişmiş Öğrenci Yönetimi"
          icon="fa-users-gear"
          iconColor="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
          action={
            <button
              onClick={() => setViewMode('manager')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <i className="fa-solid fa-arrow-right mr-1.5" /> Paneli Aç
            </button>
          }
        >
          <p className="text-sm font-bold text-[var(--text-muted)] leading-relaxed">
            BEP planları, akademik takip, finansal süreçler, yoklama ve AI analiz modüllerine tek ekrandan erişim.
          </p>
          <div className="flex mt-4 gap-2">
            {['fa-hands-holding-child', 'fa-graduation-cap', 'fa-wallet', 'fa-calendar-days', 'fa-wand-magic-sparkles'].map((icon, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-zinc-400 text-xs">
                <i className={`fa-solid ${icon}`} />
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Aktif Öğrenci Kartı */}
        <BentoCard
          title="Aktif Öğrenci"
          icon="fa-star"
          iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500"
          action={
            activeStudent ? (
              <button
                onClick={() => setViewMode('dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fa-solid fa-chart-line mr-1.5" /> Dashboard
              </button>
            ) : null
          }
        >
          {activeStudent ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
                {activeStudent.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h4 className="text-sm font-black text-[var(--text-primary)]">{activeStudent.name}</h4>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{activeStudent.grade}</p>
                {activeStudent.diagnosis?.[0] && (
                  <span className="mt-1 inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[8px] font-black uppercase tracking-wider">
                    {activeStudent.diagnosis[0]}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-[var(--text-muted)]">
              <i className="fa-solid fa-user-plus text-3xl mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Öğrenci seçilmedi</p>
              <p className="text-[9px] font-medium mt-2">Listeden bir öğrenci seçin</p>
            </div>
          )}
        </BentoCard>
      </div>

      {/* Öğrenci Ekle/Düzenle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl">
            <SimplifiedStudentForm
              initialData={editingStudent || undefined}
              onSave={handleSaveStudent}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingStudent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};