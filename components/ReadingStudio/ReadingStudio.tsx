
import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { InteractiveStoryData, LayoutSectionId, LayoutItem, ReadingStudioConfig, ActivityType } from '../../types';
import { generateInteractiveStory } from '../../services/generators/readingStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { worksheetService } from '../../services/worksheetService';
import { ImageDisplay, QUESTION_TYPES, StoryHighlighter } from '../sheets/common';
import { EditableText } from '../Editable';
import { ShareModal } from '../ShareModal';

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
    { id: 'story_block', label: 'Hikaye Metni', defaultTitle: 'OKUMA METNİ', icon: 'fa-book-open', description: 'Ana metin ve görsel alanı.', defaultStyle: { h: 400, imageSettings: { enabled: true, position: 'right', widthPercent: 40, opacity: 1, objectFit: 'cover', borderRadius: 8, blendMode: 'normal' } } },
    { id: 'vocabulary', label: 'Sözlükçe', defaultTitle: 'SÖZLÜKÇE', icon: 'fa-spell-check', description: 'Zor kelimeler ve anlamları.', defaultStyle: { h: 150 } },
    { id: 'questions_5n1k', label: '5N 1K Analizi', defaultTitle: '5N 1K SORULARI', icon: 'fa-circle-question', description: 'Kim, Ne, Nerede soruları.', defaultStyle: { w: 754, h: 300 } },
    { id: 'questions_test', label: 'Test Soruları', defaultTitle: 'DEĞERLENDİRME', icon: 'fa-list-check', description: 'Çoktan seçmeli sorular.', defaultStyle: { w: 754, h: 300 } },
    { id: 'questions_inference', label: 'Derin Analiz', defaultTitle: 'DERİN ANALİZ', icon: 'fa-brain', description: 'Çıkarım ve yorum soruları.', defaultStyle: { h: 150 } },
    { id: 'creative', label: 'Yaratıcı Alan', defaultTitle: 'YARATICI ALAN', icon: 'fa-paintbrush', description: 'Çizim ve yazma alanı.', defaultStyle: { h: 200 } },
    { id: 'notes', label: 'Not Alanı', defaultTitle: 'NOTLAR', icon: 'fa-note-sticky', description: 'Boş not satırları.', defaultStyle: { h: 100 } },
];

const AutoContentWrapper = ({ 
    children, 
    onSizeChange,
    isActive 
}: { 
    children?: React.ReactNode, 
    onSizeChange: (w: number, h: number) => void,
    isActive: boolean
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const lastReportedHeight = useRef<number>(0);

    useLayoutEffect(() => {
        if (!ref.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const contentHeight = entry.target.scrollHeight;
                const width = entry.contentRect.width;
                
                if (Math.abs(contentHeight - lastReportedHeight.current) > 5) {
                     const finalHeight = contentHeight + 10;
                     lastReportedHeight.current = finalHeight;
                     onSizeChange(width, finalHeight);
                }
            }
        });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [onSizeChange]);

    return (
        <div 
            ref={ref} 
            style={{ 
                height: 'auto', 
                minHeight: '100%', 
                overflow: 'visible', 
                width: '100%'
            }}
        >
            {children}
        </div>
    );
};

const ResizeHandle = ({ cursor, position, onMouseDown }: { cursor: string, position: string, onMouseDown: (e: React.MouseEvent) => void }) => (
    <div 
        className={`absolute w-3 h-3 bg-amber-500 border border-white rounded-full z-50 hover:scale-150 transition-transform ${position}`}
        style={{ cursor }}
        onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
    />
);

const RotateHandle = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
    <div 
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-zinc-800 border border-amber-500 rounded-full z-50 hover:bg-amber-500 hover:text-black text-amber-500 flex items-center justify-center cursor-alias shadow-sm transition-all"
        onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
        title="Döndür"
    >
        <i className="fa-solid fa-rotate text-[10px]"></i>
    </div>
);

const CounterControl = ({ label, value, onChange, min = 0, max = 10 }: { label: string, value: number, onChange: (val: number) => void, min?: number, max?: number }) => (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800 last:border-0">
        <span className="text-[11px] font-bold text-zinc-400 uppercase">{label}</span>
        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button 
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-amber-500 transition-colors disabled:opacity-30"
                disabled={value <= min}
            >
                <i className="fa-solid fa-minus text-[8px]"></i>
            </button>
            <span className="w-6 text-center text-xs font-mono font-bold text-zinc-300">{value}</span>
            <button 
                onClick={() => onChange(Math.min(max, value + 1))}
                className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-amber-500 transition-colors disabled:opacity-30"
                disabled={value >= max}
            >
                <i className="fa-solid fa-plus text-[8px]"></i>
            </button>
        </div>
    </div>
);

const ToggleControl = ({ label, checked, onChange, icon }: { label: string, checked: boolean, onChange: (val: boolean) => void, icon?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer group" onClick={() => onChange(!checked)}>
        <div className="flex items-center gap-2">
            {icon && <i className={`fa-solid ${icon} text-zinc-600 group-hover:text-amber-500 transition-colors text-[10px]`}></i>}
            <span className="text-[11px] font-bold text-zinc-400 group-hover:text-zinc-200 uppercase transition-colors">{label}</span>
        </div>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${checked ? 'bg-amber-500' : 'bg-zinc-700'}`}>
            <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${checked ? 'left-5' : 'left-1'}`}></div>
        </div>
    </div>
);

