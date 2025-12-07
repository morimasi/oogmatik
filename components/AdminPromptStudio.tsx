
import React, { useState, useEffect, useRef } from 'react';
import { PromptTemplate, PromptVersion } from '../types/admin';
import { adminService } from '../services/adminService';

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'simulate'>('editor');
    
    // Simulation State
    const [testVariables, setTestVariables] = useState<Record<string, string>>({});
    const [simulationResult, setSimulationResult] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);
    
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        loadPrompts();
    }, []);

    useEffect(() => {
        if (selectedPrompt) {
            const initialVars: Record<string, string> = {};
            selectedPrompt.variables.forEach(v => initialVars[v] = `[${v}]`);
            setTestVariables(initialVars);
            setSimulationResult('');
        }
    }, [selectedPrompt]);

    const loadPrompts = async () => {
        const data = await adminService.getAllPrompts();
        setPrompts(data);
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;
        
        const note = prompt("Bu versiyon için değişiklik notu (Opsiyonel):", "Güncelleme");
        if (note === null) return; // Cancel

        setIsSaving(true);
        const updated = await adminService.savePrompt(selectedPrompt, note || "Update");
        setPrompts(prev => prev.map(p => p.id === updated.id ? updated : p));
        setSelectedPrompt(updated);
        setIsSaving(false);
    };

    const handleRunSimulation = async () => {
        if (!selectedPrompt) return;
        setIsSimulating(true);
        setSimulationResult('');
        try {
            const result = await adminService.testPrompt(selectedPrompt, testVariables);
            setSimulationResult(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setSimulationResult(`Hata: ${e.message}`);
        } finally {
            setIsSimulating(false);
        }
    };

    const insertVariable = (variable: string) => {
        if (!selectedPrompt || !editorRef.current) return;
        const textarea = editorRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = selectedPrompt.template;
        const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
        setSelectedPrompt({ ...selectedPrompt, template: newText });
        textarea.focus();
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

    const addNewPrompt = () => {
        const newPrompt: PromptTemplate = {
            id: `prompt_${Date.now()}`,
            name: 'Yeni AI Şablonu',
            description: '',
            systemInstruction: 'Sen deneyimli bir pedagogsun.',
            template: 'Buraya prompt yazınız...',
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

    return (
        <div className="h-[calc(100vh-140px)] flex gap-4 bg-zinc-50 dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                    <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-widest">Şablonlar</h3>
                    <button onClick={addNewPrompt} className="w-7 h-7 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors text-sm">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {prompts.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPrompt(p)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-all border-l-4 ${selectedPrompt?.id === p.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-500' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-transparent'}`}
                        >
                            <div className="font-bold truncate">{p.name}</div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-500">v{p.version}</span>
                                <span className="text-[10px] text-zinc-400">{new Date(p.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedPrompt ? (
                    <>
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                            <div className="flex-1 mr-8">
                                <input 
                                    type="text" 
                                    value={selectedPrompt.name} 
                                    onChange={e => setSelectedPrompt({...selectedPrompt, name: e.target.value})}
                                    className="font-black text-xl bg-transparent border-none focus:ring-0 p-0 text-zinc-900 dark:text-white w-full placeholder:text-zinc-300"
                                    placeholder="Prompt Adı"
                                />
                            </div>
                            
                            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg mr-4 shrink-0">
                                <button onClick={() => setActiveTab('editor')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500'}`}>Editör</button>
                                <button onClick={() => setActiveTab('simulate')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'simulate' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600' : 'text-zinc-500'}`}>Test Et</button>
                                <button onClick={() => setActiveTab('history')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white dark:bg-zinc-700 shadow-sm text-orange-600' : 'text-zinc-500'}`}>Geçmiş</button>
                            </div>

                            <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm disabled:opacity-50">
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                                <span>Kaydet</span>
                            </button>
                        </div>

                        {activeTab === 'editor' && (
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                {/* Editor Column */}
                                <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800 relative bg-white dark:bg-zinc-900">
                                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-amber-50/30 dark:bg-amber-900/10">
                                        <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 block">Sistem Rolü (System Instruction)</label>
                                        <input 
                                            type="text"
                                            value={selectedPrompt.systemInstruction || ''}
                                            onChange={e => setSelectedPrompt({...selectedPrompt, systemInstruction: e.target.value})}
                                            className="w-full bg-transparent border-none p-0 text-sm font-medium text-zinc-700 dark:text-zinc-300 focus:ring-0 placeholder:text-zinc-400"
                                            placeholder="AI'ın rolünü tanımlayın (Örn: Sen bir matematik öğretmenisin)"
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={editorRef}
                                            value={selectedPrompt.template}
                                            onChange={e => setSelectedPrompt({...selectedPrompt, template: e.target.value})}
                                            className="w-full h-full p-6 font-mono text-sm leading-relaxed bg-transparent text-zinc-800 dark:text-zinc-200 outline-none resize-none"
                                            spellCheck={false}
                                            placeholder="Prompt şablonunu buraya yazın..."
                                        ></textarea>
                                        <div className="absolute top-2 right-2 text-[10px] text-zinc-300 font-mono">TOKEN: ~{selectedPrompt.template.length / 4}</div>
                                    </div>
                                </div>

                                {/* Variables Sidebar */}
                                <div className="w-60 bg-zinc-50 dark:bg-zinc-950 p-4 flex flex-col gap-4 overflow-y-auto border-l border-zinc-200 dark:border-zinc-800">
                                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Değişkenler</h4>
                                    <div className="space-y-2">
                                        {selectedPrompt.variables.map(v => (
                                            <button 
                                                key={v} 
                                                onClick={() => insertVariable(v)}
                                                className="w-full text-left px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 transition-colors flex justify-between group"
                                            >
                                                <span>{v}</span>
                                                <i className="fa-solid fa-plus opacity-0 group-hover:opacity-100"></i>
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const v = prompt("Yeni değişken adı:");
                                            if (v) setSelectedPrompt({...selectedPrompt, variables: [...selectedPrompt.variables, v]});
                                        }}
                                        className="w-full py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                                    >
                                        + Değişken Ekle
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'simulate' && (
                            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-zinc-50 dark:bg-black">
                                <div className="w-full md:w-1/3 border-r border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto">
                                    <h4 className="font-bold text-zinc-700 dark:text-zinc-300 mb-6 flex items-center gap-2">
                                        <i className="fa-solid fa-flask text-indigo-500"></i> Test Parametreleri
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedPrompt.variables.map(v => (
                                            <div key={v}>
                                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">{v}</label>
                                                <input 
                                                    type="text" 
                                                    value={testVariables[v] || ''}
                                                    onChange={e => setTestVariables({...testVariables, [v]: e.target.value})}
                                                    className="w-full p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleRunSimulation} 
                                        disabled={isSimulating}
                                        className="w-full mt-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                                        Simülasyonu Başlat
                                    </button>
                                </div>
                                <div className="flex-1 p-6 bg-zinc-900 text-zinc-300 font-mono text-xs overflow-auto">
                                    {simulationResult ? (
                                        <pre className="whitespace-pre-wrap break-all">{simulationResult}</pre>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-zinc-600 italic">
                                            Test sonucunu görmek için simülasyonu başlatın.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="flex-1 p-8 overflow-y-auto bg-zinc-50 dark:bg-black">
                                <h4 className="font-bold text-zinc-700 dark:text-zinc-300 mb-6">Versiyon Geçmişi</h4>
                                <div className="space-y-6 max-w-3xl">
                                    {(selectedPrompt.history || []).slice().reverse().map((ver, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-zinc-300 group-hover:bg-indigo-500 transition-colors"></div>
                                                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-800 my-1 group-last:hidden"></div>
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm group-hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Versiyon {ver.version}</span>
                                                            <span className="text-xs text-zinc-400 ml-2">{new Date(ver.updatedAt).toLocaleString()}</span>
                                                        </div>
                                                        {ver.version !== selectedPrompt.version && (
                                                            <button 
                                                                onClick={() => restoreVersion(ver)}
                                                                className="text-xs font-bold text-indigo-600 hover:underline"
                                                            >
                                                                Geri Yükle
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 bg-zinc-50 dark:bg-zinc-800 p-2 rounded italic">
                                                        "{ver.changeLog || 'Değişiklik notu yok'}"
                                                    </p>
                                                    <div className="text-xs font-mono text-zinc-500 line-clamp-3 opacity-70">
                                                        {ver.template}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedPrompt.history || selectedPrompt.history.length === 0) && (
                                        <p className="text-zinc-400 italic">Henüz geçmiş kaydı yok.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-terminal text-6xl mb-4 opacity-20"></i>
                        <p>Bir prompt seçin veya yeni oluşturun.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
