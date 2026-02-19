
import React, { useEffect, useState } from 'react';
import { ScreeningResult, EvaluationCategory } from '../../types/screening';
import { CATEGORY_LABELS } from '../../data/screeningQuestions';
import { RadarChart } from '../RadarChart';
import { generateWithSchema } from '../../services/geminiClient';
import { Type } from "@google/genai";
import { printService } from '../../utils/printService';
import { ACTIVITIES } from '../../constants';

interface Props {
    result: ScreeningResult;
    onRestart: () => void;
    onSelectActivity?: (id: any) => void;
}

export const ResultDashboard: React.FC<Props> = ({ result, onRestart, onSelectActivity }) => {
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

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

    const handlePrint = async () => {
        await printService.generatePdf('#screening-result', `Tarama_Sonucu_${result.studentName}`, { action: 'print' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <div>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 inline-block">Analiz Tamamlandı</span>
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white">{result.studentName}</h2>
                    <p className="text-zinc-500">Oluşturulma: {new Date(result.generatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold transition-colors">
                        <i className="fa-solid fa-print mr-2"></i> Yazdır
                    </button>
                    <button onClick={onRestart} className="px-6 py-3 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold transition-colors">
                        Yeni Test
                    </button>
                </div>
            </div>

            <div id="screening-result" className="space-y-8">
                {/* Visuals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Chart */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                        <h4 className="font-bold text-zinc-400 uppercase tracking-widest mb-6 text-sm">Bilişsel Risk Haritası</h4>
                        <RadarChart data={chartData} />
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-4">
                        {Object.entries(result.categoryScores).map(([cat, data]) => (
                            <div key={cat} className={`p-5 rounded-2xl border-l-8 ${(data as any).color} bg-white shadow-sm flex justify-between items-center`}>
                                <div>
                                    <h4 className="font-bold text-zinc-800">{CATEGORY_LABELS[cat]}</h4>
                                    <p className="text-xs text-zinc-500 mt-1">{(data as any).riskLabel}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-zinc-900">%{(data as any).score}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insight */}
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
                            <div className="prose prose-indigo max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/50 p-6 rounded-2xl">
                                {(aiAnalysis as any).letter}
                            </div>
                            
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
            </div>
        </div>
    );
};
