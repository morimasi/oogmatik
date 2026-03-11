import React, { useState } from 'react';
import { Student } from '../../../types';

interface StudentSelectionGridProps {
    students: Student[];
    onSelect: (student: Student) => void;
    onBack: () => void;
}

export const StudentSelectionGrid: React.FC<StudentSelectionGridProps> = ({ students, onSelect, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8 flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Öğrencilerim</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Yönetmek istediğiniz öğrenciyi seçin.</p>
                </div>
                <button 
                    onClick={onBack}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors shadow-sm"
                >
                    <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl mb-12 relative">
                <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                <input 
                    type="text" 
                    placeholder="Öğrenci adı veya sınıfı ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white dark:bg-zinc-900 border-none shadow-xl shadow-zinc-200/50 dark:shadow-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
                />
            </div>

            {/* Grid */}
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredStudents.map((student) => (
                    <div 
                        key={student.id}
                        onClick={() => onSelect(student)}
                        className="group bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                        <div className="relative mb-6">
                            <img 
                                src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                                alt={student.name}
                                className="w-24 h-24 rounded-3xl object-cover mx-auto border-4 border-zinc-50 dark:border-zinc-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/30 transition-colors"
                            />
                            <div className="absolute -bottom-2 right-1/2 translate-x-12 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xs border-4 border-white dark:border-zinc-900">
                                <i className="fa-solid fa-check"></i>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-zinc-900 dark:text-white text-center group-hover:text-indigo-600 transition-colors">
                            {student.name}
                        </h3>
                        <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest text-center mt-1">
                            {student.grade || 'Öğrenci'}
                        </p>

                        <div className="mt-8 flex justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <i className="fa-solid fa-chart-pie"></i>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <i className="fa-solid fa-hands-holding-child"></i>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                <i className="fa-solid fa-wallet"></i>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Placeholder */}
                <div className="bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[2.5rem] p-8 border-4 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer transition-all">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mb-4 shadow-sm">
                        <i className="fa-solid fa-plus text-2xl"></i>
                    </div>
                    <span className="font-bold uppercase tracking-widest text-xs">Yeni Öğrenci</span>
                </div>
            </div>

            {filteredStudents.length === 0 && (
                <div className="mt-20 text-center">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                        <i className="fa-solid fa-user-slash text-3xl"></i>
                    </div>
                    <h3 className="text-zinc-500 font-bold text-xl">Öğrenci Bulunamadı</h3>
                    <p className="text-zinc-400 mt-2">Farklı bir arama terimi deneyin.</p>
                </div>
            )}
        </div>
    );
};
