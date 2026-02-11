
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PromptTemplate, PromptSnippet, PromptVersion } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../constants';
import { ActivityType } from '../types';

// --- STYLED COMPONENTS ---

const CodeEditor = ({ value, onChange, readOnly = false }: { value: string, onChange?: (v: string) => void, readOnly?: boolean }) => {
    const preRef = useRef<HTMLPreElement>(null);
    const textRef = useRef<HTMLTextAreaElement>(null);

    const highlight = (code: string) => {
        return code
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/(\{\{)(.*?)(\}\})/g, '<span class="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">$1$2$3</span>')
            .replace(/\[(.*?)\]/g, '<span class="text-emerald-400 font-black">[$1]</span>')
            .replace(/(GÖREV:|ROL:|KURALLAR:|ÇIKTI:)/g, '<span class="text-rose-400 font-black border-b border-rose-500/20">$1</span>')
            .replace(/"(.*?)"/g, '<span class="text-sky-300">"$1"</span>');
    };

    const syncScroll = () => {
        if (preRef.current && textRef.current) {
            preRef.current.scrollTop = textRef.current.scrollTop;
            preRef.current.scrollLeft = textRef.current.scrollLeft;
        }
    };

    return (
        <div className="relative w-full h-full bg-[#0d0d0f] rounded-2xl border border-zinc-800 overflow-hidden font-mono text-sm shadow-2xl group">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#121214] border-r border-zinc-800 flex flex-col items-center pt-5 text-zinc-600 select-none text-[10px]">
                {value.split('\n').map((_, i) => <div key={i} className="h-6">{i + 1}</div>)}
            </div>
            <pre ref={preRef} className="absolute inset-0 left-12 p-5 m-0 pointer-events-none whitespace-pre-wrap break-words leading-6 overflow-hidden">
                <code dangerouslySetInnerHTML={{ __html: highlight(value) }} />
            </pre>
            <textarea
                ref={textRef}
                value={value}
                onChange={e => onChange?.(e.target.value)}
                onScroll={syncScroll}
                readOnly={readOnly}
                spellCheck={false}
                className="absolute inset-0 left-12 w-[calc(100%-48px)] p-5 m-0 bg-transparent text-transparent caret-white outline-none resize-none leading-6 whitespace-pre-wrap break-words selection:bg-indigo-500/30"
            />
        </div>
    );
};

