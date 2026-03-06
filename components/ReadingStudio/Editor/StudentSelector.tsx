
import React from 'react';
import { useStudent } from '../../../context/StudentContext';
import { useReadingStudio } from '../../../context/ReadingStudioContext';

export const StudentSelector = () => {
    const { students } = useStudent();
    const { activeStudent, setActiveStudent, config, setConfig } = useReadingStudio();

    const handleSelect = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            setActiveStudent(student);
            setConfig({
                ...config,
                studentId: student.id,
                studentName: student.name,
                gradeLevel: student.grade || config.gradeLevel,
                characterName: student.name.split(' ')[0]
            });
        } else {
            setActiveStudent(null);
            setConfig({ ...config, studentId: undefined, studentName: '' });
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Öğrenci Seçimi</label>
            <div className="relative">
                <select
                    value={activeStudent?.id || ''}
                    onChange={(e) => handleSelect(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white appearance-none cursor-pointer hover:border-indigo-500/50 transition-colors focus:ring-2 focus:ring-indigo-500/20"
                >
                    <option value="">Serbest Çalışma</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <i className="fa-solid fa-chevron-down text-[10px]"></i>
                </div>
            </div>
            {activeStudent && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 animate-in fade-in duration-300">
                    <p className="text-[10px] text-indigo-400 font-bold leading-tight">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        {activeStudent.name} için kişiselleştirilmiş içerik üretilecek.
                    </p>
                </div>
            )}
        </div>
    );
};
