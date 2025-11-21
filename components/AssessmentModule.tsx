
import React, { useState, useEffect, useCallback } from 'react';
import { AssessmentProfile, AssessmentReport, ActivityType, TestCategory } from '../types';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';

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
    // Grade 1-2: Shapes, Counting (Basic)
    // Grade 3-4: Rotation, Direction (Intermediate)
    // Grade 5-6: Grid Logic, Abstraction (Advanced)
    
    const difficultyLevel = grade <= 2 ? 0 : (grade <= 4 ? 1 : 2);
    // Mix types slightly for variety
    let type = 'shape';
    if (difficultyLevel === 1) type = index % 2 === 0 ? 'arrow' : 'shape';
    if (difficultyLevel === 2) type = index % 2 === 0 ? 'grid' : 'arrow';
    
    if (type === 'shape') {
        const shapes = ['circle', 'square', 'triangle'];
        const base = shapes[getRandomInt(0, 2)];
        const other = shapes.find(s => s !== base) || 'triangle';
        const fill = Math.random() > 0.5;
        // Logic: A, A, B -> ? (B)
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

    // 'grid' logic
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
        
        // 1. Lexical Decision (Kelime Tanıma)
        // Measures: Decoding speed and orthographic lexicon
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

        // 2. Sentence Comprehension (Cümle Anlama)
        // Measures: Syntactic processing and semantic understanding
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
                // Simple Addition/Subtraction (0-20)
                n1 = getRandomInt(1, 10); n2 = getRandomInt(1, 10); op = Math.random() > 0.5 ? '+' : '-';
                if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
                ans = op === '+' ? n1 + n2 : n1 - n2;
            } else if (grade === 2) {
                // Up to 100
                n1 = getRandomInt(10, 50); n2 = getRandomInt(1, 20); op = Math.random() > 0.5 ? '+' : '-';
                if (op === '-' && n1 < n2) [n1, n2] = [n2, n1];
                ans = op === '+' ? n1 + n2 : n1 - n2;
            } else if (grade === 3) {
                // Intro to Multiplication
                op = Math.random() > 0.3 ? (Math.random() > 0.5 ? '+' : '-') : 'x';
                if (op === 'x') { n1 = getRandomInt(1, 9); n2 = getRandomInt(1, 9); ans = n1 * n2; }
                else { n1 = getRandomInt(20, 100); n2 = getRandomInt(10, 50); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
            } else if (grade === 4) {
                // Mixed Operations
                op = ['+', '-', 'x', '/'][getRandomInt(0,3)];
                if (op === 'x') { n1 = getRandomInt(5, 12); n2 = getRandomInt(2, 9); ans = n1 * n2; }
                else if (op === '/') { n2 = getRandomInt(2, 9); ans = getRandomInt(2, 12); n1 = n2 * ans; }
                else { n1 = getRandomInt(50, 200); n2 = getRandomInt(20, 100); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
            } else { // 5-6
                // Advanced
                op = ['+', '-', 'x', '/'][getRandomInt(0,3)];
                if (op === 'x') { n1 = getRandomInt(10, 25); n2 = getRandomInt(2, 9); ans = n1 * n2; }
                else if (op === '/') { n2 = getRandomInt(3, 12); ans = getRandomInt(5, 20); n1 = n2 * ans; }
                else { n1 = getRandomInt(100, 999); n2 = getRandomInt(50, 500); if(op==='-' && n1<n2)[n1,n2]=[n2,n1]; ans = op === '+' ? n1 + n2 : n1 - n2; }
            }
            
            const dist1 = ans + getRandomInt(1, 5);
            const dist2 = Math.max(0, ans - getRandomInt(1, 5));
            const opts = shuffle([ans, dist1, dist2]);
            items.push({ q: `${n1} ${op.replace('x', '×').replace('/', '÷')} ${n2} = ?`, opts, a: ans, id: i });
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
        
        if (grade <= 2) {
            targets = ['O']; distractors = ['Q', 'C']; totalItems = 24;
        } else if (grade <= 4) {
            targets = ['b']; distractors = ['d']; totalItems = 36;
        } else {
            targets = ['b']; distractors = ['d', 'p', 'q', 'h']; totalItems = 48;
        }

        const gridItems = Array.from({ length: totalItems }).map(() => {
            const isTarget = Math.random() < 0.25;
            const char = isTarget ? targets[0] : distractors[getRandomInt(0, distractors.length-1)];
            return { char, isSelected: false, isCorrectTarget: isTarget };
        });
        return gridItems;
    }

    if (category === 'cognitive') {
        const items = [];
        // Working Memory Sequence
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
            
            items.push({
                type: 'sequence',
                seq: seq,
                opts: shuffle([correctOpt, dist1, dist2]),
                a: correctOpt, 
                id: i
            });
        }
        return items;
    }
    
    return [];
};

