
import React, { useState, useEffect, useRef } from 'react';
import { refinePromptWithAI, generateCreativeStudioActivity, analyzeReferenceFiles } from '../services/generators/creativeStudio';
import { PEDAGOGICAL_LIBRARY, ActivityLibraryItem } from '../services/generators/promptLibrary';
import { MultimodalFile } from '../services/geminiClient';

interface CreativeStudioProps {
    onResult: (data: any) => void;
    onCancel: () => void;
}

interface CustomAction {
    id: string;
    label: string;
    value: string;
    type: 'refine' | 'snippet';
}

const INITIAL_SNIPPETS: CustomAction[] = [
    { id: 's1', label: "5N1K Entegre Et", value: "İçeriğe metne dayalı 5N1K soruları ekle.", type: 'snippet' },
    { id: 's2', label: "TDK Heceleme", value: "Tüm kelimeleri TDK heceleme kurallarına göre analiz et.", type: 'snippet' },
    { id: 's3', label: "Vektörel Şekiller", value: "Soruları çözmek için gerekli olan ipuçlarını SVG şekilleri olarak kodla.", type: 'snippet' },
    { id: 's4', label: "Dual Column", value: "Eşleştirme yapısı için ikili sütun düzeni kullan.", type: 'snippet' },
    { id: 's5', label: "Klinik Çeldirici", value: "Yanlış şıkları ayna harfler (b-d, p-q) üzerinden kurgula.", type: 'snippet' }
];

