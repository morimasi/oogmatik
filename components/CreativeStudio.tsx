
import React, { useState, useEffect } from 'react';
import { refinePromptWithAI, generateCreativeStudioActivity } from '../services/generators/creativeStudio';
import { PEDAGOGICAL_LIBRARY, ActivityLibraryItem } from '../services/generators/promptLibrary';

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

const THINKING_MESSAGES = [
    "Gemini 3.0 Thinking Modu Aktif...",
    "Pedagojik metodoloji analiz ediliyor...",
    "Nöro-mimari düzen tasarlanıyor...",
    "Klinik çeldiriciler kurgulanıyor...",
    "Görsel hiyerarşi optimize ediliyor...",
    "Çıktı disleksi standartlarına uyarlanıyor...",
    "Hemen hemen hazır, son kontroller yapılıyor..."
];

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onResult, onCancel }) => {
    const [prompt, setPrompt] = useState("");
    const [difficulty, setDifficulty] = useState("Orta");
    const [itemCount, setItemCount] = useState(8);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState("");
    const [statusIndex, setStatusIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
    const [librarySearch, setLibrarySearch] = useState("");

    // Dinamik durum mesajları döngüsü
    useEffect(() => {
        let interval: any;
        if (isProcessing) {
            interval = setInterval(() => {
                setStatusIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
            }, 4000);
        } else {
            setStatusIndex(0);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const handleRefine = async (mode: 'expand' | 'narrow' | 'clinical') => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setStatus(`Prompt ${mode === 'expand' ? 'zenginleştiriliyor' : 'optimize ediliyor'}...`);
        try {
            const refined = await refinePromptWithAI(prompt, mode);
            setPrompt(refined);
            setStatus("Prompt başarıyla güncellendi.");
        } catch (e) {
            setStatus("İşlem sırasında hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelectFromLibrary = (item: ActivityLibraryItem) => {
        setPrompt(item.basePrompt);
        setActiveTab('editor');
        setStatus(`"${item.title}" şablonu yüklendi.`);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        setStatus("Üretim Başladı...");
        try {
            const result = await generateCreativeStudioActivity(prompt, { difficulty, itemCount });
            onResult(Array.isArray(result) ? result : [result]);
        } catch (e) {
            setStatus("Üretim başarısız oldu. Lütfen tekrar deneyin.");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredLibrary = PEDAGOGICAL_LIBRARY.filter(item => 
        item.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
        item.methodology.toLowerCase().includes(librarySearch.toLowerCase()) ||
        item.category.toLowerCase().includes(librarySearch.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500 font-['Lexend']">
            {/* STUDIO HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <i className="fa-solid fa-wand-sparkles text-indigo-500"></i> AI Creative Studio
                    </h2>
                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-black">Küresel Pedagojik Standartlarda Üretim</p>
                </div>
                <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-2xl">
                    <button onClick={() => setActiveTab('editor')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'editor' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>TASARIMCI</button>
                    <button onClick={() => setActiveTab('library')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'library' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>KÜRESEL KÜTÜPHANE</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
                
                {/* SOL PANEL: EDITOR VEYA KÜTÜPHANE */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-[700px]">
                    {activeTab === 'editor' ? (
                        <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Prompt Mühendisliği Sahası</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRefine('expand')} disabled={isProcessing || !prompt} className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[9px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">Genişlet</button>
                                    <button onClick={() => handleRefine('narrow')} disabled={isProcessing || !prompt} className="px-3 py-1.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg text-[9px] font-black uppercase hover:bg-zinc-700 hover:text-white transition-all">Daralt</button>
                                    <button onClick={() => handleRefine('clinical')} disabled={isProcessing || !prompt} className="px-3 py-1.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-lg text-[9px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all">Klinik Tanı Ekle</button>
                                </div>
                            </div>

                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="flex-1 w-full p-8 bg-black/40 border border-white/5 rounded-[2.5rem] text-sm leading-relaxed text-zinc-300 outline-none focus:border-indigo-500 transition-all font-mono resize-none shadow-inner"
                                placeholder="Buraya bir fikir yazın veya kütüphaneden bir metodoloji seçin..."
                            ></textarea>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {SNIPPETS.map(s => (
                                    <button key={s.label} onClick={() => setPrompt(prev => prev + "\n" + s.value)} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all">
                                        + {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-white">Pedagojik Metodoloji Bankası</h3>
                                <div className="relative w-64">
                                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                                    <input 
                                        type="text" value={librarySearch} onChange={e => setLibrarySearch(e.target.value)}
                                        placeholder="Metot veya kategori ara..."
                                        className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredLibrary.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleSelectFromLibrary(item)}
                                        className="group p-5 bg-white/5 border border-white/5 rounded-[2rem] hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-400 rounded text-[8px] font-black uppercase tracking-widest">{item.methodology}</span>
                                            <i className="fa-solid fa-arrow-up-right-from-square text-zinc-700 group-hover:text-indigo-500 transition-colors"></i>
                                        </div>
                                        <h4 className="font-black text-sm text-zinc-200 mb-2">{item.title}</h4>
                                        <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SAĞ PANEL: KONTROLLER */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[3rem] border border-white/5 p-8 flex flex-col shadow-xl">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">ÜRETİM KRİTERLERİ</h4>
                        
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-zinc-400 flex items-center gap-2"><i className="fa-solid fa-layer-group text-indigo-500"></i> Zorluk Seviyesi</label>
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
                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                                    <span>Öğe Adedi</span>
                                    <span className="text-indigo-400 font-black">{itemCount}</span>
                                </div>
                                <input type="range" min={2} max={30} value={itemCount} onChange={e => setItemCount(Number(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="h-14 flex flex-col items-center justify-center">
                                {isProcessing && (
                                    <div className="flex flex-col items-center gap-2 animate-in fade-in">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center px-4 leading-tight">
                                            {THINKING_MESSAGES[statusIndex]}
                                        </p>
                                    </div>
                                )}
                                {!isProcessing && status && (
                                     <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{status}</p>
                                )}
                            </div>
                            <button 
                                onClick={handleGenerate}
                                disabled={isProcessing || !prompt}
                                className="w-full py-5 bg-white text-indigo-950 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 text-sm disabled:opacity-50"
                            >
                                {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                                TASARIMI BAŞLAT
                            </button>
                            <button onClick={onCancel} className="w-full py-3 text-zinc-600 hover:text-zinc-400 text-xs font-bold transition-colors">Vazgeç</button>
                        </div>
                    </div>

                    {/* Klinik Bilgi Kartı */}
                    <div className="p-6 bg-indigo-900/10 rounded-[2.5rem] border border-indigo-500/20">
                        <h5 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><i className="fa-solid fa-circle-info"></i> Klinik İpucu</h5>
                        <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                            Gemini 3.0 Thinking motoru, sadece görsel üretmez; pedagojik bir strateji kurar. Bu süreç 30-60 saniye sürebilir, ancak sonuç klinik açıdan çok daha değerlidir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
