
import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { InteractiveStoryData, LayoutSectionId, LayoutItem, ReadingStudioConfig, ActivityType, Student } from '../../types';
import { generateInteractiveStory } from '../../services/generators/readingStudio';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import { printService } from '../../utils/printService';
import { worksheetService } from '../../services/worksheetService';
import { ImageDisplay, QUESTION_TYPES, StoryHighlighter } from '../sheets/common';
import { EditableText } from '../Editable';
import { ShareModal } from '../ShareModal';

// --- CONFIGURATION CONSTANTS ---
const SNAP_GRID = 5; 
const A4_WIDTH_PX = 794; 
const A4_HEIGHT_PX = 1123; 
const PAGE_BOTTOM_PADDING = 100; 

// --- DEFINITIONS & DEFAULTS ---

interface ComponentDefinition {
    id: LayoutSectionId;
    label: string;
    defaultTitle: string;
    icon: string;
    description: string;
    defaultStyle: Partial<LayoutItem['style']>;
}

interface ActiveComponent extends LayoutItem {
    customTitle?: string;
    customIcon?: string;
    themeColor?: string;
    instanceId: string;
    icon: string;
}

interface SavedTemplate {
    id: string;
    name: string;
    createdAt: string;
    layout: ActiveComponent[];
}

const DEFAULT_STYLE_BASE: LayoutItem['style'] = {
    x: 20, y: 20, w: 754, h: 100, zIndex: 1, rotation: 0,
    padding: 10,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderStyle: 'solid',
    borderRadius: 0,
    opacity: 1,
    boxShadow: 'none',
    textAlign: 'left',
    color: '#000000',
    fontSize: 14,
    fontFamily: 'OpenDyslexic',
    lineHeight: 1.5,
    letterSpacing: 0,
    imageSettings: {
        enabled: true,
        position: 'right',
        widthPercent: 40,
        opacity: 1,
        objectFit: 'cover',
        borderRadius: 8,
        blendMode: 'normal',
        filter: 'none'
    }
};

const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
    { id: 'header', label: 'Başlık Künyesi', defaultTitle: 'HİKAYE KÜNYESİ', icon: 'fa-heading', description: 'Başlık, tür ve tarih alanı.', defaultStyle: { h: 120 } },
    { id: 'tracker', label: 'Okuma Takipçisi', defaultTitle: 'OKUMA TAKİBİ', icon: 'fa-eye', description: 'Okuma sayısını işaretleme alanı.', defaultStyle: { h: 60, w: 200 } },
    { id: 'story_block', label: 'Hikaye Metni', defaultTitle: 'OKUMA METNİ', icon: 'fa-book-open', description: 'Ana metin ve görsel alanı.', defaultStyle: { h: 400 } },
    { id: 'vocabulary', label: 'Sözlükçe', defaultTitle: 'SÖZLÜKÇE', icon: 'fa-spell-check', description: 'Zor kelimeler ve anlamları.', defaultStyle: { h: 150 } },
    { id: 'questions_5n1k', label: '5N 1K Analizi', defaultTitle: '5N 1K SORULARI', icon: 'fa-circle-question', description: 'Kim, Ne, Nerede soruları.', defaultStyle: { w: 754, h: 300 } },
    { id: 'questions_test', label: 'Test Soruları', defaultTitle: 'DEĞERLENDİRME', icon: 'fa-list-check', description: 'Çoktan seçmeli sorular.', defaultStyle: { w: 754, h: 300 } },
    { id: 'questions_inference', label: 'Derin Analiz', defaultTitle: 'DERİN ANALİZ', icon: 'fa-brain', description: 'Çıkarım ve yorum soruları.', defaultStyle: { h: 150 } },
    { id: 'creative', label: 'Yaratıcı Alan', defaultTitle: 'YARATICI ALAN', icon: 'fa-paintbrush', description: 'Çizim ve yazma alanı.', defaultStyle: { h: 200 } },
    { id: 'notes', label: 'Not Alanı', defaultTitle: 'NOTLAR', icon: 'fa-note-sticky', description: 'Boş not satırları.', defaultStyle: { h: 100 } },
];

const AutoContentWrapper = ({ children, onSizeChange, enabled }: { children?: React.ReactNode, onSizeChange: (h: number) => void, enabled: boolean }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const lastHeight = useRef<number>(0);

    useLayoutEffect(() => {
        if (!enabled || !contentRef.current) return;
        const observer = new ResizeObserver(() => {
            if (!contentRef.current) return;
            const currentContentHeight = contentRef.current.scrollHeight;
            if (Math.abs(currentContentHeight - lastHeight.current) > 2) {
                 lastHeight.current = currentContentHeight;
                 onSizeChange(currentContentHeight);
            }
        });
        observer.observe(contentRef.current);
        return () => observer.disconnect();
    }, [onSizeChange, enabled]);

    return (
        <div className="w-full h-full overflow-hidden">
            <div ref={contentRef} className="w-full h-auto min-h-full">
                {children}
            </div>
        </div>
    );
};

