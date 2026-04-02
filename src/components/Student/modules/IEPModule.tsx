import React, { useState, useMemo } from 'react';
import { AdvancedStudent, IEPGoal } from '../../../types/student-advanced';
import { RadarChart } from '../../RadarChart';
import { LineChart } from '../../LineChart';

// --- Extended Types for AI Features ---
interface AIInsight {
    type: 'strength' | 'weakness' | 'opportunity' | 'threat';
    category: 'cognitive' | 'academic' | 'emotional';
    title: string;
    description: string;
    confidence: number; // 0-100
    source: string[]; // e.g. ["Assessment #4", "Teacher Note"]
}

interface PredictionModel {
    metric: string;
    currentValue: number;
    predictedValue: number; // Next month
    trend: 'up' | 'down' | 'stable';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface IEPModuleProps {
    student: AdvancedStudent;
    onUpdate?: (updatedIEP: any) => void;
}

export const IEPModule: React.FC<IEPModuleProps> = ({ student, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'goals' | 'reports'>('dashboard');
    const [newGoal, setNewGoal] = useState<Partial<IEPGoal>>({});
    const [showGoalModal, setShowGoalModal] = useState(false);

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedGoalForReview, setSelectedGoalForReview] = useState<string | null>(null);
    const [newReview, setNewReview] = useState({ comment: '', progressSnapshot: 0, nextSteps: '' });

    // State for interactive data (replacing pure mocks with editable state)
    const [goals, setGoals] = useState<IEPGoal[]>(student.iep?.goals || []);

    // Simulated AI Data (In real app, fetch from API)
    const aiInsights = useMemo<AIInsight[]>(() => [
        {
            type: 'weakness',
            category: 'cognitive',
            title: 'İşitsel İşlemleme Güçlüğü',
            description: 'Gürültülü ortamlarda yönergeleri takip etmekte zorlanıyor. Fonolojik farkındalık testlerinde %15 sapma tespit edildi.',
            confidence: 89,
            source: ['WISC-R', 'CAS Testi']
        },
        {
            type: 'strength',
            category: 'academic',
            title: 'Görsel Uzamsal Zeka',
            description: 'Geometrik şekiller ve desen tamamlama görevlerinde yaş grubunun %95 üzerinde performans.',
            confidence: 94,
            source: ['Raven Matrisleri', 'Görsel Algı Testi']
        }
    ], []);

    const predictions = useMemo<PredictionModel[]>(() => [
        { metric: 'Okuma Hızı (kelime/dk)', currentValue: 45, predictedValue: 52, trend: 'up', riskLevel: 'low' },
        { metric: 'Dikkat Süresi (dk)', currentValue: 12, predictedValue: 10, trend: 'down', riskLevel: 'high' }
    ], []);

    // --- Goal Management ---
    const handleAddGoal = () => {
        if (!newGoal.title || !newGoal.description) return;

        const goal: IEPGoal = {
            id: crypto.randomUUID(),
            title: newGoal.title,
            description: newGoal.description,
            category: newGoal.category || 'academic',
            status: 'not_started',
            progress: 0,
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

    const handleDeleteGoal = (id: string) => {
        if (confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
            const updatedGoals = goals.filter(g => g.id !== id);
            setGoals(updatedGoals);
            if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
        }
    };

    const handleUpdateProgress = (id: string, newProgress: number) => {
        const updatedGoals = goals.map(g =>
            g.id === id ? { ...g, progress: newProgress, status: newProgress === 100 ? 'achieved' : newProgress > 0 ? 'in_progress' : 'not_started' } : g
        );
        setGoals(updatedGoals as IEPGoal[]);
        if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
    };

    // --- Review Management ---
    const openReviewModal = (goalId: string) => {
        setSelectedGoalForReview(goalId);
        const goal = goals.find(g => g.id === goalId);
        setNewReview({
            comment: '',
            progressSnapshot: goal ? goal.progress : 0,
            nextSteps: ''
        });
        setShowReviewModal(true);
    };

    const handleAddReview = () => {
        if (!selectedGoalForReview || !newReview.comment) return;

        const updatedGoals = goals.map(goal => {
            if (goal.id === selectedGoalForReview) {
                const review = {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    reviewer: 'Öğretmen', // In real app, get current user
                    comment: newReview.comment,
                    progressSnapshot: newReview.progressSnapshot,
                    nextSteps: newReview.nextSteps
                };
                return {
                    ...goal,
                    reviews: [...(goal.reviews || []), review],
                    progress: newReview.progressSnapshot // Update goal progress to match review
                };
            }
            return goal;
        });

        setGoals(updatedGoals as IEPGoal[]);
        setShowReviewModal(false);
        if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
    };

    // Components
    const TabButton = ({ id, icon, label }: { id: any, icon: string, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
                ${activeTab === id
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl scale-105'
                    : 'bg-[var(--panel-bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-[var(--border-color)]'}`}
        >
            <i className={`fa-solid ${icon} ${activeTab === id ? 'text-indigo-500' : 'text-zinc-300'}`}></i>
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col font-['Lexend'] bg-[var(--bg-primary)] relative">
            {/* Modal for New Goal */}
            {showGoalModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--panel-bg-solid)] rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-[var(--border-color)] animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">Yeni Hedef Oluştur</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Hedef Başlığı</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    placeholder="Örn: Okuma Hızını Artırma"
                                    value={newGoal.title || ''}
                                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Kategori</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={newGoal.category || 'academic'}
                                    onChange={e => setNewGoal({ ...newGoal, category: e.target.value as any })}
                                >
                                    <option value="academic">Akademik</option>
                                    <option value="behavioral">Davranışsal</option>
                                    <option value="social">Sosyal</option>
                                    <option value="motor">Motor Beceriler</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Açıklama</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                                    placeholder="Hedefin detayları ve başarı kriterleri..."
                                    value={newGoal.description || ''}
                                    onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Öncelik</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={newGoal.priority || 'medium'}
                                        onChange={e => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                                    >
                                        <option value="high">Yüksek</option>
                                        <option value="medium">Orta</option>
                                        <option value="low">Düşük</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Hedef Tarih</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={newGoal.targetDate ? newGoal.targetDate.split('T')[0] : ''}
                                        onChange={e => setNewGoal({ ...newGoal, targetDate: new Date(e.target.value).toISOString() })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowGoalModal(false)}
                                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAddGoal}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                Hedefi Ekle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Review */}
            {showReviewModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[var(--panel-bg-solid)] rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-[var(--border-color)] animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">Değerlendirme Ekle</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">İlerleme Durumu (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={newReview.progressSnapshot}
                                    onChange={e => setNewReview({ ...newReview, progressSnapshot: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Değerlendirme Notu</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                                    placeholder="Öğrencinin bu hedefteki performansı hakkında gözlemleriniz..."
                                    value={newReview.comment}
                                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Sonraki Adımlar</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--panel-bg-subtle)] border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    placeholder="Gerekirse alınacak önlemler veya strateji değişikliği..."
                                    value={newReview.nextSteps}
                                    onChange={e => setNewReview({ ...newReview, nextSteps: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleAddReview}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Navigation */}
            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 shrink-0 px-2 no-scrollbar">
                <TabButton id="dashboard" icon="fa-grid-2" label="BEP Paneli" />
                <TabButton id="goals" icon="fa-bullseye-arrow" label="SMART Hedefler" />
                <TabButton id="analysis" icon="fa-brain-circuit" label="Bilişsel Profil" />
                <TabButton id="reports" icon="fa-file-chart-column" label="Akademik Rapor" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Ana İlerleme (Bento Card Large) */}
                            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-12">
                                        <div>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Genel BEP Performansı</h3>
                                            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Mevcut Akademik Yıl İlerlemesi</p>
                                        </div>
                                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
                                            <i className="fa-solid fa-chart-line-up text-2xl"></i>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-12">
                                        <div className="relative w-48 h-48 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="96" cy="96" r="86" fill="none" stroke="currentColor" strokeWidth="14" className="text-white/10" />
                                                <circle
                                                    cx="96" cy="96" r="86" fill="none" stroke="currentColor" strokeWidth="14"
                                                    strokeDasharray={540}
                                                    strokeDashoffset={540 - (540 * (goals.length > 0 ? goals.reduce((acc, g) => acc + g.progress, 0) / goals.length : 0)) / 100}
                                                    className="text-white transition-all duration-1000 ease-out"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-black">%{goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Gelişim</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 grid grid-cols-3 gap-6 w-full">
                                            {[
                                                { label: 'Hedef', val: goals.length, icon: 'fa-bullseye' },
                                                { label: 'Tamam', val: goals.filter(g => g.status === 'achieved').length, icon: 'fa-check-circle' },
                                                { label: 'Süren', val: goals.filter(g => g.status === 'in_progress').length, icon: 'fa-clock' }
                                            ].map(stat => (
                                                <div key={stat.label} className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm text-center">
                                                    <i className={`fa-solid ${stat.icon} text-indigo-200 mb-2 opacity-50`}></i>
                                                    <span className="block text-3xl font-black mb-1">{stat.val}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Tahmin Paneli (Bento Card) */}
                            <div className="bg-[var(--panel-bg-solid)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm relative overflow-hidden group">
                                <h3 className="text-xl font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter">AI Projeksiyonu</h3>
                                <div className="space-y-6">
                                    {predictions.map((pred, i) => (
                                        <div key={i} className="p-6 bg-[var(--panel-bg-subtle)]/50 rounded-[2rem] border border-[var(--border-color)] flex items-center justify-between group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-all">
                                            <div className="flex-1">
                                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">{pred.metric}</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl font-black text-[var(--text-primary)]">{pred.currentValue}</span>
                                                    <i className="fa-solid fa-arrow-right text-[10px] text-zinc-300"></i>
                                                    <span className={`text-2xl font-black ${pred.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                                                        }`}>
                                                        {pred.predictedValue}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner
                                                ${pred.riskLevel === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                <i className={`fa-solid ${pred.trend === 'up' ? 'fa-chart-line-up' : 'fa-chart-line-down'}`}></i>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grafikler Alanı (Bento Grid Medium) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-[var(--panel-bg-solid)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm">
                                <h3 className="text-lg font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter">Bilişsel Dağılım</h3>
                                <div className="w-full flex justify-center py-4 scale-110">
                                    <RadarChart data={[
                                        { label: 'Dikkat', value: 45 },
                                        { label: 'Hafıza', value: 60 },
                                        { label: 'Görsel', value: 95 },
                                        { label: 'İşitsel', value: 30 },
                                        { label: 'Dil', value: 70 },
                                        { label: 'Hız', value: 50 },
                                    ]} />
                                </div>
                            </div>
                            <div className="bg-[var(--panel-bg-solid)] p-10 rounded-[3.5rem] border border-[var(--border-color)] shadow-sm">
                                <h3 className="text-lg font-black text-[var(--text-primary)] mb-8 uppercase tracking-tighter">Gelişim Trendi</h3>
                                <div className="w-full h-72">
                                    <LineChart
                                        data={Array.from({ length: 6 }).map((_, i) => ({
                                            date: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                                            attention: 40 + Math.random() * 20,
                                            reading: 30 + i * 5 + Math.random() * 5
                                        }))}
                                        lines={[
                                            { key: 'attention', color: '#6366f1', label: 'Dikkat' },
                                            { key: 'reading', color: '#10b981', label: 'Okuma' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* GOALS TAB */}
                {activeTab === 'goals' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Akademik Hedef Matrisi</h3>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">SMART Metodolojisi ile Takip</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={async () => {
                                        const btn = document.getElementById('btn-ai-goal');
                                        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Üretiliyor...';
                                        try {
                                            const { aiStudentService } = await import('../../../services/aiStudentService');
                                            const newAiGoals = await aiStudentService.generateIEPGoals(student);
                                            const formattedGoals = newAiGoals.map((g: any) => ({
                                                id: crypto.randomUUID(),
                                                title: g.title,
                                                description: g.description,
                                                category: g.category as any,
                                                status: 'not_started',
                                                progress: 0,
                                                targetDate: g.targetDate || new Date().toISOString(),
                                                priority: g.priority as any,
                                                strategies: [],
                                                resources: [],
                                                evaluationMethod: 'observation',
                                                reviews: []
                                            }));
                                            const updatedGoals = [...goals, ...formattedGoals];
                                            setGoals(updatedGoals as IEPGoal[]);
                                            if (onUpdate) onUpdate({ ...student.iep, goals: updatedGoals });
                                        } catch (e) { console.error('AI Error', e); }
                                        if (btn) btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI Hedef Üret';
                                    }}
                                    id="btn-ai-goal"
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    AI Hedef Üret
                                </button>
                                <button
                                    onClick={() => setShowGoalModal(true)}
                                    className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                                >
                                    <i className="fa-solid fa-plus-circle"></i>
                                    Manuel Ekle
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pb-10">
                            {goals.map(goal => (
                                <div key={goal.id} className="bg-[var(--panel-bg-solid)] p-8 rounded-[3.5rem] border border-[var(--border-color)] hover:border-indigo-500/30 transition-all group shadow-sm flex flex-col lg:flex-row gap-8">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl shadow-xl shrink-0
                                        ${goal.category === 'academic' ? 'bg-indigo-50 text-indigo-600' :
                                            goal.category === 'behavioral' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <i className={`fa-solid ${goal.category === 'academic' ? 'fa-book-sparkles' :
                                            goal.category === 'behavioral' ? 'fa-user-gear' : 'fa-brain-circuit'
                                            }`}></i>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border
                                                        ${goal.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-zinc-50 text-zinc-400 border-zinc-100'}`}>
                                                        {goal.priority === 'high' ? 'Kritik Öncelik' : goal.priority === 'medium' ? 'Orta' : 'Düşük'}
                                                    </span>
                                                    <span className="px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-lg">
                                                        {goal.category}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">{goal.title}</h4>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 font-black">
                                                    <i className="fa-solid fa-pen-nib"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                    className="w-10 h-10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center text-rose-400"
                                                >
                                                    <i className="fa-solid fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium italic border-l-2 border-zinc-100 pl-4 py-1">{goal.description}</p>

                                        <div className="bg-[var(--panel-bg-subtle)]/50 p-6 rounded-[2.5rem] border border-[var(--border-color)]">
                                            <div className="flex justify-between items-end mb-4">
                                                <div>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Mevcut İlerleme</span>
                                                    <span className="text-3xl font-black text-indigo-600">%{goal.progress}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Hedef Tarih</span>
                                                    <span className="text-xs font-black text-[var(--text-primary)]">{new Date(goal.targetDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div className="relative h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                                    style={{ width: `${goal.progress}%` }}
                                                ></div>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={goal.progress}
                                                    onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                                                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-center">
                                        <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-4">Son Operasyon</h5>
                                        {goal.reviews && goal.reviews.length > 0 ? (
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-[var(--text-primary)] leading-relaxed">
                                                    "{goal.reviews[goal.reviews.length - 1].comment}"
                                                </p>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase">
                                                    {new Date(goal.reviews[goal.reviews.length - 1].date).toLocaleDateString()} • {goal.reviews[goal.reviews.length - 1].reviewer}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-xs italic text-zinc-300">Henüz bir değerlendirme yapılmamış.</p>
                                        )}
                                        <button
                                            onClick={() => openReviewModal(goal.id)}
                                            className="mt-6 w-full py-3 border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-all"
                                        >
                                            Veri Girişi Yap
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ANALYSIS TAB */}
                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-10 rounded-[3.5rem] text-white flex gap-8 items-center relative overflow-hidden shadow-2xl shadow-amber-500/20">
                            <div className="absolute right-0 top-0 p-10 opacity-10">
                                <i className="fa-solid fa-brain-circuit text-9xl"></i>
                            </div>
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl shrink-0">
                                <i className="fa-solid fa-microchip-ai"></i>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Pedagojik Analiz Motoru</h3>
                                <p className="text-amber-50 text-sm font-medium leading-relaxed max-w-2xl">
                                    Öğrencinin bilişsel ve akademik verileri AI destekli algoritmalarla normalize edilerek gelişim öngörüleri oluşturulmaktadır.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {aiInsights.map((insight, i) => (
                                <div key={i} className={`p-10 rounded-[3.5rem] bg-[var(--panel-bg-solid)] border border-[var(--border-color)] shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all`}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl
                                                ${insight.type === 'strength' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                <i className={`fa-solid ${insight.type === 'strength' ? 'fa-shield-halved' : 'fa-triangle-exclamation'}`}></i>
                                            </div>
                                            <h4 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">{insight.title}</h4>
                                        </div>
                                        <span className="px-3 py-1 bg-[var(--panel-bg-subtle)] rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            %{insight.confidence} Güven
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">{insight.description}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {insight.source.map((s, idx) => (
                                            <span key={idx} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 py-1 flex items-center gap-2">
                                                <i className="fa-solid fa-link text-[8px] opacity-30"></i>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-[var(--panel-bg-solid)] rounded-[3.5rem] p-16 text-center border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[500px] shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>

                        <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-10 text-white shadow-2xl shadow-indigo-600/40 relative group cursor-pointer transition-transform hover:scale-110">
                            <i className="fa-solid fa-file-pdf text-5xl"></i>
                            <div className="absolute inset-0 border-4 border-indigo-400 rounded-[2.5rem] animate-ping opacity-20"></div>
                        </div>

                        <h3 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-4">Akademik Rapor Jeneratörü</h3>
                        <p className="text-zinc-500 max-w-lg mx-auto mb-12 text-sm font-medium leading-relaxed">
                            Öğrencinin tüm BEP süreçlerini içeren, profesyonel dizayn edilmiş, görselleştirilmiş performans raporunu tek tıkla hazırlayın.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            {['Performans Özetleri', 'Gelişim Grafikleri', 'AI Analizleri', 'Gözlem Notları'].map(item => (
                                <div key={item} className="px-6 py-3 bg-[var(--panel-bg-subtle)] rounded-2xl border border-zinc-100 dark:border-zinc-700 flex items-center gap-3">
                                    <i className="fa-solid fa-square-check text-indigo-500"></i>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                            <button className="flex-1 px-10 py-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all">
                                Önizleme Al
                            </button>
                            <button className="flex-1 px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3">
                                <i className="fa-solid fa-cloud-arrow-down"></i>
                                PDF Olarak İndir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