const TypographyControls = ({ style, onUpdate }: { style: any, onUpdate: (k: string, v: any) => void }) => (
    <div className="space-y-4">
        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Font Ailesi</label>
                <select value={style.fontFamily} onChange={e => onUpdate('fontFamily', e.target.value)} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                    <option value="OpenDyslexic">OpenDyslexic</option>
                    <option value="Lexend">Lexend</option>
                    <option value="Comic Neue">Comic Neue</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                </select>
            </div>
             <div className="w-20">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Punto</label>
                <input type="number" value={style.fontSize} onChange={e => onUpdate('fontSize', Number(e.target.value))} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-amber-500" />
            </div>
        </div>
        <div className="flex gap-2">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Satır Aralığı</label>
                <input type="range" min="1" max="2.5" step="0.1" value={style.lineHeight} onChange={e => onUpdate('lineHeight', Number(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
             <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Harf Aralığı</label>
                <input type="range" min="0" max="10" step="0.5" value={style.letterSpacing} onChange={e => onUpdate('letterSpacing', Number(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
            </div>
        </div>
         <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Hizalama</label>
            <div className="flex bg-zinc-800 rounded border border-zinc-700 p-0.5">
                {['left', 'center', 'right', 'justify'].map(align => (
                    <button key={align} onClick={() => onUpdate('textAlign', align)} className={`flex-1 py-1 rounded text-xs transition-colors ${style.textAlign === align ? 'bg-zinc-600 text-amber-500 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <i className={`fa-solid fa-align-${align}`}></i>
                    </button>
                ))}
            </div>
        </div>
        <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Metin Rengi</label>
            <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded border border-zinc-700">
                <input type="color" value={style.color} onChange={e => onUpdate('color', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent" />
                <span className="text-xs font-mono text-zinc-400">{style.color}</span>
            </div>
        </div>
    </div>
);

const AppearanceControls = ({ style, onUpdate }: { style: any, onUpdate: (k: string, v: any) => void }) => (
    <div className="space-y-4">
        <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Arka Plan</label>
             <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded border border-zinc-700">
                <input type="color" value={style.backgroundColor === 'transparent' ? '#ffffff' : style.backgroundColor} onChange={e => onUpdate('backgroundColor', e.target.value)} className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent" />
                <button onClick={() => onUpdate('backgroundColor', 'transparent')} className={`text-xs px-2 py-1 rounded border transition-colors ml-auto ${style.backgroundColor === 'transparent' ? 'bg-amber-500/20 border-amber-500 text-amber-500 font-bold' : 'bg-zinc-700 border-zinc-600 text-zinc-400'}`}>Şeffaf</button>
            </div>
        </div>
        <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Kenarlık</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
                 <select value={style.borderStyle} onChange={e => onUpdate('borderStyle', e.target.value)} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-amber-500">
                     <option value="solid">Düz Çizgi</option>
                     <option value="dashed">Kesik Çizgi</option>
                     <option value="dotted">Noktalı</option>
                     <option value="double">Çift Çizgi</option>
                 </select>
                 <input type="number" min="0" value={style.borderWidth} onChange={e => onUpdate('borderWidth', Number(e.target.value))} className="p-2 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-amber-500" placeholder="Kalınlık" />
            </div>
             <input type="color" value={style.borderColor === 'transparent' ? '#000000' : style.borderColor} onChange={e => onUpdate('borderColor', e.target.value)} className="w-full h-8 p-0 border-0 rounded cursor-pointer bg-zinc-800" />
        </div>
        <div>
             <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Köşe & Gölge</label>
             <div className="flex gap-2 mb-2">
                 <div className="flex-1">
                     <span className="text-[9px] text-zinc-500">Radius</span>
                     <input type="range" min="0" max="50" value={style.borderRadius} onChange={e => onUpdate('borderRadius', Number(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg accent-amber-500" />
                 </div>
                 <div className="flex-1">
                     <span className="text-[9px] text-zinc-500">Padding</span>
                     <input type="range" min="0" max="50" value={style.padding} onChange={e => onUpdate('padding', Number(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg accent-amber-500" />
                 </div>
             </div>
             <div className="flex bg-zinc-800 rounded border border-zinc-700 p-0.5">
                {['none', 'sm', 'md', 'lg'].map(sh => (
                    <button key={sh} onClick={() => onUpdate('boxShadow', sh)} className={`flex-1 py-1 rounded text-[10px] uppercase font-bold transition-colors ${style.boxShadow === sh ? 'bg-zinc-600 text-amber-500 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {sh}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const ContentControls = ({ item, onUpdateSpecific }: { item: ActiveComponent, onUpdateSpecific: (data: any) => void }) => {
    if (item.id === 'header') {
        const data = item.specificData || { title: item.customTitle || "HİKAYE BAŞLIĞI", subtitle: "Tarih: ....................", showDate: true };
        return (
            <div className="space-y-3">
                <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Başlık Metni</label>
                    <input type="text" value={data.title} onChange={e => onUpdateSpecific({...data, title: e.target.value})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm font-bold text-zinc-100 focus:border-amber-500 outline-none" />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Alt Bilgi / Tarih</label>
                    <input type="text" value={data.subtitle} onChange={e => onUpdateSpecific({...data, subtitle: e.target.value})} className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100 focus:border-amber-500 outline-none" />
                </div>
            </div>
        );
    }

    if (item.id === 'story_block') {
         const data = item.specificData || { text: "Hikaye metni bekleniyor...", imagePrompt: "" };
         return (
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Metin İçeriği (Manuel Düzenleme)</label>
                <textarea 
                    value={data.text} 
                    onChange={e => onUpdateSpecific({...data, text: e.target.value})} 
                    className="w-full h-64 p-2 bg-zinc-800 border border-zinc-700 rounded text-sm leading-relaxed resize-none font-dyslexic text-zinc-200 focus:border-amber-500 outline-none"
                ></textarea>
                <div className="bg-amber-500/10 p-2 rounded border border-amber-500/30 text-xs text-amber-500">
                    <span className="font-bold">Not:</span> Görsel ayarı "Stil" sekmesinden yapılabilir.
                </div>
            </div>
         );
    }
    
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
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Sorular</label>
                    <button onClick={addQ} className="text-xs bg-amber-500 text-black px-2 py-1 rounded hover:bg-amber-400 transition-colors font-bold">+ Ekle</button>
                 </div>
                 <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                     {qs.map((q: any, i: number) => (
                         <div key={i} className="flex gap-2 items-start">
                             <span className="text-xs font-bold w-4 pt-2 text-zinc-500">{i+1}.</span>
                             <textarea rows={2} value={q.text} onChange={e => updateQ(i, e.target.value)} className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded text-xs resize-none text-zinc-200 focus:border-amber-500 outline-none" />
                             <button onClick={() => removeQ(i)} className="text-zinc-500 hover:text-red-500 px-1 pt-2 transition-colors"><i className="fa-solid fa-trash"></i></button>
                         </div>
                     ))}
                 </div>
            </div>
        );
    }
    
    if (item.id === 'creative') {
        const data = item.specificData || { task: "Hikaye ile ilgili bir resim çiz." };
        return (
             <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Yaratıcı Görev Yönergesi</label>
                <textarea 
                    value={data.task} 
                    onChange={e => onUpdateSpecific({...data, task: e.target.value})} 
                    className="w-full h-32 p-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 focus:border-amber-500 outline-none resize-none"
                ></textarea>
            </div>
        );
    }

    return <div className="text-zinc-500 text-xs italic p-2 bg-zinc-800 rounded border border-zinc-700">Bu bileşen için özel içerik ayarı yok. Stil sekmesini kullanın.</div>;
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
        <div className="w-80 h-full bg-[#222226] border-l border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300 font-['OpenDyslexic']" onClick={handlePanelClick}>
            <div className="p-4 bg-[#2d2d32] border-b border-zinc-700 flex justify-between items-center shrink-0">
                <h3 className="font-black text-xs uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon} text-amber-500`}></i> {item.label}
                </h3>
                <button onClick={onClose} className="w-6 h-6 rounded-full hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-times"></i></button>
            </div>

            <div className="flex border-b border-zinc-700 bg-[#222226] shrink-0">
                {[
                    { id: 'content', icon: 'fa-pen-to-square', label: 'İçerik' },
                    { id: 'type', icon: 'fa-font', label: 'Yazı' },
                    { id: 'look', icon: 'fa-palette', label: 'Stil' },
                    { id: 'layout', icon: 'fa-ruler-combined', label: 'Düzen' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-3 text-[9px] font-bold uppercase flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-amber-500 bg-zinc-800 border-b-2 border-amber-500' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                        <i className={`fa-solid ${tab.icon} text-sm`}></i> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#222226]">
                {activeTab === 'content' && <ContentControls item={item} onUpdateSpecific={updateSpecificData} />}
                {activeTab === 'type' && <TypographyControls style={item.style} onUpdate={updateStyle} />}
                {activeTab === 'look' && <AppearanceControls style={item.style} onUpdate={updateStyle} />}
                
                {activeTab === 'layout' && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-3">
                                {['x', 'y', 'w', 'h', 'rotation'].map((key) => (
                                    <div key={key} className="flex items-center bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 focus-within:ring-1 ring-amber-500">
                                        <span className="text-[10px] font-black text-zinc-500 w-6 uppercase truncate mr-1">{key === 'rotation' ? 'Rot' : key}</span>
                                        <input type="number" value={Math.round(item.style[key as keyof typeof item.style] as number || 0)} onChange={e => updateStyle(key as any, Number(e.target.value))} className="w-full bg-transparent text-xs font-mono outline-none text-right text-zinc-200" />
                                    </div>
                                ))}
                        </div>
                         <div className="flex gap-2">
                                <button onClick={() => updateStyle('zIndex', (item.style.zIndex || 0) + 1)} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors border border-zinc-700"><i className="fa-solid fa-arrow-up"></i> Öne</button>
                                <button onClick={() => updateStyle('zIndex', Math.max(0, (item.style.zIndex || 0) - 1))} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold text-zinc-300 transition-colors border border-zinc-700"><i className="fa-solid fa-arrow-down"></i> Arkaya</button>
                        </div>
                    </div>
                )}
            </div>

            {item.style.imageSettings && (
                 <div className="p-4 border-t border-zinc-700 bg-[#2d2d32] flex justify-between items-center">
                     <span className="text-xs font-bold text-zinc-300">Görsel</span>
                     <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${item.style.imageSettings?.enabled ? 'bg-amber-500' : 'bg-zinc-600'}`} onClick={() => updateImageSettings('enabled', !item.style.imageSettings?.enabled)}>
                        <div className={`w-2 h-2 bg-white rounded-full absolute top-1 transition-all ${item.style.imageSettings?.enabled ? 'left-5' : 'left-1'}`}></div>
                    </div>
                 </div>
            )}

            <div className="p-4 border-t border-zinc-700 bg-[#222226] shrink-0">
                <button onClick={onDelete} className="w-full py-2 bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                    <i className="fa-solid fa-trash"></i> Bileşeni Sil
                </button>
            </div>
        </div>
    );
}

// --- MAIN CANVAS COMPONENT ---

interface ReadingStudioProps {
    onBack: () => void;
    onAddToWorkbook?: (data: any) => void;
}

export const ReadingStudio: React.FC<ReadingStudioProps> = ({ onBack, onAddToWorkbook }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    
    const [storyData, setStoryData] = useState<InteractiveStoryData | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'settings' | 'library' | 'templates'>('settings');
    const [layout, setLayout] = useState<ActiveComponent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [designMode, setDesignMode] = useState(true);
    
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

    const [openSections, setOpenSections] = useState({ layers: true, add: false });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [canvasScale, setCanvasScale] = useState(0.85);
    const [canvasPos, setCanvasPos] = useState({ x: 0, y: 40 }); 
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    const [dragState, setDragState] = useState<{ mode: 'drag' | 'resize' | 'rotate'; resizeHandle?: string; startX: number; startY: number; initialX: number; initialY: number; initialW: number; initialH: number; initialR: number; centerX?: number; centerY?: number; } | null>(null);

    const contentHeight = useMemo(() => {
        if (layout.length === 0) return A4_HEIGHT_PX;
        const maxY = Math.max(...layout.map(item => item.style.y + item.style.h));
        return Math.max(A4_HEIGHT_PX, maxY + PAGE_BOTTOM_PADDING);
    }, [layout]);

    useEffect(() => {
        const saved = localStorage.getItem('rs_templates');
        if(saved) {
            try { setTemplates(JSON.parse(saved)); } catch(e) {}
        }
    }, []);

    const handleAutoResize = useCallback((instanceId: string, newContentHeight: number) => {
        setLayout(prevLayout => {
            const itemIndex = prevLayout.findIndex(item => item.instanceId === instanceId);
            if (itemIndex === -1) return prevLayout;

            const item = prevLayout[itemIndex];
            const oldHeight = item.style.h;
            const roundedNewHeight = Math.ceil(newContentHeight / SNAP_GRID) * SNAP_GRID;

            if (Math.abs(oldHeight - roundedNewHeight) < SNAP_GRID) return prevLayout;

            const deltaY = roundedNewHeight - oldHeight;
            const itemBottomY = item.style.y + oldHeight;

            const newLayout = [...prevLayout];
            newLayout[itemIndex] = {
                ...item,
                style: { ...item.style, h: roundedNewHeight }
            };

            for (let i = 0; i < newLayout.length; i++) {
                if (i === itemIndex) continue;
                if (newLayout[i].style.y > (itemBottomY - 10)) {
                    newLayout[i] = {
                        ...newLayout[i],
                        style: {
                            ...newLayout[i].style,
                            y: newLayout[i].style.y + deltaY
                        }
                    };
                }
            }

            return newLayout;
        });
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            const viewportW = canvasRef.current.clientWidth;
            const pageWidth = A4_WIDTH_PX;
            const initialScale = Math.min(0.85, (viewportW - 100) / pageWidth); 
            const centeredX = (viewportW - (pageWidth * initialScale)) / 2;
            setCanvasScale(initialScale);
            setCanvasPos({ x: centeredX, y: 40 }); 
        }
        setLayout([]);
    }, []);
    
    useEffect(() => {
        if (!storyData) return;

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
            
            let specificData = null;
            if (def.id === 'header') {
                specificData = { title: storyData.title || "HİKAYE", subtitle: `Tarih: .................... | ${storyData.genre}` };
            } else if (def.id === 'story_block') {
                specificData = { text: storyData.story, imagePrompt: storyData.imagePrompt };
            } else if (def.id === 'questions_5n1k') {
                specificData = { questions: (storyData.fiveW1H || []).map(q => ({ text: q.question })) };
            } else if (def.id === 'questions_test') {
                specificData = { questions: (storyData.multipleChoice || []).map(q => ({ text: q.question, options: q.options })) };
            } else if (def.id === 'questions_inference') {
                const questions = [...(storyData.inferenceQuestions || []), ...(storyData.logicQuestions || [])].slice(0, 3);
                specificData = { questions: questions.map(q => ({ text: q.question })) };
            } else if (def.id === 'vocabulary') {
                 specificData = { questions: (storyData.vocabulary || []).map(v => ({ text: `${v.word}: ${v.definition}` })) };
            } else if (def.id === 'creative') {
                 specificData = { task: storyData.creativeTask || "Hikaye ile ilgili bir resim çiz." };
            }

            generatedLayout.push({
                ...def,
                instanceId: `${def.id}-auto-${index}-${Date.now()}`,
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
                specificData: specificData 
            });
        });

        setLayout(generatedLayout);
        setIsSaved(false);
    }, [storyData]);

    const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey) e.preventDefault();
        const zoomSensitivity = -0.001; 
        const delta = e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(0.2, canvasScale + delta), 4);
        
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const canvasX = (mouseX - canvasPos.x) / canvasScale;
            const newX = mouseX - canvasX * newScale;
            setCanvasScale(newScale);
            setCanvasPos(prev => ({ x: newX, y: prev.y }));
        }
    }, [canvasScale, canvasPos]);

    const handleBgMouseDown = (e: React.MouseEvent) => {
        if (!designMode) return;
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

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
            if (isPanning) {
                const dx = e.clientX - lastMousePos.current.x;
                setCanvasPos(prev => ({ x: prev.x + dx, y: prev.y }));
                lastMousePos.current = { x: e.clientX, y: e.clientY };
                return;
            }
            if (!dragState || !selectedId) return;
            const dx = (e.clientX - dragState.startX) / canvasScale;
            const dy = (e.clientY - dragState.startY) / canvasScale;
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
        const handleMouseUp = () => { setDragState(null); setIsPanning(false); };
        if (dragState || isPanning) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [dragState, selectedId, isPanning, canvasScale]);

    const addComponent = (def: ComponentDefinition) => {
        const newId = `${def.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        
        let nextY = 20; 
        const gap = 15; 

        if (layout.length > 0) {
            const maxY = Math.max(...layout.map(item => item.style.y + item.style.h));
            nextY = maxY + gap;
        }

        const newItem: ActiveComponent = { 
            ...def, 
            instanceId: newId, 
            style: { 
                ...DEFAULT_STYLE_BASE, 
                ...def.defaultStyle, 
                x: 20, 
                y: nextY 
            }, 
            isVisible: true, 
            customTitle: def.defaultTitle, 
            themeColor: 'black', 
            specificData: null 
        };
        setLayout(prev => [...prev, newItem]);
        setSelectedId(newId);
        setIsSaved(false);
    };

    const updateItem = (updates: Partial<ActiveComponent>) => { 
        if (!selectedId) return; 
        setLayout(prev => prev.map(item => item.instanceId === selectedId ? { ...item, ...updates } : item)); 
        setIsSaved(false);
    };

    const deleteItem = () => { 
        if (!selectedId) return; 
        removeComponent(selectedId);
    };
    
    const removeComponent = (id: string) => {
        if(confirm("Bu bileşeni silmek istediğinize emin misiniz?")) {
            const itemToRemove = layout.find(item => item.instanceId === id);
            if (!itemToRemove) return;
            const gap = 15; 
            const removedHeight = itemToRemove.style.h + gap;
            const removedY = itemToRemove.style.y;

            setLayout(prev => {
                const filtered = prev.filter(item => item.instanceId !== id);
                return filtered.map(item => {
                    if (item.style.y > removedY) {
                        return { ...item, style: { ...item.style, y: item.style.y - removedHeight } };
                    }
                    return item;
                });
            });

            if(selectedId === id) setSelectedId(null);
            setIsSaved(false);
        }
    };

    const saveTemplate = () => {
        if(!templateName.trim()) return alert("Lütfen şablon adı giriniz.");
        const newTemplate: SavedTemplate = {
            id: crypto.randomUUID(),
            name: templateName,
            createdAt: new Date().toISOString(),
            layout: layout 
        };
        const updated = [...templates, newTemplate];
        setTemplates(updated);
        localStorage.setItem('rs_templates', JSON.stringify(updated));
        setTemplateName("");
        alert("Şablon kaydedildi.");
    };

    const loadTemplate = (t: SavedTemplate) => {
        if(confirm("Mevcut düzen silinecek ve şablon yüklenecek. Onaylıyor musunuz?")) {
            const newLayout = t.layout.map((item) => ({
                ...item,
                instanceId: item.id + '-' + Date.now() + Math.random().toString(36).substr(2, 5)
            }));
            setLayout(newLayout);
            setIsSaved(false);
        }
    };

    const deleteTemplate = (id: string) => {
         if(confirm("Şablonu silmek istediğinize emin misiniz?")) {
            const updated = templates.filter(t => t.id !== id);
            setTemplates(updated);
            localStorage.setItem('rs_templates', JSON.stringify(updated));
         }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const data = await generateInteractiveStory(config);
            setStoryData(data);
        } catch (e) { alert("Üretim sırasında hata oluştu."); } finally { setIsLoading(false); }
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

    const handleSaveToArchive = async () => {
        if (!user) { alert("Kaydetmek için lütfen giriş yapın."); return; }
        if (!storyData && layout.length === 0) { alert("Kaydedilecek bir içerik yok."); return; }
        
        setIsSaving(true);
        try {
            const title = storyData?.title || (layout.find(l => l.id === 'header')?.specificData as any)?.title || 'Yeni Hikaye';
            await worksheetService.saveWorksheet(
                user.id, title, 'STORY_COMPREHENSION', [{ storyData, layout }], 'fa-solid fa-book-open-reader', { id: 'reading-verbal', title: 'Okuma & Dil' }
            );
            setIsSaved(true);
            alert("Etkinlik başarıyla arşivlendi.");
        } catch (e) {
            alert("Kaydetme sırasında bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToWorkbook = () => {
        if (!storyData && layout.length === 0) {
            alert("Eklenecek bir içerik bulunamadı.");
            return;
        }
        if (onAddToWorkbook) {
            onAddToWorkbook({ storyData, layout });
            const btn = document.getElementById('rs-workbook-btn');
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Eklendi';
                btn.classList.add('bg-green-600');
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.classList.remove('bg-green-600');
                }, 2000);
            }
        }
    };

    const handleShare = async (receiverId: string) => {
        if (!user) return;
        try {
            const title = storyData?.title || 'Paylaşılan Hikaye';
            const mockSavedWorksheet: any = {
                name: title,
                activityType: 'STORY_COMPREHENSION',
                worksheetData: [{ storyData, layout }],
                icon: 'fa-solid fa-share-nodes',
                category: { id: 'reading-verbal', title: 'Okuma & Dil' }
            };
            await worksheetService.shareWorksheet(mockSavedWorksheet, user.id, user.name, receiverId);
            setIsShareModalOpen(false);
            alert("Hikaye başarıyla paylaşıldı.");
        } catch (e) {
            alert("Paylaşım hatası.");
        }
    };

    const toggleSection = (section: 'layers' | 'add') => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

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
        
        if (item.id === 'tracker') {
             return (
                 <div className="h-full flex flex-col items-center justify-center" style={boxStyle}>
                     <div className="flex gap-4">
                         {[1, 2, 3].map(i => (
                             <div key={i} className="flex flex-col items-center">
                                 <div className="w-10 h-10 rounded-full border-2 border-current bg-transparent flex items-center justify-center">
                                     <i className="fa-regular fa-star text-sm opacity-50"></i>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             );
        }

        if (item.id === 'story_block') {
            const data = item.specificData || { text: "Hikaye metni bekleniyor...", imagePrompt: "" };
            return (
                <AutoContentWrapper isActive={designMode} onSizeChange={(w, h) => handleAutoResize(item.instanceId, h)}>
                    <div className="relative overflow-hidden" style={{ ...boxStyle, height: 'auto', minHeight: '100%' }}>
                         {item.style.imageSettings?.enabled && (
                            <div className={`float-${item.style.imageSettings.position === 'left' ? 'left' : 'right'} w-1/3 h-48 bg-transparent ml-4 mb-2 rounded-lg relative z-10`}>
                                <ImageDisplay 
                                    prompt={data.imagePrompt} 
                                    description="Hikaye Görseli" 
                                    className="w-full h-full object-contain" 
                                />
                            </div>
                         )}
                         <div dangerouslySetInnerHTML={{__html: (data.text || '').replace(/\n/g, '<br/>')}}></div>
                    </div>
                </AutoContentWrapper>
            );
        }

        if (item.id === 'vocabulary') {
             const data = item.specificData || { questions: [{text: "Örnek: Açıklama"}] };
             return (
                 <AutoContentWrapper isActive={designMode} onSizeChange={(w, h) => handleAutoResize(item.instanceId, h)}>
                 <div className="flex flex-col" style={{ ...boxStyle, height: 'auto', minHeight: '100%' }}>
                     <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50 flex items-center gap-2">
                        <i className="fa-solid fa-spell-check"></i> {item.customTitle}
                     </h4>
                     <div className="flex-1 grid grid-cols-2 gap-4 content-start overflow-hidden">
                         {(data.questions || []).map((q: any, i: number) => {
                             const parts = q.text.split(':');
                             return (
                                 <div key={i} className="bg-white/50 p-2 rounded border border-current/20">
                                     <span className="font-bold block text-sm">{parts[0]}</span>
                                     <span className="text-[10px] opacity-80 leading-tight block">{parts[1] || ''}</span>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
                 </AutoContentWrapper>
             );
        }

        if (item.id === 'creative') {
             const data = item.specificData || { task: "Hikaye ile ilgili bir resim çiz." };
             return (
                 <div className="h-full flex flex-col" style={boxStyle}>
                     <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50 flex items-center gap-2">
                        <i className="fa-solid fa-paintbrush"></i> {item.customTitle}
                     </h4>
                     <p className="text-sm font-bold mb-2">{data.task}</p>
                     <div className="flex-1 border-2 border-dashed border-current/30 rounded-xl bg-white/20 relative">
                         <span className="absolute bottom-2 right-2 text-[10px] opacity-50 font-bold uppercase">Çizim Alanı</span>
                     </div>
                 </div>
             );
        }
        
        if (item.id === 'notes') {
             return (
                 <div className="h-full flex flex-col" style={boxStyle}>
                     <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                     <div className="flex-1" style={{backgroundImage: 'linear-gradient(transparent 95%, currentColor 95%)', backgroundSize: '100% 1.5rem', opacity: 0.3}}></div>
                 </div>
             );
        }

        if (item.id.startsWith('questions')) {
            const data = item.specificData || { questions: [{text: "Madde 1..."}] };
            return (
                <AutoContentWrapper isActive={designMode} onSizeChange={(w, h) => handleAutoResize(item.instanceId, h)}>
                <div className="flex flex-col" style={{ ...boxStyle, height: 'auto', minHeight: '100%' }}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                    <div className="flex-1 space-y-2 overflow-hidden">
                        {(data.questions || []).map((q: any, i: number) => (
                            <div key={i} className="flex gap-2 items-start">
                                <span className="font-bold bg-current text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{color: s.backgroundColor === 'transparent' ? 'white' : s.backgroundColor, backgroundColor: s.color}}>{i+1}</span>
                                <p className="leading-snug pt-0.5">{q.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
                </AutoContentWrapper>
            );
        }
        
        return (
             <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-300 rounded" style={boxStyle}>
                 <span className="opacity-50 font-bold">{item.label}</span>
             </div>
        );
    };

    const toggleVisibility = (id: string) => {
        setLayout(prev => prev.map(item => item.instanceId === id ? { ...item, isVisible: !item.isVisible } : item));
        setIsSaved(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#222226] font-['OpenDyslexic'] overflow-hidden text-zinc-100">
            <div className="h-14 bg-[#2d2d32] border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-400"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-amber-500">Reading Studio <span className="bg-amber-500/20 text-amber-500 px-1 rounded text-[9px] border border-amber-500/50">PRO</span></span>
                </div>
                
                <div className="flex items-center gap-2">
                     <button onClick={() => setDesignMode(!designMode)} className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${designMode ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
                         {designMode ? 'MİMARİ MOD' : 'ÖNİZLEME'}
                     </button>
                     <div className="h-8 w-px bg-zinc-800 mx-2"></div>
                     
                     <button onClick={() => handlePrint('download')} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-400" title="PDF Olarak İndir"><i className="fa-solid fa-file-pdf"></i></button>
                     <button onClick={() => handlePrint('print')} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-400" title="Yazdır"><i className="fa-solid fa-print"></i></button>
                     <button onClick={() => setIsShareModalOpen(true)} className="w-8 h-8 rounded hover:bg-zinc-700 flex items-center justify-center text-zinc-400" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                     
                     <button 
                        id="rs-workbook-btn"
                        onClick={handleAddToWorkbook}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border border-emerald-500"
                        title="Çalışma Kitapçığına Ekle"
                     >
                         <i className="fa-solid fa-plus-circle"></i>
                         Kitapçığa Ekle
                     </button>

                     <button 
                        onClick={handleSaveToArchive} 
                        disabled={isSaving || isSaved}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isSaved ? 'bg-indigo-600 text-white' : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/50'}`}
                     >
                         {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (isSaved ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-save"></i>)}
                         {isSaved ? 'Arşivlendi' : 'Arşive Kaydet'}
                     </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                <div className={`flex-shrink-0 h-full bg-[#18181b] border-r border-zinc-800 transition-all duration-300 ease-in-out overflow-hidden z-40 ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-r-0'}`}>
                    <div className="w-80 flex flex-col h-full"> 
                         <div className="flex border-b border-zinc-800 bg-[#222226]">
                             <button onClick={() => setSidebarTab('settings')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${sidebarTab === 'settings' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}>Ayarlar</button>
                             <button onClick={() => setSidebarTab('library')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${sidebarTab === 'library' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}>Bileşenler</button>
                             <button onClick={() => setSidebarTab('templates')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${sidebarTab === 'templates' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-500 hover:text-zinc-300'}`}>Şablonlar</button>
                         </div>
                         <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                             {sidebarTab === 'library' && (
                                 <div className="flex flex-col">
                                     <div className="border-b border-zinc-800">
                                         <button onClick={() => toggleSection('layers')} className="w-full flex items-center justify-between p-4 bg-[#18181b] hover:bg-zinc-800 transition-colors">
                                             <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-layer-group"></i> KATMANLAR <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">{layout.length}</span></h4>
                                             <i className={`fa-solid fa-chevron-down text-xs text-zinc-500 transition-transform ${openSections.layers ? 'rotate-180' : ''}`}></i>
                                         </button>
                                         {openSections.layers && (
                                             <div className="p-2 space-y-1 bg-[#222226] animate-in slide-in-from-top-2 duration-200">
                                                 {layout.map((item) => (
                                                     <div key={item.instanceId} onClick={() => setSelectedId(item.instanceId)} className={`group flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${selectedId === item.instanceId ? 'border-amber-500/50 bg-amber-500/10 shadow-sm ring-1 ring-amber-500/30' : 'border-transparent hover:bg-zinc-800 border-zinc-800'} ${!item.isVisible ? 'opacity-60' : ''}`}>
                                                         <div className={`w-7 h-7 rounded flex items-center justify-center text-xs ${selectedId === item.instanceId ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}><i className={`fa-solid ${item.icon}`}></i></div>
                                                         <div className="flex-1 min-w-0"><p className={`text-xs font-bold truncate ${selectedId === item.instanceId ? 'text-amber-500' : 'text-zinc-300'}`}>{item.customTitle || item.label}</p></div>
                                                         <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                             <button onClick={(e) => { e.stopPropagation(); toggleVisibility(item.instanceId); }} className={`w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-700 text-zinc-400 ${!item.isVisible ? 'text-zinc-600' : ''}`}><i className={`fa-solid ${item.isVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i></button>
                                                             <button onClick={(e) => { e.stopPropagation(); removeComponent(item.instanceId); }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash"></i></button>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                     <div>
                                         <button onClick={() => toggleSection('add')} className="w-full flex items-center justify-between p-4 bg-[#18181b] hover:bg-zinc-800 transition-colors border-b border-zinc-800">
                                             <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-plus-circle"></i> YENİ EKLE</h4>
                                             <i className={`fa-solid fa-chevron-down text-xs text-zinc-500 transition-transform ${openSections.add ? 'rotate-180' : ''}`}></i>
                                         </button>
                                         {openSections.add && (
                                             <div className="p-4 bg-[#222226] animate-in slide-in-from-top-2 duration-200">
                                                 <div className="grid grid-cols-2 gap-2">
                                                     {COMPONENT_DEFINITIONS.map(def => (
                                                         <button key={def.id} onClick={() => addComponent(def)} className="flex flex-col items-center gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-xl hover:border-amber-500 hover:shadow-md transition-all group">
                                                             <i className={`fa-solid ${def.icon} text-zinc-500 group-hover:text-amber-500 text-lg transition-colors`}></i>
                                                             <span className="text-[10px] font-bold text-zinc-400 group-hover:text-amber-500 text-center leading-tight">{def.label}</span>
                                                         </button>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             )}
                             {sidebarTab === 'templates' && (
                                 <div className="p-4 space-y-6">
                                     <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-800">
                                         <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Şablon Kaydet</h4>
                                         <div className="flex gap-2">
                                             <input 
                                                 type="text" 
                                                 value={templateName} 
                                                 onChange={e => setTemplateName(e.target.value)} 
                                                 placeholder="Şablon Adı..." 
                                                 className="flex-1 p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white outline-none"
                                             />
                                             <button onClick={saveTemplate} className="px-3 bg-amber-500 text-black rounded font-bold text-xs hover:bg-amber-400"><i className="fa-solid fa-save"></i></button>
                                         </div>
                                     </div>
                                     <div>
                                         <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">Kayıtlı Şablonlar</h4>
                                         {templates.length === 0 ? (
                                             <div className="text-center text-zinc-600 text-xs py-4">Henüz şablon yok.</div>
                                         ) : (
                                             <div className="space-y-3">
                                                 {templates.map(t => (
                                                     <div key={t.id} className="group bg-zinc-800 border border-zinc-700 rounded-lg p-3 hover:border-amber-500/50 transition-colors cursor-pointer" onClick={() => loadTemplate(t)}>
                                                         <div className="flex justify-between items-start mb-2">
                                                             <h5 className="font-bold text-sm text-zinc-200">{t.name}</h5>
                                                             <button onClick={(e) => {e.stopPropagation(); deleteTemplate(t.id);}} className="text-zinc-500 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                                                         </div>
                                                         <div className="w-full h-24 bg-white rounded overflow-hidden relative pointer-events-none">
                                                             <div className="absolute inset-0" style={{transform: 'scale(0.15)', transformOrigin: '0 0', width: '600%', height: '600%'}}>
                                                                 {t.layout.map((item, idx) => (
                                                                     <div key={idx} style={{
                                                                         position: 'absolute',
                                                                         left: item.style.x,
                                                                         top: item.style.y,
                                                                         width: item.style.w,
                                                                         height: item.style.h,
                                                                         border: '2px solid #ccc',
                                                                         backgroundColor: item.style.backgroundColor || 'transparent'
                                                                     }}></div>
                                                                 ))}
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ))}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             )}
                             {sidebarTab === 'settings' && (
                                 <div className="p-4 space-y-6">
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-user-graduate"></i> Öğrenci Profili</h4>
                                        <div><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Ad Soyad</label><input type="text" value={config.studentName} onChange={e => setConfig({...config, studentName: e.target.value})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200" placeholder="Örn: Ali Yılmaz" /></div>
                                        <div className="flex gap-2"><div className="flex-1"><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Sınıf</label><select value={config.gradeLevel} onChange={e => setConfig({...config, gradeLevel: e.target.value})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200">{['1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}</select></div></div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-book"></i> Hikaye Kurgusu</h4>
                                        <div><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Konu</label><input type="text" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200" placeholder="Örn: Uzay Maceraları" /></div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Tür</label><select value={config.genre} onChange={e => setConfig({...config, genre: e.target.value})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200">{['Macera', 'Masal', 'Bilim Kurgu', 'Günlük Yaşam', 'Fabl'].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                                            <div><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Ton</label><select value={config.tone} onChange={e => setConfig({...config, tone: e.target.value})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200">{['Eğlenceli', 'Öğretici', 'Gizemli', 'Duygusal'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                             <div><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Uzunluk</label><select value={config.length} onChange={e => setConfig({...config, length: e.target.value as any})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200"><option value="short">Kısa</option><option value="medium">Orta</option><option value="long">Uzun</option></select></div>
                                            <div><label className="text-[9px] font-bold text-zinc-500 mb-1 block">Dil Seviyesi</label><select value={config.textComplexity} onChange={e => setConfig({...config, textComplexity: e.target.value as any})} className="w-full p-2 border border-zinc-700 rounded-lg text-xs bg-zinc-900 focus:ring-1 focus:ring-amber-500 outline-none text-zinc-200"><option value="simple">Basit</option><option value="moderate">Orta</option><option value="advanced">İleri</option></select></div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 shadow-inner">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <i className="fa-solid fa-list-check text-amber-500"></i> İçerik Bileşenleri
                                        </h4>
                                        <div className="space-y-1">
                                            <ToggleControl label="5N 1K Soruları" checked={config.include5N1K} onChange={v => setConfig({...config, include5N1K: v})} icon="fa-circle-question" />
                                            <ToggleControl label="Sözlükçe (Kelime Odaklı)" checked={config.focusVocabulary} onChange={v => setConfig({...config, focusVocabulary: v})} icon="fa-spell-check" />
                                            <ToggleControl label="Yaratıcı Görev" checked={config.includeCreativeTask} onChange={v => setConfig({...config, includeCreativeTask: v})} icon="fa-paintbrush" />
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1">
                                            <CounterControl label="Test Sorusu" value={config.countMultipleChoice} onChange={v => setConfig({...config, countMultipleChoice: v})} />
                                            <CounterControl label="Doğru / Yanlış" value={config.countTrueFalse} onChange={v => setConfig({...config, countTrueFalse: v})} />
                                            <CounterControl label="Boşluk Doldurma" value={config.countFillBlanks} onChange={v => setConfig({...config, countFillBlanks: v})} />
                                            <CounterControl label="Mantık Sorusu" value={config.countLogic} onChange={v => setConfig({...config, countLogic: v})} />
                                            <CounterControl label="Çıkarım Sorusu" value={config.countInference} onChange={v => setConfig({...config, countInference: v})} />
                                        </div>
                                    </div>
                                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}{isLoading ? 'Hikaye Yazılıyor...' : 'Hikayeyi Oluştur'}</button>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`absolute top-1/2 -translate-y-1/2 z-50 w-5 h-12 bg-[#2d2d32] border-y border-r border-zinc-700 rounded-r-lg flex items-center justify-center text-zinc-400 hover:text-black hover:bg-amber-500 transition-all shadow-md focus:outline-none duration-300 ease-in-out`}
                    style={{ left: isSidebarOpen ? '320px' : '0px' }}
                >
                    <i className={`fa-solid fa-chevron-${isSidebarOpen ? 'left' : 'right'} text-xs`}></i>
                </button>

                <div 
                    ref={canvasRef}
                    className="flex-1 bg-[#121214] overflow-hidden flex items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] cursor-grab active:cursor-grabbing"
                    onWheel={handleCanvasWheel}
                    onMouseDown={handleBgMouseDown}
                >
                    <div 
                        className="origin-top transition-transform duration-75 ease-out will-change-transform"
                        style={{ transform: `translate3d(${canvasPos.x}px, ${canvasPos.y}px, 0) scale(${canvasScale})` }}
                    >
                        <div id="canvas-root" className="bg-white shadow-2xl relative transition-all duration-300" style={{ width: `${A4_WIDTH_PX}px`, height: `${contentHeight}px`, transformOrigin: '0 0' }}>
                            {designMode && <div className="absolute inset-0 pointer-events-none z-0" style={{backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: `${SNAP_GRID * 4}px ${SNAP_GRID * 4}px`}}></div>}
                            {layout.filter(l => l.isVisible).map((item) => (
                                <div key={item.instanceId} onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'drag')} className={`absolute ${designMode ? 'hover:ring-1 hover:ring-amber-500 cursor-move' : ''}`} style={{ left: item.style.x, top: item.style.y, width: item.style.w, height: item.style.h, transform: `rotate(${item.style.rotation || 0}deg)`, zIndex: item.style.zIndex }}>
                                    {designMode && selectedId === item.instanceId && (
                                        <div className="absolute inset-0 border-2 border-amber-500 z-50 pointer-events-none">
                                            <div className="pointer-events-auto"><RotateHandle onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'rotate')} /></div>
                                            <div className="pointer-events-auto"><ResizeHandle cursor="se-resize" position="-bottom-1.5 -right-1.5" onMouseDown={(e) => handleMouseDown(e, item.instanceId, 'resize', 'se')} /></div>
                                        </div>
                                    )}
                                    <div className="w-full h-full overflow-hidden pointer-events-none text-black">{renderContent(item)}</div>
                                </div>
                            ))}
                            <div className="absolute bottom-4 left-0 w-full text-center text-[10px] text-zinc-400 font-mono pointer-events-none flex justify-between px-8"><span>Bursa Disleksi AI © {new Date().getFullYear()}</span><span>Sayfa 1</span></div>
                        </div>
                    </div>
                </div>

                {selectedId && (
                    <div className="shrink-0 z-50 h-full border-l border-zinc-800 shadow-xl relative">
                        <SettingsStation item={layout.find(l => l.instanceId === selectedId)!} onUpdate={updateItem} onClose={() => setSelectedId(null)} onDelete={deleteItem} />
                    </div>
                )}
            </div>
            
            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                onShare={handleShare} 
                worksheetTitle={storyData?.title || 'Hikaye'}
            />
        </div>
    );
};
