
import React, { useState, useEffect, useRef } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType, TestCategory } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
}

const steps = ['Giriş', 'Profil', 'Test 1: Okuma', 'Test 2: Matematik', 'Test 3: Dikkat', 'Test 4: Görsel', 'Gözlem', 'Analiz', 'Sonuç'];

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
                { q: 'filit', isReal: false }, { q: 'bardo', isReal: false }
            ]);
        } else if (currentStep === 3) { // Math
            startTestPhase([
                { q: '3 + 2 = ?', opts: [4, 5, 6], a: 5 }, { q: '7 - 4 = ?', opts: [2, 3, 4], a: 3 },
                { q: '5 + 5 = ?', opts: [10, 9, 11], a: 10 }, { q: '8 - 0 = ?', opts: [0, 8, 9], a: 8 },
                { q: 'En büyük hangisi?', opts: [12, 9, 15], a: 15 }
            ]);
        } else if (currentStep === 4) { // Attention
            // Simulating Grid Clicks: Just random checks for now or simplified version
            startTestPhase(Array(10).fill(0).map((_,i) => ({ q: 'b' }))); // Simplified logic handled in render
        } else if (currentStep === 5) { // Visual
            startTestPhase([
                { q: 'triangle', opts: ['square', 'triangle', 'circle'], a: 'triangle' },
                { q: 'star', opts: ['star', 'pentagon', 'hexagon'], a: 'star' },
                { q: 'circle', opts: ['oval', 'circle', 'sphere'], a: 'circle' },
                { q: 'square', opts: ['rect', 'square', 'diamond'], a: 'square' }
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
            {/* Header */}
            <div className="p-4 bg-white dark:bg-zinc-800 border-b flex justify-between items-center shadow-sm">
                <button onClick={onBack} className="text-zinc-500 hover:text-black font-bold"><i className="fa-solid fa-arrow-left"></i> Çıkış</button>
                <div className="flex gap-1">
                    {steps.map((s, i) => <div key={i} className={`w-2 h-2 rounded-full ${currentStep >= i ? 'bg-indigo-600' : 'bg-zinc-300'}`} />)}
                </div>
                <span className="font-bold text-indigo-600">{steps[currentStep]}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col">
                    
                    {/* 0: INTRO */}
                    {currentStep === 0 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <i className="fa-solid fa-rocket text-6xl text-indigo-500 mb-6 animate-bounce"></i>
                            <h2 className="text-3xl font-bold mb-4">Bilişsel Değerlendirme Bataryası</h2>
                            <p className="text-lg text-zinc-600 mb-8">4 temel alanda (Okuma, Matematik, Dikkat, Görsel) çocuğunuzun becerilerini ölçen interaktif bir test serisine başlıyorsunuz.</p>
                            <button onClick={() => setCurrentStep(1)} className="btn-primary text-xl px-8 py-4">Başla</button>
                        </div>
                    )}

                    {/* 1: PROFILE */}
                    {currentStep === 1 && (
                        <div className="p-8 flex flex-col flex-1 justify-center">
                            <h3 className="text-2xl font-bold mb-6 text-center">Öğrenci Bilgileri</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold mb-2">Yaş: {profile.age}</label>
                                    <input type="range" min="5" max="15" value={profile.age} onChange={e => setProfile({...profile, age: +e.target.value})} className="w-full accent-indigo-600" />
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Sınıf</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => (
                                            <button key={g} onClick={() => setProfile({...profile, grade: g})} className={`p-2 border rounded ${profile.grade === g ? 'bg-indigo-600 text-white' : ''}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setCurrentStep(2)} className="btn-primary mt-8">Teste Başla</button>
                        </div>
                    )}

                    {/* 2: READING TEST (Lexical) */}
                    {currentStep === 2 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-zinc-400 mb-8">KELİME Mİ? (Hızlı Karar Ver)</h3>
                            <div className="text-5xl font-bold mb-12 p-8 bg-zinc-100 rounded-xl w-full">
                                {testState.items[testState.currentIndex]?.q}
                            </div>
                            <div className="flex gap-6 w-full">
                                <button onClick={() => handleTestAnswer(false, 'reading', 'Okuma')} className="flex-1 p-4 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 text-xl">UYDURMA</button>
                                <button onClick={() => handleTestAnswer(true, 'reading', 'Okuma')} className="flex-1 p-4 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 text-xl">GERÇEK</button>
                            </div>
                        </div>
                    )}

                    {/* 3: MATH TEST */}
                    {currentStep === 3 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-zinc-400 mb-8">MATEMATİK (Doğru Cevabı Seç)</h3>
                            <div className="text-5xl font-bold mb-12">{testState.items[testState.currentIndex]?.q}</div>
                            <div className="grid grid-cols-3 gap-4 w-full">
                                {testState.items[testState.currentIndex]?.opts.map((opt: number) => (
                                    <button key={opt} onClick={() => handleTestAnswer(opt === testState.items[testState.currentIndex].a, 'math', 'Matematik')} className="p-6 bg-blue-50 border-2 border-blue-200 text-3xl font-bold rounded-xl hover:bg-blue-100">
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 4: ATTENTION TEST */}
                    {currentStep === 4 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-zinc-400 mb-4">DİKKAT (b Harfini Bul)</h3>
                            <div className="grid grid-cols-5 gap-2 mb-8">
                                {Array.from({length: 25}).map((_, i) => {
                                    const char = Math.random() > 0.3 ? 'd' : 'b';
                                    return (
                                        <button key={i} onClick={(e) => {
                                            (e.target as HTMLButtonElement).disabled = true;
                                            if(char === 'b') { 
                                                (e.target as HTMLButtonElement).style.backgroundColor = '#dcfce7'; // green
                                                setTestState(p => ({...p, score: p.score + 1}));
                                            } else {
                                                (e.target as HTMLButtonElement).style.backgroundColor = '#fee2e2'; // red
                                            }
                                        }} className="w-12 h-12 border-2 rounded text-2xl font-bold bg-white hover:bg-zinc-50 flex items-center justify-center">
                                            {char}
                                        </button>
                                    )
                                })}
                            </div>
                            <button onClick={() => handleTestAnswer(true, 'attention', 'Dikkat')} className="btn-primary w-full">Tamamla</button>
                        </div>
                    )}

                    {/* 5: VISUAL TEST */}
                    {currentStep === 5 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-zinc-400 mb-8">GÖRSEL EŞLEŞTİRME (Aynısını Bul)</h3>
                            <div className="mb-8 p-4 border-4 border-indigo-200 rounded-xl inline-block">
                                <i className={`fa-solid fa-${testState.items[testState.currentIndex]?.q} text-6xl`}></i>
                            </div>
                            <div className="flex gap-4 justify-center w-full">
                                {testState.items[testState.currentIndex]?.opts.map((opt: string) => (
                                    <button key={opt} onClick={() => handleTestAnswer(opt === testState.items[testState.currentIndex].a, 'visual', 'Görsel Algı')} className="p-4 border-2 rounded-xl hover:bg-zinc-100 text-4xl">
                                        <i className={`fa-solid fa-${opt}`}></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6: OBSERVATIONS */}
                    {currentStep === 6 && (
                        <div className="p-8 flex flex-col flex-1">
                            <h3 className="text-2xl font-bold mb-4">Gözlem Formu</h3>
                            <div className="flex-1 overflow-y-auto mb-6">
                                <ObservationList category="general" />
                            </div>
                            <button onClick={() => setCurrentStep(7)} className="btn-primary">Analizi Başlat</button>
                        </div>
                    )}

                    {/* 7: LOADING */}
                    {currentStep === 7 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                            <i className="fa-solid fa-gear fa-spin text-5xl text-zinc-300 mb-4"></i>
                            <h3 className="text-xl font-bold animate-pulse">Yapay Zeka Raporu Hazırlıyor...</h3>
                        </div>
                    )}

                    {/* 8: REPORT */}
                    {currentStep === 8 && report && (
                        <div className="flex flex-col h-full">
                            <div className="p-6 bg-indigo-600 text-white text-center">
                                <h2 className="text-3xl font-bold mb-2">Sonuç Raporu</h2>
                                <p className="opacity-90">{report.overallSummary}</p>
                            </div>
                            <div className="p-6 overflow-y-auto flex-1 bg-zinc-50">
                                <div className="bg-white p-6 rounded-xl shadow-sm mb-6 text-center">
                                    <h4 className="font-bold text-zinc-500 mb-4">Beceriler ve Risk Analizi</h4>
                                    {report.chartData ? <RadarChart data={report.chartData} /> : <p>Grafik verisi yok.</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                        <h4 className="font-bold text-green-800 mb-2"><i className="fa-solid fa-check-circle"></i> Güçlü Yönler</h4>
                                        <ul className="list-disc list-inside text-sm text-green-900">{report.analysis.strengths.map(s => <li key={s}>{s}</li>)}</ul>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                                        <h4 className="font-bold text-red-800 mb-2"><i className="fa-solid fa-exclamation-circle"></i> Destek Alanları</h4>
                                        <ul className="list-disc list-inside text-sm text-red-900">{report.analysis.weaknesses.map(s => <li key={s}>{s}</li>)}</ul>
                                    </div>
                                </div>

                                <h4 className="font-bold text-xl mb-4">Önerilen Eğitim Rotası</h4>
                                <div className="space-y-4">
                                    {report.roadmap.map((item, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
                                            <div>
                                                <h5 className="font-bold text-indigo-600">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5>
                                                <p className="text-xs text-zinc-500">{item.reason}</p>
                                            </div>
                                            <button onClick={() => onSelectActivity(item.activityId as ActivityType)} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200">
                                                Oluştur
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
