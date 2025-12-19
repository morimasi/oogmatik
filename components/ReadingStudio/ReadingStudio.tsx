
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { InteractiveStoryData, LayoutSectionId, LayoutItem, ReadingStudioConfig, LayoutItemStyle } from '../../types';
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

interface ActiveComponent extends LayoutItem {
    customTitle?: string;
    customIcon?: string;
    themeColor?: string;
    instanceId: string;
}

const DEFAULT_STYLE_BASE: LayoutItemStyle = {
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
        borderRadius: 12,
        blendMode: 'normal',
        filter: 'none'
    }
};

const COMPONENT_DEFINITIONS = [
    { id: 'header', label: 'Başlık Künyesi', defaultTitle: 'HİKAYE KÜNYESİ', icon: 'fa-heading', h: 120 },
    { id: 'tracker', label: 'Okuma Takipçisi', defaultTitle: 'OKUMA TAKİBİ', icon: 'fa-eye', h: 60, w: 200 },
    { id: 'story_block', label: 'Hikaye Metni', defaultTitle: 'OKUMA METNİ', icon: 'fa-book-open', h: 450 },
    { id: 'vocabulary', label: 'Sözlükçe', defaultTitle: 'SÖZLÜKÇE', icon: 'fa-spell-check', h: 180 },
    { id: 'questions_5n1k', label: '5N 1K Analizi', defaultTitle: '5N 1K SORULARI', icon: 'fa-circle-question', h: 320 },
    { id: 'questions_test', label: 'Test Soruları', defaultTitle: 'DEĞERLENDİRME TESTİ', icon: 'fa-list-check', h: 300 },
    { id: 'questions_tf', label: 'Doğru / Yanlış', defaultTitle: 'DOĞRU MU? YANLIŞ MI?', icon: 'fa-check-double', h: 200 },
    { id: 'questions_fill', label: 'Boşluk Doldurma', defaultTitle: 'EKSİK KELİMEYİ BUL', icon: 'fa-pen-clip', h: 200 },
    { id: 'questions_logic', label: 'Mantık Sorusu', defaultTitle: 'MANTIKSAL AKIL YÜRÜTME', icon: 'fa-brain', h: 150 },
    { id: 'questions_inference', label: 'Çıkarım Analizi', defaultTitle: 'DERİN ANALİZ', icon: 'fa-magnifying-glass-chart', h: 150 },
    { id: 'creative', label: 'Yaratıcı Atölye', defaultTitle: 'YARATICI ALAN', icon: 'fa-paintbrush', h: 220 },
    { id: 'notes', label: 'Not Alanı', defaultTitle: 'NOTLARIM', icon: 'fa-note-sticky', h: 100 },
];

const ResizeHandle = ({ cursor, position, onMouseDown }: any) => (
    <div className={`absolute w-3 h-3 bg-amber-500 border border-white rounded-full z-[100] hover:scale-150 transition-transform ${position}`} style={{ cursor }} onMouseDown={onMouseDown} />
);

const RotateHandle = ({ onMouseDown }: any) => (
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-800 border border-amber-500 rounded-full z-[100] hover:bg-amber-500 hover:text-black text-amber-500 flex items-center justify-center cursor-alias shadow-sm transition-all" onMouseDown={onMouseDown}>
        <i className="fa-solid fa-rotate text-[10px]"></i>
    </div>
);

