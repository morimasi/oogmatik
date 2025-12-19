
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { InteractiveStoryData, LayoutSectionId, LayoutItem, ReadingStudioConfig } from '../../types';
import { generateInteractiveStory } from '../../services/generators/readingStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { ImageDisplay, QUESTION_TYPES, StoryHighlighter } from '../sheets/common';
import { EditableText } from '../Editable';

// --- CONFIGURATION CONSTANTS ---
const SNAP_GRID = 5; 
const A4_WIDTH_PX = 794; 
const A4_HEIGHT_PX = 1123; 
const PAGE_BOTTOM_PADDING = 60; 

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
}

const DEFAULT_STYLE_BASE: LayoutItem['style'] = {
    x: 20, y: 20, w: 754, h: 100, zIndex: 1, rotation: 0,
    padding: 15,
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
    lineHeight: 1.6,
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
    { id: 'story_block', label: 'Hikaye Metni', defaultTitle: 'OKUMA METNİ', icon: 'fa-book-open', description: 'Ana metin ve görsel alanı.', defaultStyle: { h: 450 } },
    { id: 'vocabulary', label: 'Sözlükçe', defaultTitle: 'SÖZLÜKÇE', icon: 'fa-spell-check', description: 'Zor kelimeler ve anlamları.', defaultStyle: { h: 180 } },
    { id: 'questions_5n1k', label: '5N 1K Analizi', defaultTitle: '5N 1K SORULARI', icon: 'fa-circle-question', description: 'Kim, Ne, Nerede soruları.', defaultStyle: { h: 320 } },
    { id: 'questions_test', label: 'Test Soruları', defaultTitle: 'DEĞERLENDİRME TESTİ', icon: 'fa-list-check', description: 'Çoktan seçmeli sorular.', defaultStyle: { h: 300 } },
    { id: 'questions_tf', label: 'Doğru / Yanlış', defaultTitle: 'DOĞRU MU? YANLIŞ MI?', icon: 'fa-check-double', description: 'İşaretleme soruları.', defaultStyle: { h: 200 } },
    { id: 'questions_fill', label: 'Boşluk Doldurma', defaultTitle: 'EKSİK KELİMEYİ BUL', icon: 'fa-pen-clip', description: 'Metne dayalı tamamlama.', defaultStyle: { h: 200 } },
    { id: 'questions_logic', label: 'Mantık Sorusu', defaultTitle: 'MANTIKSAL AKIL YÜRÜTME', icon: 'fa-brain', description: 'Analitik düşünme soruları.', defaultStyle: { h: 150 } },
    { id: 'questions_inference', label: 'Çıkarım Analizi', defaultTitle: 'DERİN ANALİZ', icon: 'fa-magnifying-glass-chart', description: 'Satır arası yorumlama.', defaultStyle: { h: 150 } },
    { id: 'creative', label: 'Yaratıcı Atölye', defaultTitle: 'YARATICI ALAN', icon: 'fa-paintbrush', description: 'Çizim ve hayal gücü alanı.', defaultStyle: { h: 220 } },
    { id: 'notes', label: 'Not Alanı', defaultTitle: 'NOTLARIM', icon: 'fa-note-sticky', description: 'Boş not satırları.', defaultStyle: { h: 100 } },
];

const ResizeHandle = ({ cursor, position, onMouseDown }: { cursor: string, position: string, onMouseDown: (e: React.MouseEvent) => void }) => (
    <div className={`absolute w-3 h-3 bg-amber-500 border border-white rounded-full z-50 hover:scale-150 transition-transform ${position}`} style={{ cursor }} onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }} />
);

const RotateHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-800 border border-amber-500 rounded-full z-50 hover:bg-amber-500 hover:text-black text-amber-500 flex items-center justify-center cursor-alias shadow-sm transition-all" onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }} title="Döndür">
        <i className="fa-solid fa-rotate text-[10px]"></i>
    </div>
);

