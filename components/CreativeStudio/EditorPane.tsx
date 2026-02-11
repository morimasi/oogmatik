
import React, { useRef } from 'react';
import { MultimodalFile } from '../../services/geminiClient';

interface EditorPaneProps {
    prompt: string;
    setPrompt: (val: string) => void;
    attachedFiles: MultimodalFile[];
    onFilesSelect: (files: FileList) => void;
    onRemoveFile: (index: number) => void;
    onRefine: (mode: 'expand' | 'clinical') => void;
    snippets: any[];
    isAnalyzing: boolean;
    onAddSnippet: () => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
    prompt, setPrompt, attachedFiles, onFilesSelect, onRemoveFile, onRefine, snippets, isAnalyzing, onAddSnippet
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Komut ve Analiz Sahası</span>
                <div className="flex gap-2">
                    <button onClick={() => onRefine('expand')} disabled={isAnalyzing || !prompt} className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-30">Genişlet</button>
                    <button onClick={() => onRefine('clinical')} disabled={isAnalyzing || !prompt} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30">Klinik Tanı Ekle</button>
                </div>
            </div>

            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`flex-1 w-full p-8 bg-black/40 border border-white/5 rounded-[2.5rem] text-lg leading-relaxed text-zinc-200 outline-none focus:border-indigo-500 transition-all font-mono resize-none shadow-inner ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                placeholder="Fikrinizi yazın veya dosya yükleyerek AI'nın teknik taslak çıkarmasını bekleyin..."
            ></textarea>

            {/* ATTACHED FILES LIST */}
            {attachedFiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3 p-4 bg-black/20 rounded-2xl border border-white/5">
                    {attachedFiles.map((file, idx) => (
                        <div key={idx} className="group relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-800">
                            {file.mimeType.startsWith('image/') ? (
                                <img src={file.data} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-rose-500">
                                    <i className="fa-solid fa-file-pdf text-xl"></i>
                                    <span className="text-[8px] font-black mt-1 uppercase">PDF</span>
                                </div>
                            )}
                            <button 
                                onClick={() => onRemoveFile(idx)}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <i className="fa-solid fa-times text-[10px] text-white"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Hızlı Ek İşlevler</h4>
                    <button onClick={onAddSnippet} className="text-[10px] font-bold text-indigo-500 hover:underline">+ Yeni İşlev Ekle</button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg">
                        <i className="fa-solid fa-paperclip"></i> DOSYA EKLE
                    </button>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFilesSelect(e.target.files)} className="hidden" accept="image/*,application/pdf" multiple />
                    
                    {snippets.map(s => (
                        <button key={s.id} onClick={() => setPrompt(prompt + "\n" + s.value)} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[11px] font-black uppercase transition-all">
                            + {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