// --- SETTINGS STATION COMPONENTS ---
const SettingSection = ({ title, icon, children }: any) => (
    <div className="mb-6 animate-in fade-in slide-in-from-top-1">
        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <i className={`fa-solid ${icon}`}></i> {title}
        </h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const LookControls = ({ style, onUpdate }: { style: LayoutItemStyle, onUpdate: (k: keyof LayoutItemStyle, v: any) => void }) => (
    <>
        <SettingSection title="Kutu Stili" icon="fa-square">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Arka Plan</label>
                    <div className="flex gap-1">
                        <input type="color" value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor} onChange={e => onUpdate('backgroundColor', e.target.value)} className="w-8 h-8 rounded border border-zinc-700 bg-transparent p-0.5 cursor-pointer" />
                        <button onClick={() => onUpdate('backgroundColor', 'transparent')} className={`flex-1 text-[9px] font-bold border rounded px-2 ${style.backgroundColor === 'transparent' ? 'bg-amber-500 text-black border-amber-500' : 'text-zinc-400 border-zinc-700'}`}>Şeffaf</button>
                    </div>
                </div>
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Kenarlık Renk</label>
                    <input type="color" value={style.borderColor === 'transparent' ? '#000000' : style.borderColor} onChange={e => onUpdate('borderColor', e.target.value)} className="w-full h-8 rounded border border-zinc-700 bg-transparent p-0.5 cursor-pointer" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Kenarlık</label>
                    <input type="number" value={style.borderWidth} onChange={e => onUpdate('borderWidth', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white" />
                </div>
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Radius</label>
                    <input type="number" value={style.borderRadius} onChange={e => onUpdate('borderRadius', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white" />
                </div>
                <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Dolgu</label>
                    <input type="number" value={style.padding} onChange={e => onUpdate('padding', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white" />
                </div>
            </div>
        </SettingSection>

        <SettingSection title="Resim Kontrolleri" icon="fa-image">
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-700">
                <span className="text-[10px] font-bold text-zinc-300 uppercase">Resmi Göster</span>
                <button 
                    onClick={() => onUpdate('imageSettings', { ...style.imageSettings, enabled: !style.imageSettings?.enabled })}
                    className={`w-10 h-5 rounded-full relative transition-colors ${style.imageSettings?.enabled ? 'bg-amber-500' : 'bg-zinc-600'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${style.imageSettings?.enabled ? 'left-6' : 'left-1'}`}></div>
                </button>
            </div>
            
            {style.imageSettings?.enabled && (
                <div className="space-y-3 mt-3 animate-in slide-in-from-right-1">
                    <div>
                        <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Pozisyon</label>
                        <div className="grid grid-cols-2 gap-1">
                            {['top', 'left', 'right', 'background'].map(p => (
                                <button key={p} onClick={() => onUpdate('imageSettings', { ...style.imageSettings, position: p })} className={`py-1 text-[9px] font-bold border rounded uppercase ${style.imageSettings?.position === p ? 'bg-indigo-600 border-indigo-500 text-white' : 'text-zinc-500 border-zinc-700 hover:bg-zinc-800'}`}>{p}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase mb-1">
                            Resim Boyutu <span>%{style.imageSettings?.widthPercent}</span>
                        </label>
                        <input type="range" min="10" max="100" value={style.imageSettings?.widthPercent} onChange={e => onUpdate('imageSettings', { ...style.imageSettings, widthPercent: Number(e.target.value) })} className="w-full accent-amber-500 h-1 bg-zinc-700 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-700">
                        <span className="text-[10px] font-bold text-zinc-300 uppercase">Yazı Arkasında (Layer)</span>
                        <button 
                            onClick={() => onUpdate('zIndex', style.zIndex === 1 ? 50 : 1)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${style.zIndex === 50 ? 'bg-indigo-500' : 'bg-zinc-600'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${style.zIndex === 50 ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>
            )}
        </SettingSection>
    </>
);

const SettingsStation = ({ item, onUpdate, onClose, onDelete }: any) => {
    const [tab, setTab] = useState<'content' | 'style' | 'text'>('content');
    return (
        <div className="w-80 h-full bg-[#1e1e21] border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 bg-[#2d2d32] border-b border-zinc-700 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-200 flex items-center gap-2"><i className={`fa-solid ${item.icon} text-amber-500`}></i> {item.label}</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="flex border-b border-zinc-700 bg-[#1e1e21]">
                {['content', 'style', 'text'].map((t: any) => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-[10px] font-bold uppercase transition-all ${tab === t ? 'text-amber-500 border-b-2 border-amber-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}>{t === 'content' ? 'İçerik' : t === 'style' ? 'Mimari' : 'Tipografi'}</button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {tab === 'content' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Görünen Başlık</label>
                            <input type="text" value={item.customTitle || item.label} onChange={e => onUpdate({ customTitle: e.target.value })} className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white focus:border-amber-500 outline-none" />
                        </div>
                        {/* Dinamik Bileşen Veri Düzenleme Alanı */}
                        <div className="p-3 bg-zinc-900 rounded border border-dashed border-zinc-700">
                             <p className="text-[9px] text-zinc-500 leading-relaxed italic"><i className="fa-solid fa-circle-info mr-1"></i> Bileşen içeriği doğrudan Canvas üzerinde "Düzenle" butonuna basılarak veya AI tarafından üretilerek değiştirilebilir.</p>
                        </div>
                    </div>
                )}
                {tab === 'style' && <LookControls style={item.style} onUpdate={(k, v) => onUpdate({ style: { ...item.style, [k]: v } })} />}
                {tab === 'text' && (
                    <SettingSection title="Yazı Ayarları" icon="fa-font">
                         <select value={item.style.fontFamily} onChange={e => onUpdate({ style: { ...item.style, fontFamily: e.target.value } })} className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-white mb-3">
                             <option value="OpenDyslexic">OpenDyslexic</option>
                             <option value="Lexend">Lexend</option>
                             <option value="Inter">Standard</option>
                         </select>
                         <div className="grid grid-cols-2 gap-2">
                             <div>
                                 <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Boyut</label>
                                 <input type="number" value={item.style.fontSize} onChange={e => onUpdate({ style: { ...item.style, fontSize: Number(e.target.value) } })} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-white" />
                             </div>
                             <div>
                                 <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Renk</label>
                                 <input type="color" value={item.style.color} onChange={e => onUpdate({ style: { ...item.style, color: e.target.value } })} className="w-full h-8 rounded border border-zinc-700 bg-transparent p-0.5 cursor-pointer" />
                             </div>
                         </div>
                    </SettingSection>
                )}
            </div>
            <div className="p-4 border-t border-zinc-700 bg-[#1e1e21]">
                <button onClick={onDelete} className="w-full py-2 bg-red-900/20 text-red-500 rounded font-bold text-xs hover:bg-red-900/40 transition-colors"><i className="fa-solid fa-trash mr-2"></i> Bileşeni Tuvalden Kaldır</button>
            </div>
        </div>
    );
};

export const ReadingStudio: React.FC<any> = ({ onBack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [layout, setLayout] = useState<ActiveComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);
    const [sidebarTab, setSidebarTab] = useState<'settings' | 'layers'>('settings');

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
                id: def.id as any,
                label: def.label,
                icon: def.icon,
                instanceId: `item-${def.id}-${i}`,
                style: { ...DEFAULT_STYLE_BASE, y: curY, zIndex: 1, h: def.h, w: def.w || 754 },
                isVisible: i < 5,
                specificData: null
            });
            curY += def.h + 20;
        });
        setLayout(items);
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
            }
            return { ...item, specificData, isVisible };
        }));
    }, [storyData, config]);

    // --- INTERACTION HANDLERS ---
    const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
        const delta = e.deltaY * -0.001;
        setCanvasScale(s => Math.min(Math.max(0.2, s + delta), 3));
    }, []);

    const handleMouseDown = (e: React.MouseEvent, id: string, mode: 'drag'|'resize'|'rotate' = 'drag', handle?: string) => {
        if (!designMode) return;
        e.stopPropagation();
        const item = layout.find(l => l.instanceId === id);
        if (!item) return;
        setSelectedId(id);
        setDragState({ mode, handle, startX: e.clientX, startY: e.clientY, initialX: item.style.x, initialY: item.style.y, initialW: item.style.w, initialH: item.style.h, initialR: item.style.rotation || 0 });
    };

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (isPanning) {
                setCanvasPos(p => ({ x: p.x + (e.clientX - lastMousePos.current.x), y: p.y + (e.clientY - lastMousePos.current.y) }));
                lastMousePos.current = { x: e.clientX, y: e.clientY };
                return;
            }
            if (dragState && selectedId) {
                const dx = (e.clientX - dragState.startX) / canvasScale;
                const dy = (e.clientY - dragState.startY) / canvasScale;
                setLayout(prev => prev.map(item => {
                    if (item.instanceId !== selectedId) return item;
                    const s = { ...item.style };
                    if (dragState.mode === 'drag') { s.x = Math.round((dragState.initialX + dx) / SNAP_GRID) * SNAP_GRID; s.y = Math.round((dragState.initialY + dy) / SNAP_GRID) * SNAP_GRID; }
                    else if (dragState.mode === 'resize') { s.w = Math.max(50, dragState.initialW + dx); s.h = Math.max(50, dragState.initialH + dy); }
                    else if (dragState.mode === 'rotate') { s.rotation = Math.round(dragState.initialR + dx); }
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
        try { const data = await generateInteractiveStory(config); setStoryData(data); } 
        catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    // --- RENDER CONTENT ENGINE ---
    const renderComponent = (item: ActiveComponent) => {
        const s = item.style;
        const d = item.specificData;
        const boxStyle = {
            padding: `${s.padding}px`, backgroundColor: s.backgroundColor, borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`, borderStyle: s.borderStyle, borderRadius: `${s.borderRadius}px`,
            color: s.color, fontFamily: s.fontFamily, fontSize: `${s.fontSize}px`, lineHeight: s.lineHeight,
            textAlign: s.textAlign as any
        };

        const renderImage = () => {
             if (!s.imageSettings?.enabled) return null;
             const pos = s.imageSettings.position;
             const isBg = pos === 'background';
             const isFloat = pos === 'left' || pos === 'right';
             
             return (
                 <div 
                    className={`${isBg ? 'absolute inset-0' : (isFloat ? `float-${pos} ml-4 mb-2` : 'w-full mb-4')} overflow-hidden`}
                    style={{ 
                        width: isFloat ? `${s.imageSettings.widthPercent}%` : '100%', 
                        opacity: s.imageSettings.opacity, 
                        zIndex: isBg ? -1 : 1 
                    }}
                 >
                    <ImageDisplay prompt={d?.imagePrompt} className="w-full h-48 object-cover rounded-xl border border-zinc-100 shadow-sm" />
                 </div>
             );
        };

        if (item.id === 'header') return (
            <div style={boxStyle} className="h-full flex flex-col justify-end">
                <h1 className="font-black text-4xl uppercase leading-none border-b-4 border-current pb-2"><EditableText value={d?.title || item.customTitle} tag="span" /></h1>
                <p className="text-xs mt-2 font-bold opacity-60 uppercase tracking-widest">{d?.subtitle || 'Künye'}</p>
            </div>
        );

        if (item.id === 'story_block') return (
            <div style={boxStyle} className="h-full relative text-justify">
                {renderImage()}
                <div className="font-medium text-lg leading-relaxed whitespace-pre-line relative z-10">
                    <StoryHighlighter text={d?.text || 'Hikaye metni buraya gelecek...'} highlights={[]} />
                </div>
            </div>
        );

        if (item.id === 'vocabulary') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40"><i className="fa-solid fa-spell-check mr-2"></i> {item.customTitle || item.label}</h4>
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

        if (item.id === 'questions_tf') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40">{item.customTitle || item.label}</h4>
                <div className="space-y-2">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-100 pb-1.5">
                             <p className="flex-1 mr-4 font-medium">{q.question}</p>
                             <div className="flex gap-2">
                                 <div className="w-8 h-8 border-2 border-zinc-200 rounded flex items-center justify-center font-black text-zinc-300">D</div>
                                 <div className="w-8 h-8 border-2 border-zinc-200 rounded flex items-center justify-center font-black text-zinc-300">Y</div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        if (item.id === 'questions_fill') return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40">{item.customTitle || item.label}</h4>
                <div className="space-y-4">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <p key={i} className="text-sm font-medium leading-relaxed italic border-b border-dashed border-zinc-200 pb-1">
                            {q.sentence.replace('_______', '....................')}
                        </p>
                    ))}
                </div>
            </div>
        );

        if (item.id.includes('logic') || item.id.includes('inference')) return (
            <div style={boxStyle} className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-3 border-b pb-1 opacity-40 flex items-center gap-2"><i className="fa-solid fa-brain"></i> {item.customTitle || item.label}</h4>
                <div className="space-y-4">
                    {(d?.questions || []).map((q: any, i: number) => (
                        <div key={i} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                             <p className="font-bold text-sm mb-2">{q.question}</p>
                             <div className="h-10 border-b-2 border-dashed border-zinc-200 w-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );

        // Fallback standard render for others
        return <div style={boxStyle} className="h-full flex items-center justify-center border border-dashed border-zinc-300 opacity-50">{item.label}</div>;
    };

    return (
        <div className="h-full flex flex-col bg-[#18181b] font-['OpenDyslexic'] text-zinc-100 overflow-hidden">
            {/* TOP BAR */}
            <div className="h-14 bg-[#252529] border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-400"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-amber-500">Reading Studio <span className="text-[10px] opacity-40 ml-1">MİMARİ MOD</span></span>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={() => setDesignMode(!designMode)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${designMode ? 'bg-amber-500 text-black shadow-lg' : 'bg-zinc-800 text-zinc-500'}`}>
                         {designMode ? 'Düzenleme Modu' : 'Önizleme Modu'}
                     </button>
                     <button onClick={() => printService.generatePdf('#canvas-root', storyData?.title || 'Hikaye', { action: 'print' })} className="w-9 h-9 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"><i className="fa-solid fa-print"></i></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div className={`shrink-0 h-full bg-[#1e1e21] border-r border-zinc-800 flex flex-col transition-all duration-300 w-80`}>
                    <div className="flex border-b border-zinc-800">
                        <button onClick={() => setSidebarTab('settings')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${sidebarTab === 'settings' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-600'}`}>HİKAYE AYARLARI</button>
                        <button onClick={() => setSidebarTab('layers')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${sidebarTab === 'layers' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-600'}`}>KATMANLAR</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {sidebarTab === 'settings' ? (
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Karakter & Tema</h4>
                                    <input type="text" placeholder="Konu (örn: Uzay Gezisi)" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white mb-2" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select value={config.genre} onChange={e => setConfig({...config, genre: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-2 text-[10px] font-bold rounded">
                                            <option>Macera</option><option>Masal</option><option>Fabl</option>
                                        </select>
                                        <select value={config.tone} onChange={e => setConfig({...config, tone: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-2 text-[10px] font-bold rounded">
                                            <option>Eğlenceli</option><option>Öğretici</option><option>Duygusal</option>
                                        </select>
                                    </div>
                                </section>
                                <section>
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Dahil Et</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            {l: '5N 1K', k: 'include5N1K'}, {l: 'Test', k: 'countMultipleChoice'}, 
                                            {l: 'D/Y', k: 'countTrueFalse'}, {l: 'Boşluk', k: 'countFillBlanks'}, 
                                            {l: 'Mantık', k: 'countLogic'}, {l: 'Çıkarım', k: 'countInference'},
                                            {l: 'Sözlük', k: 'focusVocabulary'}, {l: 'Yaratıcı', k: 'includeCreativeTask'}
                                        ].map(opt => (
                                            <button key={opt.k} onClick={() => {
                                                const v = (config as any)[opt.k];
                                                setConfig({...config, [opt.k]: typeof v === 'number' ? (v > 0 ? 0 : 3) : !v});
                                            }} className={`p-2 rounded border text-[10px] font-black transition-all ${(typeof (config as any)[opt.k] === 'number' ? (config as any)[opt.k] > 0 : (config as any)[opt.k]) ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{opt.l}</button>
                                        ))}
                                    </div>
                                </section>
                                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    {isLoading ? 'YAZILIYOR...' : 'OLUŞTUR'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {layout.map(item => (
                                    <div key={item.instanceId} onClick={() => setSelectedId(item.instanceId)} className={`p-3 rounded-lg flex items-center gap-3 border cursor-pointer transition-all ${selectedId === item.instanceId ? 'bg-zinc-800 border-amber-500' : 'bg-zinc-900 border-transparent hover:bg-zinc-800'}`}>
                                        <i className={`fa-solid ${item.icon} w-5 text-center ${item.isVisible ? 'text-amber-500' : 'text-zinc-600'}`}></i>
                                        <span className={`text-[10px] font-bold truncate flex-1 ${!item.isVisible && 'opacity-30'}`}>{item.customTitle || item.label}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setLayout(prev => prev.map(l => l.instanceId === item.instanceId ? {...l, isVisible: !l.isVisible} : l)); }} className="text-zinc-600 hover:text-white"><i className={`fa-solid ${item.isVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i></button>
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
                    onMouseDown={e => { 
                        if(e.target === e.currentTarget) { setIsPanning(true); setSelectedId(null); } 
                        lastMousePos.current = { x: e.clientX, y: e.clientY }; 
                    }}
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
                                            <RotateHandle onMouseDown={(e: any) => handleMouseDown(e, item.instanceId, 'rotate')} />
                                            <ResizeHandle cursor="nwse-resize" position="-bottom-1 -right-1" onMouseDown={(e: any) => handleMouseDown(e, item.instanceId, 'resize')} />
                                        </>
                                    )}
                                    <div className="w-full h-full overflow-hidden pointer-events-none">
                                        {renderComponent(item)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SETTINGS PANEL (DOCK) */}
                {selectedId && (
                    <div className="shrink-0 h-full border-l border-zinc-800">
                         <SettingsStation 
                            item={layout.find(l => l.instanceId === selectedId)!} 
                            onUpdate={(updates: any) => setLayout(prev => prev.map(l => l.instanceId === selectedId ? {...l, ...updates} : l))} 
                            onClose={() => setSelectedId(null)}
                            onDelete={() => { if(confirm('Sil?')) { setLayout(prev => prev.filter(l => l.instanceId !== selectedId)); setSelectedId(null); }}}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
