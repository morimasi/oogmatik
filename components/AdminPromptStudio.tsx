
import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '../types/admin';
import { adminService } from '../services/adminService';

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadPrompts();
    }, []);

    const loadPrompts = async () => {
        const data = await adminService.getAllPrompts();
        setPrompts(data);
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;
        setIsSaving(true);
        await adminService.savePrompt(selectedPrompt);
        // Refresh local list
        setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? selectedPrompt : p));
        setIsSaving(false);
        alert("Prompt kaydedildi.");
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

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-64 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden shadow-sm shrink-0">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100">Prompt Şablonları</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {prompts.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPrompt(p)}
                            className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all ${selectedPrompt?.id === p.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}
                        >
                            <div className="font-bold truncate">{p.name}</div>
                            <div className="text-xs opacity-70 truncate">{p.id}</div>
                        </button>
                    ))}
                </div>
                <div className="p-3 border-t border-zinc-200 dark:border-zinc-700">
                    <button className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold rounded-lg text-xs">+ Yeni Şablon</button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col overflow-hidden">
                {selectedPrompt ? (
                    <>
                        {/* Editor Toolbar */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <div>
                                <input 
                                    type="text" 
                                    value={selectedPrompt.name} 
                                    onChange={e => setSelectedPrompt({...selectedPrompt, name: e.target.value})}
                                    className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 text-zinc-800 dark:text-white"
                                />
                                <input 
                                    type="text" 
                                    value={selectedPrompt.description} 
                                    onChange={e => setSelectedPrompt({...selectedPrompt, description: e.target.value})}
                                    className="text-xs text-zinc-500 bg-transparent border-none focus:ring-0 p-0 w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                                    {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} Kaydet
                                </button>
                            </div>
                        </div>

                        {/* Variables Bar */}
                        <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700/30 border-b border-zinc-200 dark:border-zinc-700 flex gap-2 overflow-x-auto">
                            <span className="text-xs font-bold text-zinc-400 self-center uppercase mr-2">Değişkenler:</span>
                            {selectedPrompt.variables.map(v => (
                                <button 
                                    key={v} 
                                    onClick={() => insertVariable(v)}
                                    className="px-2 py-1 bg-white dark:bg-zinc-600 border border-zinc-300 dark:border-zinc-500 rounded text-xs font-mono text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 transition-colors"
                                >
                                    {`{{${v}}}`}
                                </button>
                            ))}
                            <button className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 border border-dashed border-zinc-300 rounded">+ Ekle</button>
                        </div>

                        {/* Code Editor */}
                        <div className="flex-1 relative">
                            <textarea
                                id="prompt-editor"
                                value={selectedPrompt.template}
                                onChange={e => setSelectedPrompt({...selectedPrompt, template: e.target.value})}
                                className="w-full h-full p-6 font-mono text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 outline-none resize-none"
                                spellCheck={false}
                            ></textarea>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-terminal text-6xl mb-4 opacity-20"></i>
                        <p>Düzenlemek için soldan bir şablon seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
