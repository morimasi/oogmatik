import React, { useState } from 'react';
import { useStudentStore } from '../../store/useStudentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SimplifiedStudentForm } from './SimplifiedStudentForm';
import type { Student } from '../../types/student';

export const StudentSelector = () => {
  const { user } = useAuthStore();
  const { students, _activeStudent, setActiveStudent, addStudent } = useStudentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    try {
      if (!user) return;
      await addStudent(user.id, {
        ...studentData,
        avatar:
          studentData.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.name}-${Math.random()}`,
        interests: studentData.interests || [],
        strengths: studentData.strengths || [],
        weaknesses: studentData.weaknesses || [],
        diagnosis: studentData.diagnosis || [],
        learningStyle: studentData.learningStyle || 'Karma',
      } as Student);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  if (showAddForm) {
    return (
      <SimplifiedStudentForm onSave={handleSaveStudent} onCancel={() => setShowAddForm(false)} />
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6 font-lexend" style={{ backgroundColor: 'var(--bg-default)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase" style={{ color: 'var(--text-primary)' }}>
              ÖĞRENCİ SEÇİMİ
            </h1>
            <p className="text-[10px] mt-1.5 font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Sistemdeki öğrencilerinizi yönetin
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-md flex items-center gap-2 hover:opacity-90 text-white"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            YENİ EKLE
          </button>
        </div>

        {/* Search (Compact) */}
        <div className="relative mb-6">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}></i>
          <input
            type="text"
            placeholder="Öğrenci adı ile filtrele..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all shadow-sm"
            style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Student Grid (Compact) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setActiveStudent(student)}
              className="group relative p-4 rounded-2xl border transition-all hover:shadow-lg text-left flex flex-col items-center hover:border-[var(--accent-color)]"
              style={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}
            >
              <div className="relative mb-3">
                <img
                  src={
                    student.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`
                  }
                  alt={student.name}
                  className="w-16 h-16 rounded-xl border-2 shadow-sm group-hover:scale-110 transition-transform duration-300"
                  style={{ borderColor: 'var(--bg-default)' }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 text-white rounded-md flex items-center justify-center shadow-md border-2" style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--bg-paper)' }}>
                  <i className="fa-solid fa-chevron-right text-[8px]"></i>
                </div>
              </div>

              <h3 className="font-bold text-xs mb-0.5 text-center line-clamp-1 w-full" style={{ color: 'var(--text-primary)' }}>
                {student.name}
              </h3>
              <span className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                {student.grade || 'Öğrenci'}
              </span>

              <div className="w-full flex gap-1 mt-auto">
                <div className="flex-1 py-1 rounded-md text-center" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                  <span className="block text-[8px] font-black truncate px-1" style={{ color: 'var(--text-secondary)' }}>
                    {(student.diagnosis as string[])?.[0] || 'Genel'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
