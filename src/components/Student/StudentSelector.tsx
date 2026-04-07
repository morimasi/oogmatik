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

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSaveStudent = async (studentData: Partial<Student>) => {
        try {
            if (!user) return;
            await addStudent(user.id, {
                ...studentData,
                avatar: studentData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.name}-${Math.random()}`,
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
            <SimplifiedStudentForm
                onSave={handleSaveStudent}
                onCancel={() => setShowAddForm(false)}
            />
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-zinc-50 dark:bg-black p-8 font-['Lexend']">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Öğrenci Seçimi</h1>
                        <p className="text-zinc-500">İşlem yapmak istediğiniz öğrenciyi seçin veya yeni kayıt oluşturun.</p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Yeni Öğrenci
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg"></i>
                    <input
                        type="text"
                        placeholder="İsim veya numara ile ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl text-lg outline-none focus:border-indigo-500 transition-colors shadow-sm"
                    />
                </div>

                {/* Student Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredStudents.map(student => (
                        <button
                            key={student.id}
                            onClick={() => setActiveStudent(student)}
                            className="group relative bg-white dark:bg-zinc-900 p-6 rounded-3xl border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-xl hover:-translate-y-1 text-left flex flex-col items-center"
                        >
                            <div className="relative mb-4">
                                <img
                                    src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                                    alt={student.name}
                                    className="w-24 h-24 rounded-full border-4 border-zinc-50 dark:border-zinc-800 shadow-md group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    <i className="fa-solid fa-chevron-right text-zinc-400 group-hover:text-indigo-500 transition-colors"></i>
                                </div>
                            </div>

                            <h3 className="font-black text-lg text-zinc-900 dark:text-white mb-1 text-center line-clamp-1 w-full">{student.name}</h3>
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                                {student.grade || 'Öğrenci'}
                            </span>

                            <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl text-center">
                                    <span className="block text-xs text-zinc-400 font-medium mb-0.5">Tanı</span>
                                    <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                                        {student.diagnosis?.[0] || '-'}
                                    </span>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl text-center">
                                    <span className="block text-xs text-zinc-400 font-medium mb-0.5">Yaş</span>
                                    <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        {student.age || '-'}
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}

                    <button
                        onClick={() => setShowAddForm(true)}
                        className="group flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all min-h-[280px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-plus text-2xl text-zinc-400 group-hover:text-zinc-600"></i>
                        </div>
                        <span className="font-bold text-zinc-400 group-hover:text-zinc-600">Yeni Öğrenci Ekle</span>
                    </button>
                </div>

                {filteredStudents.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fa-solid fa-users-slash text-4xl text-zinc-300"></i>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-400">Öğrenci bulunamadı.</h3>
                        <p className="text-zinc-500 mt-2">Arama kriterlerinizi değiştirin veya yeni bir öğrenci ekleyin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
