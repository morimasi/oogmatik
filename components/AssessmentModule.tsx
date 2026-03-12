
import React, { useState, useEffect, useRef } from 'react';
import { ActivityType, SavedAssessment, ProfessionalAssessmentReport, SubTestResult, CognitiveDomain, ClinicalObservation, AssessmentRoadmapItem } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';
import { AssessmentEngine } from './assessment/AssessmentEngine';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { assessmentService } from '../services/assessmentService';
import { generateAssessmentReport } from '../services/assessmentGenerator';
import { ACTIVITIES } from '../constants';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
    onAutoGenerateWorkbook?: (report: any) => void;
}

const DOMAINS: { id: CognitiveDomain; title: string; desc: string; icon: string; estimatedTime: string; color: string }[] = [
    { id: 'visual_spatial_memory', title: 'Görsel-Uzamsal Bellek', desc: 'Kısa süreli görsel hafıza ve desen takibi.', icon: 'fa-table-cells', estimatedTime: '3 dk', color: 'indigo' },
    { id: 'processing_speed', title: 'Hızlı İsimlendirme (RAN)', desc: 'Görsel uyaranları işlemleme ve sözel tepki hızı.', icon: 'fa-stopwatch', estimatedTime: '2 dk', color: 'cyan' },
    { id: 'selective_attention', title: 'Stroop Testi (Dikkat)', desc: 'Dürtü kontrolü, odaklanma ve çeldirici baskılama.', icon: 'fa-traffic-light', estimatedTime: '3 dk', color: 'purple' },
    { id: 'phonological_loop', title: 'Fonolojik Döngü', desc: 'Sözel çalışma belleği ve hece/kelime tekrarı.', icon: 'fa-volume-high', estimatedTime: '4 dk', color: 'rose' },
    { id: 'logical_reasoning', title: 'Mantıksal Muhakeme', desc: 'Akışkan zeka, desen tanıma ve problem çözme.', icon: 'fa-brain', estimatedTime: '5 dk', color: 'amber' }
];

const DOMAIN_COLORS: Record<string, string> = {
    indigo: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    purple: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    rose: 'border-rose-500 bg-rose-50 dark:bg-rose-900/20',
    amber: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
};
const DOMAIN_ICON_COLORS: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    purple: 'bg-purple-100 text-purple-600',
    rose: 'bg-rose-100 text-rose-600',
    amber: 'bg-amber-100 text-amber-600',
};

const DOMAIN_ACTIVITY_MAP: Record<CognitiveDomain, ActivityType[]> = {
    visual_spatial_memory: [ActivityType.VISUAL_MEMORY, ActivityType.GRID_DRAWING, ActivityType.DOT_PAINTING],
    processing_speed: [ActivityType.RAPID_NAMING, ActivityType.READING_FLOW],
    selective_attention: [ActivityType.STROOP_TEST, ActivityType.BURDON_TEST, ActivityType.ATTENTION_TO_QUESTION, ActivityType.FIND_THE_DIFFERENCE],
    phonological_loop: [ActivityType.PHONOLOGICAL_AWARENESS, ActivityType.SYLLABLE_TRAIN, ActivityType.WORD_MEMORY],
    logical_reasoning: [ActivityType.LOGIC_GRID_PUZZLE, ActivityType.NUMBER_PATTERN],
    visual_search: [ActivityType.TARGET_SEARCH, ActivityType.VISUAL_TRACKING_LINES, ActivityType.CHAOTIC_NUMBER_SEARCH]
};

