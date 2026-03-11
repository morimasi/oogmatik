import React, { useState } from 'react';
import { AdvancedStudent, IEPGoal } from '../../../types/student-advanced';

interface IEPModuleProps {
    student: AdvancedStudent;
    onUpdate?: (updatedIEP: any) => void;
}

export const IEPModule: React.FC<IEPModuleProps> = ({ student, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'goals' | 'reviews' | 'team' | 'ai'>('goals');
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock AI Generation
    const handleGenerateGoals = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            // In a real app, this would call an API
            alert('AI tarafından 3 yeni hedef önerildi!');
        }, 2000);
    };

    const GoalCard = ({ goal }: { goal: IEPGoal }) => (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 mb-4 hover:border-indigo-300 transition-colors">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 inline-block
                        ${goal.category === 'academic' ? 'bg-blue-100 text-blue-700' : 
                          goal.category === 'behavioral' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                        {goal.category === 'academic' ? 'Akademik' : goal.category === 'behavioral' ? 'Davranışsal' : goal.category}
                    </span>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">{goal.title}</h4>
                </div>
                <div className="flex flex-col items-end">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full 
                        ${goal.status === 'achieved' ? 'bg-emerald-100 text-emerald-700' : 
                          goal.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {goal.status === 'achieved' ? 'Tamamlandı' : goal.status === 'in_progress' ? 'Devam Ediyor' : 'Başlanmadı'}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">Bitiş: {new Date(goal.targetDate).toLocaleDateString('tr-TR')}</span>
                </div>
            </div>
            
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 leading-relaxed">
                {goal.description}
            </p>

            {goal.aiAnalysis && (
                <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50 flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-xs">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <p className="text-xs text-indigo-800 dark:text-indigo-300 italic">
                        "{goal.aiAnalysis}"
                    </p>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-zinc-500">İlerleme</span>
                    <span className="text-indigo-600">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-bold text-zinc-600 transition-colors">
                    <i className="fa-regular fa-pen-to-square mr-2"></i>
                    Düzenle
                </button>
                <button className="flex-1 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-xs font-bold text-zinc-600 transition-colors">
                    <i className="fa-solid fa-chart-line mr-2"></i>
                    Veri Gir
                </button>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500 block mb-1">BEP Dönemi</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                        {new Date(student.iep?.startDate).toLocaleDateString('tr-TR')} - {new Date(student.iep?.endDate).toLocaleDateString('tr-TR')}
                    </span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500 block mb-1">Toplam Hedef</span>
                    <span className="font-bold text-zinc-900 dark:text-white text-xl">
                        {student.iep?.goals?.length || 0}
                    </span>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500 block mb-1">Genel Başarı</span>
                    <span className="font-bold text-emerald-500 text-xl">
                        %{Math.round(student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) / (student.iep?.goals?.length || 1)) || 0}
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl mb-6 w-fit">
                {['goals', 'reviews', 'team', 'ai'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                            ${activeTab === tab 
                                ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm' 
                                : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                        {tab === 'goals' ? 'Hedefler' : tab === 'reviews' ? 'Değerlendirmeler' : tab === 'team' ? 'BEP Ekibi' : 'AI Asistan'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === 'goals' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg">Aktif Hedefler</h3>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                <i className="fa-solid fa-plus mr-2"></i>
                                Yeni Hedef
                            </button>
                        </div>
                        
                        {student.iep?.goals?.map(goal => (
                            <GoalCard key={goal.id} goal={goal} />
                        ))}

                        {(!student.iep?.goals || student.iep.goals.length === 0) && (
                            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                                    <i className="fa-solid fa-bullseye text-2xl"></i>
                                </div>
                                <h3 className="font-bold text-zinc-900 dark:text-white">Henüz Hedef Eklenmemiş</h3>
                                <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                                    Öğrenci için bireyselleştirilmiş hedefler oluşturmaya başlayın veya AI asistanından yardım alın.
                                </p>
                                <button 
                                    onClick={() => setActiveTab('ai')}
                                    className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                                >
                                    AI ile Hedef Oluştur &rarr;
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ai' && (
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-black rounded-3xl p-8 border border-indigo-100 dark:border-zinc-800 text-center">
                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl rotate-3 mx-auto flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none mb-6">
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl text-white"></i>
                        </div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                            Yapay Zeka Destekli BEP Oluşturucu
                        </h2>
                        <p className="text-zinc-500 max-w-lg mx-auto mb-8">
                            Öğrencinin tanı raporlarını, güçlü ve zayıf yönlerini analiz ederek saniyeler içinde kişiselleştirilmiş, ölçülebilir (SMART) hedefler oluşturun.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8 text-left">
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs"><i className="fa-solid fa-check"></i></div>
                                    <span className="font-bold text-sm">Tanı Analizi</span>
                                </div>
                                <p className="text-xs text-zinc-500">RAM raporları ve tıbbi tanılar taranır.</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs"><i className="fa-solid fa-check"></i></div>
                                    <span className="font-bold text-sm">Gelişim Takibi</span>
                                </div>
                                <p className="text-xs text-zinc-500">Önceki performans verileri dikkate alınır.</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerateGoals}
                            disabled={isGenerating}
                            className={`px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-xl flex items-center gap-3 mx-auto
                                ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                                    Analiz Ediliyor...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-bolt"></i>
                                    Otomatik Hedef Oluştur
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
