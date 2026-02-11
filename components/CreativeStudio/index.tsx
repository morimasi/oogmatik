
import React, { useState, useEffect } from 'react';
import { refinePromptWithAI, generateCreativeStudioActivity, analyzeReferenceFiles } from '../../services/generators/creativeStudio';
import { PEDAGOGICAL_LIBRARY, ActivityLibraryItem } from '../../services/generators/promptLibrary';
import { MultimodalFile } from '../../services/geminiClient';
import { EditorPane } from './EditorPane';
import { LibraryPane } from './LibraryPane';
import { ControlPane } from './ControlPane';
import { SmartTooltip } from './components/SmartTooltip';

interface CreativeStudioProps {
    onResult: (data: any) => void;
    onCancel: () => void;
}

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
    // Shared State
    const [prompt, setPrompt] = useState("");
    const [difficulty, setDifficulty] = useState("Orta");
    const [itemCount, setItemCount] = useState(8);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
    const [status, setStatus] = useState("");
    const [statusIndex, setStatusIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'editor' | 'library'>('editor');
    
    // Custom Data States
    const [localLibrary, setLocalLibrary] = useState<ActivityLibraryItem[]>([]);
    const [snippets, setSnippets] = useState<any[]>([]);
    const [hoveredItem, setHoveredItem] = useState<ActivityLibraryItem | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [attachedFiles, setAttachedFiles] = useState<MultimodalFile[]>([]);

    // Initial Load
    useEffect(() => {
        const savedLib = localStorage.getItem('custom_pedagogical_lib');
        setLocalLibrary([...PEDAGOGICAL_LIBRARY, ...(savedLib ? JSON.parse(savedLib) : [])]);
        const savedSnippets = localStorage.getItem('custom_ai_snippets');
        if (savedSnippets) setSnippets(JSON.parse(savedSnippets));
    }, []);

    // Thinking Loop
    useEffect(() => {
        let interval: any;
        if (isProcessing) {
            interval = setInterval(() => setStatusIndex(prev => (prev + 1) % THINKING_MESSAGES.length), 4000);
        }
        return () => clearInterval(interval);
    }, [isProcessing]);

    const handleFilesSelect = async (files: FileList) => {
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
            const analysisResult = await analyzeReferenceFiles(combined, prompt);
            setPrompt(prev => prev.trim() ? `${prev}\n\n---\n\n${analysisResult}` : analysisResult);
            setStatus("Analiz tamamlandı.");
        } catch (e) {
            setStatus("Analiz başarısız.");
        } finally {
            setIsAnalyzingFile(false);
        }
    };

    const handleRefine = async (mode: 'expand' | 'clinical') => {
        setIsProcessing(true);
        try {
            const refined = await refinePromptWithAI(prompt, mode);
            setPrompt(refined);
        } finally { setIsProcessing(false); }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && attachedFiles.length === 0) return;
        setIsProcessing(true);
        try {
            const result = await generateCreativeStudioActivity(prompt, { difficulty, itemCount }, attachedFiles);
            onResult(Array.isArray(result) ? result : [result]);
        } catch (e) {
            setStatus("Hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full font-['Lexend'] relative">
            <SmartTooltip item={hoveredItem} pos={mousePos} />

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
                <div className="lg:col-span-8 flex flex-col gap-6 h-[750px]">
                    {activeTab === 'editor' ? (
                        <EditorPane 
                            prompt={prompt} setPrompt={setPrompt} attachedFiles={attachedFiles}
                            onFilesSelect={handleFilesSelect} onRemoveFile={(idx) => setAttachedFiles(f => f.filter((_, i) => i !== idx))}
                            onRefine={handleRefine} snippets={snippets} isAnalyzing={isAnalyzingFile}
                            onAddSnippet={() => {}} // Modal trigger logic here
                        />
                    ) : (
                        <LibraryPane 
                            items={localLibrary} onAddCustom={() => {}} 
                            onSelect={(item) => { setPrompt(item.basePrompt); setActiveTab('editor'); }}
                            onHover={(item, pos) => { setHoveredItem(item); setMousePos(pos); }}
                        />
                    )}
                </div>

                <div className="lg:col-span-4">
                    <ControlPane 
                        difficulty={difficulty} setDifficulty={setDifficulty}
                        itemCount={itemCount} setItemCount={setItemCount}
                        onGenerate={handleGenerate} onCancel={onCancel}
                        isProcessing={isProcessing} isAnalyzing={isAnalyzingFile}
                        status={status} statusMessage={THINKING_MESSAGES[statusIndex]}
                    />
                </div>
            </div>
        </div>
    );
};
