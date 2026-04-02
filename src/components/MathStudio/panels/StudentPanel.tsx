// Math Studio — Student Assignment Panel

import React from 'react';
import { Student } from '../../../types/core';

interface StudentPanelProps {
    selectedStudentId: string;
    students: Student[];
    onSelectStudent: (studentId: string) => void;
}

export const StudentPanel: React.FC<StudentPanelProps> = ({ selectedStudentId, students, onSelectStudent }) => (
    <div className="p-5 border-b border-zinc-800 bg-zinc-900/30">
        <h4 className="text-xs font-black text-accent/70 uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className="fa-solid fa-user-graduate"></i> Öğrenci Atama
        </h4>
        <div className="relative">
            <select
                value={selectedStudentId}
                onChange={(e) => onSelectStudent(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-200 focus:ring-1 focus:ring-accent/5 outline-none cursor-pointer font-bold appearance-none"
            >
                <option value="anonymous">Anonim (Atanmamış)</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[10px]"></i>
        </div>
    </div>
);
