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
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === id 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg scale-105' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800'}`}
        >
            <i className={`fa-solid ${icon}`}></i>
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col font-['Lexend'] bg-zinc-50 dark:bg-black/50 relative">
            {/* Modal for New Goal */}
            {showGoalModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Yeni Hedef Oluştur</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Hedef Başlığı</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    placeholder="Örn: Okuma Hızını Artırma"
                                    value={newGoal.title || ''}
                                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Kategori</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={newGoal.category || 'academic'}
                                    onChange={e => setNewGoal({...newGoal, category: e.target.value as any})}
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
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                                    placeholder="Hedefin detayları ve başarı kriterleri..."
                                    value={newGoal.description || ''}
                                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 mb-1">Öncelik</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={newGoal.priority || 'medium'}
                                        onChange={e => setNewGoal({...newGoal, priority: e.target.value as any})}
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
                                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        value={newGoal.targetDate ? newGoal.targetDate.split('T')[0] : ''}
                                        onChange={e => setNewGoal({...newGoal, targetDate: new Date(e.target.value).toISOString()})}
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
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Değerlendirme Ekle</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">İlerleme Durumu (%)</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    value={newReview.progressSnapshot}
                                    onChange={e => setNewReview({...newReview, progressSnapshot: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Değerlendirme Notu</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                                    placeholder="Öğrencinin bu hedefteki performansı hakkında gözlemleriniz..."
                                    value={newReview.comment}
                                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-1">Sonraki Adımlar</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    placeholder="Gerekirse alınacak önlemler veya strateji değişikliği..."
                                    value={newReview.nextSteps}
                                    onChange={e => setNewReview({...newReview, nextSteps: e.target.value})}
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
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 shrink-0">
                <TabButton id="dashboard" icon="fa-chart-pie" label="BEP Paneli" />
                <TabButton id="goals" icon="fa-bullseye" label="Hedefler (SMART)" />
                <TabButton id="analysis" icon="fa-brain" label="AI Analiz & Profil" />
                <TabButton id="reports" icon="fa-file-pdf" label="Raporlar" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Quick Stats */}
                            <div className="space-y-6">
                                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                    <h3 className="font-bold text-lg relative z-10">BEP İlerlemesi</h3>
                                    <div className="mt-4 relative z-10">
                                        <div className="flex justify-between text-sm mb-2 opacity-90">
                                            <span>Genel Başarı</span>
                                            <span className="font-bold">
                                                %{goals.length > 0 
                                                    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) 
                                                    : 0}
                                            </span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-white h-full rounded-full transition-all duration-1000" 
                                                style={{ width: `${goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                                            <div className="bg-white/10 rounded-lg p-2">
                                                <span className="block text-xl font-black">{goals.filter(g => g.status === 'achieved').length}</span>
                                                <span className="text-[10px] opacity-75 uppercase">Tamamlanan</span>
                                            </div>
                                            <div className="bg-white/10 rounded-lg p-2">
                                                <span className="block text-xl font-black">{goals.filter(g => g.status === 'in_progress').length}</span>
                                                <span className="text-[10px] opacity-75 uppercase">Süren</span>
                                            </div>
                                            <div className="bg-white/10 rounded-lg p-2">
                                                <span className="block text-xl font-black">{goals.length}</span>
                                                <span className="text-[10px] opacity-75 uppercase">Toplam</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">AI Tahminleri</h3>
                                    <div className="space-y-4">
                                        {predictions.map((pred, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-zinc-500 font-medium">{pred.metric}</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-lg font-black text-zinc-800 dark:text-zinc-200">{pred.currentValue}</span>
                                                        <i className="fa-solid fa-arrow-right text-[10px] text-zinc-300"></i>
                                                        <span className={`text-lg font-black ${
                                                            pred.trend === 'up' ? 'text-emerald-500' : 
                                                            pred.trend === 'down' ? 'text-red-500' : 'text-amber-500'
                                                        }`}>
                                                            {pred.predictedValue}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                                                    ${pred.riskLevel === 'high' ? 'bg-red-100 text-red-600' : 
                                                      pred.riskLevel === 'low' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    <i className={`fa-solid ${
                                                        pred.trend === 'up' ? 'fa-arrow-trend-up' : 
                                                        pred.trend === 'down' ? 'fa-arrow-trend-down' : 'fa-minus'
                                                    }`}></i>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Center & Right: Charts */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                                    <h3 className="font-bold text-zinc-900 dark:text-white mb-2 w-full text-left text-sm">Bilişsel Profil (Radar)</h3>
                                    <div className="w-full h-64">
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
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-sm">Gelişim Trendi</h3>
                                    <div className="w-full h-64">
                                        <LineChart 
                                            data={Array.from({ length: 6 }).map((_, i) => ({
                                                date: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
                                                attention: 40 + Math.random() * 20,
                                                reading: 30 + i * 5 + Math.random() * 5,
                                                math: 50 + Math.random() * 10
                                            }))} 
                                            lines={[
                                                { key: 'attention', color: '#ef4444', label: 'Dikkat' },
                                                { key: 'reading', color: '#3b82f6', label: 'Okuma' }
                                            ]} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* GOALS TAB (Fully Interactive) */}
                {activeTab === 'goals' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Bireyselleştirilmiş Hedefler</h3>
                                <p className="text-zinc-500 text-sm mt-1">Öğrenci için tanımlanmış aktif hedefler ve ilerleme durumları.</p>
                            </div>
                            <button 
                                onClick={() => setShowGoalModal(true)}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <i className="fa-solid fa-plus"></i>
                                Yeni Hedef Ekle
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {goals.map(goal => (
                                <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm
                                                ${goal.category === 'academic' ? 'bg-blue-100 text-blue-600' : 
                                                  goal.category === 'behavioral' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                                <i className={`fa-solid ${
                                                    goal.category === 'academic' ? 'fa-book-open' : 
                                                    goal.category === 'behavioral' ? 'fa-user-check' : 'fa-shapes'
                                                }`}></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight">{goal.title}</h4>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded tracking-wider">
                                                        {goal.category}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider
                                                        ${goal.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                                        {goal.priority === 'high' ? 'Yüksek Öncelik' : goal.priority === 'medium' ? 'Orta' : 'Düşük'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors">
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 pl-[52px]">
                                        {goal.description}
                                    </p>

                                    <div className="pl-[52px]">
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl mb-4 border border-zinc-100 dark:border-zinc-800">
                                            <div className="flex justify-between text-xs font-bold mb-3">
                                                <span className="text-zinc-500">İlerleme Durumu</span>
                                                <div className="flex gap-4">
                                                    <span className="text-indigo-600">% {goal.progress}</span>
                                                    <span className="text-zinc-400 border-l pl-4 border-zinc-300">
                                                        Hedef: {new Date(goal.targetDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Interactive Progress Slider */}
                                            <div className="relative h-6 flex items-center group/slider cursor-pointer">
                                                <div className="absolute w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                                                        style={{ width: `${goal.progress}%` }}
                                                    ></div>
                                                </div>
                                                <input 
                                                    type="range" 
                                                    min="0" 
                                                    max="100" 
                                                    value={goal.progress} 
                                                    onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value))}
                                                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div 
                                                    className="w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-md absolute pointer-events-none transition-all duration-300 group-hover/slider:scale-125"
                                                    style={{ left: `calc(${goal.progress}% - 8px)` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Reviews / Updates */}
                                        <div className="flex justify-between items-center text-xs text-zinc-400">
                                            <div className="flex flex-col gap-1">
                                                <span>
                                                    <i className="fa-regular fa-clock mr-1"></i>
                                                    Son Değerlendirme: {goal.reviews && goal.reviews.length > 0 ? new Date(goal.reviews[goal.reviews.length - 1].date).toLocaleDateString() : 'Yok'}
                                                </span>
                                                {goal.reviews && goal.reviews.length > 0 && (
                                                    <span className="text-zinc-500 italic max-w-xs truncate">
                                                        "{goal.reviews[goal.reviews.length - 1].comment}"
                                                    </span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => openReviewModal(goal.id)}
                                                className="text-indigo-600 font-bold hover:underline"
                                            >
                                                + Değerlendirme Ekle
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {goals.length === 0 && (
                                <div className="text-center py-20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                                        <i className="fa-solid fa-bullseye text-3xl"></i>
                                    </div>
                                    <h3 className="text-zinc-900 dark:text-white font-bold text-lg">Henüz Hedef Tanımlanmamış</h3>
                                    <p className="text-zinc-500 max-w-xs mx-auto mt-2 mb-6">
                                        Öğrencinin gelişimini takip etmek için ilk hedefini oluşturun.
                                    </p>
                                    <button 
                                        onClick={() => setShowGoalModal(true)}
                                        className="text-indigo-600 font-bold hover:underline"
                                    >
                                        Hedef Oluştur
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ANALYSIS TAB */}
                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6 flex gap-4">
                            <div className="shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center text-xl">
                                <i className="fa-solid fa-lightbulb"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-amber-800 dark:text-amber-500 text-lg">Yapay Zeka Analiz Modülü</h3>
                                <p className="text-amber-700/80 dark:text-amber-500/80 text-sm mt-1">
                                    Bu veriler, öğrencinin sisteme girilen test sonuçları (WISC-R, CAS), öğretmen gözlemleri ve akademik performans verilerinin makine öğrenimi algoritmalarıyla işlenmesi sonucu oluşturulmuştur.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {aiInsights.map((insight, i) => (
                                <div key={i} className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 ${
                                    insight.type === 'strength' ? 'border-l-emerald-500' :
                                    insight.type === 'weakness' ? 'border-l-amber-500' :
                                    insight.type === 'threat' ? 'border-l-red-500' : 'border-l-blue-500'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-zinc-900 dark:text-white">{insight.title}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                            insight.confidence > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                            %{insight.confidence} Güven
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{insight.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {insight.source.map((s, idx) => (
                                            <span key={idx} className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                                <i className="fa-solid fa-database mr-1 opacity-50"></i>
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
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 text-indigo-600 relative group cursor-pointer">
                            <i className="fa-solid fa-file-invoice text-4xl group-hover:scale-110 transition-transform"></i>
                            <div className="absolute inset-0 border-2 border-indigo-100 dark:border-indigo-800 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Akıllı Rapor Oluşturucu</h3>
                        <p className="text-zinc-500 max-w-md mx-auto mb-8 text-sm leading-relaxed">
                            Seçilen tarih aralığı için tüm AI analizlerini, ilerleme grafiklerini ve öğretmen notlarını içeren kapsamlı bir PDF raporu oluşturun.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left cursor-pointer hover:border-indigo-500 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="fa-solid fa-check-circle text-emerald-500 text-xs"></i>
                                    <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Gelişim Grafikleri</span>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left cursor-pointer hover:border-indigo-500 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="fa-solid fa-check-circle text-emerald-500 text-xs"></i>
                                    <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">AI Öngörüleri</span>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left cursor-pointer hover:border-indigo-500 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="fa-solid fa-check-circle text-emerald-500 text-xs"></i>
                                    <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Hedef Durumları</span>
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-left cursor-pointer hover:border-indigo-500 transition-colors">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="fa-solid fa-check-circle text-emerald-500 text-xs"></i>
                                    <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">Öğretmen Notları</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 w-full max-w-md">
                            <button className="flex-1 px-6 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-2xl font-bold text-sm transition-colors">
                                Önizleme
                            </button>
                            <button className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                                <i className="fa-solid fa-download"></i>
                                Raporu İndir
                            </button>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};
