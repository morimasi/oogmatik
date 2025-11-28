import React, { useState, useEffect, useCallback } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType, TestCategory, User, SavedAssessment } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';
import { RadarChart } from './RadarChart';
import { useAuth } from '../context/AuthContext';
import { assessmentService } from '../services/assessmentService';
import { authService } from '../services/authService';
import { ShareModal } from './ShareModal';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
}

const steps = ['Giriş', 'Profil', 'Okuma', 'Matematik', 'Dikkat', 'Görsel', 'Bellek', 'Gözlem', 'Analiz', 'Sonuç'];

// --- UTILS ---
const shuffle = <T,>(array: T[]): T[] => {
    if (!array) return [];
    return [...array].sort(() => Math.random() - 0.5);
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// --- VISUAL ASSETS ---
// Professional SVG Matrix Renderer
const MatrixCell: React.FC<{ item: any; className?: string }> = ({ item, className = "" }) => {
    if (!item) return <div className={`${className} bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-600`}></div>;

    const { type, rotation = 0, count = 1, fill = false, shape = 'circle' } = item;
    
    return (
        <div className={`${className} bg-white dark:bg-zinc-800 border-2 border-zinc-800 dark:border-zinc-400 flex items-center justify-center relative overflow-hidden transition-all duration-300`}>
            <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
                <g transform={`rotate(${rotation}, 50, 50)`} style={{ transition: 'transform 0.3s' }}>
                    {type === 'line' && (
                        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-zinc-800 dark:text-zinc-200" />
                    )}
                    {type === 'arrow' && (
                        <path d="M 50 10 L 50 90 M 50 10 L 30 30 M 50 10 L 70 30" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800 dark:text-zinc-200" />
                    )}
                    {type === 'shape' && (
                        <>
                            {shape === 'circle' && <circle cx="50" cy="50" r="35" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="6" className="text-zinc-800 dark:text-zinc-200" />}
                            {shape === 'square' && <rect x="15" y="15" width="70" height="70" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="6" className="text-zinc-800 dark:text-zinc-200" />}
                            {shape === 'triangle' && <polygon points="50,15 85,85 15,85" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="6" className="text-zinc-800 dark:text-zinc-200" />}
                            {count > 1 && <circle cx="50" cy="50" r="12" fill={fill ? "white" : "currentColor"} className={fill ? "text-zinc-800" : "text-zinc-800 dark:text-zinc-200"} />}
                        </>
                    )}
                    {type === 'grid' && (
                        <g>
                            <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-300" />
                            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="2" className="text-zinc-300" />
                            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="2" className="text-zinc-300" />
                            {count === 1 && <rect x="12" y="12" width="36" height="36" rx="4" fill="currentColor" className="text-zinc-800 dark:text-zinc-200" />}
                            {count === 2 && <rect x="52" y="12" width="36" height="36" rx="4" fill="currentColor" className="text-zinc-800 dark:text-zinc-200" />}
                            {count === 3 && <rect x="52" y="52" width="36" height="36" rx="4" fill="currentColor" className="text-zinc-800 dark:text-zinc-200" />}
                            {count === 4 && <rect x="12" y="52" width="36" height="36" rx="4" fill="currentColor" className="text-zinc-800 dark:text-zinc-200" />}
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
};

// --- GENERATORS ---
const createGradeAppropriateMatrix = (grade: number, index: number) => {
    const difficultyLevel = grade <= 2 ? 0 : (grade <= 4 ? 1 : 2);
    const type = index < 2 ? (difficultyLevel === 0 ? 'shape' : 'arrow') : (index < 4 ? (difficultyLevel === 1 ? 'arrow' : 'grid') : 'grid');
    
    if (type === 'shape') {
        const shapes = ['circle', 'square', 'triangle'];
        const base = shapes[getRandomInt(0, 2)];
        const other = shapes.find(s => s !== base) || 'triangle';
        const fill = Math.random() > 0.5;
        return {
            grid: [
                { type: 'shape', shape: base, count: 1, fill },
                { type: 'shape', shape: base, count: 2, fill },
                { type: 'shape', shape: other, count: 1, fill }
            ],
            target: { type: 'shape', shape: other, count: 2, fill },
            distractors: [
                { type: 'shape', shape: base, count: 2, fill },
                { type: 'shape', shape: other, count: 1, fill: !fill }
            ]
        };
    }
    
    if (type === 'arrow') {
        const startRot = getRandomInt(0, 3) * 90;
        const step = difficultyLevel === 0 ? 90 : 45;
        return {
            grid: [0, 1, 2].map(i => ({ type: 'arrow', rotation: (startRot + i * step) % 360 })),
            target: { type: 'arrow', rotation: (startRot + 3 * step) % 360 },
            distractors: [
                { type: 'arrow', rotation: (startRot + 2 * step + 180) % 360 },
                { type: 'arrow', rotation: (startRot + 180) % 360 }
            ]
        };
    }

    const startPos = getRandomInt(1, 2);
    return {
        grid: [0, 1, 2].map(i => ({ type: 'grid', count: ((startPos + i - 1) % 4) + 1 })),
        target: { type: 'grid', count: ((startPos + 3 - 1) % 4) + 1 },
        distractors: [
            { type: 'grid', count: ((startPos + 1 - 1) % 4) + 1 },
            { type: 'grid', count: ((startPos + 2 - 1) % 4) + 1 }
        ]
    };
};

const generateDynamicTest = (category: TestCategory, gradeStr: string) => {
    const grade = parseInt(gradeStr.split('.')[0]) || 1;
    
    if (category === 'reading') {
        const items = [];
        let realWords: string[] = [], fakeWords: string[] = [];
        if (grade <= 2) {
            realWords = ['Elma', 'Kapı', 'Masa', 'Oyun', 'Baba', 'Anne', 'Okul', 'Kedi'];
            fakeWords = ['Elmu', 'Kapi', 'Maso', 'Oyon', 'Bubu', 'Anni', 'Ukul', 'Kidi'];
        } else if (grade <= 4) {
            realWords = ['Sandalye', 'Pencere', 'Öğretmen', 'Kardeş', 'Telefon', 'Bahçe', 'Yastık', 'Gömlek'];
            fakeWords = ['Sandelye', 'Pencire', 'Öğretman', 'Kardaş', 'Telofon', 'Bahça', 'Yastik', 'Gömle'];
        } else {
            realWords = ['Cumhuriyet', 'Sorumluluk', 'Teknoloji', 'Mühendis', 'Biyoloji', 'Edebiyat', 'Medeniyet', 'Özgürlük'];
            fakeWords = ['Cumhuriye', 'Sorumlulu', 'Tekneloji', 'Mühindis', 'Biyoliji', 'Edebiyta', 'Medeniye', 'Özgürlü'];
        }
        
        for(let i=0; i<6; i++) {
            const isReal = Math.random() > 0.5;
            items.push({ subtype: 'lexical', q: isReal ? realWords[i] : fakeWords[i], isReal, id: `lex-${i}` });
        }

        let sentences: {q: string, opts: string[], a: string}[] = [];
        if (grade <= 2) {
            sentences = [
                { q: "Ali topu ___.", opts: ["attı", "yedi", "uyudu"], a: "attı" },
                { q: "Ayşe okula ___.", opts: ["gitti", "uçtu", "yüzdü"], a: "gitti" },
                { q: "Kedi süt ___.", opts: ["içti", "giydi", "yazdı"], a: "içti" },
                { q: "Gökyüzü ___ renktir.", opts: ["mavi", "kare", "ekşi"], a: "mavi" }
            ];
        } else if (grade <= 4) {
            sentences = [
                { q: "Hava soğuk olduğu için ___ giydim.", opts: ["mont", "mayo", "terlik"], a: "mont" },
                { q: "Dişlerimizi fırçalamak ___ için önemlidir.", opts: ["sağlık", "uyku", "oyun"], a: "sağlık" },
                { q: "Trafik ışığı kırmızı yanınca ___.", opts: ["durmalıyız", "geçmeliyiz", "koşmalıyız"], a: "durmalıyız" },
                { q: "Kitap okumak kelime hazinemizi ___.", opts: ["geliştirir", "azaltır", "yorar"], a: "geliştirir" }
            ];
        } else {
            sentences = [
                { q: "Başarılı olmak için disiplinli ___ gerekir.", opts: ["çalışmak", "uyumak", "gezmek"], a: "çalışmak" },
                { q: "Empati, başkalarının duygularını ___ demektir.", opts: ["anlamak", "yargılamak", "yok saymak"], a: "anlamak" },
                { q: "Erozyonu önlemek için ___ dikmeliyiz.", opts: ["ağaç", "bina", "direk"], a: "ağaç" },
                { q: "Bilimsel deneyler ___ ortamında yapılır.", opts: ["laboratuvar", "kütüphane", "spor salonu"], a: "laboratuvar" }
            ];
        }
        items.push(...shuffle(sentences).map((s, i) => ({ subtype: 'sentence', q: s.q, opts: s.opts, a: s.a, id: `sent-${i}` })));
        
        return items;
    }
    
    if (category === 'math') {
        const items = [];
        for(let i=0; i<8; i++) {
            let n1=0, n2=0, op='', ans=0;
            if (grade === 1) {
                n1 = getRandomInt(1, 10); n2 = getRandomInt(1, 10); op = Math.random() > 0.5 ? '+' : '-';
                if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
                ans = op === '+' ? n1 + n2 : n1 - n2;
            } else if (grade === 2) {
                n1 = getRandomInt(10, 50); n2 = getRandomInt(1, 20); op = Math.random() > 0.5 ? '+' : '-';
                if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
                ans = op === '+' ? n1 + n2 : n1 - n2;
            } else if (grade === 3) {
                op = Math.random() > 0.3 ? (Math.random() > 0.5 ? '+' : '-') : 'x';
                if (op === 'x') { n1 = getRandomInt(1, 9); n2 = getRandomInt(1, 9); ans = n1 * n2; }
                else { n1 = getRandomInt(20, 100); n2 = getRandomInt(10, 50); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
            } else if (grade === 4) {
                op = ['+', '-', 'x', '/'][getRandomInt(0,3)];
                if (op === 'x') { n1 = getRandomInt(5, 12); n2 = getRandomInt(2, 9); ans = n1 * n2; }
                else if (op === '/') { n2 = getRandomInt(2, 9); ans = getRandomInt(2, 12); n1 = n2 * ans; }
                else { n1 = getRandomInt(50, 200); n2 = getRandomInt(20, 100); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
            } else {
                op = ['+', '-', 'x', '/'][getRandomInt(0,3)];
                if (op === 'x') { n1 = getRandomInt(10, 25); n2 = getRandomInt(2, 9); ans = n1 * n2; }
                else if (op === '/') { n2 = getRandomInt(3, 12); ans = getRandomInt(5, 20); n1 = n2 * ans; }
                else { n1 = getRandomInt(100, 999); n2 = getRandomInt(50, 500); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
            }
            const dist1 = ans + getRandomInt(1, 5);
            const dist2 = Math.max(0, ans - getRandomInt(1, 5));
            const opts = shuffle([ans, dist1, dist2]);
            items.push({ q: `${n1} ${op} ${n2} = ?`, opts, a: ans, id: i });
        }
        return items;
    }

    if (category === 'visual') {
        const items = [];
        for(let i=0; i<6; i++) {
            const matrix = createGradeAppropriateMatrix(grade, i);
            items.push({
                type: 'matrix',
                grid: matrix.grid,
                opts: shuffle([matrix.target, ...matrix.distractors]),
                a: matrix.target,
                id: i
            });
        }
        return items;
    }

    if (category === 'attention') {
        let targets = ['b'], distractors = ['d'];
        let totalItems = 30;
        if (grade <= 2) { targets = ['O']; distractors = ['Q', 'C']; totalItems = 24; } 
        else if (grade <= 4) { targets = ['b']; distractors = ['d']; totalItems = 36; } 
        else { targets = ['b']; distractors = ['d', 'p', 'q', 'h']; totalItems = 48; }

        const gridItems = Array.from({ length: totalItems }).map(() => {
            const isTarget = Math.random() < 0.25;
            const char = isTarget ? targets[0] : distractors[getRandomInt(0, distractors.length-1)];
            return { char, isSelected: false, isCorrectTarget: isTarget };
        });
        return gridItems;
    }

    if (category === 'cognitive') {
        const items = [];
        const len = grade <= 2 ? 3 : (grade <= 4 ? 4 : 5);
        const icons = ['apple-whole', 'car', 'dog', 'cat', 'sun', 'moon', 'tree', 'fish', 'star', 'heart']; 
        for(let i=0; i<5; i++) {
            const seq = [];
            const pool = [...icons];
            for(let k=0; k<len; k++) {
                const idx = getRandomInt(0, pool.length-1);
                seq.push(pool[idx]);
                pool.splice(idx, 1);
            }
            const correctOpt = [...seq];
            const dist1 = [...seq]; [dist1[0], dist1[1]] = [dist1[1], dist1[0]];
            const dist2 = [...seq]; [dist2[len-1], dist2[len-2]] = [dist2[len-2], dist2[len-1]];
            items.push({ type: 'sequence', seq: seq, opts: shuffle([correctOpt, dist1, dist2]), a: correctOpt, id: i });
        }
        return items;
    }
    return [];
};

// --- COMPONENTS ---
const TestProgress = ({ current, total, label }: { current: number; total: number; label: string }) => {
    const isSinglePage = total <= 1; 
    const progress = isSinglePage ? 100 : Math.min(100, Math.max(0, ((current + 1) / total) * 100));
    return (
        <div className="w-full mb-6 px-4">
            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400 mb-2 tracking-widest">
                <span className="flex items-center gap-2"><i className="fa-solid fa-list-check"></i> {label}</span>
                <span>{isSinglePage ? 'Tek Aşama' : `${current + 1} / ${total}`}</span>
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
    const [isMemorizing, setIsMemorizing] = useState(false);
    
    // Save/Share States
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
        answers: [] as boolean[]
    });

    // --- LOGIC ---
    const startTestPhase = useCallback((items: any[], isAttention = false) => {
        setFeedbackState('none');
        setIsMemorizing(false);
        
        if (isAttention) {
            setTestState({ 
                score: 0, total: 1, startTime: Date.now(), items: [], currentIndex: 0,
                attentionState: items, answers: [] 
            });
        } else {
            setTestState({ 
                score: 0, total: items.length, startTime: Date.now(), items, currentIndex: 0,
                attentionState: [], answers: [] 
            });
            if (items.length > 0 && items[0]?.type === 'sequence') {
                setIsMemorizing(true);
            }
        }
    }, []);

    useEffect(() => {
        if (isMemorizing) {
            const timer = setTimeout(() => {
                setIsMemorizing(false);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [isMemorizing]);

    const handleAnswer = (isCorrect: boolean, category: TestCategory, testName: string) => {
        setFeedbackState(isCorrect ? 'correct' : 'wrong');
        
        setTimeout(() => {
            setTestState(prev => {
                const nextScore = isCorrect ? prev.score + 1 : prev.score;
                const nextAnswers = [...prev.answers, isCorrect];
                
                if (prev.items && prev.currentIndex < prev.items.length - 1) {
                    const nextIndex = prev.currentIndex + 1;
                    const nextItem = prev.items[nextIndex];
                    if (category === 'cognitive' && nextItem?.type === 'sequence') {
                        setIsMemorizing(true);
                    }
                    setFeedbackState('none');
                    return { ...prev, score: nextScore, currentIndex: nextIndex, answers: nextAnswers };
                } else {
                    finishTestWithValues(nextScore, nextAnswers, prev.items, prev.total, prev.startTime, category, testName);
                    return prev;
                }
            });
        }, 1000); 
    };

    const handleAttentionClick = (index: number) => {
        setTestState(prev => {
            const newState = [...prev.attentionState];
            if(newState[index]) {
                newState[index] = { ...newState[index], isSelected: !newState[index].isSelected };
            }
            return { ...prev, attentionState: newState };
        });
    };

    const finishAttentionTest = () => {
        let score = 0;
        let totalTargets = 0;
        testState.attentionState.forEach(item => {
            if (item.isCorrectTarget) totalTargets++;
            if (item.isSelected && item.isCorrectTarget) score++;
            if (item.isSelected && !item.isCorrectTarget) score -= 0.5;
        });
        score = Math.max(0, score);
        
        const accuracy = totalTargets > 0 ? Math.min(100, (score / totalTargets) * 100) : 0;
        const duration = Math.round((Date.now() - testState.startTime) / 1000);
        
        saveResult('attention', 'Dikkat Testi (d-b Ayrımı)', score, totalTargets, accuracy, duration);
    };

    const finishTestWithValues = (finalScore: number, finalAnswers: boolean[], items: any[], total: number, startTime: number, category: TestCategory, testName: string) => {
        const duration = Math.round((Date.now() - startTime) / 1000);
        const accuracy = total > 0 ? (finalScore / total) * 100 : 0;
        
        if (category === 'reading') {
             let lexCorrect = 0, lexTotal = 0;
             let sentCorrect = 0, sentTotal = 0;
             
             items.forEach((item, idx) => {
                 if (item.subtype === 'lexical') {
                     lexTotal++;
                     if (finalAnswers[idx]) lexCorrect++;
                 } else if (item.subtype === 'sentence') {
                     sentTotal++;
                     if (finalAnswers[idx]) sentCorrect++;
                 }
             });
             
             const lexScore = lexTotal > 0 ? Math.round((lexCorrect/lexTotal)*100) : 0;
             const sentScore = sentTotal > 0 ? Math.round((sentCorrect/sentTotal)*100) : 0;
             
             setProfile(prev => ({
                 ...prev,
                 observations: [
                     ...prev.observations, 
                     `Okuma Analizi: Kelime Tanıma (Decoding) Başarısı %${lexScore}, Cümle Anlama (Comprehension) Başarısı %${sentScore}.`
                 ]
             }));
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
        
        let nextMsg = "Sonraki aşamaya geçiliyor...";
        if (id === 'reading') nextMsg = "Sırada Matematik Testi var.";
        if (id === 'math') nextMsg = "Şimdi Dikkat Testine geçiyoruz.";
        if (id === 'attention') nextMsg = "Görsel Algı Testi hazırlanıyor.";
        if (id === 'visual') nextMsg = "Sıralı Bellek Testi hazırlanıyor.";
        if (id === 'cognitive') nextMsg = "Testler tamamlandı! Gözlem aşaması.";

        triggerTransition(nextMsg, currentStep + 1);
    };

    const triggerTransition = (msg: string, nextStepIndex: number) => {
        setIsTransitioning(true);
        setTransitionMessage(msg);
        setTestState(prev => ({ ...prev, items: [], attentionState: [], answers: [], currentIndex: 0 }));

        setTimeout(() => {
            setCurrentStep(nextStepIndex);
            setIsTransitioning(false);
        }, 1500);
    };

    useEffect(() => {
        if (isTransitioning) return;

        if (currentStep === 2 && testState.items.length === 0) {
            startTestPhase(generateDynamicTest('reading', profile.grade));
        } else if (currentStep === 3 && testState.items.length === 0) {
            startTestPhase(generateDynamicTest('math', profile.grade));
        } else if (currentStep === 4 && testState.attentionState.length === 0) {
            startTestPhase(generateDynamicTest('attention', profile.grade), true);
        } else if (currentStep === 5 && testState.items.length === 0) {
            startTestPhase(generateDynamicTest('visual', profile.grade));
        } else if (currentStep === 6 && testState.items.length === 0) {
            startTestPhase(generateDynamicTest('cognitive', profile.grade));
        } else if (currentStep === 8 && !report && !isLoading) {
            handleReportGeneration();
        }
    }, [currentStep, isTransitioning, profile.grade, testState.items.length, testState.attentionState.length, startTestPhase, report, isLoading]);

    const handleReportGeneration = async () => {
        setIsLoading(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            const result = await generateAssessmentReport(profile);
            if (result) {
                setReport(result);
                if (user) {
                    assessmentService.saveAssessment(user.id, profile.studentName, profile.gender, profile.age, profile.grade, result).catch(console.error);
                }
                setCurrentStep(9);
            } else {
                throw new Error("Rapor boş döndü");
            }
        } catch (error) {
            console.error(error);
            alert("Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
            setCurrentStep(7);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualSave = async () => {
        if (!user || !report) return;
        setSaving(true);
        try {
            await assessmentService.saveAssessment(
                user.id,
                profile.studentName,
                profile.gender,
                profile.age,
                profile.grade,
                report
            );
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (e) {
            console.error(e);
            alert('Kaydedilirken bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const handleManualShare = async (receiverId: string) => {
        if (!user || !report) return;
        try {
            const assessmentObj: SavedAssessment = {
                id: 'temp',
                userId: user.id,
                studentName: profile.studentName,
                gender: profile.gender,
                age: profile.age,
                grade: profile.grade,
                report: report,
                createdAt: new Date().toISOString()
            };
            await assessmentService.shareAssessment(assessmentObj, user.id, user.name, receiverId);
            alert('Rapor başarıyla paylaşıldı.');
            setIsShareModalOpen(false);
        } catch (e) {
            console.error(e);
            alert('Paylaşım sırasında bir hata oluştu.');
        }
    };
    
    const handlePrint = () => {
        const originalTitle = document.title;
        const studentName = profile.studentName.replace(/ /g, '_');
        document.title = `Rapor_${studentName}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}`;
        window.print();
        document.title = originalTitle;
    };


    const isTestReady = (isAttention = false) => {
        if (isTransitioning) return false;
        if (isAttention) return testState.attentionState && testState.attentionState.length > 0;
        return testState.items && testState.items.length > 0 && !!testState.items?.[testState.currentIndex];
    };

    const currentItem = testState.items?.[testState.currentIndex];

    // --- RENDER ---
    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 font-sans">
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleManualShare} />
            
            <div className="px-4 py-4 bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 shadow-sm z-20 flex justify-between items-center sticky top-0 no-print">
                <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-colors font-bold text-sm flex items-center">
                    <i className="fa-solid fa-arrow-left mr-2"></i>Çıkış
                </button>
                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar">
                    {steps.map((s, i) => {
                        const isActive = i === currentStep;
                        const isDone = i < currentStep;
                        return (
                            <div key={i} className="flex items-center">
                                <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isActive ? 'bg-indigo-600 scale-125' : isDone ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-600'} transition-all`} title={s}></div>
                                {i < steps.length - 1 && <div className={`w-4 md:w-8 h-0.5 ${isDone ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}></div>}
                            </div>
                        )
                    })}
                </div>
                <div className="w-16"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start md:items-center">
                <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden relative min-h-[550px] transition-all printable-area-assessment">
                    
                    {feedbackState !== 'none' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 backdrop-blur-[2px] transition-all duration-200 animate-in fade-in">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transform scale-110 transition-transform ${feedbackState === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                                <i className={`fa-solid fa-${feedbackState === 'correct' ? 'check' : 'xmark'} text-6xl text-white`}></i>
                            </div>
                        </div>
                    )}

                    {isTransitioning && (
                        <div className="absolute inset-0 z-40 bg-white dark:bg-zinc-800">
                            <TransitionScreen message={transitionMessage} icon="fa-hourglass-half" />
                        </div>
                    )}

                    {currentStep === 0 && (
                        <div className="p-10 text-center flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white dark:from-zinc-800 dark:to-zinc-900">
                            <div className="w-28 h-28 bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center mb-8 shadow-xl animate-pulse">
                                <i className="fa-solid fa-brain text-6xl text-indigo-600 dark:text-indigo-400"></i>
                            </div>
                            <h2 className="text-4xl font-black mb-4 text-zinc-800 dark:text-zinc-100 tracking-tight">Bilişsel Değerlendirme</h2>
                            <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-8 max-w-md leading-relaxed">
                                Yapay zeka destekli bu modül, öğrencinin <strong>Okuma</strong>, <strong>Matematik</strong>, <strong>Dikkat</strong> ve <strong>Görsel Algı</strong> becerilerini analiz ederek kişiselleştirilmiş bir eğitim rotası oluşturur.
                            </p>
                            <button onClick={() => setCurrentStep(1)} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-1 flex items-center gap-3">
                                <span>Analizi Başlat</span> <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="p-4 sm:p-8 flex flex-col flex-1 max-w-lg mx-auto w-full">
                            <h3 className="text-2xl font-bold mb-6 text-center text-zinc-800 dark:text-zinc-100 shrink-0">Öğrenci Profili</h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold mb-2 text-zinc-700 dark:text-zinc-300">Cinsiyet</label>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => setProfile({...profile, gender: 'Erkek'})}
                                            className={`flex-1 p-3 border-2 rounded-xl font-bold transition-all ${profile.gender === 'Erkek' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-zinc-200 hover:border-blue-300'}`}
                                        >
                                            Erkek
                                        </button>
                                        <button 
                                            onClick={() => setProfile({...profile, gender: 'Kız'})}
                                            className={`flex-1 p-3 border-2 rounded-xl font-bold transition-all ${profile.gender === 'Kız' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-zinc-200 hover:border-pink-300'}`}
                                        >
                                            Kız
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 dark:bg-zinc-700/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-600">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="font-bold text-lg"><i className="fa-solid fa-cake-candles text-pink-500 mr-2"></i>Yaş</label>
                                        <span className="text-2xl font-black text-indigo-600">{profile.age}</span>
                                    </div>
                                    <input 
                                        type="range" min="5" max="15" 
                                        value={profile.age} 
                                        onChange={e => setProfile({...profile, age: +e.target.value})} 
                                        className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold mb-3 text-lg ml-1"><i className="fa-solid fa-graduation-cap text-indigo-500 mr-2"></i>Sınıf Seviyesi</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf'].map(g => (
                                            <button 
                                                key={g} 
                                                onClick={() => setProfile({...profile, grade: g})} 
                                                className={`p-4 border-2 rounded-xl font-bold transition-all text-sm ${profile.grade === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-600 hover:border-indigo-300'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6 shrink-0">
                                <div>
                                    <label className="block font-bold mb-2 text-zinc-700 dark:text-zinc-300">Adı Soyadı</label>
                                    <input 
                                        type="text" 
                                        value={profile.studentName}
                                        onChange={e => setProfile({...profile, studentName: e.target.value})}
                                        className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-indigo-500 outline-none"
                                        placeholder="Öğrenci Adı"
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        if(!profile.studentName) { alert('Lütfen öğrenci adını giriniz.'); return; }
                                        triggerTransition('Okuma Testine Hazırlanılıyor...', 2);
                                    }} 
                                    className="mt-4 py-4 w-full bg-zinc-900 dark:bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity"
                                >
                                    Devam Et
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {currentStep > 1 && currentStep < 7 && !isTestReady(currentStep === 4) && <TransitionScreen message={`${steps[currentStep]} Testi Hazırlanıyor...`} />}
                    
                    {currentStep === 2 && isTestReady() && (
                            <div className="flex flex-col h-full relative animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Okuma Testi" /></div>
                                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                    {currentItem?.subtype === 'lexical' ? (
                                        <>
                                            <h3 className="text-lg font-bold text-zinc-400 mb-6 uppercase tracking-widest"><i className="fa-solid fa-font mr-2"></i>Bu kelime gerçek mi?</h3>
                                            <div className="text-5xl md:text-7xl font-black mb-12 p-10 bg-white dark:bg-zinc-700 border-4 border-zinc-100 dark:border-zinc-600 rounded-3xl w-full max-w-md shadow-sm text-zinc-800 dark:text-zinc-100 font-dyslexic select-none transform hover:scale-105 transition-transform duration-300">
                                                {currentItem?.q}
                                            </div>
                                            <div className="flex gap-6 w-full max-w-md">
                                                <button onClick={() => handleAnswer(currentItem?.isReal === false, 'reading', 'Okuma')} className="flex-1 p-5 bg-rose-50 text-rose-600 font-black rounded-2xl border-b-4 border-rose-200 hover:bg-rose-100 transition-all text-xl shadow-sm active:scale-95">
                                                    <i className="fa-solid fa-xmark mr-2"></i> HAYIR
                                                </button>
                                                <button onClick={() => handleAnswer(currentItem?.isReal === true, 'reading', 'Okuma')} className="flex-1 p-5 bg-emerald-50 text-emerald-600 font-black rounded-2xl border-b-4 border-emerald-200 hover:bg-emerald-100 transition-all text-xl shadow-sm active:scale-95">
                                                    <i className="fa-solid fa-check mr-2"></i> EVET
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-lg font-bold text-zinc-400 mb-6 uppercase tracking-widest"><i className="fa-solid fa-paragraph mr-2"></i>Cümleyi Tamamla</h3>
                                            <div className="text-2xl md:text-3xl font-bold mb-12 p-8 bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-100 dark:border-sky-800 rounded-2xl w-full max-w-2xl shadow-sm text-zinc-800 dark:text-zinc-100 font-dyslexic leading-relaxed select-none">
                                                {currentItem?.q}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                                                {currentItem?.opts?.map((opt: string, i: number) => (
                                                    <button key={i} onClick={() => handleAnswer(opt === currentItem?.a, 'reading', 'Okuma')} className="p-4 bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl text-lg font-bold text-zinc-700 dark:text-zinc-200 hover:border-sky-500 hover:text-sky-600 hover:shadow-md transition-all active:scale-95">
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                    )}

                    {currentStep === 3 && isTestReady() && (
                            <div className="flex flex-col h-full relative animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Matematik Testi" /></div>
                                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                    <div className="text-4xl md:text-6xl font-bold mb-10 text-indigo-900 dark:text-indigo-200 font-mono bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl border-2 border-indigo-100 dark:border-indigo-800 w-full max-w-lg select-none">
                                        {currentItem?.q}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
                                        {currentItem?.opts?.map((opt: number, i:number) => (
                                            <button key={i} onClick={() => handleAnswer(opt === currentItem?.a, 'math', 'Matematik')} className="p-6 bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 text-3xl font-bold rounded-2xl hover:border-indigo-500 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95">
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                    )}

                    {currentStep === 4 && isTestReady(true) && (
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pt-6 px-6 flex justify-between items-center border-b pb-4 border-zinc-100 dark:border-zinc-700">
                                    <div>
                                        <h3 className="font-bold text-lg">Dikkat Testi</h3>
                                        <p className="text-xs text-zinc-500">Sadece "{testState.attentionState.find(i=>i.isCorrectTarget)?.char}" harflerini bul ve işaretle.</p>
                                    </div>
                                    <button onClick={finishAttentionTest} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full shadow-md transition-colors">
                                        Tamamla
                                    </button>
                                </div>
                                <div className="p-4 md:p-8 flex-1 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/30">
                                    <div className="grid grid-cols-6 gap-2 md:gap-4">
                                        {testState.attentionState.map((item, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleAttentionClick(i)} 
                                                className={`w-10 h-10 md:w-14 md:h-14 rounded-lg text-2xl md:text-3xl font-bold flex items-center justify-center transition-all font-dyslexic shadow-sm border select-none ${
                                                    item.isSelected 
                                                        ? 'bg-indigo-600 text-white border-indigo-600 transform scale-110' 
                                                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-600 text-zinc-400 hover:border-indigo-300 hover:text-indigo-300'
                                                }`}
                                            >
                                                {item.char}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                    )}

                    {currentStep === 5 && isTestReady() && (
                            <div className="flex flex-col h-full relative animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Matris Mantığı" /></div>
                                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                    <h3 className="text-zinc-400 font-bold uppercase tracking-widest mb-8">Eksik Parçayı Bul</h3>
                                    <div className="mb-8 grid grid-cols-2 gap-4 p-6 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-inner border-2 border-zinc-200 dark:border-zinc-700 max-w-md w-full">
                                        {currentItem?.grid?.map((item: any, i: number) => (
                                            <MatrixCell key={i} item={item} className="w-full aspect-square rounded-lg shadow-sm" />
                                        ))}
                                        <div className="w-full aspect-square bg-white dark:bg-zinc-800 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center">
                                            <span className="text-4xl font-bold text-indigo-300">?</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 justify-center w-full max-w-2xl">
                                        {currentItem?.opts?.map((opt: any, i:number) => (
                                            <button key={i} onClick={() => handleAnswer(opt === currentItem?.a, 'visual', 'Görsel Algı')} className="w-20 h-20 md:w-24 md:h-24 hover:scale-105 transition-transform focus:outline-none">
                                                <MatrixCell item={opt} className="w-full h-full rounded-xl shadow-md hover:border-indigo-500" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                    )}

                    {currentStep === 6 && isTestReady() && (
                            <div className="flex flex-col h-full relative animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Sıralı Bellek" /></div>
                                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                    {isMemorizing ? (
                                        <div className="animate-in zoom-in duration-500">
                                            <h3 className="text-2xl font-bold mb-8 text-zinc-800 dark:text-zinc-100">Sırayı Aklında Tut!</h3>
                                            <div className="flex gap-4 bg-white dark:bg-zinc-700 p-6 rounded-2xl shadow-lg border-2 border-indigo-100 dark:border-indigo-900">
                                                {currentItem?.seq?.map((icon: string, i: number) => (
                                                    <i key={i} className={`fa-solid fa-${icon} text-4xl md:text-6xl text-indigo-600 dark:text-indigo-400 animate-bounce`} style={{ animationDelay: `${i * 100}ms` }}></i>
                                                ))}
                                            </div>
                                            <div className="mt-8 h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 w-full animate-[shrink_3.5s_linear_forwards]"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-2xl">
                                            <h3 className="text-xl font-bold mb-8 text-zinc-600 dark:text-zinc-300">Hangi sıradaydı?</h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {currentItem?.opts?.map((opt: string[], i: number) => (
                                                    <button key={i} onClick={() => handleAnswer(JSON.stringify(opt) === JSON.stringify(currentItem?.a), 'cognitive', 'İşleyen Bellek')} className="p-6 bg-white dark:bg-zinc-700/50 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group flex justify-center gap-6">
                                                        {opt.map((icon, j) => (
                                                            <i key={j} className={`fa-solid fa-${icon} text-2xl md:text-3xl text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}></i>
                                                        ))}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                    )}

                    {currentStep === 7 && (
                        <div className="p-8 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-2xl font-bold mb-2 text-center">Eğitmen Gözlemleri</h3>
                            <p className="text-center text-zinc-500 mb-6">Lütfen öğrenciyle ilgili gözlemlediğiniz durumları işaretleyin.</p>
                            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                                <ObservationList observations={profile.observations} setProfile={setProfile} />
                            </div>
                            <button 
                                onClick={() => handleReportGeneration()} 
                                className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Analiz Ediliyor...</> : 'Raporu Oluştur'}
                            </button>
                        </div>
                    )}

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
                                            <button 
                                                onClick={handleManualSave} 
                                                disabled={saving} 
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${savedSuccess ? 'bg-green-100 text-green-700' : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}
                                            >
                                                {saving ? <i className="fa-solid fa-spinner fa-spin"></i> : savedSuccess ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>}
                                                <span className="hidden sm:inline">{savedSuccess ? 'Kaydedildi' : 'Kaydet'}</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => setIsShareModalOpen(true)} 
                                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                                            >
                                                <i className="fa-solid fa-share-nodes"></i>
                                                <span className="hidden sm:inline">Paylaş</span>
                                            </button>
                                        </>
                                    )}
                                    
                                    <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

                                    <button 
                                        onClick={handlePrint} 
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        <i className="fa-solid fa-print"></i>
                                        <span>Yazdır / PDF</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Report Content */}
                            <div className="assessment-report-container flex-1 overflow-y-auto p-8 custom-scrollbar">
                                {/* Header for Print */}
                                <div className="hidden print:block mb-8 border-b-2 border-zinc-800 pb-4">
                                    <h1 className="text-3xl font-black">Bursa Disleksi AI - Öğrenci Değerlendirme Raporu</h1>
                                    <div className="flex justify-between mt-4">
                                        <p><strong>Öğrenci:</strong> {profile.studentName}</p>
                                        <p><strong>Tarih:</strong> {new Date().toLocaleDateString('tr-TR')}</p>
                                    </div>
                                </div>

                                {/* Overall Summary */}
                                <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-800 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm mb-8">
                                    <h4 className="text-indigo-900 dark:text-indigo-100 font-bold mb-3 flex items-center gap-2"><i className="fa-solid fa-clipboard-check"></i> Genel Değerlendirme</h4>
                                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg">
                                        {report.overallSummary}
                                    </p>
                                </div>

                                {/* Charts & Scores */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid">
                                    {/* Radar Chart */}
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center">
                                        <h4 className="font-bold text-zinc-500 text-sm uppercase tracking-widest mb-6">Beceriler Analizi</h4>
                                        <div className="w-full max-w-xs">
                                            {report.chartData && <RadarChart data={report.chartData} />}
                                        </div>
                                    </div>

                                    {/* Score Bars */}
                                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center space-y-5">
                                        {Object.entries(report.scores).map(([key, value]) => {
                                            const score = value as number;
                                            const getLabel = (k: string) => {
                                                if(k==='reading') return 'Okuma Becerileri';
                                                if(k==='math') return 'Matematiksel Düşünme';
                                                if(k==='attention') return 'Dikkat ve Odaklanma';
                                                if(k==='cognitive') return 'İşleyen Bellek';
                                                if(k==='writing') return 'Yazma Becerileri';
                                                return k;
                                            }
                                            const getColor = (s: number) => {
                                                if(s < 30) return 'bg-green-500'; // Low risk
                                                if(s < 70) return 'bg-yellow-500'; // Medium risk
                                                return 'bg-red-500'; // High risk
                                            }
                                            return (
                                                <div key={key}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">{getLabel(key)}</span>
                                                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{score}/100 Risk</span>
                                                    </div>
                                                    <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                                                        <div className={`h-full rounded-full ${getColor(score)}`} style={{ width: `${score}%` }}></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Strengths & Weaknesses */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid">
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-4 flex items-center gap-2 text-lg">
                                            <i className="fa-solid fa-thumbs-up"></i> Güçlü Yönler
                                        </h4>
                                        <ul className="space-y-3">
                                            {report.analysis.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-3 text-emerald-900 dark:text-emerald-100">
                                                    <i className="fa-solid fa-check mt-1 text-emerald-500"></i>
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-800/30">
                                        <h4 className="font-bold text-rose-800 dark:text-rose-300 mb-4 flex items-center gap-2 text-lg">
                                            <i className="fa-solid fa-chart-line"></i> Gelişim Alanları
                                        </h4>
                                        <ul className="space-y-3">
                                            {report.analysis.weaknesses.map((s, i) => (
                                                <li key={i} className="flex items-start gap-3 text-rose-900 dark:text-rose-100">
                                                    <i className="fa-solid fa-arrow-trend-up mt-1 text-rose-500"></i>
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Roadmap */}
                                <div className="bg-zinc-900 text-white p-8 rounded-3xl shadow-xl break-inside-avoid">
                                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-700 pb-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                            <i className="fa-solid fa-route text-xl"></i>
                                        </div>
                                        <h4 className="text-xl font-bold">Önerilen Eğitim Planı</h4>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {report.roadmap.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => onSelectActivity(item.activityId as ActivityType)}
                                                className="bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 p-4 rounded-xl flex items-center gap-4 transition-all cursor-pointer group"
                                            >
                                                <span className="font-mono text-2xl font-bold text-zinc-600 group-hover:text-indigo-400 transition-colors">0{idx+1}</span>
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-lg text-indigo-300 group-hover:text-white transition-colors mb-1">
                                                        {ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}
                                                    </h5>
                                                    <p className="text-sm text-zinc-400">{item.reason}</p>
                                                </div>
                                                <div className="px-4 py-2 bg-zinc-900 rounded-lg text-xs font-bold text-zinc-300 uppercase tracking-wider border border-zinc-700">
                                                    {item.frequency}
                                                </div>
                                                <i className="fa-solid fa-chevron-right text-zinc-600 group-hover:text-white transition-colors"></i>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Footer for Print */}
                                <div className="hidden print:block mt-8 pt-4 border-t border-zinc-300 text-center text-xs text-zinc-500">
                                    Bu rapor Bursa Disleksi AI tarafından otomatik olarak oluşturulmuştur.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};