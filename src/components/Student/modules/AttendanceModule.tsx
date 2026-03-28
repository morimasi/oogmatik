import React, { useState } from 'react';
import { AdvancedStudent, _AttendanceRecord } from '../../../types/student-advanced';

interface AttendanceModuleProps {
    student: AdvancedStudent;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({ student }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Helper to get days in month
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        // 0 = Sunday, 1 = Monday, ...
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust for Monday start
    };

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const getStatusForDay = (day: number) => {
        // Mock logic - in real app, find record for this date
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = student.attendance?.records?.find(r => r.date === dateStr);
        return record?.status || 'none';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Calendar Section */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
                        >
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date())}
                            className="px-4 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-bold text-xs"
                        >
                            Bugün
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 transition-colors"
                        >
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-4">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                        <div key={day} className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2 flex-1">
                    {blanks.map(i => <div key={`blank-${i}`} className="aspect-square"></div>)}
                    {days.map(day => {
                        const status = getStatusForDay(day);
                        let bgClass = "bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800";
                        let textClass = "text-zinc-700 dark:text-zinc-300";
                        let icon = null;

                        if (status === 'present') {
                            bgClass = "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800";
                            textClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                            icon = <i className="fa-solid fa-check text-[10px]"></i>;
                        } else if (status === 'absent') {
                            bgClass = "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800";
                            textClass = "text-rose-700 dark:text-rose-400 font-bold";
                            icon = <i className="fa-solid fa-xmark text-[10px]"></i>;
                        } else if (status === 'late') {
                            bgClass = "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
                            textClass = "text-amber-700 dark:text-amber-400 font-bold";
                            icon = <i className="fa-solid fa-clock text-[10px]"></i>;
                        } else if (status === 'excused') {
                            bgClass = "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
                            textClass = "text-blue-700 dark:text-blue-400 font-bold";
                            icon = <i className="fa-solid fa-file-medical text-[10px]"></i>;
                        }

                        return (
                            <div 
                                key={day} 
                                className={`aspect-square rounded-xl border border-transparent flex flex-col items-center justify-center cursor-pointer transition-all relative group
                                    ${bgClass} ${textClass}`}
                            >
                                <span className="text-sm">{day}</span>
                                {icon && <div className="mt-1">{icon}</div>}
                                
                                {/* Tooltip Mockup */}
                                {status !== 'none' && (
                                    <div className="absolute bottom-full mb-2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {status === 'present' ? 'Geldi' : status === 'absent' ? 'Gelmedi' : status === 'late' ? 'Geç Kaldı' : 'İzinli'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-6">İstatistikler</h3>
                    
                    <div className="flex items-center justify-center relative w-48 h-48 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-100 dark:text-zinc-800" />
                            <circle 
                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                strokeDasharray={2 * Math.PI * 88} 
                                strokeDashoffset={2 * Math.PI * 88 * (1 - (student.attendance?.stats?.attendanceRate || 0) / 100)} 
                                className="text-emerald-500 transition-all duration-1000 ease-out" 
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-zinc-900 dark:text-white">
                                %{student.attendance?.stats?.attendanceRate || 0}
                            </span>
                            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Katılım</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Geldiği Gün</span>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white">{student.attendance?.stats?.present || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Devamsızlık</span>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white">{student.attendance?.stats?.absent || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Geç Kalma</span>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white">{student.attendance?.stats?.late || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">İzinli</span>
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-white">{student.attendance?.stats?.excused || 0}</span>
                        </div>
                    </div>
                </div>

                <button className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">
                    <i className="fa-solid fa-qrcode"></i>
                    QR ile Yoklama Al
                </button>
            </div>
        </div>
    );
};
