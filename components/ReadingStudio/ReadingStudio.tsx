
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InteractiveStoryData, LayoutSectionId, LayoutItem, ReadingStudioConfig } from '../../types';
import { generateInteractiveStory } from '../../services/generators/readingStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { ImageDisplay, QUESTION_TYPES, StoryHighlighter } from '../sheets/common';
import { EditableText } from '../Editable';

// --- CONFIGURATION CONSTANTS ---
const SNAP_GRID = 5; // 5px precision grid
const A4_WIDTH_PX = 794; // approx 210mm @ 96dpi
const A4_HEIGHT_PX = 1123; // approx 297mm @ 96dpi

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
    instanceId: string; // Unique ID for multiples
}

const DEFAULT_STYLE_BASE: LayoutItem['style'] = {
    x: 20, y: 20, w: 754, h: 100, zIndex: 1, rotation: 0,
    padding: 10,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    opacity: 1,
    boxShadow: 'none',
    textAlign: 'left',
    color: '#000000',
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

const SettingsStation = ({ item, onUpdate, onClose, onDelete }: { item: ActiveComponent, onUpdate: (updates: Partial<ActiveComponent>) => void, onClose: () => void, onDelete: () => void }) => {
    
    const [activeTab, setActiveTab] = useState<'layout' | 'style' | 'image' | 'content'>('layout');

    // Prevent clicks inside the panel from propagating to the canvas (which would deselect the item)
    const handlePanelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const updateStyle = (key: keyof LayoutItem['style'], value: any) => {
        onUpdate({ style: { ...item.style, [key]: value } });
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
        <div 
            className="w-80 h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 shadow-xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300"
            onClick={handlePanelClick}
        >
            {/* Header */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center shrink-0">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon}`}></i> {item.label}
                </h3>
                <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shrink-0">
                {[
                    { id: 'layout', icon: 'fa-ruler-combined', label: 'Düzen' },
                    { id: 'style', icon: 'fa-palette', label: 'Stil' },
                    { id: 'image', icon: 'fa-image', label: 'Görsel' },
                    { id: 'content', icon: 'fa-pen', label: 'İçerik' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-b-2 border-indigo-600' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white dark:bg-zinc-900">
                
                {/* 1. LAYOUT TAB */}
                {activeTab === 'layout' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Boyut & Konum</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['x', 'y', 'w', 'h', 'rotation'].map((key) => (
                                    <div key={key} className="flex items-center bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-lg px-2 py-1.5 focus-within:ring-2 ring-indigo-100">
                                        <span className="text-[10px] font-black text-zinc-400 w-6 uppercase truncate mr-1">
                                            {key === 'rotation' ? 'Rot' : key}
                                        </span>
                                        <input 
                                            type="number" 
                                            value={Math.round(item.style[key as keyof typeof item.style] as number || 0)} 
                                            onChange={e => updateStyle(key as any, Number(e.target.value))} 
                                            className="w-full bg-transparent text-xs font-mono outline-none text-right text-zinc-900 dark:text-zinc-100" 
                                        />
                                        {key === 'rotation' && <span className="text-[9px] text-zinc-400 ml-1">°</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Katman (Z-Index)</label>
                            <div className="flex gap-2">
                                <button onClick={() => updateStyle('zIndex', (item.style.zIndex || 0) + 1)} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2"><i className="fa-solid fa-arrow-up"></i> Öne</button>
                                <button onClick={() => updateStyle('zIndex', Math.max(0, (item.style.zIndex || 0) - 1))} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2"><i className="fa-solid fa-arrow-down"></i> Arkaya</button>
                            </div>
                            <div className="text-center text-[10px] text-zinc-400 font-mono">Mevcut Katman: {item.style.zIndex}</div>
                        </div>
                    </div>
                )}

                {/* 2. STYLE TAB */}
                {activeTab === 'style' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Arka Plan</span>
                            <div className="flex items-center gap-2 border dark:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800">
                                <input type="color" value={item.style.backgroundColor === 'transparent' ? '#ffffff' : item.style.backgroundColor} onChange={e => updateStyle('backgroundColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                <div className="flex-1">
                                    <button onClick={() => updateStyle('backgroundColor', 'transparent')} className={`text-xs px-2 py-1 rounded w-full transition-colors ${item.style.backgroundColor === 'transparent' ? 'bg-zinc-200 dark:bg-zinc-600 font-bold text-zinc-800 dark:text-zinc-100' : 'hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300'}`}>Şeffaf</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Kenarlık & Yuvarlaklık</span>
                            <div className="flex items-center gap-2 mb-2">
                                <input type="color" value={item.style.borderColor === 'transparent' ? '#000000' : item.style.borderColor} onChange={e => updateStyle('borderColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 shrink-0" />
                                <input type="range" min="0" max="10" value={item.style.borderWidth} onChange={e => updateStyle('borderWidth', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                <span className="text-[10px] w-4 text-right text-zinc-600 dark:text-zinc-400">{item.style.borderWidth}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fa-regular fa-square text-zinc-400 text-xs"></i>
                                <input type="range" min="0" max="50" value={item.style.borderRadius || 0} onChange={e => updateStyle('borderRadius', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                <i className="fa-regular fa-circle text-zinc-400 text-xs"></i>
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Gölge Efekti</span>
                            <div className="grid grid-cols-4 gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-1 border dark:border-zinc-700">
                                {['none', 'sm', 'md', 'lg'].map(s => (
                                    <button key={s} onClick={() => updateStyle('boxShadow', s)} className={`text-[9px] py-1.5 rounded-md uppercase font-bold transition-all ${item.style.boxShadow === s ? 'bg-white dark:bg-zinc-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. IMAGE TAB (NEW & ADVANCED) */}
                {activeTab === 'image' && (
                    <div className="space-y-5 animate-in fade-in">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Görsel Göster</span>
                            <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.style.imageSettings?.enabled ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => updateImageSettings('enabled', !item.style.imageSettings?.enabled)}>
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${item.style.imageSettings?.enabled ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>

                        {item.style.imageSettings?.enabled && (
                            <>
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Konumlandırma</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'top', icon: 'fa-arrow-up', label: 'Üst' },
                                            { id: 'bottom', icon: 'fa-arrow-down', label: 'Alt' },
                                            { id: 'left', icon: 'fa-align-left', label: 'Sol' },
                                            { id: 'right', icon: 'fa-align-right', label: 'Sağ' },
                                            { id: 'background', icon: 'fa-image', label: 'Arka' },
                                            { id: 'overlay', icon: 'fa-layer-group', label: 'Ön' }
                                        ].map(pos => (
                                            <button 
                                                key={pos.id}
                                                onClick={() => updateImageSettings('position', pos.id)}
                                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${item.style.imageSettings?.position === pos.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                                            >
                                                <i className={`fa-solid ${pos.icon} mb-1 text-sm`}></i>
                                                <span className="text-[9px] font-bold">{pos.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Boyut</span>
                                            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">{item.style.imageSettings?.widthPercent}%</span>
                                        </div>
                                        <input type="range" min="10" max="100" value={item.style.imageSettings?.widthPercent || 40} onChange={e => updateImageSettings('widthPercent', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Opaklık</span>
                                            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">{Math.round((item.style.imageSettings?.opacity || 1) * 100)}%</span>
                                        </div>
                                        <input type="range" min="0" max="1" step="0.1" value={item.style.imageSettings?.opacity || 1} onChange={e => updateImageSettings('opacity', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase">Köşe Yuvarlaklığı</span>
                                            <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">{item.style.imageSettings?.borderRadius}px</span>
                                        </div>
                                        <input type="range" min="0" max="50" value={item.style.imageSettings?.borderRadius || 0} onChange={e => updateImageSettings('borderRadius', Number(e.target.value))} className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                                    </div>
                                </div>
                                
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                     <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Karışım Modu (Efekt)</label>
                                     <select 
                                        value={item.style.imageSettings?.blendMode || 'normal'} 
                                        onChange={e => updateImageSettings('blendMode', e.target.value)}
                                        className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs outline-none text-zinc-900 dark:text-zinc-100"
                                     >
                                         <option value="normal">Normal</option>
                                         <option value="multiply">Multiply (Koyulaştır)</option>
                                         <option value="screen">Screen (Aydınlat)</option>
                                         <option value="overlay">Overlay (Kapla)</option>
                                         <option value="darken">Darken</option>
                                         <option value="lighten">Lighten</option>
                                     </select>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* 4. CONTENT TAB */}
                {activeTab === 'content' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Başlık</span>
                            <input type="text" value={item.customTitle || ''} onChange={e => onUpdate({customTitle: e.target.value})} className="w-full p-2.5 border rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-900 dark:text-zinc-100" />
                        </div>
                        
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Tema Rengi</span>
                                <div className="flex items-center gap-2 border dark:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-800">
                                    <input type="color" value={item.themeColor || '#000000'} onChange={e => onUpdate({themeColor: e.target.value})} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                                    <span className="text-xs font-mono text-zinc-500">{item.themeColor}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Metin Hizala</span>
                                <div className="flex bg-zinc-50 dark:bg-zinc-800 rounded-lg border dark:border-zinc-700 p-1 h-12 items-center">
                                    {['left', 'center', 'right', 'justify'].map((align: any) => (
                                        <button key={align} onClick={() => updateStyle('textAlign', align)} className={`flex-1 h-8 flex items-center justify-center rounded text-xs transition-colors ${item.style.textAlign === align ? 'bg-white dark:bg-zinc-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-zinc-400 hover:text-zinc-600'}`}>
                                            <i className={`fa-solid fa-align-${align}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 shrink-0">
                <button onClick={onDelete} className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2">
                    <i className="fa-solid fa-trash"></i> Bileşeni Sil
                </button>
            </div>
        </div>
    );
}

// --- MAIN CANVAS COMPONENT ---

export const ReadingStudio: React.FC<any> = ({ onBack, onAddToWorkbook }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'settings' | 'library'>('settings');
    
    // Canvas State
    const [layout, setLayout] = useState<ActiveComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);

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
            
            // Special layout for specific components to make it "Compact"
            if (def.id === 'tracker') {
                itemW = 200;
                itemX = A4_WIDTH_PX - 20 - 200; // Right align
                itemY = 35; // Fixed position inside/near header area
                // Do not increment currentY for tracker, it sits in header space
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
                    zIndex: def.id === 'tracker' ? 10 : index + 1 // Keep tracker on top
                },
                isVisible: true,
                customTitle: def.defaultTitle,
                themeColor: 'black'
            });
        });

        setLayout(generatedLayout);
    }, []);

    // Config State (For AI Generation)
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

    // Interaction State
    const [dragState, setDragState] = useState<{
        mode: 'drag' | 'resize' | 'rotate';
        resizeHandle?: string;
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
        initialW: number;
        initialH: number;
        initialR: number;
        centerX?: number;
        centerY?: number;
    } | null>(null);

    // --- MOUSE HANDLERS ---

    const handleMouseDown = (e: React.MouseEvent, id: string, mode: 'drag' | 'resize' | 'rotate' = 'drag', handle?: string) => {
        if (!designMode) return;
        e.stopPropagation();
        
        const item = layout.find(l => l.instanceId === id);
        if (!item) return;

        setSelectedId(id);

        // For rotation, we need center point relative to screen
        let centerX = 0; 
        let centerY = 0;
        
        if (mode === 'rotate') {
             const element = e.currentTarget.parentElement; // The .absolute wrapper
             if (element) {
                 const rect = element.getBoundingClientRect();
                 centerX = rect.left + rect.width / 2;
                 centerY = rect.top + rect.height / 2;
             }
        }

        setDragState({
            mode: mode,
            resizeHandle: handle,
            startX: e.clientX,
            startY: e.clientY,
            initialX: item.style.x,
            initialY: item.style.y,
            initialW: item.style.w,
            initialH: item.style.h,
            initialR: item.style.rotation || 0,
            centerX,
            centerY
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragState || !selectedId) return;

            const dx = e.clientX - dragState.startX;
            const dy = e.clientY - dragState.startY;

            // Micro-Grid Snapping
            const snap = (val: number) => Math.round(val / SNAP_GRID) * SNAP_GRID;

            setLayout(prev => prev.map(item => {
                if (item.instanceId !== selectedId) return item;

                let newStyle = { ...item.style };

                if (dragState.mode === 'drag') {
                    newStyle.x = snap(dragState.initialX + dx);
                    newStyle.y = snap(dragState.initialY + dy);
                } 
                
                else if (dragState.mode === 'resize' && dragState.resizeHandle) {
                    const h = dragState.resizeHandle;
                    
                    if (h.includes('e')) newStyle.w = Math.max(50, snap(dragState.initialW + dx));
                    if (h.includes('w')) {
                        const newW = Math.max(50, snap(dragState.initialW - dx));
                        newStyle.x = snap(dragState.initialX + (dragState.initialW - newW));
                        newStyle.w = newW;
                    }
                    if (h.includes('s')) newStyle.h = Math.max(50, snap(dragState.initialH + dy));
                    if (h.includes('n')) {
                        const newH = Math.max(50, snap(dragState.initialH - dy));
                        newStyle.y = snap(dragState.initialY + (dragState.initialH - newH));
                        newStyle.h = newH;
                    }
                }
                
                else if (dragState.mode === 'rotate') {
                    if (dragState.centerX && dragState.centerY) {
                        const currentAngle = Math.atan2(e.clientY - dragState.centerY, e.clientX - dragState.centerX);
                        const startAngle = Math.atan2(dragState.startY - dragState.centerY, dragState.startX - dragState.centerX);
                        const deg = (currentAngle - startAngle) * (180 / Math.PI);
                        let finalR = Math.round(dragState.initialR + deg);
                        // Optional Snap to 45 deg
                        if (e.shiftKey) {
                             finalR = Math.round(finalR / 45) * 45;
                        }
                        newStyle.rotation = finalR;
                    }
                }

                return { ...item, style: newStyle };
            }));
        };

        const handleMouseUp = () => {
            setDragState(null);
        };

        if (dragState) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragState, selectedId]);


    // --- OPERATIONS ---

    const addComponent = (def: ComponentDefinition) => {
        const newId = `${def.id}-${Date.now()}`;
        const newItem: ActiveComponent = {
            ...def,
            instanceId: newId,
            style: { ...DEFAULT_STYLE_BASE, ...def.defaultStyle, x: 20, y: 20 },
            isVisible: true,
            customTitle: def.defaultTitle,
            themeColor: 'black'
        };
        setLayout(prev => [...prev, newItem]);
        setSelectedId(newId);
    };

    const updateItem = (updates: Partial<ActiveComponent>) => {
        if (!selectedId) return;
        setLayout(prev => prev.map(item => item.instanceId === selectedId ? { ...item, ...updates } : item));
    };

    const deleteItem = () => {
        if (!selectedId) return;
        if(confirm("Bileşeni silmek istiyor musunuz?")) {
            setLayout(prev => prev.filter(item => item.instanceId !== selectedId));
            setSelectedId(null);
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const data = await generateInteractiveStory(config);
            setStoryData(data);
        } catch (e) {
            alert("Üretim hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = async (action: 'print' | 'download') => {
        const prevMode = designMode;
        const prevSelected = selectedId;
        setDesignMode(false);
        setSelectedId(null);
        setTimeout(async () => {
            await printService.generatePdf('#canvas-root', storyData?.title || 'Hikaye', { action });
            setDesignMode(prevMode);
            setSelectedId(prevSelected);
        }, 300);
    };

    // --- RENDER CONTENT ---
    const renderContent = (item: ActiveComponent) => {
        const titleStyle = { color: item.themeColor || 'black', textAlign: item.style.textAlign || 'left' };
        
        // --- HEADER ---
        if (item.id === 'header') return (
            <div className="h-full flex flex-col justify-end border-b-4 pb-2" style={{borderColor: item.themeColor}}>
                <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-zinc-900">{storyData?.title || "HİKAYE BAŞLIĞI"}</h1>
                <div className="flex justify-between items-end mt-2">
                    <span className="bg-zinc-800 text-white px-2 py-0.5 text-[10px] font-bold uppercase rounded">{config.genre}</span>
                    <span className="text-[10px] font-mono text-zinc-400">Tarih: ....................</span>
                </div>
            </div>
        );

        // --- STORY TEXT (ENHANCED IMAGE ENGINE) ---
        if (item.id === 'story_block') {
            const imgSettings = item.style.imageSettings || { 
                enabled: true, 
                position: 'right', 
                widthPercent: 40, 
                opacity: 1, 
                objectFit: 'cover', 
                borderRadius: 8, 
                blendMode: 'normal',
                filter: 'none'
            };
            
            // Calculate styles for image container
            let imgContainerStyle: React.CSSProperties = {
                opacity: imgSettings.opacity,
                borderRadius: `${imgSettings.borderRadius}px`,
                mixBlendMode: imgSettings.blendMode as any,
                filter: imgSettings.filter !== 'none' ? `${imgSettings.filter}(100%)` : 'none',
                overflow: 'hidden'
            };
            
            let wrapperClass = "relative h-full";
            let imgWrapperClass = "";

            if (imgSettings.enabled) {
                if (imgSettings.position === 'background') {
                    imgWrapperClass = "absolute inset-0 z-0";
                } else if (imgSettings.position === 'overlay') {
                    imgWrapperClass = "absolute z-20 shadow-xl border-2 border-white";
                    imgContainerStyle = { ...imgContainerStyle, width: `${imgSettings.widthPercent}%`, height: 'auto', right: 0, bottom: 0 }; 
                } else if (imgSettings.position === 'top') {
                    wrapperClass = "flex flex-col h-full";
                    imgWrapperClass = "w-full mb-4 shrink-0";
                    imgContainerStyle = { ...imgContainerStyle, height: `${imgSettings.widthPercent}%` }; 
                } else if (imgSettings.position === 'bottom') {
                    wrapperClass = "flex flex-col-reverse h-full";
                    imgWrapperClass = "w-full mt-4 shrink-0";
                    imgContainerStyle = { ...imgContainerStyle, height: `${imgSettings.widthPercent}%` };
                } else if (imgSettings.position === 'left') {
                    imgWrapperClass = `float-left mr-4 mb-2 z-10 relative`;
                    imgContainerStyle = { ...imgContainerStyle, width: `${imgSettings.widthPercent}%` };
                } else { // Right (default)
                    imgWrapperClass = `float-right ml-4 mb-2 z-10 relative`;
                    imgContainerStyle = { ...imgContainerStyle, width: `${imgSettings.widthPercent}%` };
                }
            }

            return (
                <div className={wrapperClass}>
                    {imgSettings.enabled && (
                        <div className={`${imgWrapperClass}`} style={imgContainerStyle}>
                             <div className="w-full h-full bg-zinc-50 border border-zinc-200 overflow-hidden shadow-sm" style={{aspectRatio: '4/3'}}>
                                 <ImageDisplay prompt={storyData?.imagePrompt} description={storyData?.title} className={`w-full h-full ${imgSettings.objectFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                             </div>
                        </div>
                    )}
                    
                    <div className="text-sm text-justify leading-relaxed relative z-10 text-zinc-900" style={{
                        fontFamily: config.fontSettings.family,
                        fontSize: `${config.fontSettings.size}px`,
                        lineHeight: config.fontSettings.lineHeight
                    }}>
                        {storyData ? <StoryHighlighter text={storyData.story} highlights={[]} /> : <p className="opacity-40 italic">Hikaye metni buraya gelecek... (AI Üretimi Bekleniyor)</p>}
                    </div>
                </div>
            );
        }

        // --- QUESTIONS ---
        if (item.id.startsWith('questions')) return (
            <div className="h-full flex flex-col">
                <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 text-zinc-900" style={titleStyle}>{item.customTitle}</h4>
                <div className="flex-1 space-y-2 overflow-hidden">
                    {storyData ? (
                        [1,2,3].map(i => <div key={i} className="h-2 bg-zinc-100 rounded w-full"></div>)
                    ) : <p className="text-[10px] text-zinc-400 italic">Soru alanı...</p>}
                </div>
            </div>
        );

        // --- GENERIC ---
        return (
            <div className="h-full border-2 border-dashed border-zinc-200 rounded-lg p-2 flex flex-col justify-center items-center opacity-50">
                <i className={`fa-solid ${item.customIcon || item.icon} text-2xl mb-1 text-zinc-400`}></i>
                <span className="text-[10px] font-bold uppercase text-zinc-400">{item.customTitle}</span>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-zinc-100 dark:bg-black font-sans overflow-hidden">
            
            {/* TOP BAR */}
            <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-500"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-indigo-600">Reading Studio <span className="bg-indigo-100 px-1 rounded text-[9px]">V2</span></span>
                </div>
                
                <div className="flex items-center gap-2">
                     <button onClick={() => setDesignMode(!designMode)} className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${designMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                         {designMode ? 'MİMARİ MOD' : 'ÖNİZLEME'}
                     </button>
                     <div className="h-6 w-px bg-zinc-200 mx-2"></div>
                     <button onClick={() => handlePrint('print')} className="w-8 h-8 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-600"><i className="fa-solid fa-print"></i></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                
                {/* LEFT SIDEBAR (LIBRARY & SETTINGS) */}
                <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 flex flex-col shrink-0 z-40">
                    
                    {/* TABS */}
                    <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                         <button 
                            onClick={() => setSidebarTab('settings')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${sidebarTab === 'settings' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white dark:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-800'}`}
                         >
                            <i className="fa-solid fa-sliders mr-2"></i> Ayarlar
                         </button>
                         <button 
                            onClick={() => setSidebarTab('library')}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${sidebarTab === 'library' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white dark:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-800'}`}
                         >
                            <i className="fa-solid fa-cubes mr-2"></i> Bileşenler
                         </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {sidebarTab === 'settings' && (
                            <div className="p-5 space-y-6">
                                {/* Story Settings */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-1">Hikaye Ayarları</h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-600 mb-1">Konu</label>
                                        <input 
                                            type="text" 
                                            value={config.topic} 
                                            onChange={e => setConfig({...config, topic: e.target.value})}
                                            className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-900"
                                            placeholder="Örn: Uzay Macerası"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-600 mb-1">Sınıf</label>
                                            <select 
                                                value={config.gradeLevel} 
                                                onChange={e => setConfig({...config, gradeLevel: e.target.value})}
                                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none text-zinc-900"
                                            >
                                                {['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-600 mb-1">Tür</label>
                                            <select 
                                                value={config.genre} 
                                                onChange={e => setConfig({...config, genre: e.target.value})}
                                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none text-zinc-900"
                                            >
                                                {['Macera', 'Masal', 'Bilim Kurgu', 'Eğitici', 'Komik'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-600 mb-1">Ton</label>
                                            <select 
                                                value={config.tone} 
                                                onChange={e => setConfig({...config, tone: e.target.value})}
                                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none text-zinc-900"
                                            >
                                                {['Eğlenceli', 'Ciddi', 'Gizemli', 'Öğretici'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-600 mb-1">Uzunluk</label>
                                            <select 
                                                value={config.length} 
                                                onChange={e => setConfig({...config, length: e.target.value})}
                                                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none text-zinc-900"
                                            >
                                                <option value="short">Kısa</option>
                                                <option value="medium">Orta</option>
                                                <option value="long">Uzun</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* AI Image Generation Control (NEW) */}
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold text-indigo-900 uppercase">Yapay Zeka Görseli</label>
                                            <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${config.imageGeneration?.enabled ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => setConfig({...config, imageGeneration: {...config.imageGeneration, enabled: !config.imageGeneration.enabled}})}>
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${config.imageGeneration?.enabled ? 'left-4.5' : 'left-0.5'}`}></div>
                                            </div>
                                        </div>
                                        {config.imageGeneration?.enabled && (
                                            <select 
                                                value={config.imageGeneration.style}
                                                onChange={(e) => setConfig({...config, imageGeneration: {...config.imageGeneration, style: e.target.value as any}})}
                                                className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs outline-none text-zinc-800"
                                            >
                                                <option value="storybook">Hikaye Kitabı (Çizim)</option>
                                                <option value="realistic">Gerçekçi</option>
                                                <option value="cartoon">Karikatür / Çizgi Film</option>
                                                <option value="sketch">Karakalem</option>
                                                <option value="watercolor">Sulu Boya</option>
                                                <option value="3d_render">3D Render (Sevimli)</option>
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Style Settings */}
                                <div className="space-y-4 pt-4 border-t border-zinc-100">
                                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-1">Görünüm</h4>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-600 mb-1">Yazı Tipi</label>
                                        <select 
                                            value={config.fontSettings.family} 
                                            onChange={e => setConfig({...config, fontSettings: {...config.fontSettings, family: e.target.value}})}
                                            className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none text-zinc-900"
                                        >
                                            <option value="OpenDyslexic">OpenDyslexic (Okuma Dostu)</option>
                                            <option value="Lexend">Lexend</option>
                                            <option value="Comic Neue">Comic Neue</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                                            <span>Punto</span>
                                            <span>{config.fontSettings.size}px</span>
                                        </label>
                                        <input 
                                            type="range" min="12" max="32" 
                                            value={config.fontSettings.size} 
                                            onChange={e => setConfig({...config, fontSettings: {...config.fontSettings, size: Number(e.target.value)}})}
                                            className="w-full accent-indigo-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="flex justify-between text-xs font-bold text-zinc-600 mb-1">
                                            <span>Satır Aralığı</span>
                                            <span>{config.fontSettings.lineHeight}</span>
                                        </label>
                                        <input 
                                            type="range" min="1" max="2.5" step="0.1"
                                            value={config.fontSettings.lineHeight} 
                                            onChange={e => setConfig({...config, fontSettings: {...config.fontSettings, lineHeight: Number(e.target.value)}})}
                                            className="w-full accent-indigo-600"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleGenerate} 
                                    disabled={isLoading} 
                                    className="w-full py-4 bg-zinc-900 hover:bg-black text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-transform active:scale-95 disabled:opacity-50 mt-4"
                                >
                                    {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                                    HİKAYE OLUŞTUR
                                </button>
                            </div>
                        )}

                        {sidebarTab === 'library' && (
                            <div className="p-4 space-y-2">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 pl-2">Sürükle veya Tıkla</p>
                                {COMPONENT_DEFINITIONS.map(def => (
                                    <button 
                                        key={def.id}
                                        onClick={() => addComponent(def)}
                                        className="w-full flex items-center gap-3 p-3 bg-zinc-50 hover:bg-indigo-50 border border-zinc-100 hover:border-indigo-200 rounded-xl transition-all group text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 transition-colors">
                                            <i className={`fa-solid ${def.icon}`}></i>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-zinc-700 group-hover:text-indigo-900">{def.label}</div>
                                            <div className="text-[9px] text-zinc-400">{def.defaultTitle}</div>
                                        </div>
                                        <i className="fa-solid fa-plus ml-auto text-zinc-300 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CENTER CANVAS */}
                <div 
                    className="flex-1 bg-zinc-100 dark:bg-zinc-950 overflow-auto flex justify-center relative custom-scrollbar"
                    // Removed the onClick here to prevent deselection when interacting with handles inside canvas
                    onClick={(e) => { 
                        // Only deselect if clicked directly on the canvas background
                        if (e.target === e.currentTarget) {
                            setSelectedId(null);
                        }
                    }}
                >
                    <div className="p-8 origin-top">
                        <div 
                            id="canvas-root"
                            className="bg-white shadow-2xl relative transition-all duration-300"
                            style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px`, transform: 'scale(1)', transformOrigin: 'top center' }}
                        >
                            {/* Background Grid for Precision */}
                            {designMode && (
                                <div className="absolute inset-0 pointer-events-none z-0" 
                                    style={{backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: `${SNAP_GRID * 4}px ${SNAP_GRID * 4}px`}}>
                                </div>
                            )}

                            {layout.map((item) => {
                                const isSelected = selectedId === item.instanceId;
                                
                                return (
                                    <div
                                        key={item.instanceId}
                                        onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'drag')}
                                        className={`absolute ${designMode ? 'hover:ring-1 hover:ring-indigo-300 cursor-move' : ''}`}
                                        style={{
                                            left: item.style.x,
                                            top: item.style.y,
                                            width: item.style.w,
                                            height: item.style.h,
                                            transform: `rotate(${item.style.rotation || 0}deg)`,
                                            zIndex: item.style.zIndex,
                                            padding: item.style.padding,
                                            backgroundColor: item.style.backgroundColor,
                                            borderColor: item.style.borderColor,
                                            borderWidth: item.style.borderWidth,
                                            borderRadius: item.style.borderRadius,
                                            boxShadow: item.style.boxShadow === 'none' ? 'none' : `var(--shadow-${item.style.boxShadow})`
                                        }}
                                    >
                                        {/* Selection Frame */}
                                        {designMode && isSelected && (
                                            <div className="absolute inset-0 border-2 border-indigo-600 z-50 pointer-events-none" style={{ margin: -2 }}>
                                                {/* Info Badge */}
                                                <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-t font-bold uppercase tracking-widest whitespace-nowrap pointer-events-auto">
                                                    {item.label} • {Math.round(item.style.rotation || 0)}°
                                                </div>
                                                
                                                {/* Rotation Handle */}
                                                <div className="pointer-events-auto">
                                                    <RotateHandle onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'rotate')} />
                                                </div>

                                                {/* Resize Handles */}
                                                <div className="pointer-events-auto">
                                                    <ResizeHandle cursor="nw-resize" position="-top-1.5 -left-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'nw')} />
                                                    <ResizeHandle cursor="n-resize" position="-top-1.5 left-1/2 -translate-x-1/2" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'n')} />
                                                    <ResizeHandle cursor="ne-resize" position="-top-1.5 -right-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'ne')} />
                                                    <ResizeHandle cursor="e-resize" position="top-1/2 -translate-y-1/2 -right-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'e')} />
                                                    <ResizeHandle cursor="se-resize" position="-bottom-1.5 -right-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'se')} />
                                                    <ResizeHandle cursor="s-resize" position="-bottom-1.5 left-1/2 -translate-x-1/2" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 's')} />
                                                    <ResizeHandle cursor="sw-resize" position="-bottom-1.5 -left-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'sw')} />
                                                    <ResizeHandle cursor="w-resize" position="top-1/2 -translate-y-1/2 -left-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'w')} />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Content Render */}
                                        <div className="w-full h-full overflow-hidden pointer-events-none">
                                            {renderContent(item)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* SETTINGS STATION (RIGHT PANEL - DOCKED) */}
                {selectedId && (
                    <div className="shrink-0 z-50 h-full border-l border-zinc-200 shadow-xl relative">
                        <SettingsStation 
                            item={layout.find(l => l.instanceId === selectedId)!} 
                            onUpdate={updateItem} 
                            onClose={() => setSelectedId(null)}
                            onDelete={deleteItem}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
