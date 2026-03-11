import React from 'react';
import { AdvancedStudent, GradeEntry } from '../../../types/student-advanced';
import { LineChart } from '../../../components/LineChart';

interface AcademicModuleProps {
    student: AdvancedStudent;
}

export const AcademicModule: React.FC<AcademicModuleProps> = ({ student }) => {
    // Prepare data for LineChart
    const chartData = student.academic?.grades
        ?.filter(g => g.type === 'exam')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(g => ({
            date: g.date,
            score: g.score,
            classAvg: g.classAverage || 0
        })) || [];

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Genel Ortalama</span>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                            {student.academic?.metrics?.gpa || '-'}
                        </span>
                        <span className="text-zinc-400 font-bold mb-1">/ 100</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">En Başarılı Ders</span>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-trophy"></i>
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-white leading-tight">
                            {student.academic?.metrics?.strongestSubject || '-'}
                        </span>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Ödev Tamamlama</span>
                    <div className="mt-2">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-zinc-900 dark:text-white">% {student.academic?.metrics?.homeworkCompletionRate || 0}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${student.academic?.metrics?.homeworkCompletionRate || 0}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Sıralama</span>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-4xl font-black text-zinc-900 dark:text-white">
                            #3
                        </span>
                        <span className="text-zinc-400 text-xs font-bold mb-1">Sınıfında</span>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 h-80">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-zinc-900 dark:text-white">Başarı Grafiği</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                            <span className="text-xs text-zinc-500 font-bold">Öğrenci</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-zinc-300"></div>
                            <span className="text-xs text-zinc-500 font-bold">Sınıf Ort.</span>
                        </div>
                    </div>
                </div>
                <div className="h-60 w-full">
                    <LineChart 
                        data={chartData} 
                        lines={[
                            { key: 'score', color: '#6366f1', label: 'Puan' },
                            { key: 'classAvg', color: '#d4d4d8', label: 'Ortalama' }
                        ]}
                        height={240}
                    />
                </div>
            </div>

            {/* Grades List */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Not Dökümü</h3>
                    <button className="text-indigo-600 text-sm font-bold hover:underline">
                        Tümünü Gör
                    </button>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {student.academic?.grades?.map((grade) => (
                        <div key={grade.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                                    ${grade.score >= 85 ? 'bg-emerald-100 text-emerald-700' : 
                                      grade.score >= 70 ? 'bg-blue-100 text-blue-700' : 
                                      grade.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {grade.score}
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white">{grade.subject}</h4>
                                    <p className="text-xs text-zinc-500">
                                        {grade.type === 'exam' ? 'Sınav' : grade.type === 'homework' ? 'Ödev' : 'Proje'} • {new Date(grade.date).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-zinc-400 font-medium">Sınıf Ort.</p>
                                <p className="font-bold text-zinc-600 dark:text-zinc-300">{grade.classAverage || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
