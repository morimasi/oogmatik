import React, { useState, useEffect, useMemo } from 'react';
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

interface Anomaly {
    id: string;
    date: string;
    type: 'performance_drop' | 'behavioral_change' | 'attendance_pattern';
    severity: 'high' | 'medium' | 'low';
    description: string;
    detectedBy: 'ML_Algorithm_v2' | 'Statistical_Analysis';
}

interface Recommendation {
    id: string;
    title: string;
    type: 'activity' | 'strategy' | 'resource';
    matchScore: number; // 0-100
    rationale: string;
    actionUrl?: string;
}

// --- Mock Data Generators (Simulating Real AI Services) ---
const generateAIInsights = (student: AdvancedStudent): AIInsight[] => [
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
    },
    {
        type: 'threat',
        category: 'emotional',
        title: 'Sınav Kaygısı',
        description: 'Süreli etkinliklerde performans %30 düşüyor. Kalp atış hızı verisi stres belirtisi gösteriyor.',
        confidence: 76,
        source: ['Biofeedback', 'Gözlem Formları']
    }
];

const generatePredictions = (): PredictionModel[] => [
    { metric: 'Okuma Hızı (kelime/dk)', currentValue: 45, predictedValue: 52, trend: 'up', riskLevel: 'low' },
    { metric: 'Dikkat Süresi (dk)', currentValue: 12, predictedValue: 10, trend: 'down', riskLevel: 'high' },
    { metric: 'Matematik İşlem Doğruluğu', currentValue: 65, predictedValue: 68, trend: 'stable', riskLevel: 'medium' }
];

const generateAnomalies = (): Anomaly[] => [
    {
        id: 'a1',
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        type: 'performance_drop',
        severity: 'high',
        description: 'Son 3 görsel algı testinde ani performans düşüşü (%40).',
        detectedBy: 'ML_Algorithm_v2'
    },
    {
        id: 'a2',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        type: 'behavioral_change',
        severity: 'medium',
        description: 'Sabah saatlerinde yapılan derslerde katılım %20 azaldı.',
        detectedBy: 'Statistical_Analysis'
    }
];

const generateRecommendations = (): Recommendation[] => [
    {
        id: 'r1',
        title: 'Fonolojik Farkındalık Egzersizleri (Seviye 2)',
        type: 'activity',
        matchScore: 95,
        rationale: 'İşitsel işlemleme güçlüğünü desteklemek için en uygun aktivite.',
        actionUrl: '/activities/phonology'
    },
    {
        id: 'r2',
        title: 'Metin Okuma Desteği (TTS) Kullanımı',
        type: 'strategy',
        matchScore: 88,
        rationale: 'Okuma hızındaki düşüşü kompanse etmek için yardımcı teknoloji önerisi.',
    },
    {
        id: 'r3',
        title: 'Görsel Zamanlayıcı',
        type: 'resource',
        matchScore: 82,
        rationale: 'Dikkat süresi yönetimi için Pomodoro tekniği entegrasyonu.',
    }
];

interface IEPModuleProps {
    student: AdvancedStudent;
    onUpdate?: (updatedIEP: any) => void;
}

