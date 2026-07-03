import React, { useState } from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { generateSuperStudioContent } from '../../../services/generators/superStudioGenerator';
import { getTemplateById } from '../templates';
import { assessContentQuality } from '../../../utils/contentQuality';
import { optimizePrompt } from '../../../utils/promptOptimizer';

import { logInfo, logError, logWarn } from '../../../utils/logger.js';

export const ConfiguratorCascade: React.FC = () => {
    const {
        selectedTemplates, templateSettings, generationMode, grade, topic, difficulty, studentId,
        generationParams, setGenerationParams,
        setIsGenerating, isGenerating, clearGeneratedContents, addGeneratedContent, setTemplateSetting,
        setGenerationProgress, setGenerationStep, setCurrentTemplate,
        addToHistory,
    } = useSuperStudioStore();

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [qualityScores, setQualityScores] = useState<Record<string, number>>({});

    const handleGenerate = async () => {
        setIsGenerating(true);
        clearGeneratedContents();
        setGenerationProgress(0);
        setGenerationStep('prompt');

        try {
            const total = selectedTemplates.length;
            const results = [];
            for (let i = 0; i < total; i++) {
                const tpl = selectedTemplates[i];
                setCurrentTemplate(tpl);
                setGenerationStep('api');
                setGenerationProgress(Math.round(((i) / total) * 60));

                const batchResults = await generateSuperStudioContent({
                    templates: [tpl],
                    settings: templateSettings,
                    mode: generationMode,
                    grade,
                    topic,
                    difficulty,
                    studentId,
                });

                setGenerationStep('processing');
                setGenerationProgress(Math.round(((i + 0.5) / total) * 80));

                for (const res of batchResults) {
                    const contentStr = res.pages?.[0]?.content || '';
                    const quality = assessContentQuality(contentStr, { grade, difficulty });
                    setQualityScores(prev => ({ ...prev, [res.id]: quality.overall }));

                    if (quality.overall >= 50) {
                        results.push(res);
                        addToHistory({
                            id: res.id,
                            templateId: tpl,
                            prompt: topic || 'Genel',
                            temperature: generationParams.temperature,
                            topP: generationParams.topP,
                            thinkingBudget: generationParams.thinkingBudget,
                            difficulty,
                            grade,
                            topic,
                            qualityScore: quality.overall,
                            createdAt: Date.now(),
                            output: res,
                        });
                    }
                    addGeneratedContent(res);
                }

                setGenerationStep('saving');
                setGenerationProgress(Math.round(((i + 1) / total) * 100));
            }

            setGenerationStep('done');
            setGenerationProgress(100);
        } catch (error) {
            logError(error instanceof Error ? error : String(error));
            setGenerationStep('idle');
            setGenerationProgress(0);
        } finally {
            setIsGenerating(false);
        }
    };

    if (selectedTemplates.length === 0) {
        return (
            <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
                Lütfen yukarıdaki menüden bir veya daha fazla şablon seçin. Seçtiğiniz şablonların özel ayarları burada sırayla (cascade) açılacaktır.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-slate-200 mb-2 flex items-center">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full mr-2"></span>
                Şablon Ayarları (Premium)
            </h2>

            {selectedTemplates.map((templateId: string, index: number) => {
                const templateDef = getTemplateById(templateId);
                if (!templateDef) return null;

                const SettingsComponent = templateDef.component;
                const currentSettings = templateSettings[templateId] || {};

                return (
                    <div key={templateId} className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide flex items-center">
                                <span className="text-slate-500 mr-2">#{index + 1}</span>
                                <i className={`fa-solid ${templateDef.icon} mr-2 text-teal-400`}></i>
                                {templateDef.title}
                            </h3>
                        </div>
                        <div className="mt-2 text-slate-200">
                            <SettingsComponent
                                templateId={templateId}
                                settings={currentSettings}
                                onChange={(payload: any) => setTemplateSetting(templateId, payload)}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Generation Parameters - motor.md Faz 1.1 */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-slate-300"
                >
                    <span className="flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-teal-400"></i>
                        Üretim Parametreleri
                    </span>
                    <i className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'} text-slate-500 transition-transform`}></i>
                </button>

                {showAdvanced && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Temperature (Yaratıcılık)</span>
                                <span className="font-mono text-teal-400">{generationParams.temperature.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={generationParams.temperature}
                                onChange={(e) => setGenerationParams({ temperature: parseFloat(e.target.value) })}
                                className="w-full accent-teal-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                                <span>Kesin</span>
                                <span>Yaratıcı</span>
                            </div>
                        </div>

                        <div>
                            <label className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Top-P (Çeşitlilik)</span>
                                <span className="font-mono text-teal-400">{generationParams.topP.toFixed(2)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={generationParams.topP}
                                onChange={(e) => setGenerationParams({ topP: parseFloat(e.target.value) })}
                                className="w-full accent-teal-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                                <span>Odaklı</span>
                                <span>Çeşitli</span>
                            </div>
                        </div>

                        <div>
                            <label className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Thinking Budget (Düşünme Süresi)</span>
                                <span className="font-mono text-teal-400">{generationParams.thinkingBudget}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="8192"
                                step="256"
                                value={generationParams.thinkingBudget}
                                onChange={(e) => setGenerationParams({ thinkingBudget: parseInt(e.target.value) })}
                                className="w-full accent-teal-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
                                <span>Hızlı</span>
                                <span>Derin</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quality Scores Display */}
            {Object.keys(qualityScores).length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                        <i className="fa-solid fa-chart-line text-emerald-400"></i>
                        Kalite Skorları
                    </h4>
                    <div className="space-y-1">
                        {Object.entries(qualityScores).map(([id, score]) => (
                            <div key={id} className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 truncate max-w-[200px]">{id.slice(0, 30)}</span>
                                <span className={`font-bold ${score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {score}/100
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full mt-4 text-white font-medium py-3 rounded-xl shadow-lg transition-all flex justify-center items-center ${isGenerating ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-accent hover:bg-accent/90 shadow-accent/20'
                    }`}
            >
                <span>{isGenerating ? 'İçerikler Sistematik Olarak Üretiliyor...' : 'İçerikleri Üret (Batch Mod)'}</span>
                {!isGenerating && <span className="ml-2">✨</span>}
            </button>
        </div>
    );
};
