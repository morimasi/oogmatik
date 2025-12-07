
import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeView, setActiveView] = useState<'edit' | 'simulate'>('edit');
    
    // Simulation State
    const [testVariables, setTestVariables] = useState<Record<string, string>>({});
    const [simulationResult, setSimulationResult] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        loadPrompts();
    }, []);

    useEffect(() => {
        // Initialize test variables when prompt changes
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
        setIsSaving(true);
        const updated = await adminService.savePrompt(selectedPrompt, "Manuel güncelleme");
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
        if (!selectedPrompt) return;
        const textarea = document.getElementById('prompt-editor') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = selectedPrompt.template;
            const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
            setSelectedPrompt({ ...selectedPrompt, template: newText });
        }
    };

    const addNewPrompt = () => {
        const newPrompt: PromptTemplate = {
            id: `new_prompt_${Date.now()}`,
            name: 'Yeni Prompt',
            description: 'Açıklama giriniz...',
            systemInstruction: 'Sen uzman bir öğretim tasarımcısısın.',
            template: 'Buraya prompt yazınız...',
            variables: ['topic', 'difficulty'],
            tags: [],
            updatedAt: new Date().toISOString(),
            version: 1,
            history: []
        };
        setPrompts([...prompts, newPrompt]);
        setSelectedPrompt(newPrompt);
        setActiveView('edit');
    };

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-72 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden shadow-sm shrink-0">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Prompt Kütüphanesi</h3>
                    <button onClick={addNewPrompt} className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        <i className="fa-solid fa-plus"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {prompts.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPrompt(p)}
                            className={`w-full text-left p-3 rounded-lg text-sm transition-all group ${selectedPrompt?.id === p.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-transparent'}`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold truncate">{p.name}</span>
                                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-600 px-1.5 py-0.5 rounded text-zinc-500 dark:text-zinc-300">v{p.version}</span>
                            </div>
                            <div className="text-xs opacity-70 truncate">{p.id}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                {selectedPrompt ? (
                    <>
                        {/* Header Toolbar */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                            <div className="flex-1 mr-8">
                                <input 
                                    type="text" 
                                    value={selectedPrompt.name} 
                                    onChange={e => setSelectedPrompt({...selectedPrompt, name: e.target.value})}
                                    className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-zinc-800 dark:text-white w-full"
                                    placeholder="Prompt Adı"
                                />
                                <input 
                                    type="text" 
                                    value={selectedPrompt.description} 
                                    onChange={e => setSelectedPrompt({...selectedPrompt, description: e.target.value})}
                                    className="text-xs text-zinc-500 bg-transparent border-none focus:ring-0 p-0 w-full"
                                    placeholder="Kısa açıklama..."
                                />
                            </div>
                            
                            <div className="flex bg-zinc-200 dark:bg-zinc-700 p-1 rounded-lg mr-4">
                                <button onClick={() => setActiveView('edit')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeView === 'edit' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}>
                                    <i className="fa-solid fa-code mr-2"></i>Editör
                                </button>
                                <button onClick={() => setActiveView('simulate')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeView === 'simulate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}>
                                    <i className="fa-solid fa-play mr-2"></i>Simülasyon
                                </button>
                            </div>

                            <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                                <span>Kaydet</span>
                            </button>
                        </div>

                        {activeView === 'edit' ? (
                            <div className="flex-1 flex flex-col h-full overflow-hidden">
                                {/* System Instruction Box */}
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-amber-50/50 dark:bg-amber-900/10">
                                    <label className="block text-xs font-bold text-amber-600 mb-1 uppercase tracking-wider">
                                        <i className="fa-solid fa-robot mr-1"></i> Sistem Talimatı (Rol)
                                    </label>
                                    <textarea 
                                        value={selectedPrompt.systemInstruction || ''}
                                        onChange={e => setSelectedPrompt({...selectedPrompt, systemInstruction: e.target.value})}
                                        className="w-full bg-transparent border border-amber-200 dark:border-amber-800 rounded-lg p-2 text-sm text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-amber-500 outline-none resize-none h-20"
                                        placeholder="AI'ın rolünü ve temel kurallarını tanımlayın..."
                                    />
                                </div>

                                {/* Variables Toolbar */}
                                <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700/30 border-b border-zinc-200 dark:border-zinc-700 flex gap-2 overflow-x-auto items-center">
                                    <span className="text-xs font-bold text-zinc-400 uppercase mr-2 flex-shrink-0">Değişkenler:</span>
                                    {selectedPrompt.variables.map(v => (
                                        <button 
                                            key={v} 
                                            onClick={() => insertVariable(v)}
                                            className="px-2 py-1 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded text-xs font-mono text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 transition-colors shadow-sm"
                                        >
                                            {`{{${v}}}`}
                                        </button>
                                    ))}
                                    <div className="w-px h-4 bg-zinc-300 mx-2"></div>
                                    <button 
                                        onClick={() => {
                                            const v = prompt("Yeni değişken adı:");
                                            if (v) setSelectedPrompt({...selectedPrompt, variables: [...selectedPrompt.variables, v]});
                                        }}
                                        className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 border border-dashed border-zinc-400 rounded hover:bg-zinc-100"
                                    >
                                        + Yeni Ekle
                                    </button>
                                </div>

                                {/* Main Editor */}
                                <div className="flex-1 relative bg-zinc-50 dark:bg-zinc-950">
                                    <textarea
                                        id="prompt-editor"
                                        value={selectedPrompt.template}
                                        onChange={e => setSelectedPrompt({...selectedPrompt, template: e.target.value})}
                                        className="w-full h-full p-6 font-mono text-sm leading-relaxed bg-transparent text-zinc-800 dark:text-zinc-200 outline-none resize-none"
                                        spellCheck={false}
                                        placeholder="Kullanıcı prompt şablonunu buraya yazın..."
                                    ></textarea>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                                {/* Sim Inputs */}
                                <div className="w-full md:w-1/3 border-r border-zinc-200 dark:border-zinc-700 p-6 bg-zinc-50 dark:bg-zinc-900/50 overflow-y-auto">
                                    <h4 className="font-bold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
                                        <i className="fa-solid fa-flask"></i> Test Verileri
                                    </h4>
                                    <div className="space-y-4">
                                        {selectedPrompt.variables.map(v => (
                                            <div key={v}>
                                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">{v}</label>
                                                <input 
                                                    type="text" 
                                                    value={testVariables[v] || ''}
                                                    onChange={e => setTestVariables({...testVariables, [v]: e.target.value})}
                                                    className="w-full p-2 border rounded bg-white dark:bg-zinc-800 dark:border-zinc-600 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={handleRunSimulation} 
                                        disabled={isSimulating}
                                        className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-play"></i>}
                                        AI ile Test Et
                                    </button>
                                </div>

                                {/* Sim Output */}
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
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-wand-magic-sparkles text-6xl mb-4 opacity-20"></i>
                        <p>Düzenlemek için soldan bir şablon seçin veya yeni oluşturun.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
