
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import { ActivityType } from '../types';

// --- CUSTOM CODE EDITOR COMPONENT ---
const SimpleCodeEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const handleScroll = () => {
        if (preRef.current && textareaRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const highlightCode = (code: string) => {
        if (!code) return <br />; 
        let escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // Highlight variables {{...}}
        escaped = escaped.replace(/(\{\{)(.*?)(\}\})/g, '<span class="text-amber-500 font-bold bg-amber-500/10 rounded px-0.5">$1$2$3</span>');
        // Highlight keys "key":
        escaped = escaped.replace(/"(.*?)":/g, '<span class="text-indigo-400">"$1":</span>');
        // Highlight pedagogical instructions (Role, Task etc)
        escaped = escaped.replace(/\[(.*?)\]/g, '<span class="text-emerald-500 font-bold">[$1]</span>');
        escaped = escaped.replace(/(GÖREV:|ROL:|ZORLUK SEVİYESİ:|ÇIKTI FORMATI:)/g, '<span class="text-rose-400 font-bold">$1</span>');
        
        return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
    };

    return (
        <div className="relative w-full h-full font-mono text-sm group bg-[#1e1e1e] text-[#d4d4d4]">
            <pre
                ref={preRef}
                className="absolute inset-0 m-0 p-4 pointer-events-none whitespace-pre-wrap break-words overflow-hidden"
                style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.6' }}
                aria-hidden="true"
            >
                <code className="text-[#d4d4d4]">{highlightCode(value)}</code>
            </pre>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full m-0 p-4 bg-transparent text-transparent caret-white border-none resize-none focus:ring-0 outline-none whitespace-pre-wrap break-words selection:bg-indigo-500/30"
                style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.6' }}
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    );
};

const LineNumbers = ({ text }: { text: string }) => {
    const lineCount = text.split('\n').length;
    return (
        <div className="flex flex-col text-right pr-3 pt-4 text-[#858585] select-none font-mono text-sm leading-[1.6] bg-[#1e1e1e] h-full border-r border-[#333] min-w-[3rem]">
            {Array.from({ length: lineCount }).map((_, i) => (
                <span key={i}>{i + 1}</span>
            ))}
        </div>
    );
};

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    
    // View States
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'config' | 'history'>('editor');
    const [simulationOpen, setSimulationOpen] = useState(false);
    
    // Simulation
    const [testVariables, setTestVariables] = useState<Record<string, string>>({});
    const [simulationResult, setSimulationResult] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        const data = await adminService.getAllPrompts();
        setPrompts(data);
    };

    // --- ACTIVITY SELECTION LOGIC ---
    const handleSelectActivity = async (activityId: string, title: string, categoryId: string) => {
        // 1. Try to find existing prompt in DB/State
        const promptId = `prompt_${activityId.toLowerCase()}`;
        const existing = prompts.find(p => p.id === promptId);

        if (existing) {
            setSelectedPrompt(existing);
        } else {
            // 2. If not exists, generate "Reverse Engineered" prompt from code logic
            const generatedTemplate = adminService.getInitialPromptForActivity(activityId as ActivityType);
            
            const newDraft: PromptTemplate = {
                id: promptId,
                name: `${title} Promptu`,
                description: `${title} etkinliği için üretim şablonu.`,
                category: categoryId,
                systemInstruction: 'Sen uzman bir özel eğitim pedagogusun.',
                template: generatedTemplate,
                variables: ['difficulty', 'topic', 'worksheetCount'],
                tags: [categoryId, activityId],
                updatedAt: new Date().toISOString(),
                version: 1,
                history: []
            };
            setSelectedPrompt(newDraft);
        }
        // Reset simulation results
        setSimulationResult('');
        setTestVariables({});
    };

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    // Derived Variables from Template
    const detectedVariables = useMemo(() => {
        if (!selectedPrompt) return [];
        const regex = /\{\{(.*?)\}\}/g;
        const matches = Array.from(selectedPrompt.template.matchAll(regex)).map(m => m[1]);
        return [...new Set(matches)];
    }, [selectedPrompt?.template]);

    // Sync Test Variables
    useEffect(() => {
        if (detectedVariables.length > 0) {
            setTestVariables(prev => {
                const newState = { ...prev };
                detectedVariables.forEach(v => {
                    // Default values for common variables
                    if (!newState[v]) {
                        if (v === 'difficulty') newState[v] = 'Orta';
                        else if (v === 'worksheetCount') newState[v] = '1';
                        else if (v === 'itemCount') newState[v] = '5';
                        else if (v === 'topic') newState[v] = 'Genel';
                        else newState[v] = `[${v}]`; 
                    }
                });
                return newState;
            });
        }
    }, [detectedVariables]);

    const handleSave = async () => {
        if (!selectedPrompt) return;
        const note = prompt("Değişiklik notu girin (örn: Zorluk seviyesi ayarlandı):", "Update");
        if (note === null) return;

        setIsSaving(true);
        const updated = { ...selectedPrompt, variables: detectedVariables };
        const saved = await adminService.savePrompt(updated, note);
        
        // Update local list
        setPrompts(prev => {
            const exists = prev.find(p => p.id === saved.id);
            if (exists) return prev.map(p => p.id === saved.id ? saved : p);
            return [...prev, saved];
        });
        
        setSelectedPrompt(saved);
        setIsSaving(false);
    };

    const handleSimulate = async () => {
        if (!selectedPrompt) return;
        setIsSimulating(true);
        setSimulationResult('AI Yanıtı Bekleniyor...\n(Bu işlem biraz zaman alabilir)');
        try {
            const result = await adminService.testPrompt(selectedPrompt, testVariables);
            setSimulationResult(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setSimulationResult(`Hata: ${e.message}\n\nDetay: Lütfen prompt formatının geçerli bir JSON şemasına uygun olduğundan emin olun.`);
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-[#1e1e1e] text-zinc-300 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 font-sans">
            
            {/* 1. SIDEBAR (Explorer) */}
            <div className="w-72 bg-[#252526] border-r border-[#333] flex flex-col shrink-0">
                <div className="h-10 flex items-center px-4 bg-[#333] text-xs font-bold text-zinc-300 uppercase tracking-wider justify-between shrink-0">
                    <span>Etkinlik Gezgini</span>
                    <span className="text-[10px] bg-zinc-700 px-1.5 rounded">{ACTIVITIES.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {ACTIVITY_CATEGORIES.map((cat) => {
                        const isOpen = openCategories[cat.id];
                        const catActivities = ACTIVITIES.filter(a => cat.activities.includes(a.id));
                        if (catActivities.length === 0) return null;

                        return (
                            <div key={cat.id}>
                                <button 
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`w-full flex items-center gap-2 px-2 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${isOpen ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2d2e]'}`}
                                >
                                    <i className={`fa-solid fa-chevron-right text-[9px] transition-transform w-3 ${isOpen ? 'rotate-90' : ''}`}></i>
                                    <i className={`${cat.icon} text-[10px] w-4 text-center opacity-70`}></i>
                                    <span className="truncate">{cat.title}</span>
                                </button>
                                
                                {isOpen && (
                                    <div className="ml-4 pl-2 border-l border-[#444] mt-1 space-y-0.5 animate-in slide-in-from-left-2 duration-150">
                                        {catActivities.map(act => {
                                            const isActive = selectedPrompt?.id === `prompt_${act.id.toLowerCase()}`;
                                            return (
                                                <button
                                                    key={act.id}
                                                    onClick={() => handleSelectActivity(act.id, act.title, cat.id)}
                                                    className={`w-full text-left px-2 py-1.5 text-xs truncate rounded flex items-center gap-2 ${isActive ? 'bg-[#37373d] text-white border-l-2 border-indigo-500' : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#2a2d2e]'}`}
                                                    title={act.title}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-transparent border border-zinc-600'}`}></div>
                                                    {act.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. MAIN EDITOR */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                {selectedPrompt ? (
                    <>
                        {/* Tab Bar */}
                        <div className="h-10 bg-[#2d2d2d] flex items-center px-2 gap-1 overflow-x-auto border-b border-[#333]">
                            <div className="flex items-center gap-2 px-3 mr-4 text-xs font-bold text-zinc-400 border-r border-[#444] h-full">
                                <i className="fa-solid fa-file-code"></i>
                                {selectedPrompt.name}
                            </div>
                            
                            {['editor', 'config', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 h-full text-xs flex items-center gap-2 border-r border-[#333] transition-colors ${activeTab === tab ? 'bg-[#1e1e1e] text-white border-t-2 border-t-indigo-500' : 'text-zinc-500 hover:bg-[#333] hover:text-zinc-300'}`}
                                >
                                    <i className={`fa-solid ${tab === 'editor' ? 'fa-code' : tab === 'config' ? 'fa-sliders' : 'fa-clock-rotate-left'}`}></i>
                                    {tab === 'editor' ? 'Kod' : tab === 'config' ? 'Ayarlar' : 'Geçmiş'}
                                </button>
                            ))}
                            <div className="flex-1"></div>
                            <button 
                                onClick={() => setSimulationOpen(!simulationOpen)}
                                className={`px-3 py-1 mr-2 text-xs font-bold rounded transition-colors ${simulationOpen ? 'bg-indigo-600 text-white' : 'bg-[#333] text-zinc-300 hover:bg-[#444]'}`}
                            >
                                <i className="fa-solid fa-flask mr-1"></i> 
                                {simulationOpen ? 'Testi Gizle' : 'Test Et'}
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1 disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} 
                                Kaydet
                            </button>
                        </div>

                        {/* Editor Canvas */}
                        <div className="flex-1 relative overflow-hidden">
                            {activeTab === 'editor' && (
                                <div className="flex h-full">
                                    <LineNumbers text={selectedPrompt.template} />
                                    <SimpleCodeEditor 
                                        value={selectedPrompt.template} 
                                        onChange={(val) => setSelectedPrompt({...selectedPrompt, template: val})} 
                                        placeholder="// Prompt şablonunu buraya yaz..."
                                    />
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="p-8 space-y-6 max-w-3xl overflow-y-auto h-full text-sm">
                                    <div>
                                        <label className="block text-zinc-500 mb-1 font-bold">Prompt İsmi</label>
                                        <input type="text" value={selectedPrompt.name} onChange={e => setSelectedPrompt({...selectedPrompt, name: e.target.value})} className="w-full bg-[#252526] border border-[#333] p-2 rounded text-white focus:border-indigo-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-indigo-400 mb-1 font-bold">Sistem Rolü (System Instruction)</label>
                                        <p className="text-xs text-zinc-500 mb-2">AI'ın kimliğidir (Örn: Sen bir pedagogsun).</p>
                                        <textarea 
                                            value={selectedPrompt.systemInstruction} 
                                            onChange={e => setSelectedPrompt({...selectedPrompt, systemInstruction: e.target.value})} 
                                            className="w-full bg-[#252526] border border-[#333] p-4 rounded text-zinc-300 focus:border-indigo-500 outline-none h-40 font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-zinc-500 mb-1 font-bold">Kategori</label>
                                            <input type="text" readOnly value={selectedPrompt.category} className="w-full bg-[#252526] border border-[#333] p-2 rounded text-zinc-400 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="p-0 overflow-y-auto h-full">
                                    <table className="w-full text-left text-xs text-zinc-400">
                                        <thead className="bg-[#252526] text-zinc-200 border-b border-[#333]">
                                            <tr>
                                                <th className="p-3">Ver</th>
                                                <th className="p-3">Tarih</th>
                                                <th className="p-3">Not</th>
                                                <th className="p-3 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...(selectedPrompt.history || [])].reverse().map((h, i) => (
                                                <tr key={i} className="border-b border-[#333] hover:bg-[#2a2d2e]">
                                                    <td className="p-3 font-mono text-white">v{h.version}</td>
                                                    <td className="p-3">{new Date(h.updatedAt).toLocaleString()}</td>
                                                    <td className="p-3 italic">{h.changeLog}</td>
                                                    <td className="p-3 text-right">
                                                        <button 
                                                            onClick={() => {
                                                                if(confirm('Bu versiyona geri dönmek istiyor musunuz? Mevcut taslak kaybolacak.')) {
                                                                    setSelectedPrompt({...selectedPrompt, template: h.template, systemInstruction: h.systemInstruction || selectedPrompt.systemInstruction});
                                                                    setActiveTab('editor');
                                                                }
                                                            }}
                                                            className="text-indigo-400 hover:text-white"
                                                        >
                                                            Geri Yükle
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!selectedPrompt.history || selectedPrompt.history.length === 0) && (
                                                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Henüz geçmiş kaydı yok.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 bg-[#1e1e1e]">
                        <div className="w-20 h-20 bg-[#252526] rounded-full flex items-center justify-center mb-6 border border-[#333]">
                            <i className="fa-solid fa-wand-magic-sparkles text-3xl opacity-50"></i>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-400 mb-2">Prompt Stüdyosu</h3>
                        <p className="max-w-md text-center text-sm opacity-60">Sol menüden bir aktivite seçerek mevcut yapay zeka yönergelerini (prompt) görüntüleyebilir ve düzenleyebilirsiniz.</p>
                    </div>
                )}
            </div>

            {/* 3. SIMULATION PANE */}
            <div className={`border-l border-[#333] bg-[#252526] flex flex-col transition-all duration-300 ${simulationOpen ? 'w-96' : 'w-0'}`}>
                <div className="h-10 flex items-center px-4 bg-[#333] text-xs font-bold text-zinc-300 uppercase tracking-wider justify-between shrink-0">
                    <span>Canlı Simülasyon</span>
                    <button onClick={() => setSimulationOpen(false)}><i className="fa-solid fa-times"></i></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h5 className="text-[10px] text-zinc-500 font-bold uppercase mb-2 flex justify-between">
                            <span>Değişkenler</span>
                            <span className="text-indigo-400">{detectedVariables.length}</span>
                        </h5>
                        {detectedVariables.length === 0 ? (
                            <p className="text-xs text-zinc-600 italic border border-[#333] p-2 rounded">Prompt içinde değişken bulunamadı. (Örn: {'{{topic}}'})</p>
                        ) : (
                            <div className="space-y-3">
                                {detectedVariables.map(v => (
                                    <div key={v}>
                                        <label className="text-xs text-indigo-400 font-bold block mb-1">{v}</label>
                                        <input 
                                            type="text" 
                                            value={testVariables[v] || ''} 
                                            onChange={e => setTestVariables({...testVariables, [v]: e.target.value})}
                                            className="w-full bg-[#1e1e1e] border border-[#444] rounded p-2 text-xs text-white focus:border-indigo-500 outline-none transition-colors"
                                            placeholder={`Değer girin...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSimulate} 
                        disabled={isSimulating}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>} 
                        {isSimulating ? 'Üretiliyor...' : 'Simülasyonu Başlat'}
                    </button>

                    <div className="flex-1 flex flex-col min-h-[300px]">
                        <h5 className="text-[10px] text-zinc-500 font-bold uppercase mb-2">AI Yanıtı (JSON)</h5>
                        <div className="flex-1 bg-[#1e1e1e] rounded border border-[#444] p-0 relative overflow-hidden flex flex-col">
                             <textarea 
                                readOnly
                                value={simulationResult}
                                className="w-full h-full bg-transparent text-xs font-mono text-green-400 resize-none outline-none p-3 custom-scrollbar"
                                placeholder="Sonuç burada görünecek..."
                             />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
