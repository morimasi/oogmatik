import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { LineChart } from '../../LineChart';

interface AcademicModuleProps {
    student: AdvancedStudent;
    onUpdate?: (data: Partial<AdvancedStudent>) => void;
}

export const AcademicModule: React.FC<AcademicModuleProps> = ({ student, onUpdate }) => {
    // Akademik metriklerin hesaplanması
    const gpa = student.academic?.metrics?.gpa || 0;
    const homeworkRate = student.academic?.metrics?.homeworkCompletionRate || 0;

    const chartData = student.academic?.grades
        ?.filter(g => g.type === 'exam')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(g => ({
            date: new Date(g.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
            score: g.score,
            classAvg: g.classAverage || 70
        })) || [];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Akademik Metrikler (Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* GPA Kartı */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4">Genel Ortalama</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{gpa}</span>
                        <span className="text-sm font-bold text-zinc-400">/ 100</span>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 w-fit px-3 py-1 rounded-full">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        <span>+4.2 Puan Artış</span>
                    </div>
                </div>

                {/* Ödev Tamamlama */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4">Ödev Sadakati</span>
                    <div className="text-5xl font-black text-zinc-900 dark:text-white mb-6">%{homeworkRate}</div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: `${homeworkRate}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 mt-3">Son 12 ödev eksiksiz teslim edildi.</p>
                </div>

                {/* Güçlü Ders */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4">Liderlik Alanı</span>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-2xl flex items-center justify-center text-2xl">
                            <i className="fa-solid fa-award"></i>
                        </div>
                        <div>
                            <span className="text-xl font-black text-zinc-900 dark:text-white block leading-tight">Matematik</span>
                            <span className="text-[10px] font-bold text-zinc-500">92/100 Ort.</span>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 italic">"Mantıksal çıkarım hızı çok yüksek."</span>
                    </div>
                </div>

                {/* Sınıf Sıralaması */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-4">Global Sıralama</span>
                    <div className="text-5xl font-black text-zinc-900 dark:text-white">#4</div>
                    <span className="text-xs font-bold text-zinc-500">28 Öğrenci Arasında</span>

                    <div className="absolute bottom-0 right-0 p-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <img key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=rank${i}`} alt="avatar" />
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 flex items-center justify-center text-[8px] font-bold">+24</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Büyük Grafik ve Detay Listesi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol: Gelişim Grafiği (Bento Card Large) */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[3.5rem] p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Segmental Başarı Trendi</h3>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                                <span className="text-[10px] font-black text-zinc-400 uppercase">Öğrenci</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-zinc-200"></span>
                                <span className="text-[10px] font-black text-zinc-400 uppercase">Ortalama</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <LineChart
                            data={chartData.length > 0 ? chartData : [
                                { date: 'Eyl', score: 65, classAvg: 70 },
                                { date: 'Eki', score: 75, classAvg: 72 },
                                { date: 'Kas', score: 82, classAvg: 71 },
                                { date: 'Ara', score: 88, classAvg: 74 }
                            ]}
                            lines={[
                                { key: 'score', color: '#4f46e5', label: 'Skor' },
                                { key: 'classAvg', color: '#e4e4e7', label: 'Ortalama' }
                            ]}
                            height={280}
                        />
                    </div>
                </div>

                {/* Sağ: Not Dökümü (Bento Card List) */}
                <div className="bg-white dark:bg-zinc-900 rounded-[3.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-8">Not Dökümü</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {student.academic?.grades?.map((g) => (
                            <div key={g.id} className="group p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/20 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-sm
                                        ${g.score >= 85 ? 'bg-emerald-500 text-white' :
                                            g.score >= 70 ? 'bg-indigo-500 text-white' :
                                                g.score >= 50 ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'}`}>
                                        {g.score}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-tight">{g.subject}</h4>
                                        <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-widest">
                                            {g.type === 'exam' ? 'Vize/Final' : 'Egzersiz'} • {new Date(g.date).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                                <i className="fa-solid fa-chevron-right text-zinc-300 group-hover:text-indigo-500 transition-colors text-xs"></i>
                            </div>
                        ))}

                        {(!student.academic?.grades || student.academic.grades.length === 0) && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                <i className="fa-solid fa-clipboard-list text-4xl mb-4"></i>
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Henüz kayıt yok</span>
                            </div>
                        )}
                    </div>
                    <button className="w-full mt-8 py-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-indigo-600 transition-all">
                        Transkript İndir
                    </button>
                </div>
            </div>
        </div>
    );
};