// --- COMPONENTS ---

const RadarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    if (!data || data.length === 0) return <p className="text-center text-zinc-400">Veri yok</p>;
    
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const angleStep = (Math.PI * 2) / data.length;

    const getCoords = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2;
        const r = (value / 100) * radius;
        return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };

    const points = data.map((d, i) => {
        const c = getCoords(d.value, i);
        return `${c.x},${c.y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} className="mx-auto drop-shadow-xl">
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
            {[25, 50, 75, 100].map((level, idx) => {
                const pts = data.map((_, i) => {
                    const c = getCoords(level, i);
                    return `${c.x},${c.y}`;
                }).join(' ');
                return <polygon key={idx} points={pts} fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />;
            })}
            {data.map((_, i) => {
                const p = getCoords(100, i);
                return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#d1d5db" strokeWidth="1" />;
            })}
            <polygon points={points} fill="rgba(99, 102, 241, 0.4)" stroke="#4f46e5" strokeWidth="3" />
            {data.map((d, i) => {
                const p = getCoords(d.value, i);
                const labelP = getCoords(125, i); 
                return (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                        <text x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-zinc-600 dark:fill-zinc-300 uppercase tracking-wider">
                            {d.label}
                        </text>
                        <text x={labelP.x} y={labelP.y + 15} textAnchor="middle" className="text-[10px] fill-indigo-500 font-bold">%{d.value}</text>
                    </g>
                );
            })}
        </svg>
    );
};

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
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionMessage, setTransitionMessage] = useState('Yükleniyor...');
    const [isMemorizing, setIsMemorizing] = useState(false);
    
    const [profile, setProfile] = useState<AssessmentProfile>({
        age: 7, grade: '1. Sınıf', observations: [], testResults: {}
    });
    const [report, setReport] = useState<AssessmentReport | null>(null);
    const [feedbackState, setFeedbackState] = useState<'none' | 'correct' | 'wrong'>('none');

    const [testState, setTestState] = useState({
        score: 0, total: 0, startTime: 0, items: [] as any[], currentIndex: 0,
        attentionState: [] as { char: string; isSelected: boolean; isCorrectTarget: boolean }[],
        answers: [] as {id: any, correct: boolean, subtype?: string}[]
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
            // If it's cognitive, trigger memorize immediately for the first item
            if (items.length > 0 && items[0]?.type === 'sequence') {
                setIsMemorizing(true);
            }
        }
    }, []);

    // Watch for memory phase timing
    useEffect(() => {
        if (isMemorizing) {
            const timer = setTimeout(() => {
                setIsMemorizing(false);
            }, 3500); // Show sequence for 3.5 seconds
            return () => clearTimeout(timer);
        }
    }, [isMemorizing]);

    const handleAnswer = (isCorrect: boolean, category: TestCategory, testName: string) => {
        // 1. Show Feedback
        setFeedbackState(isCorrect ? 'correct' : 'wrong');
        
        // 2. Wait 1s then move
        setTimeout(() => {
            const nextScore = isCorrect ? testState.score + 1 : testState.score;
            const currentItem = testState.items[testState.currentIndex];
            const newAnswers = [...testState.answers, { id: currentItem.id, correct: isCorrect, subtype: currentItem.subtype }];

            if (testState.items && testState.currentIndex < testState.items.length - 1) {
                setTestState(prev => ({ ...prev, score: nextScore, currentIndex: prev.currentIndex + 1, answers: newAnswers }));
                
                // If next item is cognitive, trigger memory phase
                const nextItem = testState.items[testState.currentIndex + 1];
                if (category === 'cognitive' && nextItem?.type === 'sequence') {
                    setIsMemorizing(true);
                }
                
                setFeedbackState('none');
            } else {
                finishTest(nextScore, category, testName, newAnswers);
            }
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
            if (item.isSelected && item.isCorrectTarget) score++; // Doğru tespit
            if (item.isSelected && !item.isCorrectTarget) score -= 0.5; // Yanlış alarm cezası
        });
        score = Math.max(0, score); // Negatif skor engelleme
        
        const accuracy = totalTargets > 0 ? Math.min(100, (score / totalTargets) * 100) : 0;
        const duration = Math.round((Date.now() - testState.startTime) / 1000);
        
        saveResult('attention', 'Dikkat Testi (d-b Ayrımı)', score, totalTargets, accuracy, duration);
    };

    const finishTest = (finalScore: number, category: TestCategory, testName: string, answers: any[]) => {
        const duration = Math.round((Date.now() - testState.startTime) / 1000);
        const accuracy = testState.total > 0 ? (finalScore / testState.total) * 100 : 0;
        
        // Detailed tracking for Reading
        if (category === 'reading') {
            const lexicalCorrect = answers.filter(a => a.subtype === 'lexical' && a.correct).length;
            const lexicalTotal = answers.filter(a => a.subtype === 'lexical').length;
            const sentenceCorrect = answers.filter(a => a.subtype === 'sentence' && a.correct).length;
            const sentenceTotal = answers.filter(a => a.subtype === 'sentence').length;
            
            // Inject details into observations specifically for the AI prompt
            setProfile(prev => ({
                ...prev,
                observations: [
                    ...prev.observations,
                    `Lexical Reading Score: ${lexicalCorrect}/${lexicalTotal}`,
                    `Sentence Comprehension Score: ${sentenceCorrect}/${sentenceTotal}`
                ]
            }));
        }

        saveResult(category, testName, finalScore, testState.total, accuracy, duration);
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
        setTestState(prev => ({ ...prev, items: [], attentionState: [], currentIndex: 0, answers: [] }));

        setTimeout(() => {
            setCurrentStep(nextStepIndex);
            setIsTransitioning(false);
        }, 1500);
    };

    useEffect(() => {
        if (isTransitioning) return;

        if (currentStep === 2 && testState.items.length === 0) { // Reading
            startTestPhase(generateDynamicTest('reading', profile.grade));
        } else if (currentStep === 3 && testState.items.length === 0) { // Math
            startTestPhase(generateDynamicTest('math', profile.grade));
        } else if (currentStep === 4 && testState.attentionState.length === 0) { // Attention
            startTestPhase(generateDynamicTest('attention', profile.grade), true);
        } else if (currentStep === 5 && testState.items.length === 0) { // Visual (Matrix)
            startTestPhase(generateDynamicTest('visual', profile.grade));
        } else if (currentStep === 6 && testState.items.length === 0) { // Cognitive (Memory)
            startTestPhase(generateDynamicTest('cognitive', profile.grade));
        } else if (currentStep === 8 && !report && !isLoading) { // Generate Report
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

    const isTestReady = (isAttention = false) => {
        if (isTransitioning) return false;
        if (isAttention) return testState.attentionState && testState.attentionState.length > 0;
        return testState.items && testState.items.length > 0 && !!testState.items?.[testState.currentIndex];
    };

    const currentItem = testState.items?.[testState.currentIndex];

    // --- RENDER ---
    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 font-sans">
            <div className="px-4 py-4 bg-white dark:bg-zinc-800 border-b dark:border-zinc-700 shadow-sm z-20 flex justify-between items-center sticky top-0">
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
                <div className="w-full max-w-3xl bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden relative min-h-[550px] transition-all">
                    
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
                        <div className="p-8 md:p-12 flex flex-col flex-1 justify-center max-w-lg mx-auto w-full">
                            <h3 className="text-2xl font-bold mb-8 text-center text-zinc-800 dark:text-zinc-100">Öğrenci Profili</h3>
                            <div className="space-y-6">
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
                                    <div className="grid grid-cols-2 gap-3">
                                        {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => (
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
                            <button onClick={() => triggerTransition('Okuma Testine Hazırlanılıyor...', 2)} className="mt-10 py-4 w-full bg-zinc-900 dark:bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity">Devam Et</button>
                        </div>
                    )}

                    {currentStep === 2 && (
                        isTestReady() ? (
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
                        ) : <TransitionScreen message="Okuma Testi Hazırlanıyor..." />
                    )}

                    {currentStep === 3 && (
                        isTestReady() ? (
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
                        ) : <TransitionScreen message="Sorular Yükleniyor..." />
                    )}

                    {currentStep === 4 && (
                        isTestReady(true) ? (
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
                        ) : <TransitionScreen message="Izgara Oluşturuluyor..." />
                    )}

                    {currentStep === 5 && (
                        isTestReady() ? (
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
                        ) : <TransitionScreen message="Matrisler Oluşturuluyor..." />
                    )}

                    {currentStep === 6 && (
                        isTestReady() ? (
                            <div className="flex flex-col h-full relative animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="pt-8"><TestProgress current={testState.currentIndex} total={testState.total} label="Sıralı Bellek" /></div>
                                
                                <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                                    {isMemorizing ? (
                                        <div className="animate-pulse">
                                            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-8">Sırayı Aklında Tut!</h3>
                                            <div className="flex gap-6 p-8 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-inner border border-zinc-200 dark:border-zinc-700">
                                                {currentItem?.seq?.map((icon: string, i: number) => (
                                                    <div key={i} className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm border-b-4 border-zinc-200 dark:border-zinc-700">
                                                        <i className={`fa-solid fa-${icon} text-4xl text-zinc-700 dark:text-zinc-200`}></i>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-8 w-full bg-zinc-200 rounded-full h-1.5 dark:bg-zinc-700 overflow-hidden">
                                                <div className="bg-indigo-500 h-1.5 rounded-full animate-[width_3.5s_linear] w-full origin-left"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-500 mb-8">Hangisi Doğru Sıraydı?</h3>
                                            <div className="flex flex-col gap-4">
                                                {currentItem?.opts?.map((opt: string[], i: number) => (
                                                    <button 
                                                        key={i} 
                                                        onClick={() => handleAnswer(opt === currentItem?.a, 'cognitive', 'Sıralı Bellek')}
                                                        className="flex gap-4 p-4 bg-white dark:bg-zinc-700 border-2 border-zinc-200 dark:border-zinc-600 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all active:scale-95 justify-center items-center"
                                                    >
                                                        {opt.map((icon, k) => (
                                                            <div key={k} className="text-2xl text-zinc-600 dark:text-zinc-300">
                                                                <i className={`fa-solid fa-${icon}`}></i>
                                                            </div>
                                                        ))}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : <TransitionScreen message="Bellek Testi Hazırlanıyor..." />
                    )}

                    {currentStep === 7 && (
                        <div className="p-8 flex flex-col flex-1 h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-2xl font-bold mb-2 text-center">Eğitmen Gözlemi</h3>
                            <p className="text-center text-zinc-500 mb-8 text-sm">Test sırasında veya genel olarak gözlemlediğiniz durumlar.</p>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                                <ObservationList observations={profile.observations} setProfile={setProfile} />
                            </div>
                            <div className="mt-6 pt-4">
                                <button onClick={() => setCurrentStep(8)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> Analizi Başlat
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 8 && (
                        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 border-8 border-zinc-200 dark:border-zinc-700 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <i className="fa-solid fa-brain text-4xl text-indigo-600 dark:text-indigo-400 animate-pulse"></i>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Veriler Analiz Ediliyor</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto">Yapay zeka, test sonuçlarını ve gözlemleri işleyerek pedagojik rapor hazırlıyor...</p>
                        </div>
                    )}

                    {currentStep === 9 && report && (
                        <div className="flex flex-col h-full animate-in zoom-in-95 duration-500">
                            <div className="p-8 bg-indigo-700 text-white text-center relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/30">
                                        <i className="fa-solid fa-file-medical-alt"></i> Bilişsel Değerlendirme Raporu
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Sonuçlar Hazır</h2>
                                    <p className="opacity-90 text-sm max-w-2xl mx-auto">{report.overallSummary}</p>
                                </div>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 bg-zinc-50 dark:bg-zinc-900/50 custom-scrollbar">
                                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-1 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center">
                                        <h4 className="font-bold text-zinc-500 mb-4 text-xs uppercase tracking-wider">Risk Analizi Grafiği</h4>
                                        {report.chartData ? <RadarChart data={report.chartData} /> : <p>Veri yok.</p>}
                                    </div>

                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                            <h4 className="font-bold text-lg mb-4 border-b pb-2 dark:border-zinc-700">Güçlü Yönler & İhtiyaçlar</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h5 className="text-green-600 font-bold text-sm mb-2 flex items-center"><i className="fa-solid fa-thumbs-up mr-2"></i>Güçlü Yönler</h5>
                                                    <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-300">
                                                        {report.analysis.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h5 className="text-rose-600 font-bold text-sm mb-2 flex items-center"><i className="fa-solid fa-triangle-exclamation mr-2"></i>Destek Alanları</h5>
                                                    <ul className="text-sm space-y-1 text-zinc-600 dark:text-zinc-300">
                                                        {report.analysis.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800/50 p-6 rounded-2xl border border-indigo-100 dark:border-zinc-700">
                                            <h4 className="font-bold text-lg mb-4 text-indigo-900 dark:text-indigo-200 flex items-center"><i className="fa-solid fa-route mr-2"></i>Önerilen Yol Haritası</h4>
                                            <div className="space-y-3">
                                                {report.roadmap.map((item, idx) => (
                                                    <div key={idx} className="bg-white dark:bg-zinc-700 p-4 rounded-xl shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                                                        <div>
                                                            <div className="font-bold text-indigo-600 dark:text-indigo-300">{ACTIVITIES.find(a => a.id === item.activityId)?.title || item.activityId}</div>
                                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{item.reason} • <span className="font-semibold">{item.frequency}</span></div>
                                                        </div>
                                                        <button onClick={() => onSelectActivity(item.activityId as ActivityType)} className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                            <i className="fa-solid fa-plus"></i>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
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
