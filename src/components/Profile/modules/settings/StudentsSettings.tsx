import React, { useState, useEffect } from 'react';
import { useStudentStore } from '../../../../store/useStudentStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useToastStore } from '../../../../store/useToastStore';
import { Student } from '../../../../types/student';
import { SimplifiedStudentForm } from '../../../Student/SimplifiedStudentForm';
import { BaseSettingsProps } from '../../types';
import { logError } from '../../../../utils/logger';
import { toAppError } from '../../../../utils/AppError';

export const StudentsSettings: React.FC<BaseSettingsProps> = ({ data }) => {
  const { students, isLoading, fetchStudents, addStudent, updateStudent, deleteStudent } = useStudentStore();
  const { user } = useAuthStore();
  const { success, error } = useToastStore();
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
      logError(toAppError(err), { context: 'Öğrenci kaydedilirken hata (Settings)' });
      error('Öğrenci kaydedilirken bir hata oluştu!');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setIsDeleting(studentId);
      await deleteStudent(studentId);
      success('Öğrenci başarıyla silindi!');
    } catch (err) {
      logError(toAppError(err), { context: 'Öğrenci silinirken hata (Settings)' });
      error('Öğrenci silinirken bir hata oluştu!');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
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
      {isLoading ? (
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
              className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)' }}
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
              <div className="flex items-center gap-2">
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

      {/* Öğrenci Ekle/Düzenle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl">
            <SimplifiedStudentForm
              initialData={editingStudent ?? undefined}
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
