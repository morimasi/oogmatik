
import React, { useState, useEffect } from 'react';
import { AssessmentProfile, SavedAssessment, ActivityType } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { assessmentService } from '../services/assessmentService';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { useAuth } from '../context/AuthContext';
import { getRandomItems, shuffle, getRandomInt } from '../services/offlineGenerators/helpers';
import { TR_VOCAB } from '../data/vocabulary';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity, onAddToWorkbook }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'profile' | 'test-intro' | 'testing' | 'generating' | 'report'>('profile');
    
    // Profile State
    const [profile, setProfile] = useState<AssessmentProfile>({
        studentName: '',
        age: 7,
        grade: '1. Sınıf',
        gender: 'Erkek',
        observations: [],
        testResults: {}
    });

    // Test State
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [testBattery, setTestBattery] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [generatedReport, setGeneratedReport] = useState<SavedAssessment | null>(null);

    // Profile Handlers
    const grades = ['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'];
    
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        prepareTests();
        setStep('test-intro');
    };

    const toggleObservation = (obs: string) => {
        setProfile(prev => ({
            ...prev,
            observations: prev.observations.includes(obs) 
                ? prev.observations.filter(o => o !== obs) 
                : [...prev.observations, obs]
        }));
    };

    // --- DYNAMIC TEST GENERATOR ENGINE ---
    const prepareTests = () => {
        const gradeNum = parseInt(profile.grade.split('.')[0]);
        const battery = [];

        // 1. READING TEST
        battery.push(generateReadingTest(gradeNum));

        // 2. MATH TEST
        battery.push(generateMathTest(gradeNum));

        // 3. ATTENTION TEST (Standard for all)
        battery.push(generateAttentionTest(gradeNum));

        setTestBattery(battery);
    };

    const generateReadingTest = (grade: number) => {
        let questions = [];
        
        if (grade === 1) {
            // Letter & Syllable Awareness
            const letters = getRandomItems(['b', 'd', 'p', 'm', 'n'], 3);
            questions = letters.map(l => ({
                type: 'multiple-choice',
                text: `"${l.toUpperCase()}" harfi hangisidir?`,
                options: shuffle([l, 'k', 's', 't']),
                correct: l
            }));
            // Simple word reading
            const words = getRandomItems(TR_VOCAB.easy_words, 2);
            questions.push({
                type: 'multiple-choice',
                text: `Resimdeki nedir? (${words[0]})`,
                options: shuffle([words[0], words[1], 'masa', 'kalem']),
                correct: words[0]
            });
        } else {
            // Comprehension
            const story = grade < 4 
                ? "Ali okula gitti. Yolda küçük bir kedi gördü. Kediye süt verdi."
                : "Güneş sistemindeki en büyük gezegen Jüpiter'dir. Etrafında birçok uydu döner. Fırtınaları ile meşhurdur.";
            
            const q1 = grade < 4 
                ? { text: "Ali yolda ne gördü?", options: ["Kedi", "Köpek", "Kuş", "Araba"], correct: "Kedi" }
                : { text: "Jüpiter'in özelliği nedir?", options: ["En sıcak gezegendir", "En büyük gezegendir", "Uydusu yoktur", "Mavidir"], correct: "En büyük gezegendir" };

            questions.push({ type: 'text-read', content: story });
            questions.push({ type: 'multiple-choice', ...q1 });
            
            // Sentence Logic (Cloze)
            const sentenceTemplates: any[] = [
                { t: "{subject} ağaca tırmanıp {object} topladı.", s: ["Kedi", "Maymun", "Çocuk"], o: ["elma", "kitap", "balık"], a: "elma" },
                { t: "Hava çok soğuktu, bu yüzden {clothing} giydim.", c: ["montumu", "mayomu", "gözlüğümü"], a: "montumu" },
                { t: "Susadığım için mutfağa gidip bir bardak {drink} içtim.", d: ["su", "ekmek", "çatal"], a: "su" },
                { t: "{vehicle} kırmızı ışık yanınca hemen durdu.", v: ["Otobüs", "Kuş", "Nehir"], a: "Otobüs" }
            ];
            
            if (grade >= 4) {
                sentenceTemplates.push(
                    { t: "Güneş doğudan doğar ve {direction} batar.", s: ["batıdan", "kuzeyden", "güneyden"], a: "batıdan" },
                    { t: "Kitap okumayı çok seven Ali, her hafta sonu {place} gider.", p: ["kütüphaneye", "manava", "berbere"], a: "kütüphaneye" }
                );
            }

            const tmpl = getRandomItems(sentenceTemplates, 1)[0];
            const qText = tmpl.t.replace(/\{.*?\}/g, '_____');
            // Assuming options are flattened or picking specifically; simplifying for demo
            const opts = shuffle([tmpl.a, "yanlış1", "yanlış2", "yanlış3"]); 
            
            questions.push({
                type: 'multiple-choice',
                text: `Boşluğa hangisi gelmelidir? "${qText}"`,
                options: opts,
                correct: tmpl.a
            });
        }

        return {
            id: 'reading',
            name: 'Okuma Becerileri',
            questions
        };
    };

    const generateMathTest = (grade: number) => {
        const questions = [];
        const limit = grade * 10; // 1->10, 2->20, 6->60 scale
        
        // Operation
        const n1 = getRandomInt(1, limit);
        const n2 = getRandomInt(1, limit);
        
        if (grade === 1) {
            questions.push({
                type: 'multiple-choice',
                text: `${n1} + ${n2} = ?`,
                options: shuffle([n1+n2, n1+n2+1, n1+n2-1, n1+n2+2]),
                correct: n1+n2
            });
        } else if (grade <= 3) {
            questions.push({
                type: 'multiple-choice',
                text: `${n1 * 2} - ${n2} = ?`,
                options: shuffle([(n1*2)-n2, (n1*2)-n2+2, (n1*2)-n2-2, (n1*2)-n2+5]),
                correct: (n1*2)-n2
            });
        } else {
            // Fractions / Logic
            questions.push({
                type: 'multiple-choice',
                text: `Bir pastanın 1/4'ünü Ali, 2/4'ünü Ayşe yedi. Geriye ne kadar kaldı?`,
                options: ["1/4", "2/4", "3/4", "Hiç"],
                correct: "1/4"
            });
        }

        // Logic / Sequence
        const seqStart = getRandomInt(1, 10);
        const seqStep = getRandomInt(2, 5);
        const seq = [seqStart, seqStart+seqStep, seqStart+(seqStep*2), '?', seqStart+(seqStep*4)];
        questions.push({
            type: 'multiple-choice',
            text: `Örüntüyü tamamla: ${seq.join(' - ')}`,
            options: shuffle([seqStart+(seqStep*3), seqStart+(seqStep*3)+1, seqStart+(seqStep*3)-1, seqStart+(seqStep*3)+2]),
            correct: seqStart+(seqStep*3)
        });

        return {
            id: 'math',
            name: 'Matematik & Mantık',
            questions
        };
    };

    const generateAttentionTest = (grade: number) => {
        // Simple odd-one-out
        const icons = ['⭐', '⭐', '⭐', '☀️'];
        return {
            id: 'attention',
            name: 'Dikkat & Algı',
            questions: [
                {
                    type: 'multiple-choice',
                    text: 'Farklı olanı bul: ⭐ ⭐ ☀️ ⭐',
                    options: ['1. Yıldız', '2. Yıldız', '3. Güneş', '4. Yıldız'],
                    correct: '3. Güneş' // Simplified logic
                }
            ]
        };
    };

    // --- TEST EXECUTION HANDLERS ---
    const handleAnswer = (answer: any) => {
        const currentTest = testBattery[currentTestIndex];
        const currentQ = currentTest.questions[currentQuestionIndex];
        
        // Record Answer
        const isCorrect = String(answer) === String(currentQ.correct);
        setAnswers(prev => [...prev, {
            testId: currentTest.id,
            questionIdx: currentQuestionIndex,
            isCorrect,
            time: 0 // Placeholder
        }]);

        // Next Question or Next Test
        if (currentQuestionIndex < currentTest.questions.length - 1) {
            setCurrentQuestionIndex(p => p + 1);
        } else {
            if (currentTestIndex < testBattery.length - 1) {
                setCurrentTestIndex(p => p + 1);
                setCurrentQuestionIndex(0);
            } else {
                finishTests();
            }
        }
    };

    const finishTests = async () => {
        setStep('generating');
        
        // Compile Results
        const compiledResults: any = {};
        testBattery.forEach(test => {
            const testAnswers = answers.filter(a => a.testId === test.id);
            const correctCount = testAnswers.filter((a: any) => a.isCorrect).length;
            compiledResults[test.id] = {
                id: test.id,
                name: test.name,
                score: correctCount * 10,
                total: test.questions.length * 10,
                accuracy: (correctCount / test.questions.length) * 100,
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
            }
            
            setGeneratedReport(savedAssessment);
            setStep('report');
        } catch (error) {
            console.error(error);
            alert("Rapor oluşturulurken bir hata oluştu.");
            setStep('profile');
        }
    };

    // --- RENDERERS ---

    if (step === 'profile') {
        return (
            <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl mt-8 border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-3 mb-6 border-b pb-4 border-zinc-200 dark:border-zinc-700">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Öğrenci Profili Oluştur</h2>
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
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-3">Eğitmen Gözlemleri (Varsa İşaretleyin)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {['Okumada güçlük', 'Yazı bozukluğu (Disgrafi)', 'Matematikte zorlanma (Diskalkuli)', 'Dikkat eksikliği', 'Aşırı hareketlilik', 'Harfleri karıştırma'].map(obs => (
                                <button key={obs} type="button" onClick={() => toggleObservation(obs)}
                                    className={`text-left p-3 rounded-lg border transition-all text-sm ${profile.observations.includes(obs) ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                                    <i className={`fa-solid ${profile.observations.includes(obs) ? 'fa-check-square' : 'fa-square'} mr-2`}></i>
                                    {obs}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                        <span>Testi Başlat</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        );
    }

    if (step === 'test-intro' || step === 'testing') {
        const currentTest = testBattery[currentTestIndex];
        const currentQ = currentTest?.questions[currentQuestionIndex];

        if (step === 'test-intro') {
            return (
                <div className="max-w-xl mx-auto mt-20 text-center p-8 bg-white rounded-3xl shadow-xl border-4 border-indigo-100 animate-in zoom-in">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-3xl">
                        <i className="fa-solid fa-rocket"></i>
                    </div>
                    <h2 className="text-2xl font-black text-zinc-800 mb-2">Hazır mısın {profile.studentName.split(' ')[0]}?</h2>
                    <p className="text-zinc-500 mb-8">Şimdi seninle {testBattery.length} bölümlük eğlenceli bir oyun oynayacağız.</p>
                    <button onClick={() => setStep('testing')} className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-300">
                        Başla!
                    </button>
                </div>
            );
        }

        return (
            <div className="max-w-3xl mx-auto mt-8 p-6 md:p-12 bg-white rounded-3xl shadow-2xl border border-zinc-200 relative overflow-hidden min-h-[500px] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-2 bg-zinc-100">
                    <div className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{width: `${((currentTestIndex * 10 + currentQuestionIndex) / (testBattery.length * 5)) * 100}%`}}></div>
                </div>
                
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{currentTest.name}</span>
                    <span className="px-3 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-600">{currentQuestionIndex + 1} / {currentTest.questions.length}</span>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    {currentQ.type === 'text-read' ? (
                        <div className="text-center mb-8">
                            <p className="text-2xl font-dyslexic leading-loose text-zinc-800 mb-8 bg-amber-50 p-6 rounded-xl border-2 border-amber-100">{currentQ.content}</p>
                            <button onClick={() => handleAnswer(true)} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600">Okudum, Devam Et</button>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 text-center mb-10">{currentQ.text}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((opt: string, i: number) => (
                                    <button key={i} onClick={() => handleAnswer(opt)} 
                                        className="p-6 text-lg font-bold text-zinc-700 bg-zinc-50 border-2 border-zinc-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all active:scale-95">
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (step === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center h-full mt-20">
                <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-zinc-800">Yapay Zeka Analiz Yapıyor...</h3>
                <p className="text-zinc-500 mt-2">Cevaplarını inceliyor ve raporunu hazırlıyorum.</p>
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
            />
        );
    }

    return null;
};
