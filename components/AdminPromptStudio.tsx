
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PromptTemplate, PromptVersion } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES } from '../constants';

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
        escaped = escaped.replace(/(\{\{)(.*?)(\}\})/g, '<span class="text-amber-500 font-bold bg-amber-500/10 rounded px-0.5">$1$2$3</span>');
        escaped = escaped.replace(/"(.*?)":/g, '<span class="text-indigo-400">"$1":</span>');
        escaped = escaped.replace(/(\[.*?\])/g, '<span class="text-emerald-500 font-bold">$1</span>');
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
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    
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

    // Derived Variables from Template
    const detectedVariables = useMemo(() => {
        if (!selectedPrompt) return [];
        const regex = /\{\{(.*?)\}\}/g;
        const matches = Array.from(selectedPrompt.template.matchAll(regex)).map(m => m[1]);
        return [...new Set(matches)];
    }, [selectedPrompt?.template]);

    // Initial Test Vars Sync
    useEffect(() => {
        if (detectedVariables.length > 0) {
            setTestVariables(prev => {
                const newState = { ...prev };
                detectedVariables.forEach(v => {
                    if (!newState[v]) newState[v] = `[${v}]`; 
                });
                return newState;
            });
        }
    }, [detectedVariables]);

    const handleSave = async () => {
        if (!selectedPrompt) return;
        const note = prompt("Değişiklik notu girin:", "Update");
        if (note === null) return;

        setIsSaving(true);
        const updated = { ...selectedPrompt, variables: detectedVariables };
        const saved = await adminService.savePrompt(updated, note);
        
        setPrompts(prev => prev.map(p => p.id === saved.id ? saved : p));
        setSelectedPrompt(saved);
        setIsSaving(false);
    };

    const handleNewPrompt = () => {
        const id = prompt("Prompt ID (örn: math_geometry):");
        if (!id) return;
        const newPrompt: PromptTemplate = {
            id,
            name: id.replace(/_/g, ' ').toUpperCase(),
            description: '',
            category: 'general',
            systemInstruction: 'Sen bir eğitim uzmanısın.',
            template: 'GÖREV: {{topic}} hakkında içerik üret.',
            variables: ['topic'],
            tags: [],
            updatedAt: new Date().toISOString(),
            version: 1,
            history: []
        };
        setPrompts([...prompts, newPrompt]);
        setSelectedPrompt(newPrompt);
    };

    const handleSimulate = async () => {
        if (!selectedPrompt) return;
        setIsSimulating(true);
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

    // Group Prompts
    const groupedPrompts = useMemo(() => {
        const groups: Record<string, PromptTemplate[]> = { 'system': [], 'general': [] };
        ACTIVITY_CATEGORIES.forEach(c => groups[c.id] = []);
        
        prompts.forEach(p => {
            const cat = p.category || 'general';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [prompts]);

    return (
        <div className="h-[calc(100vh-140px)] flex bg-[#1e1e1e] text-zinc-300 rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 font-sans">
            
            {/* 1. SIDEBAR (Explorer) */}
            <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
                <div className="h-10 flex items-center px-4 bg-[#333333] text-xs font-bold text-zinc-300 uppercase tracking-wider justify-between shrink-0">
                    <span>Gezgin</span>
                    <button onClick={handleNewPrompt} className="hover:text-white"><i className="fa-solid fa-plus"></i></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {/* Categories Tree */}
                    {Object.entries(groupedPrompts).map(([catId, catPrompts]) => {
                        if (catPrompts.length === 0) return null;
                        const isOpen = openCategory === catId;
                        const catTitle = ACTIVITY_CATEGORIES.find(c => c.id === catId)?.title || catId.toUpperCase();
                        
                        return (
                            <div key={catId}>
                                <button 
                                    onClick={() => setOpenCategory(isOpen ? null : catId)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2d2e] rounded cursor-pointer transition-colors"
                                >
                                    <i className={`fa-solid fa-chevron-right text-[10px] transition-transform ${isOpen ? 'rotate-90' : ''}`}></i>
                                    {catTitle}
                                </button>
                                
                                {isOpen && (
                                    <div className="ml-4 pl-2 border-l border-[#444] mt-1 space-y-0.5">
                                        {catPrompts.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedPrompt(p)}
                                                className={`w-full text-left px-2 py-1.5 text-xs truncate rounded flex items-center gap-2 ${selectedPrompt?.id === p.id ? 'bg-[#37373d] text-white border-l-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2d2e]'}`}
                                            >
                                                <i className="fa-solid fa-file-code text-[10px] opacity-70"></i>
                                                {p.name}
                                            </button>
                                        ))}
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
                            {['editor', 'config', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 h-full text-xs flex items-center gap-2 border-r border-[#333] ${activeTab === tab ? 'bg-[#1e1e1e] text-white border-t-2 border-t-indigo-500' : 'text-zinc-500 hover:bg-[#333]'}`}
                                >
                                    <i className={`fa-solid ${tab === 'editor' ? 'fa-code' : tab === 'config' ? 'fa-sliders' : 'fa-clock-rotate-left'}`}></i>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                            <div className="flex-1"></div>
                            <button 
                                onClick={() => setSimulationOpen(!simulationOpen)}
                                className={`px-3 py-1 mr-2 text-xs font-bold rounded ${simulationOpen ? 'bg-indigo-600 text-white' : 'bg-[#333] text-zinc-300 hover:bg-[#444]'}`}
                            >
                                <i className="fa-solid fa-flask mr-1"></i> Simülasyon
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded flex items-center gap-1 disabled:opacity-50"
                            >
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} Kaydet
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
                                        <textarea 
                                            value={selectedPrompt.systemInstruction} 
                                            onChange={e => setSelectedPrompt({...selectedPrompt, systemInstruction: e.target.value})} 
                                            className="w-full bg-[#252526] border border-[#333] p-4 rounded text-zinc-300 focus:border-indigo-500 outline-none h-40 font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-zinc-500 mb-1 font-bold">Kategori</label>
                                            <select 
                                                value={selectedPrompt.category} 
                                                onChange={e => setSelectedPrompt({...selectedPrompt, category: e.target.value})}
                                                className="w-full bg-[#252526] border border-[#333] p-2 rounded text-white focus:border-indigo-500 outline-none"
                                            >
                                                <option value="system">Sistem</option>
                                                <option value="general">Genel</option>
                                                {ACTIVITY_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                            </select>
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
                                                                if(confirm('Geri dönmek istiyor musunuz?')) {
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
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                        <i className="fa-solid fa-code text-6xl mb-4 opacity-20"></i>
                        <p>Düzenlemek için soldan bir dosya seçin.</p>
                    </div>
                )}
            </div>

            {/* 3. SIMULATION PANE */}
            <div className={`border-l border-[#333] bg-[#252526] flex flex-col transition-all duration-300 ${simulationOpen ? 'w-96' : 'w-0'}`}>
                <div className="h-10 flex items-center px-4 bg-[#333] text-xs font-bold text-zinc-300 uppercase tracking-wider justify-between shrink-0">
                    <span>Test Laboratuvarı</span>
                    <button onClick={() => setSimulationOpen(false)}><i className="fa-solid fa-times"></i></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h5 className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Değişkenler</h5>
                        {detectedVariables.length === 0 ? (
                            <p className="text-xs text-zinc-600 italic">Değişken yok.</p>
                        ) : (
                            <div className="space-y-3">
                                {detectedVariables.map(v => (
                                    <div key={v}>
                                        <label className="text-xs text-indigo-400 font-bold block mb-1">{v}</label>
                                        <input 
                                            type="text" 
                                            value={testVariables[v] || ''} 
                                            onChange={e => setTestVariables({...testVariables, [v]: e.target.value})}
                                            className="w-full bg-[#1e1e1e] border border-[#444] rounded p-2 text-xs text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handleSimulate} 
                        disabled={isSimulating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center justify-center gap-2"
                    >
                        {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>} 
                        Çalıştır
                    </button>

                    <div className="flex-1 flex flex-col min-h-[200px]">
                        <h5 className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Sonuç (JSON)</h5>
                        <div className="flex-1 bg-[#1e1e1e] rounded border border-[#444] p-2 relative overflow-hidden">
                             <textarea 
                                readOnly
                                value={simulationResult}
                                className="w-full h-full bg-transparent text-xs font-mono text-green-400 resize-none outline-none"
                             />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
