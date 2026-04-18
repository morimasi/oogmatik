import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';
import { WorksheetData, ActivityType } from '../types/core'; // types/core olarak güncellendi
import { SheetRenderer } from './SheetRenderer';

// Basit aktivite tipi tahminleyicisi
const detectActivityType = (promptId: string): ActivityType => {
    // prompt_math_puzzle -> MATH_PUZZLE
    const rawId = promptId.replace(/^prompt_/i, '').toUpperCase();

    // ActivityType enum'ında var mı kontrol et
    if (rawId in ActivityType) {
        return rawId as ActivityType;
    }

    // Yaygın eşleşmeler
    if (rawId.includes('READING')) return ActivityType.STORY_COMPREHENSION;
    if (rawId.includes('MATH')) return ActivityType.MATH_PUZZLE;
    if (rawId.includes('VISUAL')) return ActivityType.VISUAL_ODD_ONE_OUT;

    return ActivityType.MATH_PUZZLE; // Fallback
};

interface _PromptSimulatorProps {
    prompt: PromptTemplate;
}

export const PromptSimulator = ({ prompt }: { prompt: PromptTemplate }) => {
    const [variables, setVariables] = useState<Record<string, string>>({});
    const [result, setResult] = useState<WorksheetData>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');

    // Otomatik algılanan aktivite tipi
    const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>(detectActivityType(prompt.id));

    // Prompt veya ID değişince tipi güncelle
    useEffect(() => {
        setSelectedActivityType(detectActivityType(prompt.id));
    }, [prompt.id]);

    // ... (değişkenler useEffect aynen kalacak)

    useEffect(() => {
        const matches = prompt.template.match(/\{\{(.*?)\}\}/g);
        const vars: string[] = matches ? [...new Set(matches.map((m: string) => m.replace(/\{|\}/g, '')) as string[])] : [];

        const initialVars: Record<string, string> = {};
        vars.forEach((v: string) => {
            initialVars[v] = ''; // Varsayılan boş
        });
        setVariables(initialVars);
        setResult(null); // Prompt değişince sonucu sıfırla
    }, [prompt.template]);

    const handleSimulate = async () => {
        setLoading(true);
        setError(null);
        try {
            // AdminService.testPrompt artık gerçek API çağırıyor
            const aiResponse = await adminService.testPrompt(prompt, variables);
            logger.info("AI Response:", aiResponse);

            // Gelen veri WorksheetData formatında mı? Değilse uyaralım
            if (!aiResponse || typeof aiResponse !== 'object') {
                throw new AppError("AI geçerli bir JSON nesnesi döndürmedi.", 'INTERNAL_ERROR', 500);
            }

            setResult(aiResponse);


        } catch (err: any) {
            console.error("Simülasyon Hatası:", err);
            setError(err.message || "Simülasyon sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* SOL PANEL: KONTROL & DEĞİŞKENLER */}
            <div className="w-80 flex flex-col gap-4 shrink-0 bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl p-5 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <i className="fa-solid fa-sliders"></i>
                    <span className="text-xs font-black uppercase tracking-widest">SİMÜLASYON PARAMETRELERİ</span>
                </div>

                {Object.keys(variables).length === 0 ? (
                    <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-500 font-mono">Değişken yok (Statik Prompt)</span>
                    </div>
                ) : (
                    Object.keys(variables).map((v: string) => (
                        <div key={v} className="space-y-1.5">
                            <label className="text-[10px] font-bold text-indigo-400 uppercase ml-1 block">{v}</label>
                            <input
                                type="text"
                                value={variables[v]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariables({ ...variables, [v]: e.target.value })}
                                className="w-full bg-black border border-zinc-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 outline-none transition-all"
                                placeholder={`Değer girin...`}
                            />
                        </div>
                    ))
                )}

                <button
                    onClick={handleSimulate}
                    disabled={loading}
                    className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                    {loading ? 'ÜRETİLİYOR...' : 'SİMÜLASYONU BAŞLAT'}
                </button>

                {/* Hata Göstergesi */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-medium mt-2 animate-in fade-in slide-in-from-top-2">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i>{error}
                    </div>
                )}

                {/* Renderer Override (Manuel Seçim) */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-2">RENDER MOTORU (DEBUG)</label>
                    <select
                        value={selectedActivityType}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedActivityType(e.target.value as ActivityType)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-2 text-[10px] text-zinc-300 outline-none"
                    >
                        {Object.values(ActivityType).map((t: ActivityType) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>


            </div>

            {/* SAĞ PANEL: ÖNİZLEME */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-zinc-800/50 rounded-2xl overflow-hidden relative shadow-2xl">
                {/* Header */}
                <div className="h-12 border-b border-zinc-800/50 bg-black/40 flex items-center justify-between px-4">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <i className="fa-solid fa-eye text-emerald-500"></i> CANLI ÖNİZLEME
                    </span>
                    <div className="flex bg-zinc-900 p-1 rounded-lg">
                        <button onClick={() => setViewMode('preview')} className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${viewMode === 'preview' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>GÖRSEL</button>
                        <button onClick={() => setViewMode('json')} className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${viewMode === 'json' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>JSON (HAM)</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-[#050505] relative custom-scrollbar">
                    {!result ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 select-none">
                            <div className="w-20 h-20 rounded-full border-2 border-zinc-800 flex items-center justify-center text-3xl mb-4">
                                <i className="fa-solid fa-flask"></i>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-50">Henüz Veri Yok</p>
                            <p className="text-[10px] mt-2 max-w-[200px] text-center opacity-30">Simülasyonu başlatarak yapay zekanın ürettiği içeriği burada test edebilirsiniz.</p>
                        </div>
                    ) : (
                        viewMode === 'json' ? (
                            <pre className="p-6 text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        ) : (
                            <div className="p-8 transform scale-90 origin-top h-full overflow-y-auto">
                                <SheetRenderer
                                    activityType={selectedActivityType}
                                    data={(Array.isArray(result) ? result : [result]) as any}
                                    settings={{
                                        fontFamily: 'Lexend',
                                        fontSize: 16,
                                        showTitle: true,
                                        showStudentInfo: false,
                                        showFooter: true,
                                        themeBorder: 'simple',
                                        // Gerekli diğer tüm zorunlu alanları doldur (Typescript hatası almamak için)
                                        scale: 1, borderColor: '#000', borderWidth: 1, margin: 10, columns: 1, gap: 10, orientation: 'portrait',
                                        contentAlign: 'center', fontWeight: 'normal', fontStyle: 'normal', visualStyle: 'card', lineHeight: 1.5,
                                        letterSpacing: 0, wordSpacing: 0, paragraphSpacing: 10, showPedagogicalNote: false, showMascot: false,
                                        showInstruction: true, showImage: false, smartPagination: false, focusMode: false, rulerColor: 'red', rulerHeight: 10, maskOpacity: 0.5,
                                        footerText: ''
                                    }}
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
