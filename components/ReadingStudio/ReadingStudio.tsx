
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
    { id: 'story_block', label: 'Hikaye Metni', defaultTitle: 'OKUMA METNİ', icon: 'fa-book-open', description: 'Ana metin ve görsel alanı.', defaultStyle: { h: 400, imageSettings: { enabled: true, position: 'right', widthPercent: 40, opacity: 1, objectFit: 'cover', borderRadius: 8, blendMode: 'normal' } } },
    { id: 'vocabulary', label: 'Sözlükçe', defaultTitle: 'SÖZLÜKÇE', icon: 'fa-spell-check', description: 'Zor kelimeler ve anlamları.', defaultStyle: { h: 150 } },
    { id: 'questions_5n1k', label: '5N 1K Analizi', defaultTitle: '5N 1K SORULARI', icon: 'fa-circle-question', description: 'Kim, Ne, Nerede soruları.', defaultStyle: { w: 754, h: 300 } },
    { id: 'questions_test', label: 'Test Soruları', defaultTitle: 'DEĞERLENDİRME', icon: 'fa-list-check', description: 'Çoktan seçmeli sorular.', defaultStyle: { w: 754, h: 300 } },
    { id: 'questions_inference', label: 'Derin Analiz', defaultTitle: 'DERİN ANALİZ', icon: 'fa-brain', description: 'Çıkarım ve yorum soruları.', defaultStyle: { h: 150 } },
    { id: 'creative', label: 'Yaratıcı Alan', defaultTitle: 'YARATICI ALAN', icon: 'fa-paintbrush', description: 'Çizim ve yazma alanı.', defaultStyle: { h: 200 } },
    { id: 'notes', label: 'Not Alanı', defaultTitle: 'NOTLAR', icon: 'fa-note-sticky', description: 'Boş not satırları.', defaultStyle: { h: 100 } },
];

// --- MICRO COMPONENTS ---

const ResizeHandle = ({ cursor, position, onMouseDown }: { cursor: string, position: string, onMouseDown: (e: React.MouseEvent) => void }) => (
    <div 
        className={`absolute w-3 h-3 bg-white border border-indigo-600 rounded-full z-50 hover:bg-indigo-600 hover:scale-125 transition-transform ${position}`}
        style={{ cursor }}
        onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
    />
);

const RotateHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
    <div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-indigo-600 rounded-full z-50 hover:bg-indigo-600 hover:text-white flex items-center justify-center cursor-alias shadow-sm transition-all"
        onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
        title="Döndür"
    >
        <i className="fa-solid fa-rotate text-[10px] text-indigo-600 hover:text-white"></i>
    </div>
);

// --- SETTINGS PANELS (Refactored) ---

