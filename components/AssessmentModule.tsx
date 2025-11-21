
import React, { useState } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
}

const steps = ['Giriş', 'Profil', 'Gözlem', 'Analiz', 'Sonuç'];

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<AssessmentProfile>({
        age: 7,
        grade: '1. Sınıf',
        observations: []
    });
    const [report, setReport] = useState<AssessmentReport | null>(null);

    const gradeOptions = ['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'];
    
    const observationOptions = [
        "Okurken satır atlıyor", "b ve d harflerini karıştırıyor", "Heceleyerek okuyor", "Okuduğunu anlamakta zorlanıyor",
        "Yazısı okunaksız", "Tahtadan deftere geçirirken zorlanıyor", "Noktalama işaretlerini kullanmıyor",
        "Rakamları ters yazıyor (3, 7 gibi)", "Basit toplama işlemlerinde parmak sayıyor", "Saati öğrenmekte zorlanıyor",
        "Çabuk sıkılıyor", "Eşyalarını sık sık kaybediyor", "Yönergeleri takip edemiyor", "Sırasını bekleyemiyor"
    ];

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

    const handleFinish = async () => {
        setCurrentStep(3); // Loading Analysis
        setIsLoading(true);
        try {
            const result = await generateAssessmentReport(profile);
            setReport(result);
            setIsLoading(false);
            setCurrentStep(4); // Results
        } catch (error) {
            console.error(error);
            alert("Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
            setIsLoading(false);
            setCurrentStep(2); // Go back
        }
    };

    const getActivityTitle = (id: string) => ACTIVITIES.find(a => a.id === id)?.title || id;

    // Simple CSS Bar Chart Component
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
                <div className="flex items-center gap-2">
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
                <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
                    
                    {/* STEP 0: INTRO */}
                    {currentStep === 0 && (
                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 text-indigo-600 text-6xl animate-bounce">
                                <i className="fa-solid fa-user-doctor"></i>
                            </div>
                            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">Akıllı Değerlendirme Asistanı</h2>
                            <p className="text-zinc-600 dark:text-zinc-300 text-lg mb-8 max-w-lg">
                                Bu modül, öğrencinizin güçlü ve desteklenmesi gereken yönlerini belirlemenize yardımcı olur. Yapay zeka destekli analiz sonucunda kişiselleştirilmiş bir çalışma programı oluşturulacaktır.
                            </p>
                            <button onClick={() => setCurrentStep(1)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105">
                                Başla <i className="fa-solid fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    )}

                    {/* STEP 1: PROFILE */}
                    {currentStep === 1 && (
                        <div className="p-8 flex flex-col h-full">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 border-b pb-2">Öğrenci Profili</h3>
                            <div className="space-y-6">
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
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

                    {/* STEP 2: OBSERVATIONS */}
                    {currentStep === 2 && (
                        <div className="p-8 flex flex-col h-full">
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Gözlem Listesi</h3>
                            <p className="text-sm text-zinc-500 mb-6">Öğrencinizde gözlemlediğiniz durumları işaretleyiniz.</p>
                            
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-3">
                                    {observationOptions.map((obs, idx) => {
                                        const isSelected = profile.observations.includes(obs);
                                        return (
                                            <button 
                                                key={idx}
                                                onClick={() => toggleObservation(obs)}
                                                className={`flex items-center p-4 rounded-xl border transition-all text-left ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/30'}`}
                                            >
                                                <div className={`w-6 h-6 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-zinc-300'}`}>
                                                    {isSelected && <i className="fa-solid fa-check text-white text-xs"></i>}
                                                </div>
                                                <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-zinc-700 dark:text-zinc-300'}`}>{obs}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                <button onClick={() => setCurrentStep(1)} className="text-zinc-500 font-bold hover:text-zinc-800">Geri</button>
                                <button 
                                    onClick={handleFinish} 
                                    disabled={profile.observations.length === 0}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Analizi Başlat <i className="fa-solid fa-wand-magic-sparkles ml-2"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: LOADING */}
                    {currentStep === 3 && (
                        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                <i className="fa-solid fa-brain absolute inset-0 flex items-center justify-center text-3xl text-indigo-600 animate-pulse"></i>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Veriler Analiz Ediliyor...</h3>
                            <p className="text-zinc-500 text-sm">Yapay zeka uzmanımız öğrenciniz için en iyi rotayı oluşturuyor.</p>
                        </div>
                    )}

                    {/* STEP 4: RESULTS */}
                    {currentStep === 4 && report && (
                        <div className="flex flex-col h-full overflow-hidden">
                            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 bg-indigo-50 dark:bg-indigo-900/20">
                                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">Değerlendirme Raporu</h2>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">{report.overallSummary}</p>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    {/* Scores */}
                                    <div className="bg-white dark:bg-zinc-700/30 p-5 rounded-xl border border-zinc-200 dark:border-zinc-600">
                                        <h4 className="font-bold mb-4 text-zinc-500 uppercase text-xs tracking-wider">İhtiyaç Analizi</h4>
                                        <ScoreBar label="Okuma Becerileri" score={report.scores.reading} color="bg-blue-500" />
                                        <ScoreBar label="Yazma Becerileri" score={report.scores.writing} color="bg-green-500" />
                                        <ScoreBar label="Matematik" score={report.scores.math} color="bg-yellow-500" />
                                        <ScoreBar label="Dikkat & Hafıza" score={report.scores.attention} color="bg-rose-500" />
                                    </div>

                                    {/* Analysis Text */}
                                    <div className="space-y-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <h4 className="font-bold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2"><i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler</h4>
                                            <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300">
                                                {report.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                            <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> Destek Alanları</h4>
                                            <ul className="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300">
                                                {report.analysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                    <i className="fa-solid fa-map-location-dot text-indigo-600"></i> Kişisel Eğitim Rotası
                                </h3>
                                
                                <div className="space-y-3">
                                    {report.roadmap.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-600 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{getActivityTitle(item.activityId)}</h4>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{item.reason}</p>
                                                <span className="inline-block px-2 py-0.5 bg-zinc-100 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300 text-xs rounded font-medium">
                                                    <i className="fa-regular fa-clock mr-1"></i> {item.frequency}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => onSelectActivity(item.activityId as ActivityType)}
                                                className="ml-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-sm hover:bg-indigo-200 transition-colors"
                                            >
                                                Oluştur <i className="fa-solid fa-chevron-right ml-1"></i>
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
