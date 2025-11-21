
import React, { useState, useEffect, useRef } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType, TestCategory } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
}

const steps = ['Giriş', 'Profil', 'Okuma', 'Matematik', 'Dikkat', 'Görsel', 'Gözlem', 'Analiz', 'Sonuç'];

// --- RADAR CHART COMPONENT ---
const RadarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const angleStep = (Math.PI * 2) / data.length;

    const getCoords = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2; // Start from top
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    const points = data.map((d, i) => getCoords(d.value, i)).map(p => `${p.x},${p.y}`).join(' ');
    const bgPoints = data.map((_, i) => getCoords(100, i)).map(p => `${p.x},${p.y}`).join(' ');

    return (
        <svg width={size} height={size} className="mx-auto">
            {/* Background Grid */}
            {[20, 40, 60, 80, 100].map((level, idx) => {
                const pts = data.map((_, i) => getCoords(level, i)).map(p => `${p.x},${p.y}`).join(' ');
                return <polygon key={idx} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
            })}
            {/* Axes */}
            {data.map((_, i) => {
                const p = getCoords(100, i);
                return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />;
            })}
            {/* Data Area */}
            <polygon points={points} fill="rgba(99, 102, 241, 0.3)" stroke="#4f46e5" strokeWidth="2" />
            {/* Labels & Dots */}
            {data.map((d, i) => {
                const p = getCoords(d.value, i);
                const labelP = getCoords(115, i);
                return (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#4f46e5" />
                        <text x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-zinc-600 dark:fill-zinc-300">
                            {d.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

// --- PROGRESS BAR COMPONENT ---
const TestProgress = ({ current, total, label }: { current: number; total: number; label: string }) => {
    const progress = Math.min(100, Math.max(0, ((current + 1) / total) * 100));
    return (
        <div className="w-full mb-8 px-4">
            <div className="flex justify-between text-xs font-bold uppercase text-zinc-500 mb-2 tracking-wider">
                <span>{label}</span>
                <span>{current + 1} / {total}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<AssessmentProfile>({
        age: 7, grade: '1. Sınıf', observations: [], testResults: {}
    });
    const [report, setReport] = useState<AssessmentReport | null>(null);

    // --- TEST STATES ---
    const [testState, setTestState] = useState({
        score: 0, total: 0, startTime: 0, items: [] as any[], currentIndex: 0,
    });

    // --- HELPER: Start a Test Phase ---
    const startTestPhase = (items: any[]) => {
        setTestState({ score: 0, total: items.length, startTime: Date.now(), items, currentIndex: 0 });
    };

    const handleTestAnswer = (isCorrect: boolean, category: TestCategory, testName: string) => {
        const nextScore = isCorrect ? testState.score + 1 : testState.score;
        
        if (testState.currentIndex < testState.items.length - 1) {
            setTestState(prev => ({ ...prev, score: nextScore, currentIndex: prev.currentIndex + 1 }));
        } else {
            // Test Finished
            const duration = Math.round((Date.now() - testState.startTime) / 1000);
            setProfile(prev => ({
                ...prev,
                testResults: {
                    ...prev.testResults,
                    [category]: {
                        id: category,
                        name: testName,
                        score: nextScore,
                        total: testState.total,
                        accuracy: (nextScore / testState.total) * 100,
                        duration,
                        timestamp: Date.now()
                    }
                }
            }));
            setCurrentStep(prev => prev + 1);
        }
    };

    // --- INIT TESTS ---
    useEffect(() => {
        if (currentStep === 2) { // Reading
            startTestPhase([
                { q: 'masa', isReal: true }, { q: 'kipat', isReal: false },
                { q: 'elma', isReal: true }, { q: 'çilek', isReal: true },
                { q: 'televizyon', isReal: true }, { q: 'kalem', isReal: true },
                { q: 'filit', isReal: false }, { q: 'bardo', isReal: false },
                { q: ' sandalye', isReal: true }, { q: 'zort', isReal: false }
            ]);
        } else if (currentStep === 3) { // Math
            startTestPhase([
                { q: '3 + 2 = ?', opts: [4, 5, 6], a: 5 }, { q: '7 - 4 = ?', opts: [2, 3, 4], a: 3 },
                { q: '5 + 5 = ?', opts: [10, 9, 11], a: 10 }, { q: '8 - 0 = ?', opts: [0, 8, 9], a: 8 },
                { q: 'En büyük hangisi?', opts: [12, 9, 15], a: 15 },
                { q: '10 + 10 = ?', opts: [20, 100, 10], a: 20 }
            ]);
        } else if (currentStep === 4) { // Attention
            // Simulating Grid Clicks: Just random checks for now or simplified version
            startTestPhase(Array(10).fill(0).map((_,i) => ({ q: 'b' }))); // Simplified logic handled in render
        } else if (currentStep === 5) { // Visual
            startTestPhase([
                { q: 'triangle', opts: ['square', 'triangle', 'circle'], a: 'triangle' },
                { q: 'star', opts: ['star', 'pentagon', 'hexagon'], a: 'star' },
                { q: 'circle', opts: ['oval', 'circle', 'sphere'], a: 'circle' },
                { q: 'square', opts: ['rect', 'square', 'diamond'], a: 'square' },
                { q: 'hexagon', opts: ['pentagon', 'hexagon', 'octagon'], a: 'hexagon' }
            ]);
        } else if (currentStep === 7) { // Analysis Trigger
            handleFinish();
        }
    }, [currentStep]);

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            const result = await generateAssessmentReport(profile);
            setReport(result);
            setIsLoading(false);
            setCurrentStep(8);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setCurrentStep(6); // Retry from observations
        }
    };

    const ObservationList = ({ category }: { category: string }) => {
        const items = [
            "Okurken satır atlıyor", "b-d harflerini karıştırıyor", "Heceleyerek okuyor", 
            "Yazısı okunaksız", "Tahtadan geçirmekte zorlanıyor", "İşlem hatası yapıyor", 
            "Sağ-sol karıştırıyor", "Çabuk sıkılıyor", "Eşya kaybediyor"
        ];
        return (
            <div className="grid grid-cols-1 gap-2">
                {items.map((obs, i) => (
                    <button key={i} onClick={() => {
                        setProfile(p => ({...p, observations: p.observations.includes(obs) ? p.observations.filter(o=>o!==obs) : [...p.observations, obs]}))
                    }} className={`p-3 text-left border rounded-lg ${profile.observations.includes(obs) ? 'bg-indigo-100 border-indigo-500 text-indigo-900' : 'bg-white hover:bg-gray-50'}`}>
                        {profile.observations.includes(obs) && <i className="fa-solid fa-check mr-2"></i>} {obs}
                    </button>
                ))}
            </div>
        );
    };

    // --- RENDER ---
    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
            {/* Enhanced Stepper Header */}
            <div className="px-4 py-6 bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 shadow-sm z-10">
                <div className="flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto gap-4">
                    <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors font-bold text-sm flex items-center self-start md:self-center">
                        <i className="fa-solid fa-arrow-left mr-2"></i>Çıkış
                    </button>
                    
                    <div className="flex-1 w-full md:mx-8 overflow-x-auto no-scrollbar py-2">
                        <div className="flex items-center justify-between relative min-w-[300px]">
                            {/* Connecting Line */}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-zinc-200 dark:bg-zinc-700 -z-10 rounded-full"></div>
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
                            
                            {steps.map((s, i) => {
                                const isCompleted = i < currentStep;
                                const isActive = i === currentStep;
                                // Show fewer steps on mobile to save space if needed, currently showing all dot style
                                return (
                                    <div key={i} className="flex flex-col items-center relative group cursor-default">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                                            isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                                            isActive ? 'bg-indigo-600 border-indigo-600 text-white scale-125 shadow-lg ring-4 ring-indigo-100 dark:ring-indigo-900' : 
                                            'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-400'
                                        }`}>
                                            {isCompleted ? <i className="fa-solid fa-check"></i> : i + 1}
                                        </div>
                                        {/* Tooltip / Label */}
                                        <span className={`absolute top-10 text-[10px] font-bold whitespace-nowrap px-2 py-1 rounded transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 translate-y-0 opacity-100' : 'text-zinc-400 opacity-0 -translate-y-2 hidden md:block'}`}>
                                            {s}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="w-16 hidden md:block"></div> {/* Spacer */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden relative">
                    
                    {/* 0: INTRO */}
                    {currentStep === 0 && (
                        <div className="p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900">
                            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-lg">
                                <i className="fa-solid fa-rocket text-5xl text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black mb-4 text-zinc-800 dark:text-zinc-100">Bilişsel Değerlendirme</h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-10 max-w-lg leading-relaxed">
                                4 temel alanda (Okuma, Matematik, Dikkat, Görsel) çocuğunuzun becerilerini ölçen interaktif ve eğlenceli bir test serisine başlıyorsunuz.
                            </p>
                            <button onClick={() => setCurrentStep(1)} className="btn-primary text-lg px-10 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all">
                                Başla <i className="fa-solid fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    )}

                    {/* 1: PROFILE */}
                    {currentStep === 1 && (
                        <div className="p-8 md:p-12 flex flex-col flex-1 justify-center max-w-lg mx-auto w-full">
                            <h3 className="text-2xl font-bold mb-8 text-center">Öğrenci Bilgileri</h3>
                            <div className="space-y-8">
                                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-6 rounded-xl border border-zinc-200 dark:border-zinc-600">
                                    <label className="block font-bold mb-4 text-lg flex justify-between">
                                        <span>Yaş</span>
                                        <span className="text-indigo-600">{profile.age}</span>
                                    </label>
                                    <input 
                                        type="range" min="5" max="15" 
                                        value={profile.age} 
                                        onChange={e => setProfile({...profile, age: +e.target.value})} 
                                        className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                    />
                                    <div className="flex justify-between text-xs text-zinc-400 mt-2 font-bold">
                                        <span>5</span><span>10</span><span>15</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold mb-3 text-lg">Sınıf Seviyesi</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => (
                                            <button 
                                                key={g} 
                                                onClick={() => setProfile({...profile, grade: g})} 
                                                className={`p-3 border-2 rounded-xl font-medium transition-all ${profile.grade === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-600 hover:border-indigo-300'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setCurrentStep(2)} className="btn-primary mt-10 py-4 text-lg rounded-xl shadow-md">Teste Başla</button>
                        </div>
                    )}

                    {/* 2: READING TEST (Lexical) */}
                    {currentStep === 2 && (
                        <div className="flex flex-col h-full">
                            <div className="pt-8">
                                <TestProgress current={testState.currentIndex} total={testState.total} label="Okuma Testi" />
                            </div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <h3 className="text-xl font-bold text-zinc-400 mb-8 uppercase tracking-widest">Bu Kelime Gerçek mi?</h3>
                                <div className="text-5xl md:text-7xl font-black mb-12 p-12 bg-zinc-100 dark:bg-zinc-700/50 rounded-3xl w-full shadow-inner text-zinc-800 dark:text-zinc-100 transition-all duration-300 transform scale-100 hover:scale-105 cursor-default">
                                    {testState.items[testState.currentIndex]?.q}
                                </div>
                                <div className="flex gap-6 w-full max-w-md">
                                    <button onClick={() => handleTestAnswer(false, 'reading', 'Okuma')} className="flex-1 p-6 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 font-bold rounded-2xl border-b-4 border-red-200 dark:border-red-800 hover:translate-y-1 active:border-b-0 transition-all text-xl shadow-sm">
                                        <i className="fa-solid fa-xmark mr-2"></i> HAYIR
                                    </button>
                                    <button onClick={() => handleTestAnswer(true, 'reading', 'Okuma')} className="flex-1 p-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 font-bold rounded-2xl border-b-4 border-green-200 dark:border-green-800 hover:translate-y-1 active:border-b-0 transition-all text-xl shadow-sm">
                                        <i className="fa-solid fa-check mr-2"></i> EVET
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3: MATH TEST */}
                    {currentStep === 3 && (
                        <div className="flex flex-col h-full">
                            <div className="pt-8">
                                <TestProgress current={testState.currentIndex} total={testState.total} label="Matematik Testi" />
                            </div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <h3 className="text-xl font-bold text-zinc-400 mb-8 uppercase tracking-widest">İşlemi Çöz</h3>
                                <div className="text-5xl md:text-6xl font-bold mb-12 text-zinc-800 dark:text-zinc-100 font-mono bg-zinc-50 dark:bg-zinc-900 p-8 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600">
                                    {testState.items[testState.currentIndex]?.q}
                                </div>
                                <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                                    {testState.items[testState.currentIndex]?.opts.map((opt: number) => (
                                        <button key={opt} onClick={() => handleTestAnswer(opt === testState.items[testState.currentIndex].a, 'math', 'Matematik')} className="p-6 bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 text-3xl font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all transform hover:-translate-y-1">
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4: ATTENTION TEST */}
                    {currentStep === 4 && (
                        <div className="flex flex-col h-full">
                            <div className="pt-8">
                                <TestProgress current={testState.score} total={25} label="Dikkat Testi (b harflerini bul)" />
                            </div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <div className="grid grid-cols-5 gap-3 md:gap-4 mb-8 bg-zinc-100 dark:bg-zinc-900/50 p-6 rounded-2xl">
                                    {Array.from({length: 25}).map((_, i) => {
                                        const char = Math.random() > 0.4 ? 'd' : 'b'; // More distractors
                                        return (
                                            <button key={i} onClick={(e) => {
                                                const btn = e.currentTarget;
                                                if (btn.disabled) return;
                                                btn.disabled = true;
                                                if(char === 'b') { 
                                                    btn.classList.add('bg-green-500', 'text-white', 'border-green-600');
                                                    btn.classList.remove('bg-white', 'hover:bg-zinc-50');
                                                    setTestState(p => ({...p, score: p.score + 1}));
                                                } else {
                                                    btn.classList.add('bg-red-500', 'text-white', 'border-red-600');
                                                    btn.classList.remove('bg-white', 'hover:bg-zinc-50');
                                                }
                                            }} className="w-12 h-12 md:w-16 md:h-16 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl text-3xl font-bold bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center justify-center transition-all font-serif pb-1">
                                                {char}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button onClick={() => handleTestAnswer(true, 'attention', 'Dikkat')} className="btn-primary w-full max-w-xs py-3 rounded-xl shadow-lg">Tamamla</button>
                            </div>
                        </div>
                    )}

                    {/* 5: VISUAL TEST */}
                    {currentStep === 5 && (
                        <div className="flex flex-col h-full">
                            <div className="pt-8">
                                <TestProgress current={testState.currentIndex} total={testState.total} label="Görsel Algı Testi" />
                            </div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <h3 className="text-xl font-bold text-zinc-400 mb-8 uppercase tracking-widest">Aynısını Bul</h3>
                                <div className="mb-10 p-8 border-4 border-indigo-100 dark:border-zinc-600 rounded-3xl inline-block bg-white dark:bg-zinc-800 shadow-lg">
                                    <i className={`fa-solid fa-${testState.items[testState.currentIndex]?.q} text-8xl text-indigo-500`}></i>
                                </div>
                                <div className="flex gap-6 justify-center w-full max-w-2xl">
                                    {testState.items[testState.currentIndex]?.opts.map((opt: string) => (
                                        <button key={opt} onClick={() => handleTestAnswer(opt === testState.items[testState.currentIndex].a, 'visual', 'Görsel Algı')} className="p-6 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 transition-all flex-1 shadow-sm group">
                                            <i className={`fa-solid fa-${opt} text-5xl text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-500 transition-colors`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 6: OBSERVATIONS */}
                    {currentStep === 6 && (
                        <div className="p-8 flex flex-col flex-1 h-full">
                            <h3 className="text-2xl font-bold mb-2 text-center">Gözlem Formu</h3>
                            <p className="text-center text-zinc-500 mb-6 text-sm">Çocuğunuzda gözlemlediğiniz durumları işaretleyiniz.</p>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                <ObservationList category="general" />
                            </div>
                            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                                <button onClick={() => setCurrentStep(7)} className="btn-primary w-full py-4 text-lg shadow-lg rounded-xl">Analizi Başlat</button>
                            </div>
                        </div>
                    )}

                    {/* 7: LOADING */}
                    {currentStep === 7 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                <i className="fa-solid fa-brain absolute inset-0 flex items-center justify-center text-3xl text-indigo-600"></i>
                            </div>
                            <h3 className="text-xl font-bold animate-pulse text-zinc-800 dark:text-zinc-100">Yapay Zeka Raporu Hazırlıyor...</h3>
                            <p className="text-zinc-500 mt-2">Test sonuçları ve gözlemler analiz ediliyor.</p>
                        </div>
                    )}

                    {/* 8: REPORT */}
                    {currentStep === 8 && report && (
                        <div className="flex flex-col h-full">
                            <div className="p-8 bg-indigo-600 text-white text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <h2 className="text-3xl font-bold mb-2 relative z-10">Sonuç Raporu</h2>
                                <p className="opacity-90 max-w-2xl mx-auto relative z-10 text-indigo-100">{report.overallSummary}</p>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 bg-zinc-50 dark:bg-zinc-900/50 custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    {/* Chart Section */}
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm text-center border border-zinc-200 dark:border-zinc-700">
                                        <h4 className="font-bold text-zinc-500 mb-6 uppercase tracking-wider text-sm">Beceriler ve Risk Analizi</h4>
                                        {report.chartData ? <RadarChart data={report.chartData} /> : <p>Grafik verisi yok.</p>}
                                    </div>

                                    {/* Strengths & Weaknesses */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800/50">
                                            <h4 className="font-bold text-green-800 dark:text-green-400 mb-4 flex items-center"><div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center mr-2"><i className="fa-solid fa-check"></i></div> Güçlü Yönler</h4>
                                            <ul className="space-y-2">
                                                {report.analysis.strengths.map((s, i) => (
                                                    <li key={i} className="flex items-start text-sm text-green-900 dark:text-green-200"><span className="mr-2">•</span>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800/50">
                                            <h4 className="font-bold text-red-800 dark:text-red-400 mb-4 flex items-center"><div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center mr-2"><i className="fa-solid fa-exclamation"></i></div> Destek Alanları</h4>
                                            <ul className="space-y-2">
                                                {report.analysis.weaknesses.map((s, i) => (
                                                    <li key={i} className="flex items-start text-sm text-red-900 dark:text-red-200"><span className="mr-2">•</span>{s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Roadmap */}
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                        <h4 className="font-bold text-xl mb-6 flex items-center"><i className="fa-solid fa-map-location-dot mr-2 text-indigo-500"></i>Önerilen Eğitim Rotası</h4>
                                        <div className="space-y-4">
                                            {report.roadmap.map((item, idx) => (
                                                <div key={idx} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">{idx + 1}</span>
                                                            <h5 className="font-bold text-indigo-600 dark:text-indigo-400">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.reason}</p>
                                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold"><i className="fa-regular fa-clock mr-1"></i>{item.frequency}</p>
                                                    </div>
                                                    <button onClick={() => onSelectActivity(item.activityId as ActivityType)} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md transition-colors w-full sm:w-auto">
                                                        Oluştur
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
