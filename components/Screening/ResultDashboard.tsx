
import React, { useEffect, useState, useRef } from 'react';
import { ScreeningResult, EvaluationCategory } from '../../types/screening';
import { SavedAssessment, AssessmentReport } from '../../types';
import { CATEGORY_LABELS } from '../../data/screeningQuestions';
import { RadarChart } from '../RadarChart';
import { generateWithSchema } from '../../services/geminiClient';
import { Type } from "@google/genai";
import { printService } from '../../utils/printService';
import { useAuth } from '../../context/AuthContext';
import { assessmentService } from '../../services/assessmentService';
import { ShareModal } from '../ShareModal';

interface Props {
    result: ScreeningResult;
    onRestart: () => void;
    onSelectActivity?: (id: any) => void;
    onAddToWorkbook?: (item: any) => void;
    onGeneratePlan?: (studentName: string, age: number, weaknesses: string[]) => void; // New Prop
}

export const ResultDashboard: React.FC<Props> = ({ result, onRestart, onSelectActivity, onAddToWorkbook, onGeneratePlan }) => {
    const { user } = useAuth();
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [loadingAi, setLoadingAi] = useState(false);
    
    // Action States
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(null);

    // Prepare Chart Data
    const chartData = Object.entries(result.categoryScores).map(([key, data]) => ({
        label: CATEGORY_LABELS[key] || key,
        value: (data as any).score
    }));

    useEffect(() => {
        generateAiAdvice();
    }, []);

    const generateAiAdvice = async () => {
        setLoadingAi(true);
        try {
            const riskSummary = Object.entries(result.categoryScores)
                .map(([cat, data]) => `${CATEGORY_LABELS[cat]}: %${(data as any).score} (${(data as any).riskLabel})`)
                .join('\n');

            const prompt = `
            [ROL: KIDEMLİ EĞİTİM PSİKOLOĞU ve ÖZEL EĞİTİM UZMANI]
            GÖREV: Aşağıdaki tarama testi sonuçlarına göre ebeveyne/öğretmene yönelik, endişeyi azaltan ama gerçekçi bir durum değerlendirmesi ve tavsiye mektubu yaz.
            
            ÖĞRENCİ: ${result.studentName}
            SONUÇLAR:
            ${riskSummary}

            BULGULAR: ${Object.values(result.categoryScores).flatMap(s => (s as any).findings).join(', ')}

            İSTENEN ÇIKTI (JSON):
            {
                "letter": "Empatik, profesyonel, 3 paragraflık bir değerlendirme yazısı.",
                "actionSteps": ["Somut öneri 1", "Somut öneri 2", "Somut öneri 3"]
            }
            `;

            const schema = {
                type: Type.OBJECT,
                properties: {
                    letter: { type: Type.STRING },
                    actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['letter', 'actionSteps']
            };

            const response: any = await generateWithSchema(prompt, schema);
            setAiAnalysis(response);
        } catch (e) {
            console.error("AI Error", e);
        } finally {
            setLoadingAi(false);
        }
    };

    // --- ACTIONS ---

    const mapToSavedAssessment = (): SavedAssessment => {
        // Convert ScreeningResult to AssessmentReport format for storage compatibility
        const reportData: AssessmentReport = {
            overallSummary: aiAnalysis?.letter || "Analiz bekleniyor...",
            scores: Object.entries(result.categoryScores).reduce((acc, [k, v]) => ({...acc, [k]: (v as any).score}), {}),
            chartData: chartData.map(c => ({...c, fullMark: 100})),
            analysis: {
                strengths: [], // Screening doesn't separate explicitly yet
                weaknesses: Object.values(result.categoryScores).filter((s:any) => s.riskLevel === 'high').map((s:any) => s.findings).flat(),
                errorAnalysis: Object.values(result.categoryScores).flatMap((s:any) => s.findings)
            },
            roadmap: [], // Can be populated
            observations: {
                anxietyLevel: 'low',
                attentionSpan: 'focused',
                motorSkills: 'typical',
                notes: `Otomatik Tarama Testi. Katılımcı: ${result.respondentRole === 'parent' ? 'Ebeveyn' : 'Öğretmen'}`
            }
        };

        return {
            id: savedId || crypto.randomUUID(),
            userId: user?.id || 'guest',
            studentName: result.studentName,
            gender: 'Erkek', // Default or add to form
            age: 7, // Default or add to form
            grade: '1. Sınıf',
            createdAt: new Date().toISOString(),
            report: reportData
        };
    };

    const handleSave = async () => {
        if (!user) { alert("Kaydetmek için lütfen giriş yapın."); return; }
        setIsSaving(true);
        try {
            const data = mapToSavedAssessment();
            // Using existing assessment service to save to Firestore
            await assessmentService.saveAssessment(
                user.id, 
                data.studentName, 
                data.gender, 
                data.age, 
                data.grade, 
                data.report
            );
            setIsSaved(true);
            alert("Rapor başarıyla arşivinize kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme hatası.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async (receiverId: string) => {
        if (!user) return;
        try {
            const data = mapToSavedAssessment();
            await assessmentService.shareAssessment(data, user.id, user.name, receiverId);
            setIsSharing(false);
            alert("Rapor paylaşıldı.");
        } catch (e) {
            alert("Paylaşım hatası.");
        }
    };

    const handlePrint = async () => {
        // Trigger specific print for the hidden report container
        await printService.generatePdf('#printable-report', `Disleksi_Tarama_${result.studentName}`, { action: 'print' });
    };

    const handleAddToWorkbookClick = () => {
        if (onAddToWorkbook) {
            const data = mapToSavedAssessment();
            // Wrap in format expected by Workbook (CollectionItemish)
            const item = {
                id: crypto.randomUUID(),
                activityType: 'ASSESSMENT_REPORT',
                title: `Rapor: ${result.studentName}`,
                data: data,
                settings: { showTitle: true }
            };
            onAddToWorkbook(item.data); 
            alert("Rapor kitapçığa eklendi!");
        }
    };

    const handleCreateSmartPlan = () => {
        if (onGeneratePlan) {
            // Identify high risk areas as weaknesses
            const weaknesses: string[] = [];
            Object.entries(result.categoryScores).forEach(([key, val]: [string, any]) => {
                if (val.riskLevel === 'high' || val.riskLevel === 'moderate') {
                    weaknesses.push(CATEGORY_LABELS[key] || key);
                }
            });
            // Approximate age (default 7 if not gathered in intro)
            onGeneratePlan(result.studentName, 7, weaknesses);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl sticky top-4 z-30">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${result.totalScore > 50 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {result.totalScore > 50 ? 'Yüksek Risk' : 'Düşük Risk'}
                        </span>
                        <span className="text-xs text-zinc-400 font-bold">{new Date(result.generatedAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{result.studentName}</h2>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                    <button onClick={handleCreateSmartPlan} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/30">
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI Plan Oluştur
                    </button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all">
                        <i className="fa-solid fa-print"></i> Yazdır
                    </button>
                    <button onClick={() => setIsSharing(true)} disabled={!user} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50">
                        <i className="fa-solid fa-share-nodes"></i> Paylaş
                    </button>
                    {onAddToWorkbook && (
                        <button onClick={handleAddToWorkbookClick} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all">
                            <i className="fa-solid fa-book-medical"></i> Kitapçığa Ekle
                        </button>
                    )}
                    <button onClick={handleSave} disabled={isSaved || isSaving || !user} className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${isSaved ? 'bg-green-600 text-white cursor-default' : 'bg-zinc-900 dark:bg-white text-white dark:text-black hover:scale-105'}`}>
                        {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : isSaved ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                        {isSaved ? 'Kaydedildi' : 'Kaydet'}
                    </button>
                    <button onClick={onRestart} className="w-9 h-9 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 transition-colors" title="Yeni Test">
                        <i className="fa-solid fa-rotate-right"></i>
                    </button>
                </div>
            </div>

            {/* Main Interactive Dashboard (Screen View) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart & Summary */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                    <h4 className="font-bold text-zinc-400 uppercase tracking-widest mb-6 text-sm">Bilişsel Risk Haritası</h4>
                    <RadarChart data={chartData} />
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    {Object.entries(result.categoryScores).map(([cat, data]) => (
                        <div key={cat} className={`p-5 rounded-2xl border-l-8 ${(data as any).color} bg-white shadow-sm flex justify-between items-center transition-transform hover:scale-[1.01]`}>
                            <div>
                                <h4 className="font-bold text-zinc-800">{CATEGORY_LABELS[cat]}</h4>
                                <p className="text-xs text-zinc-500 mt-1">{(data as any).riskLabel}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-2xl font-black ${(data as any).score > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>%{(data as any).score}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><i className="fa-solid fa-wand-magic-sparkles text-9xl"></i></div>
                
                <h3 className="text-lg font-black text-indigo-800 dark:text-indigo-300 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-robot"></i> Uzman Görüşü (AI)
                </h3>

                {loadingAi ? (
                    <div className="flex flex-col items-center py-12 text-indigo-400">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4"></i>
                        <p className="animate-pulse font-bold">Veriler analiz ediliyor ve rapor yazılıyor...</p>
                    </div>
                ) : aiAnalysis ? (
                    <div className="space-y-6 relative z-10">
                        <div className="prose prose-indigo max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/50 p-6 rounded-2xl border border-white/20 shadow-sm">
                            {(aiAnalysis as any).letter}
                        </div>
                        
                        <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest mt-4">Ev & Okul İçin Öneriler</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(aiAnalysis as any).actionSteps.map((step: string, i: number) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm flex gap-3">
                                    <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">{i+1}</div>
                                    <p className="text-sm font-bold text-zinc-700">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-red-400">Analiz oluşturulamadı.</p>
                )}
            </div>

            {/* --- HIDDEN PRINT TEMPLATE (A4 Optimized) --- */}
            <div id="printable-report" className="hidden">
                {/* Page 1: Overview */}
                <div className="print-page relative bg-white h-[297mm] w-[210mm] p-12 flex flex-col font-sans text-black">
                    <div className="flex justify-between items-end border-b-4 border-black pb-6 mb-8">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Tarama Sonuç Raporu</h1>
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Bursa Disleksi AI • Bilişsel Analiz Modülü</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold">{result.studentName}</h2>
                            <p className="text-sm text-zinc-500">{new Date(result.generatedAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                    </div>

                    <div className="flex-1 space-y-10">
                        {/* Summary Box */}
                        <div className="bg-zinc-50 p-6 rounded-2xl border-2 border-zinc-200">
                            <h3 className="font-black text-sm uppercase mb-3 border-b border-zinc-300 pb-2">Genel Değerlendirme</h3>
                            <p className="text-sm leading-relaxed text-justify italic font-medium">
                                {aiAnalysis?.letter}
                            </p>
                        </div>

                        {/* Chart Area */}
                        <div className="flex justify-center py-4">
                             {/* Fixed Size Chart for Print */}
                             <div style={{ width: '400px', height: '400px' }}>
                                 <RadarChart data={chartData} />
                             </div>
                        </div>

                        {/* Scores Table */}
                        <table className="w-full text-sm border-collapse border-2 border-black">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="p-3 text-left uppercase">Bilişsel Alan</th>
                                    <th className="p-3 text-center uppercase">Risk Seviyesi</th>
                                    <th className="p-3 text-right uppercase">Skor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(result.categoryScores).map(([cat, data], i) => (
                                    <tr key={cat} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                                        <td className="p-3 border-r border-zinc-200 font-bold">{CATEGORY_LABELS[cat]}</td>
                                        <td className="p-3 border-r border-zinc-200 text-center">{(data as any).riskLabel}</td>
                                        <td className="p-3 text-right font-black">%{(data as any).score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-auto text-center text-xs text-zinc-400 font-bold uppercase tracking-widest border-t pt-4">
                        Sayfa 1 / 2 • Bu rapor tıbbi tanı yerine geçmez
                    </div>
                </div>

                {/* Page 2: Detailed Findings & Recommendations */}
                <div className="print-page relative bg-white h-[297mm] w-[210mm] p-12 flex flex-col font-sans text-black break-before-page">
                    <div className="border-b-4 border-black pb-4 mb-8">
                        <h2 className="text-2xl font-black uppercase">Detaylı Bulgular & Öneriler</h2>
                    </div>

                    <div className="flex-1 space-y-8">
                        {/* Findings List */}
                        <div>
                            <h3 className="font-black text-lg bg-zinc-900 text-white px-4 py-2 rounded-lg inline-block mb-4">
                                <i className="fa-solid fa-magnifying-glass mr-2"></i> Tespit Edilen Belirtiler
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.values(result.categoryScores).flatMap(s => (s as any).findings).map((finding: string, i: number) => (
                                    <div key={i} className="flex items-start gap-3 p-2 border-b border-zinc-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                        <p className="text-sm font-medium">{finding}</p>
                                    </div>
                                ))}
                                {Object.values(result.categoryScores).flatMap(s => (s as any).findings).length === 0 && (
                                    <p className="text-sm italic text-zinc-500">Belirgin bir risk bulgusu kaydedilmedi.</p>
                                )}
                            </div>
                        </div>

                        {/* Action Plan */}
                        <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-8">
                            <h3 className="font-black text-lg text-indigo-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-road"></i> Önerilen Yol Haritası
                            </h3>
                            <div className="space-y-4">
                                {aiAnalysis?.actionSteps.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm font-bold text-zinc-800 pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Footer Info */}
                        <div className="mt-8 p-4 border border-dashed border-zinc-300 rounded-xl text-xs text-zinc-500 text-center">
                            <p>Değerlendirmeyi Yapan: <strong>{result.respondentRole === 'parent' ? 'Ebeveyn' : 'Öğretmen'}</strong></p>
                            <p>Tarih: {new Date().toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="mt-auto text-center text-xs text-zinc-400 font-bold uppercase tracking-widest border-t pt-4">
                        Sayfa 2 / 2 • Bursa Disleksi AI
                    </div>
                </div>
            </div>

            <ShareModal isOpen={isSharing} onClose={() => setIsSharing(false)} onShare={handleShare} worksheetTitle={`Tarama Raporu: ${result.studentName}`} />
        </div>
    );
};
