
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PromptTemplate, PromptSnippet } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import { ActivityType } from '../types';

// --- DEFAULT SNIPPETS (FALLBACK) ---
const DEFAULT_SNIPPETS = [
    { label: 'Rol: Pedagog', value: '[ROL: UZMAN PEDAGOG VE ÖZEL EĞİTİM UZMANI]\nSen çocuk psikolojisi ve öğrenme güçlükleri konusunda uzmansın.' },
    { label: 'Rol: Matematikçi', value: '[ROL: MATEMATİK ÖĞRETİM TASARIMCISI]\nSoyut kavramları somutlaştırma konusunda ustasın.' },
    { label: 'JSON Kuralı', value: 'KESİN KURAL: Sadece geçerli JSON formatında yanıt ver. Markdown, açıklama veya ek metin kullanma.' },
    { label: 'Görsel Prompt', value: '"imagePrompt" alanı için: "Flat Vector Art, Educational, Minimalist, White Background" stilinde İngilizce betimleme yaz.' },
    { label: 'Disleksi Kuralı', value: 'Disleksik bireyler için: Kısa cümleler, devrik olmayan yapı ve somut kelimeler kullan.' }
];

// --- COMPONENTS ---

const CodeEditor = ({ value, onChange, placeholder, readOnly = false }: { value: string, onChange?: (val: string) => void, placeholder?: string, readOnly?: boolean }) => {
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
        // Variables {{...}}
        escaped = escaped.replace(/(\{\{)(.*?)(\}\})/g, '<span class="text-amber-400 font-bold bg-amber-500/10 rounded px-0.5">$1$2$3</span>');
        // JSON Keys
        escaped = escaped.replace(/"(.*?)":/g, '<span class="text-sky-300">"$1":</span>');
        // Roles/Tags
        escaped = escaped.replace(/\[(.*?)\]/g, '<span class="text-emerald-400 font-bold">[$1]</span>');
        // Keywords
        escaped = escaped.replace(/(GÖREV:|ROL:|ZORLUK:|KURALLAR:|ÇIKTI FORMATI:)/g, '<span class="text-rose-400 font-bold border-b border-rose-400/30">$1</span>');
        
        return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
    };

    return (
        <div className="relative w-full h-full font-mono text-sm group bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden rounded-md border border-[#333]">
            <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#252526] border-r border-[#333] flex flex-col items-end pt-4 pr-2 text-[#6e7681] select-none text-xs leading-[1.6]">
                {value.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre
                ref={preRef}
                className="absolute inset-0 left-10 m-0 p-4 pointer-events-none whitespace-pre-wrap break-words overflow-hidden leading-[1.6]"
                aria-hidden="true"
            >
                <code className="text-[#d4d4d4]">{highlightCode(value)}</code>
            </pre>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                onScroll={handleScroll}
                readOnly={readOnly}
                className="absolute inset-0 left-10 w-[calc(100%-2.5rem)] h-full m-0 p-4 bg-transparent text-transparent caret-white border-none resize-none focus:ring-0 outline-none whitespace-pre-wrap break-words leading-[1.6] selection:bg-indigo-500/30"
                placeholder={placeholder}
                spellCheck={false}
            />
        </div>
    );
};

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    
    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'config' | 'history'>('editor');
    const [rightPanel, setRightPanel] = useState<'test' | 'snippets'>('test');
    
    // Snippet Management State
    const [snippets, setSnippets] = useState<PromptSnippet[]>([]);
    const [snippetMode, setSnippetMode] = useState<'list' | 'edit'>('list');
    const [editingSnippet, setEditingSnippet] = useState<PromptSnippet | null>(null);
    const [snippetForm, setSnippetForm] = useState<PromptSnippet>({ id: '', label: '', value: '' });

    // Simulation State
    const [testVariables, setTestVariables] = useState<Record<string, string>>({});
    const [simulationResult, setSimulationResult] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [modelConfig, setModelConfig] = useState({ temperature: 0.7, topP: 0.95 });

    useEffect(() => {
        loadPrompts();
        loadSnippets();
    }, []);

    const loadPrompts = async () => {
        const data = await adminService.getAllPrompts();
        setPrompts(data);
    };

    const loadSnippets = async () => {
        const data = await adminService.getAllSnippets();
        if (data.length === 0) {
             // Convert defaults to proper type with IDs
             const defaultsWithIds = DEFAULT_SNIPPETS.map((s, i) => ({...s, id: `def_${i}`}));
             setSnippets(defaultsWithIds);
        } else {
             setSnippets(data);
        }
    };

    const handleSelectActivity = async (activityId: string, title: string, categoryId: string) => {
        const promptId = `prompt_${activityId.toLowerCase()}`;
        const existing = prompts.find(p => p.id === promptId);

        if (existing) {
            setSelectedPrompt(existing);
            setModelConfig({
                temperature: existing.modelConfig?.temperature ?? 0.7,
                topP: existing.modelConfig?.topP ?? 0.95
            });
        } else {
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
        setSimulationResult('');
    };

    const toggleCategory = (catId: string) => {
        setOpenCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
    };

    // Auto-detect variables from template text
    const detectedVariables = useMemo(() => {
        if (!selectedPrompt) return [];
        const regex = /\{\{(.*?)\}\}/g;
        const matches = Array.from(selectedPrompt.template.matchAll(regex)).map(m => m[1]);
        return [...new Set(matches)];
    }, [selectedPrompt?.template]);

    // Sync variables to input fields
    useEffect(() => {
        if (detectedVariables.length > 0) {
            setTestVariables(prev => {
                const newState = { ...prev };
                detectedVariables.forEach(v => {
                    if (!newState[v]) {
                        if (v.includes('difficulty')) newState[v] = 'Orta';
                        else if (v.includes('Count')) newState[v] = '5';
                        else if (v.includes('topic')) newState[v] = 'Uzay';
                        else newState[v] = `[${v}]`; 
                    }
                });
                return newState;
            });
        }
    }, [detectedVariables]);

    const handleSave = async () => {
        if (!selectedPrompt) return;
        const note = prompt("Değişiklik notu (Opsiyonel):", "Güncelleme");
        if (note === null) return;

        setIsSaving(true);
        const updated = { 
            ...selectedPrompt, 
            variables: detectedVariables,
            modelConfig: modelConfig
        };
        const saved = await adminService.savePrompt(updated, note);
        
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
        setSimulationResult(''); 
        
        try {
            const promptWithConfig = { ...selectedPrompt, modelConfig };
            const result = await adminService.testPrompt(promptWithConfig, testVariables);
            
            if (typeof result === 'string') {
                 setSimulationResult(result);
            } else {
                 setSimulationResult(JSON.stringify(result, null, 2));
            }
        } catch (e: any) {
            setSimulationResult(`⚠️ SİSTEM HATASI:\n${e.message}\n\nLütfen Prompt'un JSON yapısını ve değişkenleri kontrol edin.`);
        } finally {
            setIsSimulating(false);
        }
    };

    const insertSnippet = (val: string) => {
        if (!selectedPrompt) return;
        setSelectedPrompt({
            ...selectedPrompt,
            template: selectedPrompt.template + "\n" + val
        });
    };

    // --- SNIPPET MANAGEMENT ---
    const handleAddSnippet = () => {
        setSnippetForm({ id: `snip_${Date.now()}`, label: '', value: '' });
        setEditingSnippet(null);
        setSnippetMode('edit');
    };

    const handleEditSnippet = (snippet: PromptSnippet, e: React.MouseEvent) => {
        e.stopPropagation();
        setSnippetForm(snippet);
        setEditingSnippet(snippet);
        setSnippetMode('edit');
    };

    const handleSaveSnippet = async () => {
        if (!snippetForm.label || !snippetForm.value) return;
        
        // Optimistic UI update
        setSnippets(prev => {
            if (editingSnippet) {
                return prev.map(s => s.id === snippetForm.id ? snippetForm : s);
            } else {
                return [...prev, snippetForm];
            }
        });

        // Async save to DB
        await adminService.saveSnippet(snippetForm);
        setSnippetMode('list');
    };

    const handleDeleteSnippet = async (id: string) => {
        if(confirm("Bu parçacığı silmek istediğinize emin misiniz?")) {
            setSnippets(prev => prev.filter(s => s.id !== id));
            await adminService.deleteSnippet(id);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] flex bg-[#121212] text-zinc-300 font-sans overflow-hidden">
            
            {/* 1. LEFT SIDEBAR: EXPLORER */}
            <div className="w-64 bg-[#18181b] border-r border-[#27272a] flex flex-col shrink-0">
                <div className="h-12 flex items-center px-4 bg-[#202023] border-b border-[#27272a] justify-between">
                    <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">AKTİVİTELER</span>
                    <span className="text-[10px] bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">{ACTIVITIES.length}</span>
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
                                    className={`w-full flex items-center gap-2 px-2 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${isOpen ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                                >
                                    <i className={`fa-solid fa-chevron-right text-[9px] transition-transform w-3 ${isOpen ? 'rotate-90' : ''}`}></i>
                                    <i className={`${cat.icon} text-[10px] w-4 text-center opacity-70`}></i>
                                    <span className="truncate">{cat.title}</span>
                                </button>
                                
                                {isOpen && (
                                    <div className="ml-2 pl-2 border-l border-zinc-700 mt-1 space-y-0.5 animate-in slide-in-from-left-2 duration-150">
                                        {catActivities.map(act => {
                                            const isActive = selectedPrompt?.id === `prompt_${act.id.toLowerCase()}`;
                                            return (
                                                <button
                                                    key={act.id}
                                                    onClick={() => handleSelectActivity(act.id, act.title, cat.id)}
                                                    className={`w-full text-left px-3 py-1.5 text-[11px] truncate rounded-md flex items-center gap-2 ${isActive ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-zinc-600'}`}></div>
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

            {/* 2. MAIN EDITOR AREA */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">
                {selectedPrompt ? (
                    <>
                        {/* Tab Bar */}
                        <div className="h-12 bg-[#252526] flex items-center px-4 gap-4 border-b border-[#333]">
                            <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                                <i className="fa-solid fa-file-code text-indigo-500"></i>
                                {selectedPrompt.name}
                            </div>
                            <div className="h-4 w-px bg-[#444]"></div>
                            
                            <div className="flex bg-[#18181b] rounded-lg p-0.5 border border-[#333]">
                                {['editor', 'config', 'history'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {tab === 'editor' ? 'Kod' : tab === 'config' ? 'Ayarlar' : 'Geçmiş'}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex-1"></div>
                            
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                                <span>Kaydet</span>
                            </button>
                        </div>

                        {/* Editor Content */}
                        <div className="flex-1 relative">
                            {activeTab === 'editor' && (
                                <div className="absolute inset-0 p-4">
                                    <CodeEditor 
                                        value={selectedPrompt.template} 
                                        onChange={(val) => setSelectedPrompt({...selectedPrompt, template: val})} 
                                        placeholder="// Prompt şablonunu buraya yazın..."
                                    />
                                </div>
                            )}

                            {activeTab === 'config' && (
                                <div className="p-8 max-w-2xl mx-auto space-y-6">
                                    <div className="bg-[#252526] p-6 rounded-xl border border-[#333]">
                                        <h3 className="text-sm font-bold text-white mb-4 border-b border-[#333] pb-2">Model Yapılandırması</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="flex justify-between text-xs font-bold text-zinc-400 mb-1">
                                                    Yaratıcılık (Temperature): {modelConfig.temperature}
                                                </label>
                                                <input 
                                                    type="range" min="0" max="1" step="0.1"
                                                    value={modelConfig.temperature}
                                                    onChange={e => setModelConfig({...modelConfig, temperature: parseFloat(e.target.value)})}
                                                    className="w-full accent-indigo-500"
                                                />
                                                <div className="flex justify-between text-[10px] text-zinc-600">
                                                    <span>Tutarli (0.0)</span>
                                                    <span>Dengeli (0.7)</span>
                                                    <span>Rastgele (1.0)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#252526] p-6 rounded-xl border border-[#333]">
                                        <h3 className="text-sm font-bold text-white mb-4 border-b border-[#333] pb-2">Sistem Rolü (Persona)</h3>
                                        <textarea 
                                            value={selectedPrompt.systemInstruction} 
                                            onChange={e => setSelectedPrompt({...selectedPrompt, systemInstruction: e.target.value})} 
                                            className="w-full h-32 bg-[#1e1e1e] border border-[#333] rounded-lg p-3 text-xs text-zinc-300 focus:border-indigo-500 outline-none resize-none font-mono"
                                            placeholder="AI sistem rolü..."
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="p-8 max-w-4xl mx-auto">
                                    <div className="bg-[#252526] rounded-xl border border-[#333] overflow-hidden">
                                        <table className="w-full text-left text-xs text-zinc-400">
                                            <thead className="bg-[#333] text-zinc-200">
                                                <tr>
                                                    <th className="p-3">Versiyon</th>
                                                    <th className="p-3">Tarih</th>
                                                    <th className="p-3">Değişiklik Notu</th>
                                                    <th className="p-3 text-right">Eylem</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...(selectedPrompt.history || [])].reverse().map((h, i) => (
                                                    <tr key={i} className="border-b border-[#333] hover:bg-[#2a2d2e]">
                                                        <td className="p-3 font-mono text-indigo-400">v{h.version}</td>
                                                        <td className="p-3">{new Date(h.updatedAt).toLocaleDateString()} {new Date(h.updatedAt).toLocaleTimeString()}</td>
                                                        <td className="p-3 text-white">{h.changeLog}</td>
                                                        <td className="p-3 text-right">
                                                            <button 
                                                                onClick={() => {
                                                                    if(confirm('Bu versiyona geri dönülsün mü?')) {
                                                                        setSelectedPrompt({...selectedPrompt, template: h.template, systemInstruction: h.systemInstruction || selectedPrompt.systemInstruction});
                                                                        setActiveTab('editor');
                                                                    }
                                                                }}
                                                                className="text-indigo-400 hover:text-white hover:underline"
                                                            >
                                                                Geri Yükle
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {(!selectedPrompt.history || selectedPrompt.history.length === 0) && (
                                            <div className="p-8 text-center text-zinc-500">Geçmiş kaydı bulunamadı.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <i className="fa-solid fa-code-branch text-6xl mb-4 opacity-20"></i>
                        <p>Düzenlemek için sol menüden bir aktivite seçin.</p>
                    </div>
                )}
            </div>

            {/* 3. RIGHT SIDEBAR: TOOLS & TEST */}
            <div className="w-96 bg-[#18181b] border-l border-[#27272a] flex flex-col shrink-0">
                {/* Tools Header */}
                <div className="h-12 flex items-center px-2 bg-[#202023] border-b border-[#27272a] gap-1">
                    <button 
                        onClick={() => setRightPanel('test')}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${rightPanel === 'test' ? 'bg-[#333] text-white' : 'text-zinc-500 hover:bg-[#2a2d2e]'}`}
                    >
                        <i className="fa-solid fa-flask mr-2"></i> Test
                    </button>
                    <button 
                        onClick={() => setRightPanel('snippets')}
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-colors ${rightPanel === 'snippets' ? 'bg-[#333] text-white' : 'text-zinc-500 hover:bg-[#2a2d2e]'}`}
                    >
                        <i className="fa-solid fa-book-bookmark mr-2"></i> Kütüphane
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col">
                    
                    {rightPanel === 'test' && (
                        <>
                            <div className="mb-6">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 border-b border-indigo-500/20 pb-1">
                                    Değişkenler
                                </h4>
                                {detectedVariables.length === 0 ? (
                                    <div className="p-3 rounded border border-dashed border-[#333] text-xs text-zinc-500 text-center">
                                        Değişken yok. (Örn: {'{{topic}}'})
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {detectedVariables.map(v => (
                                            <div key={v}>
                                                <label className="text-[10px] text-zinc-400 font-bold block mb-1 uppercase">{v}</label>
                                                <input 
                                                    type="text" 
                                                    value={testVariables[v] || ''} 
                                                    onChange={e => setTestVariables({...testVariables, [v]: e.target.value})}
                                                    className="w-full bg-[#252526] border border-[#333] rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSimulate} 
                                disabled={isSimulating || !selectedPrompt}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                                {isSimulating ? 'AI Üretiyor...' : 'Testi Çalıştır'}
                            </button>

                            <div className="flex-1 flex flex-col min-h-0">
                                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 border-b border-emerald-500/20 pb-1">
                                    Çıktı (Response)
                                </h4>
                                <div className="flex-1 relative bg-[#252526] rounded border border-[#333] overflow-hidden">
                                    <CodeEditor 
                                        value={simulationResult} 
                                        readOnly 
                                        placeholder="Sonuç burada görünecek..." 
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {rightPanel === 'snippets' && (
                        <div className="flex-1 flex flex-col">
                            {snippetMode === 'list' ? (
                                <>
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-[10px] text-zinc-500">Kayıtlı Parçacıklar</p>
                                        <button 
                                            onClick={handleAddSnippet}
                                            className="text-[10px] font-bold bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-500 text-white transition-colors"
                                        >
                                            + Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-3 flex-1 overflow-y-auto">
                                        {snippets.map((snip, i) => (
                                            <div 
                                                key={i} 
                                                className="group w-full text-left p-3 bg-[#252526] hover:bg-[#2a2d2e] border border-[#333] rounded-lg transition-colors relative"
                                            >
                                                {/* Content Click -> Insert */}
                                                <div onClick={() => insertSnippet(snip.value)} className="cursor-pointer">
                                                    <div className="font-bold text-xs text-zinc-300 group-hover:text-white mb-1 pr-6">{snip.label}</div>
                                                    <div className="text-[10px] text-zinc-500 line-clamp-2 font-mono">{snip.value}</div>
                                                </div>

                                                {/* Actions */}
                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => handleEditSnippet(snip, e)}
                                                        className="p-1 hover:text-indigo-400 text-zinc-500"
                                                        title="Düzenle"
                                                    >
                                                        <i className="fa-solid fa-pen text-[10px]"></i>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteSnippet(snip.id); }}
                                                        className="p-1 hover:text-red-400 text-zinc-500"
                                                        title="Sil"
                                                    >
                                                        <i className="fa-solid fa-trash text-[10px]"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-[#333] pb-2">
                                        <h4 className="text-xs font-bold text-white">
                                            {editingSnippet ? 'Parçacık Düzenle' : 'Yeni Parçacık'}
                                        </h4>
                                        <button onClick={() => setSnippetMode('list')} className="text-zinc-500 hover:text-white">
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] text-zinc-400 block mb-1 uppercase">Başlık (Etiket)</label>
                                        <input 
                                            type="text" 
                                            value={snippetForm.label}
                                            onChange={e => setSnippetForm({...snippetForm, label: e.target.value})}
                                            className="w-full bg-[#252526] border border-[#333] rounded px-2 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
                                            placeholder="Örn: Rol Tanımı"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <label className="text-[10px] text-zinc-400 block mb-1 uppercase">İçerik</label>
                                        <textarea
                                            value={snippetForm.value}
                                            onChange={e => setSnippetForm({...snippetForm, value: e.target.value})}
                                            className="w-full h-40 bg-[#252526] border border-[#333] rounded p-2 text-xs text-white focus:border-indigo-500 outline-none resize-none font-mono"
                                            placeholder="Eklenecek metni buraya yazın..."
                                        />
                                    </div>

                                    <button 
                                        onClick={handleSaveSnippet}
                                        disabled={!snippetForm.label || !snippetForm.value}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs disabled:opacity-50"
                                    >
                                        Kaydet
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
