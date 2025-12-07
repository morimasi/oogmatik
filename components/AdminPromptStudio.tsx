
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PromptTemplate, PromptVersion } from '../types/admin';
import { adminService } from '../services/adminService';

// --- CUSTOM CODE EDITOR COMPONENT (ZERO DEPENDENCY) ---
// This component simulates a code editor by layering a transparent textarea over a syntax-highlighted pre/code block.

const SimpleCodeEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const handleScroll = () => {
        if (preRef.current && textareaRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    // Syntax Highlighting Logic for Prompt Template
    const highlightCode = (code: string) => {
        if (!code) return <br />; // Render empty line
        
        // Escape HTML
        let escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Highlight Variables {{...}}
        escaped = escaped.replace(/(\{\{)(.*?)(\}\})/g, '<span class="text-amber-500 font-bold">$1$2$3</span>');

        // Highlight Keys in JSON-like structure (simple heuristic)
        escaped = escaped.replace(/"(.*?)":/g, '<span class="text-indigo-400">"$1":</span>');

        // Highlight Comments or Instructions [ROL:...]
        escaped = escaped.replace(/(\[.*?\])/g, '<span class="text-emerald-500 font-bold">$1</span>');

        return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
    };

    return (
        <div className="relative w-full h-full font-mono text-sm group">
            {/* Background Highlighter */}
            <pre
                ref={preRef}
                className="absolute inset-0 m-0 p-4 pointer-events-none whitespace-pre-wrap break-words text-transparent bg-transparent overflow-hidden"
                style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.5' }}
                aria-hidden="true"
            >
                <code className="text-zinc-800 dark:text-zinc-300">{highlightCode(value)}</code>
            </pre>

            {/* Foreground Input */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                className="absolute inset-0 w-full h-full m-0 p-4 bg-transparent text-transparent caret-black dark:caret-white border-none resize-none focus:ring-0 outline-none whitespace-pre-wrap break-words"
                style={{ fontFamily: '"Fira Code", monospace', lineHeight: '1.5' }}
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    );
};

// --- LINE NUMBERS COMPONENT ---
const LineNumbers = ({ text }: { text: string }) => {
    const lineCount = text.split('\n').length;
    return (
        <div className="flex flex-col text-right pr-3 pt-4 text-zinc-400 select-none font-mono text-sm leading-[1.5] bg-zinc-100 dark:bg-zinc-800/50 h-full border-r border-zinc-200 dark:border-zinc-700 min-w-[3rem]">
            {Array.from({ length: lineCount }).map((_, i) => (
                <span key={i}>{i + 1}</span>
            ))}
        </div>
    );
};

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // IDE State
    const [activeTab, setActiveTab] = useState<'editor' | 'config' | 'history'>('editor');
    const [simulationOpen, setSimulationOpen] = useState(false); // Split view toggle
    
    // Simulation State
    const [testVariables, setTestVariables] = useState<Record<string, string>>({});
    const [simulationResult, setSimulationResult] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simTab, setSimTab] = useState<'input' | 'output'>('input');
    
    // Auto-extract variables from template
    const detectedVariables = useMemo(() => {
        if (!selectedPrompt) return [];
        const regex = /\{\{(.*?)\}\}/g;
        const matches = Array.from(selectedPrompt.template.matchAll(regex)).map(m => m[1]);
        return [...new Set(matches)]; // Unique variables
    }, [selectedPrompt?.template]);

    // Update test variables when detected variables change
    useEffect(() => {
        if (detectedVariables.length > 0) {
            setTestVariables(prev => {
                const newState = { ...prev };
                detectedVariables.forEach(v => {
                    if (!newState[v]) newState[v] = `[${v}]`; // Default value
                });
                return newState;
            });
        }
    }, [detectedVariables]);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        const data = await adminService.getAllPrompts();
        setPrompts(data);
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;
        
        // Sync detected variables to prompt definition
        const updatedPrompt = {
            ...selectedPrompt,
            variables: detectedVariables
        };

        const note = prompt("Versiyon notu (Opsiyonel):", "Güncelleme");
        if (note === null) return; 

        setIsSaving(true);
        const saved = await adminService.savePrompt(updatedPrompt, note || "Update");
        setPrompts(prev => prev.map(p => p.id === saved.id ? saved : p));
        setSelectedPrompt(saved);
        setIsSaving(false);
    };

    const handleRunSimulation = async () => {
        if (!selectedPrompt) return;
        setIsSimulating(true);
        setSimTab('output');
        setSimulationResult('İşleniyor...');
        
        try {
            const result = await adminService.testPrompt(selectedPrompt, testVariables);
            setSimulationResult(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setSimulationResult(`Hata: ${e.message}`);
        } finally {
            setIsSimulating(false);
        }
    };

    const addNewPrompt = () => {
        const newPrompt: PromptTemplate = {
            id: `prompt_${Date.now()}`,
            name: 'Yeni Prompt Şablonu',
            description: '',
            systemInstruction: 'Sen deneyimli bir özel eğitim uzmanısın.',
            template: 'GÖREV: {{topic}} konusunda {{difficulty}} seviyesinde bir etkinlik hazırla.\n\nÇIKTI FORMATI (JSON):\n{\n  "title": "...",\n  "content": "..."\n}',
            variables: ['topic', 'difficulty'],
            tags: [],
            updatedAt: new Date().toISOString(),
            version: 1,
            history: []
        };
        setPrompts([...prompts, newPrompt]);
        setSelectedPrompt(newPrompt);
        setActiveTab('editor');
    };

    const restoreVersion = (version: PromptVersion) => {
        if (!selectedPrompt) return;
        if(confirm(`Versiyon ${version.version}'e dönmek istediğinize emin misiniz?`)) {
            setSelectedPrompt({
                ...selectedPrompt,
                template: version.template,
                systemInstruction: version.systemInstruction || selectedPrompt.systemInstruction
            });
            setActiveTab('editor');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-zinc-50 dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl">
            
            {/* Top Bar: Navigation & Actions */}
            <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <i className="fa-solid fa-terminal"></i>
                        <span className="font-bold text-sm">AI Prompt Studio</span>
                    </div>
                    
                    {/* Prompt Selector */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                            {selectedPrompt ? selectedPrompt.name : 'Şablon Seçin'}
                            <i className="fa-solid fa-chevron-down text-xs"></i>
                        </button>
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden hidden group-hover:block z-50">
                            <div className="max-h-60 overflow-y-auto p-1">
                                {prompts.map(p => (
                                    <button 
                                        key={p.id} 
                                        onClick={() => setSelectedPrompt(p)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${selectedPrompt?.id === p.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                                <div className="border-t border-zinc-100 dark:border-zinc-700 my-1"></div>
                                <button onClick={addNewPrompt} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                    <i className="fa-solid fa-plus mr-2"></i> Yeni Oluştur
                                </button>
                            </div>
                        </div>
                    </div>

                    {selectedPrompt && (
                        <div className="flex items-center gap-2 ml-4">
                             <span className="text-[10px] px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-500 rounded font-mono">v{selectedPrompt.version}</span>
                             <span className="text-[10px] text-zinc-400">Son: {new Date(selectedPrompt.updatedAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setSimulationOpen(!simulationOpen)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${simulationOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                    >
                        <i className="fa-solid fa-flask"></i> Simülasyon
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || !selectedPrompt}
                        className="px-4 py-1.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                        Kaydet
                    </button>
                </div>
            </div>

            {/* Main IDE Workspace */}
            {selectedPrompt ? (
                <div className="flex-1 flex overflow-hidden relative">
                    
                    {/* LEFT: Code Editor Area */}
                    <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${simulationOpen ? 'w-1/2 border-r border-zinc-200 dark:border-zinc-800' : 'w-full'}`}>
                        
                        {/* Editor Tabs */}
                        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-2 pt-2 gap-1">
                            <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x ${activeTab === 'editor' ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-600 border-b-white dark:border-b-zinc-900' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-700'}`}>
                                <i className="fa-solid fa-code mr-2"></i> Şablon
                            </button>
                            <button onClick={() => setActiveTab('config')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x ${activeTab === 'config' ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-600 border-b-white dark:border-b-zinc-900' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-700'}`}>
                                <i className="fa-solid fa-sliders mr-2"></i> Ayarlar & Rol
                            </button>
                            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-t border-x ${activeTab === 'history' ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-indigo-600 border-b-white dark:border-b-zinc-900' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-700'}`}>
                                <i className="fa-solid fa-clock-rotate-left mr-2"></i> Geçmiş
                            </button>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 bg-white dark:bg-zinc-900 relative overflow-hidden">
                            
                            {activeTab === 'editor' && (
                                <div className="flex h-full">
                                    <LineNumbers text={selectedPrompt.template} />
                                    <div className="flex-1 relative h-full">
                                        <SimpleCodeEditor 
                                            value={selectedPrompt.template} 
                                            onChange={(val) => setSelectedPrompt({...selectedPrompt, template: val})} 
                                            placeholder="// Prompt şablonunuzu buraya yazın..."
                                        />
                                        {/* Floating Token Counter */}
                                        <div className="absolute bottom-2 right-4 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-[10px] text-zinc-500 font-mono shadow-sm border border-zinc-200 dark:border-zinc-700">
                                            Chars: {selectedPrompt.template.length} | Est. Tokens: ~{Math.ceil(selectedPrompt.template.length / 4)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="p-8 space-y-6 overflow-y-auto h-full max-w-3xl">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Prompt İsmi</label>
                                        <input type="text" value={selectedPrompt.name} onChange={e => setSelectedPrompt({...selectedPrompt, name: e.target.value})} className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-600 uppercase mb-2">Sistem Rolü (System Instruction)</label>
                                        <p className="text-[10px] text-zinc-400 mb-2">AI'ın kimliği ve uyması gereken katı kurallar.</p>
                                        <textarea 
                                            value={selectedPrompt.systemInstruction} 
                                            onChange={e => setSelectedPrompt({...selectedPrompt, systemInstruction: e.target.value})} 
                                            className="w-full p-4 border rounded-xl bg-indigo-50/50 dark:bg-zinc-800/50 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] font-mono text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Etiketler</label>
                                        <div className="flex gap-2">
                                            {selectedPrompt.tags.map((tag, i) => (
                                                <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full text-xs">{tag}</span>
                                            ))}
                                            <button className="text-indigo-600 text-xs font-bold hover:underline">+ Ekle</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="p-0 h-full overflow-y-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500">
                                            <tr>
                                                <th className="p-3">Versiyon</th>
                                                <th className="p-3">Tarih</th>
                                                <th className="p-3">Not</th>
                                                <th className="p-3 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {[...selectedPrompt.history || []].reverse().map((h, i) => (
                                                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                                    <td className="p-3 font-mono font-bold">v{h.version}</td>
                                                    <td className="p-3 text-zinc-500">{new Date(h.updatedAt).toLocaleString()}</td>
                                                    <td className="p-3 italic text-zinc-600 dark:text-zinc-400">{h.changeLog}</td>
                                                    <td className="p-3 text-right">
                                                        <button onClick={() => restoreVersion(h)} className="text-indigo-600 hover:underline font-bold">Geri Yükle</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {(!selectedPrompt.history || selectedPrompt.history.length === 0) && (
                                        <div className="p-8 text-center text-zinc-400">Geçmiş kaydı bulunamadı.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Simulation Pane (Collapsible) */}
                    <div 
                        className={`bg-zinc-50 dark:bg-black border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 overflow-hidden ${simulationOpen ? 'w-[450px]' : 'w-0 border-l-0'}`}
                    >
                        <div className="h-10 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700 flex items-center px-4 justify-between shrink-0">
                            <span className="font-bold text-xs text-zinc-500 uppercase tracking-wider">AI Simülasyonu</span>
                            <button onClick={() => setSimulationOpen(false)} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-times"></i></button>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg mb-4">
                                    <button onClick={() => setSimTab('input')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${simTab === 'input' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'text-zinc-500'}`}>Girdi</button>
                                    <button onClick={() => setSimTab('output')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${simTab === 'output' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'text-zinc-500'}`}>Çıktı</button>
                                </div>

                                {simTab === 'input' && (
                                    <div className="space-y-4 animate-in slide-in-from-left-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                            <h5 className="text-[10px] font-bold text-blue-600 uppercase mb-2">Algılanan Değişkenler</h5>
                                            {detectedVariables.length === 0 ? (
                                                <p className="text-xs text-blue-400 italic">Prompt içinde değişken bulunamadı. (Örn: {'{{topic}}'})</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {detectedVariables.map(v => (
                                                        <div key={v}>
                                                            <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-1">{v}</label>
                                                            <input 
                                                                type="text" 
                                                                value={testVariables[v] || ''} 
                                                                onChange={e => setTestVariables({...testVariables, [v]: e.target.value})}
                                                                className="w-full p-2 text-sm border rounded bg-white dark:bg-zinc-800 dark:border-zinc-700 outline-none focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <button 
                                            onClick={handleRunSimulation} 
                                            disabled={isSimulating}
                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                                            Test Et
                                        </button>
                                    </div>
                                )}

                                {simTab === 'output' && (
                                    <div className="animate-in slide-in-from-right-4 h-full flex flex-col">
                                        <div className={`flex-1 bg-zinc-900 text-zinc-300 p-4 rounded-xl font-mono text-xs overflow-auto border border-zinc-800 shadow-inner ${isSimulating ? 'opacity-50' : ''}`}>
                                            {simulationResult ? (
                                                <pre className="whitespace-pre-wrap break-all">{simulationResult}</pre>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-40 text-zinc-600 italic">
                                                    <i className="fa-solid fa-terminal text-2xl mb-2"></i>
                                                    <p>Çıktı bekleniyor...</p>
                                                </div>
                                            )}
                                        </div>
                                        {simulationResult && (
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(simulationResult)}
                                                className="mt-2 text-xs text-indigo-500 hover:underline text-right w-full"
                                            >
                                                Kopyala
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <i className="fa-solid fa-wand-magic-sparkles text-3xl opacity-30"></i>
                    </div>
                    <p className="font-bold text-lg text-zinc-600 dark:text-zinc-300">Prompt Seçin</p>
                    <p className="text-sm opacity-70">Düzenlemek veya test etmek için sol menüden bir şablon seçin.</p>
                </div>
            )}
        </div>
    );
};