export const IEPModule: React.FC<IEPModuleProps> = ({ student, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'analysis' | 'goals' | 'recommendations' | 'reports'>('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    
    // Derived AI Data (Memoized to simulate static fetch)
    const aiInsights = useMemo(() => generateAIInsights(student), [student]);
    const predictions = useMemo(() => generatePredictions(), []);
    const anomalies = useMemo(() => generateAnomalies(), []);
    const recommendations = useMemo(() => generateRecommendations(), []);

    // Mock Chart Data
    const radarData = [
        { label: 'Dikkat', value: 45 },
        { label: 'Hafıza', value: 60 },
        { label: 'Görsel', value: 95 },
        { label: 'İşitsel', value: 30 },
        { label: 'Dil', value: 70 },
        { label: 'Hız', value: 50 },
    ];

    const lineData = Array.from({ length: 6 }).map((_, i) => ({
        date: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        attention: 40 + Math.random() * 20,
        reading: 30 + i * 5 + Math.random() * 5,
        math: 50 + Math.random() * 10
    }));

    const TabButton = ({ id, icon, label }: { id: any, icon: string, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all
                ${activeTab === id 
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg scale-105' 
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
        >
            <i className={`fa-solid ${icon}`}></i>
            {label}
        </button>
    );

    const InsightCard = ({ insight }: { insight: AIInsight }) => (
        <div className={`p-4 rounded-xl border-l-4 ${
            insight.type === 'strength' ? 'bg-emerald-50 border-emerald-500' :
            insight.type === 'weakness' ? 'bg-amber-50 border-amber-500' :
            insight.type === 'threat' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
        } mb-3`}>
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-zinc-900 text-sm">{insight.title}</h4>
                <span className="text-[10px] font-bold bg-white/50 px-2 py-1 rounded text-zinc-600">
                    %{insight.confidence} Güven
                </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">{insight.description}</p>
            <div className="mt-2 flex gap-1">
                {insight.source.map((s, i) => (
                    <span key={i} className="text-[9px] uppercase font-bold text-zinc-400 bg-white/50 px-1.5 py-0.5 rounded">
                        {s}
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col font-['Lexend'] bg-zinc-50 dark:bg-black/50">
            {/* Header / Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 shrink-0">
                <TabButton id="dashboard" icon="fa-chart-pie" label="BEP Paneli" />
                <TabButton id="analysis" icon="fa-brain" label="AI Analiz & Profil" />
                <TabButton id="goals" icon="fa-bullseye" label="Hedefler (SMART)" />
                <TabButton id="recommendations" icon="fa-lightbulb" label="Öneriler" />
                <TabButton id="reports" icon="fa-file-pdf" label="Raporlar" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Anomalies & Alerts */}
                        {anomalies.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                <h3 className="text-red-600 font-bold text-sm flex items-center gap-2 mb-4">
                                    <i className="fa-solid fa-triangle-exclamation animate-pulse"></i>
                                    Kritik Tespitler ve Anomaliler
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {anomalies.map(anomaly => (
                                        <div key={anomaly.id} className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-red-700 uppercase tracking-wider">{anomaly.type.replace('_', ' ')}</span>
                                                <span className="text-[10px] text-red-400">{new Date(anomaly.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mt-1">{anomaly.description}</p>
                                            <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-400">
                                                <i className="fa-solid fa-robot"></i> {anomaly.detectedBy}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Quick Stats & Predictions */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Gelecek Tahminleri (30 Gün)</h3>
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

                                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                    <h3 className="font-bold text-lg relative z-10">BEP İlerlemesi</h3>
                                    <div className="mt-4 relative z-10">
                                        <div className="flex justify-between text-sm mb-2 opacity-90">
                                            <span>Genel Başarı</span>
                                            <span className="font-bold">%68</span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                                            <div className="bg-white h-full rounded-full" style={{ width: '68%' }}></div>
                                        </div>
                                        <p className="mt-4 text-xs opacity-75 leading-relaxed">
                                            Öğrenci, belirlenen akademik hedeflerin %68'ini tamamladı. Davranışsal hedeflerde %12 artış gözlemlendi.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Charts */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center">
                                    <h3 className="font-bold text-zinc-900 dark:text-white mb-2 w-full text-left text-sm">Bilişsel Profil (Radar)</h3>
                                    <div className="w-full h-64">
                                        <RadarChart data={radarData} />
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                    <h3 className="font-bold text-zinc-900 dark:text-white mb-2 text-sm">Gelişim Trendi</h3>
                                    <div className="w-full h-64">
                                        <LineChart 
                                            data={lineData} 
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

                {/* ANALYSIS TAB */}
                {activeTab === 'analysis' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-black text-xl text-zinc-900 dark:text-white mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                                AI Tespitleri
                            </h3>
                            <div className="space-y-4">
                                {aiInsights.map((insight, i) => (
                                    <InsightCard key={i} insight={insight} />
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                                <h3 className="font-bold text-lg mb-4">NLP Duygu Analizi (Son 1 Hafta)</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold w-20 text-right text-zinc-500">Motivasyon</span>
                                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[75%]"></div>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white">%75</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold w-20 text-right text-zinc-500">Kaygı</span>
                                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 w-[45%]"></div>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white">%45</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold w-20 text-right text-zinc-500">Özgüven</span>
                                        <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[60%]"></div>
                                        </div>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-white">%60</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-zinc-500 italic border-t pt-4 border-zinc-100 dark:border-zinc-800">
                                    "Öğrenci son okuma kayıtlarında daha akıcı bir ton kullandı ancak zor kelimelerde duraksama süresi arttı. Ses tonundaki titreme, sınav baskısına işaret ediyor olabilir."
                                </p>
                            </div>

                            <div className="bg-zinc-900 text-white p-6 rounded-2xl">
                                <h3 className="font-bold text-lg mb-2">Öğrenme Stili Analizi</h3>
                                <div className="flex items-center justify-center py-6">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#444" strokeWidth="3.8" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 12.6 6.3" fill="none" stroke="#6366f1" strokeWidth="3.8" strokeDasharray="60, 100" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black">Görsel</span>
                                            <span className="text-xs opacity-70">%60 Baskın</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-zinc-400">
                                    Materyal seçiminde görsel ağırlıklı içerikler (video, infografik) %40 daha yüksek başarı sağlıyor.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* GOALS TAB */}
                {activeTab === 'goals' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-zinc-900 dark:text-white">Bireyselleştirilmiş Hedefler</h3>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 flex items-center gap-2">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                AI ile Hedef Oluştur
                            </button>
                        </div>

                        <div className="space-y-4">
                            {student.iep?.goals?.map(goal => (
                                <div key={goal.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${goal.status === 'achieved' ? 'bg-emerald-500' : goal.status === 'in_progress' ? 'bg-amber-500' : 'bg-zinc-300'}`}></span>
                                            <h4 className="font-bold text-lg text-zinc-900 dark:text-white">{goal.title}</h4>
                                            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase rounded">{goal.category}</span>
                                        </div>
                                        <button className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors">
                                            <i className="fa-solid fa-ellipsis"></i>
                                        </button>
                                    </div>
                                    
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 pl-6 border-l-2 border-zinc-100 dark:border-zinc-800">
                                        {goal.description}
                                    </p>

                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl mb-4">
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-zinc-500">İlerleme Durumu</span>
                                            <span className="text-indigo-600">% {goal.progress}</span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${goal.progress}%` }}></div>
                                        </div>
                                    </div>

                                    {/* AI Suggestion inside Goal */}
                                    <div className="flex items-center gap-3 text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                        <i className="fa-solid fa-robot"></i>
                                        <span className="font-bold">Öneri:</span>
                                        <span className="truncate">Bu hedef için görsel destekli materyal kullanımı başarıyı %20 artırabilir.</span>
                                    </div>
                                </div>
                            ))}
                            
                            {(!student.iep?.goals || student.iep.goals.length === 0) && (
                                <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                    <i className="fa-solid fa-bullseye text-4xl text-zinc-300 mb-4"></i>
                                    <p className="text-zinc-500 font-medium">Henüz hedef tanımlanmamış.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* RECOMMENDATIONS TAB */}
                {activeTab === 'recommendations' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map(rec => (
                            <div key={rec.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                                        ${rec.type === 'activity' ? 'bg-purple-100 text-purple-600' : 
                                          rec.type === 'strategy' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <i className={`fa-solid ${
                                            rec.type === 'activity' ? 'fa-gamepad' : 
                                            rec.type === 'strategy' ? 'fa-chess-knight' : 'fa-book'
                                        }`}></i>
                                    </div>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-black">
                                        %{rec.matchScore} Eşleşme
                                    </span>
                                </div>
                                <h4 className="font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">{rec.title}</h4>
                                <p className="text-xs text-zinc-500 mb-4 line-clamp-3">{rec.rationale}</p>
                                <button className="w-full py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-colors">
                                    Detayları Gör
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-200 dark:border-zinc-800">
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <i className="fa-solid fa-file-invoice text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Akıllı Rapor Oluşturucu</h3>
                        <p className="text-zinc-500 max-w-md mx-auto mb-8">
                            Seçilen tarih aralığı için tüm AI analizlerini, ilerleme grafiklerini ve öğretmen notlarını içeren kapsamlı bir PDF raporu oluşturun.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-sm transition-colors">
                                Önizleme
                            </button>
                            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                                <i className="fa-solid fa-download mr-2"></i>
                                Raporu İndir
                            </button>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};
