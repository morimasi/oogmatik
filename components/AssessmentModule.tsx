
import React, { useState, useEffect } from 'react';
import { AssessmentProfile, SavedAssessment, ActivityType, TestCategory, AssessmentReport, AssessmentConfig, AdaptiveQuestion } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { assessmentService } from '../services/assessmentService';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { useAuth } from '../context/AuthContext';
import { shuffle } from '../services/offlineGenerators/helpers';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
    onAutoGenerateWorkbook?: (report: AssessmentReport) => void;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity, onAddToWorkbook, onAutoGenerateWorkbook }) => {
    const { user } = useAuth();
    
    // Workflow State
    const [step, setStep] = useState<'profile' | 'config' | 'loading' | 'test-intro' | 'testing' | 'generating' | 'report'>('profile');
    
    // Profile Data
    const [profile, setProfile] = useState<AssessmentProfile>({
        studentName: '',
        age: 7,
        grade: '1. Sınıf',
        gender: 'Erkek',
        observations: [],
        testResults: {},
        errorPatterns: {} 
    });

    // Configuration
    const [config, setConfig] = useState<AssessmentConfig>({
        mode: 'standard',
        selectedSkills: ['linguistic', 'logical', 'spatial', 'attention'],
        duration: 20
    });

    // Test Runtime State
    const [questionPool, setQuestionPool] = useState<AdaptiveQuestion[]>([]);
    const [adaptiveQueue, setAdaptiveQueue] = useState<AdaptiveQuestion[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<any[]>([]);
    
    // Reporting
    const [generatedReport, setGeneratedReport] = useState<SavedAssessment | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // --- 1. CONFIGURATION LOGIC ---
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep('config');
    };

    const handleConfigSubmit = async () => {
        setStep('loading');
        try {
            // Generate/Fetch questions from AI or Offline Fallback
            const pool = await assessmentService.generateSession(config);
            setQuestionPool(pool);

            // Initialize Queue: Pick one starting question (Difficulty ~2 or 1) for each selected skill
            const initialQuestions = config.selectedSkills.map(skill => {
                const skillQs = pool.filter(q => q.skill === skill);
                return skillQs.find(q => q.difficulty === 2) || skillQs[0];
            }).filter(q => q !== undefined);

            setAdaptiveQueue(shuffle(initialQuestions));
            setStep('test-intro');
        } catch (error) {
            console.error("Assessment initialization failed:", error);
            alert("Test başlatılamadı. Lütfen tekrar deneyin.");
            setStep('config');
        }
    };

    // --- 2. ADAPTIVE ENGINE LOGIC ---

    const handleAnswer = (selectedOption: string) => {
        const currentQ = adaptiveQueue[currentQIndex];
        const isCorrect = selectedOption === currentQ.correct;
        const errorTag = !isCorrect ? currentQ.errorTags?.[selectedOption] : null;

        // Record Answer
        const answerRecord = {
            questionId: currentQ.id,
            skill: currentQ.skill,
            isCorrect,
            difficulty: currentQ.difficulty,
            errorTag,
            timestamp: Date.now()
        };
        
        const newAnswers = [...answers, answerRecord];
        setAnswers(newAnswers);

        // Update Error Patterns
        if (errorTag) {
            setProfile(prev => ({
                ...prev,
                errorPatterns: {
                    ...prev.errorPatterns,
                    [errorTag]: (prev.errorPatterns?.[errorTag] || 0) + 1
                }
            }));
        }

        // Adaptive Branching
        const skillAnswers = newAnswers.filter(a => a.skill === currentQ.skill);
        const maxQuestionsPerSkill = config.mode === 'quick' ? 3 : (config.mode === 'standard' ? 5 : 8);

        if (skillAnswers.length < maxQuestionsPerSkill) {
            // Find next question from pool
            let nextDifficulty = currentQ.difficulty;
            
            if (isCorrect) {
                nextDifficulty = Math.min(5, currentQ.difficulty + 1);
            } else {
                nextDifficulty = Math.max(1, currentQ.difficulty - 1);
            }

            // Find a question of this difficulty not yet answered
            const usedIds = new Set(newAnswers.map(a => a.questionId));
            const availableSkillQs = questionPool.filter(q => q.skill === currentQ.skill && !usedIds.has(q.id) && !adaptiveQueue.some(aq => aq.id === q.id));
            
            // Try to find exact difficulty match, else closest
            const nextQ = availableSkillQs.find(q => q.difficulty === nextDifficulty) 
                       || availableSkillQs.sort((a,b) => Math.abs(a.difficulty - nextDifficulty) - Math.abs(b.difficulty - nextDifficulty))[0];

            if (nextQ) {
                setAdaptiveQueue(prev => [...prev, nextQ]);
            }
        }

        setCurrentQIndex(prev => prev + 1);
    };

    // Check for completion
    useEffect(() => {
        if (adaptiveQueue.length > 0 && currentQIndex >= adaptiveQueue.length) {
            finishTests();
        }
    }, [currentQIndex, adaptiveQueue.length]);


    // --- 3. REPORT GENERATION ---

    const finishTests = async () => {
        setStep('generating');
        
        const compiledResults: any = {};
        
        config.selectedSkills.forEach(skill => {
            const skillAnswers = answers.filter(a => a.skill === skill);
            if (skillAnswers.length === 0) return;

            const totalWeight = skillAnswers.reduce((acc, a) => acc + a.difficulty, 0);
            const earnedWeight = skillAnswers.reduce((acc, a) => acc + (a.isCorrect ? a.difficulty : 0), 0);
            
            const accuracy = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;

            compiledResults[skill] = {
                id: skill,
                name: skill.charAt(0).toUpperCase() + skill.slice(1), 
                score: earnedWeight,
                total: totalWeight,
                accuracy: Math.round(accuracy),
                duration: 0,
                timestamp: Date.now()
            };
        });

        const finalProfile = { ...profile, testResults: compiledResults };
        setProfile(finalProfile);

        try {
            const report = await generateAssessmentReport(finalProfile);
            const savedAssessment: SavedAssessment = {
                id: crypto.randomUUID(),
                userId: user?.id || 'guest',
                studentName: profile.studentName,
                age: profile.age,
                gender: profile.gender,
                grade: profile.grade,
                report,
                createdAt: new Date().toISOString()
            };
            
            if (user) {
                await assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, report);
                setIsSaved(true);
            }
            
            setGeneratedReport(savedAssessment);
            setStep('report');
        } catch (error) {
            console.error(error);
            alert("Rapor oluşturulurken bir hata oluştu.");
            setStep('profile');
        }
    };

    const handleManualSave = async () => {
        if (!user) {
            alert("Kaydetmek için lütfen giriş yapın.");
            return;
        }
        if (!generatedReport) return;

        setIsSaving(true);
        try {
            await assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, generatedReport.report);
            setIsSaved(true);
            alert("Rapor başarıyla arşive kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme sırasında hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDERERS ---

    if (step === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-full mt-20">
                <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Test Hazırlanıyor...</h3>
                <p className="text-zinc-500 mt-2">Yapay zeka senin için özel sorular üretiyor.</p>
            </div>
        );
    }

    if (step === 'profile') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl mt-8 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 border-zinc-200 dark:border-zinc-700">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Öğrenci Profili</h2>
                </div>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Adı Soyadı</label>
                            <input type="text" required className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" 
                                value={profile.studentName} onChange={e => setProfile({...profile, studentName: e.target.value})} placeholder="Örn: Ali Yılmaz" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Cinsiyet</label>
                            <div className="flex gap-4">
                                {['Erkek', 'Kız'].map(g => (
                                    <button key={g} type="button" onClick={() => setProfile({...profile, gender: g as any})}
                                        className={`flex-1 p-3 rounded-xl border-2 font-bold transition-all ${profile.gender === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500'}`}>
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Yaş</label>
                            <input type="number" required min="5" max="15" className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white" 
                                value={profile.age} onChange={e => setProfile({...profile, age: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Sınıf</label>
                            <select className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                                value={profile.grade} onChange={e => setProfile({...profile, grade: e.target.value})}>
                                {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Devam Et</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        );
    }

    if (step === 'config') {
        const skills: {id: TestCategory, label: string, icon: string}[] = [
            { id: 'linguistic', label: 'Sözel-Dilsel', icon: 'fa-book' },
            { id: 'logical', label: 'Mantıksal', icon: 'fa-calculator' },
            { id: 'spatial', label: 'Görsel-Uzamsal', icon: 'fa-eye' },
            { id: 'attention', label: 'Dikkat', icon: 'fa-bullseye' },
            { id: 'musical', label: 'Müziksel', icon: 'fa-music' },
            { id: 'kinesthetic', label: 'Bedensel', icon: 'fa-person-running' },
        ];

        return (
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl mt-8 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 border-zinc-200 dark:border-zinc-700">
                    <button onClick={() => setStep('profile')} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Test Yapılandırması</h2>
                </div>

                <div className="space-y-8">
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-500 uppercase mb-3">Değerlendirme Modu</label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'quick', label: 'Hızlı Tarama', desc: '~10 dk', icon: 'fa-bolt' },
                                { id: 'standard', label: 'Standart', desc: '~20 dk', icon: 'fa-clipboard-check' },
                                { id: 'full', label: 'Detaylı Analiz', desc: '~40 dk', icon: 'fa-microscope' }
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setConfig({...config, mode: m.id as any})}
                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${config.mode === m.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    <i className={`fa-solid ${m.icon} text-2xl`}></i>
                                    <span className="font-bold text-sm">{m.label}</span>
                                    <span className="text-xs opacity-70">{m.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skill Selection */}
                    <div>
                        <label className="block text-sm font-bold text-zinc-500 uppercase mb-3">Test Edilecek Alanlar</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {skills.map(s => {
                                const isSelected = config.selectedSkills.includes(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            const newSkills = isSelected 
                                                ? config.selectedSkills.filter(id => id !== s.id)
                                                : [...config.selectedSkills, s.id];
                                            setConfig({...config, selectedSkills: newSkills});
                                        }}
                                        className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${isSelected ? 'border-green-500 bg-green-50 text-green-700' : 'border-zinc-200 text-zinc-500'}`}
                                    >
                                        <i className={`fa-solid ${s.icon}`}></i>
                                        <span className="text-sm font-bold">{s.label}</span>
                                        {isSelected && <i className="fa-solid fa-check ml-auto"></i>}
                                    </button>
                                );
                            })}
                        </div>
                        {config.selectedSkills.length === 0 && <p className="text-red-500 text-xs mt-2">En az bir alan seçmelisiniz.</p>}
                    </div>

                    <button 
                        onClick={handleConfigSubmit} 
                        disabled={config.selectedSkills.length === 0}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Değerlendirmeyi Başlat
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'test-intro') {
        return (
            <div className="max-w-xl mx-auto mt-20 text-center p-8 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border-4 border-indigo-100 dark:border-zinc-700 animate-in zoom-in">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-3xl">
                    <i className="fa-solid fa-rocket"></i>
                </div>
                <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 mb-2">Hazır mısın {profile.studentName.split(' ')[0]}?</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                    Senin için yapay zeka tarafından özel olarak hazırlanan sorularla zihinsel bir yolculuğa çıkacağız.
                </p>
                <button onClick={() => setStep('testing')} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-300">
                    Başla!
                </button>
            </div>
        );
    }

    if (step === 'testing') {
        const currentQ = adaptiveQueue[currentQIndex];

        if (!currentQ) {
             return <div className="text-center p-10"><i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-500"></i></div>;
        }

        const progressPercent = ((currentQIndex) / (adaptiveQueue.length + 3)) * 100;

        return (
            <div className="max-w-3xl mx-auto mt-8 p-6 md:p-12 bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-700 relative overflow-hidden min-h-[500px] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-2 bg-zinc-100 dark:bg-zinc-700">
                    <div className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{width: `${Math.min(100, progressPercent)}%`}}></div>
                </div>
                
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{currentQ.skill.toUpperCase()}</span>
                    <div className="flex gap-2">
                        {Array.from({length: 5}).map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < currentQ.difficulty ? 'bg-amber-400' : 'bg-zinc-200'}`}></div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right duration-300" key={currentQ.id}>
                     <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 dark:text-zinc-100 text-center mb-10 whitespace-pre-line">{currentQ.text}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {currentQ.options.map((opt: string, i: number) => (
                             <button key={i} onClick={() => handleAnswer(opt)} 
                                 className="p-6 text-lg font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-700/50 border-2 border-zinc-200 dark:border-zinc-600 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all active:scale-95">
                                 {opt}
                             </button>
                         ))}
                     </div>
                </div>
            </div>
        );
    }

    if (step === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center h-full mt-20">
                <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Sonuçlar Analiz Ediliyor...</h3>
                <p className="text-zinc-500 mt-2">Hata paternleri inceleniyor ve rapor hazırlanıyor.</p>
            </div>
        );
    }

    if (step === 'report' && generatedReport) {
        return (
            <AssessmentReportViewer 
                assessment={generatedReport} 
                onClose={onBack} 
                user={user}
                onAddToWorkbook={onAddToWorkbook}
                onAutoGenerateWorkbook={onAutoGenerateWorkbook}
                onManualSave={handleManualSave}
                isSaving={isSaving}
                isSaved={isSaved}
            />
        );
    }

    return null;
};
