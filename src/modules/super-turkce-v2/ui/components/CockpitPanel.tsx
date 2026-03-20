import React, { useState } from 'react';
import { useSuperTurkceV2Store } from '../../core/store';
import { SuperTurkceAIEngine } from '../../core/engine/ai-engine';
import { TemplateSettingDef } from '../../core/types';

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
};

// ------------------------------------------------
// Dinamik Şablon Ayarı Bileşeni
// ------------------------------------------------
interface SettingWidgetProps {
    def: TemplateSettingDef;
    value: unknown;
    onChange: (key: string, val: unknown) => void;
}

const SettingWidget: React.FC<SettingWidgetProps> = ({ def, value, onChange }) => {
    const inputClass = "bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500 w-full";

    if (def.type === 'toggle') {
        return (
            <label className="flex items-center justify-between cursor-pointer gap-3 py-1">
                <span className="text-sm text-slate-700 font-medium">{def.label}</span>
                <button
                    role="switch"
                    aria-checked={!!value}
                    onClick={() => onChange(def.key, !value)}
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${value ? 'bg-brand-500' : 'bg-slate-300'}`}
                >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </label>
        );
    }

    if (def.type === 'range') {
        const numVal = typeof value === 'number' ? value : (def.defaultValue as number);
        return (
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-700 font-medium">{def.label}</span>
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{numVal}</span>
                </div>
                <input
                    type="range"
                    min={def.min ?? 1}
                    max={def.max ?? 10}
                    step={1}
                    value={numVal}
                    onChange={(e) => onChange(def.key, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
            </div>
        );
    }

    if (def.type === 'select') {
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{def.label}</label>
                <select
                    value={(value as string) ?? def.defaultValue}
                    onChange={(e) => onChange(def.key, e.target.value)}
                    className={inputClass}
                >
                    {(def.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    }

    if (def.type === 'text') {
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{def.label}</label>
                <input
                    type="text"
                    value={(value as string) ?? ''}
                    onChange={(e) => onChange(def.key, e.target.value)}
                    className={inputClass}
                    placeholder={def.defaultValue as string}
                />
            </div>
        );
    }

    return null;
};

// ------------------------------------------------
// Ana CockpitPanel
// ------------------------------------------------
export const CockpitPanel: React.FC = () => {
    const store = useSuperTurkceV2Store();
    const [loading, setLoading] = useState(false);

    const templates = getTemplates(store.activeStudioId);
    const activeTemplate = templates.find((t: { id: string }) => t.id === store.activeTemplateId) as { id: string; label: string; description: string; settings: TemplateSettingDef[]; schema: Record<string, unknown>; buildAiPrompt: (s: Record<string, unknown>, g: number, t: string) => string; fastGenerate: () => unknown } | undefined;

    // Default settings için aktif şablonun varsayılan değerlerini al
    const getSettingValue = (key: string, def: TemplateSettingDef) => {
        if (store.templateSettings[key] !== undefined) return store.templateSettings[key];
        return def.defaultValue;
    };

    const handleGenerate = async () => {
        if (!store.activeStudioId || !store.activeTemplateId || !store.objective?.title) {
            alert("Lütfen önce bir konu/kazanım yazın ve şablon seçin.");
            return;
        }
        if (!activeTemplate) return;

        setLoading(true);

        // Şablonun tüm ayarlarını varsayılan + kullanıcı değerleriyle birleştir
        const mergedSettings: Record<string, unknown> = {};
        (activeTemplate.settings ?? []).forEach((def: TemplateSettingDef) => {
            mergedSettings[def.key] = getSettingValue(def.key, def);
        });
        Object.assign(mergedSettings, store.templateSettings);

        const topicLabel = store.objective.title;
        const promptText = activeTemplate.buildAiPrompt(mergedSettings, store.grade ?? 4, topicLabel);

        try {
            if (store.engine === 'fast') {
                // Offline (Hızlı) Motor
                const fastData = activeTemplate.fastGenerate();
                const worksheetInfo = {
                    id: Date.now().toString(),
                    templateId: store.activeTemplateId,
                    engineMode: 'fast' as const,
                    settingsSnapshot: mergedSettings,
                    data: { ...(fastData as Record<string, unknown>), title: topicLabel },
                    printSettingsSnapshot: store.printSettings,
                    createdAt: Date.now(),
                };
                store.setCurrentWorksheet(worksheetInfo);
                store.saveToHistory(worksheetInfo);
            } else {
                // AI Motoru
                const response = await SuperTurkceAIEngine.generateWorksheetData({
                    grade: store.grade ?? 4,
                    topic: topicLabel,
                    unitHint: store.objective?.unitHint,
                    audience: store.audience ?? 'normal',
                    promptText,
                    schema: activeTemplate.schema,
                });

                if (response.success && response.data) {
                    const worksheetInfo = {
                        id: Date.now().toString(),
                        templateId: store.activeTemplateId,
                        engineMode: 'ai' as const,
                        settingsSnapshot: mergedSettings,
                        data: { ...response.data, title: topicLabel },
                        printSettingsSnapshot: store.printSettings,
                        createdAt: Date.now(),
                    };
                    store.setCurrentWorksheet(worksheetInfo);
                    store.saveToHistory(worksheetInfo);
                } else {
                    alert("Üretim hatası: " + response.error);
                }
            }
        } catch (error: unknown) {
            alert("Sistem hatası: " + (error instanceof Error ? error.message : String(error)));
        } finally {
            setLoading(false);
        }
    };

    const canGenerate = !loading && !!store.activeTemplateId && !!store.objective?.title;

    return (
        <div className="w-[380px] min-w-[320px] max-w-[420px] bg-white border-r border-slate-200 h-full flex flex-col overflow-hidden shrink-0">
            <div className="p-5 overflow-y-auto flex-1 space-y-6">

                {/* ── 1. SINIF & ÜNİTE & KAZANIM ── */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-chalkboard-user text-brand-400"></i> Sınıf & Konu
                    </h3>
                    <div className="space-y-2">
                        {/* Sınıf seçimi */}
                        <div className="flex gap-2">
                            {[4, 5, 6, 7, 8].map(g => (
                                <button
                                    key={g}
                                    onClick={() => store.setGrade(g as 4|5|6|7|8)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${store.grade === g ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
                                >
                                    {g}. Sınıf
                                </button>
                            ))}
                        </div>

                        {/* Ünite (serbest metin) */}
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
                            placeholder="Ünite adı (isteğe bağlı) — Örn: 3. Ünite: Değerlerimiz"
                            value={store.objective?.unitHint ?? ''}
                            onChange={(e) => store.setObjective({ id: store.objective?.id ?? 'custom', title: store.objective?.title ?? '', unitHint: e.target.value })}
                        />

                        {/* Kazanım / Konu */}
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-500"
                            placeholder="Konu / Kazanım — Örn: Uzay Kampı, Atatürk…"
                            value={store.objective?.title ?? ''}
                            onChange={(e) => store.setObjective({ id: store.objective?.id ?? 'custom', title: e.target.value, unitHint: store.objective?.unitHint })}
                        />
                    </div>
                </section>

                {/* ── 2. HEDEF KİTLE ── */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-user-group text-brand-400"></i> Hedef Kitle
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {([
                            { value: 'normal',         label: 'Normal',           icon: 'fa-user', color: 'emerald' },
                            { value: 'hafif_disleksi', label: 'Hafif Disleksi',   icon: 'fa-book-reader', color: 'amber' },
                            { value: 'derin_disleksi', label: 'Derin Disleksi',   icon: 'fa-universal-access', color: 'rose' },
                        ] as const).map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => store.setAudience(opt.value)}
                                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-bold transition-all ${store.audience === opt.value ? `bg-${opt.color}-50 border-${opt.color}-400 text-${opt.color}-700 shadow-sm ring-2 ring-${opt.color}-100` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                                <i className={`fa-solid ${opt.icon} text-base`}></i>
                                <span className="text-center leading-tight">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── 3. ÜRETİM MOTORU ── */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-microchip text-brand-400"></i> Üretim Motoru
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => store.setEngine('fast')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${store.engine === 'fast' ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                        >
                            <i className="fa-solid fa-bolt text-yellow-400"></i> Hızlı (Offline)
                        </button>
                        <button
                            onClick={() => store.setEngine('ai')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all ${store.engine === 'ai' ? 'bg-gradient-to-r from-brand-500 to-indigo-500 text-white border-brand-400 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'}`}
                        >
                            <i className="fa-solid fa-sparkles"></i> Yapay Zeka
                        </button>
                    </div>
                    {store.engine === 'fast' && (
                        <p className="text-[11px] text-slate-400 mt-2 text-center leading-snug">
                            Sabit örnek veri üretir — internet bağlantısı gerekmez.
                        </p>
                    )}
                </section>

                {/* ── 4. ŞABLON SEÇİMİ ── */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-layer-group text-brand-400"></i> Şablon
                        <span className="ml-auto text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-normal">{templates.length} şablon</span>
                    </h3>
                    {templates.length === 0 ? (
                        <p className="text-sm text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200">Bu stüdyo için şablon henüz eklenmedi.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-1.5">
                            {templates.map((t: { id: string; label: string; description: string; difficulty?: string }) => (
                                <button
                                    key={t.id}
                                    onClick={() => store.setTemplateId(t.id)}
                                    className={`text-left p-3 rounded-xl border transition-all ${store.activeTemplateId === t.id ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100 shadow-sm' : 'border-slate-200 hover:border-brand-200 bg-white hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <span className="font-semibold text-slate-800 text-sm">{t.label}</span>
                                        {t.difficulty && t.difficulty !== 'all' && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${t.difficulty === 'kolay' ? 'bg-emerald-50 text-emerald-600' : t.difficulty === 'orta' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {t.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{t.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── 5. ŞABLON ÖZEL AYARLARI (Dinamik) ── */}
                {activeTemplate && activeTemplate.settings && activeTemplate.settings.length > 0 && (
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <i className="fa-solid fa-sliders text-brand-400"></i> Etkinlik Ayarları
                        </h3>
                        <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                            {activeTemplate.settings.map((def: TemplateSettingDef) => (
                                <SettingWidget
                                    key={def.key}
                                    def={def}
                                    value={getSettingValue(def.key, def)}
                                    onChange={(key, val) => store.setTemplateSetting(key, val)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 6. BASKI & DİSLEKSİ AYARLARI ── */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-print text-brand-400"></i> Baskı & Erişilebilirlik
                    </h3>
                    <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={!!store.printSettings?.highContrast}
                                onChange={(e) => store.updatePrintSettings({ highContrast: e.target.checked })}
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-brand-600 transition-colors">Yüksek Kontrast (Sarı Zemin)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={store.printSettings?.fontFamily === 'OpenDyslexic'}
                                onChange={(e) => store.updatePrintSettings({ fontFamily: e.target.checked ? 'OpenDyslexic' : 'Arial' })}
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-brand-600 transition-colors">Disleksi Fontu (OpenDyslexic)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={!!store.printSettings?.b_d_spacing}
                                onChange={(e) => store.updatePrintSettings({ b_d_spacing: e.target.checked })}
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-brand-600 transition-colors">b/d/p/q Harf Aralığı</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                checked={!!store.printSettings?.showWatermark}
                                onChange={(e) => store.updatePrintSettings({ showWatermark: e.target.checked })}
                            />
                            <span className="text-sm text-slate-700 font-medium group-hover:text-brand-600 transition-colors">Filigran Göster</span>
                        </label>
                        {/* Satır aralığı */}
                        <div className="pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-slate-600 font-medium tracking-wide">SATIR ARALIĞI</span>
                                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                                    {store.printSettings?.lineHeight ?? 'normal'}
                                </span>
                            </div>
                            <select
                                value={store.printSettings?.lineHeight ?? 'normal'}
                                onChange={(e) => store.updatePrintSettings({ lineHeight: e.target.value as 'dar'|'normal'|'genis'|'ultra_genis' })}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-500"
                            >
                                <option value="dar">Dar (1.2x)</option>
                                <option value="normal">Normal (1.5x)</option>
                                <option value="genis">Geniş (1.8x) — Önerilen</option>
                                <option value="ultra_genis">Ultra Geniş (2.2x)</option>
                            </select>
                        </div>
                        {/* Kurum adı */}
                        <div className="pt-2 border-t border-slate-200">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Kurum Adı (Altbilgi)</label>
                            <input
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-500"
                                value={store.printSettings?.institutionName ?? ''}
                                onChange={(e) => store.updatePrintSettings({ institutionName: e.target.value })}
                                placeholder="Okul / Kurum Adı"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* ── ÜRETİM BUTONU ── */}
            <div className="p-5 border-t border-slate-200 bg-white shrink-0 relative z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <button
                    disabled={!canGenerate}
                    onClick={handleGenerate}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm
                        ${loading
                            ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                            : canGenerate
                                ? 'bg-gradient-to-r from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 text-white shadow-xl shadow-brand-500/25 active:scale-[0.98]'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                >
                    {loading ? (
                        <><i className="fa-solid fa-spinner fa-spin text-base"></i> AI Motoru Çalışıyor…</>
                    ) : store.engine === 'fast' ? (
                        <><i className="fa-solid fa-bolt text-yellow-300 text-base"></i> Hızlı Üret</>
                    ) : (
                        <><i className="fa-solid fa-sparkles text-yellow-200 text-base"></i> Akıllı Belge Üret</>
                    )}
                </button>
                {!canGenerate && !loading && (
                    <p className="text-[11px] text-center text-rose-400 mt-2 font-medium">
                        {!store.objective?.title ? 'Konu / Kazanım girin' : 'Şablon seçin'}
                    </p>
                )}
            </div>
        </div>
    );
};
