
import React, { useState, useEffect, useRef } from 'react';
import { ActivityType, SavedAssessment, ProfessionalAssessmentReport, SubTestResult, CognitiveDomain, ClinicalObservation, AssessmentRoadmapItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { AssessmentEngine } from './assessment/AssessmentEngine';
import { AssessmentReportViewer } from './AssessmentReportViewer';
import { assessmentService } from '../services/assessmentService';
import { ACTIVITIES } from '../constants';

interface AssessmentModuleProps {
    onBack: () => void;
    onSelectActivity: (id: ActivityType) => void;
    onAddToWorkbook?: (assessment: SavedAssessment) => void;
    onAutoGenerateWorkbook?: (report: any) => void;
}

const DOMAINS: { id: CognitiveDomain; title: string; desc: string; icon: string; estimatedTime: string }[] = [
    { 
        id: 'visual_spatial_memory', 
        title: 'Görsel-Uzamsal Bellek (Matrix)', 
        desc: 'Kısa süreli görsel hafıza ve desen takibi.', 
        icon: 'fa-table-cells', 
        estimatedTime: '3 dk' 
    },
    { 
        id: 'processing_speed', 
        title: 'Hızlı İsimlendirme (RAN)', 
        desc: 'Görsel uyaranları işlemleme ve sözel tepki hızı.', 
        icon: 'fa-stopwatch', 
        estimatedTime: '2 dk' 
    },
    { 
        id: 'selective_attention', 
        title: 'Stroop Testi (Dikkat)', 
        desc: 'Dürtü kontrolü, odaklanma ve çeldirici baskılama.', 
        icon: 'fa-traffic-light', 
        estimatedTime: '3 dk' 
    },
    { 
        id: 'logical_reasoning', 
        title: 'Mantıksal Muhakeme', 
        desc: 'Akışkan zeka ve problem çözme becerisi.', 
        icon: 'fa-brain', 
        estimatedTime: '5 dk' 
    }
];

// Activity Mapping for Smart Route
const DOMAIN_ACTIVITY_MAP: Record<CognitiveDomain, ActivityType[]> = {
    visual_spatial_memory: ['VISUAL_MEMORY', 'GRID_DRAWING', 'MATRIX_MEMORY' as any, 'DOT_PAINTING'],
    processing_speed: ['RAPID_NAMING', 'READING_FLOW', 'SPEED_READING' as any],
    selective_attention: ['STROOP_TEST', 'BURDON_TEST', 'ATTENTION_TO_QUESTION', 'FIND_THE_DIFFERENCE'],
    phonological_loop: ['PHONOLOGICAL_AWARENESS', 'SYLLABLE_TRAIN', 'WORD_MEMORY'],
    logical_reasoning: ['LOGIC_GRID_PUZZLE', 'NUMBER_PATTERN', 'SUDOKU' as any]
};

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({ onBack, onSelectActivity, onAddToWorkbook, onAutoGenerateWorkbook }) => {
    const { user } = useAuth();
    
    // State Machine
    const [view, setView] = useState<'setup' | 'running' | 'report'>('setup');
    const [activeTestIndex, setActiveTestIndex] = useState(0);
    
    // Profile & Config
    const [studentName, setStudentName] = useState('');
    const [studentAge, setStudentAge] = useState(7);
    const [selectedDomains, setSelectedDomains] = useState<CognitiveDomain[]>(['visual_spatial_memory', 'selective_attention', 'processing_speed', 'logical_reasoning']);
    
    // Results
    const [results, setResults] = useState<SubTestResult[]>([]);
    const [observations, setObservations] = useState<ClinicalObservation>({
        anxietyLevel: 'low',
        attentionSpan: 'focused',
        motorSkills: 'typical',
        notes: ''
    });

    const [finalReport, setFinalReport] = useState<SavedAssessment | null>(null);

    const startBattery = () => {
        if (!studentName.trim()) {
            alert("Lütfen öğrenci adını giriniz.");
            return;
        }
        setResults([]);
        setActiveTestIndex(0);
        setView('running');
    };

    const handleTestComplete = (result: SubTestResult) => {
        const newResults = [...results, result];
        setResults(newResults);

        if (activeTestIndex < selectedDomains.length - 1) {
            setActiveTestIndex(prev => prev + 1);
        } else {
            generateFinalReport(newResults);
        }
    };

    const generateSmartRoadmap = (results: SubTestResult[]): AssessmentRoadmapItem[] => {
        const roadmap: AssessmentRoadmapItem[] = [];

        results.forEach(res => {
            if (res.score < 60) { // Threshold for recommendation
                const suggestedActivities = DOMAIN_ACTIVITY_MAP[res.testId] || [];
                
                suggestedActivities.forEach((actId) => {
                    // Check if activity exists in system
                    const actDef = ACTIVITIES.find(a => a.id === actId);
                    if (actDef) {
                        roadmap.push({
                            activityId: actId,
                            title: actDef.title,
                            reason: `${res.name} puanı düşük (%${res.score}). Bu beceriyi destekler.`,
                            frequency: res.score < 40 ? 'Günde 1 kez' : 'Haftada 3 kez',
                            priority: res.score < 40 ? 'high' : 'medium'
                        });
                    }
                });
            }
        });

        // Limit recommendations to avoid overwhelming
        return roadmap.slice(0, 6);
    };

    const generateFinalReport = async (completedResults: SubTestResult[]) => {
        const totalScore = completedResults.reduce((acc, r) => acc + r.score, 0) / completedResults.length;
        
        const attentionResult = completedResults.find(r => r.testId === 'selective_attention');
        const memoryResult = completedResults.find(r => r.testId === 'visual_spatial_memory');
        const logicResult = completedResults.find(r => r.testId === 'logical_reasoning');
        const processingResult = completedResults.find(r => r.testId === 'processing_speed');

        const attentionScore = attentionResult?.score || 100;
        const memoryScore = memoryResult?.score || 100;
        
        // Generate Roadmap
        const roadmap = generateSmartRoadmap(completedResults);

        const reportData: ProfessionalAssessmentReport = {
            id: crypto.randomUUID(),
            studentId: 'temp',
            studentName,
            examinerId: user?.id || 'guest',
            date: new Date().toISOString(),
            duration: 0, 
            subTests: completedResults,
            observations: observations, // Pass observations correctly
            overallRiskAnalysis: {
                dyslexiaRisk: memoryScore < 50 ? 'high' : memoryScore < 70 ? 'moderate' : 'low',
                dyscalculiaRisk: 'low',
                attentionDeficitRisk: attentionScore < 50 ? 'high' : attentionScore < 70 ? 'moderate' : 'low',
                summary: `Öğrenci ${studentName}, batarya genelinde %${Math.round(totalScore)} performans göstermiştir. ${observations.notes}`
            },
            recommendations: [
                attentionScore < 60 ? "Dikkat sürdürülebilirliği çalışmaları (Stroop, Burdon) önerilir." : "",
                memoryScore < 60 ? "Görsel hafıza egzersizleri (Memory, Matrix) günlük plana eklenmelidir." : ""
            ].filter(s => s !== ""),
            roadmap: roadmap
        };

        // Unified Report Structure for Viewer
        const fullReport: any = {
            professionalData: reportData, // New structure inside
            overallSummary: reportData.overallRiskAnalysis.summary,
            scores: {
                attention: attentionScore,
                spatial: memoryScore,
                logical: logicResult?.score || 0,
                linguistic: processingResult?.score || 0 
            },
            chartData: completedResults.map(r => ({ label: r.name, value: r.score, fullMark: 100 })),
            analysis: {
                strengths: completedResults.filter(r => r.score > 75).map(r => `${r.name} alanında güçlü performans.`),
                weaknesses: completedResults.filter(r => r.score < 50).map(r => `${r.name} alanında desteğe ihtiyaç var.`),
                errorAnalysis: [`Ortalama Tepki Süresi: ${Math.round(completedResults.reduce((a,b)=>a+b.avgReactionTime,0)/completedResults.length)}ms`]
            },
            roadmap: roadmap.map(r => ({
                activityId: r.activityId,
                reason: r.reason,
                frequency: r.frequency
            })),
            observations: observations // Ensure top-level access for Viewer
        };

        const savedAssessment: SavedAssessment = {
            id: reportData.id,
            userId: user?.id || 'guest',
            studentName,
            age: studentAge,
            gender: 'Erkek', 
            grade: '1. Sınıf',
            report: fullReport,
            createdAt: new Date().toISOString()
        };

        if (user) {
            await assessmentService.saveAssessment(user.id, studentName, 'Erkek', studentAge, '1. Sınıf', fullReport);
        }

        setFinalReport(savedAssessment);
        setView('report');
    };

    // --- VIEW: SETUP & RUNNING (Same as before) ---
    if (view === 'setup') {
        return (
            <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Bilişsel Değerlendirme Bataryası</h1>
                        <p className="text-zinc-500">Özel öğrenme güçlüğü tanılama ve tarama için profesyonel araç seti.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-user-tag text-indigo-500"></i> Öğrenci Profili
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Ad Soyad</label>
                                    <input 
                                        type="text" 
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Örn: Ali Yılmaz"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Yaş</label>
                                    <input 
                                        type="number" 
                                        value={studentAge}
                                        onChange={(e) => setStudentAge(Number(e.target.value))}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-layer-group text-purple-500"></i> Alt Testler (Batarya İçeriği)
                            </h3>
                            <div className="space-y-3">
                                {DOMAINS.map(domain => {
                                    const isSelected = selectedDomains.includes(domain.id);
                                    return (
                                        <div 
                                            key={domain.id}
                                            onClick={() => {
                                                setSelectedDomains(prev => 
                                                    prev.includes(domain.id) 
                                                        ? prev.filter(d => d !== domain.id) 
                                                        : [...prev, domain.id]
                                                );
                                            }}
                                            className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mr-4 ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 text-zinc-400'}`}>
                                                <i className={`fa-solid ${domain.icon}`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{domain.title}</h4>
                                                <p className="text-xs text-zinc-500">{domain.desc}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-mono font-bold text-zinc-400">{domain.estimatedTime}</span>
                                                <div className={`w-6 h-6 rounded-full border-2 ml-auto mt-1 flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-zinc-300'}`}>
                                                    {isSelected && <i className="fa-solid fa-check text-[10px]"></i>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Right: Intro & Start */}
                    <div className="bg-zinc-900 dark:bg-black text-white p-8 rounded-3xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div>
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-6 backdrop-blur-md border border-white/10">
                                PRO MODÜL
                            </div>
                            <h2 className="text-3xl font-black mb-4 leading-tight">Tanısal Değerlendirme Başlat</h2>
                            <p className="text-white/60 text-sm leading-relaxed mb-8">
                                Bu batarya, öğrencinin temel bilişsel becerilerini interaktif görevlerle ölçer. Test sırasında sessiz bir ortam sağladığınızdan emin olun.
                            </p>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <i className="fa-regular fa-clock w-5 text-center"></i>
                                    <span>Tahmini Süre: ~15 Dakika</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-white/80">
                                    <i className="fa-solid fa-laptop w-5 text-center"></i>
                                    <span>Gereksinim: Dokunmatik veya Mouse</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={startBattery}
                            disabled={selectedDomains.length === 0}
                            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <i className="fa-solid fa-play"></i>
                            TESTİ BAŞLAT
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'running') {
        const currentDomainId = selectedDomains[activeTestIndex];
        const domainInfo = DOMAINS.find(d => d.id === currentDomainId);

        return (
            <div className="fixed inset-0 z-50 bg-zinc-50 dark:bg-zinc-900 flex flex-col">
                {/* Test Runner Header */}
                <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <i className={`fa-solid ${domainInfo?.icon}`}></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">{domainInfo?.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span>Test {activeTestIndex + 1} / {selectedDomains.length}</span>
                                <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((activeTestIndex) / selectedDomains.length) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                            <i className="fa-solid fa-eye"></i>
                            <span>Gözlem Modu Aktif</span>
                        </div>
                        <button onClick={() => { if(confirm('Testi iptal etmek istediğinize emin misiniz?')) setView('setup'); }} className="text-zinc-400 hover:text-red-500 transition-colors">
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Test Area */}
                    <div className="flex-1 relative bg-zinc-100 dark:bg-black p-4 flex items-center justify-center">
                        <AssessmentEngine 
                            domain={currentDomainId} 
                            onComplete={handleTestComplete} 
                        />
                    </div>

                    {/* Examiner Sidebar (Observer Panel) */}
                    <div className="w-80 bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700 p-6 flex flex-col overflow-y-auto">
                        <h4 className="font-black text-zinc-400 uppercase tracking-widest text-xs mb-6">Klinik Gözlem</h4>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Kaygı Düzeyi</label>
                                <div className="flex bg-zinc-100 rounded-lg p-1">
                                    {['low', 'medium', 'high'].map(l => (
                                        <button 
                                            key={l}
                                            onClick={() => setObservations({...observations, anxietyLevel: l as any})}
                                            className={`flex-1 py-2 text-xs font-bold rounded capitalize transition-colors ${observations.anxietyLevel === l ? (l==='high'?'bg-red-500 text-white':'bg-white shadow text-black') : 'text-zinc-500'}`}
                                        >
                                            {l === 'low' ? 'Düşük' : l === 'medium' ? 'Orta' : 'Yüksek'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Dikkat Süresi</label>
                                <select 
                                    value={observations.attentionSpan}
                                    onChange={(e) => setObservations({...observations, attentionSpan: e.target.value as any})}
                                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium"
                                >
                                    <option value="focused">Odaklanmış</option>
                                    <option value="distracted">Çabuk Dağılan</option>
                                    <option value="hyperactive">Hareketli/Dürtüsel</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-500 mb-2">Anlık Notlar</label>
                                <textarea 
                                    value={observations.notes}
                                    onChange={(e) => setObservations({...observations, notes: e.target.value})}
                                    className="w-full h-32 p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Öğrencinin tepkileri, kullandığı stratejiler..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-zinc-100">
                             <div className="p-4 bg-blue-50 text-blue-700 text-xs rounded-xl leading-relaxed">
                                 <i className="fa-solid fa-circle-info mr-2"></i>
                                 Bu panel sadece uygulayıcı içindir. Öğrenci ekranı görmemelidir.
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: REPORT ---
    if (view === 'report' && finalReport) {
        return (
            <AssessmentReportViewer 
                assessment={finalReport}
                onClose={() => { setView('setup'); onBack(); }} // Go back to main
                user={user}
                onAddToWorkbook={onAddToWorkbook}
                onAutoGenerateWorkbook={onAutoGenerateWorkbook}
                onSelectActivity={onSelectActivity} // Pass selector for direct action
            />
        );
    }

    return null;
};