export const AdminPromptStudio: React.FC = () => {
    const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
    const [selected, setSelected] = useState<PromptTemplate | null>(null);
    const [snippets, setSnippets] = useState<PromptSnippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [testVars, setTestVars] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'test'>('editor');
    const [simResult, setSimResult] = useState<string>('');
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        const [p, s] = await Promise.all([adminService.getAllPrompts(), adminService.getAllSnippets()]);
        setPrompts(p);
        setSnippets(s);
        setLoading(false);
    };

    const variables = useMemo(() => {
        if (!selected) return [];
        const matches = selected.template.match(/\{\{(.*?)\}\}/g);
        return matches ? [...new Set(matches.map(m => m.replace(/\{|\}/g, '')))] : [];
    }, [selected?.template]);

    const handleSelect = async (act: any) => {
        const id = `prompt_${act.id.toLowerCase()}`;
        let p = prompts.find(x => x.id === id);
        if (!p) {
            p = {
                id, name: `${act.title} Prompt`, description: '', category: 'custom',
                systemInstruction: 'Sen bir özel eğitim uzmanısın.',
                template: adminService.getInitialPromptForActivity(act.id),
                variables: [], tags: [], updatedAt: new Date().toISOString(), version: 1, history: [],
                modelConfig: { temperature: 0.1, modelName: 'gemini-3-flash-preview', thinkingBudget: 0 }
            };
        }
        setSelected(p);
        setSimResult('');
        setActiveTab('editor');
    };

    const handleSave = async () => {
        if (!selected) return;
        const note = prompt("Değişiklik özeti:", "Optimizasyon yapıldı.");
        if (note === null) return;
        setIsSaving(true);
        try {
            const saved = await adminService.savePrompt({ ...selected, variables }, note);
            setPrompts(prev => prev.map(p => p.id === saved.id ? saved : p));
            setSelected(saved);
            alert("Mimarideki değişiklikler yayına alındı.");
        } finally { setIsSaving(false); }
    };

    const handleSimulate = async () => {
        if (!selected) return;
        setIsSimulating(true);
        setSimResult('');
        try {
            const result = await adminService.testPrompt(selected, testVars);
            setSimResult(JSON.stringify(result, null, 2));
        } catch (e: any) {
            setSimResult(`HATA: ${e.message}`);
        } finally { setIsSimulating(false); }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-[#09090b] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl font-lexend">
            {/* 1. EXPLORER (LEFT) */}
            <div className="w-64 border-r border-zinc-800 bg-[#0d0d0f] flex flex-col shrink-0">
                <div className="p-4 border-b border-zinc-800 bg-black/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Kütüphane</span>
                    <i className="fa-solid fa-folder-tree text-zinc-700"></i>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {ACTIVITY_CATEGORIES.map(cat => (
                        <div key={cat.id} className="mb-2">
                            <div className="px-3 py-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-tighter flex items-center gap-2">
                                <i className={cat.icon}></i> {cat.title}
                            </div>
                            {ACTIVITIES.filter(a => cat.activities.includes(a.id)).map(act => (
                                <button
                                    key={act.id}
                                    onClick={() => handleSelect(act)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selected?.id === `prompt_${act.id.toLowerCase()}` ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${selected?.id === `prompt_${act.id.toLowerCase()}` ? 'bg-white animate-pulse' : 'bg-zinc-700'}`}></div>
                                    <span className="truncate">{act.title}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. EDITOR (CENTER) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0f] relative">
                {selected ? (
                    <>
                        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#121214] shrink-0">
                            <div className="flex items-center gap-4">
                                <h3 className="font-black text-sm text-zinc-100 uppercase tracking-widest">{selected.name}</h3>
                                <span className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-mono text-indigo-400">v{selected.version}</span>
                            </div>
                            <div className="flex gap-2">
                                {['editor', 'history', 'test'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setActiveTab(t as any)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                    >
                                        {t === 'editor' ? 'Mimari' : t === 'history' ? 'Geçmiş' : 'Simülasyon'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 p-6 relative overflow-hidden">
                            {activeTab === 'editor' && (
                                <div className="h-full flex flex-col gap-6">
                                    <div className="h-2/3"><CodeEditor value={selected.template} onChange={v => setSelected({...selected, template: v})} /></div>
                                    <div className="h-1/3 bg-zinc-900/30 rounded-2xl border border-zinc-800 p-5 overflow-y-auto">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Sistem Yönergesi (System Persona)</h4>
                                        <textarea 
                                            value={selected.systemInstruction} 
                                            onChange={e => setSelected({...selected, systemInstruction: e.target.value})}
                                            className="w-full h-24 bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-400 outline-none focus:border-indigo-500 resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="h-full space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                    {[...(selected.history || [])].reverse().map((h, i) => (
                                        <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex justify-between items-center group hover:border-indigo-500/50 transition-all">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xs font-black text-indigo-400">Versiyon {h.version}</span>
                                                    <span className="text-[10px] text-zinc-600 font-mono">{new Date(h.updatedAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-zinc-400 italic">"{h.changeLog}"</p>
                                            </div>
                                            <button 
                                                onClick={() => { if(confirm('Eski sürüme dönülsün mü?')) setSelected({...selected, template: h.template, systemInstruction: h.systemInstruction || selected.systemInstruction }); }}
                                                className="px-4 py-1.5 bg-zinc-800 hover:bg-indigo-600 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >GERİ YÜKLE</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'test' && (
                                <div className="h-full flex flex-col gap-6">
                                    <div className="grid grid-cols-2 gap-6 shrink-0">
                                        <div className="p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Değişken Enjeksiyonu</h4>
                                            <div className="space-y-3">
                                                {variables.map(v => (
                                                    <div key={v} className="flex flex-col gap-1">
                                                        <label className="text-[9px] font-bold text-zinc-500 uppercase">{v}</label>
                                                        <input 
                                                            type="text" value={testVars[v] || ''} 
                                                            onChange={e => setTestVars({...testVars, [v]: e.target.value})}
                                                            className="bg-black border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 outline-none focus:border-amber-500"
                                                        />
                                                    </div>
                                                ))}
                                                {variables.length === 0 && <p className="text-xs text-zinc-600 italic">Değişken tespit edilmedi.</p>}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-indigo-900/10 rounded-2xl border border-indigo-900/30 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Model Parametreleri</h4>
                                                <div className="space-y-4">
                                                     <div>
                                                        <label className="flex justify-between text-[9px] font-bold text-zinc-500 mb-1 uppercase">Yaratıcılık (Temp): {selected.modelConfig?.temperature}</label>
                                                        <input type="range" min="0" max="1" step="0.1" value={selected.modelConfig?.temperature || 0.1} onChange={e => setSelected({...selected, modelConfig: {...selected.modelConfig, temperature: parseFloat(e.target.value)}})} className="w-full h-1 bg-zinc-800 appearance-none accent-indigo-500 rounded" />
                                                     </div>
                                                     <div>
                                                        <label className="flex justify-between text-[9px] font-bold text-zinc-500 mb-1 uppercase">Thinking Budget: {selected.modelConfig?.thinkingBudget || 0}</label>
                                                        <select value={selected.modelConfig?.thinkingBudget || 0} onChange={e => setSelected({...selected, modelConfig: {...selected.modelConfig, thinkingBudget: Number(e.target.value)}})} className="w-full bg-black border border-zinc-800 rounded p-1.5 text-xs text-zinc-400">
                                                            <option value={0}>Devre Dışı</option>
                                                            <option value={4000}>Standart (4K)</option>
                                                            <option value={16000}>Derin Analiz (16K)</option>
                                                            <option value={32000}>Ultra Derin (32K)</option>
                                                        </select>
                                                     </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={handleSimulate} 
                                                disabled={isSimulating}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs shadow-xl transition-all disabled:opacity-50"
                                            >
                                                {isSimulating ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-play mr-2"></i>}
                                                SİMÜLASYONU BAŞLAT
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-black rounded-2xl border border-zinc-800 overflow-hidden"><CodeEditor value={simResult} readOnly /></div>
                                </div>
                            )}
                        </div>

                        <div className="h-16 border-t border-zinc-800 bg-[#121214] flex items-center px-6 justify-between shrink-0">
                            <p className="text-[10px] text-zinc-500 font-medium">Son Güncelleme: {new Date(selected.updatedAt).toLocaleString()}</p>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-xs shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {isSaving ? 'SİSTEME İŞLENİYOR...' : 'DEĞİŞİKLİKLERİ YAYINLA'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 p-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl mb-6 shadow-inner"><i className="fa-solid fa-terminal animate-pulse"></i></div>
                        <h3 className="text-2xl font-black text-zinc-300 mb-2 uppercase tracking-tighter">AI Mimari Stüdyosu</h3>
                        <p className="max-w-xs text-sm leading-relaxed">Etkinliklerin üretim mantığını ve yapay zeka parametrelerini yönetmek için sol menüden bir modül seçin.</p>
                    </div>
                )}
            </div>

            {/* 3. SNIPPET BOX (RIGHT) */}
            <div className="w-80 border-l border-zinc-800 bg-[#0d0d0f] flex flex-col shrink-0">
                <div className="p-4 border-b border-zinc-800 bg-black/20 flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pedagojik Snippetlar</span>
                    <button onClick={() => setSnippets([...snippets, { id: `new_${Date.now()}`, label: 'Yeni Parça', value: '...' }])} className="text-indigo-500 hover:text-white transition-colors"><i className="fa-solid fa-plus-circle"></i></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {snippets.map(s => (
                        <div key={s.id} className="group p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl relative hover:border-indigo-500/50 transition-all cursor-copy" onClick={() => selected && setSelected({...selected, template: selected.template + "\n\n" + s.value })}>
                            <h5 className="text-[10px] font-black text-zinc-400 mb-1 uppercase truncate pr-4">{s.label}</h5>
                            <p className="text-[9px] text-zinc-600 line-clamp-2 italic">"{s.value.substring(0, 100)}..."</p>
                            <button onClick={(e) => { e.stopPropagation(); const val = prompt("Yönerge:", s.value); if(val) adminService.saveSnippet({...s, value: val}); }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all"><i className="fa-solid fa-pen text-[9px]"></i></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
