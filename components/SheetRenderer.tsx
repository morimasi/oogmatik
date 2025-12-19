
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import { PedagogicalHeader, ImageDisplay, GridComponent, ConnectionDot } from './sheets/common';
import { EditableElement, EditableText } from './Editable';
import { StoryComprehensionSheet } from './sheets/ReadingComprehensionSheets';
import { AlgorithmSheet } from './sheets/AlgorithmSheets';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

const StudioRenderer: React.FC<{ data: any }> = ({ data }) => {
    const layout = data.layout || [];
    const storyData = data.storyData || {};
    
    const renderComponent = (item: any) => {
        const s = item.style;
        const boxStyle = {
            padding: `${s.padding}px`,
            backgroundColor: s.backgroundColor,
            borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`,
            borderStyle: s.borderStyle || 'solid',
            borderRadius: `${s.borderRadius}px`,
            opacity: s.opacity,
            color: s.color,
            fontFamily: s.fontFamily,
            fontSize: `${s.fontSize}px`,
            lineHeight: s.lineHeight,
            textAlign: s.textAlign as any,
            letterSpacing: `${s.letterSpacing}px`,
            fontWeight: s.fontWeight || 'normal',
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none',
        };

        if (item.id === 'header') {
            const d = item.specificData || {};
            return (
                <div className="h-full flex flex-col justify-end" style={boxStyle}>
                    <h1 className="font-black uppercase leading-none tracking-tight" style={{fontSize: '2.5em', color: 'inherit'}}>{d.title || 'BAŞLIK'}</h1>
                    <div className="mt-2 opacity-70 font-mono text-sm">{d.subtitle}</div>
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
            const d = item.specificData || {};
            return (
                <div className="h-full relative overflow-hidden" style={boxStyle}>
                     {item.style.imageSettings?.enabled && (
                        <div className={`float-${item.style.imageSettings.position === 'left' ? 'left' : 'right'} w-1/3 h-48 bg-transparent ml-4 mb-2`}>
                            <ImageDisplay prompt={d.imagePrompt} className="w-full h-full object-contain" />
                        </div>
                     )}
                     <div dangerouslySetInnerHTML={{__html: (d.text || '').replace(/\n/g, '<br/>')}}></div>
                </div>
            );
        }

        if (item.id === 'vocabulary') {
             const d = item.specificData || { questions: [] };
             return (
                 <div className="h-full flex flex-col" style={boxStyle}>
                     <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50 flex items-center gap-2">
                        <i className="fa-solid fa-spell-check"></i> {item.customTitle}
                     </h4>
                     <div className="flex-1 grid grid-cols-2 gap-4 content-start overflow-hidden">
                         {(d.questions || []).map((q: any, i: number) => {
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
             );
        }

        if (item.id === 'creative') {
             const d = item.specificData || { task: "" };
             return (
                 <div className="h-full flex flex-col" style={boxStyle}>
                     <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50 flex items-center gap-2">
                        <i className="fa-solid fa-paintbrush"></i> {item.customTitle}
                     </h4>
                     <p className="text-sm font-bold mb-2">{d.task}</p>
                     <div className="flex-1 border-2 border-dashed border-current/30 rounded-xl bg-white/20 relative">
                         <span className="absolute bottom-2 right-2 text-[10px] opacity-50 font-bold uppercase">Çizim Alanı</span>
                     </div>
                 </div>
             );
        }

        if (item.id.startsWith('questions')) {
            const d = item.specificData || { questions: [] };
            return (
                <div className="h-full flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                    <div className="flex-1 space-y-2">
                        {(d.questions || []).map((q: any, i: number) => (
                            <div key={i} className="flex gap-2 items-start text-sm">
                                <span className="font-bold bg-current text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{backgroundColor: s.color, color: s.backgroundColor === 'transparent' ? 'white' : s.backgroundColor}}>{i+1}</span>
                                <p className="leading-snug">{q.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return <div className="h-full border border-dashed border-zinc-200" style={boxStyle}></div>;
    };

    return (
        <div className="relative w-full h-full bg-white overflow-hidden" style={{ minHeight: '1123px' }}>
            {layout.filter((l: any) => l.isVisible).map((item: any) => (
                <div 
                    key={item.instanceId} 
                    className="absolute"
                    style={{ 
                        left: item.style.x, 
                        top: item.style.y, 
                        width: item.style.w, 
                        height: item.style.h, 
                        transform: `rotate(${item.style.rotation || 0}deg)`,
                        zIndex: item.style.zIndex
                    }}
                >
                    {renderComponent(item)}
                </div>
            ))}
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    // Check if this is a custom studio layout (Complex object containing layout and storyData)
    if (data.layout && data.storyData) {
        return <StudioRenderer data={data} />;
    }

    if (activityType === 'STORY_COMPREHENSION') {
        return <StoryComprehensionSheet data={data} />;
    }

    if (activityType === 'ALGORITHM_GENERATOR') {
        return <AlgorithmSheet data={data} />;
    }

    // Generic fallback for other types
    return <div className="p-4">İçerik Görüntüleyici: {activityType}</div>;
});
