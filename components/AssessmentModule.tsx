
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType, TestCategory, User, SavedAssessment } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';
import { RadarChart } from './RadarChart';
import { useAuth } from '../context/AuthContext';
import { assessmentService } from '../services/assessmentService';
import { ShareModal } from './ShareModal';
import { TR_VOCAB, getRandomItems, getRandomInt, shuffle } from '../services/offlineGenerators/helpers';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
}

const steps = ['Giriş', 'Profil', 'Okuma', 'Matematik', 'Dikkat', 'Görsel', 'Bellek', 'Gözlem', 'Analiz', 'Sonuç'];

// --- VISUAL ASSETS ---

// Professional Matrix Cell Renderer (Raven's Style 2.0)
const MatrixCell: React.FC<{ item: any; className?: string }> = ({ item, className = "" }) => {
    if (!item) return <div className={`${className} bg-white dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center relative overflow-hidden`}><div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 opacity-50"></div><span className="text-4xl text-zinc-400 font-bold relative z-10">?</span></div>;

    const { outer, inner, rotation = 0, fill = false } = item;
    
    // Shape Renderers
    const renderShape = (type: string, size: number, style: 'stroke' | 'fill', colorClass: string) => {
        const center = 50;
        const r = size / 2;
        const props = {
            stroke: "currentColor",
            strokeWidth: "3",
            fill: style === 'fill' ? "currentColor" : "none",
            className: colorClass,
            vectorEffect: "non-scaling-stroke"
        };

        if (type === 'circle') return <circle cx={center} cy={center} r={r} {...props} />;
        if (type === 'square') return <rect x={center - r} y={center - r} width={size} height={size} {...props} />;
        if (type === 'triangle') return <polygon points={`${center},${center - r} ${center + r},${center + r} ${center - r},${center + r}`} {...props} />;
        if (type === 'diamond') return <polygon points={`${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`} {...props} />;
        if (type === 'cross') return <path d={`M${center-r},${center-r} L${center+r},${center+r} M${center+r},${center-r} L${center-r},${center+r}`} {...props} strokeWidth="5" />;
        if (type === 'star') return <polygon points="50,15 61,35 85,35 65,50 75,75 50,60 25,75 35,50 15,35 39,35" {...props} />;
        return null;
    };

    return (
        <div className={`${className} bg-white dark:bg-zinc-800 border-2 border-zinc-800 dark:border-zinc-400 flex items-center justify-center relative overflow-hidden`}>
            <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
                <g transform={`rotate(${rotation}, 50, 50)`}>
                    {/* Outer Shape */}
                    {renderShape(outer, 70, fill ? 'fill' : 'stroke', fill ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-800 dark:text-zinc-200")}
                    
                    {/* Inner Shape */}
                    {inner && renderShape(inner, 30, 'fill', "text-indigo-600 dark:text-indigo-400")}
                </g>
            </svg>
        </div>
    );
};

// --- DYNAMIC TEST GENERATORS ---

// 1. Reading: Dynamic Pseudoword & Sentence Generator (Improved)
const generateReadingTest = (grade: number) => {
    const items = [];
    
    // Kelime Havuzu Seçimi
    let poolKey = 'easy_words';
    if (grade >= 3 && grade <= 4) poolKey = 'medium_words';
    if (grade >= 5) poolKey = 'hard_words';
    
    const realWords = getRandomItems((TR_VOCAB[poolKey] as string[]) || TR_VOCAB.easy_words, 15);

    // Lexical (Real Word vs Pseudoword) - 6 Items
    for(let i=0; i<6; i++) {
        const isReal = Math.random() > 0.5;
        let q = realWords[i].toLocaleUpperCase('tr');
        
        if (!isReal) {
            // Gerçekçi Uydurma Kelime Üretimi (Disleksi Simülasyonu)
            const original = q;
            // 1. Benzer harfleri değiştir
            if (q.includes('B')) q = q.replace('B', 'D');
            else if (q.includes('D')) q = q.replace('D', 'B');
            else if (q.includes('M')) q = q.replace('M', 'N');
            else if (q.includes('N')) q = q.replace('N', 'M');
            else if (q.includes('E')) q = q.replace('E', 'A');
            // 2. Harf sırasını değiştir (Hecenin içini karıştır)
            else if (q.length > 3) {
                const arr = q.split('');
                const idx = Math.floor(arr.length / 2);
                [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
                q = arr.join('');
            }
            // 3. Sonuna ekle
            else {
                q = q + 'K';
            }
            
            // Eğer kelime değişmediyse veya hala anlamlıysa zorla değiştir
            if (q === original) q = "Z" + q.substring(1);
        }
        items.push({ subtype: 'lexical', q, isReal, id: `lex-${i}` });
    }

    // Sentence Comprehension (Cloze) - 4 Items
    // Dinamik cümle şablonları
    const sentenceTemplates = [
        { t: "{subject} ağaca tırmanıp {object} topladı.", s: ["Kedi", "Maymun", "Çocuk"], o: ["elma", "kitap", "balık"], a: "elma" }, // Basit mantık
        { t: "Hava çok soğuktu, bu yüzden {clothing} giydim.", c: ["montumu", "mayomu", "gözlüğümü"], a: "montumu" },
        { t: "Susadığım için mutfağa gidip bir bardak {drink} içtim.", d: ["su", "ekmek", "çatal"], a: "su" },
        { t: "{vehicle} kırmızı ışık yanınca hemen durdu.", v: ["Otobüs", "Kuş", "Nehir"], a: "Otobüs" }
    ];
    
    const selectedSentences = getRandomItems(sentenceTemplates, 4);
    selectedSentences.forEach((s, i) => {
        let text = s.t;
        // Basit şablon doldurma (Regex yerine manuel replace daha güvenli offline için)
        if(s.s) text = text.replace('{subject}', getRandomItems(s.s, 1)[0]);
        if(s.c) text = text.replace('{clothing}', "...");
        if(s.d) text = text.replace('{drink}', "...");
        if(s.o) text = text.replace('{object}', "...");
        if(s.v) text = text.replace('{vehicle}', "...");
        
        // Eğer boşluk yoksa manuel ekle (yukarıdaki replace mantığına göre '...' zaten eklendi)
        
        // Seçenekleri hazırla
        let opts: string[] = [];
        if (s.c) opts = s.c;
        else if (s.d) opts = s.d;
        else if (s.v) opts = s.v;
        else if (s.o) opts = s.o;
        else opts = ["seçenek1", "seçenek2", "seçenek3"]; // Fallback

        items.push({ subtype: 'sentence', q: text, opts: shuffle(opts), a: s.a, id: `sent-${i}` });
    });
    
    return items;
};

// 2. Math: Mental Arithmetic (Unchanged logic, just ensure types)
const generateMathTest = (grade: number) => {
    const items = [];
    for(let i=0; i<8; i++) {
        let n1=0, n2=0, op='', ans=0;
        if (grade === 1) {
            n1 = getRandomInt(1, 10); n2 = getRandomInt(1, 10); op = Math.random() > 0.5 ? '+' : '-';
            if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
            ans = op === '+' ? n1 + n2 : n1 - n2;
        } else if (grade <= 3) {
            op = Math.random() > 0.3 ? (Math.random() > 0.5 ? '+' : '-') : 'x';
            if (op === 'x') { n1 = getRandomInt(2, 5); n2 = getRandomInt(2, 5); ans = n1 * n2; }
            else { n1 = getRandomInt(10, 50); n2 = getRandomInt(5, 20); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
        } else {
            op = ['+', '-', 'x', '/'][getRandomInt(0,3)];
            if (op === 'x') { n1 = getRandomInt(6, 12); n2 = getRandomInt(3, 9); ans = n1 * n2; }
            else if (op === '/') { n2 = getRandomInt(2, 9); ans = getRandomInt(4, 15); n1 = n2 * ans; }
            else { n1 = getRandomInt(50, 200); n2 = getRandomInt(20, 100); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
        }
        const dist1 = ans + getRandomInt(1, 3);
        const dist2 = Math.max(0, ans - getRandomInt(1, 3));
        items.push({ q: `${n1} ${op} ${n2} = ?`, opts: shuffle([ans, dist1, dist2]), a: ans, id: i });
    }
    return items;
};

// 3. Visual: Professional 2x2 Matrix Reasoning (Raven's Style)
const generateVisualTest = (grade: number) => {
    const items = [];
    const shapes = ['circle', 'square', 'triangle', 'diamond', 'cross', 'star'];
    
    // Logic Types: 1. Identity, 2. Rotation, 3. Addition, 4. Subtraction (Inner)
    for(let i=0; i<6; i++) {
        const logicType = i % 4; 
        let matrix = [null, null, null, null] as any[]; // TL, TR, BL, BR(Target)
        let target, distractors;

        const s1 = shapes[getRandomInt(0, 5)];
        const s2 = shapes[getRandomInt(0, 5)];

        if (logicType === 0) { // Identity (Row 1 same, Row 2 same)
            // A A
            // B ? (B)
            matrix = [
                { outer: s1, inner: s2, rotation: 0 }, { outer: s1, inner: s2, rotation: 0 },
                { outer: s2, inner: s1, rotation: 0 }, { outer: s2, inner: s1, rotation: 0 } // Target
            ];
            target = matrix[3];
            distractors = [ 
                { outer: s2, inner: s2, rotation: 0 }, 
                { outer: s1, inner: s1, rotation: 0 }, 
                { outer: s2, inner: s1, rotation: 45 } 
            ];
        } 
        else if (logicType === 1) { // Rotation Progression
            // 0   45
            // 90  ? (135)
            matrix = [
                { outer: s1, rotation: 0 }, { outer: s1, rotation: 45 },
                { outer: s1, rotation: 90 }, { outer: s1, rotation: 135 } // Target
            ];
            target = matrix[3];
            distractors = [ 
                { outer: s1, rotation: 0 }, 
                { outer: s1, rotation: 90 }, 
                { outer: s1, rotation: 180 } 
            ];
        }
        else if (logicType === 2) { // Inner Shape Addition
            // Outer only   |  Inner only
            // Both (Combined) |  ? (Complex Combined?) -> Let's simplify: Row logic
            // Col 1: Empty inner. Col 2: Filled inner.
            matrix = [
                { outer: s1, inner: null }, { outer: s1, inner: s2 },
                { outer: s2, inner: null }, { outer: s2, inner: s1 } // Target
            ];
            target = matrix[3];
            distractors = [ 
                { outer: s2, inner: null }, 
                { outer: s1, inner: s1 }, 
                { outer: s2, inner: s2 } 
            ];
        }
        else { // Fill Toggle
            // Filled   Empty
            // Empty    ? (Filled)
            matrix = [
                { outer: s1, fill: true }, { outer: s1, fill: false },
                { outer: s2, fill: false }, { outer: s2, fill: true } // Target
            ];
            target = matrix[3];
            distractors = [ 
                { outer: s2, fill: false }, 
                { outer: s1, fill: true }, 
                { outer: s1, fill: false } 
            ];
        }

        items.push({
            type: 'matrix',
            grid: matrix.slice(0, 3), // Pass first 3
            opts: shuffle([target, ...distractors]),
            a: target,
            id: i
        });
    }
    return items;
};

// 4. Attention: Adaptive Distractors
const generateAttentionTest = (grade: number) => {
    let target = 'b';
    let distractors = ['d'];
    let totalItems = 36; // 6x6 Grid

    if (grade <= 2) { 
        target = 'b'; distractors = ['d']; 
    } else if (grade <= 4) { 
        target = 'm'; distractors = ['n', 'u']; 
    } else { 
        target = 'p'; distractors = ['q', 'b', 'd']; 
    }

    const items = Array.from({ length: totalItems }).map(() => {
        const isTarget = Math.random() < 0.3; // 30% targets
        return {
            char: isTarget ? target : getRandomItems(distractors, 1)[0],
            isSelected: false,
            isCorrectTarget: isTarget
        };
    });
    return { items, targetChar: target };
};

// 5. Memory: Digit Span Backwards (Geriye Sayı Tekrarı)
const generateMemoryTest = (grade: number) => {
    const items = [];
    // Progressive difficulty: Start with 2 digits, go up to 5 or 6
    const lengths = grade <= 2 ? [2, 3, 3, 4] : (grade <= 4 ? [3, 4, 4, 5] : [3, 4, 5, 6]);
    
    for(let i=0; i<4; i++) {
        const len = lengths[i];
        const nums: number[] = [];
        while(nums.length < len) {
            const n = getRandomInt(1, 9); // 1-9 (avoid 0 for simplicity in speech)
            if(nums[nums.length-1] !== n) nums.push(n); // No immediate repeats
        }
        items.push({
            type: 'digit-span',
            sequence: nums,
            answer: [...nums].reverse().join(''), // Target is REVERSE
            id: i
        });
    }
    return items;
};

// --- COMPONENTS ---
const TestProgress = ({ current, total, label }: { current: number; total: number; label: string }) => {
    const progress = total <= 1 ? 100 : Math.min(100, Math.max(0, ((current + 1) / total) * 100));
    return (
        <div className="w-full mb-6 px-4">
            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400 mb-2 tracking-widest">
                <span className="flex items-center gap-2"><i className="fa-solid fa-list-check"></i> {label}</span>
                <span>{current + 1} / {total}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

const ObservationList = ({ observations, setProfile }: { observations: string[], setProfile: React.Dispatch<React.SetStateAction<AssessmentProfile>> }) => {
    const items = [
        "Okurken satır atlıyor veya yerini kaybediyor", 
        "b-d, p-q harflerini karıştırıyor", 
        "Heceleyerek veya çok yavaş okuyor", 
        "Yazısı okunaksız ve düzensiz", 
        "Tahtadan deftere geçirmekte zorlanıyor", 
        "Matematiksel sembolleri karıştırıyor (+ ile x)", 
        "Sağ-sol yönlerini karıştırıyor", 
        "Dikkatini toplamakta güçlük çekiyor", 
        "Eşyalarını sık sık kaybediyor veya unutuyor"
    ];
    return (
        <div className="grid grid-cols-1 gap-3">
            {items.map((obs, i) => (
                <button key={i} onClick={() => {
                    setProfile(p => ({...p, observations: p.observations.includes(obs) ? p.observations.filter(o=>o!==obs) : [...p.observations, obs]}))
                }} className={`p-4 text-left border-2 rounded-xl transition-all flex items-center gap-3 ${observations.includes(obs) ? 'bg-indigo-50 border-indigo-500 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 hover:border-indigo-200'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${observations.includes(obs) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-zinc-300'}`}>
                        {observations.includes(obs) && <i className="fa-solid fa-check text-xs"></i>}
                    </div>
                    <span className="text-sm font-medium">{obs}</span>
                </button>
            ))}
        </div>
    );
};

const TransitionScreen = ({ message, icon = "fa-spinner" }: { message: string, icon?: string }) => (
    <div className="flex flex-col items-center justify-center h-full p-12 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6 shadow-lg relative">
            <i className={`fa-solid ${icon} text-5xl text-indigo-600 dark:text-indigo-400 ${icon === 'fa-spinner' ? 'fa-spin' : 'animate-bounce'}`}></i>
        </div>
        <h3 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 text-center">Harika Gidiyorsun!</h3>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xl text-center max-w-md">{message}</p>
    </div>
);

// --- MAIN COMPONENT ---

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity }) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionMessage, setTransitionMessage] = useState('Yükleniyor...');
    
    // Memory Test specific states
    const [memoryPhase, setMemoryPhase] = useState<'show' | 'input'>('show'); // show digits or input
    const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
    const [userMemoryInput, setUserMemoryInput] = useState('');
    
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    const [profile, setProfile] = useState<AssessmentProfile>({
        studentName: '',
        gender: 'Erkek',
        age: 7, 
        grade: '1. Sınıf', 
        observations: [], 
        testResults: {}
    });
    const [report, setReport] = useState<AssessmentReport | null>(null);
    const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'wrong'>('none');

    const [testState, setTestState] = useState({
        score: 0, total: 0, startTime: 0, items: [] as any[], currentIndex: 0,
        attentionState: [] as { char: string; isSelected: boolean; isCorrectTarget: boolean }[],
        targetChar: '', // For attention test instruction
        answers: [] as boolean[]
    });

    const startTestPhase = useCallback((items: any[], isAttention = false, attentionTarget = '') => {
        setFeedbackState('none');
        if (isAttention) {
            setTestState({ score: 0, total: 1, startTime: Date.now(), items: [], currentIndex: 0, attentionState: items, targetChar: attentionTarget, answers: [] });
        } else {
            setTestState({ score: 0, total: items.length, startTime: Date.now(), items, currentIndex: 0, attentionState: [], targetChar: '', answers: [] });
            // For memory test, init phase
            if (items.length > 0 && items[0].type === 'digit-span') {
                setMemoryPhase('show');
                setCurrentDigitIndex(0);
                setUserMemoryInput('');
            }
        }
    }, []);

    // Digit Span Animation Logic
    useEffect(() => {
        if (currentStep === 6 && testState.items.length > 0 && memoryPhase === 'show') {
            const item = testState.items[testState.currentIndex];
            if (!item) return;
            
            const timer = setTimeout(() => {
                if (currentDigitIndex < item.sequence.length) {
                    setCurrentDigitIndex(prev => prev + 1);
                } else {
                    setMemoryPhase('input');
                }
            }, 1000); // 1 second per digit
            
            return () => clearTimeout(timer);
        }
    }, [currentStep, testState.currentIndex, memoryPhase, currentDigitIndex, testState.items]);

    const handleAnswer = (isCorrect: boolean, category: TestCategory, testName: string) => {
        setFeedbackState(isCorrect ? 'correct' : 'wrong');
        
        setTimeout(() => {
            setTestState(prev => {
                const nextScore = isCorrect ? prev.score + 1 : prev.score;
                const nextAnswers = [...prev.answers, isCorrect];
                
                if (prev.items && prev.currentIndex < prev.items.length - 1) {
                    const nextIndex = prev.currentIndex + 1;
                    
                    if (category === 'cognitive') {
                        setMemoryPhase('show');
                        setCurrentDigitIndex(0);
                        setUserMemoryInput('');
                    }
                    
                    setFeedbackState('none');
                    return { ...prev, score: nextScore, currentIndex: nextIndex, answers: nextAnswers };
                } else {
                    finishTestWithValues(nextScore, nextAnswers, prev.items, prev.total, prev.startTime, category, testName);
                    return prev;
                }
            });
        }, 800); 
    };

    const finishTestWithValues = (finalScore: number, finalAnswers: boolean[], items: any[], total: number, startTime: number, category: TestCategory, testName: string) => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        const accuracy = total > 0 ? (finalScore / total) * 100 : 0;
        
        if (category === 'reading') {
             // Calculate specific scores for lexical vs sentence
             let lexCorrect = 0, lexTotal = 0;
             items.forEach((item, idx) => { if (item.subtype === 'lexical') { lexTotal++; if (finalAnswers[idx]) lexCorrect++; } });
             const lexScore = lexTotal > 0 ? Math.round((lexCorrect/lexTotal)*100) : 0;
             setProfile(prev => ({ ...prev, observations: [...prev.observations, `Kelime Tanıma: %${lexScore}`] }));
        }

        saveResult(category, testName, finalScore, total, accuracy, duration);
    };

    const saveResult = (id: TestCategory, name: string, score: number, total: number, accuracy: number, duration: number) => {
        setProfile(prev => ({
            ...prev,
            testResults: {
                ...prev.testResults,
                [id]: { id, name, score, total, accuracy, duration, timestamp: Date.now() }
            }
        }));
        setFeedbackState('none');
        
        let nextMsg = "Sonraki aşama...";
        if (id === 'reading') nextMsg = "Matematik Testi Hazırlanıyor";
        if (id === 'math') nextMsg = "Dikkat Testi Hazırlanıyor";
        if (id === 'attention') nextMsg = "Görsel Mantık Testi Hazırlanıyor";
        if (id === 'visual') nextMsg = "İşleyen Bellek Testi Hazırlanıyor";
        if (id === 'cognitive') nextMsg = "Testler Tamamlandı!";

        triggerTransition(nextMsg, currentStep + 1);
    };

    const triggerTransition = (msg: string, nextStepIndex: number) => {
        setIsTransitioning(true);
        setTransitionMessage(msg);
        setTestState(prev => ({ ...prev, items: [], attentionState: [], answers: [], currentIndex: 0 }));
        setTimeout(() => { setCurrentStep(nextStepIndex); setIsTransitioning(false); }, 1500);
    };

    // State Initialization based on Step
    useEffect(() => {
        if (isTransitioning) return;
        const gradeInt = parseInt(profile.grade) || 1;

        if (currentStep === 2 && testState.items.length === 0) startTestPhase(generateReadingTest(gradeInt));
        else if (currentStep === 3 && testState.items.length === 0) startTestPhase(generateMathTest(gradeInt));
        else if (currentStep === 4 && testState.attentionState.length === 0) {
            const { items, targetChar } = generateAttentionTest(gradeInt);
            startTestPhase(items, true, targetChar);
        }
        else if (currentStep === 5 && testState.items.length === 0) startTestPhase(generateVisualTest(gradeInt));
        else if (currentStep === 6 && testState.items.length === 0) startTestPhase(generateMemoryTest(gradeInt));
        else if (currentStep === 8 && !report && !isLoading) handleReportGeneration();
    }, [currentStep, isTransitioning, profile.grade]);

    const handleReportGeneration = async () => {
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            const result = await generateAssessmentReport(profile);
            if (result) {
                setReport(result);
                if (user) assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, result).catch(console.error);
                setCurrentStep(9);
            }
        } catch (error) {
            console.error(error);
            alert("Rapor oluşturulamadı.");
            setCurrentStep(7);
        } finally { setIsLoading(false); }
    };

    // --- RENDER HELPERS ---
    const isTestReady = (isAttention = false) => {
        if (isTransitioning) return false;
        if (isAttention) return testState.attentionState && testState.attentionState.length > 0;
        return testState.items && testState.items.length > 0 && !!testState.items?.[testState.currentIndex];
    };

    const currentItem = testState.items?.[testState.currentIndex];

    // Manual Save & Share Handlers
    const handleManualSave = async () => {
        if (!user || !report) return;
        setSaving(true);
        try {
            await assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, report);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (e) { alert('Hata oluştu.'); } finally { setSaving(false); }
    };

    const handleManualShare = async (receiverId: string) => {
        if (!user || !report) return;
        try {
            await assessmentService.shareAssessment({
                id: 'temp', userId: user.id, studentName: profile.studentName, gender: profile.gender, age: profile.age, grade: profile.grade, report: report, createdAt: new Date().toISOString()
            }, user.id, user.name, receiverId);
            alert('Paylaşıldı.'); setIsShareModalOpen(false);
        } catch (e) { alert('Hata oluştu.'); }
    };

    const handlePrint = () => { window.print(); };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 font-sans">
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleManualShare} />
            
            <div className="px-4 py-4 bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 shadow-sm z-20 flex justify-between items-center sticky top-0 no-print">
                <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 font-bold text-sm flex items-center"><i className="fa-solid fa-arrow-left mr-2"></i>Çıkış</button>
                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar">
                    {steps.map((s, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${i === currentStep ? 'bg-indigo-600 scale-125' : i < currentStep ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'} transition-all`} title={s}></div>
                            {i < steps.length - 1 && <div className={`w-4 md:w-8 h-0.5 ${i < currentStep ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}></div>}
                        </div>
                    ))}
                </div>
                <div className="w-16"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start md:items-center">
                <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden relative min-h-[550px] transition-all printable-area-assessment">
                    
                    {feedbackState !== 'none' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[2px] transition-all animate-in fade-in">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl scale-110 ${feedbackState === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                                <i className={`fa-solid fa-${feedbackState === 'correct' ? 'check' : 'xmark'} text-6xl text-white`}></i>
                            </div>
                        </div>
                    )}

                    {isTransitioning && <div className="absolute inset-0 z-40 bg-white dark:bg-zinc-800"><TransitionScreen message={transitionMessage} icon="fa-hourglass-half" /></div>}

                    {/* STEP 0: INTRO */}
                    {currentStep === 0 && (
                        <div className="p-10 text-center flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-800 dark:to-zinc-900">
                            <div className="w-28 h-28 bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center mb-8 shadow-xl animate-pulse">
                                <i className="fa-solid fa-brain text-6xl text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-zinc-800 dark:text-zinc-100">Bilişsel Değerlendirme</h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 max-w-md">Öğrencinin Okuma, Matematik, Dikkat ve Görsel Algı becerilerini analiz ederek kişiselleştirilmiş eğitim rotası oluşturun.</p>
                            <button onClick={() => setCurrentStep(1)} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-lg flex items-center gap-3">Analizi Başlat <i className="fa-solid fa-arrow-right"></i></button>
                        </div>
                    )}

                    {/* STEP 1: PROFILE */}
                    {currentStep === 1 && (
                        <div className="p-4 sm:p-8 flex flex-col flex-1 max-w-lg mx-auto w-full">
                            <h3 className="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-zinc-100">Öğrenci Profili</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold mb-2">Cinsiyet</label>
                                    <div className="flex gap-4">
                                        <button onClick={() => setProfile({...profile, gender: 'Erkek'})} className={`flex-1 p-3 border-2 rounded-xl font-bold ${profile.gender === 'Erkek' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-zinc-200'}`}>Erkek</button>
                                        <button onClick={() => setProfile({...profile, gender: 'Kız'})} className={`flex-1 p-3 border-2 rounded-xl font-bold ${profile.gender === 'Kız' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-zinc-200'}`}>Kız</button>
                                    </div>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-600">
                                    <div className="flex justify-between items-center mb-4"><label className="font-bold text-lg">Yaş</label><span className="text-2xl font-black text-indigo-600">{profile.age}</span></div>
                                    <input type="range" min="5" max="15" value={profile.age} onChange={e => setProfile({...profile, age: +e.target.value})} className="w-full h-3 bg-zinc-200 rounded-lg accent-indigo-600" />
                                </div>
                                <div>
                                    <label className="block font-bold mb-3 text-lg">Sınıf</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => (
                                            <button key={g} onClick={() => setProfile({...profile, grade: g})} className={`p-4 border-2 rounded-xl font-bold text-sm ${profile.grade === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-zinc-200'}`}>{g}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto pt-6">
                                <input type="text" value={profile.studentName} onChange={e => setProfile({...profile, studentName: e.target.value})} className="w-full p-3 border-2 rounded-xl bg-white dark:bg-zinc-700 placeholder:text-zinc-400 outline-none mb-4" placeholder="Öğrenci Adı Soyadı" />
                                <button onClick={() => { if(!profile.studentName) return; triggerTransition('Okuma Testi Hazırlanıyor...', 2); }} className="py-4 w-full bg-zinc-900 dark:bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-md">Devam Et</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: READING */}
                    {currentStep === 2 && isTestReady() && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Okuma Testi" /></div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                {currentItem?.subtype === 'lexical' ? (
                                    <>
                                        <h3 className="text-lg font-bold text-zinc-400 mb-6 uppercase tracking-widest"><i className="fa-solid fa-font mr-2"></i>Bu kelime gerçek mi?</h3>
                                        <div className="text-5xl md:text-7xl font-black mb-12 p-10 bg-white dark:bg-zinc-700 border-4 border-zinc-100 dark:border-zinc-600 rounded-3xl w-full max-w-md shadow-sm text-zinc-800 dark:text-zinc-100 font-dyslexic">{currentItem?.q}</div>
                                        <div className="flex gap-6 w-full max-w-md">
                                            <button onClick={() => handleAnswer(currentItem?.isReal === false, 'reading', 'Okuma')} className="flex-1 p-5 bg-rose-50 text-rose-600 font-black rounded-2xl border-b-4 border-rose-200 shadow-sm active:scale-95"><i className="fa-solid fa-xmark mr-2"></i> HAYIR</button>
                                            <button onClick={() => handleAnswer(currentItem?.isReal === true, 'reading', 'Okuma')} className="flex-1 p-5 bg-emerald-50 text-emerald-600 font-black rounded-2xl border-b-4 border-emerald-200 shadow-sm active:scale-95"><i className="fa-solid fa-check mr-2"></i> EVET</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-bold text-zinc-400 mb-6 uppercase tracking-widest">Cümleyi Tamamla</h3>
                                        <div className="text-2xl md:text-3xl font-bold mb-12 p-8 bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-100 rounded-2xl w-full max-w-2xl text-zinc-800 dark:text-zinc-100 font-dyslexic">{currentItem?.q}</div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                                            {currentItem?.opts?.map((opt: string, i: number) => (
                                                <button key={i} onClick={() => handleAnswer(opt === currentItem?.a, 'reading', 'Okuma')} className="p-4 bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl text-lg font-bold hover:border-sky-500 hover:text-sky-600 shadow-sm active:scale-95">{opt}</button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: MATH */}
                    {currentStep === 3 && isTestReady() && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Matematik Testi" /></div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <div className="text-4xl md:text-6xl font-bold mb-10 text-indigo-900 dark:text-indigo-200 font-mono bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border-2 border-indigo-100 w-full max-w-lg">{currentItem?.q}</div>
                                <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                                    {currentItem?.opts?.map((opt: number, i:number) => (
                                        <button key={i} onClick={() => handleAnswer(opt === currentItem?.a, 'math', 'Matematik')} className="p-6 bg-white dark:bg-zinc-700 border-2 border-zinc-200 text-3xl font-bold rounded-2xl hover:border-indigo-500 hover:text-indigo-600 shadow-sm active:scale-95">{opt}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: ATTENTION (Grid) */}
                    {currentStep === 4 && isTestReady(true) && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="pt-6 px-6 flex justify-between items-center border-b pb-4 border-zinc-100 dark:border-zinc-700">
                                <div><h3 className="font-bold text-lg">Dikkat Testi</h3><p className="text-xs text-zinc-500">Sadece "<span className="font-bold text-indigo-600">{testState.targetChar}</span>" harflerini işaretle.</p></div>
                                <button onClick={() => {
                                    let score = 0, total = 0;
                                    testState.attentionState.forEach(i => { if(i.isCorrectTarget) total++; if(i.isSelected && i.isCorrectTarget) score++; if(i.isSelected && !i.isCorrectTarget) score-=0.5; });
                                    const acc = total > 0 ? (Math.max(0,score)/total)*100 : 0;
                                    setProfile(p => ({...p, testResults: {...p.testResults, 'attention': {id:'attention', name:'Dikkat', score: Math.max(0,score), total, accuracy: acc, duration: 60, timestamp: Date.now()}}}));
                                    triggerTransition("Görsel Mantık Testi Hazırlanıyor...", 5);
                                }} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full shadow-md">Tamamla</button>
                            </div>
                            <div className="p-4 flex-1 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                <div className="grid grid-cols-6 gap-2 md:gap-4">
                                    {testState.attentionState.map((item, i) => (
                                        <button key={i} onClick={() => setTestState(p => { const n = [...p.attentionState]; n[i].isSelected = !n[i].isSelected; return {...p, attentionState: n}; })} 
                                            className={`w-10 h-10 md:w-14 md:h-14 rounded-lg text-2xl md:text-3xl font-bold flex items-center justify-center font-dyslexic shadow-sm border transition-all ${item.isSelected ? 'bg-indigo-600 text-white border-indigo-600 scale-110' : 'bg-white dark:bg-zinc-800 border-zinc-200 text-zinc-400 hover:border-indigo-300'}`}>
                                            {item.char}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: VISUAL (Raven's Matrices) */}
                    {currentStep === 5 && isTestReady() && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Görsel Mantık (Matris)" /></div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                <h3 className="text-zinc-500 font-bold mb-4 uppercase tracking-wider text-xs">Eksik Parçayı Bul</h3>
                                <div className="mb-8 grid grid-cols-2 gap-4 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-inner border-2 border-zinc-200 dark:border-zinc-700 max-w-md w-full">
                                    {currentItem?.grid?.map((item: any, i: number) => (
                                        <MatrixCell key={i} item={item} className="w-full aspect-square rounded-lg shadow-sm" />
                                    ))}
                                    <div className="w-full aspect-square bg-white dark:bg-zinc-800 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center"><span className="text-4xl font-bold text-indigo-300">?</span></div>
                                </div>
                                <div className="flex gap-4 justify-center w-full max-w-2xl flex-wrap">
                                    {currentItem?.opts?.map((opt: any, i:number) => (
                                        <button key={i} onClick={() => handleAnswer(opt === currentItem?.a, 'visual', 'Görsel Algı')} className="w-20 h-20 md:w-24 md:h-24 hover:scale-105 transition-transform focus:outline-none">
                                            <MatrixCell item={opt} className="w-full h-full rounded-xl shadow-md hover:border-indigo-500 hover:ring-2 hover:ring-indigo-300" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: MEMORY (Digit Span Backwards) */}
                    {currentStep === 6 && isTestReady() && (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="İşleyen Bellek (Geriye Sayı)" /></div>
                            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                {memoryPhase === 'show' ? (
                                    <div className="animate-in zoom-in duration-300">
                                        <h3 className="text-lg font-bold text-zinc-400 mb-8 uppercase tracking-widest">Sayıları Aklında Tut</h3>
                                        {currentDigitIndex < currentItem.sequence.length ? (
                                            <div className="text-9xl font-black text-indigo-600 dark:text-indigo-400 transition-all scale-110">
                                                {currentItem.sequence[currentDigitIndex]}
                                            </div>
                                        ) : (
                                            <div className="text-2xl font-bold text-zinc-500">Hazırlan...</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-300 w-full max-w-sm">
                                        <h3 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100"><i className="fa-solid fa-rotate-left mr-2 text-indigo-500"></i>Sayıları TERSTEN Yaz</h3>
                                        <div className="mb-6 h-16 w-full bg-zinc-100 dark:bg-zinc-700 rounded-xl flex items-center justify-center text-3xl font-mono tracking-widest border-2 border-indigo-200">
                                            {userMemoryInput}
                                            <span className="animate-pulse w-2 h-8 bg-indigo-500 ml-1"></span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[1,2,3,4,5,6,7,8,9].map(n => (
                                                <button key={n} onClick={() => setUserMemoryInput(p => p + n)} className="h-16 bg-white dark:bg-zinc-800 rounded-xl border-b-4 border-zinc-200 dark:border-zinc-700 text-2xl font-bold active:border-b-0 active:translate-y-1 transition-all shadow-sm">{n}</button>
                                            ))}
                                            <button onClick={() => setUserMemoryInput(p => p.slice(0,-1))} className="h-16 bg-rose-50 text-rose-600 rounded-xl border-b-4 border-rose-200 font-bold active:border-b-0 active:translate-y-1"><i className="fa-solid fa-delete-left"></i></button>
                                            <button onClick={() => setUserMemoryInput(p => p + '0')} className="h-16 bg-white dark:bg-zinc-800 rounded-xl border-b-4 border-zinc-200 text-2xl font-bold active:border-b-0 active:translate-y-1">0</button>
                                            <button onClick={() => handleAnswer(userMemoryInput === currentItem.answer, 'cognitive', 'İşleyen Bellek')} className="h-16 bg-emerald-500 text-white rounded-xl border-b-4 border-emerald-700 font-bold active:border-b-0 active:translate-y-1"><i className="fa-solid fa-check"></i></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 7: OBSERVATIONS */}
                    {currentStep === 7 && (
                        <div className="p-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-2xl font-bold mb-2 text-center">Eğitmen Gözlemleri</h3>
                            <p className="text-center text-zinc-500 mb-6">Lütfen öğrenciyle ilgili gözlemlediğiniz durumları işaretleyin.</p>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                                <ObservationList observations={profile.observations} setProfile={setProfile} />
                            </div>
                            <button onClick={() => handleReportGeneration()} className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                {isLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Analiz Ediliyor...</> : 'Raporu Oluştur'}
                            </button>
                        </div>
                    )}

                    {/* STEP 9: REPORT DISPLAY (Standard Layout) */}
                    {currentStep === 9 && report && (
                        <div className="flex flex-col h-full animate-in zoom-in duration-500 bg-white dark:bg-zinc-900">
                            {/* Toolbar */}
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-30 no-print">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                                        <i className="fa-solid fa-file-medical text-indigo-500"></i>
                                        {profile.studentName}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Bilişsel Değerlendirme Raporu • {new Date().toLocaleDateString('tr-TR')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {user && (
                                        <>
                                            <button onClick={handleManualSave} disabled={saving} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${savedSuccess ? 'bg-green-100 text-green-700' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>
                                                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : savedSuccess ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>}
                                                <span className="hidden sm:inline">{savedSuccess ? 'Kaydedildi' : 'Kaydet'}</span>
                                            </button>
                                            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"><i className="fa-solid fa-share-nodes"></i><span className="hidden sm:inline">Paylaş</span></button>
                                        </>
                                    )}
                                    <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"><i className="fa-solid fa-print"></i><span>Yazdır / PDF</span></button>
                                </div>
                            </div>
                            
                            {/* Report Content */}
                            <div className="assessment-report-container flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="hidden print:block mb-8 border-b-2 border-zinc-800 pb-4">
                                    <h1 className="text-3xl font-black">Bursa Disleksi AI - Öğrenci Değerlendirme Raporu</h1>
                                    <div className="flex justify-between mt-4"><p><strong>Öğrenci:</strong> {profile.studentName}</p><p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p></div>
                                </div>
                                <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-800 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm mb-8">
                                    <h4 className="text-indigo-900 dark:text-indigo-100 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-clipboard-check"></i> Genel Değerlendirme</h4>
                                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg">{report.overallSummary}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid">
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center">
                                        <h4 className="font-bold text-zinc-500 text-sm uppercase tracking-widest mb-6">Beceriler Analizi</h4>
                                        <div className="w-full max-w-xs">{report.chartData && <RadarChart data={report.chartData} />}</div>
                                    </div>
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center space-y-5">
                                        {Object.entries(report.scores).map(([key, value]) => {
                                            const score = value as number;
                                            const label = key === 'reading' ? 'Okuma' : key === 'math' ? 'Matematik' : key === 'attention' ? 'Dikkat' : key === 'cognitive' ? 'İşleyen Bellek' : 'Yazma';
                                            const color = score < 30 ? 'bg-green-500' : score < 70 ? 'bg-yellow-500' : 'bg-red-500';
                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between mb-1"><span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">{label}</span><span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{score}/100 Risk</span></div>
                                                    <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }}></div></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2 text-lg"><i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler</h4>
                                        <ul className="space-y-3">{report.analysis.strengths.map((s, i) => <li key={i} className="flex items-start gap-3 text-emerald-900 dark:text-emerald-100"><i className="fa-solid fa-check mt-1 text-emerald-500"></i><span>{s}</span></li>)}</ul>
                                    </div>
                                    <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                                        <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-4 flex items-center gap-2 text-lg"><i className="fa-solid fa-chart-line"></i> Gelişim Alanları</h4>
                                        <ul className="space-y-3">{report.analysis.weaknesses.map((s, i) => <li key={i} className="flex items-start gap-3 text-rose-900 dark:text-rose-100"><i className="fa-solid fa-arrow-trend-up mt-1 text-rose-500"></i><span>{s}</span></li>)}</ul>
                                    </div>
                                </div>
                                <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl break-inside-avoid">
                                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-700 pb-4"><div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center"><i className="fa-solid fa-route text-xl"></i></div><h4 className="text-xl font-bold">Önerilen Eğitim Planı</h4></div>
                                    <div className="space-y-4">{report.roadmap.map((item, idx) => (
                                        <div key={idx} onClick={() => onSelectActivity(item.activityId as ActivityType)} className="bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer group">
                                            <span className="font-mono text-2xl font-bold text-zinc-600 group-hover:text-indigo-400 transition-colors">0{idx+1}</span>
                                            <div className="flex-1"><h5 className="font-bold text-lg text-indigo-300 group-hover:text-white transition-colors mb-1">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</h5><p className="text-sm text-zinc-400">{item.reason}</p></div>
                                            <div className="px-4 py-2 bg-zinc-900 rounded-lg text-xs font-bold text-zinc-300 uppercase tracking-wider border border-zinc-700">{item.frequency}</div>
                                            <i className="fa-solid fa-chevron-right text-zinc-600 group-hover:text-white transition-colors"></i>
                                        </div>
                                    ))}</div>
                                </div>
                                <div className="hidden print:block mt-8 pt-4 border-t border-zinc-300 text-center text-xs text-zinc-500">Bu rapor Bursa Disleksi AI tarafından otomatik olarak oluşturulmuştur.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
