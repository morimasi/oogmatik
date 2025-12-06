
import React, { useState } from 'react';
import { AssessmentProfile, SavedAssessment, ActivityType, TestCategory } from '../types';
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

    // --- ADVANCED DYNAMIC TEST GENERATOR ENGINE (MULTIPLE INTELLIGENCES) ---
    const prepareTests = () => {
        const gradeNum = parseInt(profile.grade.split('.')[0]) || 1;
        const battery = [];

        // 1. LINGUISTIC (Sözel-Dilsel)
        battery.push(generateLinguisticTest(gradeNum));

        // 2. LOGICAL-MATHEMATICAL (Mantıksal)
        battery.push(generateLogicalTest(gradeNum));

        // 3. VISUAL-SPATIAL (Görsel-Uzamsal)
        battery.push(generateVisualTest(gradeNum));

        // 4. KINESTHETIC (Bedensel)
        battery.push(generateKinestheticTest(gradeNum));
        
        // 5. MUSICAL (Müziksel)
        battery.push(generateMusicalTest(gradeNum));
        
        // 6. NATURALISTIC (Doğacı)
        battery.push(generateNaturalisticTest(gradeNum));
        
        // 7. INTERPERSONAL (Sosyal)
        battery.push(generateInterpersonalTest(gradeNum));
        
        // 8. INTRAPERSONAL (İçsel)
        battery.push(generateIntrapersonalTest(gradeNum));
        
        // 9. ATTENTION (Dikkat)
        battery.push(generateAttentionTest(gradeNum));

        setTestBattery(battery);
    };

    // --- GENERATORS PER INTELLIGENCE TYPE ---

    const generateLinguisticTest = (grade: number) => {
        let questions: any[] = [];
        const easyPool = TR_VOCAB.easy_words;
        
        if (grade === 1) {
            const letters = getRandomItems(['b', 'd', 'p', 'm', 'n'], 1);
            questions.push({
                type: 'multiple-choice',
                text: `Aşağıdakilerden hangisi "${letters[0].toUpperCase()}" harfinin küçüğüdür?`,
                options: shuffle([letters[0], 'k', 's', 't']),
                correct: letters[0]
            });
            const word = getRandomItems(easyPool, 1)[0];
            questions.push({
                type: 'multiple-choice',
                text: `Görseldeki nesnenin adı nedir? (${word})`,
                options: shuffle([word, getRandomItems(easyPool, 1)[0], getRandomItems(easyPool, 1)[0]]),
                correct: word
            });
        } else if (grade <= 3) {
            questions.push({
                type: 'multiple-choice',
                text: "Hangi kelime diğerlerinden farklıdır?",
                options: shuffle(["Elma", "Armut", "Muz", "Kedi"]),
                correct: "Kedi"
            });
             questions.push({
                type: 'multiple-choice',
                text: "Eş anlamlısını bul: 'Yürekli'",
                options: shuffle(["Cesur", "Korkak", "Hızlı", "Sessiz"]),
                correct: "Cesur"
            });
        } else {
            questions.push({
                type: 'multiple-choice',
                text: "Aşağıdaki cümlede hangi duygu hakimdir? 'Ayşe, sınav sonucunu görünce yerinden zıpladı ve çığlık attı.'",
                options: shuffle(["Sevinç", "Üzüntü", "Korku", "Öfke"]),
                correct: "Sevinç"
            });
            questions.push({
                type: 'multiple-choice',
                text: "Analoji: 'Kitap' için 'Yazar' ne ise, 'Bina' için _____ odur.",
                options: shuffle(["Mimar", "Tuğla", "Kapı", "Şehir"]),
                correct: "Mimar"
            });
        }

        return { id: 'linguistic', name: 'Sözel-Dilsel Zeka', questions };
    };

    const generateLogicalTest = (grade: number) => {
        const questions = [];
        if (grade === 1) {
            questions.push({ type: 'multiple-choice', text: "2, 4, 6, ?", options: ["8", "7", "9", "5"], correct: "8" });
            questions.push({ type: 'multiple-choice', text: "Hangi şekil 3 kenarlıdır?", options: ["Üçgen", "Kare", "Daire"], correct: "Üçgen" });
        } else if (grade <= 3) {
            questions.push({ type: 'multiple-choice', text: "Bir çiftlikte 3 inek ve 2 tavuk var. Toplam kaç ayak vardır?", options: ["20", "16", "14", "12"], correct: "16" });
            questions.push({ type: 'multiple-choice', text: "Örüntüyü tamamla: ▲ ■ ▲ ■ ?", options: ["▲", "■", "●", "★"], correct: "▲" });
        } else {
            questions.push({ type: 'multiple-choice', text: "Ali, Veli'den uzun, Veli de Can'dan uzundur. En kısa kimdir?", options: ["Can", "Veli", "Ali", "Bilinemez"], correct: "Can" });
            questions.push({ type: 'multiple-choice', text: "Bir kutuda 3 kırmızı, 2 mavi top var. Rastgele çekilen topun mavi olma ihtimali nedir?", options: ["2/5", "3/5", "1/2", "1/5"], correct: "2/5" });
        }
        return { id: 'logical', name: 'Mantıksal-Matematiksel Zeka', questions };
    };

    const generateVisualTest = (grade: number) => {
        const questions = [];
        // Visual questions use simple text-based graphics or unicode for now
        if (grade <= 2) {
            questions.push({
                type: 'multiple-choice',
                text: "Aşağıdaki şeklin aynısı hangisidir? ( d )",
                options: ["b", "d", "p", "q"],
                correct: "d"
            });
        } else {
            questions.push({
                type: 'multiple-choice',
                text: "Zihinsel Döndürme: 'L' şeklini saat yönünde bir kez çevirirsen nasıl görünür?",
                options: ["L", "Γ", "⅃", "LUT"], // Symbol approximations
                correct: "Γ" 
            });
            questions.push({
                type: 'multiple-choice',
                text: "Kuş bakışı görünüm: Bir bardağa tam tepeden bakarsan ne görürsün?",
                options: ["Daire", "Kare", "Üçgen", "Dikdörtgen"],
                correct: "Daire"
            });
        }
        return { id: 'spatial', name: 'Görsel-Uzamsal Zeka', questions };
    };

    const generateKinestheticTest = (grade: number) => {
        const questions = [];
        if (grade <= 3) {
             questions.push({
                type: 'multiple-choice',
                text: "Sağ elini havaya kaldırdın. Aynaya bakarsan hangi elin havada görünür?",
                options: ["Sol el", "Sağ el", "İkisi de", "Hiçbiri"],
                correct: "Sol el"
            });
        } else {
             questions.push({
                type: 'multiple-choice',
                text: "Ayakkabı bağlarken yapılan hareketlerin doğru sırası hangisidir?",
                options: ["Düğüm at -> Fiyonk yap -> Sıkıştır", "Sıkıştır -> Düğüm at -> Fiyonk yap", "Fiyonk yap -> Düğüm at"],
                correct: "Düğüm at -> Fiyonk yap -> Sıkıştır"
            });
        }
        return { id: 'kinesthetic', name: 'Bedensel-Kinestetik Zeka', questions };
    }

    const generateNaturalisticTest = (grade: number) => {
        const questions = [];
        questions.push({
            type: 'multiple-choice',
            text: "Hangisi kış uykusuna yatar?",
            options: shuffle(["Ayı", "Kedi", "Kuş", "At"]),
            correct: "Ayı"
        });
        if (grade > 2) {
            questions.push({
                type: 'multiple-choice',
                text: "Hangisi bir bitkinin büyümesi için gerekli DEĞİLDİR?",
                options: shuffle(["Çikolata", "Su", "Güneş", "Toprak"]),
                correct: "Çikolata"
            });
        }
        return { id: 'naturalistic', name: 'Doğacı Zeka', questions };
    };
    
    const generateMusicalTest = (grade: number) => {
        const questions = [];
        questions.push({
            type: 'multiple-choice',
            text: "Hangi kelime 'Masa' ile kafiyelidir (benzer sesle biter)?",
            options: shuffle(["Kasa", "Kapı", "Sandalye", "Mavi"]),
            correct: "Kasa"
        });
        questions.push({
            type: 'multiple-choice',
            text: "Ritim Tamamlama: Dum-Tek-Dum-Tek-Dum-?",
            options: shuffle(["Tek", "Dum", "Tıs", "Bom"]),
            correct: "Tek"
        });
        return { id: 'musical', name: 'Müziksel-Ritmik Zeka', questions };
    };

    const generateInterpersonalTest = (grade: number) => {
        const questions = [];
        questions.push({
            type: 'multiple-choice',
            text: "Arkadaşın oyuncağını kaybetti ve ağlıyor. Ne yaparsın?",
            options: ["Onunla dalga geçerim", "Bulmasına yardım ederim", "Görmezden gelirim", "Öğretmene şikayet ederim"],
            correct: "Bulmasına yardım ederim"
        });
        return { id: 'interpersonal', name: 'Sosyal Zeka', questions };
    }

    const generateIntrapersonalTest = (grade: number) => {
        const questions = [];
        questions.push({
            type: 'multiple-choice',
            text: "Bir konuda başarısız olduğunda ne düşünürsün?",
            options: ["Ben yeteneksizim", "Daha çok çalışmalıyım", "Herkes suçlu", "Şanssızım"],
            correct: "Daha çok çalışmalıyım"
        });
        return { id: 'intrapersonal', name: 'İçsel Zeka', questions };
    }

    const generateAttentionTest = (grade: number) => {
        const isHard = grade > 3;
        return {
            id: 'attention', // Mapped to specific logic if needed, or treat as general cognitive
            name: 'Dikkat & Konsantrasyon',
            questions: [
                {
                    type: 'multiple-choice',
                    text: 'Aşağıdaki dizide kuralı bozan şekli bul: ⭐ ⭐ ☀️ ⭐ ⭐',
                    options: ['1. Yıldız', 'Ortadaki Güneş', 'Sonuncu Yıldız', 'Hepsi Aynı'],
                    correct: 'Ortadaki Güneş'
                },
                {
                    type: 'multiple-choice',
                    text: isHard 
                        ? 'Hangi iki sayı birbirinin aynısıdır? ( 69 - 96 - 69 - 66 )' 
                        : 'Hangi harf farklıdır? ( b - b - d - b )',
                    options: isHard ? ['69 ve 96', '69 ve 69', '66 ve 96', 'Yok'] : ['1. b', '3. d', '4. b', 'Hepsi aynı'],
                    correct: isHard ? '69 ve 69' : '3. d'
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
            time: 0 
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
                score: correctCount * 10, // Scale appropriately based on question count
                total: test.questions.length * 10,
                accuracy: test.questions.length > 0 ? (correctCount / test.questions.length) * 100 : 0,
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
                    <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Çoklu Zeka Değerlendirme Profili</h2>
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
                            <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-2">Sınıf (Test Seviyesi)</label>
                            <select className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                                value={profile.grade} onChange={e => setProfile({...profile, grade: e.target.value})}>
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-3">Eğitmen Gözlemleri (Varsa İşaretleyin)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {['Okumada güçlük', 'Yazı bozukluğu (Disgrafi)', 'Matematikte zorlanma (Diskalkuli)', 'Dikkat eksikliği', 'Aşırı hareketlilik', 'Harfleri karıştırma', 'Sosyal iletişimde zorluk', 'Yönleri karıştırma'].map(obs => (
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
                    <p className="text-zinc-500 mb-8">
                        Senin için <strong>{profile.grade}</strong> seviyesinde ve farklı zeka alanlarını (Howard Gardner) ölçen özel sorular hazırladık. 
                        Toplam {testBattery.length} bölümden oluşuyor.
                    </p>
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
                            <h3 className="text-2xl md:text-3xl font-bold text-zinc-800 text-center mb-10 whitespace-pre-line">{currentQ.text}</h3>
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
                <p className="text-zinc-500 mt-2">Tüm zeka alanlarındaki performansını inceliyorum.</p>
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