export const ReadingStudio: React.FC<ReadingStudioProps> = ({ onBack, onAddToWorkbook }) => {
    const { user } = useAuth();
    const { students, setActiveStudent, activeStudent } = useStudent();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'settings' | 'library' | 'templates'>('settings');
    const [layout, setLayout] = useState<ActiveComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);
    const [smartFlow, setSmartFlow] = useState(true); 
    
    const [config, setConfig] = useState<ReadingStudioConfig>({
        gradeLevel: '3. Sınıf', studentName: '', topic: '', genre: 'Macera', tone: 'Eğlenceli',
        length: 'medium', layoutDensity: 'comfortable', textComplexity: 'moderate',
        fontSettings: { family: 'OpenDyslexic', size: 16, lineHeight: 1.8, letterSpacing: 1, wordSpacing: 2 },
        includeImage: true, imageSize: 40, imageOpacity: 100, imagePosition: 'right',
        imageGeneration: { enabled: true, style: 'storybook', complexity: 'simple' },
        include5N1K: true, countMultipleChoice: 3, countTrueFalse: 2, countFillBlanks: 2, countLogic: 1, countInference: 1, 
        focusVocabulary: true, includeCreativeTask: true, includeWordHunt: false, includeSpellingCheck: false,
        showReadingTracker: false, showSelfAssessment: false, showTeacherNotes: false, showDateSection: true
    });

    const [templates, setTemplates] = useState<SavedTemplate[]>([]);
    const [templateName, setTemplateName] = useState("");
    const [canvasScale, setCanvasScale] = useState(0.85);
    const canvasRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const data = await generateInteractiveStory(config);
            setStoryData(data);
        } catch (e) { alert("Hata oluştu."); } finally { setIsLoading(false); }
    };

    const handleAutoResize = useCallback((instanceId: string, h: number) => {
        if (!smartFlow) return;
        setLayout(prev => prev.map(item => item.instanceId === instanceId ? { ...item, style: { ...item.style, h: Math.max(50, h) } } : item));
    }, [smartFlow]);

    const handlePrint = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        try { await printService.generatePdf('#canvas-root', 'Hikaye', { action }); } finally { setIsPrinting(false); }
    };

    return (
        <div className="h-full flex flex-col bg-[#121214] overflow-hidden text-zinc-100 absolute inset-0 z-50">
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight"><i className="fa-solid fa-book-open text-indigo-500"></i> Reading Studio</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleGenerate} disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 disabled:opacity-50">
                        {isLoading ? "Üretiliyor..." : "AI ile Üret"}
                    </button>
                    <button onClick={() => handlePrint('print')} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white"><i className="fa-solid fa-print"></i></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-80 bg-[#18181b] border-r border-zinc-800 p-6 overflow-y-auto">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Hikaye Ayarları</h4>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Tema / Konu</label>
                            <input type="text" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Sınıf Seviyesi</label>
                            <select value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white">
                                {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>
                </aside>

                <main className="flex-1 bg-black/40 overflow-auto p-12 custom-scrollbar flex justify-center">
                    <div id="canvas-root" className="bg-white text-black shadow-2xl origin-top transition-transform" style={{ width: A4_WIDTH_PX, minHeight: A4_HEIGHT_PX, padding: '20mm' }}>
                        {storyData ? (
                            <div className="space-y-8">
                                <h1 className="text-4xl font-black uppercase border-b-4 border-black pb-4">{storyData.title}</h1>
                                <div className="prose max-w-none text-xl leading-relaxed text-justify font-dyslexic">
                                    {storyData.story.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-dashed">
                                    <div>
                                        <h3 className="font-bold mb-4 uppercase">5N 1K Analizi</h3>
                                        {storyData.fiveW1H.map((q, i) => (
                                            <div key={i} className="mb-4">
                                                <p className="font-bold text-sm">{q.question}</p>
                                                <div className="h-6 border-b border-dashed border-zinc-300"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-4 uppercase">Kelime Dağarcığı</h3>
                                        {storyData.vocabulary?.map((v, i) => (
                                            <p key={i} className="text-sm mb-2"><strong>{v.word}:</strong> {v.definition}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-300 opacity-20 py-40">
                                <i className="fa-solid fa-book-open text-8xl mb-6"></i>
                                <p className="text-xl font-bold uppercase tracking-widest">İçerik bekleniyor...</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

interface ReadingStudioProps {
    onBack: () => void;
    onAddToWorkbook?: (data: any) => void;
}
