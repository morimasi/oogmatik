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
    <div className="w-full h-full overflow-y-auto bg-zinc-50 dark:bg-black p-4 md:p-6 font-lexend">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-none uppercase">
              ÖĞRENCİ SEÇİMİ
            </h1>
            <p className="text-zinc-500 text-[10px] mt-1.5 font-medium uppercase tracking-widest">
              Sistemdeki öğrencilerinizi yönetin
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-md flex items-center gap-2"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            YENİ EKLE
          </button>
        </div>

        {/* Search (Compact) */}
        <div className="relative mb-6">
          <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm"></i>
          <input
            type="text"
            placeholder="Öğrenci adı ile filtrele..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Student Grid (Compact) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setActiveStudent(student)}
              className="group relative bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-all hover:shadow-lg text-left flex flex-col items-center"
            >
              <div className="relative mb-3">
                <img
                  src={
                    student.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`
                  }
                  alt={student.name}
                  className="w-16 h-16 rounded-xl border-2 border-zinc-50 dark:border-zinc-800 shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 text-white rounded-md flex items-center justify-center shadow-md border-2 border-white dark:border-zinc-900">
                  <i className="fa-solid fa-chevron-right text-[8px]"></i>
                </div>
              </div>

              <h3 className="font-bold text-xs text-zinc-900 dark:text-white mb-0.5 text-center line-clamp-1 w-full">
                {student.name}
              </h3>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                {student.grade || 'Öğrenci'}
              </span>

              <div className="w-full flex gap-1 mt-auto">
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 py-1 rounded-md text-center">
                  <span className="block text-[8px] font-black text-zinc-700 dark:text-zinc-300 truncate px-1">
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