export const AssessmentModule = ({ onBack, onSelectActivity, onAddToWorkbook, onAutoGenerateWorkbook }: AssessmentModuleProps) => {
    const { user } = useAuthStore();
    const { students, activeStudent, setActiveStudent } = useStudentStore();

    const [view, setView] = useState<'setup' | 'running' | 'report'>('setup');
    const [activeTestIndex, setActiveTestIndex] = useState(0);

    // --- Öğrenci Bilgileri ---
    const [studentName, setStudentName] = useState('');
    const [studentAge, setStudentAge] = useState(8);
    const [studentGender, setStudentGender] = useState<'Kız' | 'Erkek'>('Erkek'); // FIX: Artık state'te
    const [studentId, setStudentId] = useState<string | undefined>(undefined);

    const [selectedDomains, setSelectedDomains] = useState<CognitiveDomain[]>([
        'visual_spatial_memory', 'selective_attention', 'processing_speed', 'logical_reasoning'
    ]);

    const [results, setResults] = useState<SubTestResult[]>([]);
    const [observations, setObservations] = useState<ClinicalObservation>({
        anxietyLevel: 'low',
        attentionSpan: 'focused',
        motorSkills: 'typical',
        cooperationLevel: 'cooperative',
        fatigueIndex: 'normal',
        frustrationTolerance: 'high',
        verbalization: 'adequate',
        eyeContact: 'normal',
        notes: ''
    });

    const [finalReport, setFinalReport] = useState<SavedAssessment | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // FIX: Gerçek süre ölçümü
    const sessionStartTime = useRef<number>(0);

    useEffect(() => {
        if (activeStudent && view === 'setup') {
            setStudentId(activeStudent.id);
            setStudentName(activeStudent.name);
            setStudentAge(activeStudent.age);
        }
    }, [activeStudent, view]);

    const handleSelectExisting = (sid: string) => {
        const s = students.find((x: any) => x.id === sid);
        if (s) {
            setStudentId(s.id);
            setStudentName(s.name);
            setStudentAge(s.age);
            setActiveStudent(s);
        } else {
            setStudentId(undefined);
            setActiveStudent(null);
        }
    };

    const startBattery = () => {
        if (!studentName.trim()) {
            alert("Lütfen öğrenci adını giriniz.");
            return;
        }
        if (selectedDomains.length === 0) {
            alert("En az bir test seçiniz.");
            return;
        }
        setResults([]);
        setActiveTestIndex(0);
        sessionStartTime.current = Date.now();
        setView('running');
    };

    const handleTestComplete = (result: SubTestResult) => {
        const newResults = [...results, result];
        setResults(newResults);
        if (activeTestIndex < selectedDomains.length - 1) {
            setActiveTestIndex((prev: number) => prev + 1);
        } else {
            generateFinalReport(newResults);
        }
    };

    const generateFinalReport = async (completedResults: SubTestResult[]) => {
        setIsGenerating(true);
        // FIX: Gerçek süre
        const durationSeconds = Math.round((Date.now() - sessionStartTime.current) / 1000);

        const totalScore = completedResults.reduce((acc, r) => acc + r.score, 0) / completedResults.length;
        const attentionResult = completedResults.find(r => r.testId === 'selective_attention');
        const memoryResult = completedResults.find(r => r.testId === 'visual_spatial_memory');
        const logicResult = completedResults.find(r => r.testId === 'logical_reasoning');
        const processingResult = completedResults.find(r => r.testId === 'processing_speed');
        const phonologicalResult = completedResults.find(r => r.testId === 'phonological_loop');
        const visualSearchResult = completedResults.find(r => r.testId === 'visual_search');

        const attentionScore = attentionResult?.score ?? 100;
        const memoryScore = memoryResult?.score ?? 100;
        const logicScore = logicResult?.score ?? 100;
        const processingScore = processingResult?.score ?? 100;
        const phonologicalScore = phonologicalResult?.score ?? 100;
        const visualSearchScore = visualSearchResult?.score ?? 100;

        // FIX: Dyscalculia gerçek hesaplama
        const dyscalculiaRisk =
            logicScore < 45 ? 'high' :
                logicScore < 65 ? 'moderate' : 'low';

        const roadmap: AssessmentRoadmapItem[] = [];
        completedResults.forEach(res => {
            if (res.score < 65) {
                const suggested = DOMAIN_ACTIVITY_MAP[res.testId] || [];
                suggested.forEach(actId => {
                    const def = ACTIVITIES.find(a => a.id === actId);
                    if (def) {
                        roadmap.push({
                            activityId: actId,
                            title: def.title,
                            reason: `${res.name} alanında destek için önerilmektedir (Skor: %${Math.round(res.score)}).`,
                            frequency: res.score < 40 ? 'Haftada 5 kez' : 'Haftada 3 kez',
                            priority: res.score < 40 ? 'high' : 'medium'
                        });
                    }
                });
            }
        });

        const professionalData: ProfessionalAssessmentReport = {
            id: crypto.randomUUID(),
            studentId: studentId || 'temp',
            studentName,
            examinerId: user?.id || 'guest',
            date: new Date().toISOString(),
            duration: durationSeconds, // FIX: Artık gerçek süre
            subTests: completedResults,
            observations,
            overallRiskAnalysis: {
                dyslexiaRisk: (memoryScore < 50 || phonologicalScore < 50) ? 'high' : (memoryScore < 70 || phonologicalScore < 70) ? 'moderate' : 'low',
                dyscalculiaRisk, // FIX: Artık hesaplanıyor
                attentionDeficitRisk: attentionScore < 50 ? 'high' : attentionScore < 70 ? 'moderate' : 'low',
                summary: `Bu alan AI ile doldurulacak.`
            },
            recommendations: roadmap.map(r => r.reason),
            roadmap
        };

        // FAZ 3: AI Rapor Motoru entegrasyonu
        let aiReport;
        try {
            aiReport = await generateAssessmentReport({
                studentName,
                age: studentAge,
                grade: activeStudent?.grade || 'Belirtilmemiş',
                observations: [
                    `Kaygı: ${observations.anxietyLevel}`,
                    `Dikkat Süresi: ${observations.attentionSpan}`,
                    `Motor Beceriler: ${observations.motorSkills}`,
                    observations.notes ? `Not: ${observations.notes}` : ''
                ].filter(Boolean),
                testResults: Object.fromEntries(
                    completedResults.map(r => [r.testId, { name: r.name, accuracy: r.accuracy }])
                ),
                errorPatterns: Object.fromEntries(
                    completedResults.map(r => [r.testId, Math.round(100 - r.accuracy)])
                )
            });
        } catch (e) {
            console.warn('AI rapor üretimi başarısız, rule-based fallback kullanılıyor.', e);
            aiReport = null;
        }

        const fullReport: any = {
            professionalData,
            overallSummary: aiReport?.overallSummary || professionalData.overallRiskAnalysis.summary,
            scores: {
                attention: attentionScore,
                spatial: memoryScore,
                logical: logicScore,
                linguistic: processingScore,
                ...(phonologicalResult ? { phonological: phonologicalScore } : {})
            },
            chartData: completedResults.map(r => ({ label: r.name, value: r.score, fullMark: 100 })),
            analysis: aiReport?.analysis || {
                strengths: completedResults.filter(r => r.score > 75).map(r => `${r.name} alanında güçlü performans (%${Math.round(r.score)}).`),
                weaknesses: completedResults.filter(r => r.score < 55).map(r => `${r.name} alanında ek destek önerilmektedir (%${Math.round(r.score)}).`),
                errorAnalysis: [
                    `Ortalama Tepki Süresi: ${Math.round(completedResults.reduce((a, b) => a + b.avgReactionTime, 0) / completedResults.length)}ms`,
                    `Genel Doğruluk Ortalaması: %${Math.round(completedResults.reduce((a, b) => a + b.accuracy, 0) / completedResults.length)}`
                ]
            },
            roadmap: roadmap.map(r => ({ activityId: r.activityId, reason: r.reason, frequency: r.frequency })),
            observations
        };

        const savedAssessment: SavedAssessment = {
            id: professionalData.id,
            userId: user?.id || 'guest',
            studentId,
            studentName,
            age: studentAge,
            gender: studentGender, // FIX: Artık state'ten geliyor
            grade: activeStudent?.grade || '1. Sınıf',
            report: fullReport,
            createdAt: new Date().toISOString()
        };

        if (user) {
            try {
                await assessmentService.saveAssessment(
                    user.id, studentName, studentGender, studentAge, // FIX: studentGender
                    activeStudent?.grade || '1. Sınıf', fullReport, studentId
                );
            } catch (e) {
                console.error('Değerlendirme kaydedilemedi:', e);
            }
        }

        setFinalReport(savedAssessment);
        setIsGenerating(false);
        setView('report');
    };

    // --- SETUP VIEW ---
    if (view === 'setup') {
        const totalEstTime = selectedDomains.reduce((acc, d) => {
            const domain = DOMAINS.find(x => x.id === d);
            return acc + (domain ? parseInt(domain.estimatedTime) : 0);
        }, 0);

        return (
            <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors text-zinc-500">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Bilişsel Değerlendirme</h1>
                        <p className="text-zinc-500 text-sm">Öğrenci profilini seçin ve analizi başlatın.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Öğrenci Seçimi */}
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-user-graduate text-indigo-500"></i> Öğrenci Bilgileri
                            </h3>
                            {students.length > 0 && (
                                <div className="mb-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                    <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Kayıtlı Öğrencilerim</label>
                                    <select
                                        value={studentId || ""}
                                        onChange={(e) => handleSelectExisting(e.target.value)}
                                        className="w-full p-3 bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm font-bold outline-none cursor-pointer"
                                    >
                                        <option value="">Yeni / Misafir Öğrenci</option>
                                        {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                    </select>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => { setStudentName(e.target.value); setStudentId(undefined); }}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                        placeholder="Örn: Ayşe Yılmaz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Yaş</label>
                                    <input
                                        type="number"
                                        min={5} max={18}
                                        value={studentAge}
                                        onChange={(e) => setStudentAge(Number(e.target.value))}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                    />
                                </div>
                                {/* FIX: Cinsiyet alanı */}
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Cinsiyet</label>
                                    <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
                                        {(['Erkek', 'Kız'] as const).map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setStudentGender(g)}
                                                className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-colors ${studentGender === g ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-400'}`}
                                            >
                                                {g === 'Erkek' ? '👦 Erkek' : '👧 Kız'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Test Seçimi */}
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-layer-group text-purple-500"></i> Uygulanacak Testler
                                <span className="ml-auto text-xs font-bold text-zinc-400">{selectedDomains.length}/5 seçili</span>
                            </h3>
                            <div className="space-y-2">
                                {DOMAINS.map(domain => {
                                    const isSelected = selectedDomains.includes(domain.id);
                                    return (
                                        <div
                                            key={domain.id}
                                            onClick={() => setSelectedDomains(prev =>
                                                prev.includes(domain.id) ? prev.filter(d => d !== domain.id) : [...prev, domain.id]
                                            )}
                                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                ${isSelected ? DOMAIN_COLORS[domain.color] : 'border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-90'}`}
                                        >
                                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-lg mr-4 flex-shrink-0
                                                ${isSelected ? DOMAIN_ICON_COLORS[domain.color] : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-400'}`}>
                                                <i className={`fa-solid ${domain.icon}`}></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">{domain.title}</h4>
                                                <p className="text-xs text-zinc-500 truncate">{domain.desc}</p>
                                            </div>
                                            <div className="text-right ml-3 flex-shrink-0">
                                                <span className="text-xs font-mono font-bold text-zinc-400 block">{domain.estimatedTime}</span>
                                                <div className={`w-5 h-5 rounded-full border-2 ml-auto mt-1 flex items-center justify-center
                                                    ${isSelected ? 'border-current bg-current' : 'border-zinc-300 dark:border-zinc-600'}`}
                                                    style={isSelected ? {} : {}}>
                                                    {isSelected && <i className="fa-solid fa-check text-[9px] text-white"></i>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sağ Panel */}
                    <div className="bg-zinc-900 dark:bg-black text-white p-8 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div>
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-6 backdrop-blur-md border border-white/10 uppercase tracking-widest">
                                Tanısal Batarya
                            </div>
                            <h2 className="text-3xl font-black mb-4 leading-tight">Analizi Başlat</h2>
                            <p className="text-white/60 text-sm leading-relaxed mb-8">
                                {studentId
                                    ? `${studentName} için kişiselleştirilmiş analizi başlatıyorsunuz.`
                                    : "Yeni bir öğrenci için bilişsel değerlendirme başlatıyorsunuz."
                                }
                            </p>
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <i className="fa-regular fa-clock w-5 text-center"></i>
                                    <span>Tahmini Süre: ~{totalEstTime} dakika</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <i className="fa-solid fa-flask w-5 text-center"></i>
                                    <span>{selectedDomains.length} bilişsel alan</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <i className="fa-solid fa-wand-magic-sparkles w-5 text-center"></i>
                                    <span>AI destekli rapor üretimi</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={startBattery}
                            disabled={selectedDomains.length === 0}
                            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            <i className="fa-solid fa-play"></i> TESTİ BAŞLAT
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RUNNING VIEW ---
    if (view === 'running') {
        if (isGenerating) {
            return (
                <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center gap-6">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-center">
                        <h3 className="text-xl font-black text-zinc-800 dark:text-white mb-2">AI Rapor Hazırlanıyor...</h3>
                        <p className="text-sm text-zinc-500">Gemini test verilerini analiz ediyor.</p>
                    </div>
                </div>
            );
        }

        const currentDomainId = selectedDomains[activeTestIndex];
        const domainInfo = DOMAINS.find(d => d.id === currentDomainId);
        const progressPct = (activeTestIndex / selectedDomains.length) * 100;

        return (
            <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-900 flex flex-col">
                {/* Üst Bar */}
                <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${domainInfo ? DOMAIN_ICON_COLORS[domainInfo.color] : 'bg-zinc-100'}`}>
                            <i className={`fa-solid ${domainInfo?.icon || 'fa-flask'}`}></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">{domainInfo?.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span>Test {activeTestIndex + 1} / {selectedDomains.length}</span>
                                <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">
                            <i className="fa-solid fa-user-graduate"></i> {studentName}
                        </div>
                        <button
                            onClick={() => { if (confirm('Testi iptal etmek istediğinize emin misiniz?')) { setView('setup'); } }}
                            className="text-zinc-400 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <i className="fa-solid fa-times text-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Test Alanı + Gözlem Paneli */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-900 p-4 flex items-center justify-center overflow-auto">
                        <AssessmentEngine domain={currentDomainId} onComplete={handleTestComplete} />
                    </div>

                    {/* Gözlem Paneli — 8 klinik indikatör */}
                    <div className="w-72 bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 p-5 flex flex-col overflow-y-auto flex-shrink-0">
                        <h4 className="font-black text-zinc-400 uppercase tracking-widest text-[10px] mb-5 flex items-center gap-2">
                            <i className="fa-solid fa-clipboard-user"></i> Uzman Gözlem Paneli
                        </h4>
                        <div className="space-y-4 text-sm">
                            {/* Kaygı */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Kaygı Düzeyi</label>
                                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0.5">
                                    {[['low', 'Düşük'], ['medium', 'Orta'], ['high', 'Yüksek']].map(([v, l]) => (
                                        <button key={v} onClick={() => setObservations(o => ({ ...o, anxietyLevel: v as any }))}
                                            className={`flex-1 py-1.5 text-[10px] font-black rounded transition-colors ${observations.anxietyLevel === v ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-400'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Dikkat Süresi */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Dikkat Süresi</label>
                                <select value={observations.attentionSpan}
                                    onChange={e => setObservations(o => ({ ...o, attentionSpan: e.target.value as any }))}
                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none">
                                    <option value="focused">Odaklanmış</option>
                                    <option value="distracted">Çabuk Dağılan</option>
                                    <option value="hyperactive">Dürtüsel / Hiperaktif</option>
                                </select>
                            </div>
                            {/* Motor Beceriler */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Motor Beceriler</label>
                                <select value={observations.motorSkills}
                                    onChange={e => setObservations(o => ({ ...o, motorSkills: e.target.value as any }))}
                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none">
                                    <option value="typical">Tipik</option>
                                    <option value="delayed">Gecikmeli</option>
                                    <option value="precise">Hassas/İyi</option>
                                </select>
                            </div>
                            {/* İşbirliği */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">İşbirliği</label>
                                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0.5">
                                    {[['cooperative', 'İyi'], ['reluctant', 'İsteksiz'], ['resistant', 'Dirençli']].map(([v, l]) => (
                                        <button key={v} onClick={() => setObservations(o => ({ ...o, cooperationLevel: v as any }))}
                                            className={`flex-1 py-1.5 text-[10px] font-black rounded transition-colors ${observations.cooperationLevel === v ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-400'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Yorulma */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Yorulma İndeksi</label>
                                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0.5">
                                    {[['normal', 'Normal'], ['mild', 'Hafif'], ['severe', 'Belirgin']].map(([v, l]) => (
                                        <button key={v} onClick={() => setObservations(o => ({ ...o, fatigueIndex: v as any }))}
                                            className={`flex-1 py-1.5 text-[10px] font-black rounded transition-colors ${observations.fatigueIndex === v ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-400'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Frustrasyon Toleransı */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Hayal Kırıklığı Toleransı</label>
                                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0.5">
                                    {[['high', 'İyi'], ['medium', 'Orta'], ['low', 'Düşük']].map(([v, l]) => (
                                        <button key={v} onClick={() => setObservations(o => ({ ...o, frustrationTolerance: v as any }))}
                                            className={`flex-1 py-1.5 text-[10px] font-black rounded transition-colors ${observations.frustrationTolerance === v ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-400'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Sözel İfade */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Sözel İfade</label>
                                <select value={observations.verbalization}
                                    onChange={e => setObservations(o => ({ ...o, verbalization: e.target.value as any }))}
                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none">
                                    <option value="adequate">Yeterli</option>
                                    <option value="limited">Kısıtlı</option>
                                    <option value="excessive">Aşırı/Konuşkan</option>
                                </select>
                            </div>
                            {/* Göz Teması */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Göz Teması</label>
                                <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 gap-0.5">
                                    {[['normal', 'Normal'], ['reduced', 'Az'], ['avoidant', 'Kaçınan']].map(([v, l]) => (
                                        <button key={v} onClick={() => setObservations(o => ({ ...o, eyeContact: v as any }))}
                                            className={`flex-1 py-1.5 text-[10px] font-black rounded transition-colors ${observations.eyeContact === v ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-zinc-400'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Klinik Notlar */}
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Klinik Notlar</label>
                                <textarea
                                    value={observations.notes}
                                    onChange={e => setObservations(o => ({ ...o, notes: e.target.value }))}
                                    className="w-full h-28 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Öğrencinin tepkileri, davranışları..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'report' && finalReport) {
        return (
            <AssessmentReportViewer
                assessment={finalReport}
                onClose={() => { setView('setup'); onBack(); }}
                user={user}
                onAddToWorkbook={onAddToWorkbook}
                onAutoGenerateWorkbook={onAutoGenerateWorkbook}
                onSelectActivity={onSelectActivity}
            />
        );
    }
    return null;
};