const TypographyControls = ({ style, onUpdate }: { style: any, onUpdate: (k: string, v: any) => void }) => (
    <div className="space-y-3">
        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Font Ailesi</label>
                <select value={style.fontFamily} onChange={e => onUpdate('fontFamily', e.target.value)} className="w-full p-1.5 bg-zinc-50 border rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="OpenDyslexic">OpenDyslexic</option>
                    <option value="Lexend">Lexend</option>
                    <option value="Comic Neue">Comic Neue</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                </select>
            </div>
             <div className="w-20">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Punto</label>
                <input type="number" value={style.fontSize} onChange={e => onUpdate('fontSize', Number(e.target.value))} className="w-full p-1.5 bg-zinc-50 border rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
        </div>
        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Satır Aralığı</label>
                <input type="range" min="1" max="2.5" step="0.1" value={style.lineHeight} onChange={e => onUpdate('lineHeight', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
             <div className="flex-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Harf Aralığı</label>
                <input type="range" min="0" max="10" step="0.5" value={style.letterSpacing} onChange={e => onUpdate('letterSpacing', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
        </div>
         <div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Hizalama</label>
            <div className="flex bg-zinc-50 rounded border p-0.5">
                {['left', 'center', 'right', 'justify'].map(align => (
                    <button key={align} onClick={() => onUpdate('textAlign', align)} className={`flex-1 py-1 rounded text-xs transition-colors ${style.textAlign === align ? 'bg-white shadow text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>
                        <i className={`fa-solid fa-align-${align}`}></i>
                    </button>
                ))}
            </div>
        </div>
        <div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Metin Rengi</label>
            <div className="flex items-center gap-2">
                <input type="color" value={style.color} onChange={e => onUpdate('color', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                <span className="text-xs font-mono text-zinc-500">{style.color}</span>
            </div>
        </div>
    </div>
);

const AppearanceControls = ({ style, onUpdate }: { style: any, onUpdate: (k: string, v: any) => void }) => (
    <div className="space-y-4">
        <div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Arka Plan</label>
             <div className="flex items-center gap-2">
                <input type="color" value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor} onChange={e => onUpdate('backgroundColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer" />
                <button onClick={() => onUpdate('backgroundColor', 'transparent')} className={`text-xs px-2 py-1 rounded border transition-colors ${style.backgroundColor === 'transparent' ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'bg-white border-zinc-200 text-zinc-500'}`}>Şeffaf</button>
            </div>
        </div>
        <div>
            <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Kenarlık</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
                 <select value={style.borderStyle} onChange={e => onUpdate('borderStyle', e.target.value)} className="p-1.5 bg-zinc-50 border rounded text-xs outline-none">
                     <option value="solid">Düz Çizgi</option>
                     <option value="dashed">Kesik Çizgi</option>
                     <option value="dotted">Noktalı</option>
                     <option value="double">Çift Çizgi</option>
                 </select>
                 <input type="number" min="0" value={style.borderWidth} onChange={e => onUpdate('borderWidth', Number(e.target.value))} className="p-1.5 bg-zinc-50 border rounded text-xs outline-none" placeholder="Kalınlık" />
            </div>
             <input type="color" value={style.borderColor === 'transparent' ? '#000000' : style.borderColor} onChange={e => onUpdate('borderColor', e.target.value)} className="w-full h-6 p-0 border-0 rounded cursor-pointer" />
        </div>
        <div>
             <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Köşe & Gölge</label>
             <div className="flex gap-2 mb-2">
                 <div className="flex-1">
                     <span className="text-[9px] text-zinc-400">Radius</span>
                     <input type="range" min="0" max="50" value={style.borderRadius} onChange={e => onUpdate('borderRadius', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg accent-indigo-600" />
                 </div>
                 <div className="flex-1">
                     <span className="text-[9px] text-zinc-400">Padding</span>
                     <input type="range" min="0" max="50" value={style.padding} onChange={e => onUpdate('padding', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg accent-indigo-600" />
                 </div>
             </div>
             <div className="flex bg-zinc-50 rounded border p-0.5">
                {['none', 'sm', 'md', 'lg'].map(sh => (
                    <button key={sh} onClick={() => onUpdate('boxShadow', sh)} className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${style.boxShadow === sh ? 'bg-white shadow text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>
                        {sh}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const ContentControls = ({ item, onUpdateSpecific }: { item: ActiveComponent, onUpdateSpecific: (data: any) => void }) => {
    // Determine content based on item ID
    
    // HEADER SPECIFIC
    if (item.id === 'header') {
        const data = item.specificData || { title: item.customTitle || "HİKAYE BAŞLIĞI", subtitle: "Tarih: ....................", showDate: true };
        return (
            <div className="space-y-3">
                <div>
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Başlık Metni</label>
                    <input type="text" value={data.title} onChange={e => onUpdateSpecific({...data, title: e.target.value})} className="w-full p-2 border rounded text-sm font-bold bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Alt Bilgi / Tarih</label>
                    <input type="text" value={data.subtitle} onChange={e => onUpdateSpecific({...data, subtitle: e.target.value})} className="w-full p-2 border rounded text-sm bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
            </div>
        );
    }

    // STORY TEXT SPECIFIC
    if (item.id === 'story_block') {
         const data = item.specificData || { text: "Hikaye metni buraya gelecek..." };
         return (
            <div className="space-y-3">
                <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Metin İçeriği (Manuel Düzenleme)</label>
                <textarea 
                    value={data.text} 
                    onChange={e => onUpdateSpecific({...data, text: e.target.value})} 
                    className="w-full h-64 p-2 border rounded text-sm leading-relaxed resize-none font-dyslexic bg-zinc-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                ></textarea>
                <p className="text-[10px] text-zinc-400">Not: AI üretiminden sonra burayı el ile düzeltebilirsiniz.</p>
            </div>
         );
    }
    
    // QUESTIONS SPECIFIC
    if (item.id.startsWith('questions')) {
        const data = item.specificData || { questions: [{text: "Soru 1..."}] };
        const qs = data.questions || [];
        
        const updateQ = (idx: number, val: string) => {
            const newQs = [...qs];
            newQs[idx] = { ...newQs[idx], text: val };
            onUpdateSpecific({...data, questions: newQs});
        };
        
        const addQ = () => onUpdateSpecific({...data, questions: [...qs, {text: "Yeni Soru"}]});
        const removeQ = (idx: number) => onUpdateSpecific({...data, questions: qs.filter((_:any, i:number) => i !== idx)});

        return (
            <div className="space-y-3">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase">Sorular</label>
                    <button onClick={addQ} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition-colors font-bold">+ Ekle</button>
                 </div>
                 <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                     {qs.map((q: any, i: number) => (
                         <div key={i} className="flex gap-2 items-start">
                             <span className="text-xs font-bold w-4 pt-2 text-zinc-400">{i+1}.</span>
                             <textarea rows={2} value={q.text} onChange={e => updateQ(i, e.target.value)} className="flex-1 p-2 border rounded text-xs resize-none bg-zinc-50 focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500" />
                             <button onClick={() => removeQ(i)} className="text-zinc-400 hover:text-red-500 px-1 pt-2 transition-colors"><i className="fa-solid fa-trash"></i></button>
                         </div>
                     ))}
                 </div>
            </div>
        );
    }

    return <div className="text-zinc-400 text-xs italic p-2 bg-zinc-50 rounded">Bu bileşen için özel içerik ayarı yok. Stil sekmesini kullanın.</div>;
};

const SettingsStation = ({ item, onUpdate, onClose, onDelete }: { item: ActiveComponent, onUpdate: (updates: Partial<ActiveComponent>) => void, onClose: () => void, onDelete: () => void }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'type' | 'look' | 'layout'>('content');

    const handlePanelClick = (e: React.MouseEvent) => e.stopPropagation();

    const updateStyle = (key: keyof LayoutItem['style'], value: any) => {
        onUpdate({ style: { ...item.style, [key]: value } });
    };
    
    const updateSpecificData = (data: any) => {
        onUpdate({ specificData: data });
    };
    
    const updateImageSettings = (key: string, value: any) => {
        onUpdate({ 
            style: { 
                ...item.style, 
                imageSettings: { ...item.style.imageSettings, [key]: value } as any
            } 
        });
    };

    return (
        <div className="w-80 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 shadow-xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300" onClick={handlePanelClick}>
            {/* Header */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center shrink-0">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                </h3>
                <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>

            {/* Pro Tab Bar */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
                {[
                    { id: 'content', icon: 'fa-pen-to-square', label: 'İçerik' },
                    { id: 'type', icon: 'fa-font', label: 'Yazı' },
                    { id: 'look', icon: 'fa-palette', label: 'Stil' },
                    { id: 'layout', icon: 'fa-ruler-combined', label: 'Düzen' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-3 text-[9px] font-bold uppercase flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-b-2 border-indigo-600' : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                        <i className={`fa-solid ${tab.icon} text-sm`}></i> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white dark:bg-zinc-900">
                {activeTab === 'content' && <ContentControls item={item} onUpdateSpecific={updateSpecificData} />}
                {activeTab === 'type' && <TypographyControls style={item.style} onUpdate={updateStyle} />}
                {activeTab === 'look' && <AppearanceControls style={item.style} onUpdate={updateStyle} />}
                
                {activeTab === 'layout' && (
                    <div className="space-y-4 animate-in fade-in">
                        {/* Existing Layout Controls */}
                        <div className="grid grid-cols-2 gap-3">
                                {['x', 'y', 'w', 'h', 'rotation'].map((key) => (
                                    <div key={key} className="flex items-center bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg px-2 py-1.5 focus-within:ring-2 ring-indigo-100">
                                        <span className="text-[10px] font-black text-zinc-400 w-6 uppercase truncate mr-1">{key === 'rotation' ? 'Rot' : key}</span>
                                        <input type="number" value={Math.round(item.style[key as keyof typeof item.style] as number || 0)} onChange={e => updateStyle(key as any, Number(e.target.value))} className="w-full bg-transparent text-xs font-mono outline-none text-right text-zinc-900 dark:text-zinc-100" />
                                    </div>
                                ))}
                        </div>
                         <div className="flex gap-2">
                                <button onClick={() => updateStyle('zIndex', (item.style.zIndex || 0) + 1)} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-colors"><i className="fa-solid fa-arrow-up"></i> Öne</button>
                                <button onClick={() => updateStyle('zIndex', Math.max(0, (item.style.zIndex || 0) - 1))} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-colors"><i className="fa-solid fa-arrow-down"></i> Arkaya</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Common Image Toggle if applicable */}
            {item.style.imageSettings && (
                 <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex justify-between items-center">
                     <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Görsel</span>
                     <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${item.style.imageSettings?.enabled ? 'bg-green-500' : 'bg-zinc-300'}`} onClick={() => updateImageSettings('enabled', !item.style.imageSettings?.enabled)}>
                        <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${item.style.imageSettings?.enabled ? 'left-5' : 'left-1'}`}></div>
                    </div>
                 </div>
            )}

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
                <button onClick={onDelete} className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                    <i className="fa-solid fa-trash"></i> Bileşeni Sil
                </button>
            </div>
        </div>
    );
}

// --- MAIN CANVAS COMPONENT ---

export const ReadingStudio: React.FC<any> = ({ onBack, onAddToWorkbook }) => {
    // ... (Existing State) ...
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'settings' | 'library'>('settings');
    const [layout, setLayout] = useState<ActiveComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);
    // ... (Config State same as before) ...
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
    
    // ... (Drag State same as before) ...
    const [dragState, setDragState] = useState<{ mode: 'drag' | 'resize' | 'rotate'; resizeHandle?: string; startX: number; startY: number; initialX: number; initialY: number; initialW: number; initialH: number; initialR: number; centerX?: number; centerY?: number; } | null>(null);

    // Initial Load - Automatic Layout
    useEffect(() => {
        const generatedLayout: ActiveComponent[] = [];
        let currentY = 20;
        const startX = 20;
        const canvasWidth = A4_WIDTH_PX - (startX * 2);
        const gap = 15;

        COMPONENT_DEFINITIONS.forEach((def, index) => {
            let itemX = startX;
            let itemY = currentY;
            let itemW = canvasWidth;
            let itemH = def.defaultStyle.h || 100;
            
            if (def.id === 'tracker') {
                itemW = 200;
                itemX = A4_WIDTH_PX - 20 - 200; 
                itemY = 35; 
            } else if (def.id === 'header') {
                currentY += itemH + gap;
            } else {
                currentY += itemH + gap;
            }

            generatedLayout.push({
                ...def,
                instanceId: `${def.id}-auto-${index}`,
                style: {
                    ...DEFAULT_STYLE_BASE,
                    ...def.defaultStyle,
                    x: itemX,
                    y: itemY,
                    w: itemW,
                    h: itemH,
                    zIndex: def.id === 'tracker' ? 10 : index + 1
                },
                isVisible: true,
                customTitle: def.defaultTitle,
                themeColor: 'black',
                specificData: null // Will be populated when storyData is generated or manually
            });
        });

        setLayout(generatedLayout);
    }, []);
    
    // Sync Generated Data to Components
    useEffect(() => {
        if (!storyData) return;
        setLayout(prev => prev.map(item => {
            let specificData = item.specificData;
            
            // Only populate if not already edited (simple check)
            if (!specificData) {
                if (item.id === 'header') {
                    specificData = { title: storyData.title || "HİKAYE", subtitle: `Tarih: .................... | ${storyData.genre}` };
                } else if (item.id === 'story_block') {
                    specificData = { text: storyData.story };
                } else if (item.id === 'questions_5n1k') {
                    specificData = { questions: (storyData.fiveW1H || []).map(q => ({ text: q.question })) };
                } else if (item.id === 'questions_test') {
                    specificData = { questions: (storyData.multipleChoice || []).map(q => ({ text: q.question })) };
                } else if (item.id === 'vocabulary') {
                     specificData = { questions: (storyData.vocabulary || []).map(v => ({ text: `${v.word}: ${v.definition}` })) };
                }
            }
            return { ...item, specificData };
        }));
    }, [storyData]);

    // ... (Mouse Handlers same as before) ...
    const handleMouseDown = (e: React.MouseEvent, id: string, mode: 'drag' | 'resize' | 'rotate' = 'drag', handle?: string) => {
        if (!designMode) return;
        e.stopPropagation();
        const item = layout.find(l => l.instanceId === id);
        if (!item) return;
        setSelectedId(id);
        let centerX = 0; let centerY = 0;
        if (mode === 'rotate') {
             const element = e.currentTarget.parentElement; 
             if (element) {
                 const rect = element.getBoundingClientRect();
                 centerX = rect.left + rect.width / 2;
                 centerY = rect.top + rect.height / 2;
             }
        }
        setDragState({ mode, resizeHandle: handle, startX: e.clientX, startY: e.clientY, initialX: item.style.x, initialY: item.style.y, initialW: item.style.w, initialH: item.style.h, initialR: item.style.rotation || 0, centerX, centerY });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragState || !selectedId) return;
            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;
            const snap = (val: number) => Math.round(val / SNAP_GRID) * SNAP_GRID;

            setLayout(prev => prev.map(item => {
                if (item.instanceId !== selectedId) return item;
                let newStyle = { ...item.style };
                if (dragState.mode === 'drag') {
                    newStyle.x = snap(dragState.initialX + dx);
                    newStyle.y = snap(dragState.initialY + dy);
                } else if (dragState.mode === 'resize' && dragState.resizeHandle) {
                    const h = dragState.resizeHandle;
                    if (h.includes('e')) newStyle.w = Math.max(50, snap(dragState.initialW + dx));
                    if (h.includes('w')) { const newW = Math.max(50, snap(dragState.initialW - dx)); newStyle.x = snap(dragState.initialX + (dragState.initialW - newW)); newStyle.w = newW; }
                    if (h.includes('s')) newStyle.h = Math.max(50, snap(dragState.initialH + dy));
                    if (h.includes('n')) { const newH = Math.max(50, snap(dragState.initialH - dy)); newStyle.y = snap(dragState.initialY + (dragState.initialH - newH)); newStyle.h = newH; }
                } else if (dragState.mode === 'rotate' && dragState.centerX && dragState.centerY) {
                    const currentAngle = Math.atan2(e.clientY - dragState.centerY, e.clientX - dragState.centerX);
                    const startAngle = Math.atan2(dragState.startY - dragState.centerY, dragState.startX - dragState.centerX);
                    const deg = (currentAngle - startAngle) * (180 / Math.PI);
                    let finalR = Math.round(dragState.initialR + deg);
                    if (e.shiftKey) finalR = Math.round(finalR / 45) * 45;
                    newStyle.rotation = finalR;
                }
                return { ...item, style: newStyle };
            }));
        };
        const handleMouseUp = () => setDragState(null);
        if (dragState) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [dragState, selectedId]);

    // ... (Operations add/delete/update same as before) ...
    const addComponent = (def: ComponentDefinition) => {
        const newId = `${def.id}-${Date.now()}`;
        const newItem: ActiveComponent = { ...def, instanceId: newId, style: { ...DEFAULT_STYLE_BASE, ...def.defaultStyle, x: 20, y: 20 }, isVisible: true, customTitle: def.defaultTitle, themeColor: 'black', specificData: null };
        setLayout(prev => [...prev, newItem]);
        setSelectedId(newId);
    };
    const updateItem = (updates: Partial<ActiveComponent>) => { if (!selectedId) return; setLayout(prev => prev.map(item => item.instanceId === selectedId ? { ...item, ...updates } : item)); };
    const deleteItem = () => { if (!selectedId) return; if(confirm("Sil?")) { setLayout(prev => prev.filter(item => item.instanceId !== selectedId)); setSelectedId(null); } };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const data = await generateInteractiveStory(config);
            setStoryData(data);
        } catch (e) { alert("Hata"); } finally { setIsLoading(false); }
    };
    
    const handlePrint = async (action: 'print' | 'download') => {
        const prevMode = designMode;
        const prevSelected = selectedId;
        setDesignMode(false);
        setSelectedId(null);
        setTimeout(async () => { await printService.generatePdf('#canvas-root', storyData?.title || 'Hikaye', { action }); setDesignMode(prevMode); setSelectedId(prevSelected); }, 300);
    };

    // --- RENDER CONTENT (Updated to use specificData and granular styles) ---
    const renderContent = (item: ActiveComponent) => {
        const s = item.style;
        const boxStyle = {
            padding: `${s.padding}px`,
            backgroundColor: s.backgroundColor,
            borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`,
            borderStyle: s.borderStyle || 'solid',
            borderRadius: `${s.borderRadius}px`,
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none',
            opacity: s.opacity,
            color: s.color,
            fontFamily: s.fontFamily,
            fontSize: `${s.fontSize}px`,
            lineHeight: s.lineHeight,
            textAlign: s.textAlign as any,
            letterSpacing: `${s.letterSpacing}px`,
            fontWeight: s.fontWeight || 'normal'
        };

        // Header
        if (item.id === 'header') {
            const data = item.specificData || { title: "HİKAYE BAŞLIĞI", subtitle: `Tarih: ....................` };
            return (
                <div className="h-full flex flex-col justify-end" style={boxStyle}>
                    <h1 className="font-black uppercase leading-none tracking-tight" style={{fontSize: '2.5em', color: 'inherit'}}>{data.title}</h1>
                    <div className="flex justify-between items-end mt-2 opacity-70">
                        <span className="font-mono text-sm">{data.subtitle}</span>
                    </div>
                </div>
            );
        }

        // Story Text
        if (item.id === 'story_block') {
            const data = item.specificData || { text: "Hikaye metni bekleniyor..." };
            return (
                <div className="h-full relative overflow-hidden" style={boxStyle}>
                     {/* Image handling simplified for brevity, assume similar to before but using item.style.imageSettings */}
                     {item.style.imageSettings?.enabled && <div className="float-right w-1/3 h-32 bg-zinc-100 ml-4 mb-2 rounded-lg border flex items-center justify-center text-xs text-zinc-400">Görsel</div>}
                     <div dangerouslySetInnerHTML={{__html: data.text.replace(/\n/g, '<br/>')}}></div>
                </div>
            );
        }

        // Questions
        if (item.id.startsWith('questions') || item.id === 'vocabulary') {
            const data = item.specificData || { questions: [{text: "Madde 1..."}] };
            return (
                <div className="h-full flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                    <div className="flex-1 space-y-2 overflow-hidden">
                        {(data.questions || []).map((q: any, i: number) => (
                            <div key={i} className="flex gap-2">
                                <span className="font-bold">{i+1}.</span>
                                <p>{q.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        // Generic Fallback
        return (
             <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-300 rounded" style={boxStyle}>
                 <span className="opacity-50 font-bold">{item.label}</span>
             </div>
        );
    };

    const contentHeight = useMemo(() => {
        if (layout.length === 0) return A4_HEIGHT_PX;
        const maxBottom = Math.max(...layout.map(item => item.style.y + item.style.h));
        return Math.max(A4_HEIGHT_PX, maxBottom + PAGE_BOTTOM_PADDING);
    }, [layout]);

    return (
        <div className="h-full flex flex-col bg-zinc-100 dark:bg-black font-sans overflow-hidden">
             {/* TOP BAR */}
            <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-500"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-indigo-600">Reading Studio <span className="bg-indigo-100 px-1 rounded text-[9px]">PRO</span></span>
                </div>
                
                <div className="flex items-center gap-2">
                     <button onClick={() => setDesignMode(!designMode)} className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${designMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                         {designMode ? 'MİMARİ MOD' : 'ÖNİZLEME'}
                     </button>
                     <button onClick={() => handlePrint('print')} className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-600"><i className="fa-solid fa-print"></i></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 flex flex-col shrink-0 z-40">
                     <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                         <button onClick={() => setSidebarTab('settings')} className={`flex-1 py-3 text-xs font-bold uppercase ${sidebarTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-500'}`}>Ayarlar</button>
                         <button onClick={() => setSidebarTab('library')} className={`flex-1 py-3 text-xs font-bold uppercase ${sidebarTab === 'library' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-zinc-500'}`}>Bileşenler</button>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                         {/* Library List */}
                         {sidebarTab === 'library' && COMPONENT_DEFINITIONS.map(def => (
                            <button key={def.id} onClick={() => addComponent(def)} className="w-full flex items-center gap-3 p-3 bg-zinc-50 border rounded-xl mb-2 hover:bg-indigo-50 transition-colors">
                                <i className={`fa-solid ${def.icon} text-zinc-400`}></i> 
                                <div className="text-left">
                                    <span className="text-xs font-bold block">{def.label}</span>
                                    <span className="text-[9px] text-zinc-400 block">{def.description}</span>
                                </div>
                            </button>
                         ))}
                         {/* Settings Config */}
                         {sidebarTab === 'settings' && (
                             <div className="space-y-6">
                                {/* 1. Öğrenci Bilgileri */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-user-graduate"></i> Öğrenci Profili</h4>
                                    <div>
                                        <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Ad Soyad</label>
                                        <input type="text" value={config.studentName} onChange={e => setConfig({...config, studentName: e.target.value})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Örn: Ali Yılmaz" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Sınıf</label>
                                            <select value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none">
                                                {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Hikaye Ayarları */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-book"></i> Hikaye Kurgusu</h4>
                                    <div>
                                        <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Konu</label>
                                        <input type="text" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Örn: Uzay Maceraları" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Tür</label>
                                            <select value={config.genre} onChange={e => setConfig({...config, genre: e.target.value})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none">
                                                {['Macera', 'Masal', 'Bilim Kurgu', 'Günlük Yaşam', 'Fabl'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Ton</label>
                                            <select value={config.tone} onChange={e => setConfig({...config, tone: e.target.value})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none">
                                                {['Eğlenceli', 'Öğretici', 'Gizemli', 'Duygusal'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                         <div>
                                            <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Uzunluk</label>
                                            <select value={config.length} onChange={e => setConfig({...config, length: e.target.value as any})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none">
                                                <option value="short">Kısa</option>
                                                <option value="medium">Orta</option>
                                                <option value="long">Uzun</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Dil Seviyesi</label>
                                            <select value={config.textComplexity} onChange={e => setConfig({...config, textComplexity: e.target.value as any})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none">
                                                <option value="simple">Basit</option>
                                                <option value="moderate">Orta</option>
                                                <option value="advanced">İleri</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Görsel Ayarları */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-image"></i> Görsel Üretim</h4>
                                    <div className="flex items-center justify-between p-2 border border-zinc-200 rounded-lg bg-zinc-50">
                                        <span className="text-xs font-medium text-zinc-700">AI Görsel Oluştur</span>
                                        <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${config.imageGeneration.enabled ? 'bg-indigo-500' : 'bg-zinc-300'}`} onClick={() => setConfig({...config, imageGeneration: {...config.imageGeneration, enabled: !config.imageGeneration.enabled}})}>
                                            <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${config.imageGeneration.enabled ? 'left-5' : 'left-1'}`}></div>
                                        </div>
                                    </div>
                                    {config.imageGeneration.enabled && (
                                        <div>
                                            <label className="text-[9px] font-bold text-zinc-500 mb-1 block">Çizim Stili</label>
                                            <select value={config.imageGeneration.style} onChange={e => setConfig({...config, imageGeneration: {...config.imageGeneration, style: e.target.value as any}})} className="w-full p-2 border border-zinc-200 rounded-lg text-xs bg-zinc-50 focus:ring-1 focus:ring-indigo-500 outline-none">
                                                <option value="storybook">Masal Kitabı</option>
                                                <option value="cartoon">Çizgi Film</option>
                                                <option value="watercolor">Sulu Boya</option>
                                                <option value="realistic">Gerçekçi</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* 4. Bileşen Seçimi */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-puzzle-piece"></i> Dahil Edilecekler</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: '5N 1K Soruları', key: 'include5N1K' },
                                            { label: 'Test Soruları', key: 'countMultipleChoice', isCount: true },
                                            { label: 'Doğru/Yanlış', key: 'countTrueFalse', isCount: true },
                                            { label: 'Sözlükçe', key: 'focusVocabulary' },
                                            { label: 'Yaratıcı Görev', key: 'includeCreativeTask' }
                                        ].map((opt: any, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => {
                                                    if (opt.isCount) {
                                                        const val = (config as any)[opt.key] > 0 ? 0 : 3; // Toggle between 0 and 3
                                                        setConfig({...config, [opt.key]: val});
                                                    } else {
                                                        setConfig({...config, [opt.key]: !(config as any)[opt.key]});
                                                    }
                                                }}
                                                className={`p-2 rounded-lg text-[10px] font-bold border transition-colors ${
                                                    (opt.isCount ? (config as any)[opt.key] > 0 : (config as any)[opt.key]) 
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                                    : 'bg-white border-zinc-200 text-zinc-400'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleGenerate} 
                                    disabled={isLoading}
                                    className="w-full py-4 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    {isLoading ? 'Hikaye Yazılıyor...' : 'Hikayeyi Oluştur'}
                                </button>
                             </div>
                         )}
                     </div>
                </div>

                {/* CANVAS */}
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto flex justify-center relative custom-scrollbar" onClick={(e) => { if(e.target === e.currentTarget) setSelectedId(null); }}>
                    <div className="p-8 origin-top">
                        <div id="canvas-root" className="bg-white shadow-2xl relative transition-all duration-300" style={{ width: `${A4_WIDTH_PX}px`, height: `${contentHeight}px`, transform: 'scale(1)', transformOrigin: 'top center' }}>
                            {designMode && <div className="absolute inset-0 pointer-events-none z-0" style={{backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: `${SNAP_GRID * 4}px ${SNAP_GRID * 4}px`}}></div>}
                            {layout.map((item) => (
                                <div key={item.instanceId} onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'drag')} className={`absolute ${designMode ? 'hover:ring-1 hover:ring-indigo-300 cursor-move' : ''}`} style={{ left: item.style.x, top: item.style.y, width: item.style.w, height: item.style.h, transform: `rotate(${item.style.rotation || 0}deg)`, zIndex: item.style.zIndex }}>
                                    {designMode && selectedId === item.instanceId && (
                                        <div className="absolute inset-0 border-2 border-indigo-600 z-50 pointer-events-none">
                                            <div className="pointer-events-auto"><RotateHandle onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'rotate')} /></div>
                                            <div className="pointer-events-auto"><ResizeHandle cursor="se-resize" position="-bottom-1.5 -right-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'se')} /></div>
                                        </div>
                                    )}
                                    <div className="w-full h-full overflow-hidden pointer-events-none">{renderContent(item)}</div>
                                </div>
                            ))}
                            {/* Sticky Footer */}
                            <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-zinc-400 font-mono pointer-events-none flex justify-between px-8"><span>Bursa Disleksi AI © {new Date().getFullYear()}</span><span>Sayfa 1</span></div>
                        </div>
                    </div>
                </div>

                {/* SETTINGS DOCK */}
                {selectedId && (
                    <div className="shrink-0 z-50 h-full border-l border-zinc-200 shadow-xl relative">
                        <SettingsStation item={layout.find(l => l.instanceId === selectedId)!} onUpdate={updateItem} onClose={() => setSelectedId(null)} onDelete={deleteItem} />
                    </div>
                )}
            </div>
        </div>
    );
};