const THINKING_MESSAGES = [
    "Gemini 3.0 Pro Motoru Hazırlanıyor...",
    "Dosya mimarisi analiz ediliyor...",
    "Pedagojik metodoloji sentezleniyor...",
    "Nöro-mimari düzen tasarlanıyor...",
    "Klinik çeldiriciler kurgulanıyor...",
    "Görsel hiyerarşi optimize ediliyor...",
    "Hemen hemen hazır, son kontroller yapılıyor..."
];

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onResult, onCancel }) => {
    const [prompt, setPrompt] = useState("");
    const [difficulty, setDifficulty] = useState("Orta");
    const [itemCount, setItemCount] = useState(8);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
    const [status, setStatus] = useState("");
    const [statusIndex, setStatusIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
    const [librarySearch, setLibrarySearch] = useState("");
    
    // Dynamic Storage States
    const [localLibrary, setLocalLibrary] = useState<ActivityLibraryItem[]>([]);
    const [snippets, setSnippets] = useState<CustomAction[]>([]);
    const [showAddModal, setShowAddModal] = useState<'methodology' | 'snippet' | null>(null);
    const [newMethodology, setNewMethodology] = useState<Partial<ActivityLibraryItem>>({ methodology: 'Orton-Gillingham', category: 'Phonological' });
    const [newSnippet, setNewSnippet] = useState<Partial<CustomAction>>({ type: 'snippet' });

    // Tooltip State
    const [hoveredItem, setHoveredItem] = useState<ActivityLibraryItem | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [attachedFiles, setAttachedFiles] = useState<MultimodalFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        const savedLib = localStorage.getItem('custom_pedagogical_lib');
        const customItems = savedLib ? JSON.parse(savedLib) : [];
        setLocalLibrary([...PEDAGOGICAL_LIBRARY, ...customItems]);

        const savedSnippets = localStorage.getItem('custom_ai_snippets');
        setSnippets(savedSnippets ? JSON.parse(savedSnippets) : INITIAL_SNIPPETS);
    }, []);

    useEffect(() => {
        let interval: any;
        if (isProcessing || isAnalyzingFile) {
            interval = setInterval(() => {
                setStatusIndex(prev => (prev + 1) % THINKING_MESSAGES.length);
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isProcessing, isAnalyzingFile]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsAnalyzingFile(true);
        setStatus("Dosyalar okunuyor...");
        try {
            const reader = (file: File): Promise<MultimodalFile> => new Promise((res, rej) => {
                const r = new FileReader();
                r.onload = () => res({ data: r.result as string, mimeType: file.type });
                r.onerror = rej;
                r.readAsDataURL(file);
            });
            const newFiles = await Promise.all(Array.from(files).map(reader));
            const combined = [...attachedFiles, ...newFiles];
            setAttachedFiles(combined);
            if (fileInputRef.current) fileInputRef.current.value = "";
            await triggerFileAnalysis(combined);
        } catch (err) {
            setStatus("Hata oluştu.");
        } finally {
            setIsAnalyzingFile(false);
        }
    };

    const triggerFileAnalysis = async (files: MultimodalFile[]) => {
        if (files.length === 0) return;
        setIsAnalyzingFile(true);
        try {
            const analysisResult = await analyzeReferenceFiles(files, prompt);
            setPrompt(prev => prev.trim() ? `${prev}\n\n---\n\n${analysisResult}` : analysisResult);
            setStatus("Analiz tamamlandı.");
        } catch (e) {
            setStatus("Analiz başarısız.");
        } finally {
            setIsAnalyzingFile(false);
        }
    };

    // Fix: Updated handleRefine to remove 'narrow' and match refinePromptWithAI service signature
    const handleRefine = async (mode: 'expand' | 'clinical') => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        try {
            const refined = await refinePromptWithAI(prompt, mode);
            setPrompt(refined);
            setStatus("Prompt güncellendi.");
        } catch (e) {
            setStatus("Hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddMethodology = () => {
        if (!newMethodology.title || !newMethodology.basePrompt) return alert("Başlık ve Prompt zorunludur.");
        const item: ActivityLibraryItem = {
            id: `custom-${Date.now()}`,
            title: newMethodology.title!,
            methodology: newMethodology.methodology as any,
            category: newMethodology.category as any,
            description: newMethodology.description || 'Kullanıcı tanımlı metot.',
            basePrompt: newMethodology.basePrompt!
        };
        const updated = [...localLibrary, item];
        setLocalLibrary(updated);
        const savedLib = localStorage.getItem('custom_pedagogical_lib');
        const currentCustoms = savedLib ? JSON.parse(savedLib) : [];
        localStorage.setItem('custom_pedagogical_lib', JSON.stringify([...currentCustoms, item]));
        setShowAddModal(null);
    };

    const handleAddSnippet = () => {
        if (!newSnippet.label || !newSnippet.value) return alert("Etiket ve Değer zorunludur.");
        const item: CustomAction = {
            id: `snip-${Date.now()}`,
            label: newSnippet.label!,
            value: newSnippet.value!,
            type: 'snippet'
        };
        const updated = [...snippets, item];
        setSnippets(updated);
        localStorage.setItem('custom_ai_snippets', JSON.stringify(updated));
        setShowAddModal(null);
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && attachedFiles.length === 0) return;
        setIsProcessing(true);
        try {
            const result = await generateCreativeStudioActivity(prompt, { difficulty, itemCount }, attachedFiles);
            onResult(Array.isArray(result) ? result : [result]);
        } catch (e) {
            setStatus("Üretim başarısız.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500 font-['Lexend'] relative">
            
            {/* SMART POPUP TOOLTIP */}
            {hoveredItem && (
                <div 
                    className="fixed z-[110] w-80 bg-zinc-900 border border-indigo-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 rounded-3xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl"
                    style={{ left: Math.min(window.innerWidth - 340, mousePos.x + 20), top: mousePos.y - 120 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Klinik Analiz</span>
                    </div>
                    <h5 className="text-white font-bold text-sm mb-2">{hoveredItem.title}</h5>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-4">{hoveredItem.description}</p>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1 italic">Yapay Zeka Mimarisi:</p>
                        <p className="text-[10px] text-zinc-300 line-clamp-3 leading-tight opacity-70">"{hoveredItem.basePrompt}"</p>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                        <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> AI Creative Studio
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Klinik Tasarım ve Mimari Klonlama</p>
                </div>
                <div className="flex bg-zinc-900 border border-white/10 p-1.5 rounded-2xl shadow-inner">
                    <button onClick={() => setActiveTab('editor')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'editor' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>TASARIMCI</button>
                    <button onClick={() => setActiveTab('library')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'library' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}>METODOLOJİ BANKASI</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
                
                {/* LEFT PANEL */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-[750px]">
                    {activeTab === 'editor' ? (
                        <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Komut ve Analiz Sahası</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleRefine('expand')} disabled={isProcessing || isAnalyzingFile || !prompt} className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all">Genişlet</button>
                                    <button onClick={() => handleRefine('clinical')} disabled={isProcessing || isAnalyzingFile || !prompt} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all">Klinik Tanı Ekle</button>
                                </div>
                            </div>

                            <textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className={`flex-1 w-full p-8 bg-black/40 border border-white/5 rounded-[2.5rem] text-lg leading-relaxed text-zinc-200 outline-none focus:border-indigo-500 transition-all font-mono resize-none shadow-inner ${isAnalyzingFile ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                                placeholder="Fikrinizi yazın veya dosya yükleyerek AI'nın teknik taslak çıkarmasını bekleyin..."
                            ></textarea>

                            {/* DYNAMIC SNIPPETS AREA */}
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Hızlı Ek İşlevler</h4>
                                    <button onClick={() => setShowAddModal('snippet')} className="text-[10px] font-bold text-indigo-500 hover:underline">+ Yeni İşlev Ekle</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500 transition-all flex items-center gap-2">
                                        <i className="fa-solid fa-paperclip"></i> DOSYA EKLE
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" multiple />
                                    
                                    {snippets.map(s => (
                                        <button key={s.id} onClick={() => setPrompt(prev => prev + "\n" + s.value)} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[11px] font-black uppercase transition-all">
                                            + {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col h-full">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                <div className="relative w-full md:w-96">
                                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                                    <input 
                                        type="text" value={librarySearch} onChange={e => setLibrarySearch(e.target.value)}
                                        placeholder="Kuram veya metot ara..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <button 
                                    onClick={() => setShowAddModal('methodology')}
                                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all"
                                >
                                    <i className="fa-solid fa-plus-circle"></i> KENDİ METODUNU EKLE
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                                {localLibrary.filter(item => item.title.toLowerCase().includes(librarySearch.toLowerCase())).map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => { setPrompt(item.basePrompt); setActiveTab('editor'); }}
                                        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                                        onMouseEnter={() => setHoveredItem(item)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className="group p-6 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">{item.methodology}</span>
                                                <i className="fa-solid fa-arrow-right text-zinc-700 group-hover:text-indigo-500 transition-colors"></i>
                                            </div>
                                            <h4 className="font-black text-xl text-zinc-100 mb-2 leading-tight">{item.title}</h4>
                                            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/5 rounded-[3rem] border border-white/5 p-8 flex flex-col shadow-xl">
                        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em] mb-8">ÜRETİM PARAMETRELERİ</h4>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-zinc-400 flex items-center gap-2"><i className="fa-solid fa-layer-group text-indigo-500"></i> Zorluk Seviyesi</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(l => (
                                        <button key={l} onClick={() => setDifficulty(l)} className={`py-3 rounded-xl text-xs font-black border transition-all ${difficulty === l ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white/30'}`}>{l}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                                    <span>Öğe Adedi</span>
                                    <span className="text-indigo-400 font-black text-lg">{itemCount}</span>
                                </div>
                                <input type="range" min={2} max={30} value={itemCount} onChange={e => setItemCount(Number(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="h-16 flex flex-col items-center justify-center">
                                {(isProcessing || isAnalyzingFile) && (
                                    <div className="flex flex-col items-center gap-2 animate-in fade-in">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                        </div>
                                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] text-center px-4 leading-tight">
                                            {isAnalyzingFile ? "REFERANS ANALİZ EDİLİYOR..." : THINKING_MESSAGES[statusIndex]}
                                        </p>
                                    </div>
                                )}
                                {!isProcessing && !isAnalyzingFile && status && <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{status}</p>}
                            </div>
                            <button onClick={handleGenerate} disabled={isProcessing || isAnalyzingFile || (!prompt && attachedFiles.length === 0)} className="w-full py-6 bg-white text-indigo-950 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 text-base disabled:opacity-50">
                                {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-rocket"></i>}
                                TASARIMI BAŞLAT
                            </button>
                            <button onClick={onCancel} className="w-full py-3 text-zinc-600 hover:text-zinc-400 text-sm font-bold transition-colors">Vazgeç</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD MODAL (Methodology or Snippet) */}
            {showAddModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <h3 className="text-2xl font-black text-white tracking-tight">{showAddModal === 'methodology' ? 'Yeni Metodoloji Tanımla' : 'Hızlı İşlev (Snippet) Ekle'}</h3>
                            <button onClick={() => setShowAddModal(null)} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-times text-xl"></i></button>
                        </div>
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar max-h-[70vh]">
                            {showAddModal === 'methodology' ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Başlık</label>
                                            <input type="text" value={newMethodology.title || ''} onChange={e => setNewMethodology({...newMethodology, title: e.target.value})} className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 transition-all" placeholder="Örn: Multisensoriyel Hece Lab" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Kuramsal Temel</label>
                                            <select value={newMethodology.methodology} onChange={e => setNewMethodology({...newMethodology, methodology: e.target.value as any})} className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 appearance-none transition-all">
                                                <option value="Orton-Gillingham">Orton-Gillingham</option>
                                                <option value="Feuerstein">Feuerstein</option>
                                                <option value="Lindamood-Bell">Lindamood-Bell</option>
                                                <option value="Wilson">Wilson Reading</option>
                                                <option value="Sensory-Integration">Duyu Bütünleme</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Pedagojik Açıklama (Pop-up)</label>
                                        <textarea value={newMethodology.description || ''} onChange={e => setNewMethodology({...newMethodology, description: e.target.value})} className="w-full h-24 p-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 resize-none" placeholder="Bu metodun amacını kısaca açıklayın..." />
                                    </div>
                                    <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/20">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block flex items-center gap-2"><i className="fa-solid fa-microchip"></i> AI MOTOR BLUEPRINT</label>
                                        <textarea value={newMethodology.basePrompt || ''} onChange={e => setNewMethodology({...newMethodology, basePrompt: e.target.value})} className="w-full h-32 p-4 bg-black/60 border border-white/10 rounded-2xl text-zinc-200 font-mono text-xs outline-none focus:border-indigo-500" placeholder="AI'nın nasıl bir içerik üretmesi gerektiğini teknik olarak anlatın..." />
                                    </div>
                                    <button onClick={handleAddMethodology} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all">KÜTÜPHANEYE KAYDET</button>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Buton Etiketi</label>
                                            <input type="text" value={newSnippet.label || ''} onChange={e => setNewSnippet({...newSnippet, label: e.target.value})} className="w-full p-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" placeholder="Örn: Emojili Metin" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">AI Talimatı (Prompt Parçası)</label>
                                            <textarea value={newSnippet.value || ''} onChange={e => setNewSnippet({...newSnippet, value: e.target.value})} className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500 resize-none" placeholder="Butona basıldığında mevcut promta eklenecek olan AI talimatı..." />
                                        </div>
                                    </div>
                                    <button onClick={handleAddSnippet} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl transition-all">İŞLEVİ EKLE</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
