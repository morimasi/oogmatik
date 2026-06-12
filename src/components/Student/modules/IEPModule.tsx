import React, { useState, useMemo, useEffect } from 'react';
import { AdvancedStudent, IEPGoal, IEPPlan } from '../../../types/student-advanced';
import { RadarChart } from '../../RadarChart';
import { LineChart } from '../../LineChart';
import { logInfo, logError } from '../../../utils/logger.js';
import { aiStudentService, CognitiveProfileResult } from '../../../services/aiStudentService';

interface AIInsight {
    type: 'strength' | 'weakness' | 'opportunity' | 'threat';
    category: 'cognitive' | 'academic' | 'emotional';
    title: string;
    description: string;
    confidence: number;
    source: string[];
}

interface PredictionModel {
    metric: string;
    currentValue: number;
    predictedValue: number;
    trend: 'up' | 'down' | 'stable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface IEPModuleProps {
    student: AdvancedStudent;
    onUpdate?: (updatedIEP: IEPPlan) => void;
}

export const IEPModule: React.FC<IEPModuleProps> = ({ student, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'goals' | 'reports'>('dashboard');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [aiResult, setAiResult] = useState<CognitiveProfileResult | null>(null);
    const [goals, setGoals] = useState<IEPGoal[]>(student.iep?.goals || []);

    const handleApplySuggestedGoal = (suggested: any) => {
        const newIEPGoal: IEPGoal = {
            id: crypto.randomUUID(),
            title: suggested.title,
            description: suggested.description,
            category: (suggested.category as any) || 'academic',
            status: 'not_started',
            progress: 0,
            baseline: { description: 'AI Tarafından Önerildi', measurementDate: new Date().toISOString(), measurementMethod: 'observation' },
            shortTermObjective: suggested.description,
            successCriteria: suggested.successCriteria || 'Kriterlenmedi',
            targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // +90 days default
            priority: suggested.priority || 'medium',
            strategies: [],
            resources: [],
            evaluationMethod: 'observation',
            reviews: []
        };
        const updated = [...goals, newIEPGoal];
        setGoals(updated);
        if (onUpdate) onUpdate({ ...student.iep, goals: updated });
        logInfo("AI önerisi plana eklendi: " + suggested.title);
    };
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState<Partial<IEPGoal>>({});
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedGoalForReview, setSelectedGoalForReview] = useState<string | null>(null);
    const [newReview, setNewReview] = useState({ comment: '', progressSnapshot: 0, nextSteps: '' });

    // AI Prediction Mock (Simplified for now)
    const predictions: PredictionModel[] = [
        { metric: 'Okuma Akıcılığı', currentValue: 42, predictedValue: 58, trend: 'up', riskLevel: 'low' },
        { metric: 'Odaklanma Süresi', currentValue: 12, predictedValue: 15, trend: 'up', riskLevel: 'medium' }
    ];

    const handleGenerateAIInsight = async () => {
        setIsGeneratingAI(true);
        try {
            const response = await aiStudentService.generateCognitiveInsight(student);
            if (response.success && response.data) {
                setAiResult(response.data);
                logInfo("AI Bilişsel Analiz tamamlandı.");
            }
        } catch (error) {
            logError("AI Analiz hatası:", error);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const handleUpdateProgress = (id: string, newProgress: number) => {
        const updatedGoals = goals.map((g: IEPGoal) =>
            g.id === id ? { 
                ...g, 
                progress: newProgress, 
                status: (newProgress === 100 ? 'achieved' : newProgress > 0 ? 'in_progress' : 'not_started') as IEPGoal['status']
            } : g
        );
        setGoals(updatedGoals);
        if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
    };

    const handleDeleteGoal = (id: string) => {
        if (window.confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
            const updatedGoals = goals.filter((g: IEPGoal) => g.id !== id);
            setGoals(updatedGoals);
            if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
        }
    };

    const handleAddGoal = () => {
        if (!newGoal.title) return;
        const goal: IEPGoal = {
            id: crypto.randomUUID(),
            title: newGoal.title,
            description: newGoal.description || '',
            category: (newGoal.category as any) || 'academic',
            status: 'not_started',
            progress: 0,
            baseline: { description: '', measurementDate: new Date().toISOString(), measurementMethod: 'observation' },
            shortTermObjective: '',
            successCriteria: '',
            targetDate: newGoal.targetDate || new Date().toISOString(),
            priority: newGoal.priority || 'medium',
            strategies: [],
            resources: [],
            evaluationMethod: 'observation',
            reviews: []
        };
        const updatedGoals = [...goals, goal];
        setGoals(updatedGoals);
        setShowGoalModal(false);
        setNewGoal({});
        if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
    };

    const TabButton = ({ id, icon, label }: { id: any, icon: string, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                ${activeTab === id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl scale-105'
                    : 'bg-white dark:bg-zinc-900 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 border border-zinc-100 dark:border-zinc-800'}`}
        >
            <i className={`fa-solid ${icon} ${activeTab === id ? 'text-indigo-500' : 'text-zinc-300'}`}></i>
            {label}
        </button>
    );

    const handleExportPDF = async () => {
        if (!aiResult) {
            alert("Lütfen önce AI analizini başlatın.");
            return;
        }
        
        logInfo("Profesyonel BEP Raporu hazırlanıyor...");
        
        // PDF Export Modunu Aktifleştir (CSS Fidelity)
        document.body.classList.add('pdf-export-mode', 'preserve-theme', 'report-mode');
        
        // Baskıyı Başlat
        setTimeout(() => {
            window.print();
            // Temizlik
            document.body.classList.remove('pdf-export-mode', 'preserve-theme', 'report-mode');
        }, 500);
    };

    return (
        <div className="h-full flex flex-col font-['Lexend'] bg-zinc-50 dark:bg-black/50 relative p-4 report-container">
            {/* Header Navigation */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2 no-scrollbar">
                <TabButton id="dashboard" icon="fa-grid-2" label="BEP Paneli" />
                <TabButton id="goals" icon="fa-bullseye-arrow" label="SMART Hedefler" />
                <TabButton id="analysis" icon="fa-brain-circuit" label="Bilişsel Profil" />
                <TabButton id="reports" icon="fa-file-chart-column" label="Akademik Rapor" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Genel BEP Performansı</h3>
                                    <div className="flex flex-col md:flex-row items-center gap-10">
                                        <div className="relative w-40 h-40 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-white/10" />
                                                <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12"
                                                    strokeDasharray={440}
                                                    strokeDashoffset={440 - (440 * (goals.length > 0 ? goals.reduce((acc, g) => acc + g.progress, 0) / goals.length : 0)) / 100}
                                                    className="text-white transition-all duration-1000"
                                                    strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-black">%{goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center text-sm font-bold">
                                                <span className="block text-2xl mb-1">{goals.length}</span>
                                                <span className="text-[9px] uppercase opacity-60">Hedef</span>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center text-sm font-bold">
                                                <span className="block text-2xl mb-1">{goals.filter(g => g.status === 'achieved').length}</span>
                                                <span className="text-[9px] uppercase opacity-60">Tamam</span>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center text-sm font-bold">
                                                <span className="block text-2xl mb-1">{goals.filter(g => g.status === 'in_progress').length}</span>
                                                <span className="text-[9px] uppercase opacity-60">Süren</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-6">AI Tahmini</h3>
                                <div className="space-y-4">
                                    {predictions.map((p, i) => (
                                        <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                            <div>
                                                <p className="text-[9px] text-zinc-400 font-black uppercase mb-1">{p.metric}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-black">%{p.currentValue}</span>
                                                    <i className="fa-solid fa-arrow-right text-[10px] text-zinc-300"></i>
                                                    <span className="text-xl font-black text-emerald-500">%{p.predictedValue}</span>
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-chart-line-up text-xl text-emerald-500 opacity-50"></i>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in duration-500 space-y-6">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-10 rounded-[3.5rem] text-white flex gap-8 items-center relative overflow-hidden shadow-xl">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shrink-0">
                                <i className="fa-solid fa-microchip-ai"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">Pedagojik Analiz Motoru</h3>
                                <p className="text-amber-50 text-xs font-medium opacity-80">
                                    {aiResult ? 'AI bilişsel profil analizi tamamlandı.' : 'Öğrencinin performans verilerini analiz etmek için motoru başlatın.'}
                                </p>
                            </div>
                            {!aiResult && (
                                <button 
                                    onClick={handleGenerateAIInsight}
                                    disabled={isGeneratingAI}
                                    className="px-6 py-3 bg-white text-amber-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50"
                                >
                                    {isGeneratingAI ? <i className="fa-solid fa-sync fa-spin"></i> : 'AI ANALİZİ BAŞLAT'}
                                </button>
                            )}
                        </div>

                        {aiResult && (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                                        <h4 className="text-sm font-black uppercase self-start mb-6">Bilişsel Radar</h4>
                                        <div className="w-full h-80">
                                            <RadarChart data={aiResult.radarData} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800">
                                            <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-3">Güçlü Yönler</h5>
                                            <ul className="space-y-2">
                                                {aiResult.strengths.map((s, i) => (
                                                    <li key={i} className="text-xs font-bold flex items-start gap-2">
                                                        <i className="fa-solid fa-check text-emerald-500 mt-1"></i> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-[2.5rem] border border-rose-100 dark:border-rose-800">
                                            <h5 className="text-[10px] font-black text-rose-600 uppercase mb-3">Gelişim Alanları</h5>
                                            <ul className="space-y-2">
                                                {aiResult.challenges.map((c, i) => (
                                                    <li key={i} className="text-xs font-bold flex items-start gap-2">
                                                        <i className="fa-solid fa-triangle-exclamation text-rose-500 mt-1"></i> {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {aiResult.suggestedIEPGoals && aiResult.suggestedIEPGoals.length > 0 && (
                                    <div className="mt-8 space-y-6">
                                        <h3 className="text-xl font-black uppercase tracking-tight ml-4 flex items-center gap-3 text-indigo-600">
                                            <i className="fa-solid fa-sparkles"></i> AI Önerilen SMART Hedefler
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {aiResult.suggestedIEPGoals.map((g, i) => (
                                                <div key={i} className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-[2.5rem] flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h5 className="font-black text-sm uppercase text-indigo-700 dark:text-indigo-400">{g.title}</h5>
                                                            <span className="px-2 py-1 bg-white dark:bg-zinc-800 text-[8px] font-black uppercase rounded shadow-sm">
                                                                {g.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{g.description}</p>
                                                        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-indigo-50 dark:border-indigo-900 mb-4">
                                                            <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">Başarı Kriteri</p>
                                                            <p className="text-[10px] font-medium italic">{g.successCriteria}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleApplySuggestedGoal(g)}
                                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                                    >
                                                        BU HEDEFİ PLANA EKLE
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'goals' && (
                    <div className="animate-in fade-in duration-500 space-y-6 pb-12">
                        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-xl font-black uppercase tracking-tight">Akademik Hedefler</h3>
                            <button onClick={() => setShowGoalModal(true)} className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                YENİ HEDEF EKLE
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {goals.map(goal => (
                                <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 hover:shadow-lg transition-all flex flex-col md:flex-row gap-6 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${goal.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                                {goal.priority}
                                            </span>
                                            <h4 className="text-lg font-black uppercase">{goal.title}</h4>
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium italic mb-4">{goal.description}</p>
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase">İlerleme: %{goal.progress}</span>
                                                <span className="text-[10px] font-black text-zinc-400 uppercase">{new Date(goal.targetDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${goal.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeleteGoal(goal.id)} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Simple Add Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 w-full max-w-md">
                        <h3 className="text-xl font-black mb-6">Hedef Oluştur</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Hedef Başlığı" className="w-full p-4 bg-zinc-50 rounded-xl font-bold" 
                                onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
                            <textarea placeholder="Açıklama" className="w-full p-4 bg-zinc-50 rounded-xl min-h-[100px]"
                                onChange={e => setNewGoal({...newGoal, description: e.target.value})} />
                            <div className="flex gap-4">
                                <button onClick={() => setShowGoalModal(false)} className="flex-1 p-4 bg-zinc-100 rounded-xl font-black uppercase text-xs">İPTAL</button>
                                <button onClick={handleAddGoal} className="flex-1 p-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs">EKLE</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
