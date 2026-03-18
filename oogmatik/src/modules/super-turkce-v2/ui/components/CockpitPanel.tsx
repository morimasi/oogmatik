import React, { useState } from 'react';
import { useSuperTurkceV2Store } from '../../core/store';
import { SuperTurkceAIEngine } from '../../core/engine/ai-engine';

import { readingComprehensionFormats } from '../../studios/1-okuma-anlama/formats';
import { logicReasoningFormats } from '../../studios/2-mantik-muhakeme/formats';
import { grammarFormats } from '../../studios/3-dil-bilgisi/formats';
import { orthographyFormats } from '../../studios/4-yazim-noktalama/formats';
import { idiomProverbFormats } from '../../studios/5-deyimler/formats';
import { phoneticsFormats } from '../../studios/6-ses-olaylari/formats';

const getTemplates = (studioId: string | null) => {
    switch (studioId) {
        case 'okuma-anlama': return readingComprehensionFormats;
        case 'mantik-muhakeme': return logicReasoningFormats;
        case 'dil-bilgisi': return grammarFormats;
        case 'yazim-noktalama': return orthographyFormats;
        case 'deyimler': return idiomProverbFormats;
        case 'ses-olaylari': return phoneticsFormats;
        default: return [];
    }
}

export const CockpitPanel: React.FC = () => {
    const store = useSuperTurkceV2Store();
    const [loading, setLoading] = useState(false);

    const templates = getTemplates(store.activeStudioId);

    const handleGenerate = async () => {
        if (!store.activeStudioId || !store.activeTemplateId || !store.objective?.title) {
            alert("Lütfen önce bir konu/kazanım yazın ve şablon seçin.");
            return;
        }

        const template = templates.find((t: any) => t.id === store.activeTemplateId);
        if (!template) return;

        setLoading(true);

        const defaultParamSettings = template.schema.properties ?
            Object.keys(template.schema.properties).reduce((acc: any, key) => { acc[key] = "Varsayılan"; return acc; }, {})
            : {};

        const mergedSettings = { ...defaultParamSettings, ...store.templateSettings };
        const promptText = template.buildAiPrompt(mergedSettings, store.grade || 4, store.objective.title);

        try {
            const response = await SuperTurkceAIEngine.generateWorksheetData({
                grade: (store.grade as any) || 4,
                topic: store.objective.title,
                audience: store.audience || 'normal',
                promptText: promptText,
                schema: template.schema
            });

            if (response.success && response.data) {
                const worksheetInfo = {
                    id: Date.now().toString(),
                    templateId: store.activeTemplateId,
                    data: { ...response.data, title: store.objective.title },
                    printSettingsSnapshot: store.printSettings,
                    createdAt: new Date().toISOString()
                };
                store.setCurrentWorksheet(worksheetInfo as any);
                store.saveToHistory(worksheetInfo as any);
            } else {
                alert("Üretim hatası: " + response.error);
            }
        } catch (error: any) {
            alert("Sistem hatası: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-1/3 min-w-[340px] max-w-[450px] bg-white border-r border-slate-200 h-full flex flex-col overflow-hidden">
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">

                {/* 1. KAZANIM VE SINIF */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Konu / Kazanım</h3>
                    <div className="flex gap-2">
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-24 outline-none focus:border-emerald-500"
                            value={store.grade || ''}
                            onChange={e => store.setGrade(Number(e.target.value) as any)}
                        >
                            <option value="">Sınıf</option>
                            {[4, 5, 6, 7, 8].map(g => <option key={g} value={g}>{g}. Sınıf</option>)}
                        </select>
                        <input
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500"
                            placeholder="Örn: Uzay Kampı Metni..."
                            value={store.objective?.title || ''}
                            onChange={e => store.setObjective({ id: 'custom', title: e.target.value })}
                        />
                    </div>
                </div>

                {/* 2. ŞABLON SEÇİMİ */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Şablon Seçimi</h3>
                    {templates.length === 0 ? (
                        <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200">Bu stüdyo için şablon henüz eklenmedi.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {templates.map((t: any) => (
                                <button
                                    key={t.id}
                                    onClick={() => store.setTemplateId(t.id)}
                                    className={`text-left p-3 rounded-xl border transition-all ${store.activeTemplateId === t.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100 shadow-sm' : 'border-slate-200 hover:border-brand-300 bg-white'}`}
                                >
                                    <div className="font-semibold text-slate-800 text-sm mb-1">{t.label}</div>
                                    <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. DİSLEKSİ & PDF AYARLARI */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Punto & Disleksi Ayarı</h3>
                    <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={!!store.printSettings?.highContrast}
                                onChange={e => store.updatePrintSettings({ highContrast: e.target.checked })}
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-brand-600 transition-colors">Yüksek Kontrast (Sarı Zemin)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={store.printSettings?.fontFamily === 'OpenDyslexic'}
                                onChange={e => store.updatePrintSettings({ fontFamily: e.target.checked ? 'OpenDyslexic' : 'Inter' })}
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-brand-600 transition-colors">Disleksi Fontu (OpenDyslexic)</span>
                        </label>
                        <div className="pt-3 border-t border-slate-200 mt-2">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-600 font-medium tracking-wide">SATIR ARALIĞI</span>
                                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{store.printSettings?.lineHeight === 'normal' ? '1.5' : store.printSettings?.lineHeight}x</span>
                            </div>
                            <input
                                type="range" min="1.2" max="2.5" step="0.1"
                                value={store.printSettings?.lineHeight !== 'normal' ? parseFloat(store.printSettings?.lineHeight || '1.5') : 1.5}
                                onChange={e => store.updatePrintSettings({ lineHeight: e.target.value.toString() })}
                                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ÜRETİM TETİĞİ (GENERATE BUTTON) */}
            <div className="p-5 border-t border-slate-200 bg-white shrink-0 relative z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <button
                    disabled={loading || !store.activeTemplateId || !store.objective}
                    onClick={handleGenerate}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 cursor-not-allowed shadow-none text-white' : (!store.activeTemplateId || !store.objective) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white shadow-xl shadow-brand-500/20 active:scale-[0.98]'}`}
                >
                    {loading ? (
                        <><i className="fa-solid fa-spinner fa-spin text-lg"></i> AI Motoru Çalışıyor...</>
                    ) : (
                        <><i className="fa-solid fa-bolt text-lg text-yellow-300"></i> Akıllı Belge Üret</>
                    )}
                </button>
                {(!store.activeTemplateId || !store.objective) && !loading && (
                    <div className="text-[11px] text-center text-rose-500 mt-3 font-medium flex items-center justify-center gap-1">
                        <i className="fa-solid fa-circle-info"></i> Lütfen konu girin ve şablon seçin
                    </div>
                )}
            </div>
        </div>
    );
};
