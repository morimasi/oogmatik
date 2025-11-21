
import React, { useState, useEffect, useRef } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
}

const steps = ['Giriş', 'Profil', 'Test', 'Gözlem', 'Analiz', 'Sonuç'];

// Observation Categories
const OBSERVATION_CATEGORIES = {
    reading: {
        title: "Okuma Becerileri",
        icon: "fa-solid fa-book-open",
        items: [
            "Okurken satır atlıyor veya yerini kaybediyor",
            "b-d, p-q gibi harfleri karıştırıyor",
            "Heceleyerek veya çok yavaş okuyor",
            "Okuduğunu anlamakta zorlanıyor",
            "Kelimelerin sonunu uydurarak okuyor",
            "Yüksek sesle okumaktan kaçınıyor"
        ]
    },
    writing: {
        title: "Yazma Becerileri",
        icon: "fa-solid fa-pen-fancy",
        items: [
            "Yazısı okunaksız ve düzensiz",
            "Tahtadan deftere geçirirken çok zorlanıyor",
            "Noktalama işaretlerini kullanmıyor",
            "Harfleri veya rakamları ters yazıyor (3, 7, S gibi)",
            "Kelime aralarında boşluk bırakmıyor",
            "Kalemi çok sıkı tutuyor, çabuk yoruluyor"
        ]
    },
    math: {
        title: "Matematik",
        icon: "fa-solid fa-calculator",
        items: [
            "Basit toplama işlemlerinde parmak sayıyor",
            "Saati öğrenmekte zorlanıyor",
            "Çarpım tablosunu ezberleyemiyor",
            "Yönleri (sağ-sol) karıştırıyor",
            "Sayı basamaklarını karıştırıyor (12 yerine 21)"
        ]
    },
    behavior: {
        title: "Dikkat ve Davranış",
        icon: "fa-solid fa-brain",
        items: [
            "Çabuk sıkılıyor, başladığı işi bitiremiyor",
            "Eşyalarını sık sık kaybediyor veya unutuyor",
            "Yönergeleri takip etmekte zorlanıyor (Ardışık komutlar)",
            "Sırasını bekleyemiyor, sabırsız",
            "Çok hareketli, yerinde duramıyor"
        ]
    }
};

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<AssessmentProfile>({
        age: 7,
        grade: '1. Sınıf',
        observations: []
    });
    const [report, setReport] = useState<AssessmentReport | null>(null);
    
    // Interactive Test State
    const [testStarted, setTestStarted] = useState(false);
    const [testGrid, setTestGrid] = useState<string[]>([]);
    const [testScore, setTestScore] = useState(0);
    const [testErrors, setTestErrors] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [testCompleted, setTestCompleted] = useState(false);
    const targetLetter = 'b';
    const distractorLetters = ['d', 'p', 'q'];

    const gradeOptions = ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'];
    const [activeObsTab, setActiveObsTab] = useState<keyof typeof OBSERVATION_CATEGORIES>('reading');

    // --- Interactive Test Logic ---
    useEffect(() => {
        if (currentStep === 2 && !testStarted && !testCompleted) {
            // Initialize Grid
            const gridSize = 20;
            const grid = Array.from({ length: gridSize }, () => {
                return Math.random() > 0.3 
                    ? distractorLetters[Math.floor(Math.random() * distractorLetters.length)] 
                    : targetLetter;
            });
            setTestGrid(grid);
        }
    }, [currentStep]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (testStarted && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (testStarted && timeLeft === 0) {
            finishTest();
        }
        return () => clearInterval(timer);
    }, [testStarted, timeLeft]);

    const startTest = () => {
        setTestStarted(true);
        setTestScore(0);
        setTestErrors(0);
        setTimeLeft(30);
    };

    const handleCellClick = (letter: string, index: number) => {
        if (!testStarted || timeLeft === 0) return;
        
        // Prevent double clicking (simple hack: remove from grid visually or mark used? 
        // For simplicity, let's just allow clicking but maybe flash color)
        
        if (letter === targetLetter) {
            setTestScore(prev => prev + 1);
            // Visually remove or mark (in a real app). Here we just update score.
            // To prevent farming same cell, ideally we'd track clicked indices.
            // Implementing simple index tracking:
            const newGrid = [...testGrid];
            newGrid[index] = '✓'; // Mark as found
            setTestGrid(newGrid);
        } else if (letter !== '✓') {
            setTestErrors(prev => prev + 1);
            // Feedback? shake animation maybe
        }
    };

    const finishTest = () => {
        setTestStarted(false);
        setTestCompleted(true);
        // Save results to profile
        const totalTargets = testGrid.filter(l => l === targetLetter || l === '✓').length; // approximations since we overwrite
        // Re-calculate total targets from initial generation logic would be better, but for now:
        // Let's assume we found `testScore` items.
        
        setProfile(prev => ({
            ...prev,
            testResults: {
                testName: 'Harf Avı (b-d Ayrımı)',
                score: testScore,
                totalItems: 20, // Approx visual load
                accuracy: testScore > 0 ? (testScore / (testScore + testErrors)) * 100 : 0,
                durationSeconds: 30 - timeLeft,
                errorCount: testErrors
            }
        }));
        
        // Auto advance after brief delay
        setTimeout(() => setCurrentStep(3), 1500);
    };

    // --- Observation Logic ---
    const toggleObservation = (obs: string) => {
        setProfile(prev => {
            const exists = prev.observations.includes(obs);
            return {
                ...prev,
                observations: exists 
                    ? prev.observations.filter(o => o !== obs)
                    : [...prev.observations, obs]
            };
        });
    };

    // --- Report Generation ---
    const handleFinish = async () => {
        setCurrentStep(4); // Loading Analysis
        setIsLoading(true);
        try {
            const result = await generateAssessmentReport(profile);
            setReport(result);
            setIsLoading(false);
            setCurrentStep(5); // Results
        } catch (error) {
            console.error(error);
            alert("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            setIsLoading(false);
            setCurrentStep(3); // Go back to observation
        }
    };

    const getActivityTitle = (id: string) => ACTIVITIES.find(a => a.id === id)?.title || id;

    const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1 font-bold text-zinc-600 dark:text-zinc-300">
                <span>{label}</span>
                <span>{score}/100</span>
            </div>
            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color} transition-all duration-1000`} 
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4 flex items-center justify-between shadow-sm shrink-0">
                <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-2 text-sm font-bold">
                    <i className="fa-solid fa-arrow-left"></i> Çıkış
                </button>
                <div className="flex items-center gap-2 hidden sm:flex">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full ${currentStep >= idx ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>
                            {idx < steps.length - 1 && <div className={`w-4 h-0.5 ${currentStep > idx ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}></div>}
                        </div>
                    ))}
                </div>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    Öğrenme Güçlüğü Bataryası
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-4xl bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col min-h-[500px]">
                    
                    {/* STEP 0: INTRO */}
                    {currentStep === 0 && (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full flex-1">
                            <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 text-indigo-600 text-6xl animate-bounce">
                                <i className="fa-solid fa-user-doctor"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">Akıllı Değerlendirme Asistanı</h2>
                            <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-8 max-w-lg">
                                Bu modül, öğrencinizin güçlü ve desteklenmesi gereken yönlerini belirlemenize yardımcı olur. İnteraktif testler ve yapay zeka destekli analiz sonucunda kişiselleştirilmiş bir eğitim rotası oluşturulacaktır.
                            </p>
                            <button onClick={() => setCurrentStep(1)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105">
                                Başla <i className="fa-solid fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    )}

                    {/* STEP 1: PROFILE */}
                    {currentStep === 1 && (
                        <div className="p-8 flex flex-col h-full flex-1">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 border-b pb-2">Öğrenci Profili</h3>
                            <div className="space-y-8 max-w-lg mx-auto w-full">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Yaş</label>
                                    <input 
                                        type="range" min="5" max="15" 
                                        value={profile.age} 
                                        onChange={(e) => setProfile({...profile, age: parseInt(e.target.value)})}
                                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="text-center font-bold text-xl mt-2 text-indigo-600">{profile.age} Yaş</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Sınıf Seviyesi</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {gradeOptions.map(g => (
                                            <button 
                                                key={g}
                                                onClick={() => setProfile({...profile, grade: g})}
                                                className={`p-3 rounded-lg border-2 font-bold text-sm transition-all ${profile.grade === g ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto flex justify-end pt-6">
                                <button onClick={() => setCurrentStep(2)} className="px-6 py-3 bg-zinc-900 dark:bg-zinc-700 text-white font-bold rounded-lg hover:opacity-90">İleri <i className="fa-solid fa-arrow-right ml-2"></i></button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INTERACTIVE TEST (LETTER HUNT) */}
                    {currentStep === 2 && (
                        <div className="p-8 flex flex-col h-full flex-1 items-center">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Dikkat Testi: Harf Avı</h3>
                            <p className="text-zinc-500 mb-6 text-center max-w-md">Aşağıdaki kutularda sadece <strong>"{targetLetter}"</strong> harflerine tıkla. Diğerlerine dokunma. Süren 30 saniye!</p>
                            
                            {!testStarted && !testCompleted ? (
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 mx-auto text-6xl font-dyslexic font-bold text-emerald-600">
                                        {targetLetter}
                                    </div>
                                    <button onClick={startTest} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xl shadow-lg transition-transform hover:scale-105">
                                        Testi Başlat
                                    </button>
                                </div>
                            ) : testCompleted ? (
                                <div className="text-center animate-fade-in">
                                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-blue-600 text-4xl">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <h4 className="text-xl font-bold mb-2">Test Tamamlandı!</h4>
                                    <p className="text-zinc-500">Sonuçlar kaydedildi. Diğer adıma geçiliyor...</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-lg">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-xl font-bold text-indigo-600">Skor: {testScore}</div>
                                        <div className={`text-xl font-bold px-4 py-1 rounded-full ${timeLeft < 10 ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>
                                            <i className="fa-regular fa-clock mr-2"></i>{timeLeft}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {testGrid.map((char, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => handleCellClick(char, idx)}
                                                disabled={char === '✓'}
                                                className={`aspect-square rounded-lg border-2 border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-3xl font-dyslexic font-bold shadow-sm transition-all ${char === '✓' ? 'bg-green-100 text-green-600 border-green-300' : 'bg-white dark:bg-zinc-700 hover:bg-zinc-50 active:scale-95 cursor-pointer'}`}
                                            >
                                                {char}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Skip button for testing or if user can't do it */}
                            {!testStarted && !testCompleted && (
                                <button onClick={() => setCurrentStep(3)} className="mt-8 text-sm text-zinc-400 underline">Bu adımı atla</button>
                            )}
                        </div>
                    )}

                    {/* STEP 3: OBSERVATIONS (CATEGORIZED) */}
                    {currentStep === 3 && (
                        <div className="flex flex-col h-full flex-1">
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                                <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Gözlem Envanteri</h3>
                                <p className="text-sm text-zinc-500">Çocuğunuzda sıkça gözlemlediğiniz durumları işaretleyiniz.</p>
                            </div>
                            
                            <div className="flex flex-1 overflow-hidden">
                                {/* Sidebar Tabs */}
                                <div className="w-1/4 min-w-[120px] border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
                                    {Object.entries(OBSERVATION_CATEGORIES).map(([key, cat]) => (
                                        <button
                                            key={key}
                                            onClick={() => setActiveObsTab(key as any)}
                                            className={`w-full p-4 text-left text-sm font-bold flex flex-col items-center justify-center gap-2 border-b border-zinc-100 dark:border-zinc-700/50 transition-colors ${activeObsTab === key ? 'bg-white dark:bg-zinc-800 text-indigo-600 border-l-4 border-l-indigo-600' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                        >
                                            <i className={`${cat.icon} text-xl`}></i>
                                            <span className="text-center">{cat.title}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Items Area */}
                                <div className="flex-1 p-6 overflow-y-auto">
                                    <div className="grid grid-cols-1 gap-3">
                                        {OBSERVATION_CATEGORIES[activeObsTab].items.map((obs, idx) => {
                                            const isSelected = profile.observations.includes(obs);
                                            return (
                                                <button 
                                                    key={idx}
                                                    onClick={() => toggleObservation(obs)}
                                                    className={`flex items-center p-4 rounded-xl border transition-all text-left ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/30'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300'}`}>
                                                        {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                                                    </div>
                                                    <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{obs}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-white dark:bg-zinc-800">
                                <button onClick={() => setCurrentStep(2)} className="text-zinc-500 font-bold hover:text-zinc-800">Geri</button>
                                <div className="text-sm font-medium text-zinc-400">
                                    {profile.observations.length} madde seçildi
                                </div>
                                <button 
                                    onClick={handleFinish} 
                                    disabled={profile.observations.length === 0 && !testCompleted}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Analizi Bitir <i className="fa-solid fa-wand-magic-sparkles ml-2"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: LOADING */}
                    {currentStep === 4 && (
                        <div className="p-8 flex flex-col items-center justify-center h-full text-center flex-1">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                <i className="fa-solid fa-brain absolute inset-0 flex items-center justify-center text-3xl text-indigo-600 animate-pulse"></i>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Veriler Analiz Ediliyor...</h3>
                            <p className="text-zinc-500 text-sm">Yapay zeka uzmanımız test sonuçlarını ve gözlemleri değerlendiriyor.</p>
                        </div>
                    )}

                    {/* STEP 5: RESULTS (REPORT) */}
                    {currentStep === 5 && report && (
                        <div className="flex flex-col h-full overflow-hidden flex-1">
                            {/* Report Header */}
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-indigo-50 dark:bg-indigo-900/20">
                                <div className="flex items-start gap-4">
                                    <div className="hidden sm:flex w-16 h-16 bg-white dark:bg-zinc-800 rounded-full items-center justify-center text-2xl shadow-sm text-indigo-600">
                                        <i className="fa-solid fa-file-medical-alt"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">Eğitsel Değerlendirme Raporu</h2>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">{report.overallSummary}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Left: Scores & Test Data */}
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm">
                                            <h4 className="font-bold mb-4 text-zinc-500 uppercase text-xs tracking-wider border-b pb-2">İhtiyaç Analizi</h4>
                                            <ScoreBar label="Okuma Becerileri" score={report.scores.reading} color="bg-blue-500" />
                                            <ScoreBar label="Yazma Becerileri" score={report.scores.writing} color="bg-green-500" />
                                            <ScoreBar label="Matematik" score={report.scores.math} color="bg-yellow-500" />
                                            <ScoreBar label="Dikkat & Hafıza" score={report.scores.attention} color="bg-rose-500" />
                                        </div>

                                        {profile.testResults && (
                                            <div className="bg-white dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm">
                                                <h4 className="font-bold mb-3 text-zinc-500 uppercase text-xs tracking-wider border-b pb-2">Harf Avı Test Sonucu</h4>
                                                <div className="grid grid-cols-2 gap-4 text-center">
                                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-700 rounded">
                                                        <div className="text-2xl font-bold text-indigo-600">{profile.testResults.accuracy.toFixed(0)}%</div>
                                                        <div className="text-xs text-zinc-500">Doğruluk</div>
                                                    </div>
                                                    <div className="p-2 bg-zinc-50 dark:bg-zinc-700 rounded">
                                                        <div className="text-2xl font-bold text-amber-600">{profile.testResults.durationSeconds}sn</div>
                                                        <div className="text-xs text-zinc-500">Süre</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Qualitative Analysis */}
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <h4 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2"><i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler</h4>
                                            <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                                                {report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                            <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> Destek Alanları</h4>
                                            <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
                                                {report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                    <i className="fa-solid fa-map-location-dot text-indigo-600"></i> Kişisel Eğitim Rotası
                                </h3>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {report.roadmap.map((item, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1 mb-4 sm:mb-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                                    <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{getActivityTitle(item.activityId)}</h4>
                                                </div>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 ml-9">{item.reason}</p>
                                                <span className="inline-block ml-9 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs rounded font-medium border border-zinc-200 dark:border-zinc-500">
                                                    <i className="fa-regular fa-clock mr-1"></i> {item.frequency}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => onSelectActivity(item.activityId as ActivityType)}
                                                className="w-full sm:w-auto ml-0 sm:ml-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                                            >
                                                Oluştur <i className="fa-solid fa-chevron-right"></i>
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