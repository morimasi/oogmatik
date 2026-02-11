
import React, { useState } from 'react';
import { enrichUserPrompt, generateCreativeStudioActivity } from '../services/generators/creativeStudio';

interface CreativeStudioProps {
    onResult: (data: any) => void;
    onCancel: () => void;
}

const SNIPPETS = [
    { label: "5N1K Entegre Et", value: "İçeriğe metne dayalı 5N1K soruları ekle." },
    { label: "TDK Heceleme", value: "Tüm kelimeleri TDK heceleme kurallarına göre analiz et." },
    { label: "Vektörel Şekiller", value: "Soruları çözmek için gerekli olan ipuçlarını SVG şekilleri olarak kodla." },
    { label: "Dual Column", value: "Eşleştirme yapısı için ikili sütun düzeni kullan." },
    { label: "Klinik Çeldirici", value: "Yanlış şıkları ayna harfler (b-d, p-q) üzerinden kurgula." }
];

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onResult, onCancel }) => {
    const [prompt, setPrompt] = useState("");
    const [difficulty, setDifficulty] = useState("Orta");
    const [itemCount, setItemCount] = useState(8);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");

    const handleEnchant = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setStatus("AI Promptunuzu zenginleştiriyor...");
        try {
            const enriched = await enrichUserPrompt(prompt);
            setPrompt(enriched);
            setStatus("Prompt başarıyla optimize edildi.");
        } catch (e) {
            setStatus("Genişletme sırasında hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setStatus("Gemini 3.0 Muhakeme Ediyor (Thinking)...");
        try {
            const result = await generateCreativeStudioActivity(prompt, { difficulty, itemCount });
            onResult(Array.isArray(result) ? result : [result]);
        } catch (e) {
            setStatus("Üretim başarısız oldu.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Sol Panel: Prompt Mühendisliği */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <i className="fa-solid fa-wand-sparkles text-indigo-500"></i> AI Creative Studio
                                </h3>
                                <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">Özgün Etkinlik Tasarımcısı</p>
                            </div>
                            <button onClick={handleEnchant} disabled={isProcessing || !prompt} className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">
                                <i className="fa-solid fa-sparkles mr-2"></i> Promptu Zenginleştir
                            </button>
                        </div>

                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-80 p-6 bg-black/40 border border-white/5 rounded-[2rem] text-sm leading-relaxed text-zinc-300 outline-none focus:border-indigo-500 transition-all font-mono resize-none"
                            placeholder="Nasıl bir etkinlik üretmek istersiniz? (Örn: Dinozor temalı bir harf eşleştirme bulmacası olsun, içinde 3x3 bir grid yer alsın...)"
                        ></textarea>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {SNIPPETS.map(s => (
                                <button 
                                    key={s.label}
                                    onClick={() => setPrompt(prev => prev + "\n" + s.value)}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border border-transparent hover:border-zinc-600"
                                >
                                    + {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sağ Panel: Parametreler & Kontrol */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[3rem] border border-white/5 p-8 flex-1 flex flex-col shadow-xl">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">ÜRETİM PARAMETRELERİ</h4>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-400">Zorluk Seviyesi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(l => (
                                        <button 
                                            key={l} onClick={() => setDifficulty(l)}
                                            className={`py-2 rounded-xl text-[10px] font-black border transition-all ${difficulty === l ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                    <span>ÖĞE ADEDİ</span>
                                    <span className="text-indigo-400 font-black">{itemCount}</span>
                                </div>
                                <input type="range" min={2} max={20} value={itemCount} onChange={e => setItemCount(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>

                        <div className="mt-auto space-y-4 pt-10">
                            <div className="h-6 flex items-center justify-center">
                                {status && <p className="text-[10px] font-bold text-indigo-400 animate-pulse uppercase tracking-widest">{status}</p>}
                            </div>
                            <button 
                                onClick={handleGenerate}
                                disabled={isProcessing || !prompt}
                                className="w-full py-5 bg-white text-indigo-950 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 text-sm disabled:opacity-50"
                            >
                                {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                                ÜRETİME BAŞLA
                            </button>
                            <button onClick={onCancel} className="w-full py-3 text-zinc-600 hover:text-zinc-400 text-xs font-bold transition-colors">Vazgeç</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