// --- SETTINGS PANELS ---
const TypographyControls = ({ style, onUpdate }: { style: any, onUpdate: (k: string, v: any) => void }) => (
    <div className="space-y-4">
        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Yazı Tipi</label>
                <select value={style.fontFamily} onChange={e => onUpdate('fontFamily', e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-amber-500">
                    <option value="OpenDyslexic">OpenDyslexic</option>
                    <option value="Lexend">Lexend</option>
                    <option value="Comic Neue">Comic Neue</option>
                </select>
            </div>
             <div className="w-20">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Boyut</label>
                <input type="number" value={style.fontSize} onChange={e => onUpdate('fontSize', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 outline-none" />
            </div>
        </div>
        <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Metin Rengi</label>
            <input type="color" value={style.color} onChange={e => onUpdate('color', e.target.value)} className="w-full h-8 p-1 bg-zinc-800 border border-zinc-700 rounded cursor-pointer" />
        </div>
    </div>
);

const LookControls = ({ style, onUpdate }: { style: any, onUpdate: (k: string, v: any) => void }) => (
    <div className="space-y-4">
        <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Arka Plan</label>
            <div className="flex gap-2">
                <input type="color" value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor} onChange={e => onUpdate('backgroundColor', e.target.value)} className="flex-1 h-8 p-1 bg-zinc-800 border border-zinc-700 rounded cursor-pointer" />
                <button onClick={() => onUpdate('backgroundColor', 'transparent')} className={`px-2 text-[10px] rounded border ${style.backgroundColor === 'transparent' ? 'bg-amber-500 text-black' : 'text-zinc-500'}`}>Şeffaf</button>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Kenarlık Kalınlık</label>
                <input type="number" value={style.borderWidth} onChange={e => onUpdate('borderWidth', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs" />
            </div>
            <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Köşe Yuvarlaklığı</label>
                <input type="number" value={style.borderRadius} onChange={e => onUpdate('borderRadius', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs" />
            </div>
        </div>
    </div>
);

const SpecificContentEditor = ({ item, onUpdateSpecific }: { item: ActiveComponent, onUpdateSpecific: (data: any) => void }) => {
    const data = item.specificData || {};
    
    if (item.id === 'header') {
        return (
            <div className="space-y-3">
                <input type="text" value={data.title || ''} onChange={e => onUpdateSpecific({...data, title: e.target.value})} className="w-full p-2 bg-zinc-800 rounded text-sm" placeholder="Başlık" />
                <input type="text" value={data.subtitle || ''} onChange={e => onUpdateSpecific({...data, subtitle: e.target.value})} className="w-full p-2 bg-zinc-800 rounded text-sm" placeholder="Alt Başlık" />
            </div>
        );
    }
    
    if (item.id === 'story_block') {
        return <textarea value={data.text || ''} onChange={e => onUpdateSpecific({...data, text: e.target.value})} className="w-full h-64 p-2 bg-zinc-800 rounded text-xs font-mono leading-relaxed" placeholder="Hikaye metni..." />;
    }

    if (item.id.startsWith('questions') || item.id === 'vocabulary') {
        const list = data.questions || data.items || [];
        return (
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {list.map((q: any, i: number) => (
                    <div key={i} className="p-2 bg-zinc-800 rounded border border-zinc-700">
                        <textarea value={q.text || q.word || q.question || ''} onChange={e => {
                            const newList = [...list];
                            if (q.text !== undefined) newList[i].text = e.target.value;
                            else if (q.word !== undefined) newList[i].word = e.target.value;
                            else if (q.question !== undefined) newList[i].question = e.target.value;
                            onUpdateSpecific(data.questions ? {...data, questions: newList} : {...data, items: newList});
                        }} className="w-full bg-transparent text-xs resize-none outline-none" rows={2} />
                    </div>
                ))}
            </div>
        );
    }

    return <div className="text-zinc-500 text-[10px] italic">Bileşen verisi bu sekmeden manuel düzenlenebilir.</div>;
};

const SettingsStation = ({ item, onUpdate, onClose, onDelete }: { item: ActiveComponent, onUpdate: (updates: Partial<ActiveComponent>) => void, onClose: () => void, onDelete: () => void }) => {
    const [tab, setTab] = useState<'content' | 'look' | 'text'>('content');
    return (
        <div className="w-80 h-full bg-[#1e1e21] border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-[#2d2d32] border-b border-zinc-700 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-300 flex items-center gap-2"><i className={`fa-solid ${item.icon} text-amber-500`}></i> {item.label}</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="flex border-b border-zinc-700 bg-[#1e1e21]">
                {['content', 'look', 'text'].map(t => (
                    <button key={t} onClick={() => setTab(t as any)} className={`flex-1 py-3 text-[10px] font-bold uppercase ${tab === t ? 'text-amber-500 border-b-2 border-amber-500 bg-zinc-800/50' : 'text-zinc-500'}`}>{t === 'content' ? 'İçerik' : t === 'look' ? 'Stil' : 'Yazı'}</button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {tab === 'content' && <SpecificContentEditor item={item} onUpdateSpecific={(d) => onUpdate({specificData: d})} />}
                {tab === 'look' && <LookControls style={item.style} onUpdate={(k, v) => onUpdate({style: {...item.style, [k]: v}})} />}
                {tab === 'text' && <TypographyControls style={item.style} onUpdate={(k, v) => onUpdate({style: {...item.style, [k]: v}})} />}
            </div>
            <div className="p-4 border-t border-zinc-700">
                <button onClick={onDelete} className="w-full py-2 bg-red-900/20 text-red-500 rounded font-bold text-xs"><i className="fa-solid fa-trash mr-2"></i> Bileşeni Sil</button>
            </div>
        </div>
    );
};

export const ReadingStudio: React.FC<any> = ({ onBack, onAddToWorkbook }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [layout, setLayout] = useState<ActiveComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'settings' | 'layers'>('settings');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [config, setConfig] = useState<ReadingStudioConfig>({
        gradeLevel: '3. Sınıf', studentName: '', topic: '', genre: 'Macera', tone: 'Eğlenceli',
        length: 'medium', layoutDensity: 'comfortable', textComplexity: 'moderate',
        fontSettings: { family: 'OpenDyslexic', size: 16, lineHeight: 1.8, letterSpacing: 1, wordSpacing: 2 },
        includeImage: true, imageSize: 40, imageOpacity: 100, imagePosition: 'right',
        imageGeneration: { enabled: true, style: 'storybook', complexity: 'simple' },
        include5N1K: true, countMultipleChoice: 3, countTrueFalse: 3, countFillBlanks: 3, countLogic: 1, countInference: 1, 
        focusVocabulary: true, includeCreativeTask: true, includeWordHunt: false, includeSpellingCheck: false,
        showReadingTracker: true, showSelfAssessment: false, showTeacherNotes: false, showDateSection: true
    });

    const [canvasScale, setCanvasScale] = useState(0.8);
    const [canvasPos, setCanvasPos] = useState({ x: 0, y: 50 });
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<any>(null);

    const contentHeight = useMemo(() => {
        if (layout.length === 0) return A4_HEIGHT_PX;
        const maxY = Math.max(...layout.map(item => item.style.y + item.style.h));
        return Math.max(A4_HEIGHT_PX, maxY + PAGE_BOTTOM_PADDING);
    }, [layout]);

    // --- INITIAL LAYOUT GENERATOR ---
    useEffect(() => {
        const items: ActiveComponent[] = [];
        let curY = 30;
        
        COMPONENT_DEFINITIONS.forEach((def, i) => {
            items.push({
                ...def,
                instanceId: `item-${def.id}-${i}`,
                style: { ...DEFAULT_STYLE_BASE, ...def.defaultStyle, y: curY, zIndex: i + 1 },
                isVisible: i < 5, // Sadece ilk 5 bileşeni varsayılan açık getir
                specificData: null
            });
            curY += (def.defaultStyle.h || 100) + 20;
        });
        setLayout(items);
        
        // Centering
        if (canvasRef.current) {
            const initialX = (canvasRef.current.clientWidth - (A4_WIDTH_PX * 0.8)) / 2;
            setCanvasPos({ x: initialX, y: 40 });
        }
    }, []);

    // --- DATA SYNC (AI TO UI) ---
    useEffect(() => {
        if (!storyData) return;
        setLayout(prev => prev.map(item => {
            let specificData = null;
            let isVisible = item.isVisible;

            switch(item.id) {
                case 'header': specificData = { title: storyData.title, subtitle: `${storyData.genre} | ${storyData.gradeLevel}` }; break;
                case 'story_block': specificData = { text: storyData.story, imagePrompt: storyData.imagePrompt }; break;
                case 'vocabulary': specificData = { items: storyData.vocabulary }; isVisible = config.focusVocabulary; break;
                case 'questions_5n1k': specificData = { questions: storyData.fiveW1H }; isVisible = config.include5N1K; break;
                case 'questions_test': specificData = { questions: storyData.multipleChoice }; isVisible = config.countMultipleChoice > 0; break;
                case 'questions_tf': specificData = { questions: storyData.trueFalse }; isVisible = config.countTrueFalse > 0; break;
                case 'questions_fill': specificData = { questions: storyData.fillBlanks }; isVisible = config.countFillBlanks > 0; break;
                case 'questions_logic': specificData = { questions: storyData.logicQuestions }; isVisible = config.countLogic > 0; break;
                case 'questions_inference': specificData = { questions: storyData.inferenceQuestions }; isVisible = config.countInference > 0; break;
                case 'creative': specificData = { text: storyData.creativeTask }; isVisible = config.includeCreativeTask; break;
                case 'tracker': isVisible = config.showReadingTracker; break;
            }
            return { ...item, specificData, isVisible };
        }));
    }, [storyData, config]);

    // --- INTERACTION HANDLERS ---
    const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.2, canvasScale + delta), 3);
        setCanvasScale(newScale);
    }, [canvasScale]);

    const handleMouseDown = (e: React.MouseEvent, id: string, mode: 'drag'|'resize'|'rotate' = 'drag', handle?: string) => {
        if (!designMode) return;
        e.stopPropagation();
        const item = layout.find(l => l.instanceId === id);
        if (!item) return;
        setSelectedId(id);
        
        let cx = 0, cy = 0;
        if (mode === 'rotate') {
             const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
             cx = rect.left + rect.width / 2; cy = rect.top + rect.height / 2;
        }

        setDragState({ mode, handle, startX: e.clientX, startY: e.clientY, initialX: item.style.x, initialY: item.style.y, initialW: item.style.w, initialH: item.style.h, initialR: item.style.rotation || 0, cx, cy });
    };

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (isPanning) {
                setCanvasPos(p => ({ x: p.x + (e.clientX - lastMousePos.current.x), y: p.y + (e.clientY - lastMousePos.current.y) }));
                lastMousePos.current = { x: e.clientX, y: e.clientY };
            } else if (dragState && selectedId) {
                const dx = (e.clientX - dragState.startX) / canvasScale;
                const dy = (e.clientY - dragState.startY) / canvasScale;
                setLayout(prev => prev.map(item => {
                    if (item.instanceId !== selectedId) return item;
                    const s = { ...item.style };
                    if (dragState.mode === 'drag') { s.x = Math.round((dragState.initialX + dx) / SNAP_GRID) * SNAP_GRID; s.y = Math.round((dragState.initialY + dy) / SNAP_GRID) * SNAP_GRID; }
                    else if (dragState.mode === 'resize') { s.w = Math.max(50, dragState.initialW + dx); s.h = Math.max(50, dragState.initialH + dy); }
                    else if (dragState.mode === 'rotate') {
                        const angle = Math.atan2(e.clientY - dragState.cy, e.clientX - dragState.cx) * (180 / Math.PI);
                        s.rotation = Math.round(dragState.initialR + angle);
                    }
                    return { ...item, style: s };
                }));
            }
        };
        const onUp = () => { setIsPanning(false); setDragState(null); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
        return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    }, [isPanning, dragState, selectedId, canvasScale]);

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const data = await generateInteractiveStory(config);
            setStoryData(data);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    // --- RENDER CONTENT ENGINE ---
    const renderComponent = (item: ActiveComponent) => {
        const s = item.style;
        const d = item.specificData;
        const boxStyle = {
            padding: `${s.padding}px`, backgroundColor: s.backgroundColor, borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`, borderStyle: s.borderStyle, borderRadius: `${s.borderRadius}px`,
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none',
            color: s.color, fontFamily: s.fontFamily, fontSize: `${s.fontSize}px`, lineHeight: s.lineHeight,
            textAlign: s.textAlign as any
        };

        if (item.id === 'header') return (
            <div style={boxStyle} className="h-full flex flex-col justify-end">
                <h1 className="font-black text-4xl uppercase leading-none border-b-4 border-current pb-2">{d?.title || item.customTitle}</h1>
                <p className="text-xs mt-2 font-bold opacity-60 uppercase tracking-widest">{d?.subtitle || 'Künye Bilgisi'}</p>
            </div>
        );

        if (item.id === 'story_block') return (
            <div style={boxStyle} className="h-full relative text-justify">
                {s.imageSettings?.enabled && (
                    <div className="float-right w-1/2 h-48 ml-4 mb-2 bg-zinc-50 rounded-xl overflow-hidden border-2 border-zinc-100 shadow-sm">
                        <ImageDisplay prompt={d?.imagePrompt} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="font-medium text-lg leading-relaxed whitespace-pre-line">
                    <StoryHighlighter text={d?.text || 'Hikaye yükleniyor...'} highlights={[]} />
                </div>
            </div>
        );

        if (item.id === 'vocabulary') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40"><i className="fa-solid fa-spell-check mr-2"></i> {item.customTitle}</h4>
                <div className="grid grid-cols-2 gap-3">
                    {(d?.items || []).map((v: any, i: number) => (
                        <div key={i} className="bg-white/50 p-2 rounded border border-current/10">
                            <b className="block border-b mb-1">{v.word}</b>
                            <span className="text-[10px] opacity-80">{v.definition}</span>
                        </div>
                    ))}
                </div>
            </div>
        );

        if (item.id === 'questions_5n1k') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-4 border-b pb-1 opacity-40">{item.customTitle}</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                             <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[9px] font-black text-white" style={{backgroundColor: QUESTION_TYPES[q.type]?.color || '#000'}}>{QUESTION_TYPES[q.type]?.label || 'SORU'}</span>
                                <span className="font-bold text-xs">{q.question}</span>
                             </div>
                             <div className="h-6 border-b border-current/30 border-dashed"></div>
                        </div>
                    ))}
                </div>
            </div>
        );

        if (item.id === 'questions_test') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40">{item.customTitle}</h4>
                <div className="space-y-4">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <div key={i} className="text-xs">
                             <p className="font-bold mb-1">{i+1}. {q.question}</p>
                             <div className="flex gap-4 opacity-70">
                                {q.options.map((opt: string, k: number) => <span key={k} className="flex items-center gap-1"><div className="w-3 h-3 border border-current rounded-full"></div> {opt}</span>)}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        if (item.id === 'questions_tf') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40">{item.customTitle}</h4>
                <div className="space-y-2">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-current/10 pb-1">
                             <p className="flex-1 mr-4">{q.question}</p>
                             <div className="flex gap-3 font-bold">
                                <span className="w-8 text-center border rounded">D</span>
                                <span className="w-8 text-center border rounded">Y</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        if (item.id === 'questions_fill') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40">{item.customTitle}</h4>
                <div className="space-y-3 italic">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <p key={i} className="text-xs border-b border-current/5 pb-1">
                             {q.sentence.replace('_______', '....................')}
                        </p>
                    ))}
                </div>
            </div>
        );

        if (item.id.includes('logic') || item.id.includes('inference')) return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-40 flex items-center gap-2"><i className="fa-solid fa-brain"></i> {item.customTitle}</h4>
                <div className="space-y-3">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <div key={i} className="p-2 bg-black/5 rounded-lg">
                             <p className="font-bold text-xs mb-1">{q.question}</p>
                             <div className="h-6 border-b border-dashed border-current/20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );

        if (item.id === 'creative') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-40 flex items-center gap-2"><i className="fa-solid fa-paintbrush"></i> {item.customTitle}</h4>
                <p className="text-xs font-bold mb-2">{d?.text || 'Hayalindeki sahneyi buraya çiz ve anlat.'}</p>
                <div className="flex-1 border-2 border-dashed border-current/20 rounded-xl bg-white/30 flex items-center justify-center text-xs opacity-20 font-bold uppercase">Resim Alanı</div>
            </div>
        );

        if (item.id === 'tracker') return (
            <div style={boxStyle} className="h-full flex items-center justify-around">
                {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-current flex items-center justify-center text-xs font-black opacity-30"><i className="fa-solid fa-star"></i></div>)}
            </div>
        );

        return <div style={boxStyle} className="h-full flex items-center justify-center border border-dashed border-zinc-300 opacity-50">{item.label}</div>;
    };

    return (
        <div className="h-full flex flex-col bg-[#18181b] font-['OpenDyslexic'] text-zinc-100 overflow-hidden">
            {/* TOP BAR */}
            <div className="h-14 bg-[#252529] border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-amber-500">Reading Studio <span className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[9px] border border-amber-500/30">PRO</span></span>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={() => setDesignMode(!designMode)} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${designMode ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                         {designMode ? 'DÜZENLEME MODU' : 'ÖNİZLEME MODU'}
                     </button>
                     <button onClick={() => printService.generatePdf('#canvas-root', storyData?.title || 'Hikaye', { action: 'print' })} className="w-9 h-9 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center"><i className="fa-solid fa-print"></i></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div className={`shrink-0 h-full bg-[#1e1e21] border-r border-zinc-800 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
                    <div className="flex border-b border-zinc-800 shrink-0">
                        <button onClick={() => setSidebarTab('settings')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${sidebarTab === 'settings' ? 'text-amber-500 border-b-2 border-amber-500 bg-zinc-800/30' : 'text-zinc-500'}`}>AYARLAR</button>
                        <button onClick={() => setSidebarTab('layers')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest ${sidebarTab === 'layers' ? 'text-amber-500 border-b-2 border-amber-500 bg-zinc-800/30' : 'text-zinc-500'}`}>KATMANLAR</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {sidebarTab === 'settings' && (
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest">Öğrenci Profili</h4>
                                    <input type="text" value={config.studentName} onChange={e => setConfig({...config, studentName: e.target.value})} className="w-full p-2 bg-zinc-900 rounded border border-zinc-800 text-sm mb-2" placeholder="Öğrenci Adı" />
                                    <select value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className="w-full p-2 bg-zinc-900 rounded border border-zinc-800 text-sm">
                                        {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </section>
                                <section>
                                    <h4 className="text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest">Hikaye Akışı</h4>
                                    <input type="text" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full p-2 bg-zinc-900 rounded border border-zinc-800 text-sm mb-3" placeholder="Konu (örn: Ormandaki Dostluk)" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={config.genre} onChange={e => setConfig({...config, genre: e.target.value})} className="p-2 bg-zinc-900 rounded border border-zinc-800 text-xs">
                                            {['Macera', 'Masal', 'Fabl', 'Günlük Yaşam'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        <select value={config.tone} onChange={e => setConfig({...config, tone: e.target.value})} className="p-2 bg-zinc-900 rounded border border-zinc-800 text-xs">
                                            {['Eğlenceli', 'Öğretici', 'Duygusal'].map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </section>
                                <section>
                                    <h4 className="text-[10px] font-black text-zinc-500 mb-3 uppercase tracking-widest">Dahil Edilecekler</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            {l: '5N 1K', k: 'include5N1K'}, 
                                            {l: 'Test', k: 'countMultipleChoice'}, 
                                            {l: 'D/Y', k: 'countTrueFalse'}, 
                                            {l: 'Sözlük', k: 'focusVocabulary'}, 
                                            {l: 'Yaratıcı', k: 'includeCreativeTask'}, 
                                            {l: 'Boşluk', k: 'countFillBlanks'}, 
                                            {l: 'Mantık', k: 'countLogic'}, 
                                            {l: 'Çıkarım', k: 'countInference'}
                                        ].map(opt => (
                                            <button 
                                                key={opt.k} 
                                                onClick={() => {
                                                    const val = (config as any)[opt.k];
                                                    setConfig({...config, [opt.k]: typeof val === 'number' ? (val > 0 ? 0 : 3) : !val});
                                                }}
                                                className={`p-2 rounded border text-[10px] font-bold transition-colors ${(typeof (config as any)[opt.k] === 'number' ? (config as any)[opt.k] > 0 : (config as any)[opt.k]) ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                                            >
                                                {opt.l}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    {isLoading ? 'HİKAYE YAZILIYOR...' : 'OLUŞTUR'}
                                </button>
                            </div>
                        )}
                        {sidebarTab === 'layers' && (
                            <div className="space-y-1">
                                {layout.map(item => (
                                    <div key={item.instanceId} onClick={() => setSelectedId(item.instanceId)} className={`p-3 rounded-lg flex items-center gap-3 border cursor-pointer transition-all ${selectedId === item.instanceId ? 'bg-zinc-800 border-amber-500' : 'bg-zinc-900 border-transparent hover:bg-zinc-800'}`}>
                                        <i className={`fa-solid ${item.icon} w-5 text-center ${item.isVisible ? 'text-amber-500' : 'text-zinc-600'}`}></i>
                                        <span className={`text-xs font-bold truncate flex-1 ${!item.isVisible && 'opacity-30'}`}>{item.customTitle || item.label}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setLayout(prev => prev.map(l => l.instanceId === item.instanceId ? {...l, isVisible: !l.isVisible} : l)); }} className="text-zinc-600 hover:text-white transition-colors">
                                            <i className={`fa-solid ${item.isVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CANVAS AREA */}
                <div 
                    ref={canvasRef} 
                    className="flex-1 bg-[#09090b] relative overflow-hidden flex items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] cursor-grab active:cursor-grabbing"
                    onWheel={handleCanvasWheel}
                    onMouseDown={e => { if(e.target === e.currentTarget) { setIsPanning(true); setSelectedId(null); } lastMousePos.current = { x: e.clientX, y: e.clientY }; }}
                >
                    <div 
                        className="origin-top-left transition-transform duration-75 will-change-transform"
                        style={{ transform: `translate3d(${canvasPos.x}px, ${canvasPos.y}px, 0) scale(${canvasScale})` }}
                    >
                        <div id="canvas-root" className="bg-white shadow-2xl relative" style={{ width: `${A4_WIDTH_PX}px`, height: `${contentHeight}px` }}>
                            {designMode && (
                                <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
                            )}

                            {layout.filter(item => item.isVisible).map((item) => (
                                <div 
                                    key={item.instanceId} 
                                    onMouseDown={e => handleMouseDown(e, item.instanceId, 'drag')}
                                    className={`absolute group ${designMode ? 'hover:ring-2 hover:ring-amber-500/50 cursor-move' : ''} ${selectedId === item.instanceId ? 'ring-2 ring-amber-500' : ''}`}
                                    style={{ left: item.style.x, top: item.style.y, width: item.style.w, height: item.style.h, zIndex: item.style.zIndex, transform: `rotate(${item.style.rotation || 0}deg)` }}
                                >
                                    {designMode && selectedId === item.instanceId && (
                                        <>
                                            <RotateHandle onMouseDown={e => handleMouseDown(e, item.instanceId, 'rotate')} />
                                            <ResizeHandle cursor="nwse-resize" position="-bottom-1 -right-1" onMouseDown={e => handleMouseDown(e, item.instanceId, 'resize')} />
                                        </>
                                    )}
                                    <div className="w-full h-full overflow-hidden pointer-events-none">
                                        {renderComponent(item)}
                                    </div>
                                </div>
                            ))}

                            <div className="absolute bottom-4 left-0 w-full px-8 flex justify-between items-end opacity-30 text-[9px] font-mono pointer-events-none">
                                 <span>Bursa Disleksi AI • Reading Studio</span>
                                 <span>{config.studentName} • Sayfa 1</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SETTINGS PANEL (DOCK) */}
                {selectedId && (
                    <div className="shrink-0 h-full border-l border-zinc-800">
                         <SettingsStation 
                            item={layout.find(l => l.instanceId === selectedId)!} 
                            onUpdate={updates => setLayout(prev => prev.map(l => l.instanceId === selectedId ? {...l, ...updates} : l))} 
                            onClose={() => setSelectedId(null)}
                            onDelete={() => { if(confirm('Sil?')) { setLayout(prev => prev.filter(l => l.instanceId !== selectedId)); setSelectedId(null); }}}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
